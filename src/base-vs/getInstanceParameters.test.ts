
import { describe, expect, it } from '@jest/globals';
import { convertVirtualSchemaBaseExtension } from '.';
import { Parameter } from '../api';
import { createMockContext } from '../base/test-utils';
import { PreconditionFailedError } from '../error';
import { emptyBaseVsExtension } from './test-vs-utils';

function getInstanceParameters(version: string): Parameter[] {
    const baseExtension = emptyBaseVsExtension()
    baseExtension.name = "testing-extension"
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
            .toStrictEqual([
                {
                    description: "Name for the new virtual schema",
                    id: "baseVirtualSchemaName",
                    name: "Virtual schema name",
                    placeholder: "MY_VIRTUAL_SCHEMA",
                    regex: "[a-zA-Z][a-zA-Z0-9_]*",
                    required: true,
                    type: "string",
                },
                { id: "vs-required", name: "n1", required: true, type: "string" },
                { id: "vs-optional", name: "n2", required: false, type: "string" },
                { id: "conn-required", name: "n1", required: true, type: "string" },
                { id: "conn-optional", name: "n2", required: false, type: "string" },
            ])
    })
})
