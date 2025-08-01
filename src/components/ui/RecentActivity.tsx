'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const activities = [
  {
    id: 1,
    action: "Valuation Updated",
    company: "TechFlow Solutions",
    user: "Sarah Chen",
    time: "2 hours ago",
    status: "success"
  },
  {
    id: 2,
    action: "New Document Shared",
    company: "GreenEnergy Corp",
    user: "Mike Johnson", 
    time: "4 hours ago",
    status: "info"
  },
  {
    id: 3,
    action: "Version Created",
    company: "DataVault Inc",
    user: "Alex Rivera",
    time: "1 day ago", 
    status: "warning"
  },
  {
    id: 4,
    action: "Team Member Added",
    company: "CloudSync Ltd",
    user: "John Peterson",
    time: "2 days ago",
    status: "success"
  }
];

export default function RecentActivity() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "info": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          Latest updates across your portfolio
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {activity.user.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getStatusColor(activity.status)}>
                  {activity.action}
                </Badge>
              </div>
              <p className="text-sm font-medium">{activity.company}</p>
              <p className="text-xs text-muted-foreground">
                by {activity.user} • {activity.time}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 