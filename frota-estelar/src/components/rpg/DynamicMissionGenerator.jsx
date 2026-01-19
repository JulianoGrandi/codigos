import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Sparkles, Loader2, Target, Star, Zap, Award, 
  Users, MapPin, Clock, AlertTriangle, ChevronRight,
  RefreshCw, Shield, Swords, FlaskConical, MessageSquare
} from 'lucide-react';
import { base44 } from '../../api/base44Client';
import { cn } from "../../lib/utils";

const MISSION_TYPE_ICONS = {
  "Exploração": Target,
  "Combate": Swords,
  "Diplomacia": MessageSquare,
  "Pesquisa": FlaskConical,
  "Resgate": Users,
  "Defesa": Shield
};

const DIFFICULTY_COLORS = {
  "Iniciante": "bg-green-500/20 text-green-400 border-green-500/30",
  "Fácil": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Médio": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Difícil": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Elite": "bg-red-500/20 text-red-400 border-red-500/30"
};

export default function DynamicMissionGenerator({ 
  cadet, 
  completedMissions = [],
  onMissionGenerated,
  onStartMission 
}) {
  const [generatedMission, setGeneratedMission] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [missionType, setMissionType] = useState(null);

  const missionTypes = ["Exploração", "Combate", "Diplomacia", "Pesquisa", "Resgate", "Defesa"];

  const generateMission = async (type) => {
    setIsGenerating(true);
    setMissionType(type);
    setGeneratedMission(null);

    try {
      const cadetSkills = cadet?.skillIds?.length || 0;
      const cadetLevel = cadet?.level || 1;
      const division = cadet?.division || "Comando";
      const species = cadet?.species || "Humano";
      const completedCount = completedMissions.length;

      // Determine difficulty based on cadet progress
      let difficulty = "Iniciante";
      if (cadetLevel >= 3) difficulty = "Fácil";
      if (cadetLevel >= 5) difficulty = "Médio";
      if (cadetLevel >= 8) difficulty = "Difícil";
      if (cadetLevel >= 12) difficulty = "Elite";

      const prompt = `Você é um mestre de RPG de Star Trek criando uma missão dinâmica para um cadete.

CADETE:
- Nome: ${cadet?.name || "Cadete"}
- Espécie: ${species}
- Divisão: ${division}
- Nível: ${cadetLevel}
- Habilidades: ${cadetSkills}
- Missões Completas: ${completedCount}

TIPO DE MISSÃO: ${type}
DIFICULDADE SUGERIDA: ${difficulty}

Crie uma missão ÚNICA e ENVOLVENTE com os seguintes elementos:

1. TÍTULO: Criativo e memorável
2. DESCRIÇÃO: Situação atual e urgência
3. BRIEFING: Contexto detalhado da missão
4. LOCALIZAÇÃO: Nome do planeta/estação/nave
5. NPCS: 2-3 personagens com personalidades, falhas e pontos fortes
6. OBJETIVOS: 3-4 objetivos (1 opcional com bônus)
7. RECOMPENSAS: XP, créditos, possível equipamento/condecoração

A missão deve:
- Ter escolhas morais interessantes
- Considerar as habilidades do cadete
- Incluir momentos de tensão
- Ter múltiplos caminhos para sucesso

Retorne um JSON:
{
  "title": "string",
  "description": "string",
  "briefing": "string detalhado",
  "type": "${type}",
  "difficulty": "${difficulty}",
  "locationName": "string",
  "estimatedDuration": "20min",
  "priority": "Normal" | "Urgente" | "Crítica",
  "npcs": [
    {
      "name": "string",
      "role": "string",
      "species": "string",
      "personality": "string",
      "strength": "string",
      "flaw": "string",
      "hiddenAgenda": "string ou null"
    }
  ],
  "objectives": [
    {
      "id": "obj_1",
      "description": "string",
      "optional": false,
      "bonusXp": 0,
      "relatedAttribute": "string ou null"
    }
  ],
  "rewards": {
    "xp": number (80-200),
    "skillPoints": number (1-3),
    "credits": number (50-200),
    "possibleEquipment": "string ou null",
    "possibleDecoration": "string ou null"
  },
  "narrative": [
    {
      "text": "descrição da cena",
      "choices": [
        {
          "text": "opção de escolha",
          "requiredAttribute": "string ou null",
          "requiredValue": number ou null,
          "nextStep": number,
          "xpBonus": number,
          "consequence": "string"
        }
      ]
    }
  ],
  "dynamicElements": {
    "weatherCondition": "string ou null",
    "timeOfDay": "string",
    "complication": "string - algo que pode dar errado",
    "opportunityBonus": "string - oportunidade extra baseada nas habilidades do cadete"
  }
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            briefing: { type: "string" },
            type: { type: "string" },
            difficulty: { type: "string" },
            locationName: { type: "string" },
            estimatedDuration: { type: "string" },
            priority: { type: "string" },
            npcs: { type: "array", items: { type: "object" } },
            objectives: { type: "array", items: { type: "object" } },
            rewards: { type: "object" },
            narrative: { type: "array", items: { type: "object" } },
            dynamicElements: { type: "object" }
          }
        }
      });

      if (result) {
        setGeneratedMission(result);
        if (onMissionGenerated) {
          onMissionGenerated(result);
        }
      }
    } catch (error) {
      console.error('Error generating mission:', error);
    }

    setIsGenerating(false);
  };

  const TypeIcon = missionType ? MISSION_TYPE_ICONS[missionType] : Target;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Sparkles className="w-10 h-10 mx-auto mb-2 text-cyan-400" />
        <h2 className="text-xl font-bold text-white mb-2">Gerador de Missões</h2>
        <p className="text-sm text-slate-400">
          A IA irá criar uma missão única baseada no seu progresso
        </p>
      </div>

      {/* Mission Type Selection */}
      {!isGenerating && !generatedMission && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {missionTypes.map(type => {
            const Icon = MISSION_TYPE_ICONS[type];
            return (
              <Button
                key={type}
                variant="outline"
                onClick={() => generateMission(type)}
                className="h-auto py-4 flex flex-col gap-2 border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/10"
              >
                <Icon className="w-6 h-6 text-cyan-400" />
                <span>{type}</span>
              </Button>
            );
          })}
        </div>
      )}

      {/* Generating State */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="inline-flex flex-col items-center gap-4 px-8 py-6 rounded-2xl bg-slate-800/50 border border-cyan-500/30">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin" />
              <TypeIcon className="absolute inset-0 m-auto w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-white font-medium">Gerando missão de {missionType}...</p>
              <p className="text-sm text-slate-400 mt-1">
                A IA está criando desafios únicos para você
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Generated Mission Preview */}
      <AnimatePresence>
        {generatedMission && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Mission Card */}
            <div className="rounded-2xl border-2 border-cyan-500/30 bg-slate-900/80 overflow-hidden">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-cyan-500/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <TypeIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{generatedMission.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={cn("border", DIFFICULTY_COLORS[generatedMission.difficulty])}>
                          {generatedMission.difficulty}
                        </Badge>
                        <span className="text-sm text-slate-400">{generatedMission.type}</span>
                      </div>
                    </div>
                  </div>
                  {generatedMission.priority !== 'Normal' && (
                    <Badge className={cn(
                      "animate-pulse",
                      generatedMission.priority === 'Crítica' 
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    )}>
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {generatedMission.priority}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <p className="text-slate-300">{generatedMission.description}</p>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-400">Local:</span>
                    <span className="text-white">{generatedMission.locationName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-400">Duração:</span>
                    <span className="text-white">{generatedMission.estimatedDuration}</span>
                  </div>
                </div>

                {/* NPCs */}
                {generatedMission.npcs?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Personagens Envolvidos
                    </h4>
                    <div className="grid gap-2">
                      {generatedMission.npcs.map((npc, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                            <span className="text-lg">{npc.name?.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{npc.name}</p>
                            <p className="text-xs text-slate-400">
                              {npc.species} • {npc.role}
                            </p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="text-emerald-400">+ {npc.strength}</p>
                            <p className="text-red-400">- {npc.flaw}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Objectives */}
                {generatedMission.objectives?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" /> Objetivos
                    </h4>
                    <div className="space-y-2">
                      {generatedMission.objectives.map((obj, i) => (
                        <div 
                          key={i}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg",
                            obj.optional ? "bg-amber-500/10 border border-amber-500/20" : "bg-slate-800/50"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                            obj.optional ? "bg-amber-500/20 text-amber-400" : "bg-cyan-500/20 text-cyan-400"
                          )}>
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-white">{obj.description}</p>
                            {obj.optional && (
                              <p className="text-xs text-amber-400 mt-1">
                                Opcional (+{obj.bonusXp} XP)
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Elements */}
                {generatedMission.dynamicElements && (
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <h4 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Elementos Dinâmicos
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {generatedMission.dynamicElements.weatherCondition && (
                        <div>
                          <span className="text-slate-400">Clima:</span>
                          <span className="text-white ml-2">{generatedMission.dynamicElements.weatherCondition}</span>
                        </div>
                      )}
                      {generatedMission.dynamicElements.timeOfDay && (
                        <div>
                          <span className="text-slate-400">Período:</span>
                          <span className="text-white ml-2">{generatedMission.dynamicElements.timeOfDay}</span>
                        </div>
                      )}
                      {generatedMission.dynamicElements.complication && (
                        <div className="col-span-2">
                          <span className="text-red-400">Complicação:</span>
                          <span className="text-slate-300 ml-2">{generatedMission.dynamicElements.complication}</span>
                        </div>
                      )}
                      {generatedMission.dynamicElements.opportunityBonus && (
                        <div className="col-span-2">
                          <span className="text-emerald-400">Oportunidade:</span>
                          <span className="text-slate-300 ml-2">{generatedMission.dynamicElements.opportunityBonus}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rewards */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Recompensas
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400 font-bold">+{generatedMission.rewards?.xp || 100} XP</span>
                    </div>
                    {generatedMission.rewards?.skillPoints > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-400 font-bold">+{generatedMission.rewards.skillPoints} Pts</span>
                      </div>
                    )}
                    {generatedMission.rewards?.credits > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10">
                        <Zap className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-bold">+{generatedMission.rewards.credits} ₡</span>
                      </div>
                    )}
                    {generatedMission.rewards?.possibleEquipment && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10">
                        <Shield className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400">{generatedMission.rewards.possibleEquipment}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setGeneratedMission(null);
                    setMissionType(null);
                  }}
                  className="flex-1 border-slate-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Nova Missão
                </Button>
                <Button
                  onClick={() => onStartMission(generatedMission)}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600"
                >
                  Iniciar Missão
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
