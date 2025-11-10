# Schema Review: Optimization, Normalization & Completeness Analysis

## 🔍 Executive Summary

The current schema is **well-structured** but has several areas for improvement in normalization, optimization, and completeness. This document outlines issues and recommendations.

---

## ❌ Normalization Issues

### 1. **Denormalized Data in `portfolio_companies`**

**Issue:**
- `key_contacts JSONB` - Should use `investment_contacts` table exclusively
- `deal_lead VARCHAR(255)` and `board_representative VARCHAR(255)` - Should reference `investment_contacts` or `user_profiles`
- Current valuation metrics stored directly instead of in a separate valuation history table

**Recommendation:**
```sql
-- Remove key_contacts JSONB from portfolio_companies
-- Use investment_contacts table exclusively
-- Add deal_lead_id and board_representative_id as foreign keys
```

### 2. **Missing Lookup Tables**

**Issue:**
- `stage`, `sector`, `subsector`, `investment_type`, `document_type`, `status` are stored as VARCHAR
- No referential integrity or standardized values

**Recommendation:**
```sql
CREATE TABLE sectors (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  parent_id UUID REFERENCES sectors(id) -- For subsectors
);

CREATE TABLE investment_stages (
  id UUID PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_order INTEGER
);

-- Similar for investment_types, document_types, etc.
```

### 3. **Inconsistent Foreign Key References**

**Issue:**
- `documents.prepared_by VARCHAR(255)` should be `UUID REFERENCES auth.users(id)`
- `portfolio_companies.deal_lead` and `board_representative` should reference contacts/users

---

## ⚠️ Missing Data Areas

### 1. **Commentary Section Requirements** (from 4-quadrant view)

**Missing:**
- ✅ Most recent quarter - Covered by `performance_updates`
- ✅ Most recent budget - Covered by `budgets`
- ❌ **Investment deal summarization** - Missing dedicated table
- ❌ **Performance summary (LTM)** - Missing LTM-specific aggregation table

**Recommendation:**
```sql
CREATE TABLE deal_summaries (
  id UUID PRIMARY KEY,
  portfolio_company_id UUID REFERENCES portfolio_companies(id),
  summary_text TEXT NOT NULL,
  deal_terms JSONB,
  closing_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ltm_performance_summaries (
  id UUID PRIMARY KEY,
  portfolio_company_id UUID REFERENCES portfolio_companies(id),
  as_of_date DATE NOT NULL,
  revenue_ltm DECIMAL(15,2),
  ebitda_ltm DECIMAL(15,2),
  margin_ltm DECIMAL(5,2),
  growth_rate DECIMAL(5,2),
  summary_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(portfolio_company_id, as_of_date)
);
```

### 2. **Financial Statements - Incomplete**

**Issue:**
- `financial_statements` only has income statement fields
- Missing balance sheet fields
- Missing cash flow statement fields

**Recommendation:**
```sql
-- Add to financial_statements table:
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
ending_cash_balance DECIMAL(15,2)
```

### 3. **Valuation History**

**Issue:**
- Only current valuation stored in `portfolio_companies`
- No historical tracking of valuation changes

**Recommendation:**
```sql
CREATE TABLE valuation_history (
  id UUID PRIMARY KEY,
  portfolio_company_id UUID REFERENCES portfolio_companies(id),
  valuation_date DATE NOT NULL,
  valuation_amount DECIMAL(15,2) NOT NULL,
  valuation_method VARCHAR(100),
  valuation_type VARCHAR(50), -- 'entry', 'mark', 'exit', 'interim'
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. **Funding Rounds & Cap Table**

**Issue:**
- No tracking of funding rounds
- No cap table information

**Recommendation:**
```sql
CREATE TABLE funding_rounds (
  id UUID PRIMARY KEY,
  portfolio_company_id UUID REFERENCES portfolio_companies(id),
  round_name VARCHAR(100), -- 'Seed', 'Series A', etc.
  round_date DATE NOT NULL,
  amount_raised DECIMAL(15,2),
  pre_money_valuation DECIMAL(15,2),
  post_money_valuation DECIMAL(15,2),
  lead_investor VARCHAR(255),
  participants JSONB, -- Array of investor info
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cap_table_entries (
  id UUID PRIMARY KEY,
  portfolio_company_id UUID REFERENCES portfolio_companies(id),
  as_of_date DATE NOT NULL,
  stakeholder_name VARCHAR(255),
  stakeholder_type VARCHAR(50), -- 'investor', 'founder', 'employee', 'option_pool'
  ownership_percentage DECIMAL(5,2),
  shares_owned BIGINT,
  fully_diluted_percentage DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. **Comments & Notes System**

**Issue:**
- Individual `notes` fields scattered across tables
- No unified commenting system
- No threading/replies

**Recommendation:**
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL, -- 'portfolio_company', 'document', 'initiative', etc.
  entity_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES comments(id), -- For threading
  comment_text TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);
```

### 6. **Activity Log / Audit Trail**

**Issue:**
- No comprehensive activity tracking
- No audit trail for important changes

**Recommendation:**
```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'viewed'
  changes JSONB, -- Before/after state for updates
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);
```

### 7. **Board Meetings & Events**

**Issue:**
- No tracking of board meetings
- No event calendar

**Recommendation:**
```sql
CREATE TABLE board_meetings (
  id UUID PRIMARY KEY,
  portfolio_company_id UUID REFERENCES portfolio_companies(id),
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_type VARCHAR(50), -- 'board', 'advisory', 'investor_update'
  agenda TEXT,
  minutes TEXT,
  attendees JSONB, -- Array of attendee info
  action_items JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. **Team Collaboration**

**Issue:**
- No multi-user collaboration features
- No sharing/permissions system

**Recommendation:**
```sql
CREATE TABLE company_shares (
  id UUID PRIMARY KEY,
  portfolio_company_id UUID REFERENCES portfolio_companies(id),
  shared_with_user_id UUID REFERENCES auth.users(id),
  permission_level VARCHAR(50), -- 'view', 'edit', 'admin'
  shared_by UUID REFERENCES auth.users(id),
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(portfolio_company_id, shared_with_user_id)
);
```

---

## 🚀 Optimization Issues

### 1. **Missing Composite Indexes**

**Issue:**
- Common query patterns not optimized

**Recommendation:**
```sql
-- For dashboard queries
CREATE INDEX idx_portfolio_companies_user_status ON portfolio_companies(created_by, status);
CREATE INDEX idx_portfolio_companies_user_stage ON portfolio_companies(created_by, stage);

-- For time-series queries
CREATE INDEX idx_monthly_performance_company_date ON monthly_performance(portfolio_company_id, performance_date DESC);
CREATE INDEX idx_financial_statements_company_date ON financial_statements(portfolio_company_id, period_end_date DESC);

-- For document queries
CREATE INDEX idx_documents_company_type_date ON documents(portfolio_company_id, document_type, as_of_date DESC);
```

### 2. **Missing Partial Indexes**

**Recommendation:**
```sql
-- Only index active companies
CREATE INDEX idx_portfolio_companies_active ON portfolio_companies(created_by, status) 
  WHERE status = 'active';

-- Only index latest document versions
CREATE INDEX idx_documents_latest ON documents(portfolio_company_id, document_type, as_of_date DESC)
  WHERE is_latest_version = true;
```

### 3. **VARCHAR Length Optimization**

**Issue:**
- Some VARCHAR fields are oversized
- Wastes storage and memory

**Recommendation:**
```sql
-- Reduce oversized fields:
stage VARCHAR(50) → VARCHAR(20) -- 'seed', 'series_a' are short
investment_type VARCHAR(50) → VARCHAR(20)
status VARCHAR(50) → VARCHAR(20)
document_type VARCHAR(100) → VARCHAR(50)
```

### 4. **Missing Constraints**

**Issue:**
- No CHECK constraints for data validation
- Missing NOT NULL where appropriate

**Recommendation:**
```sql
-- Add constraints:
ALTER TABLE portfolio_companies 
  ADD CONSTRAINT chk_ownership_percentage 
  CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100);

ALTER TABLE portfolio_companies
  ADD CONSTRAINT chk_valuation_dates
  CHECK (latest_valuation_date >= initial_investment_date OR latest_valuation_date IS NULL);
```

---

## ✅ What's Good

1. ✅ Proper use of UUIDs for primary keys
2. ✅ Good foreign key relationships
3. ✅ Comprehensive RLS policies
4. ✅ Good index coverage for basic queries
5. ✅ Proper use of JSONB for flexible data
6. ✅ Timestamps on all tables
7. ✅ CASCADE deletes where appropriate

---

## 📋 Priority Recommendations

### **High Priority:**
1. Add `valuation_history` table
2. Add `deal_summaries` table
3. Add `ltm_performance_summaries` table
4. Complete `financial_statements` with balance sheet and cash flow
5. Fix normalization issues (remove JSONB key_contacts, add proper FKs)

### **Medium Priority:**
6. Add `funding_rounds` and `cap_table_entries` tables
7. Add `comments` system
8. Add `activity_log` for audit trail
9. Add composite indexes for common queries
10. Add lookup tables for standardized values

### **Low Priority:**
11. Add `board_meetings` table
12. Add `company_shares` for collaboration
13. Optimize VARCHAR lengths
14. Add partial indexes

---

## 🎯 Next Steps

1. Review this analysis
2. Prioritize which missing features are needed for MVP
3. Create migration script for high-priority items
4. Update application code to use new tables
5. Add data validation and constraints

