import { Context, ExaMetadata, ExasolExtension, ParameterValues, registerExtension } from "../api";
import { VersionExtractor } from "./adapterScript";
import { findInstallations } from "./findInstallations";
import { installExtension } from "./install";
import { uninstall } from "./uninstall";

/** Definition of a Java based Exasol `SCRIPT` with all information required for creating it in the database. */
export interface ScriptDefinition {
    name: string
    type: "SET" | "SCALAR"
    args: string
    scriptClass: string
}

export interface JavaBaseExtension {
    name: string
    description: string
    category: string
    version: string
    file: {
        name: string
        size: number
    }
    scripts: ScriptDefinition[]
    scriptVersionExtractor: VersionExtractor
}

/**
 * This method registers an extension at the GO JS runtime.
 *
 * @param extensionToRegister extension to register
 */
export function registerBaseExtension(extensionToRegister: JavaBaseExtension): void {
    registerExtension(createExtension(extensionToRegister));
}

export function createExtension(baseExtension: JavaBaseExtension): ExasolExtension {
    return {
        name: baseExtension.name,
        description: baseExtension.description,
        category: baseExtension.category,
        installableVersions: [{ name: baseExtension.version, latest: true, deprecated: false }],
        bucketFsUploads: [{
            bucketFsFilename: baseExtension.file.name,
            fileSize: baseExtension.file.size,
            name: baseExtension.file.name,
            downloadUrl: "(none)",
            licenseUrl: "(none)",
            licenseAgreementRequired: false
        }],
        findInstallations(context: Context, metadata: ExaMetadata) {
            return findInstallations(metadata.allScripts.rows, baseExtension)
        },
        install(context: Context, version: string): void {
            installExtension(context, baseExtension, version)
        },
        uninstall(context: Context, version: string) {
            uninstall(context, baseExtension, version)
        },
        findInstances(context: Context, version: string) {
            return []
        },
        getInstanceParameters(context: Context, version: string) {
            return []
        },
        readInstanceParameterValues(context: Context, version: string, instanceId: string) {
            return { values: [] }
        },
        upgrade(context: Context) {
            return { previousVersion: "0.1.0", newVersion: "0.2.0" }
        },
        addInstance(context: Context, version: string, params: ParameterValues) {
            return { id: "instanceId", name: "instance" }
        },
        deleteInstance(context: Context, instanceId: string) {
            // empty by intention
        },
    }
}