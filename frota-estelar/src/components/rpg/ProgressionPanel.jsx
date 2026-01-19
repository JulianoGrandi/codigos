import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Star, Award, Zap, Sparkles, 
  Trophy, Target, ChevronUp, Medal
} from 'lucide-react';
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import LCARSPanel from './LCARSPanel';

const RANKS = [
  { name: "Cadete 4ª Classe", level: 1, color: "slate" },
  { name: "Cadete 3ª Classe", level: 2, color: "zinc" },
  { name: "Cadete 2ª Classe", level: 4, color: "gray" },
  { name: "Cadete 1ª Classe", level: 6, color: "amber" },
  { name: "Alferes", level: 8, color: "amber" },
  { name: "Tenente Junior", level: 10, color: "yellow" },
  { name: "Tenente", level: 15, color: "yellow" },
  { name: "Tenente Comandante", level: 20, color: "orange" },
  { name: "Comandante", level: 25, color: "orange" },
  { name: "Capitão", level: 30, color: "red" }
];

export default function ProgressionPanel({ cadet, skills = [] }) {
  const currentLevel = cadet?.level || 1;
  const currentXp = cadet?.xp || 0;
  const xpForNextLevel = Math.floor(100 * Math.pow(1.2, currentLevel - 1));
  const xpProgress = (currentXp / xpForNextLevel) * 100;

  const currentRankIndex = RANKS.findIndex(r => r.name === cadet?.rank) || 0;
  const nextRank = RANKS[currentRankIndex + 1];
  const currentRank = RANKS[currentRankIndex];

  const ownedSkillIds = cadet?.skillIds || [];
  const ownedSkills = skills.filter(s => ownedSkillIds.includes(s.id));
  
  // Group skills by category
  const skillsByCategory = ownedSkills.reduce((acc, skill) => {
    const cat = skill.category || 'Outro';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  // Calculate total skill levels
  const totalSkillLevels = Object.values(cadet?.skillLevels || {}).reduce((sum, lvl) => sum + lvl, 0);

  // Stats
  const stats = [
    { label: 'Missões Completas', value: cadet?.completedMissions?.length || 0, icon: Target, color: 'cyan' },
    { label: 'Habilidades', value: ownedSkills.length, icon: Sparkles, color: 'purple' },
    { label: 'Níveis de Habilidade', value: totalSkillLevels, icon: TrendingUp, color: 'amber' },
    { label: 'Condecorações', value: cadet?.decorations?.length || 0, icon: Medal, color: 'yellow' }
  ];

  return (
    <LCARSPanel title="Progressão" color="amber">
      <div className="space-y-6">
        {/* Current Level & XP */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-4 border-amber-500/30 mb-3">
            <span className="text-3xl font-bold text-amber-400">{currentLevel}</span>
          </div>
          <h3 className="text-lg font-bold text-white">{cadet?.rank}</h3>
          <p className="text-sm text-slate-400">Nível {currentLevel}</p>
        </div>

        {/* XP Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Experiência</span>
            <span className="text-amber-400 font-mono">{currentXp} / {xpForNextLevel}</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(xpProgress, 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* Unspent Points */}
        {((cadet?.unspentSkillPoints || 0) > 0 || (cadet?.unspentAttributePoints || 0) > 0) && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-pulse">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Pontos Disponíveis!</span>
            </div>
            <div className="flex gap-4 mt-2 text-sm">
              {(cadet?.unspentSkillPoints || 0) > 0 && (
                <span className="text-cyan-400">
                  {cadet.unspentSkillPoints} pts de habilidade
                </span>
              )}
              {(cadet?.unspentAttributePoints || 0) > 0 && (
                <span className="text-purple-400">
                  {cadet.unspentAttributePoints} pts de atributo
                </span>
              )}
            </div>
          </div>
        )}

        {/* Next Rank Progress */}
        {nextRank && (
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">PRÓXIMA PROMOÇÃO</span>
              <ChevronUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{nextRank.name}</p>
                <p className="text-xs text-slate-400">Nível {nextRank.level} necessário</p>
              </div>
              <div className="text-right">
                <span className={cn(
                  "text-sm font-mono",
                  currentLevel >= nextRank.level ? "text-emerald-400" : "text-slate-500"
                )}>
                  {currentLevel}/{nextRank.level}
                </span>
              </div>
            </div>
            <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((currentLevel / nextRank.level) * 100, 100)}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-lg bg-slate-800/50 text-center"
            >
              <stat.icon className={cn(
                "w-5 h-5 mx-auto mb-1",
                stat.color === 'cyan' && "text-cyan-400",
                stat.color === 'purple' && "text-purple-400",
                stat.color === 'amber' && "text-amber-400",
                stat.color === 'yellow' && "text-yellow-400"
              )} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Skills by Category */}
        {Object.keys(skillsByCategory).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-400">Habilidades por Categoria</h4>
            {Object.entries(skillsByCategory).map(([category, catSkills]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(Math.min(catSkills.length, 5))].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-cyan-400"
                        style={{ marginLeft: i > 0 ? '-2px' : 0 }}
                      />
                    ))}
                    {catSkills.length > 5 && (
                      <span className="text-xs text-cyan-400 ml-1">+{catSkills.length - 5}</span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {catSkills.length}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rank Timeline */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-400">Patentes</h4>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-700" />
            {RANKS.slice(0, 6).map((rank, index) => {
              const isPast = index < currentRankIndex;
              const isCurrent = index === currentRankIndex;
              
              return (
                <div key={rank.name} className="relative flex items-center gap-3 py-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center z-10",
                    isPast && "bg-amber-500",
                    isCurrent && "bg-amber-500 ring-4 ring-amber-500/30",
                    !isPast && !isCurrent && "bg-slate-700"
                  )}>
                    {isPast ? (
                      <Star className="w-3 h-3 text-white fill-white" />
                    ) : isCurrent ? (
                      <Star className="w-3 h-3 text-white fill-white animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm font-medium",
                      isCurrent ? "text-amber-400" : isPast ? "text-white" : "text-slate-500"
                    )}>
                      {rank.name}
                    </p>
                    <p className="text-xs text-slate-500">Nível {rank.level}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </LCARSPanel>
  );
}
