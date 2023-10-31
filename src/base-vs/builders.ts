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
    /**
     * Connection definition. Create a connection definition with one of the functions
     * {@link createJsonConnectionDefinition} or {@link createUserPasswordConnectionDefinition}
     */
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

/**
 * Creates the definition for a connection that contains all configuration formatted as JSON in the IDENTIFIED BY clause.
 * @param parameters parameter definitions
 * @returns connection definition
 */
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

/**
 * Creates the definition for a connection that contains TO, USER and IDENTIFIED BY clauses.
 * @param addressParam parameter definition for the TO clause
 * @param userParam  parameter definition for the USER clause
 * @param passwordParam  parameter definition for the IDENTIFIED BY clause
 * @returns connection definition
 */
export function createUserPasswordConnectionDefinition(addressParam: Parameter, userParam: Parameter, passwordParam: Parameter): ConnectionParameterDefinition {
    function builder(parameterResolver: ParameterResolver): ConnectionDefinition {
        return {
            connectionTo: addressParam ? parameterResolver.resolveOptional(addressParam) : undefined,
            user: userParam ? parameterResolver.resolveOptional(userParam) : undefined,
            identifiedBy: passwordParam ? parameterResolver.resolveOptional(passwordParam) : undefined
        }
    }
    return { parameters: [addressParam, userParam, passwordParam], builder }
}
