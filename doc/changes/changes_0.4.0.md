# Extension Manager Interface 0.4.0, released 2023-11-03

Code name: Simplify Virtual Schema Extensions

## Summary

This release simplifies creating extension definitions for Java-based virtual schemas. To use it, simply create your `ExasolExtension` by calling `convertVirtualSchemaBaseExtension(baseExtension: JavaVirtualSchemaBaseExtension)`. This works similar to `convertBaseExtension(baseExtension: JavaBaseExtension)` for Java-based script extensions. No need to implement all extension methods yourself, just configure required `SCRIPT`s, `CONNECTION` parameters and `VIRTUAL SCHEMA` properties. See the the S3 Virtual Schema [extension](https://github.com/exasol/s3-document-files-virtual-schema/blob/main/extension/src/extension.ts) updated in [#139](https://github.com/exasol/s3-document-files-virtual-schema/pull/139) as an example.

## Features

* #49: Extracted common code for virtual schema extensions

## Dependency Updates

### Development Dependency Updates

* Updated `eslint:^8.47.0` to `^8.52.0`
* Updated `@jest/globals:^29.6.3` to `^29.7.0`
* Updated `@typescript-eslint/parser:^6.4.1` to `^6.9.1`
* Updated `typescript:5.1.6` to `5.2.2`
* Updated `@typescript-eslint/eslint-plugin:^6.4.1` to `^6.9.1`
* Updated `jest:^29.6.3` to `^29.7.0`
