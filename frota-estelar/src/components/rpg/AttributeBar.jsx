import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "../../lib/utils";

export default function AttributeBar({ 
  label, 
  value, 
  baseValue,
  maxValue = 20, 
  color = "blue",
  icon: Icon,
  size = "md"
}) {
  const percentage = (value / maxValue) * 100;
  const hasBonus = baseValue !== undefined && value > baseValue;
  
  const colors = {
    blue: "from-cyan-400 to-blue-500",
    orange: "from-amber-400 to-orange-500",
    red: "from-red-400 to-red-500",
    purple: "from-purple-400 to-indigo-500",
    green: "from-emerald-400 to-teal-500"
  };

  const bgColors = {
    blue: "bg-cyan-950/50",
    orange: "bg-amber-950/50",
    red: "bg-red-950/50",
    purple: "bg-purple-950/50",
    green: "bg-emerald-950/50"
  };

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            {label}
          </span>
        </div>
        <span className="text-sm font-bold text-white">
          {baseValue !== undefined ? baseValue : value}
          {hasBonus && (
            <span className="text-green-400 text-xs ml-1">(+{value - baseValue})</span>
          )}
          <span className="text-slate-500">/{maxValue}</span>
        </span>
      </div>
      <div className={cn(
        "w-full rounded-full overflow-hidden",
        bgColors[color],
        sizeClasses[size]
      )}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            colors[color]
          )}
        />
      </div>
    </div>
  );
}
