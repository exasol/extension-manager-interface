
import { describe, expect, it } from '@jest/globals';
import { convertBaseExtension } from '.';
import { Parameter } from '../api';
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
            .toThrow("Creating instances not supported")
    })
})
