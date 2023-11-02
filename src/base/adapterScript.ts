import { VersionExtractor } from "."
import { ExaScriptsRow } from "../api"

export class AdapterScript {
    private script: ExaScriptsRow
    private versionExtractor: VersionExtractor
    constructor(script: ExaScriptsRow, versionExtractor: VersionExtractor) {
        this.script = script
        this.versionExtractor = versionExtractor
    }
    getVersion() {
        return this.versionExtractor(this.script.text)
    }
    get name() {
        return this.script.name
    }
}
