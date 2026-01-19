import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Loader2, ArrowLeft, Rocket, Package, Hammer, 
  Sparkles, AlertTriangle, Users, Swords
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import StarField from '@/components/rpg/StarField';
import ShipManagement from '@/components/rpg/ShipManagement';
import InventorySystem from '@/components/rpg/InventorySystem';
import CraftingSystem from '@/components/rpg/CraftingSystem';
import CrewManagement from '@/components/rpg/CrewManagement';
import ShipCombat from '@/components/rpg/ShipCombat';
import LCARSPanel from '@/components/rpg/LCARSPanel';

export default function ShipAndInventoryPage() {
  const [showCombat, setShowCombat] = useState(false);
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

  // Fetch user's ship
  const { data: ships, isLoading: loadingShip } = useQuery({
    queryKey: ['myShip'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Ship.filter({ created_by: user.email });
    },
    enabled: !!myCadet
  });

  const myShip = ships?.[0];

  // Fetch user's inventory
  const { data: inventories, isLoading: loadingInventory } = useQuery({
    queryKey: ['myInventory'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Inventory.filter({ created_by: user.email });
    },
    enabled: !!myCadet
  });

  const myInventory = inventories?.[0];

  // Fetch resources
  const { data: resources = [] } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list()
  });

  // Fetch crafting recipes
  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.CraftingRecipe.list()
  });

  // Fetch crew members
  const { data: crewMembers = [], isLoading: loadingCrew } = useQuery({
    queryKey: ['myCrew'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.CrewMember.filter({ created_by: user.email });
    },
    enabled: !!myCadet
  });

  // Update ship mutation
  const updateShipMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Ship.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myShip'] })
  });

  // Update cadet mutation (for credits)
  const updateCadetMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Cadet.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myCadet'] })
  });

  // Update inventory mutation
  const updateInventoryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Inventory.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myInventory'] })
  });

  // Create inventory if doesn't exist
  const createInventoryMutation = useMutation({
    mutationFn: (data) => base44.entities.Inventory.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myInventory'] })
  });

  // Create ship if doesn't exist
  const createShipMutation = useMutation({
    mutationFn: (data) => base44.entities.Ship.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myShip'] })
  });

  // Create recipe mutation
  const createRecipeMutation = useMutation({
    mutationFn: (data) => base44.entities.CraftingRecipe.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] })
  });

  // Crew mutations
  const createCrewMutation = useMutation({
    mutationFn: (data) => base44.entities.CrewMember.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myCrew'] })
  });

  const updateCrewMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CrewMember.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myCrew'] })
  });

  const handleRecruitCrew = async (crewData) => {
    await createCrewMutation.mutateAsync(crewData);
  };

  const handleAssignStation = async (memberId, stationId) => {
    // Clear station from other crew members
    for (const member of crewMembers) {
      if (member.assignedStation === stationId && member.id !== memberId) {
        await updateCrewMutation.mutateAsync({
          id: member.id,
          data: { assignedStation: null }
        });
      }
    }
    // Assign to new member
    await updateCrewMutation.mutateAsync({
      id: memberId,
      data: { assignedStation: stationId }
    });
  };

  const handleCombatVictory = async (rewards) => {
    setShowCombat(false);
    if (myCadet) {
      await updateCadetMutation.mutateAsync({
        id: myCadet.id,
        data: {
          xp: (myCadet.xp || 0) + rewards.xp,
          credits: (myCadet.credits || 0) + rewards.credits
        }
      });
    }
  };

  const handleCombatDefeat = () => {
    setShowCombat(false);
  };

  const handleUpdateShip = async (data) => {
    if (myShip) {
      await updateShipMutation.mutateAsync({ id: myShip.id, data });
    }
  };

  const handleSpendCredits = async (amount) => {
    if (myCadet) {
      const newCredits = Math.max(0, (myCadet.credits || 0) - amount);
      await updateCadetMutation.mutateAsync({
        id: myCadet.id,
        data: { credits: newCredits }
      });
    }
  };

  const handleCraft = async (recipe) => {
    if (!myInventory) return;

    // Remove ingredients from inventory
    const newResources = [...(myInventory.resources || [])];
    
    recipe.ingredients?.forEach(ing => {
      const resourceIndex = newResources.findIndex(
        r => r.resourceId === ing.resourceId || r.resourceName === ing.resourceName
      );
      if (resourceIndex !== -1) {
        newResources[resourceIndex].quantity -= ing.quantity;
        if (newResources[resourceIndex].quantity <= 0) {
          newResources.splice(resourceIndex, 1);
        }
      }
    });

    await updateInventoryMutation.mutateAsync({
      id: myInventory.id,
      data: { resources: newResources }
    });

    // TODO: Add crafted item to inventory/equipment
  };

  const handleGenerateRecipe = async (recipeData) => {
    await createRecipeMutation.mutateAsync(recipeData);
  };

  const handleCreateStarterShip = async () => {
    await createShipMutation.mutateAsync({
      name: `USS ${myCadet.name.split(' ')[0]}`,
      class: 'Shuttle',
      registry: `NCC-${70000 + Math.floor(Math.random() * 10000)}`,
      hull: { current: 100, max: 100 },
      shields: { current: 100, max: 100 },
      power: { current: 100, max: 100 },
      warpCore: { status: 'Online', efficiency: 100 },
      systems: { weapons: 1, shields: 1, engines: 1, sensors: 1, lifesupport: 1 },
      crew: [],
      cargo: { capacity: 50, used: 0 },
      upgrades: []
    });
  };

  const handleCreateInventory = async () => {
    await createInventoryMutation.mutateAsync({
      resources: [
        { resourceName: 'Dilithium', quantity: 5 },
        { resourceName: 'Tritanium', quantity: 10 },
        { resourceName: 'Isolinear Chip', quantity: 3 }
      ],
      equipment: [],
      consumables: [],
      maxSlots: 50
    });
  };

  if (loadingCadet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <StarField />
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!myCadet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <StarField />
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
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

  // Show combat if active
  if (showCombat && myShip) {
    return (
      <ShipCombat
        playerShip={myShip}
        cadet={myCadet}
        crew={crewMembers}
        enemyDifficulty={Math.min(Math.floor((myCadet.level || 1) / 2) + 1, 5)}
        onVictory={handleCombatVictory}
        onDefeat={handleCombatDefeat}
        onRetreat={() => setShowCombat(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <StarField />
      
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
                <h1 className="font-bold text-white">Nave e Inventário</h1>
                <p className="text-xs text-cyan-400">{myCadet.name} • {myCadet.credits || 0}₡</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-6">
        <Tabs defaultValue="ship" className="w-full">
          <TabsList className="bg-slate-900/80 border border-cyan-500/20 mb-6">
            <TabsTrigger value="ship" className="data-[state=active]:bg-cyan-500/20">
              <Rocket className="w-4 h-4 mr-2" />
              Nave
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-cyan-500/20">
              <Package className="w-4 h-4 mr-2" />
              Inventário
            </TabsTrigger>
            <TabsTrigger value="crafting" className="data-[state=active]:bg-cyan-500/20">
              <Hammer className="w-4 h-4 mr-2" />
              Fabricação
            </TabsTrigger>
            <TabsTrigger value="crew" className="data-[state=active]:bg-cyan-500/20">
              <Users className="w-4 h-4 mr-2" />
              Tripulação
            </TabsTrigger>
          </TabsList>

          {/* Combat Button */}
          {myShip && (
            <div className="mt-4">
              <Button
                onClick={() => setShowCombat(true)}
                className="bg-gradient-to-r from-red-500 to-red-700"
              >
                <Swords className="w-4 h-4 mr-2" />
                Simulação de Combate
              </Button>
            </div>
          )}

          <TabsContent value="ship">
            {loadingShip ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            ) : myShip ? (
              <ShipManagement
                ship={myShip}
                onUpdateShip={handleUpdateShip}
                credits={myCadet.credits || 0}
                onSpendCredits={handleSpendCredits}
              />
            ) : (
              <LCARSPanel title="Nave" color="cyan">
                <div className="text-center py-12">
                  <Rocket className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Sem nave atribuída
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Como cadete de nível {myCadet.level}, você pode receber sua primeira nave.
                  </p>
                  {myCadet.level >= 2 && (
                    <Button
                      onClick={handleCreateStarterShip}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Receber Shuttle Inicial
                    </Button>
                  )}
                </div>
              </LCARSPanel>
            )}
          </TabsContent>

          <TabsContent value="inventory">
            {loadingInventory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            ) : myInventory ? (
              <InventorySystem
                inventory={myInventory}
                resources={resources}
                onUpdateInventory={(data) => updateInventoryMutation.mutate({ id: myInventory.id, data })}
              />
            ) : (
              <LCARSPanel title="Inventário" color="purple">
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Inventário não inicializado
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Inicialize seu inventário para começar a coletar recursos.
                  </p>
                  <Button
                    onClick={handleCreateInventory}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Inicializar Inventário
                  </Button>
                </div>
              </LCARSPanel>
            )}
          </TabsContent>

          <TabsContent value="crafting">
            <CraftingSystem
              recipes={recipes}
              inventory={myInventory}
              resources={resources}
              cadetLevel={myCadet.level}
              onCraft={handleCraft}
              onGenerateRecipe={handleGenerateRecipe}
            />
          </TabsContent>

          <TabsContent value="crew">
            {loadingCrew ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
            ) : (
              <CrewManagement
                crew={crewMembers}
                ship={myShip}
                onRecruitCrew={handleRecruitCrew}
                onAssignStation={handleAssignStation}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}