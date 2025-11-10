'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePortfolioCompanies, usePortfolioCompany } from '@/hooks/features/usePortfolioCompanies';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function formatCurrency(amount: number | undefined): string {
  if (!amount) return '$0';
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(2)}B`;
  } else if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(2)}K`;
  }
  return `$${amount.toFixed(2)}`;
}

function formatPercentage(value: number | undefined): string {
  if (!value) return '0%';
  return `${value.toFixed(1)}%`;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  
  const { data: companies = [] } = usePortfolioCompanies();
  const { data: company, isLoading } = usePortfolioCompany(companyId);

  const handleCompanyChange = (newCompanyId: string) => {
    router.push(`/dashboard/companies/${newCompanyId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading company details...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Company not found</p>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Calculate MOIC
  const moic = company.total_invested && company.total_invested > 0
    ? (company.current_fair_value || 0) / company.total_invested
    : 0;

  // Mock data for charts (will be replaced with real data from hooks)
  const ebitdaData = [
    { year: '2021', actual: 2.5, budget: 2.8 },
    { year: '2022', actual: 3.2, budget: 3.5 },
    { year: '2023', actual: 4.1, budget: 4.3 },
    { year: '2024', actual: 5.2, budget: 5.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Company Selector */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{company.company_name}</h1>
            <p className="text-muted-foreground">
              {company.sector || 'N/A'} • {company.stage?.replace('_', ' ').toUpperCase() || 'N/A'}
            </p>
          </div>
        </div>
        <div className="w-64">
          <Select value={companyId} onValueChange={handleCompanyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Valuation</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(company.current_fair_value)}</div>
            <p className="text-xs text-muted-foreground">
              Entry: {formatCurrency(company.entry_valuation)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MOIC</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moic.toFixed(2)}x</div>
            <p className="text-xs text-muted-foreground">
              Multiple on invested capital
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(company.irr)}</div>
            <p className="text-xs text-muted-foreground">
              Internal rate of return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investment Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {company.initial_investment_date 
                ? new Date(company.initial_investment_date).getFullYear()
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Initial investment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 4-Quadrant View */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quadrant 1: Details of the Business */}
        <Card>
          <CardHeader>
            <CardTitle>Details of the Business</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Company Name</h3>
              <p className="text-muted-foreground">{company.company_name}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Business Description</h3>
              <p className="text-muted-foreground">
                {company.business_description || 'No description available'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Investment Year</h3>
                <p className="text-muted-foreground">
                  {company.initial_investment_date 
                    ? new Date(company.initial_investment_date).getFullYear()
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Sector</h3>
                <p className="text-muted-foreground">{company.sector || 'N/A'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Entry Valuation</h3>
                <p className="text-lg font-bold">{formatCurrency(company.entry_valuation)}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Recent Valuation</h3>
                <p className="text-lg font-bold">{formatCurrency(company.recent_valuation)}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Implied Figure</h3>
              <p className="text-lg font-bold">{formatCurrency(company.implied_figure)}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">MOIC</h3>
              <p className="text-2xl font-bold text-green-600">{moic.toFixed(2)}x</p>
            </div>
          </CardContent>
        </Card>

        {/* Quadrant 2: Financials of the Business */}
        <Card>
          <CardHeader>
            <CardTitle>Financials of the Business</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* EBITDA Chart */}
            <div>
              <h3 className="font-semibold mb-4">EBITDA - Yearly</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ebitdaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                  <Bar dataKey="budget" fill="#10b981" name="Budget" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* LTM and Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded">
                <h4 className="text-sm font-medium mb-1">LTM EBITDA</h4>
                <p className="text-xl font-bold">{formatCurrency(company.ebitda)}</p>
              </div>
              <div className="p-3 border rounded">
                <h4 className="text-sm font-medium mb-1">Target Budget</h4>
                <p className="text-xl font-bold text-muted-foreground">N/A</p>
              </div>
            </div>

            {/* Implied Margin */}
            <div className="p-3 border rounded">
              <h4 className="text-sm font-medium mb-2">Implied Margin</h4>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${company.ebitda && company.revenue ? (company.ebitda / company.revenue * 100) : 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {company.ebitda && company.revenue 
                  ? `${((company.ebitda / company.revenue) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>

            {/* P&L Summary */}
            <div className="space-y-2">
              <h4 className="font-semibold">P&L Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Revenue:</span>
                  <span className="font-medium">{formatCurrency(company.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>EBITDA:</span>
                  <span className="font-medium">{formatCurrency(company.ebitda)}</span>
                </div>
                <div className="flex justify-between">
                  <span>EBITDA Margin:</span>
                  <span className="font-medium">
                    {company.ebitda && company.revenue 
                      ? `${((company.ebitda / company.revenue) * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quadrant 3: Commentary */}
        <Card>
          <CardHeader>
            <CardTitle>Commentary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Most Recent Quarter</h3>
              <p className="text-muted-foreground">
                {company.notes || 'No quarterly commentary available'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Most Recent Budget</h3>
              <p className="text-muted-foreground">
                Budget commentary will be displayed here
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Investment Deal Summarization</h3>
              <p className="text-muted-foreground">
                {company.investment_theme || 'No deal summary available'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Performance Summary (LTM)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Revenue:</span>
                  <span className="font-medium">{formatCurrency(company.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>EBITDA:</span>
                  <span className="font-medium">{formatCurrency(company.ebitda)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Headcount:</span>
                  <span className="font-medium">{company.headcount || 'N/A'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quadrant 4: Investment Thesis */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Thesis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Investment Thesis</h3>
              <p className="text-muted-foreground">
                {company.investment_thesis || 'No investment thesis available'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Key Valuation Creation Levers</h3>
              <div className="space-y-2">
                <div className="p-2 border rounded text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">Initiative 1</span>
                    <Badge variant="outline">Ongoing</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Top 5 initiatives will be displayed here
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Key Hires (Investor Placed)</h3>
              <p className="text-muted-foreground text-sm">
                Key hires placed by investors will be listed here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Monthly performance data will be displayed here
            </p>
            <div className="h-64 flex items-center justify-center border rounded">
              <p className="text-muted-foreground">Monthly performance chart coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

