module.exports = {
    testEnvironment: 'jsdom', // Use jsdom for DOM-related tests
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest', // Transform JS/JSX files
    },
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
    },
    moduleFileExtensions: ['js', 'jsx'], // Recognize .js and .jsx files
  };
  