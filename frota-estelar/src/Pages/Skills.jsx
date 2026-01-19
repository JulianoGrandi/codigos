import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import StarField from '@/components/rpg/StarField';
import VisualSkillTree from '@/components/rpg/VisualSkillTree';
import ProgressionPanel from '@/components/rpg/ProgressionPanel';

export default function SkillsPage() {
  const queryClient = useQueryClient();

  // Fetch user's cadet
  const { data: cadets, isLoading: loadingCadet } = useQuery({
    queryKey: ['myCadet'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Cadet.filter({ created_by: user.email });
    }
  });

  const myCadet = cadets?.[0];

  // Fetch skills
  const { data: skills = [], isLoading: loadingSkills } = useQuery({
    queryKey: ['skills'],
    queryFn: () => base44.entities.Skill.list()
  });

  // Update cadet mutation
  const updateCadetMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Cadet.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myCadet'] })
  });

  const handleLearnSkill = async (skill) => {
    if (!myCadet || (myCadet.unspentSkillPoints || 0) < 1) return;
    
    const newSkillIds = [...(myCadet.skillIds || []), skill.id];
    const newSkillLevels = { ...(myCadet.skillLevels || {}), [skill.id]: 1 };
    
    await updateCadetMutation.mutateAsync({
      id: myCadet.id,
      data: {
        skillIds: newSkillIds,
        skillLevels: newSkillLevels,
        unspentSkillPoints: (myCadet.unspentSkillPoints || 0) - 1
      }
    });
  };

  const handleUpgradeSkill = async (skill) => {
    if (!myCadet || (myCadet.unspentSkillPoints || 0) < 1) return;
    
    const currentLevel = myCadet.skillLevels?.[skill.id] || 1;
    if (currentLevel >= (skill.maxLevel || 5)) return;
    
    const newSkillLevels = { 
      ...(myCadet.skillLevels || {}), 
      [skill.id]: currentLevel + 1 
    };
    
    await updateCadetMutation.mutateAsync({
      id: myCadet.id,
      data: {
        skillLevels: newSkillLevels,
        unspentSkillPoints: (myCadet.unspentSkillPoints || 0) - 1
      }
    });
  };

  if (loadingCadet || loadingSkills) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <StarField />
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-slate-400">Carregando árvore de habilidades...</p>
        </div>
      </div>
    );
  }

  if (!myCadet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <StarField />
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Cadete não encontrado</h2>
          <p className="text-slate-400 mb-4">Crie seu cadete primeiro.</p>
          <Link to={createPageUrl('Home')}>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600">
              Ir para a Academia
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <StarField />
      
      {/* Header */}
      <header className="relative z-10 border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-white">Sistema de Habilidades</h1>
              <p className="text-xs text-cyan-400">{myCadet.name} • Nível {myCadet.level}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Progression */}
          <div className="lg:col-span-1">
            <ProgressionPanel cadet={myCadet} skills={skills} />
          </div>

          {/* Main Area - Skill Tree */}
          <div className="lg:col-span-3">
            <VisualSkillTree
              skills={skills}
              cadet={myCadet}
              onLearnSkill={handleLearnSkill}
              onUpgradeSkill={handleUpgradeSkill}
              availablePoints={myCadet.unspentSkillPoints || 0}
            />
          </div>
        </div>
      </main>
    </div>
  );
}