import type { Config } from 'jest';

/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
const config: Config = {
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    preset: 'ts-jest',
    injectGlobals: false,
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
};

export default config;
