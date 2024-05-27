import { ExasolExtension } from "../api";
import { JavaVirtualSchemaBaseExtension, convertVirtualSchemaBaseExtension, createJsonConnectionDefinition, createVirtualSchemaBuilder } from "../base-vs";
import { successResult } from "../base/common";
import { testJavaVirtualSchemaBaseExtension } from "./vsTestBase";



function emptyBaseVsExtension(): JavaVirtualSchemaBaseExtension {
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
                { id: "VS_Required", name: "n1", type: "string", required: true },
                { id: "VS_Optional", name: "n2", type: "string", required: false }],
            connectionDefinition: createJsonConnectionDefinition([
                { id: "connRequired", name: "n1", type: "string", required: true },
                { id: "connOptional", name: "n2", type: "string", required: false }])
        })
    }
}

function createExtension(): ExasolExtension {
    return convertVirtualSchemaBaseExtension(emptyBaseVsExtension());
}

testJavaVirtualSchemaBaseExtension(createExtension);
