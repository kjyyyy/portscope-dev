import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/user'

export function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!userId) return null

      try {
        // First, verify we have an authenticated session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          console.warn('[useUserProfile] No active session, cannot fetch profile')
          return null
        }

        // Use .select() without .maybeSingle() to avoid 406 issues with RLS
        // Then handle empty arrays manually
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .limit(1) // Only fetch one row

        if (error) {
          // Log the actual error for debugging
          console.error('[useUserProfile] Supabase error:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            userId
          })
          
          // 406 errors can occur with Accept header issues or RLS blocking
          // PGRST116 = no rows returned
          if (error.code === 'PGRST116' || error.code === '406' || error.message?.includes('406')) {
            // Profile doesn't exist or RLS blocked - return null gracefully
            console.warn('[useUserProfile] Profile not found or access denied (406/PGRST116):', userId)
            return null
          }
          throw new Error(error.message)
        }

        // Handle empty array (no profile found)
        if (!data || data.length === 0) {
          // Silently return null - profile is optional for MVP
          // Only log in development mode to reduce console noise
          if (process.env.NODE_ENV === 'development') {
            console.log('[useUserProfile] No profile found for user (this is normal if profile not created yet):', userId)
          }
          return null
        }

        return data[0] // Return first (and only) result
      } catch (err) {
        // Handle any unexpected errors, including network issues
        const error = err as { code?: string; message?: string }
        console.error('[useUserProfile] Unexpected error:', err)
        if (error?.message?.includes('406') || error?.code === '406') {
          // 406 Not Acceptable - profile likely doesn't exist or RLS blocked
          return null
        }
        throw err
      }
    },
    enabled: !!userId,
    retry: false, // Don't retry - 406 errors are expected when profile doesn't exist
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus to reduce 406 errors
    refetchOnMount: false, // Only refetch if data is stale
    refetchOnReconnect: false, // Don't refetch on reconnect
  })
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<UserProfile> }) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', variables.userId] })
    },
  })
}

