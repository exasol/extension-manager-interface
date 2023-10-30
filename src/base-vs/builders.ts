import { ConnectionDefinition, VirtualSchemaBuilder, VirtualSchemaProperty } from ".";
import { Parameter } from "../parameters";
import { ParameterResolver } from "./parameterResolver";


export interface ConnectionParameterDefinition {
    /** Parameter definitions used in the CONNECTION */
    parameters: Parameter[]
    /** Factory function for a connection definition */
    builder: (parameterResolver: ParameterResolver) => ConnectionDefinition
}

export interface Config {
    /** Name of the adapter script, e.g. "S3_FILES_ADAPTER" */
    adapterName: string
    /** Parameter definitions used as properties for the VIRTUAL SCHEMA */
    virtualSchemaParameters: Parameter[]
    /** Name of the Virtual Schema's connection property, e.g. "CONNECTION_NAME" */
    connectionNameProperty: string
    /** Connection definition */
    connectionDefinition: ConnectionParameterDefinition
}

export function createVirtualSchemaBuilder({ adapterName, virtualSchemaParameters, connectionNameProperty, connectionDefinition }: Config): VirtualSchemaBuilder {

    function convertVirtualSchemaParameters(connectionName: string, parameterResolver: ParameterResolver) {
        const result: VirtualSchemaProperty[] = []
        result.push({ property: connectionNameProperty, value: connectionName })
        for (const param of virtualSchemaParameters) {
            const value = parameterResolver.resolveOptional(param)
            if (value) {
                result.push({ property: param.id, value })
            }
        }
        return result
    }

    return {
        getParameters() {
            return [...virtualSchemaParameters, ...connectionDefinition.parameters]
        },
        buildConnection: connectionDefinition.builder,
        buildVirtualSchema(parameterResolver: ParameterResolver, connectionName: string) {
            return { adapterName, properties: convertVirtualSchemaParameters(connectionName, parameterResolver) }
        },
    }
}

export function createJsonConnectionDefinition(parameters: Parameter[]): ConnectionParameterDefinition {
    function builder(parameterResolver: ParameterResolver): ConnectionDefinition {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const paramValues: any = {}
        for (const param of parameters) {
            const value = parameterResolver.resolveOptional(param)
            if (value) {
                /* eslint-disable @typescript-eslint/no-unsafe-member-access */
                paramValues[param.id] = value
            }
        }

        return { identifiedBy: JSON.stringify(paramValues) }
    }
    return { parameters, builder }
}

export function createUserPasswordConnectionDefinition(addressParam: Parameter, userParam: Parameter, passwordParam: Parameter): ConnectionParameterDefinition {
    function builder(parameterResolver: ParameterResolver): ConnectionDefinition {
        return {
            connectionTo: parameterResolver.resolve(addressParam),
            user: parameterResolver.resolve(userParam),
            identifiedBy: parameterResolver.resolve(passwordParam)
        }
    }
    return { parameters: [addressParam, userParam, passwordParam], builder }
}
