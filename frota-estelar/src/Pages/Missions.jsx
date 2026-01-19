import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Target, Sparkles, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import StarField from '@/components/rpg/StarField';
import MissionBoard from '@/components/rpg/MissionBoard';
import MissionPlay from '@/components/rpg/MissionPlay';
import LevelUpModal from '@/components/rpg/LevelUpModal';
import DynamicMissionGenerator from '@/components/rpg/DynamicMissionGenerator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const RANKS = [
  "Cadete 4ª Classe", "Cadete 3ª Classe", "Cadete 2ª Classe", "Cadete 1ª Classe", 
  "Alferes", "Tenente Junior", "Tenente", "Tenente Comandante", "Comandante", "Capitão"
];

export default function MissionsPage() {
  const [playingMission, setPlayingMission] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(null);
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

  // Fetch missions
  const { data: missions = [], isLoading: loadingMissions } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list()
  });

  // Fetch skills
  const { data: skills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: () => base44.entities.Skill.list()
  });

  // Update cadet mutation
  const updateCadetMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Cadet.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myCadet'] })
  });

  const getXpForLevel = (level) => Math.floor(100 * Math.pow(1.2, level - 1));

  const handleMissionComplete = async (result) => {
    if (myCadet) {
      const oldLevel = myCadet.level;
      let newXP = (myCadet.xp || 0) + result.xpGained;
      let newLevel = myCadet.level;
      let levelsGained = 0;
      let skillPointsGained = 0;

      // Calculate level ups
      while (newXP >= getXpForLevel(newLevel)) {
        newXP -= getXpForLevel(newLevel);
        newLevel++;
        levelsGained++;
        skillPointsGained += 2; // 2 skill points per level
      }

      const newRank = RANKS[Math.min(newLevel - 1, RANKS.length - 1)];
      const rankChanged = newRank !== myCadet.rank;

      // Find and add skill by name
      const newSkillIds = [...(myCadet.skillIds || [])];
      if (result.skillGained) {
        const skillToAdd = skills.find(s => s.name === result.skillGained);
        if (skillToAdd && !newSkillIds.includes(skillToAdd.id)) {
          newSkillIds.push(skillToAdd.id);
        }
      }

      // Add skill from mission rewards
      if (playingMission?.rewards?.skillId && !newSkillIds.includes(playingMission.rewards.skillId)) {
        newSkillIds.push(playingMission.rewards.skillId);
      }

      const newCompletedMissions = [...(myCadet.completedMissions || [])].filter(m => typeof m === 'string');
      const missionId = playingMission?.id || (typeof playingMission === 'string' ? playingMission : null);
      if (result.success && missionId && !newCompletedMissions.includes(missionId)) {
        newCompletedMissions.push(missionId);
      }

      // Calculate points earned
      const newUnspentAttributePoints = (myCadet.unspentAttributePoints || 0) + (levelsGained * 2);
      const newUnspentSkillPoints = (myCadet.unspentSkillPoints || 0) + 
        skillPointsGained + 
        (playingMission?.rewards?.skillPoints || 0);
      const newCredits = (myCadet.credits || 0) + (playingMission?.rewards?.credits || 0);

      // Add decorations
      const newDecorations = [...(myCadet.decorations || [])];
      if (playingMission?.rewards?.decorationId && !newDecorations.includes(playingMission.rewards.decorationId)) {
        newDecorations.push(playingMission.rewards.decorationId);
      }

      await updateCadetMutation.mutateAsync({
        id: myCadet.id,
        data: {
          xp: newXP,
          level: newLevel,
          rank: newRank,
          skillIds: newSkillIds,
          completedMissions: newCompletedMissions,
          unspentAttributePoints: newUnspentAttributePoints,
          unspentSkillPoints: newUnspentSkillPoints,
          totalAttributePointsEarned: (myCadet.totalAttributePointsEarned || 0) + (levelsGained * 2),
          credits: newCredits,
          decorations: newDecorations
        }
      });

      // Show level up modal if leveled up
      if (levelsGained > 0) {
        setShowLevelUp({
          newLevel,
          newRank: rankChanged ? newRank : null,
          pointsToSpend: levelsGained * 2,
          skillPointsGained
        });
      }
    }
    setPlayingMission(null);
  };

  const handleLevelUpConfirm = async (newAttributes, remainingPoints) => {
    if (myCadet) {
      await updateCadetMutation.mutateAsync({
        id: myCadet.id,
        data: {
          attributes: newAttributes,
          unspentAttributePoints: (myCadet.unspentAttributePoints || 0) - (showLevelUp?.pointsToSpend || 0) + remainingPoints
        }
      });
    }
    setShowLevelUp(null);
  };

  if (loadingCadet || loadingMissions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <StarField />
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-slate-400">Carregando missões...</p>
        </div>
      </div>
    );
  }

  if (!myCadet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <StarField />
        <div className="text-center">
          <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
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

  // Show mission gameplay
  if (playingMission) {
    return (
      <div className="min-h-screen bg-slate-950">
        <StarField />
        <MissionPlay
          mission={playingMission}
          cadet={myCadet}
          onComplete={handleMissionComplete}
          onExit={() => setPlayingMission(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <StarField />

      {/* Level Up Modal */}
      {showLevelUp && (
        <LevelUpModal
          newLevel={showLevelUp.newLevel}
          newRank={showLevelUp.newRank}
          pointsToSpend={showLevelUp.pointsToSpend}
          currentAttributes={myCadet.attributes}
          onConfirm={handleLevelUpConfirm}
          onClose={() => setShowLevelUp(null)}
        />
      )}
      
      {/* Header */}
      <header className="relative z-10 border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-bold text-white">Quadro de Missões</h1>
                <p className="text-xs text-cyan-400">{myCadet.name} • Nível {myCadet.level}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-amber-400 font-bold">{myCadet.completedMissions?.length || 0}</p>
                <p className="text-xs text-slate-400">Completas</p>
              </div>
              <div className="text-center">
                <p className="text-cyan-400 font-bold">{missions.length - (myCadet.completedMissions?.length || 0)}</p>
                <p className="text-xs text-slate-400">Disponíveis</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-6">
        <Tabs defaultValue="board" className="w-full">
          <TabsList className="bg-slate-900/80 border border-cyan-500/20 mb-6">
            <TabsTrigger value="board" className="data-[state=active]:bg-cyan-500/20">
              <List className="w-4 h-4 mr-2" />
              Quadro de Missões
            </TabsTrigger>
            <TabsTrigger value="generate" className="data-[state=active]:bg-cyan-500/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Missão (IA)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board">
            <MissionBoard
              missions={missions}
              cadet={myCadet}
              completedMissionIds={myCadet.completedMissions || []}
              onSelectMission={() => {}}
              onStartMission={setPlayingMission}
            />
          </TabsContent>

          <TabsContent value="generate">
            <DynamicMissionGenerator
              cadet={myCadet}
              completedMissions={myCadet.completedMissions || []}
              onMissionGenerated={(mission) => console.log('Generated:', mission)}
              onStartMission={setPlayingMission}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}