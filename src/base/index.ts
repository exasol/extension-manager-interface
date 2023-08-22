import { Context } from "vm";
import { BucketFSUpload, ExaMetadata, ExasolExtension, ParameterValues, registerExtension } from "../api";

/** Definition of an Exasol `SCRIPT` with all information required for creating it in the database. */
export interface ScriptDefinition {
    name: string
    type: "SET" | "SCALAR"
    args: string
    scriptClass: string
}

export interface BaseExtension {
    name: string
    description: string
    category: string
    version: string
    bucketFsUploads: BucketFSUpload[]
    scripts: ScriptDefinition[]
}

/**
 * This method registers an extension at the GO JS runtime.
 *
 * @param extensionToRegister extension to register
 */
export function registerBaseExtension(extensionToRegister: BaseExtension): void {
    registerExtension(createExtension(extensionToRegister));
}

function createExtension(extension: BaseExtension): ExasolExtension {
    return {
        name: extension.name,
        description: extension.description,
        category: extension.category,
        installableVersions: [{ name: extension.version, latest: true, deprecated: false }],
        bucketFsUploads: extension.bucketFsUploads,
        findInstallations(context: Context, metadata: ExaMetadata) {
            return []
        },
        install(context: Context, version: string): void {
            // empty by intention
        },
        uninstall(context: Context, version: string) {
            // empty by intention
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