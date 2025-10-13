import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface PortfolioCompany {
  id: string
  created_at: string
  updated_at: string
  
  // Basic Information
  company_name: string
  legal_entity_name?: string
  headquarters?: string
  website?: string
  
  // Investment Details
  sector?: string
  subsector?: string
  investment_theme?: string
  stage?: 'seed' | 'series_a' | 'series_b' | 'growth' | 'late_stage'
  ownership_percentage?: number
  investment_type?: 'equity' | 'debt' | 'convertible' | 'preferred'
  
  // Investment Timeline
  initial_investment_date?: string
  latest_valuation_date?: string
  deal_lead?: string
  board_representative?: string
  key_contacts?: Contact[]
  
  // Financial Metrics
  initial_investment_amount?: number
  total_invested?: number
  current_fair_value?: number
  realized_value?: number
  nav_percentage?: number
  valuation_method?: string
  revenue?: number
  ebitda?: number
  leverage_ratio?: number
  
  // Performance Metrics
  irr?: number
  moic?: number
  dpi?: number
  quarterly_growth_rate?: number
  headcount?: number
  esg_score?: number
  
  // Metadata
  status?: 'active' | 'exited' | 'written_off'
  created_by?: string
  tags?: string[]
  notes?: string
}

export interface Contact {
  name: string
  title?: string
  email?: string
  phone?: string
  role: 'ceo' | 'cfo' | 'board_member' | 'key_employee' | 'advisor'
  is_primary?: boolean
  notes?: string
  linkedin_url?: string
}

export interface Document {
  id: string
  created_at: string
  updated_at: string
  
  // File Information
  file_name: string
  file_size?: number
  file_type?: string
  file_url: string
  file_path: string
  
  // Document Metadata
  document_type: 'investment_memo' | 'financials' | 'valuation_report' | 'board_materials' | 'legal' | 'other'
  as_of_date?: string
  quarter?: string
  valuation_method?: string
  prepared_by?: string
  confidentiality_level?: 'public' | 'internal' | 'confidential' | 'restricted'
  
  // Relationships
  portfolio_company_id: string
  uploaded_by?: string
  
  // Versioning
  version_number?: number
  parent_document_id?: string
  
  // Additional Metadata
  description?: string
  tags?: string[]
  is_latest_version?: boolean
}

export interface DocumentTag {
  id: string
  created_at: string
  document_id: string
  tag_name: string
  tag_value?: string
  tag_category: 'type' | 'date' | 'method' | 'confidentiality' | 'custom'
}

export interface PerformanceUpdate {
  id: string
  created_at: string
  portfolio_company_id: string
  
  // Update Period
  quarter: string
  year: number
  update_date: string
  
  // Financial Updates
  revenue?: number
  ebitda?: number
  cash_position?: number
  burn_rate?: number
  
  // Operational Updates
  headcount?: number
  key_milestones?: string[]
  challenges?: string[]
  
  // Performance Metrics
  irr?: number
  moic?: number
  valuation?: number
  valuation_method?: string
  
  // Additional Info
  notes?: string
  updated_by?: string
}

// Helper functions for common operations
export const portfolioService = {
  // Get all portfolio companies for a user
  async getCompanies(userId: string) {
    const { data, error } = await supabase
      .from('portfolio_companies')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create a new portfolio company
  async createCompany(company: Omit<PortfolioCompany, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('portfolio_companies')
      .insert(company)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update a portfolio company
  async updateCompany(id: string, updates: Partial<PortfolioCompany>) {
    const { data, error } = await supabase
      .from('portfolio_companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get documents for a company
  async getCompanyDocuments(companyId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('portfolio_company_id', companyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Upload a document
  async uploadDocument(file: File, metadata: Omit<Document, 'id' | 'created_at' | 'updated_at' | 'file_name' | 'file_size' | 'file_type' | 'file_url' | 'file_path'>) {
    // Generate unique file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `documents/${metadata.portfolio_company_id}/${fileName}`
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)
    
    // Save document metadata to database
    const documentData = {
      ...metadata,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_url: urlData.publicUrl,
      file_path: filePath
    }
    
    const { data, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
