import { Context } from "vm";
import { BucketFSUpload, ExaMetadata, ExasolExtension, ParameterValues, registerExtension } from "../api";
import { VersionExtractor } from "./adapterScript";
import { findInstallations } from "./findInstallations";

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
    scriptVersionExtractor: VersionExtractor
}

/**
 * This method registers an extension at the GO JS runtime.
 *
 * @param extensionToRegister extension to register
 */
export function registerBaseExtension(extensionToRegister: BaseExtension): void {
    registerExtension(createExtension(extensionToRegister));
}

export function createExtension(baseExtension: BaseExtension): ExasolExtension {
    return {
        name: baseExtension.name,
        description: baseExtension.description,
        category: baseExtension.category,
        installableVersions: [{ name: baseExtension.version, latest: true, deprecated: false }],
        bucketFsUploads: baseExtension.bucketFsUploads,
        findInstallations(context: Context, metadata: ExaMetadata) {
            return findInstallations(metadata.allScripts.rows, baseExtension)
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