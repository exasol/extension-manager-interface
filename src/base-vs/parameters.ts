import { Parameter } from "../parameters";

export const PARAM_VIRTUAL_SCHEMA_NAME: Parameter = {
    id: "baseVirtualSchemaName",
    name: "Virtual schema name",
    description: "Name for the new virtual schema",
    type: "string",
    required: true,
    placeholder: "MY_VIRTUAL_SCHEMA",
    regex: "[a-zA-Z][a-zA-Z0-9_]*"
}
