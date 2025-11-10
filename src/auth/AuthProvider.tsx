import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useUserProfile } from '@/hooks/features/useUserProfile'
import type { AuthUser, UserProfile } from '@/types/user'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  profile: UserProfile | null
  profileLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.id || null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const authUser: AuthUser | null = user
    ? {
        id: user.id,
        email: user.email || '',
        profile: profile || null,
      }
    : null

  return (
    <AuthContext.Provider
      value={{
        user: authUser,
        session,
        loading,
        profile: profile || null,
        profileLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

