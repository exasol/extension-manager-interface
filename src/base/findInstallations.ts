import { JavaBaseExtension } from ".";
import { ExaScriptsRow, Installation, PreconditionFailedError } from "../api";
import { validateInstalledScripts, validateVersions } from "./validateScripts";

export function findInstallations(scripts: ExaScriptsRow[], baseExtension: JavaBaseExtension): Installation[] {
    const result = validateInstalledScripts(scripts, baseExtension.scripts, baseExtension.scriptVersionExtractor)
    if (result.type !== "success") {
        console.warn(result.message)
        return [];
    }
    if (result.result.size === 0) {
        console.info("No scripts found")
        return [];
    }
    const versionResult = validateVersions(result.result)
    if (versionResult.type !== "success") {
        throw new PreconditionFailedError(versionResult.message)
    }
    return [{ name: baseExtension.name, version: versionResult.result }];
}
