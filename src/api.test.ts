import { readFile } from "fs/promises";
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

describe("api", () => {
    describe("CURRENT_API_VERSION", () => {
        it("is equal to version in package.json", async () => {
            const packageJsonVersion = await readPackageJsonVersion()
            expect(CURRENT_API_VERSION).toBe(packageJsonVersion)
        })
    })

    function createDummyExtension(): ExasolExtension {
        return {
            description: "description",
            installableVersions: ["v1"],
            name: "name",
            bucketFsUploads: [],
            addInstance(_installation, _params, _sqlClient) {
                return { name: "instance" }
            }, deleteInstance(_installation, _instance, _sqlClient) {
                // empty by intention
            }, findInstallations(_sqlClient, _exaAllScripts) {
                return []
            }, findInstances(_installation, _sqlClient) {
                return []
            }, install(_sqlClient) {
                // empty by intention
            }, readInstanceParameters(_installation, _instance, _sqlClient) {
                return {}
            }, uninstall(_installation, _sqlClient) {
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
