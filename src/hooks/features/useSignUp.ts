import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SignUpData } from '@/types/user'

export function useSignUp() {
  return useMutation({
    mutationFn: async (data: SignUpData) => {
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not configured. Please check your environment variables.')
      }

      // Sign up user with Supabase Auth
      let authData, authError
      try {
        const result = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        })
        authData = result.data
        authError = result.error
      } catch (error) {
        // Handle network errors
        const err = error as Error
        if (err.message.includes('Failed to fetch') || err.message.includes('ERR_NAME_NOT_RESOLVED')) {
          throw new Error('Unable to connect to authentication service. Please check your internet connection and try again.')
        }
        throw new Error(err.message || 'Failed to create account. Please try again.')
      }

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Failed to create user')
      }

      let companyId: string | null = null

      // If company name and unique link provided, create or link to company
      if (data.companyName && data.companyUniqueLink) {
        // First, check if company with this unique link already exists
        const { data: existingCompany } = await supabase
          .from('companies')
          .select('id')
          .eq('unique_link', data.companyUniqueLink)
          .single()

        if (existingCompany) {
          // Link to existing company
          companyId = existingCompany.id
        } else {
          // Create new company
          const { data: newCompany, error: companyError } = await supabase
            .from('companies')
            .insert({
              company_name: data.companyName,
              unique_link: data.companyUniqueLink,
            })
            .select('id')
            .single()

          if (companyError) {
            console.error('Failed to create company:', companyError)
            // Continue without company - don't fail signup
          } else {
            companyId = newCompany.id
          }
        }
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          first_name: data.firstName || null,
          last_name: data.lastName || null,
          company_id: companyId,
        })

      if (profileError) {
        // If profile creation fails, we still have the auth user
        // but log the error
        console.error('Failed to create user profile:', profileError)
      }

      return authData
    },
  })
}

