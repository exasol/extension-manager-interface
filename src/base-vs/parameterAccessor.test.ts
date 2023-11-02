
import { describe, expect, it } from '@jest/globals';
import { Parameter, ParameterValue } from '../api';
import { createParameterAccessor } from './parameterAccessor';

describe("ParameterAccessor", () => {
    function param(name: string, value: string): ParameterValue {
        return { name, value }
    }
    function testee(...values: ParameterValue[]) {
        return createParameterAccessor({ values })
    }

    describe("createParameterAccessor()", () => {
        it("succeeds for empty parameter list", () => {
            expect(testee()).toBeDefined()
        })
        it("succeeds for single parameter", () => {
            expect(testee(param("p1", "v1"))).toBeDefined()
        })
        it("succeeds for multiple parameters", () => {
            expect(testee(param("p1", "v1"), param("p2", "v2"))).toBeDefined()
        })
        it("fails for duplicate parameter names", () => {
            expect(() => testee(param("p1", "v1"), param("p1", "v2"))).toThrow("Two values 'v2' and 'v1' found for parameter p1")
        })
    })

    describe("getOptional()", () => {
        describe("supported parameter types", () => {
            const tests: { name: string, param: Parameter }[] = [
                { name: "optional string", param: { id: "p1", name: "n1", type: "string", required: false } },
                { name: "optional select", param: { id: "p1", name: "n1", type: "select", options: [], required: false } },
                { name: "optional boolean", param: { id: "p1", name: "n1", type: "boolean", required: false } },
                { name: "required string", param: { id: "p1", name: "n1", type: "string", required: true } },
                { name: "required select", param: { id: "p1", name: "n1", type: "select", options: [], required: true } },
                { name: "required boolean", param: { id: "p1", name: "n1", type: "boolean", required: true } },
            ]
            tests.forEach(test => describe(test.name, () => {
                it("returns undefined for empty parameter values", () => {
                    expect(testee().getOptional(test.param)).toBeUndefined()
                })
                it("returns undefined for missing parameter", () => {
                    expect(testee(param("wrong-name", "value")).getOptional(test.param)).toBeUndefined()
                })
                it("returns value for available parameter", () => {
                    expect(testee(param(test.param.id, "value")).getOptional(test.param)).toEqual("value")
                })
                it("returns undefined for undefined parameter", () => {
                    expect(testee(param(test.param.id, undefined)).getOptional(test.param)).toBeUndefined()
                })
                it("returns value for multiple parameters", () => {
                    expect(testee(param("wrong-name", "value"), param(test.param.id, "value")).getOptional(test.param)).toEqual("value")
                })
                it("returns undefined for missing parameter without default value", () => {
                    expect(testee().getOptional({ ...test.param, default: undefined })).toBeUndefined()
                })
                it("returns undefined for missing parameter with default value", () => {
                    expect(testee().getOptional({ default: "def", ...test.param })).toBeUndefined()
                })
            }))
        })
    })

    describe("get()", () => {
        it("fails for optional parameter", () => {
            expect(() => testee().get({ id: "p1", name: "n1", type: "string", required: false })).toThrow("Parameter p1 is optional. Use method 'resolveOptional()' to resolve it.")
        })
        it("fails for optional parameter with default", () => {
            expect(() => testee().get({ id: "p1", name: "n1", type: "string", required: false, default: "def" })).toThrow("Parameter p1 is optional. Use method 'resolveOptional()' to resolve it.")
        })
        describe("supported parameter types", () => {
            const tests: { name: string, param: Parameter }[] = [
                { name: "string", param: { id: "p1", name: "n1", type: "string", required: true } },
                { name: "select", param: { id: "p1", name: "n1", type: "select", options: [], required: true } },
                { name: "boolean", param: { id: "p1", name: "n1", type: "boolean", required: true } },
            ]
            tests.forEach(test => describe(test.name, () => {
                it("fails for empty parameter values", () => {
                    expect(() => testee().get(test.param)).toThrow("No value found for required parameter p1")
                })
                it("fails for missing parameter", () => {
                    expect(() => testee(param("wrong-name", "value")).get(test.param)).toThrow("No value found for required parameter p1")
                })
                it("returns value for available parameter", () => {
                    expect(testee(param(test.param.id, "value")).get(test.param)).toEqual("value")
                })
                it("fails for undefined parameter", () => {
                    expect(() => testee(param(test.param.id, undefined)).get(test.param)).toThrow("No value found for required parameter p1")
                })
                it("returns value for multiple parameters", () => {
                    expect(testee(param("wrong-name", "value"), param(test.param.id, "value")).get(test.param)).toEqual("value")
                })
            }))
        })
    })
})
