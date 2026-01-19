import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "../../lib/utils";
import { 
  Crosshair, Shirt, Gem, Wrench, Award,
  Plus, Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const SLOT_ICONS = {
  weapon: Crosshair,
  uniform: Shirt,
  accessory: Gem,
  tool: Wrench,
  badge: Award
};

const SLOT_LABELS = {
  weapon: "Arma",
  uniform: "Uniforme",
  accessory: "Acessório",
  tool: "Ferramenta",
  badge: "Insígnia"
};

const RARITY_COLORS = {
  comum: "border-slate-500 bg-slate-800/50",
  incomum: "border-green-500 bg-green-900/20",
  raro: "border-blue-500 bg-blue-900/20",
  épico: "border-purple-500 bg-purple-900/20",
  lendário: "border-amber-500 bg-amber-900/20"
};

const RARITY_GLOW = {
  comum: "",
  incomum: "shadow-green-500/20",
  raro: "shadow-blue-500/30",
  épico: "shadow-purple-500/40",
  lendário: "shadow-amber-500/50 animate-pulse"
};

export default function EquipmentSlot({ slot, item, onSelect, onUnequip }) {
  const Icon = SLOT_ICONS[slot] || Gem;
  const label = SLOT_LABELS[slot] || slot;

  if (!item) {
    return (
      <button
        onClick={() => onSelect?.(slot)}
        className={cn(
          "w-full aspect-square rounded-xl border-2 border-dashed border-slate-700",
          "bg-slate-900/50 hover:bg-slate-800/50 hover:border-slate-600",
          "flex flex-col items-center justify-center gap-2 transition-all",
          "group"
        )}
      >
        <Icon className="w-6 h-6 text-slate-600 group-hover:text-slate-400 transition-colors" />
        <span className="text-[10px] text-slate-600 group-hover:text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <Plus className="w-4 h-4 text-slate-700 group-hover:text-cyan-400 transition-colors" />
      </button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => onUnequip?.(slot)}
            className={cn(
              "w-full aspect-square rounded-xl border-2 transition-all",
              "flex flex-col items-center justify-center gap-1 p-2",
              "hover:scale-105 cursor-pointer relative overflow-hidden",
              RARITY_COLORS[item.rarity] || RARITY_COLORS.comum,
              RARITY_GLOW[item.rarity] ? `shadow-lg ${RARITY_GLOW[item.rarity]}` : ""
            )}
          >
            {/* Rarity glow effect */}
            {item.rarity === 'lendário' && (
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent" />
            )}
            
            <Icon className={cn(
              "w-6 h-6",
              item.rarity === 'comum' && "text-slate-400",
              item.rarity === 'incomum' && "text-green-400",
              item.rarity === 'raro' && "text-blue-400",
              item.rarity === 'épico' && "text-purple-400",
              item.rarity === 'lendário' && "text-amber-400"
            )} />
            <span className="text-[10px] text-white font-medium text-center line-clamp-2">
              {item.name}
            </span>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-900 border-slate-700 max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-bold",
                item.rarity === 'comum' && "text-slate-300",
                item.rarity === 'incomum' && "text-green-400",
                item.rarity === 'raro' && "text-blue-400",
                item.rarity === 'épico' && "text-purple-400",
                item.rarity === 'lendário' && "text-amber-400"
              )}>
                {item.name}
              </span>
              <span className={cn(
                "text-[10px] uppercase px-1.5 py-0.5 rounded",
                item.rarity === 'comum' && "bg-slate-700 text-slate-400",
                item.rarity === 'incomum' && "bg-green-900/50 text-green-400",
                item.rarity === 'raro' && "bg-blue-900/50 text-blue-400",
                item.rarity === 'épico' && "bg-purple-900/50 text-purple-400",
                item.rarity === 'lendário' && "bg-amber-900/50 text-amber-400"
              )}>
                {item.rarity}
              </span>
            </div>
            <p className="text-xs text-slate-400">{item.description}</p>
            {item.stats && Object.keys(item.stats).length > 0 && (
              <div className="pt-2 border-t border-slate-700 space-y-1">
                {Object.entries(item.stats).map(([stat, value]) => (
                  <div key={stat} className="flex justify-between text-xs">
                    <span className="text-slate-400 capitalize">{stat}</span>
                    <span className="text-cyan-400">+{value}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-slate-500 italic pt-1">Clique para desequipar</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
