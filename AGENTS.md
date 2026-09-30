# TeaCoder API

Backend of TeaCoder, a Russian dev-education platform: courses/lessons, progress, email+OAuth auth, sessions, payments (course purchases, premium subscription), avatars. Bun + Elysia + Prisma/PostgreSQL + Redis/BullMQ, TypeScript strict. Users are Russian-speaking: user-facing text (emails, payment descriptions) is Russian; API error messages, logs, code and comments are English.

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
  payments/          subpath exports: /yookassa /heleket /crypto-bot /robokassa /telegram-stars
  orion/             Orion file storage client (github.com/teacoder-team/orion)
  npd/               "Мой налог" self-employed tax receipts
prisma/models/*.prisma   multi-file schema; client generated to prisma/generated (import '@prisma/generated/client')
src/
  main.ts  bootstrap.ts  app.ts     entry, startup/shutdown (db, redis, workers), module mounting + OpenAPI (/docs)
  config/            env.ts (validated env), paths.ts, version.ts
  plugins/           request-context (requestId, ip, userAgent), auth-guard (auth macro), auth-cookie, error-handler
  lib/
    db.ts redis.ts cache.ts logger.ts errors.ts    infrastructure + the app's error classes
    integrations/    package instances wired with env: oauth, captcha, payments, orion, npd
    security/        email-crypto, hash (argon2), jwt, otp, refresh-token, verification-code
    queue/ mail/ datasets/   BullMQ, nodemailer + react-email templates, geo/disposable-email data
    utils/           pure helpers, no env: bytes, email, ip, lazy, schema, username
  modules/<feature>/ index.ts controller · service.ts logic · repository.ts Prisma · model.ts schemas · jobs.ts queue
```

## Module pattern (feature folders, per Elysia's best-practice guide)

- `index.ts` - Elysia instance with `prefix` + `tags`. Thin: read input, call a service, set cookies, return. Register schemas with `.model({ XPayload, XResponse })`, reference them by name (`body: 'XPayload'`, `response: 'XResponse'`), always add `detail: { summary, description }`. Protected routes: `.use(authGuard)` + `auth: true` (route or `.guard`) -> `session` in context; also add `detail.security: [{ bearerAuth: [] }]`.
- `service.ts` - plain exported `const` arrow functions (no classes). Business rules live here. Throw `~/lib/errors` classes, never touch HTTP status.
- `repository.ts` - Prisma only, no logic. Multi-step writes use `db.$transaction` here; functions that must join a caller's transaction take `client: Prisma.TransactionClient = db`.
- `model.ts` - TypeBox via `t` from `elysia`. Names: `XPayload` (body), `XResponse`, `XParams`/`XQuery`; export `type XInput = Static<typeof XPayload>`. Give fields `examples` (OpenAPI) and a human `error` message. Prisma enums: `PrismaEnum(Enum)` from `~/lib/utils/schema`.
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

    Older code still has one-liners: fix them in functions you touch, don't mass-rewrite.

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

- **Auth**: email stored encrypted (`emailCipher`, AES-GCM) + `emailHash` (HMAC) for lookup - look users up with `hashEmail(normalizeEmail(email))`, never by plaintext. Access = JWT (`tc_access` cookie or `Authorization: Bearer`); refresh = opaque token, rotated, reuse revokes the session family (`tc_refresh`, path `/auth/refresh`). One-time codes: `issueVerificationCode` / `verifyCode` in `modules/auth/service.ts` (hashed, attempt-limited) - reuse them, don't hand-roll.
- **Captcha**: `verifyCaptcha(token, ip)` from `~/lib/integrations/captcha` gates register/login/forgot-password; `CAPTCHA_PROVIDER=none` disables it.
- **OAuth**: providers in `~/lib/integrations/oauth` (`OAUTH_PROVIDERS`, `AUTH_PROVIDER` maps to the Prisma enum). State + PKCE verifier live in Redis under the state value; accounts are linked by email only when the provider marks it verified.
- **Payments**: `billing/service.ts` opens a `PaymentIntent` at the provider. Webhooks (`modules/webhook`) authenticate (IP allowlist + signature, or API re-fetch for YooKassa), store raw events in `WebhookEvent` (dedup on `(pspName, pspEventId)`; Heleket key is `uuid:status`), then call `applyPaymentUpdate` (`billing/fulfillment.ts`), which captures + grants the course in one guarded transaction. Subscription payments are intentionally not processed yet - events stay unprocessed. CryptoBot/Robokassa/Stars have no webhook endpoints yet.
- **IP**: `ip` in handlers comes from `request-context` (faked to a public IP in development for geo lookup). Webhook allowlists use the real forwarded IP via `createIpAllowlist` / `getForwardedIp` in `~/lib/utils/ip`.

## Gotchas

- Windows dev box: the user's `bun --watch` holds folder handles, so renaming a **directory** fails with `Permission denied` - move files one by one (`git mv` per file).
- In development pino writes through an async worker transport - log lines can lag or be lost if the process is killed.
- `redirect_uri` for OAuth is derived from `GATEWAY_URL`; provider consoles must register that exact URL.
