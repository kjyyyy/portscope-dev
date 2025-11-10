'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePortfolioCompanies } from '@/hooks/features/usePortfolioCompanies';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  FileText, 
  Bell, 
  Link as LinkIcon,
  Upload,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import FileDropZone from '@/components/ui/FileDropZone';

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

export default function DashboardPage() {
  const router = useRouter();
  const { data: companies = [], isLoading, error } = usePortfolioCompanies();

  // Calculate aggregate metrics
  const totalPortfolioValue = companies.reduce((sum, c) => sum + (c.current_fair_value || 0), 0);
  const totalInvested = companies.reduce((sum, c) => sum + (c.total_invested || 0), 0);
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const avgIRR = companies.length > 0
    ? companies.reduce((sum, c) => sum + (c.irr || 0), 0) / companies.length
    : 0;

  const handleFileUpload = async (files: File[]) => {
    // TODO: Implement file upload logic
    console.log('Uploading files:', files);
    // This will be implemented with proper document upload service
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <p>Error loading dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your private equity investments and performance
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/portfolio/new')}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Onboard Company
        </Button>
      </div>

      {/* Portfolio Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalInvested)} invested
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCompanies} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average IRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(avgIRR)}</div>
            <p className="text-xs text-muted-foreground">
              Portfolio average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MOIC</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalInvested > 0 
                ? (totalPortfolioValue / totalInvested).toFixed(2) + 'x'
                : '0x'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Multiple on invested capital
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Portfolio Companies Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Portfolio Companies</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/portfolio')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {companies.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No portfolio companies yet</p>
                <Button
                  onClick={() => router.push('/dashboard/portfolio/new')}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Company
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {companies.slice(0, 5).map((company) => (
                  <Link
                    key={company.id}
                    href={`/dashboard/companies/${company.id}`}
                    className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{company.company_name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {company.sector || 'N/A'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span>Value: </span>
                            <span className="font-medium text-foreground">
                              {formatCurrency(company.current_fair_value)}
                            </span>
                          </div>
                          <div>
                            <span>IRR: </span>
                            <span className="font-medium text-foreground">
                              {formatPercentage(company.irr)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* News Tracker */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>News Tracker</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Latest news and updates from your portfolio companies
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add News Item
              </Button>
              <div className="text-center py-4 text-sm text-muted-foreground">
                No news items yet
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Integrations & Document Upload */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workflow Integrations */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              <CardTitle>Workflow Integrations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Connect your workflow tools like Notion, Slack, Asana, and more
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Notion
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Slack
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Asana
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Jira
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              <CardTitle>Document Upload</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <FileDropZone onFilesAccepted={handleFileUpload} />
          </CardContent>
        </Card>
      </div>

      {/* Signoff Processes & Latest Activities */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Signoff Processes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <CardTitle>Signoff Processes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Document Review</p>
                    <p className="text-xs text-muted-foreground">Pending approval</p>
                  </div>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
              <p className="text-sm text-muted-foreground text-center py-2">
                No active signoff processes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Latest Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Latest Activities</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companies.length > 0 ? (
                companies.slice(0, 5).map((company) => (
                  <div key={company.id} className="flex items-center gap-3 p-2 border rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{company.company_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {new Date(company.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href={`/dashboard/companies/${company.id}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activities
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
