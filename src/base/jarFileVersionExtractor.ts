import { VersionExtractor } from "."
import { Result, failureResult, successResult } from "./common"

/**
 * Create a {@link VersionExtractor} that extracts the version from a JAR file.
 * @param jarNameVersionPattern a {@link RegExp} for the JAR file name, e.g. `/exasol-cloud-storage-extension-(\d+\.\d+\.\d+).jar/`
 * @returns a new version extractor
 */
export function jarFileVersionExtractor(jarNameVersionPattern: RegExp): VersionExtractor {
    return (adapterScriptText: string) => {
        return extractVersion(jarNameVersionPattern, adapterScriptText)
    }
}

const adapterScriptFileNamePattern = /.*%jar\s+[\w-/]+\/([^/]+.jar)\s*;.*/

function extractVersion(jarNameVersionPattern: RegExp, adapterScriptText: string): Result<string> {
    const jarNameMatch = adapterScriptFileNamePattern.exec(adapterScriptText)
    if (!jarNameMatch) {
        return failureResult(`Could not find jar filename in adapter script '${adapterScriptText}'`)
    }
    const jarFileName = jarNameMatch[1];
    const versionMatch = jarNameVersionPattern.exec(jarFileName)
    if (!versionMatch) {
        return failureResult(`Could not find version in jar file name '${jarFileName}'`)
    }
    return successResult(versionMatch[1])
}
