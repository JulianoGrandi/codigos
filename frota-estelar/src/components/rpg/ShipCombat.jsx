import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, Shield, Zap, Target, AlertTriangle, 
  ChevronRight, Activity, Crosshair, Radio,
  Heart, Loader2, Award, Star, X
} from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { base44 } from '../../api/base44Client';
import { cn } from "../../lib/utils";

const ENEMY_TYPES = [
  { name: 'Caçador Orion', class: 'Raider', hull: 80, shields: 60, weapons: 2, difficulty: 1 },
  { name: 'Pássaro de Guerra Klingon', class: 'BirdOfPrey', hull: 100, shields: 80, weapons: 3, difficulty: 2 },
  { name: 'Warbird Romulano', class: 'Warbird', hull: 150, shields: 120, weapons: 4, difficulty: 3 },
  { name: 'Sonda Borg', class: 'Probe', hull: 200, shields: 150, weapons: 5, difficulty: 4 },
  { name: 'Cubo Borg', class: 'Cube', hull: 500, shields: 300, weapons: 8, difficulty: 5 }
];

const TACTICS = ['Agressivo', 'Defensivo', 'Evasivo', 'Balanceado'];

function StatusBar({ label, current, max, color, icon: Icon, critical = false }) {
  const percentage = (current / max) * 100;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          {Icon && <Icon className={cn("w-3 h-3", `text-${color}-400`)} />}
          <span className="text-slate-400">{label}</span>
        </div>
        <span className={cn(
          "font-mono",
          critical && percentage < 25 ? "text-red-400 animate-pulse" : `text-${color}-400`
        )}>
          {Math.round(current)}/{max}
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${Math.max(0, percentage)}%` }}
          className={cn(
            "h-full rounded-full",
            percentage < 25 ? "bg-red-500" : percentage < 50 ? "bg-amber-500" : `bg-${color}-500`
          )}
        />
      </div>
    </div>
  );
}

export default function ShipCombat({ 
  playerShip, 
  cadet,
  crew = [],
  enemyDifficulty = 1,
  onVictory,
  onDefeat,
  onRetreat
}) {
  const [combatPhase, setCombatPhase] = useState('intro'); // intro, player, enemy, result
  const [playerStats, setPlayerStats] = useState({
    hull: playerShip?.hull?.current || 100,
    hullMax: playerShip?.hull?.max || 100,
    shields: playerShip?.shields?.current || 100,
    shieldsMax: playerShip?.shields?.max || 100,
    power: playerShip?.power?.current || 100,
    powerMax: playerShip?.power?.max || 100
  });
  const [enemy, setEnemy] = useState(null);
  const [enemyStats, setEnemyStats] = useState({ hull: 100, shields: 100 });
  const [combatLog, setCombatLog] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rewards, setRewards] = useState(null);
  const [systemDamage, setSystemDamage] = useState({
    weapons: 0,
    shields: 0,
    engines: 0,
    sensors: 0
  });

  // Initialize combat
  useEffect(() => {
    const enemyType = ENEMY_TYPES.find(e => e.difficulty === enemyDifficulty) || ENEMY_TYPES[0];
    setEnemy(enemyType);
    setEnemyStats({
      hull: enemyType.hull,
      hullMax: enemyType.hull,
      shields: enemyType.shields,
      shieldsMax: enemyType.shields
    });
    
    setCombatLog([`Encontro hostil detectado: ${enemyType.name}!`]);
    
    setTimeout(() => setCombatPhase('player'), 2000);
  }, [enemyDifficulty]);

  const calculateDamage = (attacker, defender, isPlayer) => {
    const shipSystems = isPlayer ? playerShip?.systems : { weapons: enemy?.weapons || 1 };
    const weaponLevel = shipSystems?.weapons || 1;
    
    // Crew bonus
    const tacticalCrew = crew.find(c => c.assignedStation === 'tactical');
    const crewBonus = tacticalCrew ? (tacticalCrew.skills?.tactical || 1) * 2 : 0;
    
    // Cadet skill bonus
    const cadetBonus = isPlayer ? (cadet?.attributes?.strength || 5) : 0;
    
    const baseDamage = 10 + (weaponLevel * 5) + crewBonus + cadetBonus;
    const variance = Math.random() * 10 - 5;
    
    // Critical hit chance
    const critChance = isPlayer ? 0.15 : 0.1;
    const isCritical = Math.random() < critChance;
    
    let finalDamage = baseDamage + variance;
    if (isCritical) finalDamage *= 1.5;
    
    // System damage reduction
    const damageReduction = isPlayer ? systemDamage.weapons * 0.1 : 0;
    finalDamage *= (1 - damageReduction);
    
    return { damage: Math.round(finalDamage), critical: isCritical };
  };

  const applyDamage = (target, damage, isEnemy) => {
    if (isEnemy) {
      setEnemyStats(prev => {
        let remaining = damage;
        let newShields = prev.shields;
        let newHull = prev.hull;
        
        // Damage shields first
        if (newShields > 0) {
          const shieldDamage = Math.min(remaining, newShields);
          newShields -= shieldDamage;
          remaining -= shieldDamage;
        }
        
        // Remaining damage to hull
        if (remaining > 0) {
          newHull -= remaining;
        }
        
        return { ...prev, shields: Math.max(0, newShields), hull: Math.max(0, newHull) };
      });
    } else {
      setPlayerStats(prev => {
        let remaining = damage;
        let newShields = prev.shields;
        let newHull = prev.hull;
        
        if (newShields > 0) {
          const shieldDamage = Math.min(remaining, newShields);
          newShields -= shieldDamage;
          remaining -= shieldDamage;
        }
        
        if (remaining > 0) {
          newHull -= remaining;
          
          // Chance to damage systems
          if (Math.random() < 0.3) {
            const systems = ['weapons', 'shields', 'engines', 'sensors'];
            const damagedSystem = systems[Math.floor(Math.random() * systems.length)];
            setSystemDamage(sd => ({
              ...sd,
              [damagedSystem]: Math.min(sd[damagedSystem] + 1, 3)
            }));
            setCombatLog(log => [...log, `⚠️ Sistema de ${damagedSystem} danificado!`]);
          }
        }
        
        return { ...prev, shields: Math.max(0, newShields), hull: Math.max(0, newHull) };
      });
    }
  };

  const playerAction = async (action) => {
    setIsProcessing(true);
    setSelectedAction(action);
    
    await new Promise(r => setTimeout(r, 500));
    
    switch (action) {
      case 'attack': {
        const { damage, critical } = calculateDamage(playerShip, enemy, true);
        applyDamage('enemy', damage, true);
        setCombatLog(log => [
          ...log, 
          `🎯 Você dispara! ${critical ? 'CRÍTICO! ' : ''}${damage} de dano.`
        ]);
        break;
      }
      case 'shields': {
        const shieldRecharge = 20 + (playerShip?.systems?.shields || 1) * 5;
        setPlayerStats(prev => ({
          ...prev,
          shields: Math.min(prev.shieldsMax, prev.shields + shieldRecharge),
          power: Math.max(0, prev.power - 15)
        }));
        setCombatLog(log => [...log, `🛡️ Escudos recarregados (+${shieldRecharge}).`]);
        break;
      }
      case 'evasive': {
        // Next enemy attack has reduced accuracy
        setCombatLog(log => [...log, `↪️ Manobra evasiva! Próximo ataque inimigo reduzido.`]);
        break;
      }
      case 'scan': {
        setCombatLog(log => [...log, `📡 Escaneando inimigo... Casco: ${enemyStats.hull}/${enemy?.hull}, Escudos: ${enemyStats.shields}/${enemy?.shields}`]);
        break;
      }
    }
    
    await new Promise(r => setTimeout(r, 800));
    
    // Check victory
    if (enemyStats.hull <= 0) {
      handleVictory();
      return;
    }
    
    setCombatPhase('enemy');
    setIsProcessing(false);
    
    // Enemy turn
    await enemyTurn();
  };

  const enemyTurn = async () => {
    await new Promise(r => setTimeout(r, 1000));
    
    const enemyAction = Math.random();
    const { damage, critical } = calculateDamage(enemy, playerShip, false);
    
    // Reduced damage if player used evasive
    const actualDamage = selectedAction === 'evasive' ? Math.round(damage * 0.5) : damage;
    
    applyDamage('player', actualDamage, false);
    setCombatLog(log => [
      ...log,
      `💥 ${enemy?.name} ataca! ${critical ? 'CRÍTICO! ' : ''}${actualDamage} de dano.`
    ]);
    
    await new Promise(r => setTimeout(r, 500));
    
    // Check defeat
    if (playerStats.hull <= actualDamage) {
      handleDefeat();
      return;
    }
    
    setSelectedAction(null);
    setCombatPhase('player');
  };

  const handleVictory = async () => {
    setCombatPhase('result');
    
    const xpGained = 50 + (enemy?.difficulty || 1) * 30;
    const creditsGained = 25 + (enemy?.difficulty || 1) * 25;
    
    setRewards({
      victory: true,
      xp: xpGained,
      credits: creditsGained,
      items: Math.random() > 0.7 ? ['Componente Alienígena'] : []
    });
    
    setCombatLog(log => [...log, `🎉 VITÓRIA! ${enemy?.name} destruído!`]);
  };

  const handleDefeat = () => {
    setCombatPhase('result');
    setRewards({ victory: false });
    setCombatLog(log => [...log, `💀 Nave criticamente danificada. Evacuação de emergência!`]);
  };

  const finishCombat = () => {
    if (rewards?.victory) {
      onVictory(rewards);
    } else {
      onDefeat();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950">
      {/* Starfield Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <header className="p-4 border-b border-red-500/30 bg-slate-900/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
              <h1 className="text-xl font-bold text-red-400">ALERTA VERMELHO</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetreat}
              disabled={isProcessing || combatPhase === 'result'}
              className="text-amber-400"
            >
              Recuar
            </Button>
          </div>
        </header>

        {/* Combat Area */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="grid lg:grid-cols-3 gap-4 h-full">
            {/* Player Ship */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{playerShip?.name || 'Sua Nave'}</h3>
                    <p className="text-xs text-slate-400">Classe {playerShip?.class}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <StatusBar label="Casco" current={playerStats.hull} max={playerStats.hullMax} color="slate" icon={Shield} critical />
                  <StatusBar label="Escudos" current={playerStats.shields} max={playerStats.shieldsMax} color="cyan" icon={Activity} />
                  <StatusBar label="Energia" current={playerStats.power} max={playerStats.powerMax} color="amber" icon={Zap} />
                </div>
                
                {/* System Damage */}
                {Object.entries(systemDamage).some(([_, v]) => v > 0) && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-xs text-red-400 font-semibold mb-2">AVARIAS:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(systemDamage).map(([sys, level]) => level > 0 && (
                        <Badge key={sys} className="bg-red-500/20 text-red-400">
                          {sys}: -{level * 10}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Battle View */}
            <div className="flex flex-col">
              {/* Combat Log */}
              <div className="flex-1 p-4 rounded-xl bg-slate-900/80 border border-slate-700 overflow-hidden">
                <h4 className="text-sm font-semibold text-slate-400 mb-3">LOG DE COMBATE</h4>
                <div className="h-48 overflow-y-auto space-y-2">
                  <AnimatePresence>
                    {combatLog.map((log, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm text-slate-300"
                      >
                        {log}
                      </motion.p>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Actions */}
              {combatPhase === 'player' && !isProcessing && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => playerAction('attack')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Crosshair className="w-4 h-4 mr-2" />
                    Atacar
                  </Button>
                  <Button
                    onClick={() => playerAction('shields')}
                    disabled={playerStats.power < 15}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Escudos
                  </Button>
                  <Button
                    onClick={() => playerAction('evasive')}
                    variant="outline"
                    className="border-amber-500/50 text-amber-400"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Evasiva
                  </Button>
                  <Button
                    onClick={() => playerAction('scan')}
                    variant="outline"
                    className="border-purple-500/50 text-purple-400"
                  >
                    <Radio className="w-4 h-4 mr-2" />
                    Escanear
                  </Button>
                </div>
              )}

              {(combatPhase === 'enemy' || isProcessing) && (
                <div className="mt-4 p-4 rounded-xl bg-slate-800/50 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-red-400 mx-auto mb-2" />
                  <p className="text-slate-400">
                    {isProcessing ? 'Processando...' : 'Turno do inimigo...'}
                  </p>
                </div>
              )}
            </div>

            {/* Enemy Ship */}
            <div className="space-y-4">
              {enemy && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-red-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-400">{enemy.name}</h3>
                      <p className="text-xs text-slate-400">Classe {enemy.class}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <StatusBar label="Casco" current={enemyStats.hull} max={enemyStats.hullMax} color="red" icon={Shield} critical />
                    <StatusBar label="Escudos" current={enemyStats.shields} max={enemyStats.shieldsMax} color="orange" icon={Activity} />
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Nível de Ameaça</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn(
                          "w-4 h-4",
                          i < enemy.difficulty ? "text-red-400 fill-red-400" : "text-slate-700"
                        )} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result Modal */}
        <AnimatePresence>
          {combatPhase === 'result' && rewards && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 z-20"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={cn(
                  "w-full max-w-md p-6 rounded-2xl border-2",
                  rewards.victory 
                    ? "bg-slate-900 border-emerald-500/50" 
                    : "bg-slate-900 border-red-500/50"
                )}
              >
                <div className="text-center">
                  {rewards.victory ? (
                    <>
                      <Award className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
                      <h2 className="text-2xl font-bold text-emerald-400 mb-2">VITÓRIA!</h2>
                      <p className="text-slate-400 mb-6">{enemy?.name} foi destruído.</p>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10">
                          <span className="text-slate-400">XP Ganho</span>
                          <span className="text-emerald-400 font-bold">+{rewards.xp}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10">
                          <span className="text-slate-400">Créditos</span>
                          <span className="text-amber-400 font-bold">+{rewards.credits}₡</span>
                        </div>
                        {rewards.items?.length > 0 && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10">
                            <span className="text-slate-400">Itens</span>
                            <span className="text-purple-400">{rewards.items.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <X className="w-16 h-16 mx-auto mb-4 text-red-400" />
                      <h2 className="text-2xl font-bold text-red-400 mb-2">DERROTA</h2>
                      <p className="text-slate-400 mb-6">Sua nave foi criticamente danificada.</p>
                    </>
                  )}
                  
                  <Button
                    onClick={finishCombat}
                    className={cn(
                      "w-full",
                      rewards.victory 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                        : "bg-gradient-to-r from-slate-600 to-slate-700"
                    )}
                  >
                    Continuar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
