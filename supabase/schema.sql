-- Portfolio Companies Table
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
  ownership_percentage DECIMAL(5,2),
  investment_type VARCHAR(50), -- 'equity', 'debt', 'convertible', 'preferred'
  
  -- Investment Timeline
  initial_investment_date DATE,
  latest_valuation_date DATE,
  deal_lead VARCHAR(255),
  board_representative VARCHAR(255),
  key_contacts JSONB, -- Array of contact objects
  
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
  notes TEXT
);

-- Documents Table
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
  prepared_by VARCHAR(255),
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

-- Document Tags Table (for advanced tagging)
CREATE TABLE document_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL,
  tag_value VARCHAR(255),
  tag_category VARCHAR(50), -- 'type', 'date', 'method', 'confidentiality', 'custom'
  
  UNIQUE(document_id, tag_name, tag_category)
);

-- Investment Contacts Table
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

-- Performance Updates Table (for tracking quarterly updates)
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

-- Indexes for better performance
CREATE INDEX idx_portfolio_companies_sector ON portfolio_companies(sector);
CREATE INDEX idx_portfolio_companies_stage ON portfolio_companies(stage);
CREATE INDEX idx_portfolio_companies_status ON portfolio_companies(status);
CREATE INDEX idx_documents_company_id ON documents(portfolio_company_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_as_of_date ON documents(as_of_date);
CREATE INDEX idx_document_tags_document_id ON document_tags(document_id);
CREATE INDEX idx_performance_updates_company_quarter ON performance_updates(portfolio_company_id, quarter, year);

-- Row Level Security (RLS) Policies
ALTER TABLE portfolio_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view their own portfolio companies" ON portfolio_companies
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own portfolio companies" ON portfolio_companies
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own portfolio companies" ON portfolio_companies
  FOR UPDATE USING (auth.uid() = created_by);

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

-- Similar policies for other tables...
CREATE POLICY "Users can view contacts for their companies" ON investment_contacts
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view performance updates for their companies" ON performance_updates
  FOR SELECT USING (
    portfolio_company_id IN (
      SELECT id FROM portfolio_companies WHERE created_by = auth.uid()
    )
  );

-- Functions for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_portfolio_companies_updated_at 
  BEFORE UPDATE ON portfolio_companies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_contacts_updated_at 
  BEFORE UPDATE ON investment_contacts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
