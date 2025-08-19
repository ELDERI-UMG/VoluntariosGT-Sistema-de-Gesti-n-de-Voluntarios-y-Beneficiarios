export default {
  testEnvironment: 'node',
  preset: null,
  transform: {},
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/*.(test|spec).[jt]s?(x)'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js'
  ]
};