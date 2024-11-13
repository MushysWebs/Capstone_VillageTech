module.exports = {
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest', // Use Babel for JS/JSX files
    },
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
    },
    moduleFileExtensions: ['js', 'jsx'], // Recognize JS and JSX file extensions
  };
  