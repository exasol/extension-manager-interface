import { describe, expect, it } from '@jest/globals';
import { ExasolExtension } from '../api';
import { createMockContext } from '../base/test-utils';

/**
 * This function runs shared tests for a virtual schema extension.
 * 
 * Call this function in your test file to test your virtual schema extension.
 * It will assert that the parameters conform to the naming conventions.
 * @param extensionProvider factory for the extension to test
 */
export function testJavaVirtualSchemaBaseExtension(extensionProvider: () => ExasolExtension) {
    const extension = extensionProvider();
    describe(`extension ${extension.name} versions`, () => {
        it("has at least one version", () => {
            expect(extension.installableVersions.length).toBeGreaterThan(0);
        });
    });
    describe(`extension ${extension.name} parameters`, () => {
        const parameters = extension.getInstanceParameters(createMockContext(), extension.installableVersions[0].name)
        it("has at least one parameter", () => {
            expect(parameters.length).toBeGreaterThan(0);
        });
        it("contains virtual schema name", () => {
            expect(parameters.some(p => p.id === "baseVirtualSchemaName")).toBe(true);
        });
        it("have a unique ID", () => {
            const ids = parameters.map(p => p.id);
            expect(new Set(ids).size).toBe(ids.length);
        });
        for (const param of parameters) {
            it(`parameter '${param.id}' conforms to naming conventions`, () => {
                expect(param.id).not.toContain(".");
            });
        }
    });
}
