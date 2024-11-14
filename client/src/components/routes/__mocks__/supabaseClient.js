const supabase = {
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
    })),
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  };
  
  export { supabase };
  