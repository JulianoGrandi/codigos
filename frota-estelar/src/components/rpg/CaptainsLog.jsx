import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { 
  BookOpen, Plus, Calendar, ChevronRight, X,
  Mic, Save
} from 'lucide-react';
import LCARSPanel from './LCARSPanel';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CaptainsLog({ entries = [], onAddEntry }) {
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });
  const [selectedEntry, setSelectedEntry] = useState(null);

  const handleSave = () => {
    if (newEntry.title && newEntry.content) {
      onAddEntry({
        ...newEntry,
        date: new Date().toISOString()
      });
      setNewEntry({ title: '', content: '' });
      setShowForm(false);
    }
  };

  return (
    <LCARSPanel title="Diário de Bordo" color="orange" className="h-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="text-slate-300">{entries.length} registros</span>
          </div>
          <Button
            size="sm"
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-600"
          >
            <Plus className="w-4 h-4 mr-1" /> Nova Entrada
          </Button>
        </div>

        {/* New Entry Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-slate-800/50 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 text-sm">
                  <Mic className="w-4 h-4" />
                  <span>Data Estelar: {format(new Date(), 'yyyy.MM.dd', { locale: ptBR })}</span>
                </div>
                <Input
                  placeholder="Título do registro..."
                  value={newEntry.title}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-slate-900/50 border-slate-700"
                />
                <Textarea
                  placeholder="Registro pessoal do cadete..."
                  value={newEntry.content}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                  className="bg-slate-900/50 border-slate-700 min-h-[100px]"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="border-slate-600"
                  >
                    <X className="w-4 h-4 mr-1" /> Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-amber-500 hover:bg-amber-400"
                  >
                    <Save className="w-4 h-4 mr-1" /> Salvar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entries List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum registro ainda.</p>
              <p className="text-sm">Comece seu diário de bordo!</p>
            </div>
          ) : (
            entries.slice().reverse().map((entry, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedEntry(selectedEntry === idx ? null : idx)}
                className="w-full text-left p-3 rounded-xl bg-slate-800/30 border border-slate-700 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{entry.title}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      {entry.date && format(new Date(entry.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${selectedEntry === idx ? 'rotate-90' : ''}`} />
                </div>
                
                <AnimatePresence>
                  {selectedEntry === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-slate-700"
                    >
                      <p className="text-sm text-slate-400 whitespace-pre-line">
                        {entry.content}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))
          )}
        </div>
      </div>
    </LCARSPanel>
  );
}
