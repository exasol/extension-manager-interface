import { readdir, readFile } from "fs/promises";
import { CURRENT_API_VERSION, ExasolExtension, registerExtension } from "./api";


async function readPackageJson() {
    const fileContentBuffer = await readFile("package.json")
    const fileContent = fileContentBuffer.toString("utf8")
    return JSON.parse(fileContent);
}

async function readPackageJsonVersion() {
    const packageJson = await readPackageJson()
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
    return files.map(name => name.match(/^changes_(\d+)\.(\d+)\.(\d+)\.md$/))
        .filter(match => match != null)
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
            description: "description",
            installableVersions: ["v1"],
            name: "name",
            bucketFsUploads: [],
            addInstance(_context, _version, _params) {
                return { name: "instance" }
            }, deleteInstance(_installation, _instance, _sqlClient) {
                // empty by intention
            }, findInstallations(_context, _exaAllScripts) {
                return []
            }, findInstances(_context, _installation) {
                return []
            }, install(_context, _version) {
                // empty by intention
            }, readInstanceParameters(_context, _installation, _instance) {
                return {values:[]}
            }, uninstall(_context, _installation) {
                // empty by intention
            },
        }
    }

    describe("registerExtension()", () => {
        it("registers an extension", () => {
            const ext = createDummyExtension()
            registerExtension(ext)
            const installedExtension: any = (global as any).installedExtension
            expect(installedExtension.apiVersion).toBe(CURRENT_API_VERSION)
            expect(installedExtension.extension).toBe(ext)
        })
    })
})
