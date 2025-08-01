'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, DollarSign, TrendingUp, FileText } from "lucide-react";
import { useState, useEffect } from "react";

const valuations = [
  {
    id: 1,
    company: "TechFlow Solutions",
    date: "2024-09-30",
    method: "DCF",
    value: "$78M",
    previousValue: "$65M",
    change: "+20.0%",
    multiple: "1.73x",
    status: "Approved",
    auditor: "Sarah Chen"
  },
  {
    id: 2,
    company: "GreenEnergy Corp",
    date: "2024-09-30",
    method: "Market Comps",
    value: "$92M",
    previousValue: "$85M",
    change: "+8.2%",
    multiple: "1.42x",
    status: "Pending",
    auditor: "Mike Johnson"
  },
  {
    id: 3,
    company: "DataVault Inc",
    date: "2024-06-30",
    method: "Revenue Multiple",
    value: "$58M",
    previousValue: "$52M",
    change: "+11.5%",
    multiple: "1.53x",
    status: "Approved",
    auditor: "Alex Rivera"
  },
  {
    id: 4,
    company: "CloudSync Ltd",
    date: "2024-09-30",
    method: "DCF + Comps",
    value: "$89M",
    previousValue: "$76M",
    change: "+17.1%",
    multiple: "1.71x",
    status: "Under Review",
    auditor: "Jennifer Liu"
  }
];

export default function ValuationsPage() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const demoMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Under Review": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getChangeColor = (change: string) => {
    return change.startsWith("+") ? "text-green-600" : "text-red-600";
  };

  const handleNewValuation = () => {
    if (isDemoMode) {
      alert(`Demo Mode: Creating new valuation\n\nThis would open a valuation form in production.`);
    } else {
      // TODO: Implement actual new valuation functionality
      console.log('Creating new valuation');
    }
  };

  const handleViewReport = (company: string) => {
    if (isDemoMode) {
      alert(`Demo Mode: Viewing valuation report for ${company}\n\nThis would open a detailed PDF report in production.`);
    } else {
      // TODO: Implement actual report viewing
      console.log('Viewing report for:', company);
    }
  };

  const handleViewTrends = (company: string) => {
    if (isDemoMode) {
      alert(`Demo Mode: Viewing valuation trends for ${company}\n\nThis would show historical valuation data and trends in production.`);
    } else {
      // TODO: Implement actual trends viewing
      console.log('Viewing trends for:', company);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Valuations</h1>
          <p className="text-muted-foreground">
            Track and manage portfolio company valuations
          </p>
          {isDemoMode && (
            <p className="text-sm text-blue-600 mt-2">
              🎯 Demo Mode: Interactive valuation management for demonstration
            </p>
          )}
        </div>
        <Button onClick={handleNewValuation}>
          <DollarSign className="h-4 w-4 mr-2" />
          New Valuation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$317M</div>
            <p className="text-xs text-green-600">+14.2% from last quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Multiple</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.60x</div>
            <p className="text-xs text-green-600">+0.05x from last quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Requiring approval</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Valuations</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest valuation updates across your portfolio
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Multiple</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {valuations.map((valuation) => (
                <TableRow key={valuation.id}>
                  <TableCell className="font-medium">{valuation.company}</TableCell>
                  <TableCell>{valuation.date}</TableCell>
                  <TableCell>{valuation.method}</TableCell>
                  <TableCell className="font-semibold">{valuation.value}</TableCell>
                  <TableCell className={getChangeColor(valuation.change)}>
                    {valuation.change}
                  </TableCell>
                  <TableCell>{valuation.multiple}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(valuation.status)}>
                      {valuation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewReport(valuation.company)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewTrends(valuation.company)}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 