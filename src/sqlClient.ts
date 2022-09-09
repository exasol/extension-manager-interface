/**
 * Simple SQL client.
 */
 export interface SqlClient {

    /**
     * Runs a query that does not return rows, e.g. INSERT or UPDATE.
     * @param query sql query string
     */
    execute: (query: string) => void

    /**
     * Executes a query that returns rows, typically a SELECT.
     */
    query: (query: string) => Rows
}

export interface Rows{

}

