
import { beforeEach, describe, expect, it } from '@jest/globals';
import { PreconditionFailedError } from '../error';
import { ScriptDefinition, createExtension } from './index';
import { ContextMock, createMockContext, emptyBaseExtension } from './test-utils';

function def({ name, type = "SET", args = "args", scriptClass = "script class" }: Partial<ScriptDefinition>): ScriptDefinition {
    return { name, type, args, scriptClass };
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
        createExtension(baseExtension).uninstall(context, versionToUninstall);
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

    it("executes expected statements for single script", () => {
        simulateSchemaExists()
        uninstall("v1", [def({ name: "SCRIPT1" })])
        const calls = context.mocks.sqlExecute.mock.calls
        expect(calls.length).toEqual(1)
        expect(calls[0]).toEqual([`DROP SCRIPT "ext-schema"."SCRIPT1"`])
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
