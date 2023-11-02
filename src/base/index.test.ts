
import { describe, expect, it } from '@jest/globals';
import { ExasolExtension, NotFoundError } from '../api';
import { convertBaseExtension } from './index';
import { emptyBaseExtension } from './test-utils';


describe("index", () => {
    function testee(): ExasolExtension {
        const baseExtension = emptyBaseExtension()
        baseExtension.name = "test-ext"
        baseExtension.version = "v1"
        return convertBaseExtension(baseExtension)
    }

    describe("findInstances()", () => {
        it("is not supported", () => {
            expect(() => testee().findInstances(undefined, undefined)).toThrowError(new NotFoundError("Finding instances not supported"))
        })
    })

    describe("addInstance()", () => {
        it("is not supported", () => {
            expect(() => testee().addInstance(undefined, undefined, undefined)).toThrowError(new NotFoundError("Creating instances not supported"))
        })
    })

    describe("deleteInstance()", () => {
        it("is not supported", () => {
            expect(() => testee().deleteInstance(undefined, undefined, undefined)).toThrowError(new NotFoundError("Deleting instances not supported"))
        })
    })

    describe("getInstanceParameters()", () => {
        it("is not supported", () => {
            expect(() => testee().getInstanceParameters(undefined, undefined)).toThrowError(new NotFoundError("Creating instances not supported"))
        })
    })

    describe("readInstanceParameterValues()", () => {
        it("is not supported", () => {
            expect(() => testee().readInstanceParameterValues(undefined, undefined, undefined)).toThrowError(new NotFoundError("Reading instance parameter values not supported"))
        })
    })
})
