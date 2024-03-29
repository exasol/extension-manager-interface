import { JavaVirtualSchemaBaseExtension } from ".";
import { Instance } from "../api";
import { Context } from "../context";
import { convertSchemaNameToInstanceId, escapeSingleQuotes, getConnectionName } from "./common";
import { ParameterAccessor } from "./parameterAccessor";
import { PARAM_VIRTUAL_SCHEMA_NAME } from "./parameters";

export function addInstance(context: Context, baseExtension: JavaVirtualSchemaBaseExtension, parameters: ParameterAccessor): Instance {
    const virtualSchemaName = parameters.get(PARAM_VIRTUAL_SCHEMA_NAME)
    const connectionName = getConnectionName(virtualSchemaName)
    context.sqlClient.execute(buildConnectionStatement(baseExtension, parameters, connectionName))
    context.sqlClient.execute(buildVirtualSchemaStatement(baseExtension, parameters, connectionName, context, virtualSchemaName))

    const comment = `Created by Extension Manager for ${baseExtension.name} v${baseExtension.version} ${escapeSingleQuotes(virtualSchemaName)}`;
    context.sqlClient.execute(`COMMENT ON CONNECTION "${connectionName}" IS '${comment}'`);
    context.sqlClient.execute(`COMMENT ON SCHEMA "${virtualSchemaName}" IS '${comment}'`);
    return { id: convertSchemaNameToInstanceId(virtualSchemaName), name: virtualSchemaName }
}

function buildVirtualSchemaStatement(baseExtension: JavaVirtualSchemaBaseExtension, parameters: ParameterAccessor, connectionName: string, context: Context, virtualSchemaName: string) {
    const def = baseExtension.builder.buildVirtualSchema(parameters, connectionName);
    const adapter = `"${context.extensionSchemaName}"."${baseExtension.virtualSchemaAdapterScript}"`;
    let stmt = `CREATE VIRTUAL SCHEMA "${virtualSchemaName}" USING ${adapter}`;
    if (def.properties.length > 0) {
        stmt += " WITH"
        for (const property of def.properties) {
            stmt += ` ${property.property} = '${escapeSingleQuotes(property.value)}'`;
        }
    }
    return stmt;
}

function buildConnectionStatement(baseExtension: JavaVirtualSchemaBaseExtension, parameters: ParameterAccessor, connectionName: string) {
    const connDef = baseExtension.builder.buildConnection(parameters);
    const to = connDef.connectionTo ?? '';
    let stmt = `CREATE OR REPLACE CONNECTION "${connectionName}" TO '${escapeSingleQuotes(to)}'`;
    if (connDef.user) {
        stmt += ` USER '${escapeSingleQuotes(connDef.user)}'`;
    }
    if (connDef.identifiedBy) {
        stmt += ` IDENTIFIED BY '${escapeSingleQuotes(connDef.identifiedBy)}'`;
    }
    return stmt;
}
