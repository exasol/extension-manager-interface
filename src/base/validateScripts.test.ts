
import { describe, expect, it } from '@jest/globals';
import { ExaScriptsRow } from '../exasolSchema';
import { AdapterScript } from './adapterScript';
import { failureResult, successResult } from './common';
import { ScalarSetScriptDefinition, ScriptDefinition, VersionExtractor } from './index';
import { InstalledScripts, validateInstalledScripts, validateVersions } from './validateScripts';

function script({ schema = "schema", name = "name", inputType, resultType = "EMITS", type = "UDF", text = "", comment }: Partial<ExaScriptsRow>): ExaScriptsRow {
    return { schema, name, inputType, resultType, type, text, comment }
}

function def({ name = "name", type = "SET", parameters = "param", emitParameters = "emitParam", scriptClass = "script class" }: Partial<ScalarSetScriptDefinition>): ScriptDefinition {
    return { name, type, parameters, emitParameters, scriptClass };
}

function scriptWithVersion(name: string, version: string): AdapterScript {
    return new AdapterScript(script({ name, text: version }), mockVersionExtractor)
}
function scriptWithoutVersion(name: string, versionFailureMessage: string): AdapterScript {
    return new AdapterScript(script({ name }), failingVersionExtractor(versionFailureMessage))
}

const mockVersionExtractor: VersionExtractor = (adapterScriptText: string) => successResult(adapterScriptText);
const failingVersionExtractor: (failureMessage: string) => VersionExtractor = (failureMessage: string) => (_adapterScriptText: string) => failureResult(failureMessage);

describe("validateScripts", () => {
    describe("validateInstalledScripts()", () => {
        const scriptA = script({ name: "SCRIPT_A" })
        const scriptB = script({ name: "SCRIPT_B" })
        const scriptDefA = def({ name: "SCRIPT_A" })
        const scriptDefB = def({ name: "SCRIPT_B" })

        describe("success", () => {
            const tests: { name: string; scripts: ExaScriptsRow[], definitions: ScriptDefinition[], expected: ExaScriptsRow[] }[] = [
                { name: "no script required", scripts: [], definitions: [], expected: [] },
                { name: "all scripts available", scripts: [scriptA, scriptB], definitions: [scriptDefA, scriptDefB], expected: [scriptA, scriptB] },
                { name: "additional scripts ignored", scripts: [scriptA, scriptB], definitions: [scriptDefA], expected: [scriptA] },
            ]
            tests.forEach(test => it(test.name, () => {
                const expected = new Map<string, AdapterScript>()
                test.expected.forEach(script => {
                    expected.set(script.name, new AdapterScript(script, mockVersionExtractor))
                });
                expect(validateInstalledScripts(test.scripts, test.definitions, mockVersionExtractor)).toStrictEqual(successResult(expected))
            }));
        })

        describe("scripts missing", () => {
            const tests: { name: string; scripts: ExaScriptsRow[], expectedMessage: string }[] = [
                { name: "all scripts missing", scripts: [], expectedMessage: "Validation failed: Script 'SCRIPT_A' is missing, Script 'SCRIPT_B' is missing" },
                { name: "importPath missing", scripts: [scriptA], expectedMessage: "Validation failed: Script 'SCRIPT_B' is missing" },
            ]
            tests.forEach(test => it(test.name, () => {
                expect(validateInstalledScripts(test.scripts, [scriptDefA, scriptDefB], mockVersionExtractor)).toStrictEqual(failureResult(test.expectedMessage))
            }));
        })


        describe("validateVersions()", () => {

            function installedScripts(scripts: AdapterScript[]): InstalledScripts {
                const installedScripts = new Map<string, AdapterScript>()
                scripts.forEach(script => installedScripts.set(script.name, script))
                return installedScripts
            }

            describe("success", () => {
                const tests: { name: string; scripts: AdapterScript[], expectedVersion: string }[] = [
                    { name: "single script", scripts: [scriptWithVersion("s1", "v1")], expectedVersion: "v1" },
                    { name: "two scripts", scripts: [scriptWithVersion("s1", "v1"), scriptWithVersion("s2", "v1")], expectedVersion: "v1" },
                    { name: "three scripts", scripts: [scriptWithVersion("s1", "v1"), scriptWithVersion("s2", "v1"), scriptWithVersion("s3", "v1")], expectedVersion: "v1" },
                ]
                tests.forEach(test => it(test.name, () => {
                    expect(validateVersions(installedScripts(test.scripts))).toStrictEqual(successResult(test.expectedVersion))
                }))
            })


            describe("failure", () => {
                const tests: { name: string; scripts: AdapterScript[], expectedMessage: string }[] = [
                    { name: "empty input", scripts: [], expectedMessage: "No script given" },
                    { name: "single script with unknown version", scripts: [scriptWithoutVersion("s1", "mock error")], expectedMessage: "Failed to get versions: Script 's1': mock error" },
                    { name: "two scripts with unknown versions", scripts: [scriptWithoutVersion("s1", "mock error1"), scriptWithoutVersion("s2", "mock error2")], expectedMessage: "Failed to get versions: Script 's1': mock error1, Script 's2': mock error2" },
                    { name: "one script success, one script failure", scripts: [scriptWithoutVersion("s1", "mock error1"), scriptWithVersion("s2", "v2")], expectedMessage: "Failed to get versions: Script 's1': mock error1" },
                    { name: "inconsistent versions", scripts: [scriptWithVersion("s1", "v1"), scriptWithVersion("s2", "v2")], expectedMessage: "Not all scripts use the same version. Found 2 different versions: 'v1, v2'" },
                ]
                tests.forEach(test => it(test.name, () => {
                    expect(validateVersions(installedScripts(test.scripts))).toStrictEqual(failureResult(test.expectedMessage))
                }))
            })
        })
    })
})
