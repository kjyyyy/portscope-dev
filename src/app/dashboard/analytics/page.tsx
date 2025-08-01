'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from 'react';

const performanceData = [
  { quarter: 'Q1 2023', irr: 15.2, value: 280 },
  { quarter: 'Q2 2023', irr: 16.8, value: 295 },
  { quarter: 'Q3 2023', irr: 14.5, value: 285 },
  { quarter: 'Q4 2023', irr: 17.9, value: 305 },
  { quarter: 'Q1 2024', irr: 18.4, value: 317 },
];

const sectorData = [
  { name: 'Technology', value: 35, amount: '$111M' },
  { name: 'Clean Energy', value: 25, amount: '$79M' },
  { name: 'Healthcare', value: 20, amount: '$63M' },
  { name: 'SaaS', value: 15, amount: '$48M' },
  { name: 'Other', value: 5, amount: '$16M' }
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--muted))'];

export default function AnalyticsPage() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const demoMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  const handleExportData = () => {
    if (isDemoMode) {
      alert(`Demo Mode: Exporting analytics data\n\nThis would download a comprehensive report in production.`);
    } else {
      // TODO: Implement actual export functionality
      console.log('Exporting analytics data');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
          <p className="text-muted-foreground">
            Advanced insights and performance metrics
          </p>
          {isDemoMode && (
            <p className="text-sm text-blue-600 mt-2">
              🎯 Demo Mode: Interactive charts and analytics for demonstration
            </p>
          )}
        </div>
        {isDemoMode && (
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Export Report
          </button>
        )}
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>IRR Performance</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Internal Rate of Return over time
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'IRR']}
                    />
                    <Line
                      type="monotone"
                      dataKey="irr"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Value Growth</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Total portfolio value in millions
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`$${value}M`, 'Portfolio Value']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--accent))"
                      fill="hsl(var(--accent))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Portfolio distribution by industry sector
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [props.payload.amount, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Stage Distribution</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Breakdown by investment stage
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { stage: 'Growth', count: 8, percentage: 33, amount: '$105M' },
                  { stage: 'Expansion', count: 6, percentage: 25, amount: '$79M' },
                  { stage: 'Series B', count: 5, percentage: 21, amount: '$67M' },
                  { stage: 'Series A', count: 3, percentage: 13, amount: '$41M' },
                  { stage: 'Seed', count: 2, percentage: 8, amount: '$25M' }
                ].map((item) => (
                  <div key={item.stage} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded"></div>
                      <span className="font-medium">{item.stage}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.count} companies ({item.percentage}%)
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Risk Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">7.2</div>
                <p className="text-sm text-muted-foreground">Medium Risk</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volatility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">±12.4%</div>
                <p className="text-sm text-muted-foreground">Quarterly variance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Concentration Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">Low</div>
                <p className="text-sm text-muted-foreground">Well diversified</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 