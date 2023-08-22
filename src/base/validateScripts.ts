import { ExaScriptsRow } from "../exasolSchema";
import { AdapterScript, VersionExtractor } from "./adapterScript";
import { Result, failureResult, successResult } from "./common";
import { ScriptDefinition } from "./index";


export type InstalledScripts = Map<string, AdapterScript>


function createMap(scripts: ExaScriptsRow[], versionExtractor: VersionExtractor): Map<string, AdapterScript> {
    const map = new Map<string, AdapterScript>();
    scripts.forEach(script => {
        map.set(script.name, new AdapterScript(script, versionExtractor))
    });
    return map;
}

function validateScript(expectedScript: ScriptDefinition, actualScript: AdapterScript | undefined): string[] {
    if (actualScript == undefined) {
        return [`Script '${expectedScript.name}' is missing`]
    }
    return []
}

/**
 * Validate that all required scripts are installed.
 * @param scriptRows list of all installed scripts
 * @returns a successful or a failed {@link Result} with all installed scripts
 */
export function validateInstalledScripts(scriptRows: ExaScriptsRow[], expectedScripts: ScriptDefinition[], versionExtractor: VersionExtractor): Result<InstalledScripts> {
    const allScripts = createMap(scriptRows, versionExtractor)
    const validationErrors = expectedScripts.map(script => validateScript(script, allScripts.get(script.name)))
        .flatMap(finding => finding);
    if (validationErrors.length > 0) {
        return failureResult(`Validation failed: ${validationErrors.join(', ')}`)
    }
    return successResult(findRequiredScripts(expectedScripts, allScripts))
}


function findRequiredScripts(expectedScripts: ScriptDefinition[], allScripts: Map<string, AdapterScript>) {
    const selectedScripts = new Map();
    expectedScripts.forEach(definition => {
        const script = allScripts.get(definition.name);
        selectedScripts.set(script.name, script);
    });
    return selectedScripts;
}

/**
 * Verify that all scripts have the same version.
 * @param scripts installed scripts
 * @returns a failure {@link Result} if not all scripts have the same version, else a successful {@link Result} with the common version.
 */
export function validateVersions(scripts: InstalledScripts): Result<string> {
    if (scripts.size === 0) {
        return failureResult(`No script given`)
    }
    const versionSet = new Set<string>()
    const errors: string[] = []
    scripts.forEach((script, scriptName) => {
        const result = script.getVersion()
        if (result.type === "success") {
            versionSet.add(result.result)
        } else {
            errors.push(`Script '${scriptName}': ${result.message}`)
        }
    })

    if (errors.length > 0) {
        return failureResult(`Failed to get versions: ${errors.join(', ')}`)
    }

    const versions: string[] = []
    versionSet.forEach(value => versions.push(value))
    if (versions.length === 1) {
        return successResult(versions[0])
    }
    return failureResult(`Not all scripts use the same version. Found ${versions.length} different versions: '${versions.join(', ')}'`)
}
