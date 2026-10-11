# tablemanager-view
 
This angular app is for tablemanager which manage the table tennis tables during a tournament.

## Docker build:

Run `ng build --configuration production --base-href ./ --progress false` to build app.
Run `docker build . -t holzleube/tablemanager-view:1.x` to build image.

[DockerTags](https://hub.docker.com/r/holzleube/tablemanager-view/tags)

## Development server

Run `npm start` for a dev server on `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Testing

Run `npm run e2e` to run the Playwright end-to-end tests.

## Formatting

Run `npm run format` to format the code with prettier.

