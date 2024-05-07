# Extension Manager Interface

[![Build Status](https://github.com/exasol/extension-manager-interface/actions/workflows/ci-build.yml/badge.svg)](https://github.com/exasol/extension-manager-interface/actions/workflows/ci-build.yml)
[![npm version](https://badge.fury.io/js/@exasol%2Fextension-manager-interface.svg)](https://badge.fury.io/js/@exasol%2Fextension-manager-interface)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=%40exasol%2Fextension-manager-interface&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=%40exasol%2Fextension-manager-interface)

This is the interface definition for Exasol extensions that can be installed by the [Exasol extension-manager](https://github.com/exasol/extension-manager/).

## Creating New Extensions

You have the following options for creating a new extensions:

### Generic Interface

The generic extension interface is defined in [src/api.ts](src/api.ts). It is the most flexible option but requires implementing all extension methods from scratch.

Example: [row-level-security-lua](https://github.com/exasol/row-level-security-lua/blob/main/extension/src/extension.ts)

### Java `SCRIPT` Base 

The base extension interface for Java `SCRIPT` based extension is defined in [src/base/index.ts](src/base/index.ts). It is useful for extensions that only consist of one or multiple Java `SCRIPT` UDFs and don't use instances.

Example: [cloud-storage-extension](https://github.com/exasol/cloud-storage-extension/blob/main/extension/src/extension.ts)

### Java `VIRTUAL SCHEMA` Base

The base extension interface for Java `VIRTUAL SCHEMA`s is defined in [src/base-vs/index.ts](src/base-vs/index.ts). It is useful for JDBC or document based Virtual Schemas that are based on Java UDFs.

Examples:
* JDBC based: [oracle-virtual-schema](https://github.com/exasol/oracle-virtual-schema/blob/main/extension/src/extension.ts)
* Document based: [s3-document-files-virtual-schema](https://github.com/exasol/s3-document-files-virtual-schema/blob/main/extension/src/extension.ts)

## Additional Information

* [Changelog](doc/changes/changelog.md)
* [Guide for developing an extension for Extension Manager](https://github.com/exasol/extension-manager/blob/main/doc/extension_developer_guide.md)
* [Developer Guide](doc/developer_guide/developer_guide.md)
* [Dependencies](dependencies.md)
