import React, { useState } from 'react';
import { base44 } from '../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { 
  Rocket, BookOpen, LogOut,
  Loader2, Star, Users, RotateCcw,
  Sparkles, Target, Package
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

import StarField from '../components/rpg/StarField';
import LCARSPanel from '../components/rpg/LCARSPanel';
import CharacterCreationEnhanced from '../components/rpg/CharacterCreationEnhanced';
import CadetProfile from '../components/rpg/CadetProfile';
import MissionCard from '../components/rpg/MissionCard';
import MissionPlay from '../components/rpg/MissionPlay';
import CaptainsLog from '../components/rpg/CaptainsLog';
import NPCCard from '../components/rpg/NPCCard';
import EnhancedNPCInteraction from '../components/rpg/EnhancedNPCInteraction';
import LevelUpModal from '../components/rpg/LevelUpModal';
import ProgressionPanel from '../components/rpg/ProgressionPanel';

export default function Home() {
  const [activeTab, setActiveTab] = useState('missions');
  const [playingMission, setPlayingMission] = useState(null);
  const [interactingNPC, setInteractingNPC] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(null);
  const [showSpendPoints, setShowSpendPoints] = useState(false);
  const queryClient = useQueryClient();

  // Buscar cadete do usuário
  const { data: cadets, isLoading: loadingCadet } = useQuery({
    queryKey: ['myCadet'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Cadet.filter({ created_by: user.email });
    }
  });

  const myCadet = cadets?.[0];

  //  busca de Missões
  const { data: missions = [], isLoading: loadingMissions } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list()
  });

  // Buscar NPCs
  const { data: npcs = [], isLoading: loadingNPCs } = useQuery({
    queryKey: ['npcs'],
    queryFn: () => base44.entities.NPC.list()
  });

  // Buscar relações
  const { data: relationships = [], isLoading: loadingRelationships } = useQuery({
    queryKey: ['myRelationships'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Relationship.filter({ created_by: user.email });
    },
    enabled: !!myCadet
  });

  // Buscar habilidades
  const { data: skills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: () => base44.entities.Skill.list()
  });

  // Criar mutação cadete
  const createCadetMutation = useMutation({
    mutationFn: (cadetData) => base44.entities.Cadet.create(cadetData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myCadet'] })
  });

  // Atualizar mutação cadete
  const updateCadetMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Cadet.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myCadet'] })
  });

  // Criar mudança de relacionamento
  const createRelationshipMutation = useMutation({
    mutationFn: (data) => base44.entities.Relationship.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myRelationships'] })
  });

  // Atualizar mudança de relacionamento
  const updateRelationshipMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Relationship.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myRelationships'] })
  });

  // Excluir cadete (reiniciar jogo)
  const deleteCadetMutation = useMutation({
    mutationFn: async () => {
      // Delete cadet
      if (myCadet) {
        await base44.entities.Cadet.delete(myCadet.id);
      }
      // Excluir todos os relacionamentos
      for (const rel of relationships) {
        await base44.entities.Relationship.delete(rel.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCadet'] });
      queryClient.invalidateQueries({ queryKey: ['myRelationships'] });
    }
  });

  const handleCadetCreation = async (cadetData) => {
    await createCadetMutation.mutateAsync(cadetData);
  };

  const RANKS = [
    "Cadete 4ª Classe", "Cadete 3ª Classe", "Cadete 2ª Classe", "Cadete 1ª Classe", 
    "Alferes", "Tenente Junior", "Tenente", "Tenente Comandante", "Comandante", "Capitão"
  ];

  const getXpForLevel = (level) => Math.floor(100 * Math.pow(1.2, level - 1));

  const handleMissionComplete = async (result) => {
    if (myCadet) {
      const oldLevel = myCadet.level;
      let newXP = (myCadet.xp || 0) + result.xpGained;
      let newLevel = myCadet.level;
      let levelsGained = 0;

      // Calcular subidas de nível
      while (newXP >= getXpForLevel(newLevel)) {
        newXP -= getXpForLevel(newLevel);
        newLevel++;
        levelsGained++;
      }

      const newRank = RANKS[Math.min(newLevel - 1, RANKS.length - 1)];
      const rankChanged = newRank !== myCadet.rank;

      // Encontre e adicione habilidades por nome
      const newSkillIds = [...(myCadet.skillIds || [])];
      if (result.skillGained) {
        const skillToAdd = skills.find(s => s.name === result.skillGained);
        if (skillToAdd && !newSkillIds.includes(skillToAdd.id)) {
          newSkillIds.push(skillToAdd.id);
        }
      }

      const newCompletedMissions = [...(myCadet.completedMissions || [])].filter(m => typeof m === 'string');
      const missionId = playingMission?.id || (typeof playingMission === 'string' ? playingMission : null);
      if (result.success && missionId && !newCompletedMissions.includes(missionId)) {
        newCompletedMissions.push(missionId);
      }

      // Calcule os pontos de atributo ganhos (2 por nível) e os pontos de habilidade (2 por nível)
      const newUnspentAttributePoints = (myCadet.unspentAttributePoints || 0) + (levelsGained * 2);
      const newUnspentSkillPoints = (myCadet.unspentSkillPoints || 0) + (levelsGained * 2);

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
          totalAttributePointsEarned: (myCadet.totalAttributePointsEarned || 0) + (levelsGained * 2)
        }
      });

      // Show level up modal if leveled up
      if (levelsGained > 0) {
        setShowLevelUp({
          newLevel,
          newRank: rankChanged ? newRank : null,
          pointsToSpend: levelsGained * 2
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

  const handleSpendPoints = () => {
    if (myCadet && (myCadet.unspentAttributePoints || 0) > 0) {
      setShowLevelUp({
        newLevel: myCadet.level,
        newRank: null,
        pointsToSpend: myCadet.unspentAttributePoints
      });
    }
  };

  const handleAddLogEntry = async (entry) => {
    if (myCadet) {
      const newLogEntries = [...(myCadet.logEntries || []), entry];
      await updateCadetMutation.mutateAsync({
        id: myCadet.id,
        data: { logEntries: newLogEntries }
      });
    }
  };

  const getRelationshipForNPC = (npcId) => {
    return relationships.find(r => r.npcId === npcId);
  };

  const getRelationshipStatus = (level) => {
    if (level <= -50) return "hostil";
    if (level <= -20) return "desconfiado";
    if (level < 20) return "neutro";
    if (level < 50) return "amigável";
    if (level < 80) return "aliado";
    return "melhor_amigo";
  };

  const handleUpdateRelationship = async (npcId, delta) => {
    const existingRelationship = getRelationshipForNPC(npcId);
    const npc = npcs.find(n => n.id === npcId);
    
    if (existingRelationship) {
      const newLevel = Math.max(-100, Math.min(100, (existingRelationship.level || 0) + delta));
      await updateRelationshipMutation.mutateAsync({
        id: existingRelationship.id,
        data: {
          level: newLevel,
          status: getRelationshipStatus(newLevel),
          interactionCount: (existingRelationship.interactionCount || 0) + 1,
          lastInteraction: new Date().toISOString()
        }
      });
    } else {
      const newLevel = Math.max(-100, Math.min(100, delta));
      await createRelationshipMutation.mutateAsync({
        npcId: npcId,
        npcName: npc?.name || 'Unknown',
        level: newLevel,
        status: getRelationshipStatus(newLevel),
        interactionCount: 1,
        lastInteraction: new Date().toISOString(),
        unlockedDialogues: [],
        completedSideMissions: []
      });
    }
  };

  const handleStartSideMission = (missionId) => {
    // Encontre a missão por habilidade Padrão de recompensa ou título
    const sideMission = missions.find(m => 
      m.title?.toLowerCase().includes(missionId.toLowerCase().replace(/_/g, ' '))
    );
    if (sideMission) {
      setPlayingMission(sideMission);
    }
    setInteractingNPC(null);
  };

  if (loadingCadet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <StarField />
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-slate-400">Acessando banco de dados da Frota Estelar...</p>
        </div>
      </div>
    );
  }

  // Mostrar criação de cadete se não existir nenhum cadete
  if (!myCadet) {
    return (
      <div className="min-h-screen bg-slate-950">
        <StarField />
        <CharacterCreationEnhanced onComplete={handleCadetCreation} />
      </div>
    );
  }

  // Mostrar jogabilidade da missão
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

      {/* Modal de Interação com NPC */}
      <AnimatePresence>
        {interactingNPC && (
          <EnhancedNPCInteraction
            npc={interactingNPC}
            relationship={getRelationshipForNPC(interactingNPC.id)}
            cadet={myCadet}
            onClose={() => setInteractingNPC(null)}
            onUpdateRelationship={handleUpdateRelationship}
            onStartMission={handleStartSideMission}
          />
        )}
      </AnimatePresence>

      {/* Modal Subir de Nível */}
      <AnimatePresence>
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
      </AnimatePresence>
      
      {/* Cabeçalho */}
      <header className="relative z-10 border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white">Academia da Frota Estelar</h1>
                <p className="text-xs text-cyan-400">Ex Astris, Scientia</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 hidden sm:block">
                {myCadet.name}
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-red-400"
                    title="Reiniciar Jogo"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-900 border-red-500/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Reiniciar Jogo?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      Isso apagará seu cadete atual, incluindo todos os níveis, habilidades, relacionamentos e progresso. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300">Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteCadetMutation.mutate()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Reiniciar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => base44.auth.logout()}
                className="text-slate-400 hover:text-white"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="relative z-10 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Barra lateral - Perfil do cadete */}
          <div className="lg:col-span-1">
            <CadetProfile 
              cadet={myCadet} 
              skills={skills}
              onSpendPoints={handleSpendPoints}
            />
          </div>

          {/* Area principal */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-900/80 border border-cyan-500/20">
                <TabsTrigger value="missions" className="data-[state=active]:bg-cyan-500/20">
                  <Rocket className="w-4 h-4 mr-2" />
                  Missões
                </TabsTrigger>
                <TabsTrigger value="skills" className="data-[state=active]:bg-cyan-500/20">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Habilidades
                </TabsTrigger>
                <TabsTrigger value="npcs" className="data-[state=active]:bg-cyan-500/20">
                  <Users className="w-4 h-4 mr-2" />
                  Personagens
                </TabsTrigger>
                <TabsTrigger value="log" className="data-[state=active]:bg-cyan-500/20">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Diário
                </TabsTrigger>
              </TabsList>

              {/* Acesso rápido a nave e inventário*/}
              <div className="mt-4 flex gap-2">
                <Link to={createPageUrl('ShipAndInventory')}>
                  <Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-400">
                    <Rocket className="w-4 h-4 mr-2" />
                    Nave
                  </Button>
                </Link>
                <Link to={createPageUrl('ShipAndInventory')}>
                  <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-400">
                    <Package className="w-4 h-4 mr-2" />
                    Inventário
                  </Button>
                </Link>
              </div>

              <TabsContent value="missions" className="mt-6">
                {loadingMissions ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                  </div>
                ) : missions.length === 0 ? (
                  <LCARSPanel title="Missões" color="blue">
                    <div className="text-center py-12">
                      <Rocket className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Nenhuma missão disponível
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Aguarde novas missões da Frota Estelar.
                      </p>
                    </div>
                  </LCARSPanel>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-cyan-400" />
                        Missões Recentes
                      </h3>
                      <Link to={createPageUrl('Missions')}>
                        <Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-400">
                          Ver Todas
                        </Button>
                      </Link>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {missions.slice(0, 4).map((mission) => (
                        <MissionCard
                          key={mission.id}
                          mission={mission}
                          cadetLevel={myCadet.level}
                          isCompleted={myCadet.completedMissions?.includes(mission.id)}
                          onStart={setPlayingMission}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="skills" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      Progressão
                    </h3>
                    <Link to={createPageUrl('Skills')}>
                      <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-400">
                        Árvore de Habilidades
                      </Button>
                    </Link>
                  </div>
                  <ProgressionPanel cadet={myCadet} skills={skills} />
                </div>
              </TabsContent>

              <TabsContent value="npcs" className="mt-6">
                {loadingNPCs ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                  </div>
                ) : npcs.length === 0 ? (
                  <LCARSPanel title="Personagens" color="orange">
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Nenhum personagem encontrado
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Os personagens aparecerão aqui quando estiverem disponíveis.
                      </p>
                    </div>
                  </LCARSPanel>
                ) : (
                  <div className="space-y-6">
                    <LCARSPanel title="Personagens da Academia" color="orange" animate={false}>
                      <p className="text-slate-400 text-sm mb-4">
                        Interaja com outros personagens para receber conselhos, missões especiais e desenvolver relacionamentos que podem influenciar sua jornada na Academia.
                      </p>
                    </LCARSPanel>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {npcs.map((npc) => (
                        <NPCCard
                          key={npc.id}
                          npc={npc}
                          relationship={getRelationshipForNPC(npc.id)}
                          onInteract={setInteractingNPC}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="log" className="mt-6">
                <CaptainsLog 
                  entries={myCadet.logEntries || []} 
                  onAddEntry={handleAddLogEntry}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}