import { Context, ExasolExtension, Instance, NotFoundError, Parameter, ParameterValues } from "../api";
import { JavaBaseExtension, convertBaseExtension } from "../base";
import { addInstance } from "./addInstance";
import { deleteInstance } from "./deleteInstance";
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
    properties: VirtualSchemaProperty[]
}

export interface VirtualSchemaBuilder {
    getParameters: () => Parameter[]
    buildVirtualSchema: (parameterResolver: ParameterResolver, connectionName?: string) => VirtualSchemaDefinition
    buildConnection: (parameterResolver: ParameterResolver) => ConnectionDefinition
}

export function convertVirtualSchemaBaseExtension(baseExtension: JavaVirtualSchemaBaseExtension): ExasolExtension {
    const extension = convertBaseExtension(baseExtension)

    function verifyVersion(version: string) {
        if (baseExtension.version !== version) {
            throw new NotFoundError(`Version '${version}' not supported, can only use '${baseExtension.version}'.`)
        }
    }

    return {
        ...extension,
        getInstanceParameters(context: Context, extensionVersion: string): Parameter[] {
            verifyVersion(extensionVersion)
            return getInstanceParameters(baseExtension)
        },
        findInstances(context: Context, _version: string): Instance[] {
            return findInstances(context, baseExtension.virtualSchemaAdapterScript);
        },
        addInstance(context: Context, versionToInstall: string, paramValues: ParameterValues): Instance {
            verifyVersion(versionToInstall)
            const parameterResolver = createParameterResolver(paramValues)
            return addInstance(context, baseExtension, parameterResolver)
        },
        deleteInstance(context: Context, extensionVersion: string, instanceId: string) {
            verifyVersion(extensionVersion)
            deleteInstance(context, baseExtension, instanceId)
        },
    }
}

export * from './builders';
