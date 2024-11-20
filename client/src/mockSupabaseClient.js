const mockSupabaseClient = {
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn()
    }),
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null })
    }),
    removeChannel: jest.fn(),
    auth: {
      onAuthStateChange: jest.fn(),
      getSession: () => null,
      signOut: jest.fn()
    }
  };