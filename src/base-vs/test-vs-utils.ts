import { JavaVirtualSchemaBaseExtension } from ".";
import { successResult } from "../base/common";

export function emptyBaseVsExtension(): JavaVirtualSchemaBaseExtension {
    return {
        name: "testing-base-extension",
        version: "v0",
        category: "test-category",
        description: "Testing base extension",
        file: {
            name: "test-ext.jar",
            size: 12345
        },
        scripts: [],
        scriptVersionExtractor: () => successResult("dummy version"),
        instanceParameters: [],
    }
}
