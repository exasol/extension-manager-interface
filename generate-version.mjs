import { writeFileSync } from "fs";
import packageJson from "./package.json" with { type: "json" };

const targetFile = `${process.cwd()}/src/version.ts`
const version = packageJson.version
const content = `// This file is generated by generate-version.mjs
export const CURRENT_API_VERSION = "${version}";
`
console.log(`Writing version '${version}' to ${targetFile}`)
writeFileSync(targetFile, content)