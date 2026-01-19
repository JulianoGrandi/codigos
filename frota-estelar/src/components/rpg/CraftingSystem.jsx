import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hammer, Sparkles, Loader2, Check, X, ChevronRight,
  Package, Shield, Rocket, Zap, FlaskConical, Star
} from 'lucide-react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { base44 } from '../../api/base44Client';
import { cn } from "../../lib/utils";
import LCARSPanel from './LCARSPanel';

const CATEGORY_CONFIG = {
  'Equipamento': { icon: Shield, color: 'cyan' },
  'Consumível': { icon: FlaskConical, color: 'green' },
  'Upgrade de Nave': { icon: Rocket, color: 'orange' },
  'Módulo': { icon: Zap, color: 'purple' },
  'Especial': { icon: Star, color: 'amber' }
};

const RARITY_COLORS = {
  'Comum': 'slate',
  'Incomum': 'green',
  'Raro': 'blue',
  'Épico': 'purple',
  'Lendário': 'amber'
};

function RecipeCard({ recipe, inventory, cadetLevel, onCraft }) {
  const categoryConfig = CATEGORY_CONFIG[recipe.category] || CATEGORY_CONFIG['Equipamento'];
  const Icon = categoryConfig.icon;
  const rarityColor = RARITY_COLORS[recipe.rarity] || 'slate';

  // Check if we have all ingredients
  const canCraft = recipe.ingredients?.every(ing => {
    const owned = inventory?.resources?.find(r => r.resourceId === ing.resourceId || r.resourceName === ing.resourceName);
    return owned && owned.quantity >= ing.quantity;
  }) && cadetLevel >= (recipe.requiredLevel || 1);

  const meetsLevel = cadetLevel >= (recipe.requiredLevel || 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl border-2 transition-all",
        canCraft
          ? `border-${rarityColor}-500/50 bg-${rarityColor}-500/10`
          : "border-slate-700 bg-slate-800/50 opacity-60"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          `bg-${categoryConfig.color}-500/20`
        )}>
          <Icon className={cn("w-6 h-6", `text-${categoryConfig.color}-400`)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-white">{recipe.resultName}</h3>
            <Badge className={cn("text-xs", `bg-${rarityColor}-500/20 text-${rarityColor}-400`)}>
              {recipe.rarity}
            </Badge>
          </div>
          
          <p className="text-xs text-slate-400 mt-1">{recipe.category}</p>
          
          {/* Ingredients */}
          <div className="mt-3 space-y-1">
            {recipe.ingredients?.map((ing, i) => {
              const owned = inventory?.resources?.find(r => r.resourceId === ing.resourceId || r.resourceName === ing.resourceName);
              const hasEnough = owned && owned.quantity >= ing.quantity;
              
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className={hasEnough ? "text-slate-300" : "text-red-400"}>
                    {ing.resourceName}
                  </span>
                  <span className={cn(
                    "font-mono",
                    hasEnough ? "text-emerald-400" : "text-red-400"
                  )}>
                    {owned?.quantity || 0}/{ing.quantity}
                  </span>
                </div>
              );
            })}
          </div>

          {!meetsLevel && (
            <p className="text-xs text-amber-400 mt-2">
              Requer nível {recipe.requiredLevel}
            </p>
          )}
        </div>

        <Button
          size="sm"
          disabled={!canCraft}
          onClick={() => onCraft(recipe)}
          className={cn(
            "shrink-0",
            canCraft && `bg-${categoryConfig.color}-500 hover:bg-${categoryConfig.color}-600`
          )}
        >
          <Hammer className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

export default function CraftingSystem({ 
  recipes = [], 
  inventory, 
  resources = [],
  cadetLevel = 1,
  onCraft,
  onGenerateRecipe 
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [craftingRecipe, setCraftingRecipe] = useState(null);

  const categories = ['all', ...Object.keys(CATEGORY_CONFIG)];

  const filteredRecipes = recipes.filter(r => 
    selectedCategory === 'all' || r.category === selectedCategory
  );

  const handleGenerateRecipe = async () => {
    setIsGenerating(true);
    
    try {
      // Get available resources for context
      const availableResources = inventory?.resources?.map(r => {
        const details = resources.find(res => res.id === r.resourceId);
        return { name: r.resourceName || details?.name, quantity: r.quantity };
      }) || [];

      const prompt = `Você é um engenheiro da Frota Estelar criando receitas de crafting.

RECURSOS DISPONÍVEIS DO JOGADOR:
${availableResources.map(r => `- ${r.name}: ${r.quantity}`).join('\n') || 'Nenhum recurso'}

Crie UMA receita de crafting interessante que use alguns dos recursos disponíveis (ou recursos comuns).
A receita deve ser temática de Star Trek.

Retorne um JSON:
{
  "name": "Nome do item resultante",
  "description": "Descrição do item",
  "category": "Equipamento" | "Consumível" | "Upgrade de Nave" | "Módulo" | "Especial",
  "ingredients": [
    { "resourceName": "nome do recurso", "quantity": numero }
  ],
  "resultName": "Nome do item",
  "rarity": "Comum" | "Incomum" | "Raro" | "Épico",
  "requiredLevel": numero (1-10),
  "effect": "Descrição do efeito do item"
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            ingredients: { type: "array", items: { type: "object" } },
            resultName: { type: "string" },
            rarity: { type: "string" },
            requiredLevel: { type: "number" },
            effect: { type: "string" }
          }
        }
      });

      if (result && onGenerateRecipe) {
        await onGenerateRecipe(result);
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
    }

    setIsGenerating(false);
  };

  const handleCraft = async (recipe) => {
    setCraftingRecipe(recipe);
    
    // Simulate crafting animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (onCraft) {
      await onCraft(recipe);
    }
    
    setCraftingRecipe(null);
  };

  return (
    <LCARSPanel title="Fabricação" color="orange">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-orange-400" />
            <span className="text-white font-medium">Receitas</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateRecipe}
            disabled={isGenerating}
            className="border-orange-500/30 text-orange-400"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Descobrir Receita
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all",
                selectedCategory === cat
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  : "bg-slate-800/50 text-slate-400 border border-slate-700"
              )}
            >
              {cat === 'all' ? 'Todas' : cat}
            </button>
          ))}
        </div>

        {/* Recipes List */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <Hammer className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Nenhuma receita conhecida
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Descubra receitas completando missões ou use a IA.
            </p>
            <Button
              onClick={handleGenerateRecipe}
              disabled={isGenerating}
              className="bg-gradient-to-r from-orange-500 to-amber-600"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Descobrir Primeira Receita
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id || index}
                recipe={recipe}
                inventory={inventory}
                cadetLevel={cadetLevel}
                onCraft={handleCraft}
              />
            ))}
          </div>
        )}

        {/* Crafting Animation Modal */}
        <AnimatePresence>
          {craftingRecipe && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.5 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, ease: "linear" }}
                  className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-orange-500 border-t-transparent flex items-center justify-center"
                >
                  <Hammer className="w-10 h-10 text-orange-400" />
                </motion.div>
                <p className="text-white font-bold text-xl">Fabricando...</p>
                <p className="text-slate-400">{craftingRecipe.resultName}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LCARSPanel>
  );
}
