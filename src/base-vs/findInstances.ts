import { Instance } from "../api";
import { Context } from "../context";

export function findInstances(context: Context, adapterScript: string): Instance[] {
    const result = context.sqlClient.query("SELECT SCHEMA_NAME FROM SYS.EXA_ALL_VIRTUAL_SCHEMAS"
        + " WHERE ADAPTER_SCRIPT_SCHEMA = ? AND ADAPTER_SCRIPT_NAME = ? "
        + "ORDER BY SCHEMA_NAME", context.extensionSchemaName, adapterScript)
    return result.rows.map(row => {
        const schemaName = <string>row[0];
        return { id: schemaName, name: schemaName }
    })
}
