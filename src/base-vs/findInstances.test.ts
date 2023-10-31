
import { describe, expect, it } from '@jest/globals';
import { convertVirtualSchemaBaseExtension } from '.';
import { Instance, Row } from '../api';
import { ContextMock, createMockContext } from '../base/test-utils';
import { emptyBaseVsExtension } from './test-vs-utils';

let context: ContextMock = undefined

function findInstances(rows: Row[]): Instance[] {
    const baseExtension = emptyBaseVsExtension()
    baseExtension.name = "testing-extension"
    context = createMockContext();
    context.mocks.sqlQuery.mockReturnValueOnce({ columns: [], rows })
    const installations = convertVirtualSchemaBaseExtension(baseExtension).findInstances(context, "version")
    expect(installations).toBeDefined()
    return installations
}

describe("findInstances", () => {
    it("returns empty array when no virtual schema exists", () => {
        expect(findInstances([])).toStrictEqual([])
    })
    it("returns single entry when virtual schema exists", () => {
        expect(findInstances([["vs-name"]])).toStrictEqual([{ id: "vs-name", name: "vs-name" }])
    })
    it("returns multiple entries", () => {
        expect(findInstances([["vs1"], ["vs2"]])).toStrictEqual([{ id: "vs1", name: "vs1" }, { id: "vs2", name: "vs2" }])
    })
    it("executes expected query", () => {
        findInstances([["vs1"], ["vs2"]])
        const expectedQuery = "SELECT SCHEMA_NAME FROM SYS.EXA_ALL_VIRTUAL_SCHEMAS WHERE ADAPTER_SCRIPT_SCHEMA = ? AND ADAPTER_SCRIPT_NAME = ? ORDER BY SCHEMA_NAME";
        expect(context.mocks.sqlQuery.mock.calls).toStrictEqual([[expectedQuery, "ext-schema", "vs-adapter-script-name"]])
    })
})
