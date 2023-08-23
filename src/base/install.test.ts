
import { describe, expect, it } from '@jest/globals';
import { PreconditionFailedError } from '../error';
import { ScriptDefinition, createExtension } from './index';
import { ContextMock, createMockContext, emptyBaseExtension } from './test-utils';

function def({ name, type = "SET", args = "args", scriptClass = "script class" }: Partial<ScriptDefinition>): ScriptDefinition {
    return { name, type, args, scriptClass };
}

describe("install", () => {

    let context: ContextMock;

    function install(versionToInstall: string, scripts?: ScriptDefinition[]) {
        const baseExtension = emptyBaseExtension()
        baseExtension.name = "test-ext"
        baseExtension.version = "v1"
        baseExtension.scripts = scripts || []
        context = createMockContext();
        createExtension(baseExtension).install(context, versionToInstall);
    }

    it("no scripts", () => {
        install("v1")
        const executeCalls = context.mocks.sqlExecute.mock.calls
        expect(executeCalls.length).toBe(0)
    })

    it("single script", () => {
        install("v1", [def({ name: "SCRIPT_1", type: "SET", args: "SCRIPT_ARGS", scriptClass: "com.example.Script" })])
        const executeCalls = context.mocks.sqlExecute.mock.calls
        expect(executeCalls.length).toBe(2)

        expect(executeCalls[0][0]).toBe(`CREATE OR REPLACE JAVA SET SCRIPT "ext-schema"."SCRIPT_1"(...) EMITS (SCRIPT_ARGS) AS
    %scriptclass com.example.Script;
    %jar /bucketfs/test-ext.jar;`)
        expect(executeCalls[1][0]).toBe(`COMMENT ON SCRIPT \"ext-schema\".\"SCRIPT_1\" IS 'Created by Extension Manager for test-ext v1'`)
    })

    it("two scripts", () => {
        install("v1", [
            def({ name: "SCRIPT_1", type: "SET", args: "SCRIPT_ARGS", scriptClass: "com.example.Script1" }),
            def({ name: "SCRIPT_2", type: "SCALAR", args: "...", scriptClass: "com.example.Script2" })])
        const executeCalls = context.mocks.sqlExecute.mock.calls
        expect(executeCalls.length).toBe(4)

        expect(executeCalls[0][0]).toBe(`CREATE OR REPLACE JAVA SET SCRIPT "ext-schema"."SCRIPT_1"(...) EMITS (SCRIPT_ARGS) AS
    %scriptclass com.example.Script1;
    %jar /bucketfs/test-ext.jar;`)
        expect(executeCalls[1][0]).toBe(`CREATE OR REPLACE JAVA SCALAR SCRIPT "ext-schema"."SCRIPT_2"(...) EMITS (...) AS
    %scriptclass com.example.Script2;
    %jar /bucketfs/test-ext.jar;`)
        expect(executeCalls[2][0]).toBe(`COMMENT ON SCRIPT \"ext-schema\".\"SCRIPT_1\" IS 'Created by Extension Manager for test-ext v1'`)
        expect(executeCalls[3][0]).toBe(`COMMENT ON SCRIPT \"ext-schema\".\"SCRIPT_2\" IS 'Created by Extension Manager for test-ext v1'`)
    })

    it("fails for wrong version", () => {
        expect(() => { install("wrongVersion") })
            .toThrowError(new PreconditionFailedError(`Installing version 'wrongVersion' not supported, try 'v1'.`))
    })
})
