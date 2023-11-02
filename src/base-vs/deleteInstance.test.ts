
import { describe, expect, it } from '@jest/globals';
import { convertVirtualSchemaBaseExtension, createJsonConnectionDefinition, createVirtualSchemaBuilder } from '.';
import { ContextMock, createMockContext } from '../base/test-utils';
import { emptyBaseVsExtension } from './test-vs-utils';

let context: ContextMock = undefined

function deleteInstance(version: string, instanceId: string): void {
    const baseExtension = emptyBaseVsExtension()
    baseExtension.name = "testing-extension"
    baseExtension.builder = createVirtualSchemaBuilder({
        connectionNameProperty: "CONNECTION_NAME",
        virtualSchemaParameters: [],
        connectionDefinition: createJsonConnectionDefinition([])
    })
    context = createMockContext();
    convertVirtualSchemaBaseExtension(baseExtension).deleteInstance(context, version, instanceId)
}

function getStatement(index: number): string {
    const sqlStatements = context.mocks.sqlExecute.mock.calls
    expect(sqlStatements).toHaveLength(2)
    expect(sqlStatements[index]).toHaveLength(1)
    const stmt = sqlStatements[index][0];
    expect(stmt).toBeDefined()
    return stmt
}

describe("deleteInstance()", () => {
    it("fails for wrong version", () => {
        expect(() => deleteInstance("wrongVersion", "instId")).toThrow("Version 'wrongVersion' not supported, can only use 'v0'.")
    })
    it("executes DROP statements", () => {
        deleteInstance("v0", "instId")
        expect(getStatement(0)).toBe(`DROP VIRTUAL SCHEMA IF EXISTS "instId" CASCADE`)
        expect(getStatement(1)).toBe(`DROP CONNECTION IF EXISTS "instId_CONNECTION"`)
    })
})
