import { Context, ExasolExtension, Instance, NotFoundError, Parameter, ParameterValues } from "../api";
import { JavaBaseExtension, convertBaseExtension } from "../base";
import { addInstance } from "./addInstance";
import { findInstances } from "./findInstances";

export interface JavaVirtualSchemaBaseExtension extends JavaBaseExtension {
    instanceParameterDefinitions: Parameter[]
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
            return baseExtension.instanceParameterDefinitions
        },
        findInstances(context: Context, _version: string): Instance[] {
            return findInstances(context, baseExtension.virtualSchemaAdapterScript);
        },
        addInstance(context: Context, versionToInstall: string, paramValues: ParameterValues): Instance {
            if (baseExtension.version !== versionToInstall) {
                throw new Error(`Version '${versionToInstall}' not supported, can only use ${baseExtension.version}.`)
            }
            return addInstance(context, instanceParameterDefinitions, paramValues)
        }
    }
}
