-- ============================================================================
-- PortScope Dev Database Schema
-- Only DROP and CREATE TABLE statements - no functions or triggers
-- Functions and triggers should be handled in application code/API hooks
-- ============================================================================

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS company_shares CASCADE;
DROP TABLE IF EXISTS board_meetings CASCADE;
DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS cap_table_entries CASCADE;
DROP TABLE IF EXISTS funding_rounds CASCADE;
DROP TABLE IF EXISTS ltm_performance_summaries CASCADE;
DROP TABLE IF EXISTS deal_summaries CASCADE;
DROP TABLE IF EXISTS valuation_history CASCADE;
DROP TABLE IF EXISTS signoff_processes CASCADE;
DROP TABLE IF EXISTS workflow_integrations CASCADE;
DROP TABLE IF EXISTS news_items CASCADE;
DROP TABLE IF EXISTS financial_statements CASCADE;
DROP TABLE IF EXISTS key_hires CASCADE;
DROP TABLE IF EXISTS value_creation_initiatives CASCADE;
DROP TABLE IF EXISTS monthly_performance CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS performance_updates CASCADE;
DROP TABLE IF EXISTS investment_contacts CASCADE;
DROP TABLE IF EXISTS document_tags CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS portfolio_companies CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- ============================================================================
-- COMPANIES TABLE (for B2B partner companies)
-- ============================================================================
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Company Information
  company_name VARCHAR(255) NOT NULL,
  unique_link VARCHAR(255) UNIQUE NOT NULL, -- Unique identifier/link for the company
  description TEXT,
  website VARCHAR(255),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB
);

-- ============================================================================
-- USER PROFILES TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL, -- Link to partner company
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PORTFOLIO COMPANIES TABLE
-- ============================================================================
CREATE TABLE portfolio_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic Company Information
  company_name VARCHAR(255) NOT NULL,
  legal_entity_name VARCHAR(255),
  headquarters VARCHAR(255),
  website VARCHAR(255),
  
  -- Investment Details
  sector VARCHAR(100),
  subsector VARCHAR(100),
  investment_theme VARCHAR(255),
  stage VARCHAR(50), -- 'seed', 'series_a', 'series_b', 'growth', 'late_stage'
  ownership_percentage DECIMAL(5,2) CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  investment_type VARCHAR(50), -- 'equity', 'debt', 'convertible', 'preferred'
  
  -- Investment Timeline
  initial_investment_date DATE,
  latest_valuation_date DATE,
  deal_lead VARCHAR(255), -- Name of deal lead (can be normalized later)
  board_representative VARCHAR(255), -- Name of board rep (can be normalized later)
  
  -- Financial Metrics
  initial_investment_amount DECIMAL(15,2),
  total_invested DECIMAL(15,2),
  current_fair_value DECIMAL(15,2),
  realized_value DECIMAL(15,2),
  nav_percentage DECIMAL(5,2),
  valuation_method VARCHAR(100),
  revenue DECIMAL(15,2),
  ebitda DECIMAL(15,2),
  leverage_ratio DECIMAL(5,2),
  
  -- Performance Metrics
  irr DECIMAL(5,2),
  moic DECIMAL(5,2),
  dpi DECIMAL(5,2),
  quarterly_growth_rate DECIMAL(5,2),
  headcount INTEGER,
  esg_score INTEGER CHECK (esg_score >= 0 AND esg_score <= 100),
  
  -- Metadata
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'exited', 'written_off'
  created_by UUID REFERENCES auth.users(id),
  tags TEXT[],
  notes TEXT,
  
  -- Additional Fields for 4-Quadrant View
  business_description TEXT,
  investment_thesis TEXT,
  entry_valuation DECIMAL(15,2), -- Entry valuation at investment
  recent_valuation DECIMAL(15,2), -- Most recent valuation
  implied_figure DECIMAL(15,2) -- Implied valuation figure
);

-- ============================================================================
-- VALUATION HISTORY TABLE
-- ============================================================================
CREATE TABLE valuation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  
  -- Valuation Details
  valuation_date DATE NOT NULL,
  valuation_amount DECIMAL(15,2) NOT NULL,
  valuation_method VARCHAR(100),
  valuation_type VARCHAR(50) NOT NULL, -- 'entry', 'mark', 'exit', 'interim'
  
  -- Context
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  
  -- Ensure one entry per company per date per type
  UNIQUE(portfolio_company_id, valuation_date, valuation_type)
);

-- ============================================================================
-- DEAL SUMMARIES TABLE (for Commentary quadrant)
-- ============================================================================
CREATE TABLE deal_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  
  -- Deal Information
  summary_text TEXT NOT NULL,
  deal_terms JSONB, -- Store structured deal terms
  closing_date DATE,
  deal_size DECIMAL(15,2),
  ownership_percentage DECIMAL(5,2) CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  
  -- Additional Context
  key_highlights TEXT[],
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- LTM PERFORMANCE SUMMARIES TABLE (for Commentary quadrant)
-- ============================================================================
CREATE TABLE ltm_performance_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  
  -- LTM Period
  as_of_date DATE NOT NULL,
  
  -- LTM Financial Metrics
  revenue_ltm DECIMAL(15,2),
  ebitda_ltm DECIMAL(15,2),
  margin_ltm DECIMAL(5,2),
  growth_rate DECIMAL(5,2),
  
  -- Operational Metrics
  headcount_ltm INTEGER,
  customer_count_ltm INTEGER,
  
  -- Performance Summary
  summary_text TEXT,
  key_highlights TEXT[],
  challenges TEXT[],
  
  created_by UUID REFERENCES auth.users(id),
  
  -- One summary per company per date
  UNIQUE(portfolio_company_id, as_of_date)
);

-- ============================================================================
-- FUNDING ROUNDS TABLE
-- ============================================================================
CREATE TABLE funding_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  
  -- Round Information
  round_name VARCHAR(100) NOT NULL, -- 'Seed', 'Series A', 'Series B', etc.
  round_date DATE NOT NULL,
  round_type VARCHAR(50), -- 'equity', 'debt', 'convertible', 'bridge'
  
  -- Financial Details
  amount_raised DECIMAL(15,2),
  pre_money_valuation DECIMAL(15,2),
  post_money_valuation DECIMAL(15,2),
  our_investment_amount DECIMAL(15,2),
  our_ownership_after DECIMAL(5,2),
  
  -- Participants
  lead_investor VARCHAR(255),
  participants JSONB, -- Array of investor info: [{name, amount, ownership}]
  
  -- Additional Info
  notes TEXT,
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- CAP TABLE ENTRIES TABLE
-- ============================================================================
CREATE TABLE cap_table_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  
  -- Snapshot Date
  as_of_date DATE NOT NULL,
  
  -- Stakeholder Information
  stakeholder_name VARCHAR(255) NOT NULL,
  stakeholder_type VARCHAR(50) NOT NULL, -- 'investor', 'founder', 'employee', 'option_pool', 'advisor'
  
  -- Ownership Details
  ownership_percentage DECIMAL(5,2) CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
  shares_owned BIGINT,
  fully_diluted_percentage DECIMAL(5,2),
  preferred_shares BIGINT,
  common_shares BIGINT,
  
  -- Additional Info
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  
  -- Index for efficient queries
  UNIQUE(portfolio_company_id, as_of_date, stakeholder_name, stakeholder_type)
);

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- File Information
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(100),
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  
  -- Document Metadata
  document_type VARCHAR(100) NOT NULL, -- 'investment_memo', 'financials', 'valuation_report', 'board_materials', 'legal', 'other'
  as_of_date DATE,
  quarter VARCHAR(10), -- 'Q1 2024', 'Q2 2024', etc.
  valuation_method VARCHAR(100),
  prepared_by UUID REFERENCES auth.users(id), -- Fixed: should be UUID not VARCHAR
  confidentiality_level VARCHAR(50) DEFAULT 'internal', -- 'public', 'internal', 'confidential', 'restricted'
  
  -- Relationships
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id),
  
  -- Versioning
  version_number INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES documents(id),
  
  -- Additional Metadata
  description TEXT,
  tags TEXT[],
  is_latest_version BOOLEAN DEFAULT true
);

-- ============================================================================
-- DOCUMENT TAGS TABLE
-- ============================================================================
CREATE TABLE document_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL,
  tag_value VARCHAR(255),
  tag_category VARCHAR(50), -- 'type', 'date', 'method', 'confidentiality', 'custom'
  
  UNIQUE(document_id, tag_name, tag_category)
);

-- ============================================================================
-- INVESTMENT CONTACTS TABLE
-- ============================================================================
CREATE TABLE investment_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  
  -- Contact Information
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(100), -- 'ceo', 'cfo', 'board_member', 'key_employee', 'advisor'
  is_primary BOOLEAN DEFAULT false,
  
  -- Additional Info
  notes TEXT,
  linkedin_url VARCHAR(255)
);

-- ============================================================================
-- PERFORMANCE UPDATES TABLE
-- ============================================================================
CREATE TABLE performance_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  
  -- Update Period
  quarter VARCHAR(10) NOT NULL,
  year INTEGER NOT NULL,
  update_date DATE NOT NULL,
  
  -- Financial Updates
  revenue DECIMAL(15,2),
  ebitda DECIMAL(15,2),
  cash_position DECIMAL(15,2),
  burn_rate DECIMAL(15,2),
  
  -- Operational Updates
  headcount INTEGER,
  key_milestones TEXT[],
  challenges TEXT[],
  
  -- Performance Metrics
  irr DECIMAL(5,2),
  moic DECIMAL(5,2),
  valuation DECIMAL(15,2),
  valuation_method VARCHAR(100),
  
  -- Additional Info
  notes TEXT,
  updated_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- BUDGETS TABLE
-- ============================================================================
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  
  -- Budget Period
  year INTEGER NOT NULL,
  quarter VARCHAR(10), -- 'Q1', 'Q2', 'Q3', 'Q4' or NULL for annual
  month INTEGER, -- 1-12 for monthly budgets
  
  -- Budget Targets
  target_revenue DECIMAL(15,2),
  target_ebitda DECIMAL(15,2),
  target_margin DECIMAL(5,2), -- EBITDA margin percentage
  target_headcount INTEGER,
  
  -- Budget Type
  budget_type VARCHAR(50) DEFAULT 'annual', -- 'annual', 'quarterly', 'monthly', 'ltm'
  
  -- Additional Info
  notes TEXT,
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- MONTHLY PERFORMANCE TRACKER TABLE
-- ============================================================================
CREATE TABLE monthly_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  
  -- Performance Period
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  performance_date DATE NOT NULL,
  
  -- Financial Metrics
  revenue DECIMAL(15,2),
  ebitda DECIMAL(15,2),
  ebitda_margin DECIMAL(5,2),
  cash_position DECIMAL(15,2),
  burn_rate DECIMAL(15,2),
  
  -- Operational Metrics
  headcount INTEGER,
  customer_count INTEGER,
  arpu DECIMAL(10,2), -- Average Revenue Per User
  
  -- Performance Indicators
  revenue_growth_mom DECIMAL(5,2), -- Month over month growth
  revenue_growth_yoy DECIMAL(5,2), -- Year over year growth
  
  -- Additional Info
  notes TEXT,
  updated_by UUID REFERENCES auth.users(id),
  
  UNIQUE(portfolio_company_id, year, month)
);

-- ============================================================================
-- VALUE CREATION INITIATIVES TABLE
-- ============================================================================
CREATE TABLE value_creation_initiatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  
  -- Initiative Details
  initiative_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'revenue_growth', 'cost_reduction', 'market_expansion', etc.
  
  -- Status Tracking
  status VARCHAR(50) DEFAULT 'to_be_done', -- 'ongoing', 'to_be_done', 'completed', 'on_hold'
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Timeline
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  
  -- Expected Impact
  expected_value_impact DECIMAL(15,2), -- Expected valuation impact
  expected_revenue_impact DECIMAL(15,2),
  
  -- Additional Info
  notes TEXT,
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- KEY HIRES TABLE
-- ============================================================================
CREATE TABLE key_hires (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  
  -- Hire Information
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  department VARCHAR(100),
  hire_date DATE,
  
  -- Role Details
  is_value_creator BOOLEAN DEFAULT false, -- Whether this hire is a value creator
  is_investor_placed BOOLEAN DEFAULT false, -- Whether investor placed this hire
  reporting_to VARCHAR(255),
  
  -- Impact
  expected_impact TEXT,
  key_responsibilities TEXT[],
  
  -- Additional Info
  notes TEXT,
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- FINANCIAL STATEMENTS TABLE
-- ============================================================================
CREATE TABLE financial_statements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  
  -- Statement Period
  statement_type VARCHAR(50) NOT NULL, -- 'income_statement', 'balance_sheet', 'cash_flow'
  period_type VARCHAR(50) NOT NULL, -- 'annual', 'quarterly', 'monthly', 'ltm'
  year INTEGER NOT NULL,
  quarter VARCHAR(10), -- 'Q1', 'Q2', 'Q3', 'Q4'
  month INTEGER, -- 1-12
  period_end_date DATE NOT NULL,
  
  -- Income Statement Fields (P&L)
  revenue DECIMAL(15,2),
  cost_of_goods_sold DECIMAL(15,2),
  gross_profit DECIMAL(15,2),
  operating_expenses DECIMAL(15,2),
  ebitda DECIMAL(15,2),
  depreciation_amortization DECIMAL(15,2),
  ebit DECIMAL(15,2),
  interest_expense DECIMAL(15,2),
  tax_expense DECIMAL(15,2),
  net_income DECIMAL(15,2),
  
  -- Balance Sheet Fields
  current_assets DECIMAL(15,2),
  non_current_assets DECIMAL(15,2),
  total_assets DECIMAL(15,2),
  current_liabilities DECIMAL(15,2),
  non_current_liabilities DECIMAL(15,2),
  total_liabilities DECIMAL(15,2),
  equity DECIMAL(15,2),
  working_capital DECIMAL(15,2),
  
  -- Cash Flow Fields
  operating_cash_flow DECIMAL(15,2),
  investing_cash_flow DECIMAL(15,2),
  financing_cash_flow DECIMAL(15,2),
  net_cash_flow DECIMAL(15,2),
  ending_cash_balance DECIMAL(15,2),
  
  -- Additional Metrics
  operating_margin DECIMAL(5,2),
  net_margin DECIMAL(5,2),
  
  -- Additional Info
  notes TEXT,
  prepared_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- NEWS ITEMS TABLE
-- ============================================================================
CREATE TABLE news_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  
  -- News Details
  title VARCHAR(500) NOT NULL,
  content TEXT,
  source_url TEXT,
  source_name VARCHAR(255),
  published_date DATE,
  
  -- Categorization
  category VARCHAR(100), -- 'financial', 'operational', 'market', 'regulatory', etc.
  sentiment VARCHAR(50), -- 'positive', 'negative', 'neutral'
  
  -- Additional Info
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- WORKFLOW INTEGRATIONS TABLE
-- ============================================================================
CREATE TABLE workflow_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_by UUID REFERENCES auth.users(id),
  
  -- Integration Details
  integration_type VARCHAR(100) NOT NULL, -- 'notion', 'slack', 'asana', 'jira', etc.
  integration_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  
  -- Configuration
  config JSONB, -- Store integration-specific configuration
  
  -- Additional Info
  notes TEXT
);

-- ============================================================================
-- SIGNOFF PROCESSES TABLE
-- ============================================================================
CREATE TABLE signoff_processes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_by UUID REFERENCES auth.users(id),
  
  -- Process Details
  process_name VARCHAR(255) NOT NULL,
  process_type VARCHAR(100), -- 'document_review', 'approval', 'compliance', etc.
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'approved', 'rejected'
  
  -- Related Entities
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  
  -- Signoff Details
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approval_date TIMESTAMP WITH TIME ZONE,
  
  -- Additional Info
  notes TEXT,
  metadata JSONB
);

-- ============================================================================
-- COMMENTS SYSTEM (unified commenting)
-- ============================================================================
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Entity Reference (polymorphic)
  entity_type VARCHAR(50) NOT NULL, -- 'portfolio_company', 'document', 'initiative', 'hire', 'budget', etc.
  entity_id UUID NOT NULL,
  
  -- Threading
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Comment Content
  comment_text TEXT NOT NULL,
  
  -- Metadata
  is_deleted BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- ACTIVITY LOG / AUDIT TRAIL
-- ============================================================================
CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Entity Reference (polymorphic)
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Action Details
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'viewed', 'shared'
  changes JSONB, -- Before/after state for updates: {field: {before: x, after: y}}
  
  -- User Context
  performed_by UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT
);

-- ============================================================================
-- BOARD MEETINGS TABLE
-- ============================================================================
CREATE TABLE board_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  
  -- Meeting Details
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_type VARCHAR(50) NOT NULL, -- 'board', 'advisory', 'investor_update', 'committee'
  meeting_title VARCHAR(255),
  
  -- Content
  agenda TEXT,
  minutes TEXT,
  action_items JSONB, -- Array of action items: [{item, owner, due_date, status}]
  decisions JSONB, -- Array of decisions made
  
  -- Attendees
  attendees JSONB, -- Array of attendee info: [{name, role, attended}]
  
  -- Additional Info
  notes TEXT,
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- COMPANY SHARES (for collaboration)
-- ============================================================================
CREATE TABLE company_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  portfolio_company_id UUID REFERENCES portfolio_companies(id) ON DELETE CASCADE,
  
  -- Sharing Details
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level VARCHAR(50) NOT NULL DEFAULT 'view', -- 'view', 'edit', 'admin'
  
  -- Metadata
  shared_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  -- One share per user per company
  UNIQUE(portfolio_company_id, shared_with_user_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Companies
CREATE INDEX idx_companies_unique_link ON companies(unique_link);
CREATE INDEX idx_companies_active ON companies(is_active);

-- User Profiles
CREATE INDEX idx_user_profiles_company_id ON user_profiles(company_id);

-- Portfolio Companies
CREATE INDEX idx_portfolio_companies_sector ON portfolio_companies(sector);
CREATE INDEX idx_portfolio_companies_stage ON portfolio_companies(stage);
CREATE INDEX idx_portfolio_companies_status ON portfolio_companies(status);
CREATE INDEX idx_portfolio_companies_user_status ON portfolio_companies(created_by, status);
CREATE INDEX idx_portfolio_companies_user_stage ON portfolio_companies(created_by, stage);
CREATE INDEX idx_portfolio_companies_active ON portfolio_companies(created_by, status) WHERE status = 'active';

-- Valuation History
CREATE INDEX idx_valuation_history_company_date ON valuation_history(portfolio_company_id, valuation_date DESC);
CREATE INDEX idx_valuation_history_type ON valuation_history(valuation_type);

-- Deal Summaries
CREATE INDEX idx_deal_summaries_company ON deal_summaries(portfolio_company_id);

-- LTM Performance Summaries
CREATE INDEX idx_ltm_performance_company_date ON ltm_performance_summaries(portfolio_company_id, as_of_date DESC);

-- Funding Rounds
CREATE INDEX idx_funding_rounds_company_date ON funding_rounds(portfolio_company_id, round_date DESC);

-- Cap Table Entries
CREATE INDEX idx_cap_table_company_date ON cap_table_entries(portfolio_company_id, as_of_date DESC);

-- Documents
CREATE INDEX idx_documents_company_id ON documents(portfolio_company_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_as_of_date ON documents(as_of_date);
CREATE INDEX idx_documents_company_type_date ON documents(portfolio_company_id, document_type, as_of_date DESC);
CREATE INDEX idx_documents_latest ON documents(portfolio_company_id, document_type, as_of_date DESC) WHERE is_latest_version = true;

-- Document Tags
CREATE INDEX idx_document_tags_document_id ON document_tags(document_id);

-- Investment Contacts
CREATE INDEX idx_investment_contacts_company_id ON investment_contacts(portfolio_company_id);

-- Performance Updates
CREATE INDEX idx_performance_updates_company_quarter ON performance_updates(portfolio_company_id, quarter, year);

-- Budgets
CREATE INDEX idx_budgets_company_id ON budgets(portfolio_company_id);
CREATE INDEX idx_budgets_period ON budgets(portfolio_company_id, year, quarter, month);

-- Monthly Performance
CREATE INDEX idx_monthly_performance_company_id ON monthly_performance(portfolio_company_id);
CREATE INDEX idx_monthly_performance_period ON monthly_performance(portfolio_company_id, year, month);
CREATE INDEX idx_monthly_performance_company_date ON monthly_performance(portfolio_company_id, performance_date DESC);

-- Value Creation Initiatives
CREATE INDEX idx_value_creation_initiatives_company_id ON value_creation_initiatives(portfolio_company_id);
CREATE INDEX idx_value_creation_initiatives_status ON value_creation_initiatives(status);

-- Key Hires
CREATE INDEX idx_key_hires_company_id ON key_hires(portfolio_company_id);

-- Financial Statements
CREATE INDEX idx_financial_statements_company_id ON financial_statements(portfolio_company_id);
CREATE INDEX idx_financial_statements_period ON financial_statements(portfolio_company_id, year, quarter, month);
CREATE INDEX idx_financial_statements_company_date ON financial_statements(portfolio_company_id, period_end_date DESC);
-- Unique constraint: one statement per company per period type
CREATE UNIQUE INDEX idx_financial_statements_unique_period ON financial_statements(
  portfolio_company_id, 
  statement_type, 
  period_type, 
  year, 
  COALESCE(quarter, ''), 
  COALESCE(month::text, '')
);

-- News Items
CREATE INDEX idx_news_items_company_id ON news_items(portfolio_company_id);
CREATE INDEX idx_news_items_date ON news_items(published_date DESC);

-- Workflow Integrations
CREATE INDEX idx_workflow_integrations_user_id ON workflow_integrations(created_by);

-- Signoff Processes
CREATE INDEX idx_signoff_processes_company_id ON signoff_processes(portfolio_company_id);
CREATE INDEX idx_signoff_processes_status ON signoff_processes(status);

-- Comments
CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

-- Activity Log
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_activity_log_user ON activity_log(performed_by, created_at DESC);

-- Board Meetings
CREATE INDEX idx_board_meetings_company_date ON board_meetings(portfolio_company_id, meeting_date DESC);

-- Company Shares
CREATE INDEX idx_company_shares_user ON company_shares(shared_with_user_id);
CREATE INDEX idx_company_shares_active ON company_shares(portfolio_company_id, is_active) WHERE is_active = true;

-- ============================================================================
-- RLS POLICIES
-- Note: RLS must be enabled separately using: ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
-- ============================================================================

-- Companies Policies
CREATE POLICY "Users can view companies" ON companies
  FOR SELECT USING (true); -- Companies are public for partner onboarding

CREATE POLICY "Users can insert companies" ON companies
  FOR INSERT WITH CHECK (true); -- Allow company creation during signup

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Portfolio Companies Policies
CREATE POLICY "Users can view their own portfolio companies" ON portfolio_companies
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own portfolio companies" ON portfolio_companies
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own portfolio companies" ON portfolio_companies
  FOR UPDATE USING (auth.uid() = created_by);

-- Valuation History Policies
CREATE POLICY "Users can view valuation history for their companies" ON valuation_history
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert valuation history for their companies" ON valuation_history
  FOR INSERT WITH CHECK (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- Deal Summaries Policies
CREATE POLICY "Users can view deal summaries for their companies" ON deal_summaries
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert deal summaries for their companies" ON deal_summaries
  FOR INSERT WITH CHECK (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- LTM Performance Summaries Policies
CREATE POLICY "Users can view LTM summaries for their companies" ON ltm_performance_summaries
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert LTM summaries for their companies" ON ltm_performance_summaries
  FOR INSERT WITH CHECK (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- Funding Rounds Policies
CREATE POLICY "Users can view funding rounds for their companies" ON funding_rounds
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert funding rounds for their companies" ON funding_rounds
  FOR INSERT WITH CHECK (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- Cap Table Entries Policies
CREATE POLICY "Users can view cap table for their companies" ON cap_table_entries
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert cap table entries for their companies" ON cap_table_entries
  FOR INSERT WITH CHECK (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- Documents Policies
CREATE POLICY "Users can view documents for their companies" ON documents
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents for their companies" ON documents
  FOR INSERT WITH CHECK (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- Investment Contacts Policies
CREATE POLICY "Users can view contacts for their companies" ON investment_contacts
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- Performance Updates Policies
CREATE POLICY "Users can view performance updates for their companies" ON performance_updates
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- Budgets Policies
CREATE POLICY "Users can view budgets for their companies" ON budgets
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert budgets for their companies" ON budgets
  FOR INSERT WITH CHECK (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- Monthly Performance Policies
CREATE POLICY "Users can view monthly performance for their companies" ON monthly_performance
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert monthly performance for their companies" ON monthly_performance
  FOR INSERT WITH CHECK (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- Value Creation Initiatives Policies
CREATE POLICY "Users can view initiatives for their companies" ON value_creation_initiatives
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert initiatives for their companies" ON value_creation_initiatives
  FOR INSERT WITH CHECK (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- Key Hires Policies
CREATE POLICY "Users can view key hires for their companies" ON key_hires
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert key hires for their companies" ON key_hires
  FOR INSERT WITH CHECK (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- Financial Statements Policies
CREATE POLICY "Users can view financial statements for their companies" ON financial_statements
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert financial statements for their companies" ON financial_statements
  FOR INSERT WITH CHECK (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- News Items Policies
CREATE POLICY "Users can view news for their companies" ON news_items
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert news for their companies" ON news_items
  FOR INSERT WITH CHECK (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- Workflow Integrations Policies
CREATE POLICY "Users can view their own workflow integrations" ON workflow_integrations
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own workflow integrations" ON workflow_integrations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Signoff Processes Policies
CREATE POLICY "Users can view their own signoff processes" ON signoff_processes
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own signoff processes" ON signoff_processes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Comments Policies
CREATE POLICY "Users can view comments on their entities" ON comments
  FOR SELECT USING (
    (entity_type = 'portfolio_company' AND entity_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    ))
    OR created_by = auth.uid()
  );

CREATE POLICY "Users can insert comments" ON comments
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (created_by = auth.uid());

-- Activity Log Policies (read-only for users on their own entities)
CREATE POLICY "Users can view activity log for their entities" ON activity_log
  FOR SELECT USING (
    (entity_type = 'portfolio_company' AND entity_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    ))
    OR performed_by = auth.uid()
  );

-- Board Meetings Policies
CREATE POLICY "Users can view board meetings for their companies" ON board_meetings
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert board meetings for their companies" ON board_meetings
  FOR INSERT WITH CHECK (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- Company Shares Policies
CREATE POLICY "Users can view shares for their companies" ON company_shares
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
    OR shared_with_user_id = auth.uid()
  );

CREATE POLICY "Users can share their companies" ON company_shares
  FOR INSERT WITH CHECK (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update shares for their companies" ON company_shares
  FOR UPDATE USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );
