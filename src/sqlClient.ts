/**
 * Simple SQL client.
 */
export interface SqlClient {

    /**
     * Runs a query that does not return rows, e.g. INSERT or UPDATE.
     * @param query sql query string
     * @param args query arguments
     */
    execute: (query: string, ...args: any[]) => void

    /**
     * Executes a query that returns rows, typically a SELECT.
     * @param query sql query string
     * @param args query arguments
     */
    query: (query: string, ...args: any[]) => QueryResult
}

export interface QueryResult {
    columns: Column[]
    rows: Row[]
}

export interface Column {
    name: string
    typeName: string
}
export type Row = any[]
