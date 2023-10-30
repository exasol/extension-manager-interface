import { Parameter, ParameterValues } from "../api";

export interface ParameterResolver {
    resolve: (parameterDefinition: Parameter) => string;
    resolveOptional: (parameterDefinition: Parameter) => string | undefined;
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

export function createParameterResolver(paramValues: ParameterValues): ParameterResolver {
    const values = buildValuesMap(paramValues)
    function resolveOptional(paramDef: Parameter): string | undefined {
        if (paramDef.type !== "string" && paramDef.type !== "select") {
            throw new Error(`Parameter type ${paramDef.type} for parameter ${paramDef.id} not supported`)
        }
        if (paramDef.required && !values.has(paramDef.id)) {
            throw new Error(`Parameter ${paramDef.id} is required but not defined`)
        }
        return values.get(paramDef.id);
    }

    function resolve(paramDef: Parameter): string {
        if (paramDef.type !== "string" && paramDef.type !== "select") {
            throw new Error(`Parameter type ${paramDef.type} for parameter ${paramDef.id} not supported`)
        }
        if (!paramDef.required) {
            throw new Error(`Parameter ${paramDef.id} is optional. Use method 'resolveOptional()' to resolve it.`)
        }
        const value = values.get(paramDef.id)
        if (!value) {
            throw new Error(`No value found for required parameter ${paramDef.id}`)
        }
        return value
    }
    return { resolveOptional, resolve }
}
