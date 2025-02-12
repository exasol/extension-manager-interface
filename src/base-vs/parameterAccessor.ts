import { Parameter, ParameterValues, ParamValueType } from "../api";

/** Gives access to parameter values provided by the user. */
export interface ParameterAccessor {
    /**
     * Get the value of a mandatory parameter.
     * @param parameterDefinition parameter definition for which to get the parameter value
     * @returns parameter value
     * @throws an Error if the user did not provide a value for the parameter
     */
    get: (parameterDefinition: Parameter) => ParamValueType;
    /**
     * Get the value of an optional parameter.
     * @param parameterDefinition parameter definition for which to get the parameter value
     * @returns parameter value or `undefined` if no value is available
     */
    getOptional: (parameterDefinition: Parameter) => ParamValueType | undefined;
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

function valueTyped(value: string, paramDef: Parameter): ParamValueType {
    if (paramDef.type === "boolean") {
        switch (value) {
            case "true":
                return true
            case "false":
                return false;
            default:
                throw new Error(`Invalid value '${value}' found for boolean parameter ${paramDef.id}.`)
        }
    }

    return value;
}

export function createParameterAccessor(paramValues: ParameterValues): ParameterAccessor {
    const values = buildValuesMap(paramValues)
    function getOptional(paramDef: Parameter): ParamValueType | undefined {
        const value = values.get(paramDef.id);
        if (value === undefined) {
            return undefined;
        }

        return valueTyped(value, paramDef);
    }

    function get(paramDef: Parameter): ParamValueType {
        if (!paramDef.required) {
            throw new Error(`Parameter ${paramDef.id} is optional. Use method 'resolveOptional()' to resolve it.`)
        }
        const value = values.get(paramDef.id)
        if (!value) {
            throw new Error(`No value found for required parameter ${paramDef.id}`)
        }
        return valueTyped(value, paramDef);
    }
    return { getOptional, get }
}
