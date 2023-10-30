
import { describe, expect, it } from '@jest/globals';
import { Parameter, ParameterValue } from '../api';
import { createParameterResolver } from './parameterResolver';

describe("ParameterResolver", () => {
    function param(name: string, value: string): ParameterValue {
        return { name, value }
    }
    function testee(...values: ParameterValue[]) {
        return createParameterResolver({ values })
    }

    describe("createParameterResolver()", () => {
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

    describe("resolveOptional()", () => {
        it("fails for required parameter", () => {
            expect(() => testee().resolveOptional({ id: "p1", name: "n1", type: "string", required: true })).toThrow("Parameter p1 is required but not defined")
        })
        it("fails for unsupported parameter type boolean", () => {
            expect(() => testee().resolveOptional({ id: "p1", name: "n1", type: "boolean" })).toThrow("Parameter type boolean for parameter p1 not supported")
        })
        describe("supported parameter types", () => {
            const tests: { name: string, param: Parameter }[] = [
                { name: "string", param: { id: "p1", name: "n1", type: "string", required: false } },
                { name: "select", param: { id: "p1", name: "n1", type: "select", options: [], required: false } },
            ]
            tests.forEach(test => describe(test.name, () => {
                it("returns undefined for empty parameter values", () => {
                    expect(testee().resolveOptional(test.param)).toBeUndefined()
                })
                it("returns undefined for missing parameter", () => {
                    expect(testee(param("wrong-name", "value")).resolveOptional(test.param)).toBeUndefined()
                })
                it("returns value for available parameter", () => {
                    expect(testee(param(test.param.id, "value")).resolveOptional(test.param)).toEqual("value")
                })
                it("returns undefined for undefined parameter", () => {
                    expect(testee(param(test.param.id, undefined)).resolveOptional(test.param)).toBeUndefined()
                })
                it("returns value for multiple parameter", () => {
                    expect(testee(param("wrong-name", "value"), param(test.param.id, "value")).resolveOptional(test.param)).toEqual("value")
                })
            }))
        })
    })

    describe("resolve()", () => {
        it("fails for optional parameter", () => {
            expect(() => testee().resolve({ id: "p1", name: "n1", type: "string", required: false })).toThrow("Parameter p1 is optional. Use method 'resolveOptional()' to resolve it.")
        })
        it("fails for unsupported parameter type boolean", () => {
            expect(() => testee().resolve({ id: "p1", name: "n1", type: "boolean" })).toThrow("Parameter type boolean for parameter p1 not supported")
        })
        describe("supported parameter types", () => {
            const tests: { name: string, param: Parameter }[] = [
                { name: "string", param: { id: "p1", name: "n1", type: "string", required: true } },
                { name: "select", param: { id: "p1", name: "n1", type: "select", options: [], required: true } },
            ]
            tests.forEach(test => describe(test.name, () => {
                it("fails for empty parameter values", () => {
                    expect(() => testee().resolve(test.param)).toThrow("No value found for required parameter p1")
                })
                it("fails for missing parameter", () => {
                    expect(() => testee(param("wrong-name", "value")).resolve(test.param)).toThrow("No value found for required parameter p1")
                })
                it("returns value for available parameter", () => {
                    expect(testee(param(test.param.id, "value")).resolve(test.param)).toEqual("value")
                })
                it("fails for undefined parameter", () => {
                    expect(() => testee(param(test.param.id, undefined)).resolve(test.param)).toThrow("No value found for required parameter p1")
                })
                it("returns value for multiple parameter", () => {
                    expect(testee(param("wrong-name", "value"), param(test.param.id, "value")).resolve(test.param)).toEqual("value")
                })
            }))
        })
    })
})