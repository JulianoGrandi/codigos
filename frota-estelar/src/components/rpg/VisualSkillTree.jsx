import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, Compass, Wrench, MessageSquare, Swords, FlaskConical,
  Stethoscope, Navigation, Shield, Lock, Star, ChevronRight,
  Plus, Minus, Check, X, Sparkles, Zap, Target, Award
} from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

const CATEGORY_CONFIG = {
  "Astrografia": { icon: Map, color: "cyan", bgGradient: "from-cyan-600 to-blue-700", position: 0 },
  "Engenharia": { icon: Wrench, color: "orange", bgGradient: "from-orange-600 to-amber-700", position: 1 },
  "Diplomacia": { icon: MessageSquare, color: "green", bgGradient: "from-emerald-600 to-teal-700", position: 2 },
  "Combate": { icon: Swords, color: "red", bgGradient: "from-red-600 to-rose-700", position: 3 },
  "Ciência": { icon: FlaskConical, color: "purple", bgGradient: "from-purple-600 to-indigo-700", position: 4 },
  "Medicina": { icon: Stethoscope, color: "pink", bgGradient: "from-pink-600 to-rose-700", position: 5 },
  "Pilotagem": { icon: Navigation, color: "sky", bgGradient: "from-sky-600 to-cyan-700", position: 6 },
  "Comando": { icon: Shield, color: "amber", bgGradient: "from-amber-600 to-yellow-700", position: 7 }
};

const RARITY_CONFIG = {
  "Comum": { color: "slate", glow: false },
  "Incomum": { color: "green", glow: false },
  "Raro": { color: "blue", glow: true },
  "Épico": { color: "purple", glow: true },
  "Lendário": { color: "amber", glow: true, animate: true }
};

function SkillNode({ 
  skill, 
  status, 
  currentLevel, 
  maxLevel, 
  position, 
  onSelect,
  categoryConfig 
}) {
  const rarityConfig = RARITY_CONFIG[skill.rarity] || RARITY_CONFIG["Comum"];
  const Icon = categoryConfig.icon;
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.5, delay: position * 0.05 }}
      onClick={() => onSelect(skill)}
      className={cn(
        "relative group cursor-pointer",
        status === 'locked' && "opacity-50"
      )}
      style={{
        gridColumn: `span 1`,
      }}
    >
      {/* Connection lines would go here in a more complex implementation */}
      
      {/* Node */}
      <div className={cn(
        "relative w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center transition-all",
        status === 'owned' && `border-${rarityConfig.color}-400 bg-${rarityConfig.color}-500/20`,
        status === 'available' && "border-amber-400 bg-amber-500/10 hover:bg-amber-500/20",
        status === 'locked' && "border-slate-700 bg-slate-800/50",
        rarityConfig.glow && status === 'owned' && `shadow-lg shadow-${rarityConfig.color}-500/30`,
        rarityConfig.animate && "animate-pulse"
      )}>
        {/* Tier indicator */}
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
          <span className="text-xs font-bold text-slate-400">{skill.tier || 1}</span>
        </div>

        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-1",
          status === 'owned' ? `bg-gradient-to-br ${categoryConfig.bgGradient}` : "bg-slate-700"
        )}>
          {status === 'locked' ? (
            <Lock className="w-5 h-5 text-slate-500" />
          ) : (
            <Icon className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Level dots */}
        <div className="flex gap-0.5">
          {[...Array(maxLevel)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i < currentLevel
                  ? `bg-${categoryConfig.color}-400`
                  : "bg-slate-700"
              )}
            />
          ))}
        </div>

        {/* Available indicator */}
        {status === 'available' && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <Plus className="w-4 h-4 text-amber-400 animate-bounce" />
          </div>
        )}
      </div>

      {/* Skill name on hover */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-slate-300 bg-slate-900 px-2 py-1 rounded">
          {skill.name}
        </span>
      </div>
    </motion.div>
  );
}

function SkillDetailModal({ skill, status, currentLevel, onLearn, onUpgrade, onClose, availablePoints }) {
  const categoryConfig = CATEGORY_CONFIG[skill.category] || CATEGORY_CONFIG["Comando"];
  const rarityConfig = RARITY_CONFIG[skill.rarity] || RARITY_CONFIG["Comum"];
  const Icon = categoryConfig.icon;
  const maxLevel = skill.maxLevel || 5;
  const canLearn = status === 'available' && availablePoints >= 1;
  const canUpgrade = status === 'owned' && currentLevel < maxLevel && availablePoints >= 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-md rounded-2xl border-2 overflow-hidden",
          `border-${rarityConfig.color}-500/50 bg-slate-900`
        )}
      >
        {/* Header */}
        <div className={cn(
          "p-6 bg-gradient-to-br",
          categoryConfig.bgGradient
        )}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{skill.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={cn(
                    "text-xs",
                    `bg-${rarityConfig.color}-500/30 text-${rarityConfig.color}-200 border-${rarityConfig.color}-400/30`
                  )}>
                    {skill.rarity || 'Comum'}
                  </Badge>
                  <span className="text-sm text-white/70">Tier {skill.tier || 1}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Level Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-white/70 mb-2">
              <span>Nível</span>
              <span>{currentLevel}/{maxLevel}</span>
            </div>
            <div className="flex gap-1">
              {[...Array(maxLevel)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-3 flex-1 rounded-full transition-all",
                    i < currentLevel ? "bg-white" : "bg-white/20"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-300">{skill.description || "Habilidade da Frota Estelar."}</p>

          {/* Bonuses */}
          {skill.bonusesPerLevel && Object.keys(skill.bonusesPerLevel).length > 0 && (
            <div className="p-4 rounded-xl bg-slate-800/50">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">Bônus por Nível:</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(skill.bonusesPerLevel).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-slate-300 capitalize">{key}:</span>
                    <span className="text-sm text-emerald-400">+{val}</span>
                  </div>
                ))}
              </div>
              {currentLevel > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-500">
                    Total atual: {Object.entries(skill.bonusesPerLevel).map(([key, val]) => 
                      `+${val * currentLevel} ${key}`
                    ).join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Requirements */}
          <div className="p-4 rounded-xl bg-slate-800/50">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Requisitos:</h3>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm",
                status !== 'locked' ? "text-emerald-400" : "text-red-400"
              )}>
                {status !== 'locked' ? <Check className="w-4 h-4 inline" /> : <X className="w-4 h-4 inline" />}
              </span>
              <span className="text-sm text-slate-300">Nível {skill.requiredLevel || 1}</span>
            </div>
            {skill.requiredSkillIds?.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                Requer habilidades pré-requisito
              </p>
            )}
          </div>

          {/* Specialization info */}
          {skill.isSpecialization && (
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">Especialização Avançada</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 border-slate-600">
            Fechar
          </Button>
          {canLearn && (
            <Button
              onClick={() => onLearn(skill)}
              className={cn("flex-1 bg-gradient-to-r", categoryConfig.bgGradient)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Aprender (1 pt)
            </Button>
          )}
          {canUpgrade && (
            <Button
              onClick={() => onUpgrade(skill)}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
            >
              <Star className="w-4 h-4 mr-2" />
              Nível {currentLevel + 1} (1 pt)
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function VisualSkillTree({ 
  skills = [], 
  cadet, 
  onLearnSkill, 
  onUpgradeSkill,
  availablePoints = 0 
}) {
  const [selectedCategory, setSelectedCategory] = useState("Comando");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'tree'

  const ownedSkillIds = cadet?.skillIds || [];
  const skillLevels = cadet?.skillLevels || {};

  const categories = Object.keys(CATEGORY_CONFIG);

  const skillsByCategory = useMemo(() => {
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat] = skills
        .filter(s => s.category === cat)
        .sort((a, b) => {
          // Sort by tier, then by required level
          if ((a.tier || 1) !== (b.tier || 1)) return (a.tier || 1) - (b.tier || 1);
          return (a.requiredLevel || 1) - (b.requiredLevel || 1);
        });
    });
    return grouped;
  }, [skills]);

  const getSkillStatus = (skill) => {
    if (ownedSkillIds.includes(skill.id)) return 'owned';
    if ((skill.requiredLevel || 1) > (cadet?.level || 1)) return 'locked';
    if (skill.requiredSkillIds?.length > 0) {
      const hasAllPrereqs = skill.requiredSkillIds.every(reqId => ownedSkillIds.includes(reqId));
      if (!hasAllPrereqs) return 'locked';
    }
    return 'available';
  };

  const categoryConfig = CATEGORY_CONFIG[selectedCategory];
  const CategoryIcon = categoryConfig?.icon || Shield;

  // Group skills by tier for tree view
  const skillsByTier = useMemo(() => {
    const categorySkills = skillsByCategory[selectedCategory] || [];
    const tiers = {};
    categorySkills.forEach(skill => {
      const tier = skill.tier || 1;
      if (!tiers[tier]) tiers[tier] = [];
      tiers[tier].push(skill);
    });
    return tiers;
  }, [skillsByCategory, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Árvore de Habilidades
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {skills.filter(s => ownedSkillIds.includes(s.id)).length} habilidades desbloqueadas
          </p>
        </div>
        <Badge className={cn(
          "text-lg px-4 py-2",
          availablePoints > 0 
            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse" 
            : "bg-slate-800 text-slate-400"
        )}>
          <Sparkles className="w-4 h-4 mr-2" />
          {availablePoints} Pontos
        </Badge>
      </div>

      {/* Category Wheel */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(category => {
            const config = CATEGORY_CONFIG[category];
            const Icon = config.icon;
            const isActive = selectedCategory === category;
            const ownedCount = skillsByCategory[category]?.filter(s => ownedSkillIds.includes(s.id)).length || 0;
            const totalCount = skillsByCategory[category]?.length || 0;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-w-[100px]",
                  isActive 
                    ? `border-${config.color}-400 bg-gradient-to-br ${config.bgGradient}`
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                )}
              >
                <Icon className={cn(
                  "w-6 h-6",
                  isActive ? "text-white" : "text-slate-400"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  isActive ? "text-white" : "text-slate-400"
                )}>
                  {category}
                </span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  isActive 
                    ? "bg-white/20 text-white"
                    : "bg-slate-700 text-slate-500"
                )}>
                  {ownedCount}/{totalCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tree View */}
      <div className={cn(
        "relative p-6 rounded-2xl border-2 min-h-[400px]",
        `border-${categoryConfig.color}-500/30 bg-gradient-to-b from-slate-900 to-slate-950`
      )}>
        {/* Category Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            `bg-gradient-to-br ${categoryConfig.bgGradient}`
          )}>
            <CategoryIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{selectedCategory}</h3>
            <p className="text-sm text-slate-400">
              {skillsByCategory[selectedCategory]?.length || 0} habilidades disponíveis
            </p>
          </div>
        </div>

        {/* Tier-based tree */}
        <div className="space-y-8">
          {Object.entries(skillsByTier).map(([tier, tierSkills]) => (
            <div key={tier}>
              <div className="flex items-center gap-2 mb-4">
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold",
                  `bg-${categoryConfig.color}-500/20 text-${categoryConfig.color}-400`
                )}>
                  Tier {tier}
                </div>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center">
                {tierSkills.map((skill, index) => {
                  const status = getSkillStatus(skill);
                  const currentLevel = skillLevels[skill.id] || 0;
                  
                  return (
                    <SkillNode
                      key={skill.id}
                      skill={skill}
                      status={status}
                      currentLevel={currentLevel}
                      maxLevel={skill.maxLevel || 5}
                      position={index}
                      onSelect={setSelectedSkill}
                      categoryConfig={categoryConfig}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {(!skillsByCategory[selectedCategory] || skillsByCategory[selectedCategory].length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CategoryIcon className="w-16 h-16 text-slate-700 mb-4" />
            <h4 className="text-lg font-semibold text-slate-400">
              Nenhuma habilidade disponível
            </h4>
            <p className="text-sm text-slate-500 mt-2">
              Habilidades de {selectedCategory} aparecerão aqui.
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>Desbloqueada</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span>Disponível</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-slate-700" />
            <span>Bloqueada</span>
          </div>
        </div>
      </div>

      {/* Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <SkillDetailModal
            skill={selectedSkill}
            status={getSkillStatus(selectedSkill)}
            currentLevel={skillLevels[selectedSkill.id] || 0}
            onLearn={(skill) => {
              onLearnSkill(skill);
              setSelectedSkill(null);
            }}
            onUpgrade={(skill) => {
              onUpgradeSkill(skill);
              setSelectedSkill(null);
            }}
            onClose={() => setSelectedSkill(null)}
            availablePoints={availablePoints}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
