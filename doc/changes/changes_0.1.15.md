# Extension Manager Interface 0.1.15, released 2022-09-15

Code name: Get parameters

## Summary

This release contains the following changes:

* Remove the `instanceParameters` field from the `Installation` interface
* Add function `getInstanceParameters()` function
* Rename function `readInstanceParameters()` to `readInstanceParameterValues()`
* Add parameter `extensionVersion` to function `readInstanceParameterValues()`
* Add parameter `extensionVersion` to function `deleteInstance()`
* Update type of the `options` field of `SelectParameter` from a map to a list of objects
* The `installableVersions` now is a list of `ExtensionVersion` objects instead of strings

## Features

* #34: Added request for getting parameters of an extension, mark versions as deprecated/latest
