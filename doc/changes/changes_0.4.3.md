# Extension Manager Interface 0.4.3, released 2024-05-10

Code name: Improve virtual schema name parameter

## Summary

This release improves name and regular expression for the virtual schema name parameter in the virtual schema base extensions. The new regular expression now forbids leading underscores `_` and numbers because the Exasol DB does not support these names.

This release also reduces code duplication by generating `version.ts` containing the version number from `package.json`.

The release enforces naming conventions for extension parameters. To avoid issues with form IDs in Angular applications, parameter IDs must not contain a dot `.`. To verify that extensions conform to this and other conventions, please call the following function in the extension test:

```ts
import { testJavaVirtualSchemaBaseExtension } from '@exasol/extension-manager-interface/dist/base-vs-test/vsTestBase';
import { createExtension } from "./extension";

// ...

testJavaVirtualSchemaBaseExtension(createExtension);
```

See the [readme](../../README.md#testing-extensions) for details.

## Bugfixes

* #56: Restricted pattern for parameter  `virtual schema name`

## Refactoring

* #36: Generated API version from `package.json`
* #59: Enforced naming conventions for parameter IDs

## Dependency Updates

### Development Dependency Updates

* Added `typescript-eslint:^7.8.0`
