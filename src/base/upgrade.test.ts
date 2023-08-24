
import { beforeEach, describe, expect, it } from '@jest/globals';
import { PreconditionFailedError } from '../error';
import { ExaScriptsRow } from '../exasolSchema';
import { successResult } from './common';
import { ScriptDefinition, VersionExtractor, convertBaseExtension } from './index';
import { ContextMock, createMockContext, emptyBaseExtension } from './test-utils';

function def({ name = "name", type = "SET", args = "args", scriptClass = "script class" }: Partial<ScriptDefinition>): ScriptDefinition {
    return { name, type, args, scriptClass };
}

function script({ schema = "schema", name = "name", inputType, resultType = "EMITS", type = "UDF", text = "", comment }: Partial<ExaScriptsRow>): ExaScriptsRow {
    return { schema, name, inputType, resultType, type, text, comment }
}

const mockVersionExtractor: VersionExtractor = (adapterScriptText: string) => successResult(adapterScriptText);

describe("upgrade", () => {

    let context: ContextMock

    beforeEach(() => {
        context = createMockContext()
        context.mocks.sqlQuery.mockReturnValue({ columns: [], rows: [[1]] });
    })

    function upgrade(scripts?: ScriptDefinition[]) {
        const baseExtension = emptyBaseExtension()
        baseExtension.name = "test-ext"
        baseExtension.version = "v1"
        baseExtension.scripts = scripts || []
        baseExtension.scriptVersionExtractor = mockVersionExtractor
        return convertBaseExtension(baseExtension).upgrade(context);
    }

    it("no script", () => {
        expect(() => upgrade([])).toThrowError(new PreconditionFailedError("Failed to validate script versions: No script given"))
    })

    it("missing installed scripts", () => {
        context.mocks.simulateScripts([])
        expect(() => upgrade([def({ name: "SCRIPT_1", scriptClass: "com.example.Script" })]))
            .toThrowError(new PreconditionFailedError("Not all required scripts are installed: Validation failed: Script 'SCRIPT_1' is missing"))
    })

    it("inconsistent versions", () => {
        context.mocks.simulateScripts([script({ name: "SCRIPT_1", text: "v0.2" }), script({ name: "SCRIPT_2", text: "v0.1" })])
        expect(() => upgrade([def({ name: "SCRIPT_1" }), def({ name: "SCRIPT_2" })]))
            .toThrowError(new PreconditionFailedError("Failed to validate script versions: Not all scripts use the same version. Found 2 different versions: 'v0.2, v0.1'"))
    })

    it("already installed", () => {
        context.mocks.simulateScripts([script({ name: "SCRIPT_1", text: "v1" })])
        expect(() => upgrade([def({ name: "SCRIPT_1" })]))
            .toThrowError(new PreconditionFailedError("Extension is already installed in latest version v1"))
    })

    it("success", () => {
        context.mocks.simulateScripts([script({ name: "SCRIPT_1", text: "v0" })])
        expect(upgrade([def({ name: "SCRIPT_1", scriptClass: "com.example.Script" })])).toStrictEqual({ previousVersion: "v0", newVersion: "v1" })

        const executeCalls = context.mocks.sqlExecute.mock.calls
        expect(executeCalls.length).toBe(2)

        expect(executeCalls[0][0]).toBe(`CREATE OR REPLACE JAVA SET SCRIPT "ext-schema"."SCRIPT_1"(...) EMITS (args) AS
    %scriptclass com.example.Script;
    %jar /bucketfs/test-ext.jar;`)
        expect(executeCalls[1][0]).toBe(`COMMENT ON SCRIPT "ext-schema"."SCRIPT_1" IS 'Created by Extension Manager for test-ext v1'`)
    })
})
