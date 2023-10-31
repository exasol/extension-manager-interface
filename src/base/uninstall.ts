import { JavaBaseExtension, ScriptDefinition } from ".";
import { Context } from "../context";
import { NotFoundError } from "../error";


export function uninstall(context: Context, extension: JavaBaseExtension): void {
    function extensionSchemaExists(): boolean {
        const result = context.sqlClient.query("SELECT 1 FROM SYS.EXA_ALL_SCHEMAS WHERE SCHEMA_NAME=?", context.extensionSchemaName)
        return result.rows.length > 0
    }

    function qualifiedName(script: ScriptDefinition) {
        return `"${context.extensionSchemaName}"."${script.name}"`
    }

    function getDropScriptStatement(script: ScriptDefinition): string {
        if (script.type === "ADAPTER") {
            return `DROP ADAPTER SCRIPT ${qualifiedName(script)}`
        } else {
            return `DROP SCRIPT ${qualifiedName(script)}`
        }
    }

    if (extensionSchemaExists()) { // Drop commands fail when schema does not exist.
        extension.scripts.forEach(script =>
            context.sqlClient.execute(getDropScriptStatement(script))
        );
    }
}
