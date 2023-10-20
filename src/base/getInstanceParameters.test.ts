
import { describe, expect, it } from '@jest/globals';
import { convertBaseExtension } from '.';
import { Parameter } from '../api';
import { PreconditionFailedError } from '../error';
import { createMockContext, emptyBaseExtension } from './test-utils';

function getInstanceParameters(): Parameter[] {
    const baseExtension = emptyBaseExtension()
    baseExtension.name = "testing-extension"
    const installations = convertBaseExtension(baseExtension).getInstanceParameters(createMockContext(), "version")
    expect(installations).toBeDefined()
    return installations
}

describe("getInstanceParameters", () => {
    it("not supported", () => {
        expect(() => getInstanceParameters())
            .toThrowError(new PreconditionFailedError("Creating instances not supported"))
    })
})
