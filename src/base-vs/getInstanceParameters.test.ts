
import { describe, expect, it } from '@jest/globals';
import { convertVirtualSchemaBaseExtension } from '.';
import { Parameter } from '../api';
import { createMockContext } from '../base/test-utils';
import { PreconditionFailedError } from '../error';
import { emptyBaseVsExtension } from './test-vs-utils';

function getInstanceParameters(version: string): Parameter[] {
    const baseExtension = emptyBaseVsExtension()
    baseExtension.name = "testing-extension"
    baseExtension.instanceParameters = [{ id: "param1", name: "Param Name", type: "string" }]
    const installations = convertVirtualSchemaBaseExtension(baseExtension).getInstanceParameters(createMockContext(), version)
    expect(installations).toBeDefined()
    return installations
}

describe("getInstanceParameters", () => {
    it("fails for unsupported version", () => {
        expect(() => getInstanceParameters("wrong version"))
            .toThrowError(new PreconditionFailedError("Version 'wrong version' not supported, can only use 'v0'."))
    })
    it("succeeds for supported version", () => {
        expect(getInstanceParameters("v0"))
            .toStrictEqual([{ id: "param1", name: "Param Name", type: "string" }])
    })
})
