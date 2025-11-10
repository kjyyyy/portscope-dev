// User profile types
export interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  company_id: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  created_at: string
  updated_at: string
  company_name: string
  unique_link: string
  description: string | null
  website: string | null
  is_active: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any> | null
}

export interface SignUpData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  companyName?: string
  companyUniqueLink?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  profile: UserProfile | null
}

