# Extension Manager Interface 0.4.3, released 2024-05-10

Code name: Improve virtual schema name parameter

## Summary

This release improves name and regular expression for the virtual schema name parameter in the virtual schema base extensions. The new regular expression now forbids leading underscores `_` and numbers because the Exasol DB does not support these names.

## Bugfixes

* #56: Improved virtual schema name parameter

## Dependency Updates

### Development Dependency Updates

* Added `typescript-eslint:^7.8.0`
