import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { 
  User, Zap, Brain, Heart, Shield, Swords, Sparkles,
  ChevronRight, ChevronLeft, Shuffle, Loader2, Camera,
  Globe, BookOpen, Target, Plus, X, Check, AlertTriangle
} from 'lucide-react';
import { base44 } from '../../api/base44Client';
import LCARSPanel from './LCARSPanel';
import AttributeBar from './AttributeBar';
import AILifeEventsGenerator from './AILifeEventsGenerator';
import { cn } from "../../lib/utils";

const SPECIES = [
  { id: "Humano", name: "Humano", bonus: { charisma: 2 }, desc: "Adaptáveis e determinados", homeworlds: ["Terra", "Colônias Luna", "Marte"] },
  { id: "Vulcano", name: "Vulcano", bonus: { logic: 3 }, desc: "Lógica e controle emocional", homeworlds: ["Vulcano", "P'Jem", "ShiKahr"] },
  { id: "Andoriano", name: "Andoriano", bonus: { agility: 2, strength: 1 }, desc: "Guerreiros honrados", homeworlds: ["Andória", "Weytahn", "Babel"] },
  { id: "Betazoide", name: "Betazoide", bonus: { charisma: 2, intelligence: 1 }, desc: "Empatia telepática", homeworlds: ["Betazed", "Darona", "Medara"] },
  { id: "Trill", name: "Trill", bonus: { intelligence: 2, logic: 1 }, desc: "Sabedoria de gerações", homeworlds: ["Trill", "Caves of Mak'ala"] },
  { id: "Bajoriano", name: "Bajoriano", bonus: { strength: 2, charisma: 1 }, desc: "Fé e resiliência", homeworlds: ["Bajor", "Deep Space Nine", "Dahkur Province"] },
  { id: "Meio-Vulcano", name: "Meio-Vulcano", bonus: { logic: 2, charisma: 1 }, desc: "Entre dois mundos", homeworlds: ["Terra", "Vulcano", "Estação Espacial"] }
];

const DIVISIONS = [
  { id: "Comando", name: "Comando", color: "red", icon: Shield, desc: "Liderança e tática" },
  { id: "Ciências", name: "Ciências", color: "blue", icon: Brain, desc: "Pesquisa e análise" },
  { id: "Engenharia", name: "Engenharia", color: "orange", icon: Zap, desc: "Tecnologia e reparos" },
  { id: "Médico", name: "Médico", color: "green", icon: Heart, desc: "Saúde e bem-estar" },
  { id: "Segurança", name: "Segurança", color: "purple", icon: Swords, desc: "Proteção e defesa" }
];

const CHILDHOOD_OPTIONS = [
  { id: "academy_brat", name: "Filho de Oficial", desc: "Cresceu em bases estelares", bonus: { intelligence: 1 } },
  { id: "frontier", name: "Fronteira", desc: "Criado em colônia remota", bonus: { agility: 1, strength: 1 } },
  { id: "privileged", name: "Privilegiado", desc: "Educação de elite", bonus: { charisma: 1, intelligence: 1 } },
  { id: "orphan", name: "Órfão", desc: "Superou grandes dificuldades", bonus: { strength: 2 } },
  { id: "scientist_family", name: "Família de Cientistas", desc: "Cercado de pesquisadores", bonus: { logic: 1, intelligence: 1 } },
  { id: "diplomat_family", name: "Família Diplomática", desc: "Viajou por muitos mundos", bonus: { charisma: 2 } }
];

const MOTIVATIONS = [
  { id: "explore", name: "Explorar o Desconhecido", desc: "Sede de descobertas" },
  { id: "protect", name: "Proteger os Inocentes", desc: "Defender a Federação" },
  { id: "knowledge", name: "Buscar Conhecimento", desc: "Expandir fronteiras científicas" },
  { id: "honor", name: "Honra Familiar", desc: "Continuar um legado" },
  { id: "redemption", name: "Redenção", desc: "Corrigir erros do passado" },
  { id: "adventure", name: "Sede de Aventura", desc: "Viver experiências únicas" }
];

const LIFE_EVENTS = [
  { id: "first_contact", name: "Primeiro Contato", desc: "Testemunhou encontro com nova espécie" },
  { id: "tragedy", name: "Tragédia Pessoal", desc: "Perdeu alguém importante" },
  { id: "heroic_act", name: "Ato Heroico", desc: "Salvou vidas antes da Academia" },
  { id: "mentor", name: "Mentor Influente", desc: "Guiado por um oficial experiente" },
  { id: "rivalry", name: "Rivalidade", desc: "Competição intensa com outro cadete" },
  { id: "accident", name: "Acidente", desc: "Sobreviveu a desastre espacial" },
  { id: "discovery", name: "Descoberta", desc: "Fez uma descoberta científica" },
  { id: "betrayal", name: "Traição", desc: "Foi traído por alguém de confiança" }
];

const STRENGTHS = [
  { id: "leader", name: "Líder Nato", effect: "charisma", bonus: 2, malus: "logic", malusVal: 1 },
  { id: "genius", name: "Gênio", effect: "intelligence", bonus: 2, malus: "charisma", malusVal: 1 },
  { id: "athlete", name: "Atleta", effect: "agility", bonus: 2, malus: "intelligence", malusVal: 1 },
  { id: "empath", name: "Empático", effect: "charisma", bonus: 2, malus: "strength", malusVal: 1 },
  { id: "tactician", name: "Estrategista", effect: "logic", bonus: 2, malus: "agility", malusVal: 1 },
  { id: "warrior", name: "Guerreiro", effect: "strength", bonus: 2, malus: "charisma", malusVal: 1 }
];

const FLAWS = [
  { id: "arrogant", name: "Arrogante", effect: "charisma", malus: 1, desc: "Confiança excessiva" },
  { id: "impulsive", name: "Impulsivo", effect: "logic", malus: 1, desc: "Age antes de pensar" },
  { id: "paranoid", name: "Paranoico", effect: "charisma", malus: 1, desc: "Desconfia de todos" },
  { id: "rigid", name: "Inflexível", effect: "charisma", malus: 1, desc: "Dificuldade com mudanças" },
  { id: "naive", name: "Ingênuo", effect: "logic", malus: 1, desc: "Muito confiante" },
  { id: "haunted", name: "Assombrado", effect: "intelligence", malus: 1, desc: "Pesadelos do passado" }
];

export default function CharacterCreationEnhanced({ onComplete }) {
  const [step, setStep] = useState(1);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);
  
  const [cadet, setCadet] = useState({
    name: '',
    species: null,
    division: null,
    attributes: {
      logic: 5,
      charisma: 5,
      strength: 5,
      agility: 5,
      intelligence: 5
    },
    level: 1,
    xp: 0,
    rank: "Cadete 4ª Classe",
    skillIds: [],
    skillLevels: {},
    unspentSkillPoints: 3,
    completedMissions: [],
    logEntries: [],
    backstory: {
      homeworld: '',
      childhood: '',
      motivation: '',
      lifeEvents: [],
      aiGeneratedEvents: [],
      customDescription: ''
    },
    traits: {
      strengths: [],
      flaws: []
    },
    avatar: '',
    credits: 100
  });
  const [useAIEvents, setUseAIEvents] = useState(false);
  const [pointsRemaining, setPointsRemaining] = useState(5);

  const applySpeciesBonus = (speciesId) => {
    const species = SPECIES.find(s => s.id === speciesId);
    if (species) {
      const newAttrs = { logic: 5, charisma: 5, strength: 5, agility: 5, intelligence: 5 };
      Object.entries(species.bonus).forEach(([attr, bonus]) => {
        newAttrs[attr] += bonus;
      });
      setCadet(prev => ({
        ...prev,
        species: speciesId,
        attributes: newAttrs,
        backstory: {
          ...prev.backstory,
          homeworld: species.homeworlds[0]
        }
      }));
    }
  };

  const adjustAttribute = (attr, delta) => {
    if (delta > 0 && pointsRemaining <= 0) return;
    if (delta < 0 && cadet.attributes[attr] <= 1) return;
    
    const baseValue = SPECIES.find(s => s.id === cadet.species)?.bonus[attr] || 0;
    const minValue = 5 + baseValue;
    
    if (delta < 0 && cadet.attributes[attr] <= minValue) return;
    
    setCadet(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attr]: prev.attributes[attr] + delta
      }
    }));
    setPointsRemaining(prev => prev - delta);
  };

  const toggleLifeEvent = (eventId) => {
    setCadet(prev => {
      const events = prev.backstory.lifeEvents || [];
      if (events.includes(eventId)) {
        return {
          ...prev,
          backstory: {
            ...prev.backstory,
            lifeEvents: events.filter(e => e !== eventId)
          }
        };
      } else if (events.length < 3) {
        return {
          ...prev,
          backstory: {
            ...prev.backstory,
            lifeEvents: [...events, eventId]
          }
        };
      }
      return prev;
    });
  };

  const toggleStrength = (strengthId) => {
    setCadet(prev => {
      const strengths = prev.traits.strengths || [];
      if (strengths.includes(strengthId)) {
        return {
          ...prev,
          traits: {
            ...prev.traits,
            strengths: strengths.filter(s => s !== strengthId)
          }
        };
      } else if (strengths.length < 2) {
        return {
          ...prev,
          traits: {
            ...prev.traits,
            strengths: [...strengths, strengthId]
          }
        };
      }
      return prev;
    });
  };

  const toggleFlaw = (flawId) => {
    setCadet(prev => {
      const flaws = prev.traits.flaws || [];
      if (flaws.includes(flawId)) {
        return {
          ...prev,
          traits: {
            ...prev.traits,
            flaws: flaws.filter(f => f !== flawId)
          }
        };
      } else if (flaws.length < 2) {
        return {
          ...prev,
          traits: {
            ...prev.traits,
            flaws: [...flaws, flawId]
          }
        };
      }
      return prev;
    });
  };

  const generateAvatar = async () => {
    if (!cadet.name || !cadet.species || !cadet.division) return;
    
    setIsGeneratingAvatar(true);
    try {
      const divisionColor = DIVISIONS.find(d => d.id === cadet.division)?.color || 'gold';
      const prompt = `Professional Star Trek style portrait of a ${cadet.species} Starfleet cadet named ${cadet.name}. 
        Wearing a ${divisionColor} Starfleet uniform. 
        Cinematic lighting, detailed, high quality, sci-fi aesthetic, 
        futuristic academy background with stars visible through windows.
        ${cadet.backstory.customDescription ? `Character description: ${cadet.backstory.customDescription}` : ''}`;
      
      const result = await base44.integrations.Core.GenerateImage({ prompt });
      
      if (result?.url) {
        setCadet(prev => ({ ...prev, avatar: result.url }));
      }
    } catch (error) {
      console.error('Error generating avatar:', error);
    }
    setIsGeneratingAvatar(false);
  };

  const randomizeCharacter = async () => {
    setIsRandomizing(true);
    
    // Random selections
    const randomSpecies = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    const randomDivision = DIVISIONS[Math.floor(Math.random() * DIVISIONS.length)];
    const randomChildhood = CHILDHOOD_OPTIONS[Math.floor(Math.random() * CHILDHOOD_OPTIONS.length)];
    const randomMotivation = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
    
    // Random life events (1-3)
    const numEvents = Math.floor(Math.random() * 3) + 1;
    const shuffledEvents = [...LIFE_EVENTS].sort(() => Math.random() - 0.5);
    const randomEvents = shuffledEvents.slice(0, numEvents).map(e => e.id);
    
    // Random strengths (1-2) and flaws (1-2)
    const shuffledStrengths = [...STRENGTHS].sort(() => Math.random() - 0.5);
    const shuffledFlaws = [...FLAWS].sort(() => Math.random() - 0.5);
    const randomStrengths = shuffledStrengths.slice(0, Math.floor(Math.random() * 2) + 1).map(s => s.id);
    const randomFlaws = shuffledFlaws.slice(0, Math.floor(Math.random() * 2) + 1).map(f => f.id);

    // Generate random name using LLM
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a single unique Star Trek style name for a ${randomSpecies.id} character. 
          Just the name, nothing else. Make it sound appropriate for the species.`,
      });
      
      const randomName = result?.trim() || `Cadete ${Math.floor(Math.random() * 1000)}`;
      
      // Calculate attributes with species bonus
      const newAttrs = { logic: 5, charisma: 5, strength: 5, agility: 5, intelligence: 5 };
      Object.entries(randomSpecies.bonus).forEach(([attr, bonus]) => {
        newAttrs[attr] += bonus;
      });
      
      // Randomly distribute remaining points
      const attrKeys = Object.keys(newAttrs);
      let remaining = 5;
      while (remaining > 0) {
        const randomAttr = attrKeys[Math.floor(Math.random() * attrKeys.length)];
        if (newAttrs[randomAttr] < 10) {
          newAttrs[randomAttr]++;
          remaining--;
        }
      }
      
      setCadet(prev => ({
        ...prev,
        name: randomName,
        species: randomSpecies.id,
        division: randomDivision.id,
        attributes: newAttrs,
        backstory: {
          homeworld: randomSpecies.homeworlds[Math.floor(Math.random() * randomSpecies.homeworlds.length)],
          childhood: randomChildhood.id,
          motivation: randomMotivation.id,
          lifeEvents: randomEvents,
          customDescription: ''
        },
        traits: {
          strengths: randomStrengths,
          flaws: randomFlaws
        }
      }));
      setPointsRemaining(0);
    } catch (error) {
      console.error('Error generating random character:', error);
    }
    
    setIsRandomizing(false);
  };

  const calculateFinalAttributes = () => {
    const attrs = { ...cadet.attributes };
    
    // Apply childhood bonus
    const childhood = CHILDHOOD_OPTIONS.find(c => c.id === cadet.backstory.childhood);
    if (childhood?.bonus) {
      Object.entries(childhood.bonus).forEach(([attr, val]) => {
        attrs[attr] = (attrs[attr] || 5) + val;
      });
    }
    
    // Apply strength bonuses and maluses
    cadet.traits.strengths?.forEach(sId => {
      const strength = STRENGTHS.find(s => s.id === sId);
      if (strength) {
        attrs[strength.effect] = (attrs[strength.effect] || 5) + strength.bonus;
        if (strength.malus) {
          attrs[strength.malus] = (attrs[strength.malus] || 5) - strength.malusVal;
        }
      }
    });
    
    // Apply flaw maluses
    cadet.traits.flaws?.forEach(fId => {
      const flaw = FLAWS.find(f => f.id === fId);
      if (flaw) {
        attrs[flaw.effect] = (attrs[flaw.effect] || 5) - flaw.malus;
      }
    });
    
    return attrs;
  };

  const handleComplete = () => {
    const finalAttrs = calculateFinalAttributes();
    onComplete({
      ...cadet,
      attributes: finalAttrs
    });
  };

  const totalSteps = 7;

  const handleAIEventsSelected = (events) => {
    // Apply bonuses from AI events
    const newAttrs = { ...cadet.attributes };
    events.forEach(event => {
      if (event.bonuses) {
        Object.entries(event.bonuses).forEach(([attr, val]) => {
          if (newAttrs[attr] !== undefined) {
            newAttrs[attr] = Math.max(1, (newAttrs[attr] || 5) + val);
          }
        });
      }
    });
    
    setCadet(prev => ({
      ...prev,
      attributes: newAttrs,
      backstory: {
        ...prev.backstory,
        aiGeneratedEvents: events
      }
    }));
    setStep(6);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 text-slate-200">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 mb-3">
            <span>Passo {step} de {totalSteps}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={randomizeCharacter}
              disabled={isRandomizing}
              className="text-amber-400 hover:text-amber-300 rounded-full px-3"
            >
              {isRandomizing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Shuffle className="w-4 h-4 mr-2" />
              )}
              Aleatório
            </Button>
          </div>
          <div className="h-2 bg-slate-800/80 rounded-full overflow-hidden shadow-inner shadow-cyan-500/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Name */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <LCARSPanel title="Identificação" color="blue" className="shadow-2xl shadow-cyan-500/10">
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Bem-vindo à Academia da Frota Estelar
                    </h2>
                    <p className="text-slate-400">
                      Informe seu nome para iniciar o registro
                    </p>
                  </div>
                  
                  <div className="max-w-md mx-auto">
                    <Input
                      placeholder="Nome do Cadete"
                      value={cadet.name}
                      onChange={(e) => setCadet(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-slate-900/70 border-cyan-500/30 text-white text-center text-lg h-14 rounded-xl shadow-inner shadow-cyan-500/5 focus-visible:border-cyan-400/60 focus-visible:ring-cyan-500/40"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!cadet.name.trim()}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-full px-6"
                    >
                      Próximo <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </LCARSPanel>
            </motion.div>
          )}

          {/* Step 2: Species */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <LCARSPanel title="Espécie" color="orange">
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-white mb-2">
                      Selecione sua Espécie
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Cada espécie possui bônus únicos de atributos
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {SPECIES.map((species) => (
                      <button
                        key={species.id}
                        onClick={() => applySpeciesBonus(species.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-left",
                          cadet.species === species.id
                            ? "border-amber-400 bg-amber-500/10"
                            : "border-slate-700 bg-slate-800/30 hover:border-slate-500"
                        )}
                      >
                        <div className="font-semibold text-white">{species.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{species.desc}</div>
                        <div className="text-xs text-amber-400 mt-2">
                          {Object.entries(species.bonus).map(([attr, val]) => (
                            <span key={attr} className="mr-2">+{val} {attr}</span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="border-slate-600 text-slate-300"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!cadet.species}
                      className="bg-gradient-to-r from-amber-500 to-orange-600"
                    >
                      Próximo <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </LCARSPanel>
            </motion.div>
          )}

          {/* Step 3: Division & Attributes */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <LCARSPanel title="Divisão e Atributos" color="red">
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-white mb-2">
                      Escolha sua Divisão
                    </h2>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {DIVISIONS.map((division) => {
                      const Icon = division.icon;
                      return (
                        <button
                          key={division.id}
                          onClick={() => setCadet(prev => ({ ...prev, division: division.id }))}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                            cadet.division === division.id
                              ? "border-red-400 bg-red-500/10"
                              : "border-slate-700 bg-slate-800/30 hover:border-slate-500"
                          )}
                        >
                          <Icon className={cn(
                            "w-6 h-6",
                            division.color === "red" && "text-red-400",
                            division.color === "blue" && "text-blue-400",
                            division.color === "orange" && "text-orange-400",
                            division.color === "green" && "text-green-400",
                            division.color === "purple" && "text-purple-400"
                          )} />
                          <span className="text-xs text-white">{division.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-white">Atributos</h3>
                      <span className="text-purple-400 font-mono">
                        {pointsRemaining} pontos restantes
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: 'logic', label: 'Lógica', icon: Brain, color: 'blue' },
                        { key: 'charisma', label: 'Carisma', icon: Heart, color: 'green' },
                        { key: 'strength', label: 'Força', icon: Swords, color: 'red' },
                        { key: 'agility', label: 'Agilidade', icon: Zap, color: 'orange' },
                        { key: 'intelligence', label: 'Inteligência', icon: Sparkles, color: 'purple' }
                      ].map(attr => (
                        <div key={attr.key} className="flex items-center gap-4">
                          <div className="flex-1">
                            <AttributeBar
                              label={attr.label}
                              value={cadet.attributes[attr.key]}
                              maxValue={10}
                              color={attr.color}
                              icon={attr.icon}
                              size="sm"
                            />
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => adjustAttribute(attr.key, -1)}
                              className="w-8 h-8 p-0 border-slate-600"
                            >
                              -
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => adjustAttribute(attr.key, 1)}
                              disabled={pointsRemaining <= 0}
                              className="w-8 h-8 p-0 border-slate-600"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="border-slate-600 text-slate-300"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button
                      onClick={() => setStep(4)}
                      disabled={!cadet.division}
                      className="bg-gradient-to-r from-red-500 to-red-600"
                    >
                      Próximo <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </LCARSPanel>
            </motion.div>
          )}

          {/* Step 4: Backstory */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <LCARSPanel title="História de Fundo" color="purple">
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">Sua História</h2>
                  </div>

                  {/* Homeworld */}
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Mundo Natal</label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIES.find(s => s.id === cadet.species)?.homeworlds.map(world => (
                        <button
                          key={world}
                          onClick={() => setCadet(prev => ({
                            ...prev,
                            backstory: { ...prev.backstory, homeworld: world }
                          }))}
                          className={cn(
                            "px-4 py-2 rounded-lg border transition-all",
                            cadet.backstory.homeworld === world
                              ? "border-purple-400 bg-purple-500/20 text-purple-300"
                              : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600"
                          )}
                        >
                          <Globe className="w-4 h-4 inline mr-2" />
                          {world}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Childhood */}
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Infância</label>
                    <div className="grid grid-cols-2 gap-2">
                      {CHILDHOOD_OPTIONS.map(option => (
                        <button
                          key={option.id}
                          onClick={() => setCadet(prev => ({
                            ...prev,
                            backstory: { ...prev.backstory, childhood: option.id }
                          }))}
                          className={cn(
                            "p-3 rounded-lg border text-left transition-all",
                            cadet.backstory.childhood === option.id
                              ? "border-purple-400 bg-purple-500/20"
                              : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                          )}
                        >
                          <div className="font-medium text-white">{option.name}</div>
                          <div className="text-xs text-slate-400">{option.desc}</div>
                          <div className="text-xs text-emerald-400 mt-1">
                            {Object.entries(option.bonus).map(([attr, val]) => (
                              <span key={attr} className="mr-2">+{val} {attr}</span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Motivation */}
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Motivação para a Academia</label>
                    <div className="grid grid-cols-2 gap-2">
                      {MOTIVATIONS.map(option => (
                        <button
                          key={option.id}
                          onClick={() => setCadet(prev => ({
                            ...prev,
                            backstory: { ...prev.backstory, motivation: option.id }
                          }))}
                          className={cn(
                            "p-3 rounded-lg border text-left transition-all",
                            cadet.backstory.motivation === option.id
                              ? "border-purple-400 bg-purple-500/20"
                              : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                          )}
                        >
                          <div className="font-medium text-white">{option.name}</div>
                          <div className="text-xs text-slate-400">{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Life Events Choice */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-amber-500/30">
                    <label className="text-sm text-amber-400 mb-3 block font-semibold">
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      Eventos de Vida
                    </label>
                    <p className="text-xs text-slate-400 mb-4">
                      Escolha como definir os eventos marcantes do seu passado:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setUseAIEvents(false)}
                        className={cn(
                          "p-4 rounded-lg border-2 text-left transition-all",
                          !useAIEvents
                            ? "border-amber-400 bg-amber-500/20"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        )}
                      >
                        <div className="font-medium text-white">Escolher Manualmente</div>
                        <div className="text-xs text-slate-400 mt-1">
                          Selecione entre eventos pré-definidos
                        </div>
                      </button>
                      <button
                        onClick={() => setUseAIEvents(true)}
                        className={cn(
                          "p-4 rounded-lg border-2 text-left transition-all",
                          useAIEvents
                            ? "border-amber-400 bg-amber-500/20"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        )}
                      >
                        <div className="font-medium text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          Gerar com IA
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Eventos únicos baseados no seu personagem
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Manual Life Events */}
                  {!useAIEvents && (
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">
                        Eventos Marcantes (até 3)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {LIFE_EVENTS.map(event => (
                          <button
                            key={event.id}
                            onClick={() => toggleLifeEvent(event.id)}
                            disabled={
                              !cadet.backstory.lifeEvents?.includes(event.id) && 
                              (cadet.backstory.lifeEvents?.length || 0) >= 3
                            }
                            className={cn(
                              "p-3 rounded-lg border text-left transition-all",
                              cadet.backstory.lifeEvents?.includes(event.id)
                                ? "border-amber-400 bg-amber-500/20"
                                : "border-slate-700 bg-slate-800/50 hover:border-slate-600",
                              !cadet.backstory.lifeEvents?.includes(event.id) && 
                              (cadet.backstory.lifeEvents?.length || 0) >= 3 && "opacity-50"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {cadet.backstory.lifeEvents?.includes(event.id) && (
                                <Check className="w-4 h-4 text-amber-400" />
                              )}
                              <span className="font-medium text-white">{event.name}</span>
                            </div>
                            <div className="text-xs text-slate-400">{event.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(3)}
                      className="border-slate-600 text-slate-300"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button
                      onClick={() => useAIEvents ? setStep(5) : setStep(6)}
                      className="bg-gradient-to-r from-purple-500 to-indigo-600"
                    >
                      {useAIEvents ? 'Gerar Eventos' : 'Próximo'} <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </LCARSPanel>
            </motion.div>
          )}

          {/* Step 5: AI Life Events */}
          {step === 5 && useAIEvents && (
            <motion.div
              key="step5-ai"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <LCARSPanel title="Eventos de Vida (IA)" color="amber">
                <AILifeEventsGenerator
                  species={cadet.species}
                  division={cadet.division}
                  motivation={MOTIVATIONS.find(m => m.id === cadet.backstory.motivation)?.name || ''}
                  childhood={CHILDHOOD_OPTIONS.find(c => c.id === cadet.backstory.childhood)?.name || ''}
                  homeworld={cadet.backstory.homeworld}
                  onEventsSelected={handleAIEventsSelected}
                  maxSelections={2}
                />
                <div className="flex justify-start pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(4)}
                    className="border-slate-600 text-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                </div>
              </LCARSPanel>
            </motion.div>
          )}

          {/* Step 6: Traits */}
          {step === 6 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <LCARSPanel title="Traços de Personalidade" color="green">
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <Target className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                    <h2 className="text-xl font-bold text-white">Forças e Fraquezas</h2>
                    <p className="text-sm text-slate-400">
                      Escolha traços que definem seu personagem
                    </p>
                  </div>

                  {/* Strengths */}
                  <div>
                    <label className="text-sm text-emerald-400 mb-2 block flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Pontos Fortes (até 2)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {STRENGTHS.map(strength => (
                        <button
                          key={strength.id}
                          onClick={() => toggleStrength(strength.id)}
                          disabled={
                            !cadet.traits.strengths?.includes(strength.id) && 
                            (cadet.traits.strengths?.length || 0) >= 2
                          }
                          className={cn(
                            "p-3 rounded-lg border text-left transition-all",
                            cadet.traits.strengths?.includes(strength.id)
                              ? "border-emerald-400 bg-emerald-500/20"
                              : "border-slate-700 bg-slate-800/50 hover:border-slate-600",
                            !cadet.traits.strengths?.includes(strength.id) && 
                            (cadet.traits.strengths?.length || 0) >= 2 && "opacity-50"
                          )}
                        >
                          <div className="font-medium text-white">{strength.name}</div>
                          <div className="text-xs text-emerald-400">
                            +{strength.bonus} {strength.effect}
                          </div>
                          <div className="text-xs text-red-400">
                            -{strength.malusVal} {strength.malus}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flaws */}
                  <div>
                    <label className="text-sm text-red-400 mb-2 block flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Falhas (até 2)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {FLAWS.map(flaw => (
                        <button
                          key={flaw.id}
                          onClick={() => toggleFlaw(flaw.id)}
                          disabled={
                            !cadet.traits.flaws?.includes(flaw.id) && 
                            (cadet.traits.flaws?.length || 0) >= 2
                          }
                          className={cn(
                            "p-3 rounded-lg border text-left transition-all",
                            cadet.traits.flaws?.includes(flaw.id)
                              ? "border-red-400 bg-red-500/20"
                              : "border-slate-700 bg-slate-800/50 hover:border-slate-600",
                            !cadet.traits.flaws?.includes(flaw.id) && 
                            (cadet.traits.flaws?.length || 0) >= 2 && "opacity-50"
                          )}
                        >
                          <div className="font-medium text-white">{flaw.name}</div>
                          <div className="text-xs text-slate-400">{flaw.desc}</div>
                          <div className="text-xs text-red-400">-{flaw.malus} {flaw.effect}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => useAIEvents ? setStep(5) : setStep(4)}
                      className="border-slate-600 text-slate-300"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button
                      onClick={() => setStep(7)}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600"
                    >
                      Próximo <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </LCARSPanel>
            </motion.div>
          )}

          {/* Step 7: Avatar & Final */}
          {step === 7 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <LCARSPanel title="Retrato e Finalização" color="cyan">
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <Camera className="w-10 h-10 mx-auto mb-2 text-cyan-400" />
                    <h2 className="text-xl font-bold text-white">Seu Retrato</h2>
                  </div>

                  {/* Avatar Preview & Generation */}
                  <div className="flex flex-col items-center gap-4">
                    <div className={cn(
                      "w-40 h-40 rounded-2xl border-4 overflow-hidden",
                      "border-cyan-500/30 bg-slate-800 flex items-center justify-center"
                    )}>
                      {cadet.avatar ? (
                        <img 
                          src={cadet.avatar} 
                          alt={cadet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-20 h-20 text-slate-600" />
                      )}
                    </div>

                    <div className="space-y-2 w-full max-w-md">
                      <Textarea
                        placeholder="Descrição adicional para o retrato (opcional)"
                        value={cadet.backstory.customDescription}
                        onChange={(e) => setCadet(prev => ({
                          ...prev,
                          backstory: { ...prev.backstory, customDescription: e.target.value }
                        }))}
                        className="bg-slate-800/50 border-slate-700 h-20"
                      />
                      <Button
                        onClick={generateAvatar}
                        disabled={isGeneratingAvatar}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
                      >
                        {isGeneratingAvatar ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Gerando Retrato...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 mr-2" />
                            Gerar Retrato com IA
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Character Summary */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-cyan-500/20">
                    <h3 className="text-sm font-semibold text-cyan-400 mb-3">RESUMO DO CADETE</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Nome:</span>
                        <span className="text-white ml-2">{cadet.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Espécie:</span>
                        <span className="text-white ml-2">{cadet.species}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Divisão:</span>
                        <span className="text-white ml-2">{cadet.division}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Mundo Natal:</span>
                        <span className="text-white ml-2">{cadet.backstory.homeworld}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Events Summary */}
                  {cadet.backstory.aiGeneratedEvents?.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <h3 className="text-sm font-semibold text-amber-400 mb-2">Eventos de Vida Gerados</h3>
                      <div className="space-y-2">
                        {cadet.backstory.aiGeneratedEvents.map((event, i) => (
                          <div key={i} className="text-sm">
                            <span className="text-white font-medium">{event.title}</span>
                            <span className="text-slate-400"> - {event.age}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(6)}
                      className="border-slate-600 text-slate-300"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button
                      onClick={handleComplete}
                      className="bg-gradient-to-r from-amber-500 to-orange-600"
                    >
                      Iniciar Jornada <Sparkles className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </LCARSPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
