import { ExaMetadata } from "./exasolSchema";
import { Parameter } from "./parameters";

export const CURRENT_API_VERSION = "0.1.7";

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
     * @param sqlClient client for running SQL queries
     */
    install: (sqlClient: SqlClient) => void

    /**
     * Find installations of this extension independent of the version.
     *
     * This method can access the database and detect installations using the sqlClient. But if every extension does this requests will get quite slow.
     * For that reason this method also takes metadata (the contents of Exasol metadata tables).
     * By that in default case it does not need to run SQL queries and can just check the table data which is a lot faster.
     *
     * @param sqlClient client for running SQL queries
     * @param metadata contents of Exasol metadata table
     * @returns found installations
     */
    findInstallations: (sqlClient: SqlClient, metadata: ExaMetadata) => Installation[]

    /**
     * Uninstall this extension. (Delete adapter scripts / udf definitions)
     *
     * This method does not delete the instances first. The caller takes care of this.
     *
     * @param installation installation to uninstall
     * @param sqlClient client for running SQL queries
     */
    uninstall: (installation: Installation, sqlClient: SqlClient) => void

    /**
     * Add an instance of this extension
     *
     * An instance of an extension is for example a Virtual Schema.
     *
     * @param installation installation
     * @param params parameter values
     * @param sqlClient client for running SQL queries
     * @returns newly created instance
     */
    addInstance: (installation: Installation, params: ParameterValues, sqlClient: SqlClient) => Instance

    /**
     * Find instances of this extension.
     *
     * @param installation installation
     * @param sqlClient client for running SQL queries
     * @returns found instances
     */
    findInstances: (installation: Installation, sqlClient: SqlClient) => Instance[]

    /**
     * Read the parameter values of an instance.
     *
     * @param installation installation
     * @param instance instance
     * @param sqlClient client for running SQL queries
     * @returns parameter values
     */
    readInstanceParameters: (installation: Installation, instance: Instance, sqlClient: SqlClient) => ParameterValues

    /**
     * Delete an instance.
     *
     * @param installation installation
     * @param instance instance to delete
     * @param sqlClient client for running SQL queries
     */
    deleteInstance: (installation: Installation, instance: Instance, sqlClient: SqlClient) => void
}

/**
 * Reference to an installation of this extension.
 */
export interface Installation {
    /** Name of this installation. Usually this is something like the name of the adapter script that helps to find the installation via SQL.*/
    name: string
    /** Extension version of this installation. */
    version: string
    /**
     * Parameter definitions for creating an instance of this installation.
     *
     * The parameters must be declared here per installation since they can differ between versions.
     */
    instanceParameters: Parameter[]
}

/**
 * Reference to an instance of this extension.
 */
export interface Instance {
    /** Name of the instance. Usually it's the name of the virtual schema. */
    name: string
}

/**
 * Map of parameter name -> parameter value.
 */
export interface ParameterValues {
    [index: string]: string;
}

/**
 * Simple SQL client.
 */
export interface SqlClient {
    /**
     * Run a SQL query.
     * @param query sql query string
     */
    runQuery: (query: string) => void
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
    // @ts-ignore // this is a global variable defined in the nested JS VM in the backend
    global.installedExtension = {
        extension: extensionToRegister,
        apiVersion: CURRENT_API_VERSION
    };
}

// Re-export interfaces
export { ExaMetadata };
