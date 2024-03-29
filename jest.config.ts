
/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
const config = {
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    errorOnDeprecated: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    injectGlobals: false,
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    testMatch: [
        "**/?(*.)+(spec|test).ts"
    ],
    transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }]
    },
};

export default config;
