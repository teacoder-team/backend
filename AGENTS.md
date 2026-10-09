# Engineering rules

## Workflow

- Explore code with CodeGraph before editing: `codegraph explore "<query>"` or the MCP tool. If results are stale, run `codegraph sync`. Use `rg` for details the index does not cover.
- Read affected code and its callers before changing a contract. Keep changes focused.
- Preserve observable behaviour during refactoring: responses, errors, side effects, ordering, timing, retries and concurrency guarantees.
- Verify with `bun run typecheck` only. Do not start the server, run a build, or run a formatter. The user runs the app and their editor formats on save.
- For necessary runtime inspection, use a temporary script that imports relevant code without bootstrapping the application. Delete it afterwards.
- Do not add or remove dependencies, commit, push, merge, or deploy unless asked.
- Do not overwrite user changes. Remove temporary files before finishing.
- Report changes, verification and remaining limitations.

## Module structure

- Organize application code by feature. Create only the files a module needs, without empty placeholders.
- `index.ts` is the controller: routing, validation, authentication context, cookies and HTTP status. Delegate business decisions to services.
- `model.ts` owns schemas and data contracts. Derive input types from schemas rather than duplicating shapes.
- `service.ts` owns business rules and orchestration. Use exported arrow functions, not service classes. Throw application errors rather than setting HTTP status.
- `repository.ts` owns Prisma queries and transactions. Keep HTTP, external integrations and notifications out of repositories.
- `jobs.ts` owns worker handlers, scheduling and queue registration. Keep request-facing enqueue helpers independent of worker initialization.
- Keep configuration, infrastructure, external clients and reusable utilities in their corresponding layers outside feature modules.
- Do not split modules into arbitrary helper files or add forwarding exports for obsolete internal paths.
- Keep one authoritative implementation of each rule. Avoid parallel registries, duplicate mappings and speculative abstractions.

## Dependencies

- Depend on the smallest public contract needed from another module. Import shared types from models with `import type`.
- Avoid runtime import cycles and eager initialization that depends on another module's service or worker exports.
- Reusable packages must not import application aliases, database models or application configuration, or read environment variables.
- Packages expose factories accepting configuration and an optional structural logger. The application instantiates and wires them.
- Packages throw their own errors; application code translates them into application errors.
- Read environment variables through validated application configuration. Add new variables to validation and environment examples; keep local configuration consistent.
- Keep utilities pure and independent of application configuration whenever possible.

## API and documentation

- Return successful data directly, without an envelope.
- Handle errors centrally. Error responses use `{ status, messages: string[] }`.
- Register route schemas by name and reference them by name in route definitions.
- Describe routes, schema objects and fields. Include useful examples and precise validation errors.
- Document authentication requirements on protected routes.
- Keep user-facing text and OpenAPI documentation in Russian. Write code, identifiers, logs and API error messages in English.
- Document enum values exactly as the API returns them.
- Keep implementation details out of user-facing messages unless they help the user act.

## Data and side effects

- Never modify database schema state: no applying/resetting migrations, `db push`, or equivalent commands.
- Write migration files for the user to apply. Do not edit historical migrations that may already have been applied.
- `bun run db:generate` is allowed when schema changes require regenerated client types.
- Use transactions for writes that must succeed together. Allow repository operations to join a caller's transaction where needed.
- Preserve constraints, lock boundaries, idempotency and protection against duplicate or out-of-order events.
- Keep persisted naming consistent: UUID identifiers, snake_case mappings and explicit constraint/index names.
- Compare monetary amounts in integer minor units, even when storage uses floating-point values.
- Validate and normalize external input before storing it or using it as an identity.
- Verify client-provided identity, authorization and provider confirmations on the server.
- Keep secrets and personal information out of logs and queue payloads. Queue identifiers and resolve sensitive data in workers.
- Queue slow or retryable side effects. Distinguish best-effort notifications from failures that must abort an operation.
- Preserve retry policy deliberately; never add retries around non-idempotent operations.

## Logging

- Record request-scoped business events through the shared log context.
- Log swallowed failures and background errors with structured context.
- Do not log an error immediately before throwing it if centralized handling will log it.
- Use stable English event names in snake_case.

## Style

- TypeScript strict. Use existing types and validation tools; avoid `any` and unnecessary assertions.
- Tabs, single quotes, no semicolons, no trailing commas, target width 100.
- Always use braces for conditionals, with the body on its own line. Add a blank line after each conditional block and between logical steps.
- Separate import groups with a blank line: third-party, `node:*`, workspace packages, generated database client, application aliases, relative imports.
- Use kebab-case filenames and names that describe the responsibility.
- Do not add code comments. Express intent through names, types and small functions. Keep API descriptions in schema metadata and engineering guidance in documentation.
- Remove dead code, commented-out implementations and unused imports.
- Do not add tests that merely repeat the implementation or expand verification beyond the project workflow.

## Project context

A Russian-language developer education API using Bun, Elysia, Prisma/PostgreSQL and Redis/BullMQ. Preserve existing access control, authentication and payment behaviour unless the user explicitly asks to change it.
