import { describe, expect, it } from '@jest/globals';
import { failureResult, successResult } from './common';
import { jarFileVersionExtractor } from './jarFileVersionExtractor';


describe("jarFileVersionExtractor()", () => {
    const tests: { name: string; scriptText: string, expectedVersion?: string, expectedError?: string }[] = [
        { name: "found", scriptText: "CREATE ... %jar /path/to/exasol-cloud-storage-extension-1.2.3.jar; more text", expectedVersion: "1.2.3" },
        { name: "found with LF", scriptText: "CREATE ...\n %jar /path/to/exasol-cloud-storage-extension-1.2.3.jar; more text", expectedVersion: "1.2.3" },
        { name: "found with LFCR", scriptText: "CREATE ...\n\r %jar /path/to/exasol-cloud-storage-extension-1.2.3.jar; more text", expectedVersion: "1.2.3" },
        { name: "with CRLF", scriptText: "CREATE ...\r\n %jar /path/to/exasol-cloud-storage-extension-1.2.3.jar; more text", expectedVersion: "1.2.3" },
        { name: "not found in root dir", scriptText: "CREATE ... %jar /exasol-cloud-storage-extension-1.2.3.jar; more text", expectedError: "Could not find jar filename in adapter script 'CREATE ... %jar /exasol-cloud-storage-extension-1.2.3.jar; more text'" },
        { name: "not found invalid %jar", scriptText: "CREATE ... %invalid /path/to/exasol-cloud-storage-extension-1.2.3.jar; more text", expectedError: "Could not find jar filename in adapter script 'CREATE ... %invalid /path/to/exasol-cloud-storage-extension-1.2.3.jar; more text'" },
        { name: "not found missing %jar", scriptText: "CREATE ... /path/to/exasol-cloud-storage-extension-1.2.3.jar; more text", expectedError: "Could not find jar filename in adapter script 'CREATE ... /path/to/exasol-cloud-storage-extension-1.2.3.jar; more text'" },
        { name: "not found missing trailing semicolon", scriptText: "CREATE ...\r\n %jar /path/to/exasol-cloud-storage-extension-1.2.3.jar", expectedError: "Could not find jar filename in adapter script 'CREATE ...\r\n %jar /path/to/exasol-cloud-storage-extension-1.2.3.jar'" },
        { name: "not found invalid version", scriptText: "CREATE ... %jar /path/to/exasol-cloud-storage-extension-a.b.c.jar;", expectedError: "Could not find version in jar file name 'exasol-cloud-storage-extension-a.b.c.jar'" },
        { name: "not found invalid filename", scriptText: "CREATE ... %jar /path/to/invalid-file-name-dist-0.0.0-s3-1.2.3.jar;", expectedError: "Could not find version in jar file name 'invalid-file-name-dist-0.0.0-s3-1.2.3.jar'" },
    ]
    tests.forEach(test => it(test.name, () => {
        const extractor = jarFileVersionExtractor(/exasol-cloud-storage-extension-(\d+\.\d+\.\d+).jar/)
        const result = extractor(test.scriptText);
        if (test.expectedVersion) {
            expect(result).toStrictEqual(successResult(test.expectedVersion))
        } else {
            expect(test.expectedError).toBeDefined()
            expect(result).toStrictEqual(failureResult(test.expectedError || "(undefined error)"))
        }
    }))
})
