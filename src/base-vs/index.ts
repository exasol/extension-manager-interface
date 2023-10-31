import { Context, ExasolExtension, Instance, NotFoundError, Parameter, ParameterValues } from "../api";
import { JavaBaseExtension, convertBaseExtension } from "../base";
import { addInstance } from "./addInstance";
import { findInstances } from "./findInstances";
import { getInstanceParameters } from "./getInstanceParameters";
import { ParameterResolver, createParameterResolver } from "./parameterResolver";

/**
 * Simplified version of an {@link ExasolExtension} specifically for Java based virtual schemas.
 */
export interface JavaVirtualSchemaBaseExtension extends JavaBaseExtension {
    /** Unqualified name of the virtual schema adapter script, e.g. "S3_FILES_ADAPTER" */
    virtualSchemaAdapterScript: string,
    /** A builder for virtual schemas. Use function {@link createVirtualSchemaBuilder()} to create it. */
    builder: VirtualSchemaBuilder,
}

export interface ConnectionDefinition {
    connectionTo?: string
    user?: string
    identifiedBy?: string
}

export interface VirtualSchemaProperty {
    property: string
    value: string
}
export interface VirtualSchemaDefinition {
    adapterName: string
    properties: VirtualSchemaProperty[]
}

export interface VirtualSchemaBuilder {
    getParameters: () => Parameter[]
    buildVirtualSchema: (parameterResolver: ParameterResolver, connectionName?: string) => VirtualSchemaDefinition
    buildConnection: (parameterResolver: ParameterResolver) => ConnectionDefinition
}

export function convertVirtualSchemaBaseExtension(baseExtension: JavaVirtualSchemaBaseExtension): ExasolExtension {
    const extension = convertBaseExtension(baseExtension)
    return {
        ...extension,
        getInstanceParameters(context: Context, extensionVersion: string): Parameter[] {
            if (baseExtension.version !== extensionVersion) {
                throw new NotFoundError(`Version '${extensionVersion}' not supported, can only use '${baseExtension.version}'.`)
            }
            return getInstanceParameters(baseExtension)
        },
        findInstances(context: Context, _version: string): Instance[] {
            return findInstances(context, baseExtension.virtualSchemaAdapterScript);
        },
        addInstance(context: Context, versionToInstall: string, paramValues: ParameterValues): Instance {
            if (baseExtension.version !== versionToInstall) {
                throw new Error(`Version '${versionToInstall}' not supported, can only use ${baseExtension.version}.`)
            }
            const parameterResolver = createParameterResolver(paramValues)
            return addInstance(context, baseExtension, parameterResolver)
        }
    }
}

export * from './builders';
