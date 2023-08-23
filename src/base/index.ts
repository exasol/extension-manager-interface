import { Context, ExaMetadata, ExasolExtension, Instance, NotFoundError, Parameter, ParameterValues, registerExtension } from "../api";
import { Result } from "./common";
import { findInstallations } from "./findInstallations";
import { installExtension } from "./install";
import { uninstall } from "./uninstall";
import { upgrade } from "./upgrade";

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

export type VersionExtractor = (adapterScriptText: string) => Result<string>

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
        upgrade(context: Context) {
            return upgrade(context, baseExtension)
        },
        findInstances(_context: Context, _version: string): Instance[] {
            throw new NotFoundError("Finding instances not supported")
        },
        addInstance(_context: Context, _version: string, _params: ParameterValues): Instance {
            throw new NotFoundError("Creating instances not supported")
        },
        deleteInstance(_context: Context, _version: string, _instanceId: string): void {
            throw new NotFoundError("Deleting instances not supported")
        },
        getInstanceParameters(_context: Context, _version: string): Parameter[] {
            throw new NotFoundError("Creating instances not supported")
        },
        readInstanceParameterValues(_context: Context, _version: string, _instanceId: string): ParameterValues {
            throw new NotFoundError("Reading instance parameter values not supported")
        }
    }
}

export { jarFileVersionExtractor } from './jarFileVersionExtractor';
