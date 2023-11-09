import { BucketFSUpload, Context, ExaMetadata, ExasolExtension, Instance, NotFoundError, Parameter, ParameterValues } from "../api";
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
    /** Script type */
    type: "ADAPTER"
    /** Script Java class name, e.g. "com.exasol.adapter.document.UdfEntryPoint" */
    scriptClass: string
}

/**
 * Describes a JAR file in BucketFS that the extensions needs to work. These files will be added to the classpath of all `SCRIPT`s using the `%jar` directive.
 * 
 * If not all required JARs are present in BucketFS and have the expected size, Extension Manager will ignore the extension and it won't be available for users.
 */
export interface RequiredJar {
    /** File name, e.g. `document-files-virtual-schema-dist-7.3.6-s3-2.8.3.jar` */
    name: string
    /**
     * Expected file size. Omit this or set it to `undefined` to let Extension Manager ignore the size.
     * 
     * This is useful for JDBC drivers where the version and file size is not known at build time and may change, e.g. when the user updates to a newer version.
     */
    size?: number
}

/**
 * Simplified version of an {@link ExasolExtension} specifically for Java based extensions.
 * Use function {@link convertBaseExtension} to convert this to a {@link ExasolExtension}.
 */
export interface JavaBaseExtension {
    /** Readable extension name, e.g. `S3 Virtual Schema` */
    name: string
    /** Extension description, e.g. `Virtual Schema for document files on AWS S3` */
    description: string
    /** Extension category, e.g. `document-virtual-schema`, `jdbc-virtual-schema`, ... */
    category: string
    /** Current extension version, e.g. `1.2.3` */
    version: string
    /** Required JAR files in BucketFS */
    files: RequiredJar[]
    /**
     * Script definitions (e.g. `ADAPTER SCRIPT`, `SET SCRIPT` or `SCALAR SCRIPT`) for this extension.
     * 
     * The required files will be added using `%jar` directives.
     */
    scripts: ScriptDefinition[]
    /** Extracts the version number from the `SCRIPT` text. A possible implementation is {@link jarFileVersionExtractor}. */
    scriptVersionExtractor: VersionExtractor
}

/**
 * Extracts the version number from a `SCRIPT`'s text, e.g. by parsing the version number in the JAR file name.
 * 
 * The extension uses this to determine the actual version of an installed `SCRIPT`.
 */
export type VersionExtractor = (adapterScriptText: string) => Result<string>
export { jarFileVersionExtractor } from './jarFileVersionExtractor';

/**
 * Converts a simplified Java `SCRIPT` based extension definition to a {@link ExasolExtension}.
 * @param baseExtension simple extension definition.
 * @returns a {@link ExasolExtension}
 */
export function convertBaseExtension(baseExtension: JavaBaseExtension): ExasolExtension {
    function verifyVersion(version: string) {
        if (baseExtension.version !== version) {
            throw new NotFoundError(`Version '${version}' not supported, can only use '${baseExtension.version}'.`)
        }
    }
    function createBucketFsUpload(file: RequiredJar): BucketFSUpload {
        return {
            bucketFsFilename: file.name,
            fileSize: file.size ?? -1,
            name: file.name
        }
    }

    return {
        name: baseExtension.name,
        description: baseExtension.description,
        category: baseExtension.category,
        installableVersions: [{ name: baseExtension.version, latest: true, deprecated: false }],
        bucketFsUploads: baseExtension.files.map(createBucketFsUpload),
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
