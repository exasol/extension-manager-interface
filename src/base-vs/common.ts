function identity(arg: string): string {
    return arg;
}

export const convertInstanceIdToSchemaName = identity
export const convertSchemaNameToInstanceId = identity

export function getConnectionName(virtualSchemaName: string): string {
    return `${virtualSchemaName}_CONNECTION`;
}

export function escapeSingleQuotes(value: string): string {
    return value.replace(/'/g, "''")
}
