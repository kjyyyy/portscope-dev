'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import MetricCard from '@/components/ui/MetricCard';
import ChartCard from '@/components/ui/ChartCard';
import RecentActivity from '@/components/ui/RecentActivity';
import AIAssistant from '@/components/ui/AIAssistant';
import FormulaBuilder from '@/components/ui/FormulaBuilder';
import VersionControl from '@/components/ui/VersionControl';
import FileDropZone from '@/components/ui/FileDropZone';
import { cn } from '@/lib/utils';
import { Building2, DollarSign, TrendingUp, Users, BarChart3, Calculator, GitBranch, ArrowRight } from 'lucide-react';

const companies = ['Acme Capital', 'Blue Ocean Ventures', 'FinTech Growth'];

function OnboardButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <div className={cn('flex justify-end', className)}>
      <Button
        onClick={() => router.push('/dashboard/portfolio/new')}
        className="bg-primary text-white hover:bg-primary/90"
      >
        + Onboard Portfolio Company
      </Button>
    </div>
  );
}

export default function OverviewPage() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const demoMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  const handleFileUpload = (files: File[]) => {
    // Demo mode file upload simulation
    if (isDemoMode) {
      alert(`Demo Mode: ${files.length} file(s) would be uploaded to S3 in production`);
    } else {
      // TODO: Upload to S3 logic here
      console.log('Uploading files:', files);
    }
  };

  const handleCompanySelect = (value: string) => {
    setSelectedCompany(value);
    if (isDemoMode) {
      // Simulate loading in demo mode
      setTimeout(() => {
        console.log(`Demo Mode: Selected company ${value}`);
      }, 500);
    }
  };

  const handleNavigateToAnalytics = () => {
    router.push('/dashboard/analytics');
  };

  const handleNavigateToValuations = () => {
    router.push('/dashboard/valuations');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your private equity investments and performance
        </p>
        {isDemoMode && (
          <p className="text-sm text-blue-600 mt-2">
            🎯 Demo Mode: All features are interactive for demonstration
          </p>
        )}
      </div>

      <div className="max-w-sm">
        <Select onValueChange={handleCompanySelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a portfolio company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company} value={company}>{company}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <OnboardButton className="mt-2" />

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Portfolio Value"
          value="$1.2B"
          change="+12.5%"
          trend="up"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Portfolio Companies"
          value="24"
          change="+2"
          trend="up"
          icon={<Building2 className="h-4 w-4" />}
        />
        <MetricCard
          title="Average IRR"
          value="18.4%"
          change="+2.1%"
          trend="up"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Active Deals"
          value="7"
          change="-1"
          trend="down"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Advanced Features Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard 
          title="Portfolio Valuation Trend" 
          type="bar"
          formatter={(value) => [`$${value}M`, 'Portfolio Value']}
        />
        <AIAssistant />
        <RecentActivity />
      </div>

      {/* Professional Tools */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FormulaBuilder />
        <VersionControl />
      </div>

      {/* Enhanced Navigation to Advanced Pages */}
      <div className="grid gap-4 md:grid-cols-2">
        <Button 
          variant="outline" 
          className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
          onClick={handleNavigateToAnalytics}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span className="font-semibold">Advanced Analytics</span>
          </div>
          <span className="text-xs text-muted-foreground">Multi-tab analysis & insights</span>
          <ArrowRight className="h-4 w-4 text-blue-600" />
        </Button>
        <Button 
          variant="outline" 
          className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-green-50 hover:border-green-200 transition-all duration-200"
          onClick={handleNavigateToValuations}
        >
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-green-600" />
            <span className="font-semibold">Valuations Management</span>
          </div>
          <span className="text-xs text-muted-foreground">Track & manage valuations</span>
          <ArrowRight className="h-4 w-4 text-green-600" />
        </Button>
      </div>

      {selectedCompany && (
        <Tabs defaultValue="metrics">
          <TabsList>
            <TabsTrigger value="metrics">Financial Metrics</TabsTrigger>
            <TabsTrigger value="upload">Data Collection</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard title="Revenue" value="$15.2M" change="↑ 3.5%" trend="up" />
              <MetricCard title="EBITDA" value="$4.1M" change="↑ 2.1%" trend="up" />
              <MetricCard title="IRR" value="12.4%" change="→" trend="neutral" />
            </div>
            <ChartCard title="Quarterly IRR" />
          </TabsContent>

          <TabsContent value="upload">
            <FileDropZone onFilesAccepted={handleFileUpload} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
