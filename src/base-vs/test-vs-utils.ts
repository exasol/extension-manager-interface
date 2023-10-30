import { JavaVirtualSchemaBaseExtension, createJsonConnectionDefinition, createVirtualSchemaBuilder } from ".";
import { successResult } from "../base/common";

export function emptyBaseVsExtension(): JavaVirtualSchemaBaseExtension {
    const adapterName = "TESTING_ADAPTER"
    return {
        name: "testing-base-extension",
        version: "v0",
        category: "test-category",
        description: "Testing base extension",
        file: {
            name: "test-ext.jar",
            size: 12345
        },
        scripts: [{ name: adapterName, type: "SCALAR", args: "...", scriptClass: "com.exasol.TestingAdapter" }],
        scriptVersionExtractor: () => successResult("dummy version"),
        virtualSchemaAdapterScript: "vs-adapter-script-name",
        builder: createVirtualSchemaBuilder({
            adapterName, connectionNameProperty: "CONNECTION_NAME",
            virtualSchemaParameters: [
                { id: "vs-required", name: "n1", type: "string", required: true },
                { id: "vs-optional", name: "n2", type: "string", required: false }],
            connectionDefinition: createJsonConnectionDefinition([
                { id: "conn-required", name: "n1", type: "string", required: true },
                { id: "conn-optional", name: "n2", type: "string", required: false }])
        })
    }
}
