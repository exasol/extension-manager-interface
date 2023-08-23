import { VersionExtractor } from "."
import { ExaScriptsRow } from "../api"

export class AdapterScript {
    script: ExaScriptsRow
    versionExtractor: VersionExtractor
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
    get qualifiedName() {
        return `${this.script.schema}.${this.script.name}`
    }
    get schema() {
        return this.script.schema
    }
    get text() {
        return this.script.text
    }
}
