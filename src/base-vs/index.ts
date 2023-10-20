import { Context, ExasolExtension, Instance, NotFoundError, Parameter } from "../api";
import { JavaBaseExtension, convertBaseExtension } from "../base";
import { findInstances } from "./findInstances";

export interface JavaVirtualSchemaBaseExtension extends JavaBaseExtension {
    instanceParameters: Parameter[]
    virtualSchemaAdapterScript: string
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
        findInstances(context: Context, _version: string): Instance[] {
            return findInstances(context, baseExtension.virtualSchemaAdapterScript);
        },
    }
}
