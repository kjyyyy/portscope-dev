import { useQuery } from '@tanstack/react-query'
import { portfolioService, type PortfolioCompany } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthProvider'

export function usePortfolioCompanies() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['portfolio-companies', user?.id],
    queryFn: async (): Promise<PortfolioCompany[]> => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      try {
        return await portfolioService.getCompanies(user.id)
      } catch (error) {
        // If table doesn't exist yet, return empty array
        const err = error as { code?: string; message?: string }
        if (err?.code === 'PGRST116' || err?.message?.includes('relation') || err?.message?.includes('does not exist')) {
          console.warn('Portfolio companies table does not exist yet. Returning empty array.');
          return []
        }
        throw error
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if table doesn't exist
  })
}

export function usePortfolioCompany(companyId: string | null) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['portfolio-company', companyId, user?.id],
    queryFn: async (): Promise<PortfolioCompany | null> => {
      if (!user?.id || !companyId) {
        return null
      }

      try {
        return await portfolioService.getCompany(companyId)
      } catch (error) {
        // If table doesn't exist yet or company not found, return null
        const err = error as { code?: string; message?: string }
        if (err?.code === 'PGRST116' || err?.message?.includes('relation') || err?.message?.includes('does not exist')) {
          console.warn('Portfolio companies table does not exist yet.');
          return null
        }
        if (err?.code === 'PGRST116' || err?.message?.includes('No rows')) {
          return null
        }
        throw error
      }
    },
    enabled: !!user?.id && !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if table doesn't exist
  })
}

