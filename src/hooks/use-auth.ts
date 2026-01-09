'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { mockUser } from '@/lib/mock-data'
import { useAuthStore } from '@/store'
import type { Profile } from '@/types'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function useAuth() {
  const router = useRouter()
  const { user, setUser, setLoading, logout: storeLogout } = useAuthStore()

  useEffect(() => {
    if (MOCK_MODE) {
      setUser(mockUser)
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Buscar sessão inicial
    const getInitialSession = async () => {
      setLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Buscar profile real no Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setUser({
            ...profile,
            email: session.user.email,
          } as Profile)
        }
      } else {
        setUser(null)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profile) {
            setUser({
              ...profile,
              email: session.user.email,
            } as Profile)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setLoading])

  const logout = async () => {
    if (MOCK_MODE) {
      storeLogout()
      router.push('/login')
      return
    }

    const supabase = createClient()
    await supabase.auth.signOut()
    storeLogout()
    router.push('/login')
  }

  return {
    user,
    logout,
  }
}
