'use client';

import { useState } from 'react';
import MetricCard from '@/components/ui/MetricCard';
import ChartCard from '@/components/ui/ChartCard';
import FileDropZone from '@/components/ui/FileDropZone';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const companies = ['Acme Capital', 'Blue Ocean Ventures', 'FinTech Growth'];

export default function OverviewPage() {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const handleFileUpload = (files: File[]) => {
    // TODO: Upload to S3 logic here
    console.log('Uploading files:', files);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-sm">
        <Select onValueChange={(value) => setSelectedCompany(value)}>
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

      {selectedCompany && (
        <Tabs defaultValue="metrics">
          <TabsList>
            <TabsTrigger value="metrics">Financial Metrics</TabsTrigger>
            <TabsTrigger value="upload">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard title="Revenue" value="$15.2M" change="↑ 3.5%" />
              <MetricCard title="EBITDA" value="$4.1M" change="↑ 2.1%" />
              <MetricCard title="IRR" value="12.4%" change="→" />
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