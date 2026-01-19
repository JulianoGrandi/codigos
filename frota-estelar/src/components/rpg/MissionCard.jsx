import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Zap, Target, Star, Lock, ChevronRight,
  Compass, Users, AlertTriangle, Rocket, Check
} from 'lucide-react';
import { cn } from "../../lib/utils";

const TYPE_ICONS = {
  "Simulação Holodeck": Compass,
  "Exercício de Campo": Target,
  "Diplomacia": Users,
  "Emergência": AlertTriangle,
  "Exploração": Rocket
};

const DIFFICULTY_COLORS = {
  "Fácil": "bg-green-500/20 text-green-400 border-green-500/30",
  "Médio": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Difícil": "bg-red-500/20 text-red-400 border-red-500/30",
  "Kobayashi Maru": "bg-purple-500/20 text-purple-400 border-purple-500/30"
};

export default function MissionCard({ mission, cadetLevel, isCompleted = false, onStart }) {
  const Icon = TYPE_ICONS[mission.type] || Target;
  const isLocked = (mission.requiredLevel || 1) > cadetLevel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all",
        isCompleted
          ? "bg-emerald-900/20 border-emerald-500/30"
          : isLocked 
            ? "bg-slate-900/50 border-slate-700/50 opacity-60" 
            : "bg-slate-900/80 border-cyan-500/20 hover:border-cyan-400/40"
      )}
    >
      {/* Glow effect */}
      {!isLocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
      )}

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isLocked ? "bg-slate-800" : "bg-cyan-500/10"
            )}>
              {isLocked ? (
                <Lock className="w-6 h-6 text-slate-500" />
              ) : (
                <Icon className="w-6 h-6 text-cyan-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-white">{mission.title}</h3>
              <p className="text-xs text-slate-400">{mission.type}</p>
            </div>
          </div>
          <Badge className={cn("border", DIFFICULTY_COLORS[mission.difficulty])}>
            {mission.difficulty}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 line-clamp-2">
          {mission.description}
        </p>

        {/* Rewards */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400">+{mission.xpReward} XP</span>
          </div>
          {mission.skillReward && (
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400">{mission.skillReward}</span>
            </div>
          )}
        </div>

        {/* Requirements & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          {isLocked ? (
            <span className="text-xs text-slate-500">
              Requer Nível {mission.requiredLevel}
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              {mission.requiredDivision ? `Recomendado: ${mission.requiredDivision}` : 'Todas as divisões'}
            </span>
          )}
          
          <Button
            onClick={() => onStart(mission)}
            disabled={isLocked || isCompleted}
            size="sm"
            className={cn(
              "gap-1",
              isCompleted
                ? "bg-emerald-600/50 text-emerald-300"
                : isLocked 
                  ? "bg-slate-700 text-slate-500" 
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
            )}
          >
            {isCompleted ? (
              <>Completa <Check className="w-4 h-4" /></>
            ) : isLocked ? (
              'Bloqueada'
            ) : (
              <>Iniciar <ChevronRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
