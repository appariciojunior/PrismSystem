module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'packages/*/src/**/*.{js,jsx,ts,tsx}',
    'packages/*/*.js',
    '!packages/*/dist/**',
    '!packages/*/node_modules/**'
  ],
  testMatch: [
    '<rootDir>/packages/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/packages/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/packages/.*/dist/',
    '<rootDir>/packages/.*/node_modules/'
  ],
  verbose: true
};
