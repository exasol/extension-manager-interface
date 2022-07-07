
/**
 * Content of Exasol metadata tables.
 */
export interface ExasolMetadata {
    allScripts: ExaAllScripts
    virtualSchemas: ExaAllVirtualSchemas
    virtualSchemaProperties: ExaAllVirtualSchemaProperties
}

/**
 * The content of the SYS.EXA_ALL_SCRIPTS table.
 */
export interface ExaAllScripts {
    rows: ExaAllScriptsRow[]
}

/**
 * A single row of the SYS.EXA_ALL_SCRIPTS table.
 */
export interface ExaAllScriptsRow {
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
export interface ExaAllVirtualSchemas {
    rows: ExaAllVirtualSchemasRow[]
}

/**
 * A single row of the SYS.EXA_ALL_VIRTUAL_SCHEMAS table.
 */
export interface ExaAllVirtualSchemasRow {

}

/**
 * The content of the SYS.EXA_ALL_VIRTUAL_SCHEMA_PROPERTIES table.
 */
export interface ExaAllVirtualSchemaProperties {
    rows: ExaAllVirtualSchemaPropertiesRow[]
}

/**
 * A single row of the SYS.EXA_ALL_VIRTUAL_SCHEMA_PROPERTIES table.
 */
export interface ExaAllVirtualSchemaPropertiesRow {

}