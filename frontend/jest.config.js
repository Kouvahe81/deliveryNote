module.exports = {
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: [
      '**/__tests__/**/*.+(js|jsx|ts|tsx)',
      '**/?(*.)+(spec|test).+(js|jsx|ts|tsx)',
    ],
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
  };
  