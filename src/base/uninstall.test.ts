
import { beforeEach, describe, expect, it } from '@jest/globals';
import { PreconditionFailedError } from '../error';
import { AdapterScriptDefinition, ScalarSetScriptDefinition, ScriptDefinition, convertBaseExtension } from './index';
import { ContextMock, createMockContext, emptyBaseExtension } from './test-utils';

function def({ name = "name", type = "SET", parameters = "param", emitParameters = "emitParam", scriptClass = "script class" }: Partial<ScalarSetScriptDefinition>): ScriptDefinition {
    return { name, type, parameters, emitParameters, scriptClass };
}

function adapterDef({ name = "name", scriptClass = "script class" }: Partial<AdapterScriptDefinition>): ScriptDefinition {
    return { name, type: 'ADAPTER', scriptClass };
}

describe("uninstall", () => {

    let context: ContextMock

    beforeEach(() => {
        context = createMockContext()
    })

    function uninstall(versionToUninstall: string, scripts?: ScriptDefinition[]) {
        const baseExtension = emptyBaseExtension()
        baseExtension.name = "test-ext"
        baseExtension.version = "v1"
        baseExtension.scripts = scripts || []
        convertBaseExtension(baseExtension).uninstall(context, versionToUninstall);
    }

    function simulateSchemaExists() {
        context.mocks.sqlQuery.mockReturnValue({ columns: [], rows: [[1]] });
    }

    function simulateSchemaDoesNotExist() {
        context.mocks.sqlQuery.mockReturnValue({ columns: [], rows: [] });
    }

    it("executes query to check if schema exists", () => {
        simulateSchemaDoesNotExist()
        uninstall("v1")
        const calls = context.mocks.sqlQuery.mock.calls
        expect(calls.length).toEqual(1)
        expect(calls[0]).toEqual(["SELECT 1 FROM SYS.EXA_ALL_SCHEMAS WHERE SCHEMA_NAME=?", "ext-schema"])
    })

    it("skips drop statements when schema does not exist", () => {
        simulateSchemaDoesNotExist()
        uninstall("v1", [def({ name: "SCRIPT1" })])
        expect(context.mocks.sqlExecute.mock.calls.length).toEqual(0)
    })

    it("does nothing for no scripts", () => {
        simulateSchemaExists()
        uninstall("v1")
        const executeCalls = context.mocks.sqlExecute.mock.calls
        expect(executeCalls.length).toBe(0)
    })

    describe("executes expected statements", () => {
        const tests: { name: string, script: ScriptDefinition, expectedDropStatement: string }[] = [
            { name: "set script", script: def({ name: "SCRIPT1", type: "SET" }), expectedDropStatement: `DROP SCRIPT "ext-schema"."SCRIPT1"` },
            { name: "scalar script", script: def({ name: "SCRIPT1", type: "SCALAR" }), expectedDropStatement: `DROP SCRIPT "ext-schema"."SCRIPT1"` },
            { name: "adapter script", script: adapterDef({ name: "SCRIPT1" }), expectedDropStatement: `DROP ADAPTER SCRIPT "ext-schema"."SCRIPT1"` },
        ]

        tests.forEach(test => it(test.name, () => {
            simulateSchemaExists()
            uninstall("v1", [test.script])
            const calls = context.mocks.sqlExecute.mock.calls
            expect(calls.length).toEqual(1)
            expect(calls[0]).toEqual([test.expectedDropStatement])
        }))
    })

    it("executes expected statements for two scripts", () => {
        simulateSchemaExists()
        uninstall("v1", [def({ name: "SCRIPT1" }), def({ name: "SCRIPT2" })])
        const calls = context.mocks.sqlExecute.mock.calls
        expect(calls.length).toEqual(2)
        expect(calls[0]).toEqual([`DROP SCRIPT "ext-schema"."SCRIPT1"`])
        expect(calls[1]).toEqual([`DROP SCRIPT "ext-schema"."SCRIPT2"`])
    })

    it("fails for wrong version", () => {
        expect(() => { uninstall("wrongVersion") })
            .toThrowError(new PreconditionFailedError(`Uninstalling version 'wrongVersion' not supported, try 'v1'.`))
    })
})
