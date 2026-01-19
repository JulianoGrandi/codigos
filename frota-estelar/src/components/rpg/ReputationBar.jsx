import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "../../lib/utils";
import { Shield, AlertTriangle, Star, Award } from 'lucide-react';

export default function ReputationBar({ value, maxValue = 100, type = "reputation" }) {
  const percentage = (value / maxValue) * 100;
  
  const getStatus = () => {
    if (type === "reputation") {
      if (value >= 80) return { label: "Exemplar", color: "from-amber-400 to-yellow-500", icon: Award, textColor: "text-amber-400" };
      if (value >= 60) return { label: "Respeitado", color: "from-green-400 to-emerald-500", icon: Star, textColor: "text-green-400" };
      if (value >= 40) return { label: "Neutro", color: "from-blue-400 to-cyan-500", icon: Shield, textColor: "text-blue-400" };
      if (value >= 20) return { label: "Questionável", color: "from-orange-400 to-amber-500", icon: AlertTriangle, textColor: "text-orange-400" };
      return { label: "Infame", color: "from-red-500 to-red-600", icon: AlertTriangle, textColor: "text-red-400" };
    } else {
      if (value >= 80) return { label: "Impecável", color: "from-cyan-400 to-blue-500", icon: Award, textColor: "text-cyan-400" };
      if (value >= 60) return { label: "Bom", color: "from-green-400 to-emerald-500", icon: Star, textColor: "text-green-400" };
      if (value >= 40) return { label: "Regular", color: "from-amber-400 to-yellow-500", icon: Shield, textColor: "text-amber-400" };
      if (value >= 20) return { label: "Alerta", color: "from-orange-400 to-red-500", icon: AlertTriangle, textColor: "text-orange-400" };
      return { label: "Expulsão Iminente", color: "from-red-500 to-red-700", icon: AlertTriangle, textColor: "text-red-500" };
    }
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", status.textColor)} />
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            {type === "reputation" ? "Reputação" : "Disciplina"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold", status.textColor)}>
            {status.label}
          </span>
          <span className="text-sm font-bold text-white">
            {value}%
          </span>
        </div>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full bg-gradient-to-r", status.color)}
        />
      </div>
    </div>
  );
}
