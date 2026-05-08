/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Procura por arquivos .spec.ts ou .test.ts dentro de src
  testMatch: ['**/src/**/*.spec.ts', '**/src/**/*.test.ts'],
  // Garante que o Jest entenda onde estão os módulos
  moduleDirectories: ['node_modules', 'src'],
};