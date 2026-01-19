import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "../../lib/utils";
import { 
  Swords, Microscope, Wrench, MessageSquare, 
  Shield, Heart, Plane, Mountain, Lock, Check
} from 'lucide-react';

const CATEGORY_CONFIG = {
  Combate: { icon: Swords, color: "red", gradient: "from-red-500/20 to-red-600/20", border: "border-red-400/30", text: "text-red-400" },
  Ciência: { icon: Microscope, color: "blue", gradient: "from-blue-500/20 to-blue-600/20", border: "border-blue-400/30", text: "text-blue-400" },
  Engenharia: { icon: Wrench, color: "orange", gradient: "from-orange-500/20 to-orange-600/20", border: "border-orange-400/30", text: "text-orange-400" },
  Diplomacia: { icon: MessageSquare, color: "purple", gradient: "from-purple-500/20 to-purple-600/20", border: "border-purple-400/30", text: "text-purple-400" },
  Comando: { icon: Shield, color: "amber", gradient: "from-amber-500/20 to-amber-600/20", border: "border-amber-400/30", text: "text-amber-400" },
  Medicina: { icon: Heart, color: "green", gradient: "from-green-500/20 to-green-600/20", border: "border-green-400/30", text: "text-green-400" },
  Pilotagem: { icon: Plane, color: "cyan", gradient: "from-cyan-500/20 to-cyan-600/20", border: "border-cyan-400/30", text: "text-cyan-400" },
  Sobrevivência: { icon: Mountain, color: "emerald", gradient: "from-emerald-500/20 to-emerald-600/20", border: "border-emerald-400/30", text: "text-emerald-400" }
};

const RARITY_CONFIG = {
  Comum: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-400/30" },
  Incomum: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-400/30" },
  Raro: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-400/30" },
  Épico: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-400/30" },
  Lendário: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-400/30" }
};

const BONUS_LABELS = {
  logic: "Lógica",
  charisma: "Carisma",
  strength: "Força",
  agility: "Agilidade",
  intelligence: "Inteligência",
  phaserDamage: "Dano Phaser",
  shieldBoost: "Escudos",
  healingBoost: "Cura",
  diplomacyBonus: "Diplomacia",
  pilotingBonus: "Pilotagem",
  xpBonus: "XP Bônus"
};

export default function SkillCard({ skill, owned = false, locked = false, compact = false }) {
  const config = CATEGORY_CONFIG[skill.category] || CATEGORY_CONFIG.Combate;
  const rarityConfig = RARITY_CONFIG[skill.rarity] || RARITY_CONFIG.Comum;
  const Icon = config.icon;

  const bonusEntries = Object.entries(skill.bonuses || {}).filter(([_, v]) => v && v !== 0);

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-lg border",
        owned ? "bg-slate-800/50" : "bg-slate-900/50 opacity-60",
        config.border
      )}>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", `bg-gradient-to-br ${config.gradient}`)}>
          <Icon className={cn("w-4 h-4", config.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{skill.name}</p>
          <div className="flex gap-1 flex-wrap">
            {bonusEntries.slice(0, 2).map(([key, val]) => (
              <span key={key} className="text-xs text-green-400">
                +{val} {BONUS_LABELS[key]?.slice(0, 3)}
              </span>
            ))}
          </div>
        </div>
        {owned && <Check className="w-4 h-4 text-green-400" />}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 transition-all",
        locked ? "opacity-50" : "",
        owned ? "ring-2 ring-green-400/50" : "",
        config.border,
        "bg-slate-900/80"
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none", config.gradient)} />
      
      <div className="relative space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              `bg-gradient-to-br ${config.gradient}`,
              "border",
              config.border
            )}>
              {locked ? (
                <Lock className="w-6 h-6 text-slate-500" />
              ) : (
                <Icon className={cn("w-6 h-6", config.text)} />
              )}
            </div>
            <div>
              <h3 className="font-bold text-white">{skill.name}</h3>
              <p className="text-xs text-slate-400">{skill.category}</p>
            </div>
          </div>
          <span className={cn("px-2 py-0.5 rounded-full text-xs border", rarityConfig.bg, rarityConfig.text, rarityConfig.border)}>
            {skill.rarity}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400">{skill.description}</p>

        {/* Bonuses */}
        {bonusEntries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {bonusEntries.map(([key, val]) => (
              <span key={key} className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                +{val}{key.includes('Bonus') || key.includes('Damage') || key.includes('Boost') ? '%' : ''} {BONUS_LABELS[key]}
              </span>
            ))}
          </div>
        )}

        {/* Requirements */}
        {skill.requiredLevel > 1 && (
          <p className="text-xs text-slate-500">Requer Nível {skill.requiredLevel}</p>
        )}

        {/* Owned Badge */}
        {owned && (
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <Check className="w-4 h-4" />
            <span>Adquirida</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
