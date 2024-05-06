import { describe, expect, it } from '@jest/globals';
import { convertInstanceIdToSchemaName, convertSchemaNameToInstanceId, escapeSingleQuotes, getConnectionName } from './common';

describe("common", () => {
    describe("convertInstanceIdToSchemaName()", () => {
        it("returns same value", () => {
            expect(convertInstanceIdToSchemaName("My Value")).toBe("My Value")
        })
    })
    describe("convertSchemaNameToInstanceId()", () => {
        it("returns same value", () => {
            expect(convertSchemaNameToInstanceId("My Value")).toBe("My Value")
        })
    })
    describe("getConnectionName()", () => {
        it("appends _CONNECTION", () => {
            expect(getConnectionName("MY VALUE")).toBe("MY VALUE_CONNECTION")
        })
        it("converts name to upper case", () => {
            expect(getConnectionName("My Value")).toBe("MY VALUE_CONNECTION")
        })
    })
    describe("escapeSingleQuotes()", () => {
        const tests: { name: string, input: string, expectedResult: string }[] = [
            { name: "no single quote", input: "My Value", expectedResult: "My Value" },
            { name: "single quote", input: "My'Value", expectedResult: "My''Value" },
            { name: "two single quote", input: "My''Value", expectedResult: "My''''Value" },
            { name: "quoted string", input: "My 'Value'", expectedResult: "My ''Value''" },
        ]
        tests.forEach(test => it(test.name, () => {
            expect(escapeSingleQuotes(test.input)).toBe(test.expectedResult)
        }))
    })
})
