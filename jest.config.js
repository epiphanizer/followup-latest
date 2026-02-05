module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@env/(.*)$': '<rootDir>/src/environments/$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/testing/file-mock.ts'
  },
  transform: {
    '^.+\\.(ts|html)$': 'ts-jest'
  },
  transformIgnorePatterns: ['node_modules/(?!.*)'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
      diagnostics: false,
      isolatedModules: true
    }
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/e2e/'],
  collectCoverageFrom: [
    'src/app/**/*.{ts,js}',
    '!src/app/**/*.module.{ts,js}',
    '!src/main.ts',
    '!src/environments/**/*'
  ]
};
