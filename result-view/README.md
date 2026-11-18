# result-view
A table tennis result view for showing results

## Docker image

All three clients ship in one image, built from `Dockerfile-clients` in the repository root (nginx serves
`/admin-view`, `/result-view` and `/tablemanager-view` and proxies `/api/v2` and `/ttt-websocket` to the backend).
`docker compose up` builds it; CI publishes it as `holzleube/ttt-clients`.

## Development server

Run `npm start` for a dev server on `http://localhost:4202/`. The app will automatically reload if you change any of the source files.

## Testing

Run `npm test` to execute the Vitest unit tests, `npm run test:types` to type-check them and `npm run e2e` to run the Playwright end-to-end tests.

## Formatting

Run `npm run format` to format the code with prettier.

