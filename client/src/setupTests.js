// Add jest-dom for additional matchers like toBeInTheDocument()
import "@testing-library/jest-dom";

// Mock TextEncoder and TextDecoder for compatibility in Node.js
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock matchMedia for components that use it
global.matchMedia = global.matchMedia || function () {
  return {
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
};

// Extend other global mocks if required
