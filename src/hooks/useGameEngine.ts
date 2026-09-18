import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  GameSpeed,
  RawMaterial,
  ComponentType,
  RackType,
  PowerType,
  CoolingType,
  Incident,
  Contract,
} from '../types/game';
import {
  INITIAL_GAME_STATE,
  COMPONENT_RECIPES,
  RACK_RECIPES,
} from '../data/initialState';
import { soundEngine } from '../utils/audio';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'netforge_tech_tycoon_save_v1';

export function useGameEngine() {
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure structure compatibility
        return {
          ...INITIAL_GAME_STATE,
          ...parsed,
          activeRegionId: parsed.activeRegionId || INITIAL_GAME_STATE.activeRegionId,
        };
      }
    } catch (e) {
      console.error('Failed to load savegame:', e);
    }
    return INITIAL_GAME_STATE;
  });

  const stateRef = useRef<GameState>(state);
  stateRef.current = state;

  // Sound sync
  useEffect(() => {
    soundEngine.enabled = state.isSoundEnabled;
  }, [state.isSoundEnabled]);

  // Auto-save periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef.current));
      } catch (e) {
        console.error('Save failed:', e);
      }
    }, 12000);
    return () => clearInterval(saveInterval);
  }, []);

  // Main simulation tick loop
  useEffect(() => {
    if (state.gameSpeed === 0) return;

    const intervalMs = Math.max(150, 1000 / state.gameSpeed);
    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.gameSpeed === 0) return prev;

        const deltaSec = 1; // 1 second of simulation time
        let newCash = prev.cash;
        let newResearchPoints = prev.researchPoints + (prev.researchPerSec * deltaSec);
        let totalRevGen = prev.stats.totalRevenueGenerated;
        let contractsCompletedCount = prev.stats.contractsCompleted;
        let totalChips = prev.stats.totalChipsFabricated;
        let totalRacks = prev.stats.totalRacksManufactured;
        const newComponents = { ...prev.components };
        const newRackInventory = { ...prev.rackInventory };
        const newMaterials = { ...prev.rawMaterials };

        // 1. Process Tech Bonuses
        let fabYieldBonusPct = 0;
        let fabSpeedMulti = 1.0;
        let serverPowerReductPct = 0;
        let techPueReduct = 0;
        let bandwidthMulti = 1.0;

        prev.technologies.forEach((t) => {
          if (t.unlocked) {
            if (t.effects.fabYieldPct) fabYieldBonusPct += t.effects.fabYieldPct;
            if (t.effects.fabSpeedMultiplier) fabSpeedMulti *= t.effects.fabSpeedMultiplier;
            if (t.effects.serverPowerReductionPct) serverPowerReductPct += t.effects.serverPowerReductionPct;
            if (t.effects.pueReduction) techPueReduct += t.effects.pueReduction;
            if (t.effects.bandwidthMultiplier) bandwidthMulti *= t.effects.bandwidthMultiplier;
          }
        });

        // 2. Process Manufacturing Lines
        const updatedFabrications = prev.activeFabrications.map((line) => {
          if (!line.active) return line;

          const duration =
            line.type === 'component'
              ? (COMPONENT_RECIPES[line.targetId]?.productionTimeSeconds || 5) / fabSpeedMulti
              : (RACK_RECIPES[line.targetId]?.assemblyTimeSeconds || 10) / fabSpeedMulti;

          const progressDelta = (deltaSec / duration) * 100;
          const newProgress = line.progress + progressDelta;

          if (newProgress >= 100) {
            // Completed!
            if (line.type === 'component') {
              const compId = line.targetId as ComponentType;
              const yieldAmount = Math.random() < fabYieldBonusPct / 100 ? 2 : 1;
              newComponents[compId] = (newComponents[compId] || 0) + yieldAmount;
              totalChips += yieldAmount;
              soundEngine.playFabComplete();

              // Auto repeat check
              if (line.isAutoRepeat) {
                const recipe = COMPONENT_RECIPES[compId];
                const canAffordCash = newCash >= (recipe.materialsCost.cash || 0);
                const canAffordSilicon = (newMaterials.silicon || 0) >= (recipe.materialsCost.silicon || 0);
                const canAffordRare = (newMaterials.rareEarth || 0) >= (recipe.materialsCost.rareEarth || 0);
                const canAffordCopper = (newMaterials.copperGold || 0) >= (recipe.materialsCost.copperGold || 0);

                let canAffordSubComps = true;
                if (recipe.componentsCost) {
                  for (const [subId, qty] of Object.entries(recipe.componentsCost)) {
                    if ((newComponents[subId as ComponentType] || 0) < (qty || 0)) {
                      canAffordSubComps = false;
                      break;
                    }
                  }
                }

                if (canAffordCash && canAffordSilicon && canAffordRare && canAffordCopper && canAffordSubComps) {
                  // Deduct
                  newCash -= recipe.materialsCost.cash || 0;
                  if (recipe.materialsCost.silicon) newMaterials.silicon -= recipe.materialsCost.silicon;
                  if (recipe.materialsCost.rareEarth) newMaterials.rareEarth -= recipe.materialsCost.rareEarth;
                  if (recipe.materialsCost.copperGold) newMaterials.copperGold -= recipe.materialsCost.copperGold;
                  if (recipe.componentsCost) {
                    for (const [subId, qty] of Object.entries(recipe.componentsCost)) {
                      newComponents[subId as ComponentType] -= qty || 0;
                    }
                  }
                  return { ...line, progress: 0, active: true };
                }
              }
            } else {
              // Rack completed
              const rackId = line.targetId as RackType;
              newRackInventory[rackId] = (newRackInventory[rackId] || 0) + 1;
              totalRacks += 1;
              soundEngine.playDeployRack();

              // Auto repeat check
              if (line.isAutoRepeat) {
                const recipe = RACK_RECIPES[rackId];
                let canAfford = newCash >= recipe.assemblyCostCash;
                for (const [cId, qty] of Object.entries(recipe.componentsCost)) {
                  if ((newComponents[cId as ComponentType] || 0) < (qty || 0)) {
                    canAfford = false;
                    break;
                  }
                }
                if (canAfford) {
                  newCash -= recipe.assemblyCostCash;
                  for (const [cId, qty] of Object.entries(recipe.componentsCost)) {
                    newComponents[cId as ComponentType] -= qty || 0;
                  }
                  return { ...line, progress: 0, active: true };
                }
              }
            }

            return { ...line, progress: 0, active: false };
          }

          return { ...line, progress: newProgress };
        });

        // 3. Process Regions & Datacenter Telemetry
        let totalGlobalComputeTflops = 0;
        let totalGlobalStoragePb = 0;
        let totalGlobalBandwidthGbps = 0;
        let totalOperatingExpenses = 0;

        const updatedRegions = prev.regions.map((reg) => {
          if (!reg.unlocked) return reg;

          let regionCompute = 0;
          let regionStorage = 0;
          let rawPowerKw = 0;
          let totalHeatBtu = 0;

          // Count racks
          for (const [rType, count] of Object.entries(reg.racks)) {
            if (count > 0 && RACK_RECIPES[rType]) {
              const rDef = RACK_RECIPES[rType];
              regionCompute += rDef.computeFlops * count;
              regionStorage += rDef.storageCapacityPb * count;
              rawPowerKw += rDef.powerDrawKw * count;
              totalHeatBtu += rDef.heatOutputBtu * count;
            }
          }

          // Power reduction tech
          rawPowerKw *= 1 - serverPowerReductPct / 100;

          // PUE calculation based on cooling
          let basePue = 1.55;
          if (reg.coolingType === 'direct_liquid') basePue = 1.25;
          if (reg.coolingType === 'immersion') basePue = 1.08;
          if (reg.coolingType === 'cryogenic') basePue = 1.02;

          const effectivePue = Math.max(1.01, basePue - techPueReduct);
          const totalPowerKw = rawPowerKw * effectivePue;

          // Thermal simulation
          // Cooling capacity in BTU/sec
          let coolingEfficiency = 1.0;
          if (reg.coolingType === 'direct_liquid') coolingEfficiency = 2.2;
          if (reg.coolingType === 'immersion') coolingEfficiency = 4.0;
          if (reg.coolingType === 'cryogenic') coolingEfficiency = 7.5;

          const heatDissipation = coolingEfficiency * 8000 * reg.tier;
          const netHeat = totalHeatBtu - heatDissipation;

          let targetTemp = reg.ambientTempCelsius + Math.max(0, netHeat / 4000);
          // Check for heatwave incident
          const hasHeatwave = prev.activeIncidents.some(
            (inc) => inc.type === 'heatwave' && inc.affectedRegionId === reg.id
          );
          if (hasHeatwave) targetTemp += 20;

          // Smooth temperature transition
          const newTemp = Math.round(reg.tempCelsius + (targetTemp - reg.tempCelsius) * 0.15);

          // Status & throttling
          let status: 'optimal' | 'warning' | 'throttled' | 'overheated' = 'optimal';
          let computeMultiplier = 1.0;
          if (newTemp >= 70) {
            status = 'overheated';
            computeMultiplier = 0.1; // Thermal shutdown
          } else if (newTemp >= 55) {
            status = 'throttled';
            computeMultiplier = 0.55; // Throttle
          } else if (newTemp >= 44) {
            status = 'warning';
          }

          const effectiveCompute = regionCompute * computeMultiplier;

          // Power Cost Calculation per second
          // Grid = $0.12/kWh, Solar/Wind = $0.04/kWh, Geothermal = $0.025/kWh, Nuclear = $0.015/kWh
          let ratePerKwh = 0.12;
          if (reg.powerType === 'solar_wind') ratePerKwh = 0.04;
          if (reg.powerType === 'geothermal') ratePerKwh = 0.025;
          if (reg.powerType === 'nuclear_smr') ratePerKwh = 0.015;

          // Check for power surge incident
          const hasPowerSurge = prev.activeIncidents.some(
            (inc) => inc.type === 'power_surge' && inc.affectedRegionId === reg.id
          );
          if (hasPowerSurge) ratePerKwh *= 2.5;

          const powerCostPerSec = (totalPowerKw * ratePerKwh) / 3600;
          const facilityMaintenance = reg.tier * 2.5;
          totalOperatingExpenses += powerCostPerSec + facilityMaintenance;

          // Bandwidth capacity
          const baseBandwidth = 400 * reg.tier * bandwidthMulti;

          totalGlobalComputeTflops += effectiveCompute;
          totalGlobalStoragePb += regionStorage;
          totalGlobalBandwidthGbps += baseBandwidth;

          // Load estimation
          const loadPct = regionCompute > 0 ? Math.min(100, Math.round((reg.currentTrafficGbps / (baseBandwidth + 1)) * 100)) : 0;

          return {
            ...reg,
            tempCelsius: newTemp,
            pue: parseFloat(effectivePue.toFixed(2)),
            powerConsumptionKw: Math.round(totalPowerKw * 10) / 10,
            computeCapacityTflops: Math.round(effectiveCompute),
            bandwidthCapacityGbps: Math.round(baseBandwidth),
            computeLoadPct: loadPct,
            status,
          };
        });

        // 4. Contracts evaluation & SLA fulfillment
        let contractIncomePerSec = 0;
        let contractPenaltyPerSec = 0;

        const updatedContracts = prev.contracts.map((c) => {
          if (!c.accepted) return c;

          // Check SLA requirements
          const meetsCompute = totalGlobalComputeTflops >= c.requiredComputeTflops;
          const meetsStorage = totalGlobalStoragePb >= c.requiredStoragePb;
          const meetsBandwidth = totalGlobalBandwidthGbps >= c.requiredBandwidthGbps;

          const isMeeting = meetsCompute && meetsStorage && meetsBandwidth;

          if (isMeeting) {
            contractIncomePerSec += c.revenuePerSec;
          } else {
            contractPenaltyPerSec += c.penaltyPerSec;
          }

          const newRemaining = Math.max(0, c.remainingDurationSec - deltaSec);

          // If finished
          if (newRemaining <= 0 && c.accepted) {
            contractsCompletedCount += 1;
            const completionBonus = c.revenuePerSec * 45;
            newCash += completionBonus;
            soundEngine.playCashChime();
            confetti({ particleCount: 40, spread: 55, origin: { y: 0.7 } });
            return {
              ...c,
              accepted: false,
              remainingDurationSec: c.totalDurationSec,
              meetingSla: false,
            };
          }

          return {
            ...c,
            remainingDurationSec: newRemaining,
            meetingSla: isMeeting,
          };
        });

        // 5. Ad-hoc Cloud Infrastructure Public Billing
        // Excess compute generates steady spot customer revenue: ~$0.08 / TFLOPS per second
        const cloudSpotRevenue = Math.max(0, totalGlobalComputeTflops * 0.085);
        const grossRevenue = contractIncomePerSec + cloudSpotRevenue;
        const netCashDelta = grossRevenue - totalOperatingExpenses - contractPenaltyPerSec;

        newCash = Math.max(0, newCash + netCashDelta);
        totalRevGen += Math.max(0, grossRevenue);

        // 6. Incidents countdown & cleanup
        const updatedIncidents = prev.activeIncidents
          .map((inc) => ({
            ...inc,
            remainingSec: inc.remainingSec - deltaSec,
          }))
          .filter((inc) => inc.remainingSec > 0);

        // Randomly spawn incident if none active
        let newIncidents = [...updatedIncidents];
        if (newIncidents.length === 0 && Math.random() < 0.018 && prev.gameTimeSec > 30) {
          const unlockedRegs = updatedRegions.filter((r) => r.unlocked);
          if (unlockedRegs.length > 0) {
            const targetReg = unlockedRegs[Math.floor(Math.random() * unlockedRegs.length)];
            const incidentTypes: Array<Incident['type']> = [
              'ddos',
              'subsea_cable',
              'heatwave',
              'chip_shortage',
              'power_surge',
            ];
            const chosenType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];

            let title = 'DDoS Volumetric Cyberattack';
            let desc = `Massive 800 Gbps SYN flood targeting ${targetReg.name}.`;
            let cost = 12000;
            let action = 'Deploy Anycast Scrubber';

            if (chosenType === 'subsea_cable') {
              title = 'Submarine Cable Drag Cut';
              desc = `Deep-sea anchor dragged across ocean fiber line near ${targetReg.name}. Latency increased by 150ms.`;
              cost = 18000;
              action = 'Reroute via Laser Ring';
            } else if (chosenType === 'heatwave') {
              title = 'Extreme Heat Dome Wave';
              desc = `Ambient temperature spiked to 45°C around ${targetReg.name}. Chillers struggling!`;
              cost = 15000;
              action = 'Activate Evaporative Foggers';
            } else if (chosenType === 'chip_shortage') {
              title = 'Global Silicon Wafer Crunch';
              desc = 'Foundry disruptions worldwide! Component wholesale prices +250% for the next 90s.';
              cost = 0;
              action = 'Acknowledge Shortage';
            } else if (chosenType === 'power_surge') {
              title = 'Substation Power Grid Spike';
              desc = `Regional power grid unstable near ${targetReg.name}. Electricity costs tripled!`;
              cost = 10000;
              action = 'Isolate Battery UPS';
            }

            soundEngine.playAlert();
            newIncidents.push({
              id: `inc_${Date.now()}`,
              title,
              type: chosenType,
              affectedRegionId: targetReg.id,
              description: desc,
              severity: chosenType === 'chip_shortage' ? 'low' : 'critical',
              remainingSec: 60,
              resolveCost: cost,
              resolveActionText: action,
              mitigationMultiplier: 1.0,
            });
          }
        }

        // 7. Market Cap dynamic calculation
        let assetsValue = newCash;
        for (const [mat, qty] of Object.entries(newMaterials)) {
          assetsValue += qty * (prev.rawMaterialPrices[mat as RawMaterial] || 50);
        }
        for (const [comp, qty] of Object.entries(newComponents)) {
          assetsValue += qty * (COMPONENT_RECIPES[comp]?.baseMarketValue || 1000);
        }
        for (const [rack, qty] of Object.entries(newRackInventory)) {
          assetsValue += qty * (RACK_RECIPES[rack]?.baseMarketValue || 15000);
        }
        // Infrastructure value
        updatedRegions.forEach((r) => {
          if (r.unlocked) {
            assetsValue += r.tier * 75000;
            for (const [rack, qty] of Object.entries(r.racks)) {
              assetsValue += qty * (RACK_RECIPES[rack]?.baseMarketValue || 20000) * 1.25;
            }
          }
        });

        const annualizedProfit = Math.max(0, netCashDelta) * 3600;
        const computedMarketCap = Math.round(assetsValue + annualizedProfit * 1.8);

        return {
          ...prev,
          cash: newCash,
          researchPoints: newResearchPoints,
          gameTimeSec: prev.gameTimeSec + deltaSec,
          marketCap: computedMarketCap,
          rawMaterials: newMaterials,
          components: newComponents,
          rackInventory: newRackInventory,
          regions: updatedRegions,
          activeFabrications: updatedFabrications,
          contracts: updatedContracts,
          activeIncidents: newIncidents,
          stats: {
            ...prev.stats,
            totalRevenueGenerated: totalRevGen,
            totalChipsFabricated: totalChips,
            totalRacksManufactured: totalRacks,
            contractsCompleted: contractsCompletedCount,
            peakMarketCap: Math.max(prev.stats.peakMarketCap, computedMarketCap),
            gameTicks: prev.stats.gameTicks + 1,
          },
        };
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [state.gameSpeed]);

  // Actions
  const buyRawMaterial = useCallback((material: RawMaterial, amount: number) => {
    setState((prev) => {
      const price = prev.rawMaterialPrices[material];
      const totalCost = price * amount;
      if (prev.cash < totalCost) {
        soundEngine.playAlert();
        return prev;
      }
      soundEngine.playClick();
      return {
        ...prev,
        cash: prev.cash - totalCost,
        rawMaterials: {
          ...prev.rawMaterials,
          [material]: prev.rawMaterials[material] + amount,
        },
      };
    });
  }, []);

  const startComponentFabrication = useCallback(
    (recipeId: ComponentType, isAutoRepeat: boolean = false) => {
      setState((prev) => {
        // Check slot availability
        const occupied = prev.activeFabrications.filter((f) => f.active).length;
        if (occupied >= prev.fabSlots) {
          soundEngine.playAlert();
          return prev;
        }

        const recipe = COMPONENT_RECIPES[recipeId];
        if (!recipe) return prev;

        // Check materials & components
        const canAffordCash = prev.cash >= (recipe.materialsCost.cash || 0);
        const canAffordSilicon =
          (prev.rawMaterials.silicon || 0) >= (recipe.materialsCost.silicon || 0);
        const canAffordRare =
          (prev.rawMaterials.rareEarth || 0) >= (recipe.materialsCost.rareEarth || 0);
        const canAffordCopper =
          (prev.rawMaterials.copperGold || 0) >= (recipe.materialsCost.copperGold || 0);

        let canAffordSubComps = true;
        if (recipe.componentsCost) {
          for (const [subId, qty] of Object.entries(recipe.componentsCost)) {
            if ((prev.components[subId as ComponentType] || 0) < (qty || 0)) {
              canAffordSubComps = false;
              break;
            }
          }
        }

        if (!canAffordCash || !canAffordSilicon || !canAffordRare || !canAffordCopper || !canAffordSubComps) {
          soundEngine.playAlert();
          return prev;
        }

        // Deduct
        const newCash = prev.cash - (recipe.materialsCost.cash || 0);
        const newMats = { ...prev.rawMaterials };
        if (recipe.materialsCost.silicon) newMats.silicon -= recipe.materialsCost.silicon;
        if (recipe.materialsCost.rareEarth) newMats.rareEarth -= recipe.materialsCost.rareEarth;
        if (recipe.materialsCost.copperGold) newMats.copperGold -= recipe.materialsCost.copperGold;

        const newComps = { ...prev.components };
        if (recipe.componentsCost) {
          for (const [subId, qty] of Object.entries(recipe.componentsCost)) {
            newComps[subId as ComponentType] -= qty || 0;
          }
        }

        soundEngine.playFabStart();

        // Add or update fabrication line
        const newLine = {
          id: `fab_${Date.now()}_${Math.random()}`,
          name: recipe.name,
          type: 'component' as const,
          targetId: recipeId,
          progress: 0,
          active: true,
          isAutoRepeat,
        };

        return {
          ...prev,
          cash: newCash,
          rawMaterials: newMats,
          components: newComps,
          activeFabrications: [...prev.activeFabrications.filter((f) => f.active), newLine],
        };
      });
    },
    []
  );

  const startRackAssembly = useCallback((rackId: RackType, isAutoRepeat: boolean = false) => {
    setState((prev) => {
      const occupied = prev.activeFabrications.filter((f) => f.active).length;
      if (occupied >= prev.fabSlots) {
        soundEngine.playAlert();
        return prev;
      }

      const recipe = RACK_RECIPES[rackId];
      if (!recipe) return prev;

      if (prev.cash < recipe.assemblyCostCash) {
        soundEngine.playAlert();
        return prev;
      }

      for (const [cId, qty] of Object.entries(recipe.componentsCost)) {
        if ((prev.components[cId as ComponentType] || 0) < (qty || 0)) {
          soundEngine.playAlert();
          return prev;
        }
      }

      // Deduct
      const newCash = prev.cash - recipe.assemblyCostCash;
      const newComps = { ...prev.components };
      for (const [cId, qty] of Object.entries(recipe.componentsCost)) {
        newComps[cId as ComponentType] -= qty || 0;
      }

      soundEngine.playFabStart();

      const newLine = {
        id: `rack_asm_${Date.now()}_${Math.random()}`,
        name: recipe.name,
        type: 'rack' as const,
        targetId: rackId,
        progress: 0,
        active: true,
        isAutoRepeat,
      };

      return {
        ...prev,
        cash: newCash,
        components: newComps,
        activeFabrications: [...prev.activeFabrications.filter((f) => f.active), newLine],
      };
    });
  }, []);

  const cancelFabrication = useCallback((lineId: string) => {
    setState((prev) => {
      soundEngine.playClick();
      return {
        ...prev,
        activeFabrications: prev.activeFabrications.filter((f) => f.id !== lineId),
      };
    });
  }, []);

  const toggleAutoRepeat = useCallback((lineId: string) => {
    setState((prev) => {
      soundEngine.playClick();
      return {
        ...prev,
        activeFabrications: prev.activeFabrications.map((f) =>
          f.id === lineId ? { ...f, isAutoRepeat: !f.isAutoRepeat } : f
        ),
      };
    });
  }, []);

  const deployRackToRegion = useCallback((regionId: string, rackType: RackType) => {
    setState((prev) => {
      if ((prev.rackInventory[rackType] || 0) <= 0) {
        soundEngine.playAlert();
        return prev;
      }

      const region = prev.regions.find((r) => r.id === regionId);
      if (!region || !region.unlocked) return prev;

      // Check slot capacity
      const currentRacks = Object.values(region.racks).reduce((sum, n) => sum + n, 0);
      if (currentRacks >= region.maxRackSlots) {
        soundEngine.playAlert();
        return prev;
      }

      soundEngine.playDeployRack();

      return {
        ...prev,
        rackInventory: {
          ...prev.rackInventory,
          [rackType]: prev.rackInventory[rackType] - 1,
        },
        regions: prev.regions.map((r) =>
          r.id === regionId
            ? {
                ...r,
                racks: {
                  ...r.racks,
                  [rackType]: (r.racks[rackType] || 0) + 1,
                },
              }
            : r
        ),
      };
    });
  }, []);

  const removeRackFromRegion = useCallback((regionId: string, rackType: RackType) => {
    setState((prev) => {
      const region = prev.regions.find((r) => r.id === regionId);
      if (!region || !region.unlocked) return prev;
      if ((region.racks[rackType] || 0) <= 0) return prev;

      soundEngine.playClick();

      return {
        ...prev,
        rackInventory: {
          ...prev.rackInventory,
          [rackType]: (prev.rackInventory[rackType] || 0) + 1,
        },
        regions: prev.regions.map((r) =>
          r.id === regionId
            ? {
                ...r,
                racks: {
                  ...r.racks,
                  [rackType]: r.racks[rackType] - 1,
                },
              }
            : r
        ),
      };
    });
  }, []);

  const unlockRegion = useCallback((regionId: string) => {
    setState((prev) => {
      const region = prev.regions.find((r) => r.id === regionId);
      if (!region || region.unlocked) return prev;
      if (prev.cash < region.unlockCost) {
        soundEngine.playAlert();
        return prev;
      }

      soundEngine.playTechUnlock();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

      return {
        ...prev,
        cash: prev.cash - region.unlockCost,
        activeRegionId: regionId,
        regions: prev.regions.map((r) => (r.id === regionId ? { ...r, unlocked: true } : r)),
      };
    });
  }, []);

  const upgradeRegionTier = useCallback((regionId: string) => {
    setState((prev) => {
      const region = prev.regions.find((r) => r.id === regionId);
      if (!region || !region.unlocked || region.tier >= 4) return prev;
      if (prev.cash < region.upgradeCost) {
        soundEngine.playAlert();
        return prev;
      }

      soundEngine.playCashChime();
      const nextTier = (region.tier + 1) as 1 | 2 | 3 | 4;
      const nextSlots = region.maxRackSlots + 12;

      return {
        ...prev,
        cash: prev.cash - region.upgradeCost,
        regions: prev.regions.map((r) =>
          r.id === regionId
            ? {
                ...r,
                tier: nextTier,
                maxRackSlots: nextSlots,
                upgradeCost: Math.round(r.upgradeCost * 1.8),
              }
            : r
        ),
      };
    });
  }, []);

  const changeRegionPower = useCallback((regionId: string, powerType: PowerType) => {
    setState((prev) => {
      soundEngine.playClick();
      return {
        ...prev,
        regions: prev.regions.map((r) => (r.id === regionId ? { ...r, powerType } : r)),
      };
    });
  }, []);

  const changeRegionCooling = useCallback((regionId: string, coolingType: CoolingType) => {
    setState((prev) => {
      soundEngine.playClick();
      return {
        ...prev,
        regions: prev.regions.map((r) => (r.id === regionId ? { ...r, coolingType } : r)),
      };
    });
  }, []);

  const unlockTechnology = useCallback((techId: string) => {
    setState((prev) => {
      const tech = prev.technologies.find((t) => t.id === techId);
      if (!tech || tech.unlocked) return prev;
      if (prev.researchPoints < tech.cost) {
        soundEngine.playAlert();
        return prev;
      }

      // Check prerequisites
      const prereqsMet = tech.prerequisites.every((pId) => {
        const pr = prev.technologies.find((t) => t.id === pId);
        return pr && pr.unlocked;
      });

      if (!prereqsMet) {
        soundEngine.playAlert();
        return prev;
      }

      soundEngine.playTechUnlock();
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.5 } });

      return {
        ...prev,
        researchPoints: prev.researchPoints - tech.cost,
        technologies: prev.technologies.map((t) => (t.id === techId ? { ...t, unlocked: true } : t)),
      };
    });
  }, []);

  const acceptContract = useCallback((contractId: string) => {
    setState((prev) => {
      const contract = prev.contracts.find((c) => c.id === contractId);
      if (!contract || contract.accepted) return prev;

      soundEngine.playCashChime();
      return {
        ...prev,
        contracts: prev.contracts.map((c) =>
          c.id === contractId ? { ...c, accepted: true, remainingDurationSec: c.totalDurationSec } : c
        ),
      };
    });
  }, []);

  const abandonContract = useCallback((contractId: string) => {
    setState((prev) => {
      soundEngine.playClick();
      return {
        ...prev,
        contracts: prev.contracts.map((c) =>
          c.id === contractId ? { ...c, accepted: false } : c
        ),
      };
    });
  }, []);

  const sellComponent = useCallback((componentId: ComponentType, count: number = 1) => {
    setState((prev) => {
      const available = prev.components[componentId] || 0;
      if (available < count) return prev;

      const recipe = COMPONENT_RECIPES[componentId];
      if (!recipe) return prev;

      // Price boost if chip shortage incident active
      const hasChipShortage = prev.activeIncidents.some((i) => i.type === 'chip_shortage');
      const multiplier = hasChipShortage ? 2.5 : 1.0;
      const earnings = recipe.baseMarketValue * count * multiplier;

      soundEngine.playCashChime();

      return {
        ...prev,
        cash: prev.cash + earnings,
        components: {
          ...prev.components,
          [componentId]: available - count,
        },
      };
    });
  }, []);

  const sellRack = useCallback((rackId: RackType, count: number = 1) => {
    setState((prev) => {
      const available = prev.rackInventory[rackId] || 0;
      if (available < count) return prev;

      const recipe = RACK_RECIPES[rackId];
      if (!recipe) return prev;

      const hasChipShortage = prev.activeIncidents.some((i) => i.type === 'chip_shortage');
      const multiplier = hasChipShortage ? 2.2 : 1.0;
      const earnings = recipe.baseMarketValue * count * multiplier;

      soundEngine.playCashChime();

      return {
        ...prev,
        cash: prev.cash + earnings,
        rackInventory: {
          ...prev.rackInventory,
          [rackId]: available - count,
        },
      };
    });
  }, []);

  const resolveIncident = useCallback((incidentId: string) => {
    setState((prev) => {
      const inc = prev.activeIncidents.find((i) => i.id === incidentId);
      if (!inc) return prev;
      if (prev.cash < inc.resolveCost) {
        soundEngine.playAlert();
        return prev;
      }

      soundEngine.playCashChime();

      return {
        ...prev,
        cash: prev.cash - inc.resolveCost,
        activeIncidents: prev.activeIncidents.filter((i) => i.id !== incidentId),
        stats: {
          ...prev.stats,
          incidentsResolved: prev.stats.incidentsResolved + 1,
        },
      };
    });
  }, []);

  const upgradeFabSlots = useCallback(() => {
    setState((prev) => {
      const cost = prev.fabSlots * 45000;
      if (prev.cash < cost) {
        soundEngine.playAlert();
        return prev;
      }
      soundEngine.playTechUnlock();
      return {
        ...prev,
        cash: prev.cash - cost,
        fabSlots: prev.fabSlots + 1,
      };
    });
  }, []);

  const setGameSpeed = useCallback((speed: GameSpeed) => {
    soundEngine.playClick();
    setState((prev) => ({ ...prev, gameSpeed: speed }));
  }, []);

  const toggleSound = useCallback(() => {
    setState((prev) => ({ ...prev, isSoundEnabled: !prev.isSoundEnabled }));
  }, []);

  const setActiveRegion = useCallback((regionId: string) => {
    soundEngine.playClick();
    setState((prev) => ({ ...prev, activeRegionId: regionId }));
  }, []);

  const resetGame = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(INITIAL_GAME_STATE);
  }, []);

  return {
    state,
    buyRawMaterial,
    startComponentFabrication,
    startRackAssembly,
    cancelFabrication,
    toggleAutoRepeat,
    deployRackToRegion,
    removeRackFromRegion,
    unlockRegion,
    upgradeRegionTier,
    changeRegionPower,
    changeRegionCooling,
    unlockTechnology,
    acceptContract,
    abandonContract,
    sellComponent,
    sellRack,
    resolveIncident,
    upgradeFabSlots,
    setGameSpeed,
    toggleSound,
    setActiveRegion,
    resetGame,
  };
}
