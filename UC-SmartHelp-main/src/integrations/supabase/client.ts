// src/integrations/supabase/client.ts

// This mock object intercepts all database calls and returns empty success responses
export const supabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    order: () => ({ 
      select: () => Promise.resolve({ data: [], error: null }),
      eq: () => Promise.resolve({ data: [], error: null }) 
    }),
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signUp: () => Promise.resolve({ data: { user: { id: 'mock-id' } }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: { id: 'mock-id' } }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  }
} as any;