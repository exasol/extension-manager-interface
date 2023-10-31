import { Context, ExaMetadata, ExasolExtension, Instance, NotFoundError, Parameter, ParameterValues } from "../api";
import { Result } from "./common";
import { findInstallations } from "./findInstallations";
import { installExtension } from "./install";
import { uninstall } from "./uninstall";
import { upgrade } from "./upgrade";

/** Definition of a Java based Exasol `SCRIPT` with all information required for creating it in the database. */
export type ScriptDefinition = ScalarSetScriptDefinition | AdapterScriptDefinition

/** Definition of a SCALAR or SET script */
export interface ScalarSetScriptDefinition {
    /** Script type */
    type: "SCALAR" | "SET"
    /** Unqualified script name, e.g. "IMPORT_FROM_S3_DOCUMENT_FILES", KAFKA_CONSUMER */
    name: string
    /** Script parameters, e.g. "..." or "params VARCHAR(2000), kafka_partition DECIMAL(18, 0), kafka_offset DECIMAL(36, 0)" */
    parameters: string
    /** Emit parameters, e.g. "..." or "filename VARCHAR(2000), partition_index VARCHAR(100), start_index DECIMAL(36, 0), end_index DECIMAL(36, 0)" */
    emitParameters: string
    /** Script Java class name, e.g. "com.exasol.adapter.document.UdfEntryPoint" */
    scriptClass: string
}

/** Definition of an ADAPTER script */
export interface AdapterScriptDefinition {
    /** Unqualified script name, e.g. "S3_FILES_ADAPTER" */
    name: string
    type: "ADAPTER"
    /** Script Java class name, e.g. "com.exasol.adapter.document.UdfEntryPoint" */
    scriptClass: string
}

/**
 * Simplified version of an {@link ExasolExtension} specifically for Java based extensions.
 */
export interface JavaBaseExtension {
    /** Readable extension name, e.g. "S3 Virtual Schema" */
    name: string
    /** Extension description, e.g. "Virtual Schema for document files on AWS S3" */
    description: string
    /** Extension category, e.g. "document-virtual-schema", "jdbc-virtual-schema", ... */
    category: string
    /** Current extension version, e.g. 1.2.3 */
    version: string
    file: {
        name: string
        size: number
    }
    /** Adapter script definitions for this extension */
    scripts: ScriptDefinition[]
    /** Extracts the version number from the SCRIPT text. A possible implementation is {@link jarFileVersionExtractor}. */
    scriptVersionExtractor: VersionExtractor
}

export type VersionExtractor = (adapterScriptText: string) => Result<string>
export { jarFileVersionExtractor } from './jarFileVersionExtractor';

export function convertBaseExtension(baseExtension: JavaBaseExtension): ExasolExtension {
    function verifyVersion(version: string) {
        if (baseExtension.version !== version) {
            throw new NotFoundError(`Version '${version}' not supported, can only use '${baseExtension.version}'.`)
        }
    }

    return {
        name: baseExtension.name,
        description: baseExtension.description,
        category: baseExtension.category,
        installableVersions: [{ name: baseExtension.version, latest: true, deprecated: false }],
        bucketFsUploads: [{
            bucketFsFilename: baseExtension.file.name,
            fileSize: baseExtension.file.size,
            name: baseExtension.file.name,
            downloadUrl: "(none)",
            licenseUrl: "(none)",
            licenseAgreementRequired: false
        }],
        findInstallations(context: Context, metadata: ExaMetadata) {
            return findInstallations(metadata.allScripts.rows, baseExtension)
        },
        install(context: Context, version: string): void {
            verifyVersion(version)
            installExtension(context, baseExtension)
        },
        uninstall(context: Context, version: string) {
            verifyVersion(version)
            uninstall(context, baseExtension)
        },
        upgrade(context: Context) {
            return upgrade(context, baseExtension)
        },
        findInstances(_context: Context, _version: string): Instance[] {
            throw new NotFoundError("Finding instances not supported")
        },
        addInstance(_context: Context, _version: string, _params: ParameterValues): Instance {
            throw new NotFoundError("Creating instances not supported")
        },
        deleteInstance(_context: Context, _version: string, _instanceId: string): void {
            throw new NotFoundError("Deleting instances not supported")
        },
        getInstanceParameters(_context: Context, _version: string): Parameter[] {
            throw new NotFoundError("Creating instances not supported")
        },
        readInstanceParameterValues(_context: Context, _version: string, _instanceId: string): ParameterValues {
            throw new NotFoundError("Reading instance parameter values not supported")
        }
    }
}
