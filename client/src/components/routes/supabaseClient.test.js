import { supabase } from './supabaseClient';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock the required environment variables
jest.mock('process', () => ({
  ...jest.requireActual('process'),
  env: {
    REACT_APP_SUPABASE_URL: 'https://your-supabase-url.supabase.co',
    REACT_APP_SUPABASE_ANON_KEY: 'your-supabase-anon-key',
  },
}));

// Mock the `createClientComponentClient` function
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(),
}));

describe('supabaseClient.js', () => {
  beforeEach(() => {
    // Reset the mock before each test
    createClientComponentClient.mockClear();
  });

  test('should initialize supabase client with correct URL and key', () => {
    // Call the module to trigger the client initialization
    require('./supabaseClient'); // This will run the code and call createClientComponentClient

    // Check if createClientComponentClient was called with the correct arguments
    expect(createClientComponentClient).toHaveBeenCalledWith({
      supabaseUrl: 'https://your-supabase-url.supabase.co',
      supabaseKey: 'your-supabase-anon-key',
    });
  });

  test('should throw an error if the Supabase URL is missing', () => {
    // Temporarily mock missing environment variable
    process.env.REACT_APP_SUPABASE_URL = '';

    expect(() => {
      require('./supabaseClient'); // This should throw an error
    }).toThrow('Missing Supabase environment variables');
  });

  test('should throw an error if the Supabase anon key is missing', () => {
    // Temporarily mock missing environment variable
    process.env.REACT_APP_SUPABASE_ANON_KEY = '';

    expect(() => {
      require('./supabaseClient'); // This should throw an error
    }).toThrow('Missing Supabase environment variables');
  });
});
