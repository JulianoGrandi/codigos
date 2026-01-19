import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Gem, Zap, Database, Leaf, Star,
  Grid3X3, List, Search, Filter, X, Info
} from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import LCARSPanel from './LCARSPanel';

const TYPE_CONFIG = {
  'Material': { icon: Package, color: 'slate' },
  'Componente': { icon: Zap, color: 'orange' },
  'Energia': { icon: Zap, color: 'amber' },
  'Dados': { icon: Database, color: 'cyan' },
  'Biológico': { icon: Leaf, color: 'green' },
  'Raro': { icon: Gem, color: 'purple' }
};

const RARITY_COLORS = {
  'Comum': 'slate',
  'Incomum': 'green',
  'Raro': 'blue',
  'Épico': 'purple',
  'Lendário': 'amber'
};

function ResourceItem({ resource, quantity, onClick, compact = false }) {
  const typeConfig = TYPE_CONFIG[resource.type] || TYPE_CONFIG['Material'];
  const Icon = typeConfig.icon;
  const rarityColor = RARITY_COLORS[resource.rarity] || 'slate';

  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={onClick}
        className={cn(
          "relative p-3 rounded-xl border-2 cursor-pointer transition-all hover:scale-105",
          `border-${rarityColor}-500/30 bg-${rarityColor}-500/10`
        )}
      >
        <div className="flex flex-col items-center gap-1">
          <Icon className={cn("w-6 h-6", `text-${typeConfig.color}-400`)} />
          <span className="text-xs text-white text-center truncate w-full">{resource.name}</span>
        </div>
        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700">
          <span className="text-xs font-bold text-white">{quantity}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-slate-800/50",
        `border-${rarityColor}-500/30`
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center",
        `bg-${typeConfig.color}-500/20`
      )}>
        <Icon className={cn("w-6 h-6", `text-${typeConfig.color}-400`)} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-white">{resource.name}</p>
        <p className="text-xs text-slate-400">{resource.type}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-white">{quantity}</p>
        <Badge className={cn("text-xs", `bg-${rarityColor}-500/20 text-${rarityColor}-400`)}>
          {resource.rarity}
        </Badge>
      </div>
    </motion.div>
  );
}

function ResourceDetail({ resource, quantity, onClose, onUse }) {
  const typeConfig = TYPE_CONFIG[resource.type] || TYPE_CONFIG['Material'];
  const Icon = typeConfig.icon;
  const rarityColor = RARITY_COLORS[resource.rarity] || 'slate';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-md rounded-2xl border-2 overflow-hidden bg-slate-900",
          `border-${rarityColor}-500/50`
        )}
      >
        <div className={cn("p-6", `bg-${typeConfig.color}-500/10`)}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center",
                `bg-${typeConfig.color}-500/20`
              )}>
                <Icon className={cn("w-8 h-8", `text-${typeConfig.color}-400`)} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{resource.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={cn(`bg-${rarityColor}-500/20 text-${rarityColor}-400`)}>
                    {resource.rarity}
                  </Badge>
                  <span className="text-sm text-slate-400">{resource.type}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-300">{resource.description || "Um recurso útil para crafting."}</p>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
            <span className="text-slate-400">Quantidade</span>
            <span className="text-2xl font-bold text-white">{quantity}</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
            <span className="text-slate-400">Valor</span>
            <span className="text-lg font-bold text-amber-400">{resource.value || 10}₡</span>
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 border-slate-600">
            Fechar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function InventorySystem({ inventory, resources = [], onUpdateInventory }) {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);

  const inventoryResources = inventory?.resources || [];
  
  // Map inventory to resources with details
  const inventoryWithDetails = inventoryResources.map(inv => {
    const resourceDetails = resources.find(r => r.id === inv.resourceId) || {
      name: inv.resourceName,
      type: 'Material',
      rarity: 'Comum'
    };
    return {
      ...resourceDetails,
      quantity: inv.quantity
    };
  });

  // Filter resources
  const filteredResources = inventoryWithDetails.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalSlots = inventory?.maxSlots || 50;
  const usedSlots = inventoryResources.length;

  return (
    <LCARSPanel title="Inventário" color="purple">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            <span className="text-slate-400">
              {usedSlots}/{totalSlots} slots
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'text-purple-400' : 'text-slate-500'}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'text-purple-400' : 'text-slate-500'}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Buscar recursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-800/50 border-slate-700"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm"
          >
            <option value="all">Todos</option>
            {Object.keys(TYPE_CONFIG).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Resources */}
        {filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchTerm || filterType !== 'all' ? 'Nenhum resultado' : 'Inventário vazio'}
            </h3>
            <p className="text-slate-400 text-sm">
              Colete recursos durante missões.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {filteredResources.map((resource, index) => (
              <ResourceItem
                key={index}
                resource={resource}
                quantity={resource.quantity}
                compact
                onClick={() => setSelectedResource(resource)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredResources.map((resource, index) => (
              <ResourceItem
                key={index}
                resource={resource}
                quantity={resource.quantity}
                onClick={() => setSelectedResource(resource)}
              />
            ))}
          </div>
        )}

        {/* Resource Detail Modal */}
        <AnimatePresence>
          {selectedResource && (
            <ResourceDetail
              resource={selectedResource}
              quantity={selectedResource.quantity}
              onClose={() => setSelectedResource(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </LCARSPanel>
  );
}
