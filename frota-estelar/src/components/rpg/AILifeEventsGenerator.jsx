import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "../ui/button";
import { 
  Sparkles, Loader2, Check, X, Star, AlertTriangle,
  Heart, Brain, Zap, Swords, Shield, RefreshCw
} from 'lucide-react';
import { base44 } from '../../api/base44Client';
import { cn } from "../../lib/utils";
import LCARSPanel from './LCARSPanel';

const ATTRIBUTE_ICONS = {
  logic: Brain,
  charisma: Heart,
  strength: Swords,
  agility: Zap,
  intelligence: Sparkles
};

const ATTRIBUTE_COLORS = {
  logic: "text-blue-400",
  charisma: "text-green-400",
  strength: "text-red-400",
  agility: "text-orange-400",
  intelligence: "text-purple-400"
};

export default function AILifeEventsGenerator({ 
  species, 
  division, 
  motivation, 
  childhood,
  homeworld,
  onEventsSelected,
  maxSelections = 2
}) {
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateEvents = async () => {
    setIsGenerating(true);
    setEvents([]);
    setSelectedEvents([]);

    try {
      const prompt = `Você é um mestre de RPG criando eventos de vida para um cadete da Academia da Frota Estelar (Star Trek).

PERSONAGEM:
- Espécie: ${species}
- Divisão: ${division}
- Motivação: ${motivation}
- Infância: ${childhood}
- Mundo Natal: ${homeworld}

Gere EXATAMENTE 5 eventos de vida únicos e memoráveis que moldaram este personagem ANTES de entrar na Academia.
Cada evento deve ser dramático, pessoal e influenciar quem o cadete se tornou.

REGRAS:
- Eventos devem ser apropriados para o universo Star Trek
- Cada evento deve ter consequências positivas E negativas
- Variar entre eventos pessoais, profissionais e traumáticos
- Considerar a espécie e cultura do personagem

Retorne um JSON com a estrutura:
{
  "events": [
    {
      "id": "event_1",
      "title": "Título curto do evento",
      "description": "Descrição de 2-3 frases do que aconteceu",
      "age": "idade aproximada quando ocorreu (ex: '12 anos', 'adolescência')",
      "type": "triumph" | "tragedy" | "discovery" | "relationship" | "challenge",
      "bonuses": {
        "atributo": valor_numerico (positivo ou negativo, entre -2 e +3)
      },
      "skillBonus": "nome de uma habilidade que poderia ganhar ou null",
      "emotionalImpact": "Como isso afetou emocionalmente o personagem"
    }
  ]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            events: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  age: { type: "string" },
                  type: { type: "string" },
                  bonuses: { type: "object" },
                  skillBonus: { type: "string" },
                  emotionalImpact: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result?.events) {
        setEvents(result.events);
        setHasGenerated(true);
      }
    } catch (error) {
      console.error('Error generating events:', error);
    }

    setIsGenerating(false);
  };

  const toggleEventSelection = (eventId) => {
    setSelectedEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else if (prev.length < maxSelections) {
        return [...prev, eventId];
      }
      return prev;
    });
  };

  const confirmSelection = () => {
    const selected = events.filter(e => selectedEvents.includes(e.id));
    onEventsSelected(selected);
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case 'triumph':
        return { color: 'emerald', icon: Star, label: 'Triunfo' };
      case 'tragedy':
        return { color: 'red', icon: AlertTriangle, label: 'Tragédia' };
      case 'discovery':
        return { color: 'cyan', icon: Sparkles, label: 'Descoberta' };
      case 'relationship':
        return { color: 'pink', icon: Heart, label: 'Relacionamento' };
      case 'challenge':
        return { color: 'amber', icon: Shield, label: 'Desafio' };
      default:
        return { color: 'slate', icon: Star, label: 'Evento' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="w-10 h-10 mx-auto mb-2 text-amber-400" />
        <h2 className="text-xl font-bold text-white mb-2">Eventos de Vida</h2>
        <p className="text-sm text-slate-400">
          A IA irá gerar eventos únicos baseados no seu personagem.
          Selecione {maxSelections} eventos que definem quem você é.
        </p>
      </div>

      {!hasGenerated && (
        <div className="text-center">
          <Button
            onClick={generateEvents}
            disabled={isGenerating}
            className="bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-6 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Gerando sua história...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Gerar Eventos de Vida
              </>
            )}
          </Button>
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-800/50 border border-amber-500/30">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-slate-300">A IA está criando sua história de vida...</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Selecionados: {selectedEvents.length}/{maxSelections}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateEvents}
                disabled={isGenerating}
                className="text-amber-400"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerar
              </Button>
            </div>

            <div className="grid gap-4">
              {events.map((event, index) => {
                const typeConfig = getTypeConfig(event.type);
                const TypeIcon = typeConfig.icon;
                const isSelected = selectedEvents.includes(event.id);

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => toggleEventSelection(event.id)}
                    className={cn(
                      "relative p-5 rounded-xl border-2 cursor-pointer transition-all",
                      isSelected
                        ? "border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600",
                      selectedEvents.length >= maxSelections && !isSelected && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {/* Selection indicator */}
                    <div className={cn(
                      "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? "border-amber-400 bg-amber-500"
                        : "border-slate-600 bg-slate-800"
                    )}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>

                    <div className="flex items-start gap-4">
                      {/* Type Icon */}
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        `bg-${typeConfig.color}-500/20`
                      )}>
                        <TypeIcon className={cn("w-6 h-6", `text-${typeConfig.color}-400`)} />
                      </div>

                      <div className="flex-1 min-w-0 pr-8">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white">{event.title}</h3>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            `bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400`
                          )}>
                            {typeConfig.label}
                          </span>
                        </div>

                        {/* Age */}
                        <p className="text-xs text-slate-500 mb-2">{event.age}</p>

                        {/* Description */}
                        <p className="text-sm text-slate-300 mb-3">{event.description}</p>

                        {/* Emotional Impact */}
                        <p className="text-xs text-slate-400 italic mb-3">
                          "{event.emotionalImpact}"
                        </p>

                        {/* Bonuses */}
                        <div className="flex flex-wrap gap-2">
                          {event.bonuses && Object.entries(event.bonuses).map(([attr, value]) => {
                            const Icon = ATTRIBUTE_ICONS[attr] || Sparkles;
                            const isPositive = value > 0;
                            return (
                              <span
                                key={attr}
                                className={cn(
                                  "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg",
                                  isPositive
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/20 text-red-400"
                                )}
                              >
                                <Icon className="w-3 h-3" />
                                {isPositive ? '+' : ''}{value} {attr}
                              </span>
                            );
                          })}
                          {event.skillBonus && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-400">
                              <Star className="w-3 h-3" />
                              {event.skillBonus}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {selectedEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center pt-4"
              >
                <Button
                  onClick={confirmSelection}
                  disabled={selectedEvents.length === 0}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 px-8"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar {selectedEvents.length} Evento{selectedEvents.length > 1 ? 's' : ''}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
