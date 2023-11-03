import { JavaVirtualSchemaBaseExtension } from ".";
import { Parameter } from "../parameters";
import { PARAM_VIRTUAL_SCHEMA_NAME } from "./parameters";

export function getInstanceParameters(baseExtension: JavaVirtualSchemaBaseExtension): Parameter[] {
    return [PARAM_VIRTUAL_SCHEMA_NAME, ...baseExtension.builder.getParameters()]
}
