# Extension Manager Interface 0.3.0, released 2023-??-??

Code name: Upgrade extensions

## Summary

This release allows extensions to upgrade installations to the latest version by implementing the `upgrade()` function.

The release also allows reading the table using `context.metadata.getScriptByName('schema', 'name')`.

## Features

* #44: Added support for upgrading extensions

## Dependency Updates

### Development Dependency Updates

* Added `eslint:^8.45.0`
* Updated `@typescript-eslint/parser:^5.60.1` to `^6.2.0`
* Updated `ts-jest:^29.1.0` to `^29.1.1`
* Updated `@types/jest:^29.5.2` to `^29.5.3`
* Updated `@typescript-eslint/eslint-plugin:^5.60.1` to `^6.2.0`
* Updated `jest:^29.5.0` to `^29.6.1`
