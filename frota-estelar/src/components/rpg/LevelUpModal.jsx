import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "../ui/button";
import { 
  Star, Sparkles, Brain, Heart, Swords, Zap, 
  ChevronUp, Check
} from 'lucide-react';
import LCARSPanel from './LCARSPanel';
import { cn } from "../../lib/utils";

const ATTRIBUTES = [
  { key: 'logic', label: 'Lógica', icon: Brain, color: 'blue' },
  { key: 'charisma', label: 'Carisma', icon: Heart, color: 'green' },
  { key: 'strength', label: 'Força', icon: Swords, color: 'red' },
  { key: 'agility', label: 'Agilidade', icon: Zap, color: 'orange' },
  { key: 'intelligence', label: 'Inteligência', icon: Sparkles, color: 'purple' }
];

export default function LevelUpModal({ 
  newLevel, 
  newRank, 
  pointsToSpend, 
  currentAttributes, 
  onConfirm, 
  onClose 
}) {
  const [allocatedPoints, setAllocatedPoints] = useState({
    logic: 0,
    charisma: 0,
    strength: 0,
    agility: 0,
    intelligence: 0
  });

  const remainingPoints = pointsToSpend - Object.values(allocatedPoints).reduce((a, b) => a + b, 0);

  const addPoint = (attr) => {
    if (remainingPoints > 0 && (currentAttributes[attr] + allocatedPoints[attr]) < 20) {
      setAllocatedPoints(prev => ({ ...prev, [attr]: prev[attr] + 1 }));
    }
  };

  const removePoint = (attr) => {
    if (allocatedPoints[attr] > 0) {
      setAllocatedPoints(prev => ({ ...prev, [attr]: prev[attr] - 1 }));
    }
  };

  const handleConfirm = () => {
    const newAttributes = {};
    ATTRIBUTES.forEach(({ key }) => {
      newAttributes[key] = currentAttributes[key] + allocatedPoints[key];
    });
    onConfirm(newAttributes, remainingPoints);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <LCARSPanel title="Subida de Nível!" color="purple">
          <div className="space-y-6">
            {/* Level Up Announcement */}
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Star className="w-16 h-16 mx-auto text-amber-400 fill-amber-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mt-4">Nível {newLevel}!</h2>
              {newRank && (
                <p className="text-purple-400 mt-1">Nova Patente: {newRank}</p>
              )}
            </div>

            {/* Points to Spend */}
            <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-400/30">
              <p className="text-sm text-slate-400">Pontos de Atributo Disponíveis</p>
              <p className="text-3xl font-bold text-purple-400">{remainingPoints}</p>
            </div>

            {/* Attribute Allocation */}
            <div className="space-y-3">
              {ATTRIBUTES.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    color === 'blue' && "bg-blue-500/20",
                    color === 'green' && "bg-green-500/20",
                    color === 'red' && "bg-red-500/20",
                    color === 'orange' && "bg-orange-500/20",
                    color === 'purple' && "bg-purple-500/20"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      color === 'blue' && "text-blue-400",
                      color === 'green' && "text-green-400",
                      color === 'red' && "text-red-400",
                      color === 'orange' && "text-orange-400",
                      color === 'purple' && "text-purple-400"
                    )} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-300">{label}</span>
                      <span className="text-sm text-white">
                        {currentAttributes[key]}
                        {allocatedPoints[key] > 0 && (
                          <span className="text-green-400"> +{allocatedPoints[key]}</span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          color === 'blue' && "bg-blue-500",
                          color === 'green' && "bg-green-500",
                          color === 'red' && "bg-red-500",
                          color === 'orange' && "bg-orange-500",
                          color === 'purple' && "bg-purple-500"
                        )}
                        style={{ width: `${((currentAttributes[key] + allocatedPoints[key]) / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removePoint(key)}
                      disabled={allocatedPoints[key] === 0}
                      className="w-8 h-8 p-0 border-slate-600"
                    >
                      -
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addPoint(key)}
                      disabled={remainingPoints === 0 || (currentAttributes[key] + allocatedPoints[key]) >= 20}
                      className="w-8 h-8 p-0 border-slate-600"
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onConfirm(currentAttributes, pointsToSpend)}
                className="flex-1 border-slate-600"
              >
                Guardar Pontos
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600"
              >
                <Check className="w-4 h-4 mr-2" /> Confirmar
              </Button>
            </div>
          </div>
        </LCARSPanel>
      </motion.div>
    </div>
  );
}
