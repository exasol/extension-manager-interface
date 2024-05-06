import { Parameter } from "../parameters.js";

export const PARAM_VIRTUAL_SCHEMA_NAME: Parameter = {
    id: "base-vs.virtual-schema-name", name: "Virtual Schema name", description: "Name for the new virtual schema",
    type: "string", required: true, placeholder: "MY_VIRTUAL_SCHEMA", regex: "[a-zA-Z_]+"
}
