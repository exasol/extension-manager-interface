
import { beforeEach, describe, expect, it } from '@jest/globals';
import { ConnectionParameterDefinition, convertVirtualSchemaBaseExtension, createJsonConnectionDefinition, createUserPasswordConnectionDefinition, createVirtualSchemaBuilder } from '.';
import { BadRequestError, Instance, Parameter, ParameterValue, Row } from '../api';
import { ContextMock, createMockContext } from '../base/test-utils';
import { emptyBaseVsExtension, param, vsNameParam } from './test-vs-utils';

let context: ContextMock = undefined

beforeEach(() => {
    context = createMockContext();
    mockSqlQueryResult([]);
});

function addInstance(paramValues: ParameterValue[], version: string, virtualSchemaParameterDefs: Parameter[], connectionParameterDefs: Parameter[]): Instance {
    return addInstanceWithConnectionDef(paramValues, version, virtualSchemaParameterDefs, createJsonConnectionDefinition(connectionParameterDefs))
}
function addInstanceWithUserPasswordConnection(paramValues: ParameterValue[], version: string, virtualSchemaParameterDefs: Parameter[], addressParam: Parameter = undefined, userParam: Parameter = undefined, passwordParam: Parameter = undefined): Instance {
    return addInstanceWithConnectionDef(paramValues, version, virtualSchemaParameterDefs, createUserPasswordConnectionDefinition(addressParam, userParam, passwordParam))
}
function addInstanceWithConnectionDef(paramValues: ParameterValue[], version: string, virtualSchemaParameterDefs: Parameter[], connectionDefinition: ConnectionParameterDefinition): Instance {
    const baseExtension = emptyBaseVsExtension()
    baseExtension.name = "testing-extension"
    baseExtension.builder = createVirtualSchemaBuilder({
        connectionNameProperty: "CONNECTION_NAME",
        virtualSchemaParameters: virtualSchemaParameterDefs,
        connectionDefinition
    })
    const installations = convertVirtualSchemaBaseExtension(baseExtension).addInstance(context, version, { values: paramValues })
    expect(installations).toBeDefined()
    return installations
}

function mockSqlQueryResult(sqlQueryRows: Row[]) {
    context.mocks.sqlQuery.mockReturnValue({ columns: [], rows: sqlQueryRows });
}

function getStatement(index: number): string {
    const sqlStatements = context.mocks.sqlExecute.mock.calls
    expect(sqlStatements).toHaveLength(4)
    expect(sqlStatements[index]).toHaveLength(1)
    const stmt = sqlStatements[index][0];
    expect(stmt).toBeDefined()
    return stmt
}

function getCreateConnectionStatement(): string {
    return getStatement(0)
}

function getCreateVirtualSchemaStatement(): string {
    return getStatement(1)
}

describe("addInstance()", () => {
    it("fails for wrong version", () => {
        expect(() => addInstance([], "wrongVersion", [], [])).toThrow("Version 'wrongVersion' not supported, can only use 'v0'.")
    })
    describe("checks if a virtual schema with the same name already exists", () => {
        it("fails for existing instance", () => {
            mockSqlQueryResult([["new_vs"]]);
            expect(() => addInstance([vsNameParam("new_vs")], "v0", [], []))
                .toThrowError(new BadRequestError(`Virtual Schema 'new_vs' already exists`))
        })
        it("fails for existing instance with different case", () => {
            mockSqlQueryResult([["new_VS"]]);
            expect(() => addInstance([vsNameParam("new_vs")], "v0", [], []))
                .toThrowError(new BadRequestError(`Virtual Schema 'new_VS' already exists`))
        })
        it("fails for multiple existing instances with different case", () => {
            mockSqlQueryResult([["new_VS", "NEW_vs"]]);
            expect(() => addInstance([vsNameParam("new_vs")], "v0", [], []))
                .toThrowError(new BadRequestError(`Virtual Schema 'new_VS' already exists`))
        })
        it("succeeds for existing instance with other name", () => {
            mockSqlQueryResult([["other_vs"]]);
            expect(() => addInstance([vsNameParam("new_vs")], "v0", [], []))
                .not.toThrow()
        })
        it("succeeds when no virtual schema exists", () => {
            mockSqlQueryResult([]);
            expect(() => addInstance([vsNameParam("new_vs")], "v0", [], []))
                .not.toThrow()
        })
    })

    it("returns new instance", () => {
        expect(addInstance([vsNameParam("vs1")], "v0", [], [])).toStrictEqual({ id: "vs1", name: "vs1" })
    })
    it("executes statements", () => {
        addInstance([vsNameParam("vs1")], "v0", [], [])
        expect(getStatement(0)).toBe(`CREATE OR REPLACE CONNECTION "VS1_CONNECTION" TO '' IDENTIFIED BY '{}'`)
        expect(getStatement(1)).toBe(`CREATE VIRTUAL SCHEMA "vs1" USING "ext-schema"."vs-adapter-script-name" WITH CONNECTION_NAME = 'VS1_CONNECTION'`)
        expect(getStatement(2)).toBe(`COMMENT ON CONNECTION "VS1_CONNECTION" IS 'Created by Extension Manager for testing-extension vv0 vs1'`)
        expect(getStatement(3)).toBe(`COMMENT ON SCHEMA "vs1" IS 'Created by Extension Manager for testing-extension vv0 vs1'`)
    })

    describe("creates virtual schema", () => {
        const tests: { name: string, vsParamDefs: Parameter[], params: ParameterValue[], expected: string }[] = [
            { name: "no param", vsParamDefs: [], params: [], expected: "" },
            { name: "param def without value", vsParamDefs: [{ id: "p1", name: "P1", type: "string" }], params: [], expected: "" },
            { name: "param def with value", vsParamDefs: [{ id: "p1", name: "P1", type: "string" }], params: [param("p1", "v1")], expected: " p1 = 'v1'" },
            {
                name: "multiple values", vsParamDefs: [{ id: "p1", name: "P1", type: "string" }, { id: "p2", name: "P2", type: "string" }],
                params: [param("p1", "v1"), param("p2", "v2")], expected: " p1 = 'v1' p2 = 'v2'"
            },
            { name: "single quotes escaped", vsParamDefs: [{ id: "p1", name: "P1", type: "string" }], params: [param("p1", "va'lue")], expected: " p1 = 'va''lue'" },
            { name: "double quotes escaped", vsParamDefs: [{ id: "p1", name: "P1", type: "string" }], params: [param("p1", "va\"lue")], expected: " p1 = 'va\"lue'" },
        ]
        tests.forEach(test => it(test.name, () => {
            addInstance([vsNameParam("vs1"), ...test.params], "v0", test.vsParamDefs, [])
            expect(getCreateVirtualSchemaStatement()).toBe(`CREATE VIRTUAL SCHEMA "vs1" USING "ext-schema"."vs-adapter-script-name" `
                + `WITH CONNECTION_NAME = 'VS1_CONNECTION'${test.expected}`)
        }))
    })

    describe("creates connection", () => {
        describe("with JSON payload", () => {
            const tests: { name: string, connParamDefs: Parameter[], params: ParameterValue[], expected: string }[] = [
                { name: "no param", connParamDefs: [], params: [], expected: `{}` },
                { name: "ignores unknown params", connParamDefs: [], params: [param("unknown", "val")], expected: `{}` },
                { name: "missing param with default value ignored", connParamDefs: [{ id: "p1", name: "P1", type: "string", default: "def" }], params: [], expected: `{}` },
                { name: "optional string param", connParamDefs: [{ id: "p1", name: "P1", type: "string", required: false }], params: [param("p1", "v1")], expected: `{"p1":"v1"}` },
                { name: "required string param", connParamDefs: [{ id: "p1", name: "P1", type: "string", required: true }], params: [param("p1", "v1")], expected: `{"p1":"v1"}` },
                { name: "escapes single quotes", connParamDefs: [{ id: "p1", name: "P1", type: "string" }], params: [param("p1", "v'1")], expected: `{"p1":"v''1"}` },
                { name: "escapes double quotes", connParamDefs: [{ id: "p1", name: "P1", type: "string" }], params: [param("p1", "v\"1")], expected: `{"p1":"v\\"1"}` },
                { name: "outputs true boolean", connParamDefs: [{ id: "p1", name: "P1", type: "boolean" }], params: [param("p1", "true")], expected: `{"p1":true}` },
                { name: "outputs false boolean", connParamDefs: [{ id: "p1", name: "P1", type: "boolean" }], params: [param("p1", "false")], expected: `{"p1":false}` },
                { name: "outputs select as string", connParamDefs: [{ id: "p1", name: "P1", type: "select", options: [] }], params: [param("p1", "v1")], expected: `{"p1":"v1"}` },
                { name: "multiple parameter definitions, value missing", connParamDefs: [{ id: "p1", name: "P1", type: "string" }, { id: "p2", name: "P2", type: "string" }], params: [param("p1", "v1")], expected: `{"p1":"v1"}` },
                { name: "multiple parameter definitions", connParamDefs: [{ id: "p1", name: "P1", type: "string" }, { id: "p2", name: "P2", type: "string" }], params: [param("p1", "v1"), param("p2", "v2")], expected: `{"p1":"v1","p2":"v2"}` },
            ]
            tests.forEach(test => it(test.name, () => {
                addInstance([vsNameParam("vs1"), ...test.params], "v0", [], test.connParamDefs)
                expect(getCreateConnectionStatement()).toBe(`CREATE OR REPLACE CONNECTION "VS1_CONNECTION" TO '' IDENTIFIED BY '${test.expected}'`)
            }))
        })

        describe("with user & password", () => {
            interface Test { name: string, connAddr?: Parameter, connUser?: Parameter, connPassword?: Parameter, params: ParameterValue[], expected: string }

            function testValue(testName: string, type: "addr" | "user" | "password", paramValue: string, expected: string): Test {
                const params = []
                if (paramValue) {
                    params.push(param("p1", paramValue))
                }
                const paramTemplate: Parameter = { id: "p1", type: "string", name: "P1" }
                let connectionParam = undefined
                switch (type) {
                    case "addr":
                        connectionParam = { connAddr: paramTemplate };
                        break
                    case "user":
                        connectionParam = { connUser: paramTemplate };
                        break
                    case "password":
                        connectionParam = { connPassword: paramTemplate };
                        break
                }
                return { name: testName, ...connectionParam, params, expected: expected }
            }

            function addressValue(testName: string, paramValue: string, expectedAddress: string): Test {
                return testValue(testName, "addr", paramValue, expectedAddress)
            }
            function userValue(testName: string, paramValue: string, expectedUser: string): Test {
                return testValue(testName, "user", paramValue, `TO ''${expectedUser}`)
            }
            function passwordValue(testName: string, paramValue: string, expectedPassword: string): Test {
                return testValue(testName, "password", paramValue, `TO ''${expectedPassword}`)
            }

            const tests: Test[] = [
                { name: "no param", params: [], expected: `TO ''` },
                {
                    name: "all params", connAddr: { id: "p1", type: "string", name: "P1" }, connUser: { id: "p2", type: "string", name: "P2" }, connPassword: { id: "p3", type: "string", name: "P3" },
                    params: [param("p1", "addr"), param("p2", "user"), param("p3", "pass")], expected: `TO 'addr' USER 'user' IDENTIFIED BY 'pass'`
                },
                addressValue("address value not present", undefined, "TO ''"),
                addressValue("address value present", "addr", "TO 'addr'"),
                addressValue("address value with single quote escaped", "ad'dr", "TO 'ad''dr'"),
                addressValue("address value with double quote escaped", "ad\"dr", "TO 'ad\"dr'"),
                userValue("user value not present", undefined, ""),
                userValue("user value present", "user", " USER 'user'"),
                userValue("user value with single quote escaped", "us'er", " USER 'us''er'"),
                userValue("user value with double quote escaped", "us\"er", " USER 'us\"er'"),
                passwordValue("password value not present", undefined, ""),
                passwordValue("password value present", "pass", " IDENTIFIED BY 'pass'"),
                passwordValue("password value with single quote escaped", "pa'ss", " IDENTIFIED BY 'pa''ss'"),
                passwordValue("password value with double quote escaped", "pa\"ss", " IDENTIFIED BY 'pa\"ss'"),
            ]
            tests.forEach(test => it(test.name, () => {
                addInstanceWithUserPasswordConnection([vsNameParam("vs1"), ...test.params], "v0", [], test.connAddr, test.connUser, test.connPassword)
                expect(getCreateConnectionStatement()).toBe(`CREATE OR REPLACE CONNECTION "VS1_CONNECTION" ${test.expected}`)
            }))
        })
    })
})
