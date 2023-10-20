
import { describe, expect, it } from '@jest/globals';
import { convertBaseExtension } from '.';
import { ParameterValues } from '../api';
import { PreconditionFailedError } from '../error';
import { createMockContext, emptyBaseExtension } from './test-utils';

function readInstanceParameterValues(): ParameterValues {
    const baseExtension = emptyBaseExtension()
    baseExtension.name = "testing-extension"
    const installations = convertBaseExtension(baseExtension).readInstanceParameterValues(createMockContext(), "version", "instanceId")
    expect(installations).toBeDefined()
    return installations
}

describe("readInstanceParameterValues", () => {
    it("not supported", () => {
        expect(() => readInstanceParameterValues())
            .toThrowError(new PreconditionFailedError("Reading instance parameter values not supported"))
    })
})
