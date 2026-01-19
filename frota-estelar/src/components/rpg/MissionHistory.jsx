import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { 
  History, CheckCircle, XCircle, Star, ChevronDown,
  TrendingUp, TrendingDown, Calendar, Award, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LCARSPanel from './LCARSPanel';

export default function MissionHistory({ history = [] }) {
  const [expandedId, setExpandedId] = useState(null);

  const successCount = history.filter(m => m.success).length;
  const failCount = history.filter(m => !m.success).length;
  const successRate = history.length > 0 
    ? Math.round((successCount / history.length) * 100) 
    : 0;

  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  return (
    <LCARSPanel title="Histórico de Missões" color="green" className="h-full">
      <div className="space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/30">
            <CheckCircle className="w-5 h-5 mx-auto text-green-400 mb-1" />
            <p className="text-xl font-bold text-green-400">{successCount}</p>
            <p className="text-[10px] text-slate-400 uppercase">Sucessos</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <XCircle className="w-5 h-5 mx-auto text-red-400 mb-1" />
            <p className="text-xl font-bold text-red-400">{failCount}</p>
            <p className="text-[10px] text-slate-400 uppercase">Falhas</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <Award className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
            <p className="text-xl font-bold text-cyan-400">{successRate}%</p>
            <p className="text-[10px] text-slate-400 uppercase">Taxa</p>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {sortedHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-slate-500">Nenhuma missão registrada</p>
              <p className="text-sm text-slate-600">Complete missões para ver seu histórico</p>
            </div>
          ) : (
            <AnimatePresence>
              {sortedHistory.map((mission, idx) => (
                <motion.div
                  key={`${mission.missionId}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "rounded-xl border transition-all overflow-hidden",
                    mission.success 
                      ? "bg-green-500/5 border-green-500/20" 
                      : "bg-red-500/5 border-red-500/20"
                  )}
                >
                  <button
                    onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                    className="w-full p-3 flex items-center gap-3 text-left"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      mission.success ? "bg-green-500/20" : "bg-red-500/20"
                    )}>
                      {mission.success 
                        ? <CheckCircle className="w-5 h-5 text-green-400" />
                        : <XCircle className="w-5 h-5 text-red-400" />
                      }
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {mission.missionTitle}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {mission.date && format(new Date(mission.date), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={cn(
                        mission.success 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-red-500/20 text-red-400"
                      )}>
                        {mission.success ? 'Sucesso' : 'Falha'}
                      </Badge>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-slate-500 transition-transform",
                        expandedId === idx && "rotate-180"
                      )} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedId === idx && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-1 border-t border-slate-800">
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div className="text-center p-2 rounded-lg bg-slate-800/50">
                              <div className="flex items-center justify-center gap-1">
                                <Star className="w-3 h-3 text-amber-400" />
                                <span className="text-sm font-bold text-amber-400">
                                  +{mission.xpGained || 0}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500">XP</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-slate-800/50">
                              <div className="flex items-center justify-center gap-1">
                                {(mission.reputationChange || 0) >= 0 
                                  ? <TrendingUp className="w-3 h-3 text-green-400" />
                                  : <TrendingDown className="w-3 h-3 text-red-400" />
                                }
                                <span className={cn(
                                  "text-sm font-bold",
                                  (mission.reputationChange || 0) >= 0 ? "text-green-400" : "text-red-400"
                                )}>
                                  {(mission.reputationChange || 0) >= 0 ? '+' : ''}{mission.reputationChange || 0}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500">Reputação</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-slate-800/50">
                              <div className="flex items-center justify-center gap-1">
                                {(mission.disciplineChange || 0) >= 0 
                                  ? <Award className="w-3 h-3 text-cyan-400" />
                                  : <AlertTriangle className="w-3 h-3 text-orange-400" />
                                }
                                <span className={cn(
                                  "text-sm font-bold",
                                  (mission.disciplineChange || 0) >= 0 ? "text-cyan-400" : "text-orange-400"
                                )}>
                                  {(mission.disciplineChange || 0) >= 0 ? '+' : ''}{mission.disciplineChange || 0}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500">Disciplina</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </LCARSPanel>
  );
}
