// Additional types for portfolio management

export interface Budget {
  id: string
  created_at: string
  updated_at: string
  portfolio_company_id: string
  year: number
  quarter?: string
  month?: number
  target_revenue?: number
  target_ebitda?: number
  target_margin?: number
  target_headcount?: number
  budget_type: 'annual' | 'quarterly' | 'monthly' | 'ltm'
  notes?: string
  created_by?: string
}

export interface MonthlyPerformance {
  id: string
  created_at: string
  updated_at: string
  portfolio_company_id: string
  year: number
  month: number
  performance_date: string
  revenue?: number
  ebitda?: number
  ebitda_margin?: number
  cash_position?: number
  burn_rate?: number
  headcount?: number
  customer_count?: number
  arpu?: number
  revenue_growth_mom?: number
  revenue_growth_yoy?: number
  notes?: string
  updated_by?: string
}

export interface ValueCreationInitiative {
  id: string
  created_at: string
  updated_at: string
  portfolio_company_id: string
  initiative_name: string
  description?: string
  category?: string
  status: 'ongoing' | 'to_be_done' | 'completed' | 'on_hold'
  priority: number
  progress_percentage: number
  start_date?: string
  target_completion_date?: string
  actual_completion_date?: string
  expected_value_impact?: number
  expected_revenue_impact?: number
  notes?: string
  created_by?: string
}

export interface KeyHire {
  id: string
  created_at: string
  updated_at: string
  portfolio_company_id: string
  name: string
  title?: string
  department?: string
  hire_date?: string
  is_value_creator: boolean
  is_investor_placed: boolean
  reporting_to?: string
  expected_impact?: string
  key_responsibilities?: string[]
  notes?: string
  created_by?: string
}

export interface FinancialStatement {
  id: string
  created_at: string
  updated_at: string
  portfolio_company_id: string
  statement_type: 'income_statement' | 'balance_sheet' | 'cash_flow'
  period_type: 'annual' | 'quarterly' | 'monthly' | 'ltm'
  year: number
  quarter?: string
  month?: number
  period_end_date: string
  revenue?: number
  cost_of_goods_sold?: number
  gross_profit?: number
  operating_expenses?: number
  ebitda?: number
  depreciation_amortization?: number
  ebit?: number
  interest_expense?: number
  tax_expense?: number
  net_income?: number
  operating_margin?: number
  net_margin?: number
  notes?: string
  prepared_by?: string
}

export interface NewsItem {
  id: string
  created_at: string
  updated_at: string
  portfolio_company_id: string
  title: string
  content?: string
  source_url?: string
  source_name?: string
  published_date?: string
  category?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  tags?: string[]
  created_by?: string
}

export interface WorkflowIntegration {
  id: string
  created_at: string
  updated_at: string
  created_by: string
  integration_type: string
  integration_name?: string
  is_active: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: Record<string, any>
  notes?: string
}

export interface SignoffProcess {
  id: string
  created_at: string
  updated_at: string
  created_by: string
  process_name: string
  process_type?: string
  status: 'pending' | 'in_progress' | 'approved' | 'rejected'
  portfolio_company_id?: string
  document_id?: string
  requested_by?: string
  approved_by?: string
  approval_date?: string
  notes?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>
}

