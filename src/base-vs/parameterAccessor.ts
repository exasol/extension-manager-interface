import { Parameter, ParameterValues } from "../api";

/** Gives access to parameter values provided by the user. */
export interface ParameterAccessor {
    /**
     * Get the value of a mandatory parameter.
     * @param parameterDefinition parameter definition for which to get the parameter value
     * @returns parameter value
     * @throws an Error if the user did not provide a value for the parameter
     */
    get: (parameterDefinition: Parameter) => string;
    /**
     * Get the value of an optional parameter.
     * @param parameterDefinition parameter definition for which to get the parameter value
     * @returns parameter value or `undefined` if no value is available
     */
    getOptional: (parameterDefinition: Parameter) => string | undefined;
}

function buildValuesMap(values: ParameterValues): Map<string, string> {
    const valuesMap = new Map<string, string>()
    for (const value of values.values) {
        if (valuesMap.has(value.name)) {
            throw new Error(`Two values '${value.value}' and '${valuesMap.get(value.name)}' found for parameter ${value.name}`)
        }
        valuesMap.set(value.name, value.value)
    }
    return valuesMap
}

export function createParameterAccessor(paramValues: ParameterValues): ParameterAccessor {
    const values = buildValuesMap(paramValues)
    function getOptional(paramDef: Parameter): string | undefined {
        return values.get(paramDef.id);
    }

    function get(paramDef: Parameter): string {
        if (!paramDef.required) {
            throw new Error(`Parameter ${paramDef.id} is optional. Use method 'resolveOptional()' to resolve it.`)
        }
        const value = values.get(paramDef.id)
        if (!value) {
            throw new Error(`No value found for required parameter ${paramDef.id}`)
        }
        return value
    }
    return { getOptional, get }
}
