import { Context, ExasolExtension, Instance, NotFoundError, Parameter, ParameterValues } from "../api";
import { JavaBaseExtension, convertBaseExtension } from "../base";
import { addInstance } from "./addInstance";
import { deleteInstance } from "./deleteInstance";
import { findInstances } from "./findInstances";
import { getInstanceParameters } from "./getInstanceParameters";
import { ParameterAccessor, createParameterAccessor } from "./parameterAccessor";

/**
 * Simplified version of an {@link ExasolExtension} specifically for Java based `VIRTUAL SCHEMA`s.
 */
export interface JavaVirtualSchemaBaseExtension extends JavaBaseExtension {
    /** Unqualified name of the virtual schema `ADAPTER SCRIPT`, e.g. `S3_FILES_ADAPTER` */
    virtualSchemaAdapterScript: string,
    /** A builder for virtual schemas. Use function {@link createVirtualSchemaBuilder()} to create it. */
    builder: VirtualSchemaBuilder,
}

/** Definition of an Exasol `CONNECTION` object */
export interface ConnectionDefinition {
    /** Connection address, i.e. the `CONNECT TO '...'` part */
    connectionTo?: string
    /** Connection user, i.e. the `USER '...'` part */
    user?: string
    /** Connection password, i.e. the `IDENTIFIED BY '...'` part */
    identifiedBy?: string
}

/**
 * Property in the `WITH` clause of a `VIRTUAL SCHEMA` definition.
 * @see {@link VirtualSchemaDefinition}
 */
export interface VirtualSchemaProperty {
    /** Property name, e.g. `CONNECTION_NAME` or `MAPPING` */
    property: string
    /** Value of the property, e.g. `MY_S3_VS_CONNECTION` or `{...}` */
    value: string
}

/** Definition of a `VIRTUAL SCHEMA` */
export interface VirtualSchemaDefinition {
    /** Property values for the `WITH` clause */
    properties: VirtualSchemaProperty[]
}

/** A builder for creating `VIRTUAL SCHEMA`s including their `CONNECTION`. */
export interface VirtualSchemaBuilder {
    /**
     * Get all parameters for the `VIRTUAL SCHEMA` and `CONNECTION`.
     * @returns all parameters
     */
    getParameters: () => Parameter[]
    /**
     * Create the `VIRTUAL SCHEMA` definition incl. user provided parameter values.
     * @param parameters resolves {@link Parameter} objects to actual values supplied by the user
     * @param connectionName name of the connection to use for the virtual schema
     * @returns `VIRTUAL SCHEMA` definition
     */
    buildVirtualSchema: (parameters: ParameterAccessor, connectionName: string) => VirtualSchemaDefinition
    /**
     * Create the `CONNECTION` definition incl. user provided parameter values.
     * @param parameters resolves {@link Parameter} objects to actual values supplied by the user
     * @returns `CONNECTION` definition
     */
    buildConnection: (parameters: ParameterAccessor) => ConnectionDefinition
}

/**
 * Converts a {@link JavaVirtualSchemaBaseExtension} to an {@link ExasolExtension}.
 * Use this in your virtual schema extension to avoid duplicating code.
 * @param baseExtension the base extension to convert
 * @returns an {@link ExasolExtension}
 */
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
        findInstances(context: Context, version: string): Instance[] {
            verifyVersion(version)
            return findInstances(context, baseExtension.virtualSchemaAdapterScript);
        },
        addInstance(context: Context, versionToInstall: string, paramValues: ParameterValues): Instance {
            verifyVersion(versionToInstall)
            const parameters = createParameterAccessor(paramValues)
            return addInstance(context, baseExtension, parameters)
        },
        deleteInstance(context: Context, extensionVersion: string, instanceId: string) {
            verifyVersion(extensionVersion)
            deleteInstance(context, baseExtension, instanceId)
        },
    }
}

export * from './builders';
