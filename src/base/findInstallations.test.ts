
import { describe, expect, it } from '@jest/globals';
import { ScalarSetScriptDefinition, ScriptDefinition, VersionExtractor, convertBaseExtension } from '.';
import { Installation } from '../api';
import { PreconditionFailedError } from '../error';
import { ExaMetadata, ExaScriptsRow } from '../exasolSchema';
import { failureResult, successResult } from './common';
import { createMockContext, emptyBaseExtension } from './test-utils';

const mockVersionExtractor: VersionExtractor = (adapterScriptText: string) => successResult(adapterScriptText);
const failingVersionExtractor: (failureMessage: string) => VersionExtractor = (failureMessage: string) => (_adapterScriptText: string) => failureResult(failureMessage);

function script({ schema = "schema", name = "name", inputType, resultType = "EMITS", type = "UDF", text = "", comment }: Partial<ExaScriptsRow>): ExaScriptsRow {
    return { schema, name, inputType, resultType, type, text, comment }
}
function def({ name = "name", type = "SET", parameters = "param", emitParameters = "emitParam", scriptClass = "script class" }: Partial<ScalarSetScriptDefinition>): ScriptDefinition {
    return { name, type, parameters, emitParameters, scriptClass };
}

function findInstallations(allScripts: ExaScriptsRow[], scriptDefinitions: ScriptDefinition[], versionExtractor: VersionExtractor): Installation[] {
    const metadata: ExaMetadata = {
        allScripts: { rows: allScripts },
        virtualSchemaProperties: { rows: [] },
        virtualSchemas: { rows: [] }
    }
    const baseExtension = emptyBaseExtension()
    baseExtension.scriptVersionExtractor = versionExtractor
    baseExtension.scripts = scriptDefinitions
    baseExtension.name = "testing-extension"
    const installations = convertBaseExtension(baseExtension).findInstallations(createMockContext(), metadata)
    expect(installations).toBeDefined()
    return installations
}

describe("findInstallations", () => {
    it("no script found", () => {
        expect(findInstallations([], [], mockVersionExtractor)).toStrictEqual([])
    })
    it("required script not found", () => {
        expect(findInstallations([script({ name: "s1" })], [def({ name: "s2" })], mockVersionExtractor)).toStrictEqual([])
    })
    it("invalid version", () => {
        expect(() => findInstallations([script({ name: "s1" })], [def({ name: "s1" })], failingVersionExtractor("mock error")))
            .toThrowError(new PreconditionFailedError("Failed to get versions: Script 's1': mock error"))
    })
    it("script found", () => {
        expect(findInstallations([script({ name: "s1", text: "v1" })], [def({ name: "s1" })], mockVersionExtractor))
            .toStrictEqual([{ name: "testing-extension", version: "v1" }])
    })
})
