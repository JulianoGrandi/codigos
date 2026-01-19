import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Swords, MessageSquare, FlaskConical, Shield, Search,
  AlertTriangle, GraduationCap, Clock, Star, Zap, ChevronRight,
  Filter, MapPin, Target, Users, Lock, Sparkles, Award
} from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../../lib/utils";
import LCARSPanel from './LCARSPanel';

const MISSION_TYPE_CONFIG = {
  "Exploração": { icon: Compass, color: "cyan", gradient: "from-cyan-500 to-blue-600" },
  "Combate": { icon: Swords, color: "red", gradient: "from-red-500 to-rose-600" },
  "Diplomacia": { icon: MessageSquare, color: "green", gradient: "from-emerald-500 to-teal-600" },
  "Pesquisa": { icon: FlaskConical, color: "purple", gradient: "from-purple-500 to-indigo-600" },
  "Resgate": { icon: Users, color: "amber", gradient: "from-amber-500 to-orange-600" },
  "Defesa": { icon: Shield, color: "blue", gradient: "from-blue-500 to-indigo-600" },
  "Infiltração": { icon: Search, color: "slate", gradient: "from-slate-500 to-zinc-600" },
  "Treinamento": { icon: GraduationCap, color: "sky", gradient: "from-sky-500 to-cyan-600" }
};

const DIFFICULTY_CONFIG = {
  "Iniciante": { color: "text-green-400 bg-green-500/20 border-green-500/30", stars: 1 },
  "Fácil": { color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30", stars: 2 },
  "Médio": { color: "text-amber-400 bg-amber-500/20 border-amber-500/30", stars: 3 },
  "Difícil": { color: "text-orange-400 bg-orange-500/20 border-orange-500/30", stars: 4 },
  "Elite": { color: "text-red-400 bg-red-500/20 border-red-500/30", stars: 5 },
  "Kobayashi Maru": { color: "text-purple-400 bg-purple-500/20 border-purple-500/30 animate-pulse", stars: 5 }
};

const PRIORITY_CONFIG = {
  "Normal": { color: "bg-slate-500/20 text-slate-400", icon: null },
  "Urgente": { color: "bg-amber-500/20 text-amber-400", icon: Clock },
  "Crítica": { color: "bg-red-500/20 text-red-400 animate-pulse", icon: AlertTriangle }
};

export default function MissionBoard({ 
  missions = [], 
  cadet, 
  completedMissionIds = [],
  onSelectMission,
  onStartMission 
}) {
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    difficulty: 'all',
    status: 'available'
  });
  const [selectedMission, setSelectedMission] = useState(null);

  const filteredMissions = useMemo(() => {
    return missions.filter(mission => {
      // Search filter
      if (filters.search && !mission.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filters.type !== 'all' && mission.type !== filters.type) {
        return false;
      }
      
      // Difficulty filter
      if (filters.difficulty !== 'all' && mission.difficulty !== filters.difficulty) {
        return false;
      }
      
      // Status filter
      const isCompleted = completedMissionIds.includes(mission.id);
      const isLocked = (mission.requiredLevel || 1) > (cadet?.level || 1);
      
      if (filters.status === 'available' && (isCompleted || isLocked)) return false;
      if (filters.status === 'completed' && !isCompleted) return false;
      if (filters.status === 'locked' && !isLocked) return false;
      
      return true;
    });
  }, [missions, filters, completedMissionIds, cadet]);

  const getMissionStatus = (mission) => {
    if (completedMissionIds.includes(mission.id)) return 'completed';
    if ((mission.requiredLevel || 1) > (cadet?.level || 1)) return 'locked';
    return 'available';
  };

  const missionTypes = [...new Set(missions.map(m => m.type).filter(Boolean))];
  const difficulties = [...new Set(missions.map(m => m.difficulty).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Quadro de Missões
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {filteredMissions.length} missões encontradas
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-slate-900/50 border border-cyan-500/20">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar missões..."
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            className="bg-slate-800 border-slate-700"
          />
        </div>
        
        <Select
          value={filters.type}
          onValueChange={(value) => setFilters(f => ({ ...f, type: value }))}
        >
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            {missionTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.difficulty}
          onValueChange={(value) => setFilters(f => ({ ...f, difficulty: value }))}
        >
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
            <SelectValue placeholder="Dificuldade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {difficulties.map(diff => (
              <SelectItem key={diff} value={diff}>{diff}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(f => ({ ...f, status: value }))}
        >
          <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Disponíveis</SelectItem>
            <SelectItem value="completed">Completas</SelectItem>
            <SelectItem value="locked">Bloqueadas</SelectItem>
            <SelectItem value="all">Todas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mission Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredMissions.map((mission, index) => {
            const status = getMissionStatus(mission);
            const typeConfig = MISSION_TYPE_CONFIG[mission.type] || MISSION_TYPE_CONFIG["Exploração"];
            const diffConfig = DIFFICULTY_CONFIG[mission.difficulty] || DIFFICULTY_CONFIG["Médio"];
            const priorityConfig = PRIORITY_CONFIG[mission.priority] || PRIORITY_CONFIG["Normal"];
            const TypeIcon = typeConfig.icon;
            const PriorityIcon = priorityConfig.icon;

            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedMission(mission)}
                className={cn(
                  "relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all",
                  status === 'completed' && "border-emerald-500/30 bg-emerald-500/5",
                  status === 'available' && "border-cyan-500/30 bg-slate-900/80 hover:border-cyan-400/50",
                  status === 'locked' && "border-slate-700 bg-slate-900/50 opacity-60"
                )}
              >
                {/* Priority Banner */}
                {mission.priority && mission.priority !== 'Normal' && (
                  <div className={cn(
                    "absolute top-0 left-0 right-0 py-1 px-4 text-xs font-bold text-center",
                    priorityConfig.color
                  )}>
                    {PriorityIcon && <PriorityIcon className="w-3 h-3 inline mr-1" />}
                    MISSÃO {mission.priority.toUpperCase()}
                  </div>
                )}

                <div className={cn("p-5 space-y-4", mission.priority && mission.priority !== 'Normal' && "pt-8")}>
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                      status === 'locked' 
                        ? "bg-slate-800" 
                        : `bg-gradient-to-br ${typeConfig.gradient}`
                    )}>
                      {status === 'locked' ? (
                        <Lock className="w-6 h-6 text-slate-500" />
                      ) : status === 'completed' ? (
                        <Award className="w-6 h-6 text-white" />
                      ) : (
                        <TypeIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{mission.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{mission.type}</span>
                        <span className="text-slate-600">•</span>
                        <Badge className={cn("text-xs border", diffConfig.color)}>
                          {[...Array(diffConfig.stars)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-current" />
                          ))}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {mission.description}
                  </p>

                  {/* Mission Info */}
                  <div className="flex flex-wrap gap-3 text-xs">
                    {mission.locationName && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {mission.locationName}
                      </div>
                    )}
                    {mission.estimatedDuration && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {mission.estimatedDuration}
                      </div>
                    )}
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center gap-4 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-amber-400">
                        +{mission.rewards?.xp || mission.xpReward || 50} XP
                      </span>
                    </div>
                    {(mission.rewards?.skillPoints || mission.rewards?.skillId || mission.skillReward) && (
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-cyan-400">
                          {mission.rewards?.skillPoints ? `+${mission.rewards.skillPoints} Pts` : (mission.skillReward || 'Habilidade')}
                        </span>
                      </div>
                    )}
                    {(mission.rewards?.credits) && (
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">
                          +{mission.rewards.credits} ₡
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  {status === 'completed' && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        Completa
                      </Badge>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredMissions.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Nenhuma missão encontrada
          </h3>
          <p className="text-slate-400">
            Tente ajustar os filtros de busca.
          </p>
        </div>
      )}

      {/* Mission Detail Modal */}
      <AnimatePresence>
        {selectedMission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedMission(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-cyan-500/30 bg-slate-900"
            >
              {/* Mission Header */}
              {selectedMission.locationImage && (
                <div className="h-48 relative">
                  <img 
                    src={selectedMission.locationImage} 
                    alt={selectedMission.locationName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                </div>
              )}

              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedMission.title}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className={cn(
                          "border",
                          DIFFICULTY_CONFIG[selectedMission.difficulty]?.color
                        )}>
                          {selectedMission.difficulty}
                        </Badge>
                        <span className="text-sm text-slate-400">{selectedMission.type}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMission(null)}
                      className="text-slate-400 hover:text-white text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Briefing */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-cyan-500/20">
                  <h3 className="text-sm font-semibold text-cyan-400 mb-2">BRIEFING DA MISSÃO</h3>
                  <p className="text-slate-300">
                    {selectedMission.briefing || selectedMission.description}
                  </p>
                </div>

                {/* Objectives */}
                {selectedMission.objectives?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-3">Objetivos:</h3>
                    <div className="space-y-2">
                      {selectedMission.objectives.map((obj, i) => (
                        <div 
                          key={obj.id || i}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg",
                            obj.optional ? "bg-amber-500/10" : "bg-slate-800/50"
                          )}
                        >
                          <Target className={cn(
                            "w-5 h-5 mt-0.5",
                            obj.optional ? "text-amber-400" : "text-cyan-400"
                          )} />
                          <div>
                            <p className="text-white">{obj.description}</p>
                            {obj.optional && (
                              <span className="text-xs text-amber-400">Opcional (+{obj.bonusXp} XP)</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                <div className="p-4 rounded-xl bg-slate-800/50">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">Requisitos:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-slate-500">Nível Mínimo</span>
                      <p className={cn(
                        "font-bold",
                        (cadet?.level || 1) >= (selectedMission.requiredLevel || 1) 
                          ? "text-emerald-400" 
                          : "text-red-400"
                      )}>
                        Nível {selectedMission.requiredLevel || 1}
                      </p>
                    </div>
                    {selectedMission.requiredDivision && (
                      <div>
                        <span className="text-xs text-slate-500">Divisão Recomendada</span>
                        <p className="font-bold text-white">{selectedMission.requiredDivision}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rewards */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">Recompensas:</h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10">
                      <Star className="w-5 h-5 text-amber-400" />
                      <span className="font-bold text-amber-400">
                        +{selectedMission.rewards?.xp || selectedMission.xpReward || 50} XP
                      </span>
                    </div>
                    {selectedMission.rewards?.skillPoints && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        <span className="font-bold text-cyan-400">
                          +{selectedMission.rewards.skillPoints} Pontos de Habilidade
                        </span>
                      </div>
                    )}
                    {selectedMission.rewards?.credits && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10">
                        <Zap className="w-5 h-5 text-green-400" />
                        <span className="font-bold text-green-400">
                          +{selectedMission.rewards.credits} Créditos
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMission(null)}
                    className="flex-1 border-slate-600"
                  >
                    Fechar
                  </Button>
                  {getMissionStatus(selectedMission) === 'available' && (
                    <Button
                      onClick={() => {
                        onStartMission(selectedMission);
                        setSelectedMission(null);
                      }}
                      className={cn(
                        "flex-1 bg-gradient-to-r",
                        MISSION_TYPE_CONFIG[selectedMission.type]?.gradient || "from-cyan-500 to-blue-600"
                      )}
                    >
                      Iniciar Missão <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                  {getMissionStatus(selectedMission) === 'locked' && (
                    <Button disabled className="flex-1 bg-slate-700">
                      <Lock className="w-4 h-4 mr-2" /> Requer Nível {selectedMission.requiredLevel}
                    </Button>
                  )}
                  {getMissionStatus(selectedMission) === 'completed' && !selectedMission.isRepeatable && (
                    <Button disabled className="flex-1 bg-emerald-600/50">
                      <Award className="w-4 h-4 mr-2" /> Missão Completa
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
