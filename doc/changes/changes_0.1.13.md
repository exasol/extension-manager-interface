# Extension Manager Interface 0.1.13, released 2022-09-12

Code name: Refactor finding and deleting an instance

## Summary

This release contains the following changes:

* SqlClient
    * Renamed Method `runQuery` to `execute`
    * Added method `query` which returns the result of a `SELECT` query
* Extension:
    * Method `deleteInstance`: removed parameters `installation: Installation, instance: Instance` and added `instanceId: string`
    * Method `readInstanceParameters`: removed parameters `installation: Installation, instance: Instance` and added `instanceId: string`
    * Method `findInstances`: removed parameter `installation: Installation` and added `version: string`
* Interface `Instance`
    * Added field `id: string`
* Interface `ExaMetadata`:
    * Added fields to `ExaVirtualSchemasRow`

## Features

* #29: Refactored finding and deleting an instance
