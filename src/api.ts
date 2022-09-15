import { Context } from "./context";
import { ExaMetadata } from "./exasolSchema";
import { Parameter } from "./parameters";

export const CURRENT_API_VERSION = "0.1.15";

/**
 * This class represents an extension that can be installed with the extension-manager.
 *
 * Wondering why we picked TypeScript as an interface? Check the design.md / Extension API
 */
export interface ExasolExtension {
    /** Name of the extension */
    name: string;
    /** Description of the extension */
    description: string;
    /** Files that this extension requires in BucketFS. */
    bucketFsUploads?: BucketFSUpload[];

    /** List of versions that this installer can install. */
    installableVersions: string[]

    /**
     * Install this extension.
     *
     * Installing means creating the adapter scripts / UDF definitions.
     *
     * @param context the extension manager context
     * @param version the version to install
     */
    install: (context: Context, version: string) => void

    /**
     * Find installations of this extension independent of the version.
     *
     * This method can access the database and detect installations using the sqlClient. But if every extension does this requests will get quite slow.
     * For that reason this method also takes metadata (the contents of Exasol metadata tables).
     * By that in default case it does not need to run SQL queries and can just check the table data which is a lot faster.
     *
     * @param context the extension manager context
     * @param metadata contents of Exasol metadata tables
     * @returns found installations
     */
    findInstallations: (context: Context, metadata: ExaMetadata) => Installation[]

    /**
     * Uninstall this extension, deleting adapter scripts, UDF definitions etc.
     *
     * This method does not delete the instances first. The caller must take care of this.
     *
     * @param context the extension manager context
     * @param version the version to uninstall
     * @throws {@link BadRequestError} if there are still instances of this extension.
     */
    uninstall: (context: Context, version: string) => void

    /**
     * Add an instance of this extension
     *
     * An instance of an extension is for example a Virtual Schema.
     *
     * @param context the extension manager context
     * @param version the version of the extension for which to add an instance
     * @param params parameter values
     * @returns newly created instance
     * @throws {@link BadRequestError} if an unsupported version was specified.
     */
    addInstance: (context: Context, version: string, params: ParameterValues) => Instance

    /**
     * Find all instances of this extension.
     *
     * @param context the extension manager context
     * @param version version of this extension for which to find instances
     * @returns found instances
     */
    findInstances: (context: Context, version: string) => Instance[]

    /**
     * Get the parameter definitions for creating an instance of this version.
     * 
     * @param context the extension manager context
     * @param version version of this extension for which to get the parameters
     * @returns the parameter definitions
     */
    getInstanceParameters: (context: Context, version: string) => Parameter[]

    /**
     * Read the parameter values of an instance.
     *
     * @param context the extension manager context
     * @param instanceId the ID of the instance to delete, see {@link Instance#id} and {@link findInstances}.
     * @returns parameter values
     */
    readInstanceParameterValues: (context: Context, instanceId: string) => ParameterValues

    /**
     * Delete an instance.
     *
     * @param context the extension manager context
     * @param extensionVersion version of this extension for which to delete the instance
     * @param instanceId the ID of the instance to delete, see {@link Instance#id} and {@link findInstances}.
     */
    deleteInstance: (context: Context, extensionVersion: string, instanceId: string) => void
}

/**
 * Reference to an installation of this extension.
 */
export interface Installation {
    /** Name of this installation. Usually this is something like the name of the adapter script that helps to find the installation via SQL. */
    name: string
    /** Extension version of this installation. */
    version: string
}

/**
 * Reference to an instance of this extension.
 */
export interface Instance {
    /** ID of the instance. This is intended as an internal ID that is not displayed to the user. */
    id: string
    /** Name of the instance. Usually it's the name of the virtual schema. This is intended for displaying to the user. */
    name: string
}

/**
 * Contains a list of parameters.
 */
export interface ParameterValues {
    values: ParameterValue[]
}

/**
 * A parameter value with name and value.
 */
export interface ParameterValue {
    name: string
    value: string
}

/**
 * Description of a file that needs to be uploaded to BucketFS.
 */
export interface BucketFSUpload {
    /** Human-readable name or short description of the file */
    name: string
    downloadUrl: string
    licenseUrl: string
    /** Default: false */
    licenseAgreementRequired?: boolean
    bucketFsFilename: string
    /** File size in bytes */
    fileSize: number
}

/**
 * This method registers an extension at the GO JS runtime.
 *
 * @param extensionToRegister extension to register
 */
export function registerExtension(extensionToRegister: ExasolExtension): void {
    /* eslint @typescript-eslint/ban-ts-comment: "off" -- @ts-ignore is required to allow a global variable */
    // @ts-ignore // this is a global variable defined in the nested JS VM in the backend
    global.installedExtension = {
        extension: extensionToRegister,
        apiVersion: CURRENT_API_VERSION
    };
}

// Re-export interfaces
export * from "./context";
export * from "./error";
export * from "./exasolSchema";
export * from "./parameters";
export * from "./sqlClient";

