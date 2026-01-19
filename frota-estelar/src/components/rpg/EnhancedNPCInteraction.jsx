import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MessageCircle, Heart, Star, Sparkles, Loader2,
  ChevronRight, Award, Target, AlertTriangle, Users
} from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { base44 } from '../../api/base44Client';
import { cn } from "../../lib/utils";

const RELATIONSHIP_STATUS = {
  'hostil': { color: 'red', label: 'Hostil', min: -100, max: -50 },
  'desconfiado': { color: 'orange', label: 'Desconfiado', min: -49, max: -20 },
  'neutro': { color: 'slate', label: 'Neutro', min: -19, max: 19 },
  'amigável': { color: 'cyan', label: 'Amigável', min: 20, max: 49 },
  'aliado': { color: 'emerald', label: 'Aliado', min: 50, max: 79 },
  'melhor_amigo': { color: 'amber', label: 'Melhor Amigo', min: 80, max: 100 }
};

export default function EnhancedNPCInteraction({ 
  npc, 
  relationship, 
  cadet, 
  onClose, 
  onUpdateRelationship,
  onStartMission,
  onReceiveAdvice
}) {
  const [dialogueHistory, setDialogueHistory] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [availableQuest, setAvailableQuest] = useState(null);

  const relationshipLevel = relationship?.level || 0;
  const relationshipStatus = Object.entries(RELATIONSHIP_STATUS).find(
    ([_, config]) => relationshipLevel >= config.min && relationshipLevel <= config.max
  )?.[0] || 'neutro';
  const statusConfig = RELATIONSHIP_STATUS[relationshipStatus];

  // Generate initial dialogue on mount
  useEffect(() => {
    generateInitialDialogue();
  }, [npc.id]);

  const generateInitialDialogue = async () => {
    setIsLoading(true);
    
    try {
      const prompt = `Você é ${npc.name}, ${npc.title || 'um membro da tripulação'} na Academia da Frota Estelar.
Espécie: ${npc.species || 'Humano'}
Personalidade: ${npc.personality || 'Profissional e dedicado'}
Tipo: ${npc.type === 'instrutor' ? 'Instrutor' : npc.type === 'colega' ? 'Colega cadete' : 'Amigo'}

O cadete ${cadet.name} (${cadet.species}, Divisão ${cadet.division}, Nível ${cadet.level}) está iniciando uma conversa.
Nível de relacionamento: ${relationshipLevel} (${statusConfig.label})

${cadet.completedMissions?.length > 0 ? `O cadete já completou ${cadet.completedMissions.length} missões.` : 'O cadete ainda não completou missões.'}

Gere uma saudação apropriada baseada no relacionamento e 3-4 opções de resposta para o cadete.
A saudação deve refletir a personalidade do NPC e o nível de relacionamento.

Retorne um JSON:
{
  "greeting": "saudação do NPC",
  "emotion": "neutral" | "happy" | "concerned" | "impressed" | "disappointed",
  "options": [
    {
      "text": "opção de diálogo",
      "type": "friendly" | "professional" | "curious" | "flirty" | "aggressive",
      "requiredRelationship": numero mínimo de relacionamento ou null,
      "effect": "descrição do efeito da escolha"
    }
  ],
  "hasQuest": boolean (se o NPC tem uma missão para oferecer),
  "questHint": "dica sobre a missão se hasQuest for true" | null
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            greeting: { type: "string" },
            emotion: { type: "string" },
            options: { type: "array", items: { type: "object" } },
            hasQuest: { type: "boolean" },
            questHint: { type: "string" }
          }
        }
      });

      if (result) {
        setDialogueHistory([{
          speaker: 'npc',
          text: result.greeting,
          emotion: result.emotion
        }]);
        setCurrentOptions(result.options || []);
        
        if (result.hasQuest && result.questHint) {
          setAvailableQuest(result.questHint);
        }
      }
    } catch (error) {
      console.error('Error generating dialogue:', error);
      setDialogueHistory([{
        speaker: 'npc',
        text: `Olá, ${cadet.name}. Como posso ajudá-lo hoje?`,
        emotion: 'neutral'
      }]);
      setCurrentOptions([
        { text: "Preciso de conselhos sobre minha carreira.", type: "professional" },
        { text: "Como você está?", type: "friendly" },
        { text: "Tenho que ir.", type: "professional" }
      ]);
    }

    setIsLoading(false);
  };

  const handleSelectOption = async (option) => {
    // Add player's choice to history
    setDialogueHistory(prev => [...prev, {
      speaker: 'player',
      text: option.text
    }]);

    setIsLoading(true);
    setCurrentOptions([]);

    try {
      const prompt = `Continue a conversa como ${npc.name}.
Personalidade: ${npc.personality}
Relacionamento atual: ${relationshipLevel} (${statusConfig.label})

Histórico da conversa:
${dialogueHistory.map(d => `${d.speaker === 'npc' ? npc.name : cadet.name}: ${d.text}`).join('\n')}
${cadet.name}: ${option.text}

O jogador escolheu uma opção tipo "${option.type}".

Responda de forma natural e gere novas opções de diálogo.
${option.type === 'flirty' && relationshipLevel < 50 ? 'O NPC deve reagir com desconforto se o relacionamento não for alto o suficiente.' : ''}
${availableQuest ? `O NPC pode oferecer uma missão: ${availableQuest}` : ''}

Retorne um JSON:
{
  "response": "resposta do NPC",
  "emotion": "neutral" | "happy" | "concerned" | "impressed" | "disappointed" | "amused",
  "relationshipChange": numero entre -10 e +10,
  "options": [
    {
      "text": "opção",
      "type": "friendly" | "professional" | "curious" | "flirty" | "aggressive" | "accept_quest" | "goodbye",
      "requiredRelationship": numero ou null
    }
  ],
  "givesAdvice": "conselho útil se apropriado" | null,
  "offersQuest": boolean,
  "questDetails": {
    "title": "título da missão",
    "description": "descrição",
    "type": "Exploração" | "Combate" | "Diplomacia" | "Pesquisa",
    "xpReward": numero
  } | null,
  "endsConversation": boolean
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            emotion: { type: "string" },
            relationshipChange: { type: "number" },
            options: { type: "array", items: { type: "object" } },
            givesAdvice: { type: "string" },
            offersQuest: { type: "boolean" },
            questDetails: { type: "object" },
            endsConversation: { type: "boolean" }
          }
        }
      });

      if (result) {
        setDialogueHistory(prev => [...prev, {
          speaker: 'npc',
          text: result.response,
          emotion: result.emotion
        }]);

        // Update relationship if changed
        if (result.relationshipChange && result.relationshipChange !== 0) {
          await onUpdateRelationship(npc.id, result.relationshipChange);
          setFeedback({
            type: result.relationshipChange > 0 ? 'positive' : 'negative',
            value: result.relationshipChange
          });
          setTimeout(() => setFeedback(null), 2000);
        }

        // Handle advice
        if (result.givesAdvice && onReceiveAdvice) {
          onReceiveAdvice(result.givesAdvice);
        }

        // Handle quest offer
        if (result.offersQuest && result.questDetails) {
          setAvailableQuest(result.questDetails);
        }

        if (!result.endsConversation) {
          setCurrentOptions(result.options || []);
        } else {
          setCurrentOptions([
            { text: "Até logo.", type: "goodbye", endsConversation: true }
          ]);
        }
      }
    } catch (error) {
      console.error('Error in dialogue:', error);
      setCurrentOptions([
        { text: "Obrigado pela conversa.", type: "goodbye", endsConversation: true }
      ]);
    }

    setIsLoading(false);
  };

  const handleAcceptQuest = () => {
    if (availableQuest && onStartMission) {
      onStartMission(availableQuest);
    }
  };

  const emotionEmoji = {
    'neutral': '😐',
    'happy': '😊',
    'concerned': '😟',
    'impressed': '😮',
    'disappointed': '😞',
    'amused': '😄'
  };

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
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border-2 border-cyan-500/30 bg-slate-900"
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center overflow-hidden">
                  {npc.avatar ? (
                    <img src={npc.avatar} alt={npc.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-white" />
                  )}
                </div>
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs",
                  `bg-${statusConfig.color}-500`
                )}>
                  <Heart className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{npc.name}</h2>
                <p className="text-sm text-slate-400">{npc.title || npc.type}</p>
                <Badge className={cn("mt-1", `bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400`)}>
                  {statusConfig.label} ({relationshipLevel})
                </Badge>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Dialogue History */}
        <div className="h-64 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {dialogueHistory.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  entry.speaker === 'player' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[80%] p-3 rounded-2xl",
                  entry.speaker === 'player'
                    ? "bg-cyan-500/20 text-white rounded-br-none"
                    : "bg-slate-800 text-slate-100 rounded-bl-none"
                )}>
                  {entry.speaker === 'npc' && entry.emotion && (
                    <span className="mr-2">{emotionEmoji[entry.emotion]}</span>
                  )}
                  {entry.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              </div>
            </div>
          )}
        </div>

        {/* Relationship Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "mx-4 p-2 rounded-lg text-center text-sm font-medium",
                feedback.type === 'positive'
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              )}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              Relacionamento {feedback.value > 0 ? '+' : ''}{feedback.value}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quest Offer */}
        {availableQuest && typeof availableQuest === 'object' && (
          <div className="mx-4 mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <Target className="w-6 h-6 text-amber-400 shrink-0" />
              <div className="flex-1">
                <h4 className="font-bold text-white">{availableQuest.title}</h4>
                <p className="text-sm text-slate-400 mt-1">{availableQuest.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className="bg-amber-500/20 text-amber-400">
                    +{availableQuest.xpReward} XP
                  </Badge>
                  <Badge className="bg-cyan-500/20 text-cyan-400">
                    {availableQuest.type}
                  </Badge>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleAcceptQuest}
                className="bg-amber-500 hover:bg-amber-600"
              >
                Aceitar
              </Button>
            </div>
          </div>
        )}

        {/* Dialogue Options */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {currentOptions.map((option, index) => {
            const isLocked = option.requiredRelationship && relationshipLevel < option.requiredRelationship;
            
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                disabled={isLocked || isLoading}
                onClick={() => option.endsConversation ? onClose() : handleSelectOption(option)}
                className={cn(
                  "w-full p-3 rounded-xl text-left transition-all flex items-center justify-between",
                  isLocked
                    ? "bg-slate-800/50 text-slate-500 cursor-not-allowed"
                    : "bg-slate-800 text-white hover:bg-slate-700"
                )}
              >
                <span>{option.text}</span>
                {isLocked ? (
                  <Badge className="bg-red-500/20 text-red-400 text-xs">
                    Requer {option.requiredRelationship}
                  </Badge>
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
