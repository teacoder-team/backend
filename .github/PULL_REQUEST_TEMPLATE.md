## What is this PR about?

<!-- A short paragraph: what changes and why. -->

## Type of change

- [ ] New feature
- [ ] Bug fix
- [ ] Refactoring (no behaviour change)
- [ ] Database schema change
- [ ] Docs, config or tooling

## Checklist

- [ ] The branch is based on `dev`, commits follow Conventional Commits (`feat(billing): ...`, `fix(auth): ...`)
- [ ] `bun run typecheck` passes
- [ ] Schema changes come with a new migration; applied migrations are not edited
- [ ] Routes, schemas and fields are described in Russian in OpenAPI, enum values documented as returned
- [ ] New environment variables are validated in config and added to the env example
- [ ] No secrets or personal data in logs and queue payloads
- [ ] Payment, access and auth behaviour is preserved, or the change is described above

## API changes

<!-- New or changed endpoints and fields. Breaking for the frontend? It needs `bun run generate`. -->

## Related issues

<!-- closes #123 -->
