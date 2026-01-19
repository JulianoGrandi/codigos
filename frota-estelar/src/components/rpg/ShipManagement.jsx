import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, Shield, Zap, Radio, Heart, Settings, 
  ChevronUp, ChevronDown, AlertTriangle, Check,
  Gauge, Activity, CircleDot, Users, Package
} from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { cn } from "../../lib/utils";
import LCARSPanel from './LCARSPanel';

const STATIONS = [
  { id: 'helm', name: 'Pilotagem', icon: Rocket, color: 'cyan' },
  { id: 'tactical', name: 'Tático', icon: Shield, color: 'red' },
  { id: 'engineering', name: 'Engenharia', icon: Settings, color: 'orange' },
  { id: 'science', name: 'Ciência', icon: Radio, color: 'blue' },
  { id: 'medical', name: 'Médico', icon: Heart, color: 'green' }
];

const SYSTEM_CONFIG = {
  weapons: { name: 'Armas', icon: Shield, color: 'red' },
  shields: { name: 'Escudos', icon: CircleDot, color: 'cyan' },
  engines: { name: 'Motores', icon: Rocket, color: 'orange' },
  sensors: { name: 'Sensores', icon: Radio, color: 'purple' },
  lifesupport: { name: 'Suporte Vital', icon: Heart, color: 'green' }
};

function StatusBar({ label, current, max, color = 'cyan', icon: Icon }) {
  const percentage = (current / max) * 100;
  const isLow = percentage < 30;
  const isCritical = percentage < 15;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={cn("w-4 h-4", `text-${color}-400`)} />}
          <span className="text-slate-400">{label}</span>
        </div>
        <span className={cn(
          "font-mono",
          isCritical ? "text-red-400 animate-pulse" : isLow ? "text-amber-400" : `text-${color}-400`
        )}>
          {current}/{max}
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn(
            "h-full rounded-full",
            isCritical ? "bg-red-500" : isLow ? "bg-amber-500" : `bg-${color}-500`
          )}
        />
      </div>
    </div>
  );
}

function SystemLevel({ system, level, onUpgrade, canUpgrade, upgradeCost }) {
  const config = SYSTEM_CONFIG[system];
  const Icon = config.icon;
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `bg-${config.color}-500/20`)}>
          <Icon className={cn("w-5 h-5", `text-${config.color}-400`)} />
        </div>
        <div>
          <p className="font-medium text-white">{config.name}</p>
          <div className="flex gap-0.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-4 h-1.5 rounded-full",
                  i < level ? `bg-${config.color}-400` : "bg-slate-700"
                )}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">Nv. {level}</span>
        {level < 5 && (
          <Button
            size="sm"
            variant="outline"
            disabled={!canUpgrade}
            onClick={() => onUpgrade(system)}
            className={cn(
              "text-xs border-slate-700",
              canUpgrade && `border-${config.color}-500/50 text-${config.color}-400`
            )}
          >
            <ChevronUp className="w-3 h-3 mr-1" />
            {upgradeCost}₡
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ShipManagement({ ship, onUpdateShip, credits = 0, onSpendCredits }) {
  const [activeTab, setActiveTab] = useState('status');
  const [selectedStation, setSelectedStation] = useState(null);

  if (!ship) {
    return (
      <LCARSPanel title="Nave" color="cyan">
        <div className="text-center py-12">
          <Rocket className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Sem nave atribuída</h3>
          <p className="text-slate-400 text-sm">
            Complete mais missões para receber sua primeira nave.
          </p>
        </div>
      </LCARSPanel>
    );
  }

  const hull = ship.hull || { current: 100, max: 100 };
  const shields = ship.shields || { current: 100, max: 100 };
  const power = ship.power || { current: 100, max: 100 };
  const warpCore = ship.warpCore || { status: 'Online', efficiency: 100 };
  const systems = ship.systems || { weapons: 1, shields: 1, engines: 1, sensors: 1, lifesupport: 1 };
  const crew = ship.crew || [];

  const getUpgradeCost = (system, currentLevel) => {
    return (currentLevel + 1) * 100;
  };

  const handleUpgrade = async (system) => {
    const currentLevel = systems[system] || 1;
    const cost = getUpgradeCost(system, currentLevel);
    
    if (credits >= cost && currentLevel < 5) {
      const newSystems = { ...systems, [system]: currentLevel + 1 };
      await onUpdateShip({ systems: newSystems });
      await onSpendCredits(cost);
    }
  };

  const warpStatusColor = {
    'Online': 'emerald',
    'Offline': 'slate',
    'Damaged': 'amber',
    'Critical': 'red'
  }[warpCore.status];

  return (
    <LCARSPanel title={`${ship.name} - ${ship.registry || 'NCC-????'}`} color="cyan">
      <div className="space-y-6">
        {/* Ship Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{ship.name}</h2>
              <p className="text-sm text-slate-400">Classe {ship.class}</p>
              <Badge className={cn("mt-1", `bg-${warpStatusColor}-500/20 text-${warpStatusColor}-400`)}>
                Warp Core: {warpCore.status}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Créditos</p>
            <p className="text-2xl font-bold text-amber-400">{credits}₡</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          {['status', 'systems', 'crew'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {tab === 'status' && 'Status'}
              {tab === 'systems' && 'Sistemas'}
              {tab === 'crew' && 'Tripulação'}
            </button>
          ))}
        </div>

        {/* Status Tab */}
        {activeTab === 'status' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <StatusBar 
              label="Casco" 
              current={hull.current} 
              max={hull.max} 
              color="slate" 
              icon={Shield} 
            />
            <StatusBar 
              label="Escudos" 
              current={shields.current} 
              max={shields.max} 
              color="cyan" 
              icon={CircleDot} 
            />
            <StatusBar 
              label="Energia" 
              current={power.current} 
              max={power.max} 
              color="amber" 
              icon={Zap} 
            />
            
            {/* Warp Core Status */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className={cn("w-5 h-5", `text-${warpStatusColor}-400`)} />
                  <span className="font-medium text-white">Núcleo de Dobra</span>
                </div>
                <Badge className={cn(`bg-${warpStatusColor}-500/20 text-${warpStatusColor}-400`)}>
                  {warpCore.efficiency}% Eficiência
                </Badge>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${warpCore.efficiency}%` }}
                  className={cn("h-full", `bg-${warpStatusColor}-500`)}
                />
              </div>
            </div>

            {/* Cargo */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">Carga</span>
              </div>
              <span className="text-white font-mono">
                {ship.cargo?.used || 0}/{ship.cargo?.capacity || 50}
              </span>
            </div>
          </motion.div>
        )}

        {/* Systems Tab */}
        {activeTab === 'systems' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {Object.keys(SYSTEM_CONFIG).map(system => (
              <SystemLevel
                key={system}
                system={system}
                level={systems[system] || 1}
                onUpgrade={handleUpgrade}
                canUpgrade={credits >= getUpgradeCost(system, systems[system] || 1)}
                upgradeCost={getUpgradeCost(system, systems[system] || 1)}
              />
            ))}
          </motion.div>
        )}

        {/* Crew Tab */}
        {activeTab === 'crew' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {STATIONS.map(station => {
                const assignedCrew = crew.find(c => c.station === station.id);
                const Icon = station.icon;
                
                return (
                  <div
                    key={station.id}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all cursor-pointer",
                      assignedCrew
                        ? `border-${station.color}-500/50 bg-${station.color}-500/10`
                        : "border-slate-700 bg-slate-800/50 border-dashed"
                    )}
                    onClick={() => setSelectedStation(station.id)}
                  >
                    <Icon className={cn("w-6 h-6 mb-2", `text-${station.color}-400`)} />
                    <p className="text-sm font-medium text-white">{station.name}</p>
                    {assignedCrew ? (
                      <p className="text-xs text-slate-400 mt-1">{assignedCrew.name}</p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">Vago</p>
                    )}
                  </div>
                );
              })}
            </div>

            {crew.length === 0 && (
              <div className="text-center py-6">
                <Users className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                <p className="text-slate-400 text-sm">
                  Nenhum tripulante disponível ainda.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </LCARSPanel>
  );
}
