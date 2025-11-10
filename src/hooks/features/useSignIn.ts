import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SignInData } from '@/types/user'

export function useSignIn() {
  return useMutation({
    mutationFn: async (data: SignInData) => {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!authData.user) {
        throw new Error('Failed to sign in')
      }

      return authData
    },
  })
}

