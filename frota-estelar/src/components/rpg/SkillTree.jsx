import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, Compass, Wrench, MessageSquare, Swords, FlaskConical,
  Stethoscope, Navigation, Shield, Lock, Star, ChevronRight,
  Plus, Minus, Check, X, Sparkles
} from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import LCARSPanel from './LCARSPanel';

const CATEGORY_CONFIG = {
  "Astrografia": { icon: Map, color: "cyan", gradient: "from-cyan-500 to-blue-600" },
  "Engenharia": { icon: Wrench, color: "orange", gradient: "from-orange-500 to-amber-600" },
  "Diplomacia": { icon: MessageSquare, color: "green", gradient: "from-emerald-500 to-teal-600" },
  "Combate": { icon: Swords, color: "red", gradient: "from-red-500 to-rose-600" },
  "Ciência": { icon: FlaskConical, color: "purple", gradient: "from-purple-500 to-indigo-600" },
  "Medicina": { icon: Stethoscope, color: "pink", gradient: "from-pink-500 to-rose-600" },
  "Pilotagem": { icon: Navigation, color: "sky", gradient: "from-sky-500 to-cyan-600" },
  "Comando": { icon: Shield, color: "amber", gradient: "from-amber-500 to-yellow-600" }
};

const RARITY_COLORS = {
  "Comum": "border-slate-500 bg-slate-500/10",
  "Incomum": "border-green-500 bg-green-500/10",
  "Raro": "border-blue-500 bg-blue-500/10",
  "Épico": "border-purple-500 bg-purple-500/10",
  "Lendário": "border-amber-500 bg-amber-500/10 animate-pulse"
};

export default function SkillTree({ 
  skills = [], 
  cadet, 
  onLearnSkill, 
  onUpgradeSkill,
  availablePoints = 0 
}) {
  const [selectedCategory, setSelectedCategory] = useState("Astrografia");
  const [selectedSkill, setSelectedSkill] = useState(null);

  const ownedSkillIds = cadet?.skillIds || [];
  const skillLevels = cadet?.skillLevels || {};

  const categories = Object.keys(CATEGORY_CONFIG);

  const skillsByCategory = useMemo(() => {
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat] = skills
        .filter(s => s.category === cat && !s.isSpecialization)
        .sort((a, b) => (a.tier || 1) - (b.tier || 1));
    });
    return grouped;
  }, [skills]);

  const specializations = useMemo(() => {
    return skills.filter(s => s.isSpecialization);
  }, [skills]);

  const canLearnSkill = (skill) => {
    if (ownedSkillIds.includes(skill.id)) return false;
    if ((skill.requiredLevel || 1) > (cadet?.level || 1)) return false;
    if (availablePoints < 1) return false;
    
    // Check prerequisites
    if (skill.requiredSkillIds?.length > 0) {
      const hasAllPrereqs = skill.requiredSkillIds.every(reqId => {
        const reqLevel = skill.requiredSkillLevels?.[reqId] || 1;
        return ownedSkillIds.includes(reqId) && (skillLevels[reqId] || 1) >= reqLevel;
      });
      if (!hasAllPrereqs) return false;
    }
    
    return true;
  };

  const canUpgradeSkill = (skill) => {
    if (!ownedSkillIds.includes(skill.id)) return false;
    const currentLevel = skillLevels[skill.id] || 1;
    if (currentLevel >= (skill.maxLevel || 5)) return false;
    if (availablePoints < 1) return false;
    return true;
  };

  const getSkillStatus = (skill) => {
    if (ownedSkillIds.includes(skill.id)) return 'owned';
    if (canLearnSkill(skill)) return 'available';
    return 'locked';
  };

  const CategoryIcon = CATEGORY_CONFIG[selectedCategory]?.icon || Map;
  const categoryColor = CATEGORY_CONFIG[selectedCategory]?.color || "cyan";

  return (
    <div className="space-y-6">
      {/* Points Display */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Árvore de Habilidades
        </h2>
        <Badge className={cn(
          "text-lg px-4 py-2",
          availablePoints > 0 
            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse" 
            : "bg-slate-800 text-slate-400"
        )}>
          {availablePoints} Pontos Disponíveis
        </Badge>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(category => {
          const Icon = CATEGORY_CONFIG[category].icon;
          const isActive = selectedCategory === category;
          const ownedCount = skillsByCategory[category]?.filter(s => ownedSkillIds.includes(s.id)).length || 0;
          const totalCount = skillsByCategory[category]?.length || 0;
          
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap",
                isActive 
                  ? `border-${CATEGORY_CONFIG[category].color}-400 bg-${CATEGORY_CONFIG[category].color}-500/10`
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
              )}
            >
              <Icon className={cn(
                "w-5 h-5",
                isActive ? `text-${CATEGORY_CONFIG[category].color}-400` : "text-slate-400"
              )} />
              <span className={cn(
                "font-medium text-sm",
                isActive ? "text-white" : "text-slate-400"
              )}>
                {category}
              </span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                isActive 
                  ? `bg-${CATEGORY_CONFIG[category].color}-500/20 text-${CATEGORY_CONFIG[category].color}-400`
                  : "bg-slate-700 text-slate-500"
              )}>
                {ownedCount}/{totalCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {skillsByCategory[selectedCategory]?.map((skill, index) => {
            const status = getSkillStatus(skill);
            const currentLevel = skillLevels[skill.id] || 0;
            const maxLevel = skill.maxLevel || 5;
            
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedSkill(skill)}
                className={cn(
                  "relative p-4 rounded-xl border-2 cursor-pointer transition-all",
                  status === 'owned' && "border-emerald-500/50 bg-emerald-500/10",
                  status === 'available' && "border-amber-500/50 bg-amber-500/10 hover:border-amber-400",
                  status === 'locked' && "border-slate-700 bg-slate-800/50 opacity-60",
                  RARITY_COLORS[skill.rarity]
                )}
              >
                {/* Tier Badge */}
                <div className="absolute top-2 right-2">
                  <span className={cn(
                    "text-xs font-mono px-2 py-0.5 rounded",
                    `bg-${categoryColor}-500/20 text-${categoryColor}-400`
                  )}>
                    Tier {skill.tier || 1}
                  </span>
                </div>

                {/* Icon & Status */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    status === 'locked' ? "bg-slate-700" : `bg-gradient-to-br ${CATEGORY_CONFIG[selectedCategory].gradient}`
                  )}>
                    {status === 'locked' ? (
                      <Lock className="w-5 h-5 text-slate-500" />
                    ) : (
                      <CategoryIcon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{skill.name}</h3>
                    <p className="text-xs text-slate-400">{skill.rarity || 'Comum'}</p>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Nível</span>
                    <span className={cn(
                      status === 'owned' ? "text-emerald-400" : "text-slate-500"
                    )}>
                      {status === 'owned' ? currentLevel : 0}/{maxLevel}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(maxLevel)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-2 flex-1 rounded-full",
                          i < currentLevel 
                            ? `bg-gradient-to-r ${CATEGORY_CONFIG[selectedCategory].gradient}` 
                            : "bg-slate-700"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Quick Action */}
                {status === 'available' && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLearnSkill(skill);
                    }}
                    className={cn(
                      "w-full mt-3 bg-gradient-to-r",
                      CATEGORY_CONFIG[selectedCategory].gradient
                    )}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Aprender
                  </Button>
                )}
                {status === 'owned' && canUpgradeSkill(skill) && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpgradeSkill(skill);
                    }}
                    className="w-full mt-3 bg-gradient-to-r from-amber-500 to-orange-600"
                  >
                    <Star className="w-4 h-4 mr-1" /> Aprimorar
                  </Button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedSkill(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "w-full max-w-lg rounded-2xl border-2 p-6 bg-slate-900",
                RARITY_COLORS[selectedSkill.rarity]
              )}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={cn(
                  "w-16 h-16 rounded-xl flex items-center justify-center",
                  `bg-gradient-to-br ${CATEGORY_CONFIG[selectedSkill.category]?.gradient || 'from-cyan-500 to-blue-600'}`
                )}>
                  {React.createElement(CATEGORY_CONFIG[selectedSkill.category]?.icon || Map, {
                    className: "w-8 h-8 text-white"
                  })}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{selectedSkill.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={RARITY_COLORS[selectedSkill.rarity]}>
                      {selectedSkill.rarity || 'Comum'}
                    </Badge>
                    <span className="text-sm text-slate-400">
                      {selectedSkill.category} • Tier {selectedSkill.tier || 1}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-slate-300 mb-6">
                {selectedSkill.description || "Habilidade da Frota Estelar."}
              </p>

              {/* Bonuses Per Level */}
              {selectedSkill.bonusesPerLevel && Object.keys(selectedSkill.bonusesPerLevel).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Bônus por Nível:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedSkill.bonusesPerLevel).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400 capitalize">{key}:</span>
                        <span className="text-emerald-400">+{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              <div className="mb-6 p-4 rounded-xl bg-slate-800/50">
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Requisitos:</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      (cadet?.level || 1) >= (selectedSkill.requiredLevel || 1) ? "text-emerald-400" : "text-red-400"
                    )}>
                      {(cadet?.level || 1) >= (selectedSkill.requiredLevel || 1) ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </span>
                    <span className="text-slate-300">Nível {selectedSkill.requiredLevel || 1}</span>
                  </div>
                  {selectedSkill.requiredSkillIds?.map(reqId => {
                    const reqSkill = skills.find(s => s.id === reqId);
                    const hasIt = ownedSkillIds.includes(reqId);
                    return (
                      <div key={reqId} className="flex items-center gap-2">
                        <span className={hasIt ? "text-emerald-400" : "text-red-400"}>
                          {hasIt ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </span>
                        <span className="text-slate-300">
                          {reqSkill?.name || reqId}
                          {selectedSkill.requiredSkillLevels?.[reqId] && ` Nv. ${selectedSkill.requiredSkillLevels[reqId]}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSkill(null)}
                  className="flex-1 border-slate-600"
                >
                  Fechar
                </Button>
                {canLearnSkill(selectedSkill) && (
                  <Button
                    onClick={() => {
                      onLearnSkill(selectedSkill);
                      setSelectedSkill(null);
                    }}
                    className={cn(
                      "flex-1 bg-gradient-to-r",
                      CATEGORY_CONFIG[selectedSkill.category]?.gradient || "from-cyan-500 to-blue-600"
                    )}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Aprender (1 Ponto)
                  </Button>
                )}
                {canUpgradeSkill(selectedSkill) && (
                  <Button
                    onClick={() => {
                      onUpgradeSkill(selectedSkill);
                      setSelectedSkill(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
                  >
                    <Star className="w-4 h-4 mr-2" /> Aprimorar (1 Ponto)
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
