'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const portfolioData = [
  { month: 'Jan', value: 850 },
  { month: 'Feb', value: 920 },
  { month: 'Mar', value: 780 },
  { month: 'Apr', value: 1050 },
  { month: 'May', value: 1200 },
  { month: 'Jun', value: 1150 },
];

const quarterlyData = [
  { name: "Q1", value: 100 },
  { name: "Q2", value: 140 },
  { name: "Q3", value: 110 },
  { name: "Q4", value: 160 },
];

type Props = {
  title: string;
  type?: "line" | "bar";
  data?: Array<Record<string, unknown>>;
  dataKey?: string;
  xAxisKey?: string;
  formatter?: (value: unknown) => [string, string];
};

export default function ChartCard({ 
  title, 
  type = "line", 
  data = quarterlyData, 
  dataKey = "value",
  xAxisKey = "name",
  formatter
}: Props) {
  const chartData = data || (type === "bar" ? portfolioData : quarterlyData);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {type === "bar" ? "Portfolio value over the last 6 months" : "Quarterly performance trends"}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisKey} />
                <YAxis />
                <Tooltip 
                  formatter={formatter || ((value) => [`$${value}M`, 'Portfolio Value'])}
                />
                <Bar dataKey={dataKey} fill="hsl(var(--primary))" />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisKey} />
                <YAxis />
                <Tooltip formatter={formatter} />
                <Line 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
