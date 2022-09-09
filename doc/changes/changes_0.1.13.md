# Extension Manager Interface 0.1.13, released 2022-09-12

Code name: Refactor finding and deleting an instance

## Summary

This release contains the following changes:

* SqlClient
    * Method `runQuery` renamed to `execute`
    * Added method `query` which returns the result of a `SELECT` query
* Extension:
    * Method `deleteInstance` removes parameters `installation: Installation, instance: Instance` and adds `instanceId: string`
    * Method `readInstanceParameters` removes parameters `installation: Installation, instance: Instance` and adds `instanceId: string`
    * Method `findInstances` removes parameter `installation: Installation` and adds `version: string`
* Interface `Instance`
    * Added field `id: string`
* Interface `ExaMetadata`:
    * Added fields to `ExaVirtualSchemasRow`

## Features

* #29: Refactored finding and deleting an instance
