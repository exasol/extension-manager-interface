import { JavaBaseExtension, ScriptDefinition } from ".";
import { Context } from "../context";
import { BadRequestError } from "../error";


export function installExtension(context: Context, extension: JavaBaseExtension, versionToInstall: string): void {
    if (extension.version !== versionToInstall) {
        throw new BadRequestError(`Installing version '${versionToInstall}' not supported, try '${extension.version}'.`);
    }
    const jarPath = context.bucketFs.resolvePath(extension.file.name);

    function qualifiedName(script: ScriptDefinition) {
        return `"${context.extensionSchemaName}"."${script.name}"`
    }

    function createScript(script: ScriptDefinition): string {
        return `CREATE OR REPLACE JAVA ${script.type} SCRIPT ${qualifiedName(script)}(...) EMITS (${script.args}) AS
    %scriptclass ${script.scriptClass};
    %jar ${jarPath};`;
    }
    function createComment(script: ScriptDefinition): string {
        return `COMMENT ON SCRIPT ${qualifiedName(script)} IS 'Created by Extension Manager for ${extension.name} ${extension.version}'`;
    }

    extension.scripts.forEach(script => context.sqlClient.execute(createScript(script)));
    extension.scripts.forEach(script => context.sqlClient.execute(createComment(script)));
}
