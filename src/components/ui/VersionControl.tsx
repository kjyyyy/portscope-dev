'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GitBranch, History, ArrowLeft, ArrowRight, GitCommit } from "lucide-react";
import { useState, useEffect } from "react";

const versions = [
  {
    id: "v1.2.1",
    message: "Updated Q3 valuation models",
    author: "Sarah Chen",
    date: "2024-10-15",
    changes: "+12 -4",
    status: "current"
  },
  {
    id: "v1.2.0", 
    message: "Added new KPI dashboard",
    author: "Mike Johnson",
    date: "2024-10-10",
    changes: "+28 -2",
    status: "previous"
  },
  {
    id: "v1.1.9",
    message: "Fixed IRR calculation bug",
    author: "Alex Rivera", 
    date: "2024-10-05",
    changes: "+3 -1",
    status: "archived"
  }
];

export default function VersionControl() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const demoMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  const handleRestore = (versionId: string) => {
    if (isDemoMode) {
      alert(`Demo Mode: Restoring version ${versionId}\n\nThis would restore the document to the previous state in production.`);
    } else {
      // TODO: Implement actual restore functionality
      console.log('Restoring version:', versionId);
    }
  };

  const handleCompareVersions = () => {
    if (isDemoMode) {
      alert(`Demo Mode: Opening version comparison tool\n\nThis would show a diff view between different versions in production.`);
    } else {
      // TODO: Implement actual comparison functionality
      console.log('Comparing versions');
    }
  };

  const handleCreateBranch = () => {
    if (isDemoMode) {
      alert(`Demo Mode: Creating new branch\n\nThis would create a new branch for parallel development in production.`);
    } else {
      // TODO: Implement actual branch creation
      console.log('Creating branch');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Version History
          {isDemoMode && (
            <Badge variant="secondary" className="ml-auto">
              Demo Mode
            </Badge>
          )}
          <Badge variant="outline" className="ml-auto">
            <History className="h-3 w-3 mr-1" />
            12 versions
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {versions.map((version, index) => (
          <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <GitCommit className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{version.id}</span>
                  {version.status === "current" && (
                    <Badge variant="default" className="text-xs">Current</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{version.message}</p>
                <p className="text-xs text-muted-foreground">
                  by {version.author} on {version.date} • {version.changes}
                </p>
              </div>
            </div>
            
            <div className="flex gap-1">
              {version.status !== "current" && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRestore(version.id)}
                >
                  Restore
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <Separator />
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleCompareVersions}>
            Compare Versions
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleCreateBranch}>
            Create Branch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 