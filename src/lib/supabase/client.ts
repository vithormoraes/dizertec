import { createBrowserClient } from '@supabase/ssr'

// Flag para modo de desenvolvimento sem Supabase
const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClient() {
  if (MOCK_MODE) {
    // Retorna um cliente mock para desenvolvimento
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Modo de desenvolvimento - Configure o Supabase para login real' } }),
        signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Modo de desenvolvimento - Configure o Supabase para cadastro real' } }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
      }),
    } as any
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
