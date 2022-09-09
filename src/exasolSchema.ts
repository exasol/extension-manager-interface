
/**
 * Content of Exasol metadata tables.
 */
export interface ExaMetadata {
    allScripts: ExaScripts
    virtualSchemas?: ExaVirtualSchemas
    virtualSchemaProperties?: ExaVirtualSchemaProperties
}

/**
 * The content of the SYS.EXA_ALL_SCRIPTS table.
 */
export interface ExaScripts {
    rows: ExaScriptsRow[]
}

/**
 * A single row of the SYS.EXA_ALL_SCRIPTS table.
 */
export interface ExaScriptsRow {
    schema: string
    name: string
    type: string
    inputType?: string
    resultType?: string
    text: string
    comment?: string
}

/**
 * The content of the SYS.EXA_ALL_VIRTUAL_SCHEMAS table.
 */
export interface ExaVirtualSchemas {
    rows: ExaVirtualSchemasRow[]
}

/**
 * A single row of the SYS.EXA_ALL_VIRTUAL_SCHEMAS table.
 */
export interface ExaVirtualSchemasRow {
    name: string
    owner: string
    adapterScriptSchema: string
    adapterScriptName: string
    adapterNotes: string
}

/**
 * The content of the SYS.EXA_ALL_VIRTUAL_SCHEMA_PROPERTIES table.
 */
export interface ExaVirtualSchemaProperties {
    rows: ExaVirtualSchemaPropertiesRow[]
}

/**
 * A single row of the SYS.EXA_ALL_VIRTUAL_SCHEMA_PROPERTIES table.
 */
export interface ExaVirtualSchemaPropertiesRow {

}