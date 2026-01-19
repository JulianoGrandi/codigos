import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "../ui/button";
import { 
  AlertTriangle, CheckCircle, XCircle, Dice6,
  ChevronRight, Trophy, Star, ArrowLeft,
  TrendingUp, TrendingDown, Award, Shield
} from 'lucide-react';
import LCARSPanel from './LCARSPanel';
import { cn } from "../../lib/utils";

export default function MissionPlay({ mission, cadet, onComplete, onExit }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [reputationChange, setReputationChange] = useState(0);
  const [disciplineChange, setDisciplineChange] = useState(0);
  const [missionComplete, setMissionComplete] = useState(false);
  const [missionFailed, setMissionFailed] = useState(false);
  const [lastRoll, setLastRoll] = useState(null);
  const [showRoll, setShowRoll] = useState(false);

  const narrative = mission.narrative || [];
  const step = narrative[currentStep];

  // Calculate bonus stats from equipment
  const getEquipmentBonus = (attribute) => {
    let bonus = 0;
    const equipped = cadet.equippedItems || {};
    Object.values(equipped).forEach(item => {
      if (item?.stats?.[attribute]) {
        bonus += item.stats[attribute];
      }
    });
    return bonus;
  };

  const rollDice = (attribute, requiredValue) => {
    const baseValue = cadet.attributes?.[attribute] || 5;
    const equipmentBonus = getEquipmentBonus(attribute);
    const attributeValue = baseValue + equipmentBonus;
    const roll = Math.floor(Math.random() * 10) + 1;
    const total = roll + attributeValue;
    const success = total >= requiredValue;
    
    setLastRoll({ 
      roll, 
      baseValue,
      equipmentBonus,
      attributeValue, 
      total, 
      requiredValue, 
      success, 
      attribute 
    });
    setShowRoll(true);
    
    return { success, total };
  };

  const handleChoice = (choice) => {
    if (choice.requiredAttribute && choice.requiredValue) {
      const { success, total } = rollDice(choice.requiredAttribute, choice.requiredValue);
      
      setTimeout(() => {
        setShowRoll(false);
        if (success) {
          setTotalXP(prev => prev + (choice.xpBonus || 0));
          setReputationChange(prev => prev + 5); // Bonus reputation for success
          setDisciplineChange(prev => prev + 2); // Small discipline bonus
          
          if (choice.nextStep !== undefined) {
            if (choice.nextStep === -1) {
              setMissionComplete(true);
            } else {
              setCurrentStep(choice.nextStep);
            }
          } else {
            setMissionComplete(true);
          }
        } else {
          if (mission.difficulty === "Kobayashi Maru") {
            setMissionFailed(true);
            // Kobayashi Maru doesn't penalize reputation
            setReputationChange(prev => prev + 10); // Actually gains reputation for trying
          } else {
            setTotalXP(prev => Math.max(0, prev - 10));
            setReputationChange(prev => prev - 3); // Small reputation loss
            setDisciplineChange(prev => prev - 5); // Discipline penalty for failure
            
            if (choice.nextStep !== undefined && choice.nextStep !== -1) {
              setCurrentStep(choice.nextStep);
            } else {
              setMissionFailed(true);
            }
          }
        }
      }, 2000);
    } else {
      setTotalXP(prev => prev + (choice.xpBonus || 0));
      setReputationChange(prev => prev + 2); // Small reputation gain for progress
      
      if (choice.nextStep !== undefined) {
        if (choice.nextStep === -1) {
          setMissionComplete(true);
        } else {
          setCurrentStep(choice.nextStep);
        }
      } else {
        setMissionComplete(true);
      }
    }
  };

  const finishMission = () => {
    const finalXP = totalXP + (mission.xpReward || 0);
    const finalRepChange = missionComplete && !missionFailed 
      ? reputationChange + 10 
      : reputationChange;
    const finalDiscChange = missionComplete && !missionFailed
      ? disciplineChange + 5
      : disciplineChange;
      
    onComplete({
      xpGained: finalXP,
      success: missionComplete && !missionFailed,
      skillGained: missionComplete && !missionFailed ? mission.skillReward : null,
      reputationChange: finalRepChange,
      disciplineChange: finalDiscChange,
      missionId: mission.id,
      missionTitle: mission.title
    });
  };

  if (missionComplete || missionFailed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg"
        >
          <LCARSPanel 
            title={missionComplete ? "Missão Completa" : "Missão Falhou"} 
            color={missionComplete ? "green" : "red"}
          >
            <div className="text-center space-y-6">
              {missionComplete ? (
                <Trophy className="w-20 h-20 mx-auto text-amber-400" />
              ) : (
                <XCircle className="w-20 h-20 mx-auto text-red-400" />
              )}
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {missionComplete ? 'Excelente Trabalho, Cadete!' : 'Não foi dessa vez...'}
                </h2>
                <p className="text-slate-400">
                  {missionComplete 
                    ? 'Você completou a missão com sucesso.' 
                    : mission.difficulty === "Kobayashi Maru" 
                      ? 'O cenário sem vitória testou seu caráter.'
                      : 'Continue treinando para sua próxima missão.'}
                </p>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <Star className="w-6 h-6 mx-auto text-amber-400 mb-1" />
                  <p className="text-xl font-bold text-amber-400">
                    +{totalXP + (mission.xpReward || 0)}
                  </p>
                  <p className="text-xs text-slate-500">XP Ganho</p>
                </div>
                
                {missionComplete && mission.skillReward && (
                  <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                    <CheckCircle className="w-6 h-6 mx-auto text-green-400 mb-1" />
                    <p className="text-sm font-bold text-green-400">
                      {mission.skillReward}
                    </p>
                    <p className="text-xs text-slate-500">Nova Habilidade</p>
                  </div>
                )}
                
                <div className={cn(
                  "text-center p-3 rounded-xl border",
                  (reputationChange + (missionComplete ? 10 : 0)) >= 0
                    ? "bg-cyan-500/10 border-cyan-500/30"
                    : "bg-red-500/10 border-red-500/30"
                )}>
                  {(reputationChange + (missionComplete ? 10 : 0)) >= 0 
                    ? <TrendingUp className="w-6 h-6 mx-auto text-cyan-400 mb-1" />
                    : <TrendingDown className="w-6 h-6 mx-auto text-red-400 mb-1" />
                  }
                  <p className={cn(
                    "text-xl font-bold",
                    (reputationChange + (missionComplete ? 10 : 0)) >= 0 ? "text-cyan-400" : "text-red-400"
                  )}>
                    {(reputationChange + (missionComplete ? 10 : 0)) >= 0 ? '+' : ''}
                    {reputationChange + (missionComplete ? 10 : 0)}
                  </p>
                  <p className="text-xs text-slate-500">Reputação</p>
                </div>
                
                <div className={cn(
                  "text-center p-3 rounded-xl border",
                  (disciplineChange + (missionComplete ? 5 : 0)) >= 0
                    ? "bg-purple-500/10 border-purple-500/30"
                    : "bg-orange-500/10 border-orange-500/30"
                )}>
                  {(disciplineChange + (missionComplete ? 5 : 0)) >= 0 
                    ? <Award className="w-6 h-6 mx-auto text-purple-400 mb-1" />
                    : <AlertTriangle className="w-6 h-6 mx-auto text-orange-400 mb-1" />
                  }
                  <p className={cn(
                    "text-xl font-bold",
                    (disciplineChange + (missionComplete ? 5 : 0)) >= 0 ? "text-purple-400" : "text-orange-400"
                  )}>
                    {(disciplineChange + (missionComplete ? 5 : 0)) >= 0 ? '+' : ''}
                    {disciplineChange + (missionComplete ? 5 : 0)}
                  </p>
                  <p className="text-xs text-slate-500">Disciplina</p>
                </div>
              </div>

              <Button
                onClick={finishMission}
                className="bg-gradient-to-r from-cyan-500 to-blue-600"
              >
                Continuar <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </LCARSPanel>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <LCARSPanel title={mission.title} color="blue">
          <div className="space-y-6">
            {/* Mission Header */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
                className="text-slate-400"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Sair
              </Button>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400">{totalXP} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className={cn(
                    reputationChange >= 0 ? "text-cyan-400" : "text-red-400"
                  )}>
                    {reputationChange >= 0 ? '+' : ''}{reputationChange}
                  </span>
                </div>
              </div>
            </div>

            {/* Dice Roll Overlay */}
            <AnimatePresence>
              {showRoll && lastRoll && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                >
                  <div className="text-center space-y-4">
                    <motion.div
                      animate={{ rotateZ: [0, 360] }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    >
                      <Dice6 className="w-24 h-24 mx-auto text-cyan-400" />
                    </motion.div>
                    <div className="space-y-2">
                      <p className="text-slate-400">
                        Rolagem: {lastRoll.roll} + {lastRoll.attribute}: {lastRoll.baseValue}
                        {lastRoll.equipmentBonus > 0 && (
                          <span className="text-cyan-400"> (+{lastRoll.equipmentBonus} equip.)</span>
                        )}
                      </p>
                      <p className="text-3xl font-bold text-white">
                        Total: {lastRoll.total}
                      </p>
                      <p className="text-lg text-slate-400">
                        Necessário: {lastRoll.requiredValue}
                      </p>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 }}
                      >
                        {lastRoll.success ? (
                          <div className="flex items-center justify-center gap-2 text-green-400">
                            <CheckCircle className="w-8 h-8" />
                            <span className="text-2xl font-bold">SUCESSO!</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-red-400">
                            <XCircle className="w-8 h-8" />
                            <span className="text-2xl font-bold">FALHOU</span>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Narrative */}
            {step ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                      {step.text}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {step.choices?.map((choice, idx) => (
                      <Button
                        key={idx}
                        onClick={() => handleChoice(choice)}
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left h-auto py-4 px-6",
                          "border-slate-600 hover:border-cyan-400 hover:bg-cyan-500/10",
                          "text-slate-200 hover:text-white"
                        )}
                      >
                        <div className="space-y-1">
                          <p>{choice.text}</p>
                          {choice.requiredAttribute && (
                            <p className="text-xs text-cyan-400">
                              Teste: {choice.requiredAttribute} (dificuldade {choice.requiredValue})
                              {getEquipmentBonus(choice.requiredAttribute) > 0 && (
                                <span className="text-green-400 ml-2">
                                  +{getEquipmentBonus(choice.requiredAttribute)} de equipamento
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 mx-auto text-amber-400 mb-4" />
                <p className="text-slate-400">Esta missão não possui narrativa configurada.</p>
                <Button
                  onClick={() => setMissionComplete(true)}
                  className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600"
                >
                  Completar Missão
                </Button>
              </div>
            )}
          </div>
        </LCARSPanel>
      </div>
    </div>
  );
}
