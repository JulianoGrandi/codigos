import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Star, Award, Brain, Heart, Zap, Swords, Sparkles,
  TrendingUp, BookOpen, ChevronDown, ChevronUp, Plus
} from 'lucide-react';
import { Button } from "../ui/button";
import LCARSPanel from './LCARSPanel';
import AttributeBar from './AttributeBar';
import SkillCard from './SkillCard';
import { cn } from "../../lib/utils";

const DIVISION_COLORS = {
  "Comando": "red",
  "Ciências": "blue",
  "Engenharia": "orange",
  "Médico": "green",
  "Segurança": "purple"
};

const RANK_ICONS = {
  "Cadete 4ª Classe": 1,
  "Cadete 3ª Classe": 2,
  "Cadete 2ª Classe": 3,
  "Cadete 1ª Classe": 4,
  "Alferes": 5,
  "Tenente Junior": 6,
  "Tenente": 7,
  "Tenente Comandante": 8,
  "Comandante": 9,
  "Capitão": 10
};

export default function CadetProfile({ cadet, skills = [], onSpendPoints }) {
  const [showSkills, setShowSkills] = useState(false);
  const color = DIVISION_COLORS[cadet.division] || "blue";
  
  // XP calculation - scales with level
  const xpForNextLevel = Math.floor(100 * Math.pow(1.2, cadet.level - 1));
  const xpProgress = (cadet.xp / xpForNextLevel) * 100;

  // Get owned skills
  const ownedSkills = skills.filter(s => cadet.skillIds?.includes(s.id));
  
  // Calculate total bonuses from skills
  const totalBonuses = ownedSkills.reduce((acc, skill) => {
    if (skill.bonuses) {
      Object.entries(skill.bonuses).forEach(([key, val]) => {
        acc[key] = (acc[key] || 0) + val;
      });
    }
    return acc;
  }, {});

  // Effective attributes (base + skill bonuses)
  const effectiveAttributes = {
    logic: (cadet.attributes?.logic || 5) + (totalBonuses.logic || 0),
    charisma: (cadet.attributes?.charisma || 5) + (totalBonuses.charisma || 0),
    strength: (cadet.attributes?.strength || 5) + (totalBonuses.strength || 0),
    agility: (cadet.attributes?.agility || 5) + (totalBonuses.agility || 0),
    intelligence: (cadet.attributes?.intelligence || 5) + (totalBonuses.intelligence || 0)
  };

  return (
    <LCARSPanel title="Registro do Cadete" color={color} className="h-full">
      <div className="space-y-6">
        {/* Header with Avatar */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center",
            "bg-gradient-to-br",
            color === "red" && "from-red-500/20 to-red-600/20 border-2 border-red-400/30",
            color === "blue" && "from-cyan-500/20 to-blue-600/20 border-2 border-cyan-400/30",
            color === "orange" && "from-amber-500/20 to-orange-600/20 border-2 border-amber-400/30",
            color === "green" && "from-emerald-500/20 to-teal-600/20 border-2 border-emerald-400/30",
            color === "purple" && "from-purple-500/20 to-indigo-600/20 border-2 border-purple-400/30"
          )}>
            <User className={cn(
              "w-10 h-10",
              color === "red" && "text-red-400",
              color === "blue" && "text-cyan-400",
              color === "orange" && "text-amber-400",
              color === "green" && "text-emerald-400",
              color === "purple" && "text-purple-400"
            )} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{cadet.name}</h2>
            <p className="text-slate-400 text-sm">{cadet.species}</p>
            <div className="flex items-center gap-2 mt-1">
              {[...Array(Math.min(RANK_ICONS[cadet.rank] || 1, 5))].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
              ))}
              {(RANK_ICONS[cadet.rank] || 1) > 5 && (
                <span className="text-xs text-amber-400">+{(RANK_ICONS[cadet.rank] || 1) - 5}</span>
              )}
              <span className="text-xs text-amber-400 ml-1">{cadet.rank}</span>
            </div>
          </div>
        </div>

        {/* Division Badge */}
        <div className={cn(
          "p-3 rounded-xl border",
          color === "red" && "bg-red-500/10 border-red-400/30",
          color === "blue" && "bg-cyan-500/10 border-cyan-400/30",
          color === "orange" && "bg-amber-500/10 border-amber-400/30",
          color === "green" && "bg-emerald-500/10 border-emerald-400/30",
          color === "purple" && "bg-purple-500/10 border-purple-400/30"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Divisão</p>
              <p className={cn(
                "font-bold",
                color === "red" && "text-red-400",
                color === "blue" && "text-cyan-400",
                color === "orange" && "text-amber-400",
                color === "green" && "text-emerald-400",
                color === "purple" && "text-purple-400"
              )}>{cadet.division}</p>
            </div>
            <Award className={cn(
              "w-8 h-8",
              color === "red" && "text-red-400",
              color === "blue" && "text-cyan-400",
              color === "orange" && "text-amber-400",
              color === "green" && "text-emerald-400",
              color === "purple" && "text-purple-400"
            )} />
          </div>
        </div>

        {/* Level & XP */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-300">Nível {cadet.level}</span>
            </div>
            <span className="text-xs text-slate-500">{cadet.xp}/{xpForNextLevel} XP</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(xpProgress, 100)}%` }}
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
            />
          </div>
        </div>

        {/* Unspent Points Alert */}
        {(cadet.unspentAttributePoints || 0) > 0 && (
          <Button
            onClick={onSpendPoints}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 animate-pulse"
          >
            <Plus className="w-4 h-4 mr-2" />
            {cadet.unspentAttributePoints} Pontos para Distribuir!
          </Button>
        )}

        {/* Attributes */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Atributos
            {Object.values(totalBonuses).some(v => v > 0) && (
              <span className="text-xs text-green-400">(com bônus)</span>
            )}
          </h3>
          <div className="space-y-2">
            <AttributeBar 
              label="Lógica" 
              value={effectiveAttributes.logic} 
              baseValue={cadet.attributes?.logic || 5}
              maxValue={20}
              color="blue" 
              icon={Brain} 
              size="sm" 
            />
            <AttributeBar 
              label="Carisma" 
              value={effectiveAttributes.charisma}
              baseValue={cadet.attributes?.charisma || 5}
              maxValue={20}
              color="green" 
              icon={Heart} 
              size="sm" 
            />
            <AttributeBar 
              label="Força" 
              value={effectiveAttributes.strength}
              baseValue={cadet.attributes?.strength || 5}
              maxValue={20}
              color="red" 
              icon={Swords} 
              size="sm" 
            />
            <AttributeBar 
              label="Agilidade" 
              value={effectiveAttributes.agility}
              baseValue={cadet.attributes?.agility || 5}
              maxValue={20}
              color="orange" 
              icon={Zap} 
              size="sm" 
            />
            <AttributeBar 
              label="Inteligência" 
              value={effectiveAttributes.intelligence}
              baseValue={cadet.attributes?.intelligence || 5}
              maxValue={20}
              color="purple" 
              icon={Sparkles} 
              size="sm" 
            />
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-2">
          <button
            onClick={() => setShowSkills(!showSkills)}
            className="w-full flex items-center justify-between text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> 
              Habilidades ({ownedSkills.length})
            </span>
            {showSkills ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showSkills && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 max-h-60 overflow-y-auto pr-1"
            >
              {ownedSkills.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhuma habilidade adquirida ainda.
                </p>
              ) : (
                ownedSkills.map(skill => (
                  <SkillCard key={skill.id} skill={skill} owned compact />
                ))
              )}
            </motion.div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="text-center p-3 rounded-lg bg-slate-800/50">
            <p className="text-2xl font-bold text-white">
              {cadet.completedMissions?.length || 0}
            </p>
            <p className="text-xs text-slate-400">Missões</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/50">
            <p className="text-2xl font-bold text-white">
              {ownedSkills.length}
            </p>
            <p className="text-xs text-slate-400">Habilidades</p>
          </div>
        </div>
      </div>
    </LCARSPanel>
  );
}
