
import { describe, expect, it } from '@jest/globals';
import { BucketFSUpload, ExasolExtension, NotFoundError } from '../api';
import { RequiredJar, convertBaseExtension } from './index';
import { emptyBaseExtension } from './test-utils';


describe("index", () => {
    function testee(): ExasolExtension {
        const baseExtension = emptyBaseExtension()
        baseExtension.name = "test-ext"
        baseExtension.version = "v1"
        return convertBaseExtension(baseExtension)
    }

    describe("bucketFsUploads", () => {
        const tests: { name: string, files: RequiredJar[], expected: BucketFSUpload[] }[] = [
            { name: "empty list", files: [], expected: [] },
            { name: "single file", files: [{ name: "name", size: 123 }], expected: [{ bucketFsFilename: "name", name: "name", fileSize: 123 }] },
            {
                name: "multiple files", files: [{ name: "name1", size: 123 }, { name: "name2", size: 456 }],
                expected: [{ bucketFsFilename: "name1", name: "name1", fileSize: 123 }, { bucketFsFilename: "name2", name: "name2", fileSize: 456 }]
            },
            { name: "uses negative size if undefined", files: [{ name: "name", size: undefined }], expected: [{ bucketFsFilename: "name", name: "name", fileSize: -1 }] },
            { name: "uses negative size if missing", files: [{ name: "name" }], expected: [{ bucketFsFilename: "name", name: "name", fileSize: -1 }] },
        ]
        tests.forEach(test => it(test.name, () => {
            const baseExtension = emptyBaseExtension()
            baseExtension.files = test.files
            expect(convertBaseExtension(baseExtension).bucketFsUploads).toStrictEqual(test.expected)
        }))
    })

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
