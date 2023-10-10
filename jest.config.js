module.exports = {
  rootDir: 'src/',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/$1',
    '#/(.*)$': '<rootDir>/types/$1',
    '~/(.*)$': '<rootDir>/task/$1',
  },
};
