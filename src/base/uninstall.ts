import { JavaBaseExtension, ScriptDefinition } from ".";
import { Context } from "../context";
import { NotFoundError } from "../error";


export function uninstall(context: Context, extension: JavaBaseExtension, versionToUninstall: string): void {
    if (extension.version !== versionToUninstall) {
        throw new NotFoundError(`Uninstalling version '${versionToUninstall}' not supported, try '${extension.version}'.`)
    }

    function extensionSchemaExists(): boolean {
        const result = context.sqlClient.query("SELECT 1 FROM SYS.EXA_ALL_SCHEMAS WHERE SCHEMA_NAME=?", context.extensionSchemaName)
        return result.rows.length > 0
    }

    function qualifiedName(script: ScriptDefinition) {
        return `"${context.extensionSchemaName}"."${script.name}"`
    }

    if (extensionSchemaExists()) { // Drop commands fail when schema does not exist.
        extension.scripts.forEach(script =>
            context.sqlClient.execute(`DROP SCRIPT ${qualifiedName(script)}`)
        );
    }
}
