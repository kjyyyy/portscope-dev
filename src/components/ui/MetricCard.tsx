import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  value: string;
  change: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
};

export default function MetricCard({ title, value, change, trend = "neutral", icon }: Props) {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="h-3 w-3 text-green-600 mr-1" />;
    if (trend === "down") return <TrendingDown className="h-3 w-3 text-red-600 mr-1" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs mt-2">
          {getTrendIcon()}
          <span className={cn("font-medium", getTrendColor())}>
            {change}
          </span>
          {trend !== "neutral" && (
            <span className="text-muted-foreground ml-1">from last quarter</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
