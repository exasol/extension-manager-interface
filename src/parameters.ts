
/**
 * The definition of a parameter.
 */
export type Parameter = StringParameter | SelectParameter | BooleanParameter;

/**
 * Abstract base interface with common fields for parameter definitions.
 */
interface BaseParameter {
    /** A unique identifier for the parameter */
    id: string
    /** The name displayed to the user */
    name: string
    /** Detailed description displayed to the user e.g. in a tooltip */
    description?: string
    /** The type of the parameter */
    type: string
    /** Defines if a value must be specified (`true`) or if it is optional (`false`). Default: `false`. */
    required?: boolean
    /** An optional condition */
    condition?: Condition
    default?: string
    /** Short hint that describes the expected value of the input field */
    placeholder?: string
    readOnly?: boolean
}

/**
 * The definition of a string parameter. Values can be any string that optionally matches the given regular expression.
 */
export interface StringParameter extends BaseParameter {
    type: "string"
    /**
     * Regular expression that must match the expected string.
     * Provide a regex starting with `^` and ending with `$` so that it matches the whole string. 
     * The type must be `string` because we can't use RegExp here since it can't be exported to JSON and not be exported by GoJa.
     */
    regex?: string
    /** If this is set to `true`, the UI will show a multiline textarea, default: `false`. */
    multiline?: boolean
    /** If set to `true`, the UI will display a password field with `*****`, default: `false`. */
    secret?: boolean
}

/**
 * The definition of a boolean parameter. Values can only be `true` or `false`.
 */
export interface BooleanParameter extends BaseParameter {
    type: "boolean"
}

/**
 * The definition of a "select" parameter that allows to select a value from a list.
 */
export interface SelectParameter extends BaseParameter {
    type: "select"
    /** The available options for the parameter values. */
    options: SelectOption[]
}

/**
 * An option for a {@link SelectParameter}.
 */
export interface SelectOption {
    /** The internal ID of this option */
    id: string
    /** The name of this options to be displayed to the user */
    name: string
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
