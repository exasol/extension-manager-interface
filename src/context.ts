import { ExaScriptsRow } from "./exasolSchema"
import { SqlClient } from "./sqlClient"

/**
 * This interface represents the context of the extension manager with useful information for the extensions.
 */
export interface Context {
    /**
     * The name of the schema in which extensions should be installed.
     */
    extensionSchemaName: string

    /**
     * An SQL client for executing queries and statements.
     */
    sqlClient: SqlClient

    /**
     * An object providing BucketFS related methods.
     */
    bucketFs: BucketFs

    /**
     * An object giving access to Exasol metadata tables.
     */
    metadata: ExaMetadataService
}

export interface BucketFs {
    /**
     * Resolves the given filename to an absolute path in BucketFS that is accessible by UDFs.
     * 
     * @param fileName the filename to resolve
     * @returns the file's absolute path in BucketFS
     * @throws an error if no file with this name exists
     */
    resolvePath: (fileName: string) => string
}

/**
 * An interface that allows retrieving data from Exasol metadata tables.
 */
export interface ExaMetadataService {
    /**
     * Read an entry from the `SYS.EXA_ALL_SCRIPTS` table.
     * 
     * This finds only scripts in the extension schema.
     * @param scriptName the name of the script
     * @returns the table row or `null` if no script exists with the given name
     */
    getScriptByName(scriptName: string): ExaScriptsRow | null
}