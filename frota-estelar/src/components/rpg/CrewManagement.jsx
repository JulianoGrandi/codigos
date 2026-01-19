import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Heart, Zap, Star, Shield, Rocket, Radio,
  Stethoscope, Settings, Plus, ChevronRight, Award,
  AlertTriangle, Sparkles, Loader2, X
} from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { base44 } from '../../api/base44Client';
import { cn } from "../../lib/utils";
import LCARSPanel from './LCARSPanel';

const STATIONS = [
  { id: 'helm', name: 'Pilotagem', icon: Rocket, color: 'cyan', skill: 'piloting' },
  { id: 'tactical', name: 'Tático', icon: Shield, color: 'red', skill: 'tactical' },
  { id: 'engineering', name: 'Engenharia', icon: Settings, color: 'orange', skill: 'engineering' },
  { id: 'science', name: 'Ciência', icon: Radio, color: 'blue', skill: 'science' },
  { id: 'medical', name: 'Médico', icon: Stethoscope, color: 'green', skill: 'medical' }
];

const SPECIALIZATION_CONFIG = {
  'Pilotagem': { icon: Rocket, color: 'cyan' },
  'Tático': { icon: Shield, color: 'red' },
  'Engenharia': { icon: Settings, color: 'orange' },
  'Ciência': { icon: Radio, color: 'blue' },
  'Médico': { icon: Stethoscope, color: 'green' },
  'Segurança': { icon: Shield, color: 'purple' },
  'Operações': { icon: Zap, color: 'amber' }
};

function CrewCard({ member, onSelect, onAssign, isSelected }) {
  const specConfig = SPECIALIZATION_CONFIG[member.specialization] || SPECIALIZATION_CONFIG['Operações'];
  const Icon = specConfig.icon;
  
  const moraleColor = member.morale > 70 ? 'emerald' : member.morale > 40 ? 'amber' : 'red';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onSelect}
      className={cn(
        "p-4 rounded-xl border-2 cursor-pointer transition-all",
        isSelected
          ? "border-cyan-400 bg-cyan-500/10"
          : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          `bg-${specConfig.color}-500/20`
        )}>
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} className="w-full h-full rounded-xl object-cover" />
          ) : (
            <Icon className={cn("w-6 h-6", `text-${specConfig.color}-400`)} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white truncate">{member.name}</h4>
            <Badge className="text-xs bg-slate-700">{member.rank || 'Tripulante'}</Badge>
          </div>
          
          <p className="text-xs text-slate-400">{member.species} • {member.specialization}</p>
          
          {/* Stats */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <Heart className={cn("w-3 h-3", `text-${moraleColor}-400`)} />
              <span className="text-xs text-slate-400">Moral: {member.morale}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400" />
              <span className="text-xs text-slate-400">Nv. {member.level}</span>
            </div>
          </div>
          
          {/* Assigned Station */}
          {member.assignedStation && (
            <Badge className="mt-2 bg-emerald-500/20 text-emerald-400">
              📍 {STATIONS.find(s => s.id === member.assignedStation)?.name || member.assignedStation}
            </Badge>
          )}
          
          {/* Status */}
          {member.status !== 'Ativo' && (
            <Badge className={cn(
              "mt-2",
              member.status === 'Ferido' && "bg-red-500/20 text-red-400",
              member.status === 'Descansando' && "bg-amber-500/20 text-amber-400"
            )}>
              {member.status}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CrewDetail({ member, stations, onClose, onAssignStation, onDismiss }) {
  const specConfig = SPECIALIZATION_CONFIG[member.specialization] || SPECIALIZATION_CONFIG['Operações'];
  const Icon = specConfig.icon;
  
  const xpForNextLevel = member.level * 100;
  const xpProgress = ((member.xp || 0) / xpForNextLevel) * 100;
  
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
        className="w-full max-w-lg rounded-2xl border-2 border-cyan-500/30 bg-slate-900 overflow-hidden"
      >
        {/* Header */}
        <div className={cn("p-6", `bg-${specConfig.color}-500/10`)}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center",
                `bg-${specConfig.color}-500/20`
              )}>
                <Icon className={cn("w-8 h-8", `text-${specConfig.color}-400`)} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{member.name}</h2>
                <p className="text-sm text-slate-400">{member.species} • {member.rank}</p>
                <Badge className={cn("mt-1", `bg-${specConfig.color}-500/20 text-${specConfig.color}-400`)}>
                  {member.specialization}
                </Badge>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Level & XP */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Nível {member.level}</span>
              <span className="text-xs text-slate-500">{member.xp || 0}/{xpForNextLevel} XP</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-400">Moral</span>
              </div>
              <p className="text-2xl font-bold text-white">{member.morale}%</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-slate-400">Fadiga</span>
              </div>
              <p className="text-2xl font-bold text-white">{member.fatigue || 0}%</p>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h4 className="text-sm font-semibold text-slate-400 mb-3">Habilidades</h4>
            <div className="space-y-2">
              {Object.entries(member.skills || {}).map(([skill, level]) => {
                const station = STATIONS.find(s => s.skill === skill);
                if (!station) return null;
                const StationIcon = station.icon;
                
                return (
                  <div key={skill} className="flex items-center gap-3">
                    <StationIcon className={cn("w-4 h-4", `text-${station.color}-400`)} />
                    <span className="text-sm text-white flex-1 capitalize">{station.name}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-3 h-3 rounded-sm",
                            i < level ? `bg-${station.color}-400` : "bg-slate-700"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assign Station */}
          <div>
            <h4 className="text-sm font-semibold text-slate-400 mb-3">Atribuir a Posto</h4>
            <div className="grid grid-cols-3 gap-2">
              {stations.map(station => {
                const StationIcon = station.icon;
                const isAssigned = member.assignedStation === station.id;
                
                return (
                  <button
                    key={station.id}
                    onClick={() => onAssignStation(member.id, station.id)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                      isAssigned
                        ? `border-${station.color}-400 bg-${station.color}-500/20`
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    )}
                  >
                    <StationIcon className={cn("w-5 h-5", `text-${station.color}-400`)} />
                    <span className="text-xs text-white">{station.name}</span>
                  </button>
                );
              })}
              <button
                onClick={() => onAssignStation(member.id, null)}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                  !member.assignedStation
                    ? "border-slate-400 bg-slate-500/20"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                )}
              >
                <X className="w-5 h-5 text-slate-400" />
                <span className="text-xs text-slate-400">Nenhum</span>
              </button>
            </div>
          </div>

          {/* Personality & Backstory */}
          {member.personality && (
            <div className="p-3 rounded-lg bg-slate-800/50">
              <p className="text-sm text-slate-300 italic">"{member.personality}"</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CrewManagement({ 
  crew = [], 
  ship,
  onUpdateCrew,
  onRecruitCrew,
  onAssignStation 
}) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [isRecruiting, setIsRecruiting] = useState(false);

  const handleRecruit = async () => {
    setIsRecruiting(true);
    
    try {
      const prompt = `Gere um tripulante único para uma nave da Frota Estelar.

Retorne um JSON:
{
  "name": "nome completo",
  "species": "espécie (Humano, Vulcano, Andoriano, Betazoide, Trill, etc)",
  "specialization": "Pilotagem" | "Tático" | "Engenharia" | "Ciência" | "Médico" | "Segurança" | "Operações",
  "rank": "Tripulante" | "Suboficial" | "Tenente" | "Tenente Comandante",
  "personality": "breve descrição da personalidade",
  "backstory": "breve história de fundo",
  "traits": ["traço positivo", "traço negativo"],
  "skills": {
    "piloting": numero 1-3,
    "tactical": numero 1-3,
    "engineering": numero 1-3,
    "science": numero 1-3,
    "medical": numero 1-3
  }
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            species: { type: "string" },
            specialization: { type: "string" },
            rank: { type: "string" },
            personality: { type: "string" },
            backstory: { type: "string" },
            traits: { type: "array", items: { type: "string" } },
            skills: { type: "object" }
          }
        }
      });

      if (result && onRecruitCrew) {
        await onRecruitCrew({
          ...result,
          level: 1,
          xp: 0,
          morale: 80 + Math.floor(Math.random() * 20),
          health: 100,
          fatigue: 0,
          loyalty: 50,
          status: 'Ativo'
        });
      }
    } catch (error) {
      console.error('Error recruiting crew:', error);
    }

    setIsRecruiting(false);
  };

  const handleAssignStation = async (memberId, stationId) => {
    // Remove from other stations first
    const member = crew.find(c => c.id === memberId);
    if (member && onAssignStation) {
      await onAssignStation(memberId, stationId);
    }
    setSelectedMember(null);
  };

  // Group by station assignment
  const assignedCrew = crew.filter(c => c.assignedStation);
  const unassignedCrew = crew.filter(c => !c.assignedStation);

  return (
    <LCARSPanel title="Tripulação" color="cyan">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-medium">{crew.length} tripulantes</span>
          </div>
          <Button
            size="sm"
            onClick={handleRecruit}
            disabled={isRecruiting}
            className="bg-gradient-to-r from-cyan-500 to-blue-600"
          >
            {isRecruiting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Recrutar
          </Button>
        </div>

        {/* Station Overview */}
        <div className="grid grid-cols-5 gap-2">
          {STATIONS.map(station => {
            const assignedMember = crew.find(c => c.assignedStation === station.id);
            const StationIcon = station.icon;
            
            return (
              <div
                key={station.id}
                className={cn(
                  "p-3 rounded-xl border-2 text-center transition-all",
                  assignedMember
                    ? `border-${station.color}-500/50 bg-${station.color}-500/10`
                    : "border-slate-700 bg-slate-800/50 border-dashed"
                )}
              >
                <StationIcon className={cn(
                  "w-6 h-6 mx-auto mb-1",
                  assignedMember ? `text-${station.color}-400` : "text-slate-600"
                )} />
                <p className="text-xs text-slate-400">{station.name}</p>
                {assignedMember && (
                  <p className="text-xs text-white mt-1 truncate">{assignedMember.name.split(' ')[0]}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Crew List */}
        {crew.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Sem tripulação</h3>
            <p className="text-slate-400 text-sm mb-4">
              Recrute tripulantes para sua nave.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {crew.map(member => (
              <CrewCard
                key={member.id}
                member={member}
                onSelect={() => setSelectedMember(member)}
                isSelected={selectedMember?.id === member.id}
              />
            ))}
          </div>
        )}

        {/* Crew Detail Modal */}
        <AnimatePresence>
          {selectedMember && (
            <CrewDetail
              member={selectedMember}
              stations={STATIONS}
              onClose={() => setSelectedMember(null)}
              onAssignStation={handleAssignStation}
            />
          )}
        </AnimatePresence>
      </div>
    </LCARSPanel>
  );
}
