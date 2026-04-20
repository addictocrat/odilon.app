import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  title: string;
  value: number | string;
  trend?: number; // Optional percentage change
  trendLabel?: string;
}

export function StatCard({ title, value, trend, trendLabel = "vs last month" }: StatCardProps) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;
  const isNeutral = trend === 0;

  return (
    <div className="bg-odilon-card rounded-2xl p-6 shadow-sm border border-odilon-heading/10 flex flex-col gap-4">
      <h3 className="text-odilon-heading font-header text-lg font-medium opacity-90">
        {title}
      </h3>
      
      <div className="flex items-baseline gap-2">
        <span className="text-odilon-heading text-4xl font-bold tracking-tight">
          {value.toLocaleString()}
        </span>
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-odilon-heading/10 text-sm">
          <div
            className={cn(
              "flex items-center gap-1 font-medium",
              isPositive && "text-green-700",
              isNegative && "text-red-700",
              isNeutral && "text-foreground opacity-70"
            )}
          >
            {isPositive && <TrendingUp className="w-4 h-4" />}
            {isNegative && <TrendingDown className="w-4 h-4" />}
            {isNeutral && <Minus className="w-4 h-4" />}
            
            <span>
              {isPositive ? "+" : ""}
              {trend}%
            </span>
          </div>
          <span className="text-foreground opacity-70 text-xs ml-1">
            {trendLabel}
          </span>
        </div>
      )}
    </div>
  );
}
