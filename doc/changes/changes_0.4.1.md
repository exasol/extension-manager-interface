# Extension Manager Interface 0.4.1, released 2023-11-09

Code name: Support JDBC based extensions

## Summary

This release adds support for JDBC based virtual schema extensions that use two separate JARs: the adapter and the JDBC driver. The base extension allows specifying multiple files that are then all included in the `ADAPTER SCRIPT` definition as `%jar` directives.

The release also allows extensions to ignore the file size for JDBC driver JAR files by omitting the file size.

## Features

* #51: Added support for JDBC based extensions

## Dependency Updates

### Development Dependency Updates

* Updated `eslint:^8.52.0` to `^8.53.0`
* Updated `@typescript-eslint/parser:^6.9.1` to `^6.10.0`
* Updated `@typescript-eslint/eslint-plugin:^6.9.1` to `^6.10.0`
