# TeaCoder API

Backend of TeaCoder, a Russian dev-education platform: courses/lessons, progress, email+OAuth auth, sessions, payments (course purchases, premium subscription), avatars. Bun + Elysia + Prisma/PostgreSQL + Redis/BullMQ, TypeScript strict. Users are Russian-speaking: user-facing text (emails, payment descriptions, the whole OpenAPI docs - tags, `summary`, `description` of routes and schema fields) is Russian; API error messages (including schema `error` strings), logs, code and comments are English.

## Commands

| Task                     | Command                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------- |
| Typecheck (the only one) | `bun run typecheck`                                                                    |
| Prisma client codegen    | `bun run db:generate`                                                                  |
| Migration SQL (preview)  | `bunx prisma migrate diff --from-config-datasource --to-schema prisma/models --script` |
| Find code                | `codegraph explore "<query>"`                                                          |

## Layout

```
packages/            @teacoder/* bun workspaces - framework-agnostic, no build step (exports -> .ts)
  logger/            createLogger (pino), logContext / extendLogContext (AsyncLocalStorage)
  http/              createHttpClient (timeout, retries+backoff), HttpError
  oauth/             SSO on openid-client: providers + createAuthorization/completeAuthorization
  captcha/           turnstile(), yandexSmartCaptcha() verifiers
  fingerprint/       Fingerprint Server API v4: event lookup + identify() (freshness, replay, origin, confidence)
  payments/          subpath exports: /yookassa /heleket /crypto-bot /robokassa /telegram-stars
  orion/             Orion file storage client (github.com/teacoder-team/orion)
  npd/               "Мой налог" self-employed tax receipts
  telegram/          tg`` safe-HTML template, chat targets (id / id:topic), multi-chat notifier on grammY
prisma/models/*.prisma   multi-file schema; client generated to prisma/generated (import '@prisma/generated/client')
src/
  main.ts  bootstrap.ts  app.ts     entry, startup/shutdown (db, redis, workers), module mounting + OpenAPI (/docs)
  config/            env.ts (validated env), openapi.ts (docs header, TAG sections), paths.ts, version.ts
  plugins/           request-context (requestId, ip, userAgent), auth-guard (auth macro), auth-cookie, error-handler
  lib/
    db.ts redis.ts cache.ts logger.ts errors.ts    infrastructure + the app's error classes
    integrations/    package instances wired with env: oauth, captcha, fingerprint, payments, orion, npd, telegram (admin bot)
    security/        aes-gcm, email-crypto, hash (argon2), jwt, otp, recovery-code, refresh-token, totp, verification-code
    queue/ mail/ datasets/   BullMQ, nodemailer + react-email templates, geo/disposable-email data
    utils/           pure helpers, no env: bytes, email, ip, lazy, schema, username
  modules/<feature>/ index.ts controller · service.ts logic · repository.ts Prisma · model.ts schemas · jobs.ts queue
  modules/admin-bot/ no HTTP: bot.ts (grammY commands, polling lifecycle), jobs.ts, messages.ts (Russian HTML)
```

## Module pattern (feature folders, per Elysia's best-practice guide)

- `index.ts` - Elysia instance with `prefix` + `tags: [TAG.x]` (`~/config/openapi`; a new section also needs an entry with a description in its `tags` list). Thin: read input, call a service, set cookies, return. Register schemas with `.model({ XPayload, XResponse })`, reference them by name (`body: 'XPayload'`, `response: 'XResponse'`), always add `detail: { summary, description }`. Protected routes: `.use(authGuard)` + `auth: true` (route or `.guard`) -> `session` in context; also add `detail.security: [{ bearerAuth: [] }]`.
- `service.ts` - plain exported `const` arrow functions (no classes). Business rules live here. Throw `~/lib/errors` classes, never touch HTTP status.
- `repository.ts` - Prisma only, no logic. Multi-step writes use `db.$transaction` here; functions that must join a caller's transaction take `client: Prisma.TransactionClient = db`.
- `model.ts` - TypeBox via `t` from `elysia`. Names: `XPayload` (body), `XResponse`, `XParams`/`XQuery`; export `type XInput = Static<typeof XPayload>`. Give fields a Russian `description`, `examples`, and an English `error` message; give exported objects a Russian `description` too (`t.Object({...}, { description })`). Enum values in docs are written as the API returns them - Prisma enum keys (`REQUIRES_PAYMENT`), not the lowercase DB mapping. Prisma enums: `PrismaEnum(Enum)` from `~/lib/utils/schema`.
- `jobs.ts` - BullMQ handlers as `JobHandlers<Jobs>` + `enqueueX` helpers. Email handlers are merged into the one email worker in `bootstrap.ts`. Payloads carry ids, not PII - resolve/decrypt inside the handler.

## Hard rules

- **Verify with `bun run typecheck` only.** Never start the server (`bun run dev`, `bun run start`, `bun src/main.ts`), never run `bun run build`, never run prettier (`bun run format`, `format:check`, `bunx prettier`). The user runs the server; their editor formats on save. To check runtime behaviour, write a throwaway `bun` script that imports the module - don't boot the app - and delete it after.
- **Never touch the database schema state**: no `prisma migrate dev|deploy|reset`, `db push`, `db:deploy`. Write migrations as files and let the user apply them. `bun run db:generate` (client codegen) is fine after editing `prisma/models`.
- Don't `bun add`/remove dependencies, commit, or push unless asked.
- **Conditionals always use braces with the body on its own line** - no one-line `if`:

    ```ts
    // ✗
    if (!user) return null
    if (!user) throw new NotFoundError('User not found')

    // ✓
    if (!user) {
    	throw new NotFoundError('User not found')
    }
    ```

- Find code with **CodeGraph** first (index in `.codegraph/`): the `codegraph_explore` MCP tool, or `codegraph explore "<symbols or question>"`. It returns current source + callers/blast radius in one call. If results look stale: `codegraph sync`.

## Conventions

- **Responses**: success returns the bare data (no envelope). Every error becomes `{ status, messages: string[] }` in `plugins/error-handler.ts` - the only place errors turn into responses and get logged.
- **Logging**: `logger` / `extendLogContext` from `~/lib/logger`. Record business events on the request log line: `extendLogContext({ event: 'snake_case_event', userId, ... })`. Direct `logger.warn/error({ context: 'area', err }, 'snake_case_message')` only for things the response won't show (swallowed failures, background work). Don't log an error you're about to throw.
- **Env**: only through `env` from `~/config/env` (TypeBox-validated; the app refuses to boot on bad env). New var -> `env.ts` + `.env.example` (+ `.env`). URLs: `GATEWAY_URL` = this API (OAuth callbacks, provider webhooks), `APP_URL` = website (email links, payment return URLs).
- **Packages** never import `~/`, Prisma, or `env`, and never read `process.env`: they export factories taking config (`createYookassaClient({ ... })`) and accept an optional structural `logger`. The app instantiates them in `src/lib/integrations/`. Packages throw their own error classes; the app maps them to HTTP errors.
- **Prisma**: `id String @id @default(uuid())`; snake*case via `@map`/`@@map`; name every constraint (`uq*<table>_<cols>`, `ix_<table>\_<cols>`); enum values mapped lowercase. `Bytes`columns need`toBytes(buffer)`from`~/lib/utils/bytes`(Buffer vs`Uint8Array<ArrayBuffer>` typing).
- **Money**: `PaymentIntent.amount` is a float in roubles - compare in minor units (`Math.round(x * 100)`).
- **Style** (formatter isn't run by agents, so write it formatted): tabs, single quotes, no semicolons, no trailing commas, width 100. Import groups separated by a blank line, in this order: third-party, `node:*`, `@teacoder/*`, `@prisma/*`, `~/*`, relative. Blank line between logical steps and after every `if` block. Files kebab-case.
- **Comments**: none by default. A one-line `/** */` only for a non-obvious why (constraint, invariant, provider quirk) - never what the code does.

## Domain notes

- **Auth**: email stored encrypted (`emailCipher`, AES-GCM) + `emailHash` (HMAC) for lookup - look users up with `hashEmail(normalizeEmail(email))`, never by plaintext. Access = JWT, response body + `Authorization: Bearer` only (never a cookie). Refresh = opaque token, httpOnly cookie `tc_refresh` (path `/auth/refresh`) only (never in a body); `/auth/refresh` reads just the cookie. Rotated; reuse revokes the session family. Controllers return `authCookie.issue(result)` - it sets the cookie and strips `refreshToken` from the body. One-time codes: `issueVerificationCode` / `verifyCode` in `modules/auth/service.ts` (hashed, attempt-limited) - reuse them, don't hand-roll.
- **MFA** (`modules/mfa`): TOTP, recovery codes and WebAuthn (`modules/webauthn`, `/auth/webauthn`, `@simplewebauthn/server`). Any WebAuthn key or a confirmed TOTP turns MFA on for password/OAuth sign-in; the first factor gets recovery codes (`issueRecoveryCodesIfMissing`), removing the last factor deletes them. WebAuthn has two modes on the same endpoints: no `mfaToken` = passwordless passkey login with required user verification (counts as MFA, no second step); with `mfaToken` = second factor (only that user's keys, UV preferred) finishing via `completeMfaSignIn`. Challenges are single-use (`GETDEL`) in Redis, login ones keyed by the challenge itself. RP ID/origins default to `APP_URL` (`WEBAUTHN_RP_ID`, `WEBAUTHN_ORIGINS`). Sign-in: every first-factor path (password login, password reset, OAuth callback) ends in `completeSignIn` (`auth/service.ts`) - never call `issueTokenPair` for a sign-in directly, or MFA is bypassed. With MFA on it returns `{ mfaRequired: true, mfaToken }` and opens a Redis ticket (`auth/mfa-ticket.ts`, 5 min, keyed by the token hash) - no session, no tokens; `POST /auth/mfa/challenge` picks a code method (TOTP / recovery code; WEBAUTHN goes through `/auth/webauthn/login/*` with the same `mfaToken`), `POST /auth/mfa/confirm` verifies, burns the ticket and issues tokens. Prove a factor with `verifySecondFactor(userId, code)` (TOTP or recovery code, rate-limited, spends the recovery code) - don't re-implement it. TOTP math is hand-written in `~/lib/security/totp` (RFC 6238, SHA-1/6/30, ±1 step), secrets encrypted with `MFA_ENCRYPTION_KEY`. `TotpAuthenticator` (one per user, secret AES-GCM encrypted like email, `confirmedAt` null = enrolling, `lastUsedStep` blocks code reuse), `RecoveryCode` (HMAC-hashed, single-use, batch replaced on regenerate), `WebAuthnCredential` (passkeys / security keys, `signCount` for clone detection; challenges go to Redis, not the DB).
- **Captcha**: `verifyCaptcha(token, ip)` from `~/lib/integrations/captcha` gates register/login/forgot-password; `CAPTCHA_PROVIDER=none` disables it.
- **Fingerprint**: the client sends `X-Fingerprint-Event: <event_id>` from `fp.get()`; the `fingerprint: true` macro (`~/plugins/fingerprint`) re-reads the event server-side and resolves `visitorId` - never trust a visitor id from the client. Fails open (`null`): sign-in never depends on it. Stored on `Session.visitorId` and in `UserVisitor` (known devices, survives session pruning). Used for: login lockout per device, "new device" email (only when the account already has other devices), same-device accounts in the admin sign-up notification, refresh mismatch logging (log only). `RequestOrigin` carries it; OAuth parks it in the Redis state.
- **OAuth**: providers in `~/lib/integrations/oauth` (`OAUTH_PROVIDERS`, `AUTH_PROVIDER` maps to the Prisma enum, `AUTH_PROVIDER_TITLES` for Russian text). State + PKCE verifier live in Redis under the state value. One callback serves sign-in and linking - the parked state carries `link` for the latter, the response carries `intent: SIGN_IN | LINK`. One account per provider per user (`uq_oauth_accounts_user_id_provider`). Every link goes through `attachOAuthAccount` (`oauth/accounts.ts`: conflict checks + notification email). Sign-in matching a verified provider email (`profile.email` is only set when verified) auto-links and reports `linkedProvider`; behind MFA the link waits in the ticket until `confirm`. A PENDING email registration with that address is deleted, not linked (squatting).
- **Payments**: `billing/service.ts` opens a `PaymentIntent` at the provider; a course the user already owns is refused up front (409), not charged and refunded later. At most one payable invoice per user and product: `billing/checkout.ts` hands back the open one for the same method and refuses (409) a different method until it expires (`CHECKOUT_TTL_SECONDS`, also the invoice lifetime at Heleket/Crypto Bot); the whole decision runs under a per-product Redis lock (`withLock` from `~/lib/lock`). `Idempotency-Key` is unique per user: same key + same params replays, different params -> 422, a failed attempt frees the key. Webhooks (`modules/webhook`) authenticate (IP allowlist + signature, or API re-fetch for YooKassa), store raw events in `WebhookEvent` (dedup on `(pspName, pspEventId)`; Heleket key is `uuid:status`), then call `applyPaymentUpdate` (`billing/fulfillment.ts`), which captures + grants the course in one guarded transaction. Subscription payments are intentionally not processed yet - events stay unprocessed. CryptoBot/Robokassa/Stars have no webhook endpoints yet.
- **Telegram**: two bots with separate tokens. Public bot (`TELEGRAM_PUBLIC_BOT_*`) - users, Telegram Stars payments. Admin bot (`TELEGRAM_ADMIN_BOT_TOKEN`, empty = off) - staff notifications to `TELEGRAM_ADMIN_CHAT_IDS` (`user`, `-100group`, `-100group:topic`), answers `/start` only there. Notifications (course purchases, sign-ups) go through the `notifications` queue, never sent inline from a request. Enqueue via `~/modules/admin-bot/queue` (best-effort, never throws), not `jobs.ts` - that one imports services and would create import cycles.
- **IP**: `ip` in handlers comes from `request-context` (faked to a public IP in development for geo lookup). Webhook allowlists use the real forwarded IP via `createIpAllowlist` / `getForwardedIp` in `~/lib/utils/ip`.

## Gotchas

- Windows dev box: the user's `bun --watch` holds folder handles, so renaming a **directory** fails with `Permission denied` - move files one by one (`git mv` per file).
- In development pino writes through an async worker transport - log lines can lag or be lost if the process is killed.
- OAuth routes live under `/auth/sso` (module folder is still `modules/oauth`). `redirect_uri` is `${GATEWAY_URL}/auth/sso/<provider>/callback`; provider consoles must register that exact URL - changing the path breaks sign-in until every console is updated.
- Telegram markup uses the `tg` tag, never one named `html`: prettier formats `html` templates as HTML and collapses the `\n` that Telegram renders literally. Write line breaks as `\n` inside `tg` templates.
- The admin bot long-polls from the app process: one poller per token. A second instance or environment on the same token gets `409 Conflict` - each environment needs its own admin bot.
