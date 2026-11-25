# Handoff: upgrade the three Angular clients to Angular 22

Repo: `/home/dane/dev/source/tt/management-clients` (read `AGENTS.md` first). Branch: **`angular-22`** (from `main` @ 05a5c1d1).

## Goal

Move `admin-view`, `tablemanager-view` and `result-view` from Angular 21.2 to **Angular 22.3.0**, following the
official update guide (https://angular.dev/update-guide, v21.0 → v22.0, Advanced).
The guide page renders client-side and can't be fetched. Its steps are in the raw source:
`https://raw.githubusercontent.com/angular/angular/main/adev/src/app/features/update/recommendations.ts`
(entries with `possibleIn: 2200`). The user wants that guide followed.

## Decisions already made with the user (don't re-ask)

1. Target: Angular 22.3.0, Material/CDK 22.3.0, NgRx 22.0.1, angular-eslint 22.8.x, TypeScript 6.0 (ng update installed 6.0.3).
   Use `ng update`, with NgRx and angular-eslint in the **same** call (peer ranges block it otherwise).
2. OnPush default: accept the migration that adds `ChangeDetectionStrategy.Eager`. Keep zone.js. OnPush/zoneless → follow-up.
3. ngx-toastr (no v22 release) → replaced with MatSnackBar. **Done, committed** (`ad781db4`).
   - `admin-view/src/app/shared/notification.service.ts`: `error/success/info`, 5 s, bottom-centre, one message at a time,
     panel classes `notification-error|success|info` (colours in `admin-view/src/styles.scss`).
   - The e2e helper is now `errorNotification` (`.notification-error`). The other clients keep their plain `snackBar.open`.
4. Builders: every client on `@angular/build` (`application`/`dev-server`/`extract-i18n`), `@angular-devkit/build-angular` removed
   (`ng update @angular/cli --name use-application-builder`). tablemanager-view still uses webpack `browser`, the riskiest one.
   Check that the output paths still match `Dockerfile-clients` / `my_server_block.conf`.
5. Templates: fix the diagnostics, **no opt-outs**. Remove the `strictTemplates: false` and the suppressed
   `nullishCoalescingNotNullable`/`optionalChainNotNullable` that ng update writes into `src/tsconfig.app.json`. Remove the
   `$safeNavigationMigration()` wrappers (check that the receiving input/pipe handles `undefined` like `null`). Remove
   `fullTemplateTypeCheck` from `tablemanager-view/tsconfig.json`.
6. Node 24: `node-version: 24` in `.github/workflows/ci.yml` (4 places), `FROM node:24-alpine` in `Dockerfile-clients`.
7. Delivery: one commit per client plus one for CI/Docker/docs. For each client run `build`, `lint`, `format:check`, `test`,
   `test:types`, `e2e`. The e2e teardown deletes the docker DB volume, which the user accepted. **No push/PR until the user asks.**
8. Docs: "Angular 21" → "Angular 22" in `AGENTS.md`; add follow-ups in `docs/follow-ups.md`. No GLOSSARY/ADR changes.

## OPEN decision: ask this first (Q13)

**TypeScript 6.0 defaults to `strict: true`.** No client tsconfig sets `strict`, so admin-view's build now fails with
~360 errors (123 × TS2564, ~190 nullability errors of which ~113 are in templates, ~40 implicit-any). My recommendation, not yet confirmed:
set `"strict": false` explicitly in each client's `tsconfig.json`, keep `strictTemplates` on (Q5), fix what remains,
and add a follow-up for strict mode as its own branch. The alternative is fixing all errors in this upgrade.

## Current state of admin-view (uncommitted on `angular-22`)

Done so far, in the working tree:
- `ng update @angular/core@22 @angular/cli@22 @ngrx/store@22 @angular-eslint/builder@22` applied: Eager added to 40 components,
  package.json bumped.
- Reverted the migration's opt-outs: `src/tsconfig.app.json` restored, `$safeNavigationMigration` removed, `withXhr()` removed
  from `src/main.ts` (nothing uses XHR upload progress, so it stays on the default fetch backend).
- `ng update @angular/material@22` (no code changes) and `use-application-builder` applied (angular.json, package.json).
- The other `@angular-eslint/*` packages bumped to ^22.8.0. `@analogjs/vite-plugin-angular` 2.9.7 already supports Angular 22, so it stays.
- Prettier ran on src/e2e/angular.json. **Watch out:** Prettier reformats `src/assets/font/*` too. Revert those with `git checkout src/assets/font`.

Next for admin-view: settle Q13 → remove `baseUrl` from `tsconfig.json` (TS5101 deprecation; no `paths` use it, so first check
for non-relative `src/...` imports) → `npm run build` until clean (latest error log in the session scratchpad, may be
gone: `/tmp/claude-1000/-home-dane-dev-source-tt-management-clients/d9d76db4-ca21-46e7-a8a2-0ddd1c5112fb/scratchpad/admin-build.txt`)
→ lint/format/test/test:types → commit. Update the comment in `src/main.ts` that says "Angular 21 defaults to zoneless".

Then the same for tablemanager-view and result-view (both also have `angular-eslint`/`@angular-eslint/schematics`, and the
shared copies `src/app/shared/update-events|result-entry|match-state` must stay byte-identical across clients), then CI/Docker/docs.

## Environment gotchas

- The local default Node is 22.17.1 (too old). Node 24.22.3 is installed via nvm but **not** the default. Start every command with
  `source ~/.nvm/nvm.sh >/dev/null; nvm use 24 >/dev/null;` (each Bash call gets a fresh shell).
- Shell is zsh: `for f in $files` doesn't word-split. Use `$(...)` inline or a script.
- **The Docker daemon isn't running**, so the e2e tests couldn't run yet, not even for the toastr commit. The user has to start it
  (`! sudo systemctl start docker`), then `docker compose up -d --build` from the repo root, then `npm run e2e` per client.
- There's an unrelated older stash `stash@{0}` from `feat/sbt-update`. Leave it alone.

## Suggested skills

- `mattpocock-skills:grilling` for asking Q13 (and any new decisions) in the numbered-question format the user is used to.
- `mattpocock-skills:code-review` at the end, against `main`, before asking whether to push.
- `mattpocock-skills:pr` only if the user asks for a PR.
