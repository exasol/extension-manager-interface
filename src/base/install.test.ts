
import { describe, expect, it } from '@jest/globals';
import { PreconditionFailedError } from '../error';
import { RequiredJar, ScriptDefinition, convertBaseExtension } from './index';
import { ContextMock, createMockContext, emptyBaseExtension } from './test-utils';


describe("install", () => {

    let context: ContextMock;

    function getExecutedSql(i: number): string {
        const calls = context.mocks.sqlExecute.mock.calls
        expect(calls.length).toBeGreaterThan(i)
        const args = calls[i]
        expect(args).toHaveLength(1)
        return args[0]
    }

    function install(versionToInstall: string, scripts?: ScriptDefinition[], files?: RequiredJar[]) {
        const baseExtension = emptyBaseExtension()
        baseExtension.name = "test-ext"
        baseExtension.version = "v1"
        baseExtension.scripts = scripts || []
        baseExtension.files = files ?? [{ name: "test-ext.jar", size: 12345 }]
        context = createMockContext();
        convertBaseExtension(baseExtension).install(context, versionToInstall);
    }

    it("no scripts", () => {
        install("v1")
        const executeCalls = context.mocks.sqlExecute.mock.calls
        expect(executeCalls.length).toBe(0)
    })

    it("creates comment", () => {
        install("v1", [{ name: "SCRIPT_1", type: "SET", parameters: "param", emitParameters: "emitParam", scriptClass: "com.example.Script" }])
        expect(getExecutedSql(1)).toBe(`COMMENT ON SCRIPT "ext-schema"."SCRIPT_1" IS 'Created by Extension Manager for test-ext v1'`)
    })

    it("creates a set script", () => {
        install("v1", [{ name: "SCRIPT_1", type: "SET", parameters: "param", emitParameters: "emitParam", scriptClass: "com.example.Script" }])
        expect(getExecutedSql(0)).toBe(`CREATE OR REPLACE JAVA SET SCRIPT "ext-schema"."SCRIPT_1"(param) EMITS (emitParam) AS
    %scriptclass com.example.Script;
    %jar /bucketfs/test-ext.jar;`)
    })

    it("creates a scalar script", () => {
        install("v1", [{ name: "SCRIPT_1", type: "SCALAR", parameters: "...", emitParameters: "emitArgs", scriptClass: "com.example.Script" }])
        expect(getExecutedSql(0)).toBe(`CREATE OR REPLACE JAVA SCALAR SCRIPT "ext-schema"."SCRIPT_1"(...) EMITS (emitArgs) AS
    %scriptclass com.example.Script;
    %jar /bucketfs/test-ext.jar;`)
    })

    it("creates an adapter script", () => {
        install("v1", [{ name: "SCRIPT_1", type: "ADAPTER", scriptClass: "com.example.Script" }])
        expect(getExecutedSql(0)).toBe(`CREATE OR REPLACE JAVA ADAPTER SCRIPT "ext-schema"."SCRIPT_1" AS
    %scriptclass com.example.Script;
    %jar /bucketfs/test-ext.jar;`)
    })

    it("creates a script with a single JAR", () => {
        install("v1", [{ name: "SCRIPT_1", type: "ADAPTER", scriptClass: "com.example.Script" }])
        expect(getExecutedSql(0)).toBe(`CREATE OR REPLACE JAVA ADAPTER SCRIPT "ext-schema"."SCRIPT_1" AS
    %scriptclass com.example.Script;
    %jar /bucketfs/test-ext.jar;`)
    })

    it("creates a script with two JARs", () => {
        install("v1", [{ name: "SCRIPT_1", type: "ADAPTER", scriptClass: "com.example.Script" }], [{ name: "file1.jar" }, { name: "file2.jar" }])
        expect(getExecutedSql(0)).toBe(`CREATE OR REPLACE JAVA ADAPTER SCRIPT "ext-schema"."SCRIPT_1" AS
    %scriptclass com.example.Script;
    %jar /bucketfs/file1.jar;
    %jar /bucketfs/file2.jar;`)
    })

    it("two scripts", () => {
        install("v1", [
            { name: "SCRIPT_1", type: "SET", parameters: "param", emitParameters: "emitParam", scriptClass: "com.example.Script1" },
            { name: "SCRIPT_2", type: "SCALAR", parameters: "...", emitParameters: "...", scriptClass: "com.example.Script2" }])
        const executeCalls = context.mocks.sqlExecute.mock.calls
        expect(executeCalls.length).toBe(4)

        expect(getExecutedSql(0)).toBe(`CREATE OR REPLACE JAVA SET SCRIPT "ext-schema"."SCRIPT_1"(param) EMITS (emitParam) AS
    %scriptclass com.example.Script1;
    %jar /bucketfs/test-ext.jar;`)
        expect(getExecutedSql(1)).toBe(`CREATE OR REPLACE JAVA SCALAR SCRIPT "ext-schema"."SCRIPT_2"(...) EMITS (...) AS
    %scriptclass com.example.Script2;
    %jar /bucketfs/test-ext.jar;`)
        expect(getExecutedSql(2)).toBe(`COMMENT ON SCRIPT "ext-schema"."SCRIPT_1" IS 'Created by Extension Manager for test-ext v1'`)
        expect(getExecutedSql(3)).toBe(`COMMENT ON SCRIPT "ext-schema"."SCRIPT_2" IS 'Created by Extension Manager for test-ext v1'`)
    })

    it("two scripts with two JARs", () => {
        install("v1", [
            { name: "SCRIPT_1", type: "SET", parameters: "param", emitParameters: "emitParam", scriptClass: "com.example.Script1" },
            { name: "SCRIPT_2", type: "SCALAR", parameters: "...", emitParameters: "...", scriptClass: "com.example.Script2" }],
            [{ name: "file1.jar" }, { name: "file2.jar" }])
        const executeCalls = context.mocks.sqlExecute.mock.calls
        expect(executeCalls.length).toBe(4)

        expect(getExecutedSql(0)).toBe(`CREATE OR REPLACE JAVA SET SCRIPT "ext-schema"."SCRIPT_1"(param) EMITS (emitParam) AS
    %scriptclass com.example.Script1;
    %jar /bucketfs/file1.jar;
    %jar /bucketfs/file2.jar;`)
        expect(getExecutedSql(1)).toBe(`CREATE OR REPLACE JAVA SCALAR SCRIPT "ext-schema"."SCRIPT_2"(...) EMITS (...) AS
    %scriptclass com.example.Script2;
    %jar /bucketfs/file1.jar;
    %jar /bucketfs/file2.jar;`)
    })

    it("fails for wrong version", () => {
        expect(() => { install("wrongVersion") })
            .toThrowError(new PreconditionFailedError(`Version 'wrongVersion' not supported, can only use 'v1'.`))
    })
})
