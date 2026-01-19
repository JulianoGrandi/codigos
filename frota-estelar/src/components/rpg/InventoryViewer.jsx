import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Package, Crosshair, Shirt, Gem, Wrench, Award,
  X, ChevronRight, Filter, Search
} from 'lucide-react';
import { Input } from "../ui/input";
import LCARSPanel from './LCARSPanel';

const TYPE_ICONS = {
  weapon: Crosshair,
  uniform: Shirt,
  accessory: Gem,
  tool: Wrench,
  badge: Award
};

const RARITY_COLORS = {
  comum: { bg: "bg-slate-700", text: "text-slate-300", border: "border-slate-600" },
  incomum: { bg: "bg-green-900/50", text: "text-green-400", border: "border-green-600" },
  raro: { bg: "bg-blue-900/50", text: "text-blue-400", border: "border-blue-600" },
  épico: { bg: "bg-purple-900/50", text: "text-purple-400", border: "border-purple-600" },
  lendário: { bg: "bg-amber-900/50", text: "text-amber-400", border: "border-amber-600" }
};

export default function InventoryViewer({ 
  inventory = [], 
  equippedItems = {},
  onEquip, 
  onClose 
}) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredInventory = inventory.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const isEquipped = (item) => {
    const equipped = equippedItems[item.type];
    return equipped?.id === item.id;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <LCARSPanel title="Inventário" color="purple">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300">{inventory.length} itens</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Buscar item..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700"
                />
              </div>
              <div className="flex gap-1">
                {['all', 'weapon', 'uniform', 'accessory', 'tool', 'badge'].map((type) => {
                  const Icon = type === 'all' ? Filter : TYPE_ICONS[type];
                  return (
                    <Button
                      key={type}
                      size="sm"
                      variant={filter === type ? "default" : "outline"}
                      onClick={() => setFilter(type)}
                      className={cn(
                        "h-9",
                        filter === type 
                          ? "bg-purple-600 hover:bg-purple-500" 
                          : "border-slate-700 text-slate-400"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto pr-2">
              <AnimatePresence>
                {filteredInventory.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                    <p className="text-slate-500">Nenhum item encontrado</p>
                  </div>
                ) : (
                  filteredInventory.map((item, idx) => {
                    const Icon = TYPE_ICONS[item.type] || Gem;
                    const equipped = isEquipped(item);
                    const colors = RARITY_COLORS[item.rarity] || RARITY_COLORS.comum;
                    
                    return (
                      <motion.button
                        key={item.id || idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.02 }}
                        onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                        className={cn(
                          "relative p-3 rounded-xl border-2 transition-all text-left",
                          "hover:scale-105",
                          colors.border,
                          colors.bg,
                          selectedItem?.id === item.id && "ring-2 ring-purple-500"
                        )}
                      >
                        {equipped && (
                          <div className="absolute top-1 right-1">
                            <Badge className="bg-cyan-600 text-[9px] px-1 py-0">E</Badge>
                          </div>
                        )}
                        <Icon className={cn("w-8 h-8 mx-auto mb-2", colors.text)} />
                        <p className="text-xs text-white font-medium text-center line-clamp-2">
                          {item.name}
                        </p>
                        <p className={cn("text-[10px] text-center mt-1 capitalize", colors.text)}>
                          {item.rarity}
                        </p>
                      </motion.button>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Selected Item Details */}
            <AnimatePresence>
              {selectedItem && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className={cn(
                    "p-4 rounded-xl border-2",
                    RARITY_COLORS[selectedItem.rarity]?.border || "border-slate-600",
                    RARITY_COLORS[selectedItem.rarity]?.bg || "bg-slate-800/50"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {React.createElement(TYPE_ICONS[selectedItem.type] || Gem, {
                            className: cn("w-5 h-5", RARITY_COLORS[selectedItem.rarity]?.text)
                          })}
                          <h3 className={cn(
                            "font-bold",
                            RARITY_COLORS[selectedItem.rarity]?.text
                          )}>
                            {selectedItem.name}
                          </h3>
                          <Badge className={cn(
                            "capitalize text-[10px]",
                            RARITY_COLORS[selectedItem.rarity]?.bg
                          )}>
                            {selectedItem.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">{selectedItem.description}</p>
                        
                        {selectedItem.stats && Object.keys(selectedItem.stats).length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {Object.entries(selectedItem.stats).map(([stat, value]) => (
                              <span 
                                key={stat}
                                className="px-2 py-1 text-xs rounded bg-slate-800 text-cyan-400"
                              >
                                +{value} {stat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => {
                          onEquip(selectedItem);
                          setSelectedItem(null);
                        }}
                        disabled={isEquipped(selectedItem)}
                        className={cn(
                          "shrink-0",
                          isEquipped(selectedItem)
                            ? "bg-slate-700 text-slate-400"
                            : "bg-gradient-to-r from-purple-500 to-indigo-600"
                        )}
                      >
                        {isEquipped(selectedItem) ? 'Equipado' : 'Equipar'}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </LCARSPanel>
      </motion.div>
    </motion.div>
  );
}
