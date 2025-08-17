/* eslint-disable */
export default {
  displayName: 'next-frontend',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/next-frontend',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts']
};
