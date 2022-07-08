
/**
 * Abstract base for parameters.
 */
 interface BaseParameter {
    id: string
    name: string
    type: string
    condition?: Condition
    default?: string
    placeholder?: string
    readOnly?: boolean
    required?: boolean
}

/**
 * String parameter.
 */
export interface StringParameter extends BaseParameter {
    type: "string"
    /** Regex that must match the expected string. Provide a regex starting with ^ and ending with $ so that it matches the whole string. 
    The type must be 'string' because we can't use RegExp here since it can't be exported to JSON and not be exported by GoJa. */
    regex?: string
    /** If this is set to true, the UI will show a multiline textarea. */
    multiline?: boolean
    /** If set to true, the UI will display a password field with *****. */
    secret?: boolean
}

/**
 * Parameter type.
 */
export type Parameter = StringParameter | SelectParameter;

/**
 * Type for a map for select options.
 * Map: value to select -> display name
 */
export interface OptionsType {
    [index: string]: string
}

/**
 * Parameter that allows to select a value from a list.
 */
export interface SelectParameter extends BaseParameter {
    options: OptionsType
    type: "select"
}

/**
 * Condition for conditional parameters.
 */
export type Condition = Comparison | And | Or;

/**
 * Comparison operators
 */
export enum Operators {
    EQ, LESS, GREATER, LESS_EQUAL, GREATER_EQ
}

/**
 * Comparison of a parameter value and given value.
 */
export interface Comparison {
    /** parameter name */
    parameter: string
    /** Value to compare with */
    value: string | number
    operator: Operators
}

/** And predicate */
export interface And {
    and: Condition[]
}

/** Or predicate */
export interface Or {
    or: Condition[]
}

/** Not predicate */
export interface Not {
    not: Condition
}
