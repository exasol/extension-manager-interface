
import { JavaBaseExtension } from ".";
import { PreconditionFailedError, UpgradeResult } from "../api";
import { Context } from "../context";
import { installExtension } from "./install";
import { validateInstalledScripts, validateVersions } from "./validateScripts";

/**
 * Assertion and filter function to verify a value is really defined and not {@code undefined} or {@code null}.
 * @param value the value to check
 * @returns {@code true} if the value is not null or undefined.
 */
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}

export function upgrade(context: Context, extension: JavaBaseExtension): UpgradeResult {
    const scriptList = Object.entries(extension.scripts).map(([_key, value]) => value.name)
        .map(scriptName => context.metadata.getScriptByName(scriptName))
        .filter(notEmpty);

    const installedScripts = validateInstalledScripts(scriptList, extension.scripts, extension.scriptVersionExtractor)
    if (installedScripts.type === "failure") {
        throw new PreconditionFailedError(`Not all required scripts are installed: ${installedScripts.message}`)
    }
    const previousVersion = validateVersions(installedScripts.result)
    if (previousVersion.type === "failure") {
        throw new PreconditionFailedError(`Failed to validate script versions: ${previousVersion.message}`)
    }
    const newVersion = extension.version
    if (previousVersion.result === newVersion) {
        throw new PreconditionFailedError(`Extension is already installed in latest version ${newVersion}`)
    }
    installExtension(context, extension, newVersion)
    return { previousVersion: previousVersion.result, newVersion };
}
