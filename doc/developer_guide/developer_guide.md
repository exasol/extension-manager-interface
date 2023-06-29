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

## Releasing

Currently releases for this project need to be done manually. Release-droid can be used after implementation of [RD issue #3](https://github.com/exasol/extension-manager-interface/issues/3)).

### Steps

1. Write a changelog file `doc/changes/changes_<version>.md`
1. Add a link to `doc/changes/changelog.md`
1. Update the version in `package.json`
1. Update constant `CURRENT_API_VERSION` in `src/api.ts`
1. Run `npm login`. The credentials can be found in Keeper.
1. Run `npm run clean && npm test && npm run build && npm publish --access public`
1. Make a [new release](https://github.com/exasol/extension-manager-interface/releases/new) on GitHub
