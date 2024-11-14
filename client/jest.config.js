require('dotenv').config({ path: './client/.env.local' });

module.exports = {
  testEnvironment: "jsdom", // Set the environment for React testing
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"], // Setup files to run before tests
  moduleDirectories: ["node_modules", "src"], // Allows absolute imports from the src directory
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy", // Mock CSS imports
  },
  collectCoverage: true, // Enable coverage collection
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/index.js", // Exclude specific files from coverage
    "!src/reportWebVitals.js",
  ],
  coverageDirectory: "coverage", // Directory where coverage reports are saved
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
