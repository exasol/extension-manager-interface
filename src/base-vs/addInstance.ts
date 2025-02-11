import { JavaVirtualSchemaBaseExtension } from ".";
import { BadRequestError, Instance, ParamValueType } from "../api";
import { Context } from "../context";
import { convertSchemaNameToInstanceId, escapeSingleQuotes, getConnectionName } from "./common";
import { findInstances } from "./findInstances";
import { ParameterAccessor } from "./parameterAccessor";
import { PARAM_VIRTUAL_SCHEMA_NAME } from "./parameters";

export function addInstance(context: Context, baseExtension: JavaVirtualSchemaBaseExtension, parameters: ParameterAccessor): Instance {
    const virtualSchemaName = parameters.get(PARAM_VIRTUAL_SCHEMA_NAME) as string
    checkInstanceDoesNotExist(context, baseExtension, virtualSchemaName);
    const connectionName = getConnectionName(virtualSchemaName)
    context.sqlClient.execute(buildConnectionStatement(baseExtension, parameters, connectionName))
    context.sqlClient.execute(buildVirtualSchemaStatement(baseExtension, parameters, connectionName, context, virtualSchemaName))

    const comment = `Created by Extension Manager for ${baseExtension.name} v${baseExtension.version} ${escapeSingleQuotes(virtualSchemaName)}`;
    context.sqlClient.execute(`COMMENT ON CONNECTION "${connectionName}" IS '${comment}'`);
    context.sqlClient.execute(`COMMENT ON SCHEMA "${virtualSchemaName}" IS '${comment}'`);
    return { id: convertSchemaNameToInstanceId(virtualSchemaName), name: virtualSchemaName }
}

/**
 * This function checks if a virtual schema with the given name already exists and throws an error if it does.
 * This ignores the case of the virtual schema name because the connection name is case-insensitive, see
 * [`CREATE CONNECTION` documentation](https://docs.exasol.com/db/latest/sql/create_connection.htm).
 * @param context the extension manager context
 * @param baseExtension the base extension
 * @param virtualSchemaName the name of the virtual schema to check
 */
function checkInstanceDoesNotExist(context: Context, baseExtension: JavaVirtualSchemaBaseExtension, virtualSchemaName: string) {
    const existingSchemas = findInstances(context, baseExtension.virtualSchemaAdapterScript)
        .filter(i => i.name.toUpperCase() === virtualSchemaName.toUpperCase());
    if (existingSchemas.length > 0) {
        throw new BadRequestError(`Virtual Schema '${existingSchemas[0].name}' already exists`);
    }
}

function buildVirtualSchemaStatement(baseExtension: JavaVirtualSchemaBaseExtension, parameters: ParameterAccessor, connectionName: string, context: Context, virtualSchemaName: string) {
    const def = baseExtension.builder.buildVirtualSchema(parameters, connectionName);
    const adapter = `"${context.extensionSchemaName}"."${baseExtension.virtualSchemaAdapterScript}"`;
    let stmt = `CREATE VIRTUAL SCHEMA "${virtualSchemaName}" USING ${adapter}`;
    if (def.properties.length > 0) {
        stmt += " WITH"
        for (const property of def.properties) {
            const escapedValue: ParamValueType = typeof property.value === "boolean" ? property.value : escapeSingleQuotes(property.value);
            stmt += ` ${property.property} = '${escapedValue}'`;
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
