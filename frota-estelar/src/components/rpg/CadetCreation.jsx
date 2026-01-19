import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  User, Zap, Brain, Heart, Shield, Swords,
  ChevronRight, ChevronLeft, Sparkles
} from 'lucide-react';
import LCARSPanel from './LCARSPanel';
import AttributeBar from './AttributeBar';
import { cn } from "../../lib/utils";

const SPECIES = [
  { id: "Humano", name: "Humano", bonus: { charisma: 2 }, desc: "Adaptáveis e determinados" },
  { id: "Vulcano", name: "Vulcano", bonus: { logic: 3 }, desc: "Lógica e controle emocional" },
  { id: "Andoriano", name: "Andoriano", bonus: { agility: 2, strength: 1 }, desc: "Guerreiros honrados" },
  { id: "Betazoide", name: "Betazoide", bonus: { charisma: 2, intelligence: 1 }, desc: "Empatia telepática" },
  { id: "Trill", name: "Trill", bonus: { intelligence: 2, logic: 1 }, desc: "Sabedoria de gerações" },
  { id: "Bajoriano", name: "Bajoriano", bonus: { strength: 2, charisma: 1 }, desc: "Fé e resiliência" },
  { id: "Meio-Vulcano", name: "Meio-Vulcano", bonus: { logic: 2, charisma: 1 }, desc: "Entre dois mundos" }
];

const DIVISIONS = [
  { id: "Comando", name: "Comando", color: "red", icon: Shield, desc: "Liderança e tática" },
  { id: "Ciências", name: "Ciências", color: "blue", icon: Brain, desc: "Pesquisa e análise" },
  { id: "Engenharia", name: "Engenharia", color: "orange", icon: Zap, desc: "Tecnologia e reparos" },
  { id: "Médico", name: "Médico", color: "green", icon: Heart, desc: "Saúde e bem-estar" },
  { id: "Segurança", name: "Segurança", color: "purple", icon: Swords, desc: "Proteção e defesa" }
];

export default function CadetCreation({ onComplete }) {
  const [step, setStep] = useState(1);
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
    skills: [],
    completedMissions: [],
    logEntries: []
  });
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
        attributes: newAttrs
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

  const handleComplete = () => {
    onComplete(cadet);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <LCARSPanel title="Identificação" color="blue">
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
                      className="bg-slate-800/50 border-cyan-500/30 text-white text-center text-lg h-14"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!cadet.name.trim()}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                    >
                      Próximo <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </LCARSPanel>
            </motion.div>
          )}

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

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <LCARSPanel title="Divisão" color="red">
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-white mb-2">
                      Escolha sua Divisão
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Sua especialização na Frota Estelar
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {DIVISIONS.map((division) => {
                      const Icon = division.icon;
                      return (
                        <button
                          key={division.id}
                          onClick={() => setCadet(prev => ({ ...prev, division: division.id }))}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all flex items-center gap-4",
                            cadet.division === division.id
                              ? "border-red-400 bg-red-500/10"
                              : "border-slate-700 bg-slate-800/30 hover:border-slate-500"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            division.color === "red" && "bg-red-500/20",
                            division.color === "blue" && "bg-blue-500/20",
                            division.color === "orange" && "bg-orange-500/20",
                            division.color === "green" && "bg-green-500/20",
                            division.color === "purple" && "bg-purple-500/20"
                          )}>
                            <Icon className={cn(
                              "w-6 h-6",
                              division.color === "red" && "text-red-400",
                              division.color === "blue" && "text-blue-400",
                              division.color === "orange" && "text-orange-400",
                              division.color === "green" && "text-green-400",
                              division.color === "purple" && "text-purple-400"
                            )} />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-white">{division.name}</div>
                            <div className="text-xs text-slate-400">{division.desc}</div>
                          </div>
                        </button>
                      );
                    })}
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

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <LCARSPanel title="Atributos" color="purple">
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-white mb-2">
                      Distribua seus Atributos
                    </h2>
                    <p className="text-purple-400 font-mono">
                      Pontos restantes: {pointsRemaining}
                    </p>
                  </div>

                  <div className="space-y-4">
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

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(3)}
                      className="border-slate-600 text-slate-300"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button
                      onClick={handleComplete}
                      className="bg-gradient-to-r from-purple-500 to-indigo-600"
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
