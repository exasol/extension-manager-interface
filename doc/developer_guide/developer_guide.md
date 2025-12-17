# Developer Guide

## Running Unit Tests

```shell
npm install
npm test
```

To run tests continuously each time a file is changed on disk (useful during development), start the following command:

```shell
npm run test-watch
```

## Linting

```sh
npm run lint
```

## Upgrade Dependencies

```sh
npx npm-check-updates -u && npm i
```

## Releasing

Use [release-droid](https://github.com/exasol/release-droid) for creating releases and publishing to [NPM Registry](https://www.npmjs.com/package/@exasol/extension-manager-interface).

The release build [release.yml](../../.github/workflows/release.yml) for publishing to npmjs.org will be triggered when the GitHub release is published.
