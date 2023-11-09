import { JavaBaseExtension, ScriptDefinition } from ".";
import { Context } from "../context";

export function installExtension(context: Context, extension: JavaBaseExtension): void {
    const jarPath = context.bucketFs.resolvePath(extension.files[0].name);
    function qualifiedName(script: ScriptDefinition) {
        return `"${context.extensionSchemaName}"."${script.name}"`
    }

    function createScript(script: ScriptDefinition): string {
        let stmt = `CREATE OR REPLACE JAVA ${script.type} SCRIPT ${qualifiedName(script)}`
        if (script.type == "SCALAR" || script.type == "SET") {
            stmt += `(${script.parameters}) EMITS (${script.emitParameters})`
        }
        stmt += " AS\n"
        stmt += `    %scriptclass ${script.scriptClass};\n`
        stmt += `    %jar ${jarPath};`
        return stmt
    }

    function createComment(script: ScriptDefinition): string {
        return `COMMENT ON SCRIPT ${qualifiedName(script)} IS 'Created by Extension Manager for ${extension.name} ${extension.version}'`;
    }

    console.log(`Installing extension '${extension.name}' in version ${extension.version} with ${extension.scripts.length} scripts...`)
    extension.scripts.forEach(script => context.sqlClient.execute(createScript(script)));
    extension.scripts.forEach(script => context.sqlClient.execute(createComment(script)));
}
