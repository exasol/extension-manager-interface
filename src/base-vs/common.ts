function identity(arg: string): string {
    return arg;
}

export const convertInstanceIdToSchemaName = identity
export const convertSchemaNameToInstanceId = identity

/**
 * Get the connection name for a virtual schema. Connection names are case-insensitive in Exasol
 * (see [`CREATE CONNECTION` documentation](https://docs.exasol.com/db/latest/sql/create_connection.htm)),
 * so we convert the name to uppercase.
 * @param virtualSchemaName  name of the virtual schema
 * @returns connection name
 */
export function getConnectionName(virtualSchemaName: string): string {
    return `${virtualSchemaName.toUpperCase()}_CONNECTION`;
}

export function escapeSingleQuotes(value: string): string {
    return value.replace(/'/g, "''")
}
