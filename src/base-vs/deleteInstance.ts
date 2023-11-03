import { JavaVirtualSchemaBaseExtension } from ".";
import { Context } from "../api";
import { convertInstanceIdToSchemaName, getConnectionName } from "./common";

export function deleteInstance(context: Context, extension: JavaVirtualSchemaBaseExtension, instanceId: string): void {
    const schemaName = convertInstanceIdToSchemaName(instanceId);
    context.sqlClient.execute(dropVirtualSchemaStatement(schemaName));
    context.sqlClient.execute(dropConnectionStatement(getConnectionName(schemaName)));
}

function dropVirtualSchemaStatement(schemaName: string): string {
    return `DROP VIRTUAL SCHEMA IF EXISTS "${schemaName}" CASCADE`;
}

function dropConnectionStatement(connectionName: string): string {
    return `DROP CONNECTION IF EXISTS "${connectionName}"`;
}
