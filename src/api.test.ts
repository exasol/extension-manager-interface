/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from "@jest/globals";
import { readFile, readdir } from "fs/promises";
import { BadRequestError, CURRENT_API_VERSION, ExasolExtension, InternalServerError, NotFoundError, PreconditionFailedError, registerExtension } from "./api";


async function readPackageJson(): Promise<any> {
    const fileContentBuffer = await readFile("package.json")
    const fileContent = fileContentBuffer.toString("utf8")
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(fileContent);
}

async function readPackageJsonVersion(): Promise<string> {
    const packageJson = await readPackageJson()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return packageJson.version
}

class VersionNumber {
    major: number
    minor: number
    patch: number
    constructor(match: RegExpMatchArray) {
        this.major = parseInt(match[1])
        this.minor = parseInt(match[2])
        this.patch = parseInt(match[3])
    }
    toString() {
        return `${this.major}.${this.minor}.${this.patch}`
    }
}

function byMajorMinorPatch(a: VersionNumber, b: VersionNumber): number {
    if (a.major !== b.major) {
        return a.major - b.major
    }
    if (a.minor !== b.minor) {
        return a.minor - b.minor
    }
    return a.patch - b.patch
}

async function getChangelogVersions(): Promise<VersionNumber[]> {
    const files = await readdir("doc/changes")
    // Match file names like "changes_0.1.16.md"
    const changesFilePattern = /^changes_(\d+)\.(\d+)\.(\d+)\.md$/
    return files.map(name => changesFilePattern.exec(name))
        .filter(match => match !== null)
        .map(match => new VersionNumber(match))
}

async function getLatestChangelogVersion() {
    const versions = await getChangelogVersions()
    versions.sort(byMajorMinorPatch)
    return versions[versions.length - 1]
}

describe("api", () => {
    describe("CURRENT_API_VERSION", () => {
        it("is equal to version in package.json", async () => {
            const packageJsonVersion = await readPackageJsonVersion()
            expect(CURRENT_API_VERSION).toBe(packageJsonVersion)
        })
        it("is equal to latest changelog file", async () => {
            const latestVersion = await getLatestChangelogVersion()
            expect(CURRENT_API_VERSION).toBe(latestVersion.toString())
        })
    })

    function createDummyExtension(): ExasolExtension {
        return {
            name: "name",
            description: "description",
            category: "category",
            installableVersions: [{ name: "1.2.3", latest: true, deprecated: false }],
            bucketFsUploads: [],
            addInstance(_context, _version, _params) {
                return { id: "instanceId", name: "instance" }
            },
            deleteInstance(_context, _instanceId) {
                // empty by intention
            },
            findInstallations(_context, _exaAllScripts) {
                return []
            },
            findInstances(_context, _version) {
                return []
            },
            install(_context, _version) {
                // empty by intention
            },
            getInstanceParameters(_context, _version) {
                return []
            },
            readInstanceParameterValues(_context, _version, _instanceId) {
                return { values: [] }
            },
            uninstall(_context, _installation) {
                // empty by intention
            },
            upgrade(_context) {
                return { previousVersion: "0.1.0", newVersion: "0.2.0" }
            },
        }
    }

    function getRegisteredExtension(): any {
        return (global as any).installedExtension
    }

    describe("registerExtension()", () => {
        it("registers an extension", () => {
            const ext = createDummyExtension()
            registerExtension(ext)
            const installedExtension: any = getRegisteredExtension()
            expect(installedExtension.apiVersion).toBe(CURRENT_API_VERSION)
            expect(installedExtension.extension).toBe(ext)
        })
    })

    describe("extension properties", () => {
        it("category", () => {
            const ext = createDummyExtension()
            registerExtension(ext)
            const installedExtension: any = getRegisteredExtension()
            expect(installedExtension.extension.category).toBe("category")
        })
    })

    describe("errors", () => {
        describe("BadRequestError", () => {
            it("can be thrown with new", () => {
                expect(() => { throw new BadRequestError("message") }).toThrow(Error);
            });
            it("contains status and message", () => {
                try {
                    throw new BadRequestError("message");
                } catch (error: any) {
                    expect(error).toBeInstanceOf(Error);
                    expect(error.status).toBe(400)
                    expect(error.message).toBe("message")
                }
            });
        })

        describe("NotFoundError", () => {
            it("can be thrown with new", () => {
                expect(() => { throw new NotFoundError("message") }).toThrow(Error);
            });
            it("contains status and message", () => {
                try {
                    throw new NotFoundError("message");
                } catch (error: any) {
                    expect(error).toBeInstanceOf(Error);
                    expect(error.status).toBe(404)
                    expect(error.message).toBe("message")
                }
            });
        })

        describe("PreconditionFailedError", () => {
            it("can be thrown with new", () => {
                expect(() => { throw new PreconditionFailedError("message") }).toThrow(Error);
            });
            it("contains status and message", () => {
                try {
                    throw new PreconditionFailedError("message");
                } catch (error: any) {
                    expect(error).toBeInstanceOf(Error);
                    expect(error.status).toBe(412)
                    expect(error.message).toBe("message")
                }
            });
        })

        describe("InternalServerError", () => {
            it("can be thrown with new", () => {
                expect(() => { throw new InternalServerError("message") }).toThrow(Error);
            });
            it("contains message but no status", () => {
                try {
                    throw new InternalServerError("message");
                } catch (error: any) {
                    expect(error).toBeInstanceOf(Error);
                    expect(error.status).toBeUndefined()
                    expect(error.message).toBe("message")
                }
            });
        });
    })
})
