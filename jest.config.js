module.exports = {
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['ts', 'js'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/*.test.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc-node/jest',
  }
}
