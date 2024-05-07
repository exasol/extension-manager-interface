# Extension Manager Interface 0.4.2, released 2024-05-07

Code name: Improve error message for existing virtual schema

## Summary

This release checks if a virtual schema already exists with the same name (case-insensitive) before creating a new one. This improves the error message for the user.

The test is case-insensitive because we create a new `CONNECTION` for virtual schemas based on the virtual schema name, and Exasol `CONNECTION` names are also case-insensitive.

## Bugfix

* #54: Improved error handling for creating a virtual schema

## Dependency Updates

### Development Dependency Updates

* Updated `eslint:^8.53.0` to `^8.57.0`
* Updated `@typescript-eslint/parser:^6.10.0` to `^7.8.0`
* Updated `ts-jest:^29.1.1` to `^29.1.2`
* Updated `typescript:5.2.2` to `5.4.5`
* Updated `@typescript-eslint/eslint-plugin:^6.10.0` to `^7.8.0`
* Updated `ts-node:^10.9.1` to `^10.9.2`
