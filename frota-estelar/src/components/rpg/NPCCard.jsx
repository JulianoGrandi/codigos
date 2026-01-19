import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "../../lib/utils";
import { 
  User, GraduationCap, Users, Heart,
  ChevronRight, MessageCircle
} from 'lucide-react';
import { Button } from "../ui/button";

const TYPE_CONFIG = {
  instrutor: { 
    icon: GraduationCap, 
    color: "red", 
    label: "Instrutor",
    gradient: "from-red-500/20 to-red-600/20",
    border: "border-red-400/30",
    text: "text-red-400"
  },
  colega: { 
    icon: Users, 
    color: "amber", 
    label: "Colega",
    gradient: "from-amber-500/20 to-amber-600/20",
    border: "border-amber-400/30",
    text: "text-amber-400"
  },
  amigo: { 
    icon: Heart, 
    color: "cyan", 
    label: "Amigo",
    gradient: "from-cyan-500/20 to-cyan-600/20",
    border: "border-cyan-400/30",
    text: "text-cyan-400"
  }
};

const STATUS_LABELS = {
  hostil: { label: "Hostil", color: "text-red-500", bg: "bg-red-500/20" },
  desconfiado: { label: "Desconfiado", color: "text-orange-500", bg: "bg-orange-500/20" },
  neutro: { label: "Neutro", color: "text-slate-400", bg: "bg-slate-500/20" },
  amigável: { label: "Amigável", color: "text-green-400", bg: "bg-green-500/20" },
  aliado: { label: "Aliado", color: "text-cyan-400", bg: "bg-cyan-500/20" },
  melhor_amigo: { label: "Melhor Amigo", color: "text-purple-400", bg: "bg-purple-500/20" }
};

export default function NPCCard({ npc, relationship, onInteract }) {
  const config = TYPE_CONFIG[npc.type] || TYPE_CONFIG.amigo;
  const Icon = config.icon;
  const status = relationship?.status || 'neutro';
  const statusConfig = STATUS_LABELS[status];
  const relationshipLevel = relationship?.level || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-slate-900/80 transition-all",
        config.border,
        "hover:shadow-lg hover:shadow-cyan-500/10"
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none", config.gradient)} />
      
      <div className="relative p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br",
            config.gradient,
            "border-2",
            config.border
          )}>
            <User className={cn("w-8 h-8", config.text)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-lg">{npc.name}</h3>
              <Icon className={cn("w-4 h-4", config.text)} />
            </div>
            <p className="text-sm text-slate-400">{npc.title}</p>
            <p className="text-xs text-slate-500 mt-1">{npc.species}</p>
          </div>
        </div>

        {/* Personality */}
        <p className="text-sm text-slate-400 italic line-clamp-2">
          "{npc.personality}"
        </p>

        {/* Relationship Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={cn("px-2 py-0.5 rounded-full text-xs", statusConfig.bg, statusConfig.color)}>
              {statusConfig.label}
            </span>
            <span className="text-slate-500">
              Nível: <span className={cn(
                relationshipLevel > 0 ? "text-green-400" : 
                relationshipLevel < 0 ? "text-red-400" : "text-slate-400"
              )}>{relationshipLevel > 0 ? '+' : ''}{relationshipLevel}</span>
            </span>
          </div>
          
          {/* Relationship Bar */}
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full flex">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all"
                style={{ width: `${Math.max(0, -relationshipLevel) / 2}%` }}
              />
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all"
                style={{ width: `${Math.max(0, relationshipLevel) / 2}%`, marginLeft: 'auto' }}
              />
            </div>
          </div>
        </div>

        {/* Interact Button */}
        <Button
          onClick={() => onInteract(npc)}
          className={cn(
            "w-full gap-2",
            config.color === "red" && "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500",
            config.color === "amber" && "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500",
            config.color === "cyan" && "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500"
          )}
        >
          <MessageCircle className="w-4 h-4" />
          Interagir
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
