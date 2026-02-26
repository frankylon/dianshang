import { Shield, Star, Sparkles } from "lucide-react";
import { getDivLabel, getDivReward } from "@/lib/utils";

export function DivBadge({ div, size = "sm" }: { div: number; size?: "sm" | "md" | "lg" }) {
  const colors = {
    1: "bg-emerald-50 text-emerald-700 border-emerald-200",
    2: "bg-blue-50 text-blue-700 border-blue-200",
    3: "bg-amber-50 text-amber-700 border-amber-200",
  }[div] || "bg-gray-50 text-gray-600 border-gray-200";

  const icons = {
    1: <Shield className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />,
    2: <Star className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />,
    3: <Sparkles className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />,
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const reward = getDivReward(div);

  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 font-medium border rounded-full ${colors} ${sizeClasses[size]}`}>
        {icons[div as keyof typeof icons]}
        Div{div} · {getDivLabel(div)}
      </span>
      {reward && (
        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
          {reward}
        </span>
      )}
    </div>
  );
}
