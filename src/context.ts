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
}

export interface BucketFs {
    /**
     * Resolves the given filename to an absolute path in BucketFS that is accessible by UDFs.
     * 
     * @param fileName the filename to resolve
     * @returns the file's absolute path in BucketFS
     */
    resolvePath: (fileName: string) => string
}

