import { ConnectionDefinition, VirtualSchemaBuilder, VirtualSchemaProperty } from ".";
import { Parameter, ParamValueType } from "../parameters";
import { ParameterAccessor } from "./parameterAccessor";

/**
 * Definition of `CONNECTION` parameters.
 * @see {@link createUserPasswordConnectionDefinition}
 * @see {@link createJsonConnectionDefinition}
 */
export interface ConnectionParameterDefinition {
    /** Parameter definitions used in the `CONNECTION` */
    parameters: Parameter[]
    /** Factory function for a `CONNECTION` definition */
    builder: (parameters: ParameterAccessor) => ConnectionDefinition
}

/** Configuration for the function {@link createVirtualSchemaBuilder()} */
export interface Config {
    /** Parameter definitions used as properties for the `VIRTUAL SCHEMA` */
    virtualSchemaParameters: Parameter[]
    /** Name of the Virtual Schema's connection property, e.g. `CONNECTION_NAME` */
    connectionNameProperty: string
    /**
     * Connection definition. Create a connection definition with one of the functions
     * {@link createJsonConnectionDefinition} or {@link createUserPasswordConnectionDefinition}
     */
    connectionDefinition: ConnectionParameterDefinition
}

/**
 * Create a virtual schema builder.
 * @param param0 configuration
 * @returns a new virtual schema builder
 */
export function createVirtualSchemaBuilder({ virtualSchemaParameters, connectionNameProperty, connectionDefinition }: Config): VirtualSchemaBuilder {
    function convertVirtualSchemaParameters(connectionName: string, parameters: ParameterAccessor) {
        const result: VirtualSchemaProperty[] = []
        result.push({ property: connectionNameProperty, value: connectionName })
        for (const param of virtualSchemaParameters) {
            const value = parameters.getOptional(param)
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
        buildVirtualSchema(parameters: ParameterAccessor, connectionName: string) {
            return { properties: convertVirtualSchemaParameters(connectionName, parameters) }
        },
    }
}

/**
 * Creates the definition for a connection that contains all configuration formatted as JSON in the `IDENTIFIED BY` clause.
 * This is usually used in document based virtual schemas.
 * @param parameterDefinitions parameter definitions
 * @returns connection definition
 */
export function createJsonConnectionDefinition(parameterDefinitions: Parameter[]): ConnectionParameterDefinition {
    function builder(parameters: ParameterAccessor): ConnectionDefinition {
        const paramValues: Record<string, ParamValueType> = {}
        for (const param of parameterDefinitions) {
            const value = parameters.getOptional(param)
            if (value !== undefined) {
                paramValues[param.id] = value
            }
        }

        return { identifiedBy: JSON.stringify(paramValues) }
    }
    return { parameters: parameterDefinitions, builder }
}

/**
 * Creates the definition for a connection that contains `TO`, `USER` and `IDENTIFIED BY` clauses.
 * This is usually used in JDBC based virtual schemas.
 * @param addressParam parameter definition for the `TO` clause
 * @param userParam  parameter definition for the `USER` clause
 * @param passwordParam  parameter definition for the `IDENTIFIED BY` clause
 * @returns connection definition
 */
export function createUserPasswordConnectionDefinition(addressParam: Parameter, userParam: Parameter, passwordParam: Parameter): ConnectionParameterDefinition {
    function builder(parameters: ParameterAccessor): ConnectionDefinition {
        return {
            connectionTo: addressParam ? parameters.getOptional(addressParam) as string : undefined,
            user: userParam ? parameters.getOptional(userParam) as string : undefined,
            identifiedBy: passwordParam ? parameters.getOptional(passwordParam) as string : undefined
        }
    }
    return { parameters: [addressParam, userParam, passwordParam], builder }
}
