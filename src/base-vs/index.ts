import { Context, ExasolExtension, NotFoundError, Parameter } from "../api";
import { JavaBaseExtension, convertBaseExtension } from "../base";

export interface JavaVirtualSchemaBaseExtension extends JavaBaseExtension {
    instanceParameters: Parameter[]
}


export function convertVirtualSchemaBaseExtension(baseExtension: JavaVirtualSchemaBaseExtension): ExasolExtension {
    const extension = convertBaseExtension(baseExtension)

    return {
        ...extension,
        getInstanceParameters(context: Context, extensionVersion: string): Parameter[] {
            if (baseExtension.version !== extensionVersion) {
                throw new NotFoundError(`Version '${extensionVersion}' not supported, can only use '${baseExtension.version}'.`)
            }
            return baseExtension.instanceParameters
        },
    }
}
