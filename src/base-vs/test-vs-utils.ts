import { ParameterValue } from "../api.js";
import { successResult } from "../base/common.js";
import { createJsonConnectionDefinition, createVirtualSchemaBuilder } from "./builders.js";
import { JavaVirtualSchemaBaseExtension } from "./index.js";

export function emptyBaseVsExtension(): JavaVirtualSchemaBaseExtension {
    const adapterName = "vs-adapter-script-name"
    return {
        name: "testing-base-extension",
        version: "v0",
        category: "test-category",
        description: "Testing base extension",
        files: [{
            name: "test-ext.jar",
            size: 12345
        }],
        scripts: [{ name: adapterName, type: "SCALAR", parameters: "...", emitParameters: "...", scriptClass: "com.exasol.TestingAdapter" }],
        scriptVersionExtractor: () => successResult("dummy version"),
        virtualSchemaAdapterScript: adapterName,
        builder: createVirtualSchemaBuilder({
            connectionNameProperty: "CONNECTION_NAME",
            virtualSchemaParameters: [
                { id: "vs-required", name: "n1", type: "string", required: true },
                { id: "vs-optional", name: "n2", type: "string", required: false }],
            connectionDefinition: createJsonConnectionDefinition([
                { id: "conn-required", name: "n1", type: "string", required: true },
                { id: "conn-optional", name: "n2", type: "string", required: false }])
        })
    }
}

export function param(name: string, value: string): ParameterValue {
    return { name, value }
}

export function vsNameParam(vsName: string): ParameterValue {
    return param("base-vs.virtual-schema-name", vsName)
}
