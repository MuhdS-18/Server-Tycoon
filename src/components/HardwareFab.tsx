import React, { useState } from 'react';
import {
  RawMaterial,
  ComponentType,
  RackType,
  ManufacturingLine,
  TechNode,
} from '../types/game';
import { COMPONENT_RECIPES, RACK_RECIPES } from '../data/initialState';
import { formatCurrency } from '../utils/formatters';
import {
  Cpu,
  Layers,
  Sparkles,
  ShoppingBag,
  RotateCw,
  XCircle,
  PlusCircle,
  CheckCircle,
  HardDrive,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface HardwareFabProps {
  cash: number;
  rawMaterials: Record<RawMaterial, number>;
  rawMaterialPrices: Record<RawMaterial, number>;
  components: Record<ComponentType, number>;
  rackInventory: Record<RackType, number>;
  activeFabrications: ManufacturingLine[];
  fabSlots: number;
  fabCleanroomClass: number;
  technologies: TechNode[];
  hasChipShortage: boolean;
  onBuyRawMaterial: (material: RawMaterial, amount: number) => void;
  onStartComponentFab: (componentId: ComponentType, isAutoRepeat?: boolean) => void;
  onStartRackAssembly: (rackId: RackType, isAutoRepeat?: boolean) => void;
  onCancelFab: (lineId: string) => void;
  onToggleAutoRepeat: (lineId: string) => void;
  onUpgradeFabSlots: () => void;
  onSellComponent: (componentId: ComponentType, count: number) => void;
  onSellRack: (rackId: RackType, count: number) => void;
}

export const HardwareFab: React.FC<HardwareFabProps> = ({
  cash,
  rawMaterials,
  rawMaterialPrices,
  components,
  rackInventory,
  activeFabrications,
  fabSlots,
  fabCleanroomClass,
  technologies,
  hasChipShortage,
  onBuyRawMaterial,
  onStartComponentFab,
  onStartRackAssembly,
  onCancelFab,
  onToggleAutoRepeat,
  onUpgradeFabSlots,
  onSellComponent,
  onSellRack,
}) => {
  const [activeTab, setActiveTab] = useState<'components' | 'racks' | 'market'>('components');
  const [autoRepeatSelection, setAutoRepeatSelection] = useState<boolean>(false);

  // Helper to verify tech requirement
  const isTechUnlocked = (techId?: string) => {
    if (!techId) return true;
    return technologies.some((t) => t.id === techId && t.unlocked);
  };

  const occupiedSlots = activeFabrications.filter((f) => f.active).length;
  const upgradeCost = fabSlots * 45000;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-6 shadow-2xl">
      {/* Header & Cleanroom Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              SEMICONDUCTOR FABRICATION & ASSEMBLY BAY
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              CLASS {fabCleanroomClass} CLEANROOM
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Precision lithography, packaging, and server rack assembly facility. Internal hardware yields zero-markup deployment.
          </p>
        </div>

        {/* Fab Line Capacity & Expansion */}
        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-xs">
            <div className="text-slate-400">ACTIVE PRODUCTION LINES</div>
            <div className="font-bold text-slate-200">
              <span className="text-emerald-400">{occupiedSlots}</span> / {fabSlots} Lines Running
            </div>
          </div>
          <button
            onClick={onUpgradeFabSlots}
            disabled={cash < upgradeCost}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              cash >= upgradeCost
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow shadow-cyan-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title="Add another parallel fabrication conveyor line"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            +1 LINE ({formatCurrency(upgradeCost)})
          </button>
        </div>
      </div>

      {/* Raw Materials Procurement Dock */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-emerald-400" /> RAW COMMODITIES WAREHOUSE
          </span>
          <span className="text-[11px] font-mono text-slate-400">Spot Market Ingot Procurement</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Silicon */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2 font-mono">
            <div>
              <div className="text-xs text-slate-400">ELECTRONIC-GRADE SILICON</div>
              <div className="text-lg font-bold text-slate-100 flex items-baseline justify-between">
                <span>{rawMaterials.silicon} units</span>
                <span className="text-xs text-emerald-400 font-normal">
                  ${rawMaterialPrices.silicon}/unit
                </span>
              </div>
            </div>
            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => onBuyRawMaterial('silicon', 10)}
                disabled={cash < rawMaterialPrices.silicon * 10}
                className="flex-1 py-1 text-center rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                +10 (${rawMaterialPrices.silicon * 10})
              </button>
              <button
                onClick={() => onBuyRawMaterial('silicon', 50)}
                disabled={cash < rawMaterialPrices.silicon * 50}
                className="flex-1 py-1 text-center rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                +50 (${rawMaterialPrices.silicon * 50})
              </button>
            </div>
          </div>

          {/* Rare Earth Metals */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2 font-mono">
            <div>
              <div className="text-xs text-slate-400">RARE EARTH METALS (Nd/Eu/Ga)</div>
              <div className="text-lg font-bold text-slate-100 flex items-baseline justify-between">
                <span>{rawMaterials.rareEarth} units</span>
                <span className="text-xs text-amber-400 font-normal">
                  ${rawMaterialPrices.rareEarth}/unit
                </span>
              </div>
            </div>
            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => onBuyRawMaterial('rareEarth', 10)}
                disabled={cash < rawMaterialPrices.rareEarth * 10}
                className="flex-1 py-1 text-center rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                +10 (${rawMaterialPrices.rareEarth * 10})
              </button>
              <button
                onClick={() => onBuyRawMaterial('rareEarth', 50)}
                disabled={cash < rawMaterialPrices.rareEarth * 50}
                className="flex-1 py-1 text-center rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                +50 (${rawMaterialPrices.rareEarth * 50})
              </button>
            </div>
          </div>

          {/* Copper & Gold Leaf */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2 font-mono">
            <div>
              <div className="text-xs text-slate-400">COPPER & CONDUCTIVE GOLD</div>
              <div className="text-lg font-bold text-slate-100 flex items-baseline justify-between">
                <span>{rawMaterials.copperGold} units</span>
                <span className="text-xs text-yellow-400 font-normal">
                  ${rawMaterialPrices.copperGold}/unit
                </span>
              </div>
            </div>
            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => onBuyRawMaterial('copperGold', 10)}
                disabled={cash < rawMaterialPrices.copperGold * 10}
                className="flex-1 py-1 text-center rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                +10 (${rawMaterialPrices.copperGold * 10})
              </button>
              <button
                onClick={() => onBuyRawMaterial('copperGold', 50)}
                disabled={cash < rawMaterialPrices.copperGold * 50}
                className="flex-1 py-1 text-center rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                +50 (${rawMaterialPrices.copperGold * 50})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Production Conveyor Lines */}
      {activeFabrications.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" /> ACTIVE FABRICATION RUNS
            </span>
            <span className="text-slate-400">Real-Time Lithography & Packaging</span>
          </div>

          <div className="space-y-2.5">
            {activeFabrications.map((line) => {
              return (
                <div
                  key={line.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{line.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                        {line.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleAutoRepeat(line.id)}
                        className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 transition ${
                          line.isAutoRepeat
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                        title="Continuously produce when materials exist"
                      >
                        <RotateCw className="w-3 h-3" /> Auto-repeat
                      </button>

                      <button
                        onClick={() => onCancelFab(line.id)}
                        className="text-slate-500 hover:text-rose-400 transition"
                        title="Cancel run"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 rounded-full"
                      style={{ width: `${Math.min(100, Math.round(line.progress))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Cleanroom Chamber Ingest</span>
                    <span>{Math.round(line.progress)}% Completed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fabrication Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('components')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition ${
              activeTab === 'components'
                ? 'bg-cyan-600 text-white shadow shadow-cyan-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" /> 1. SILICON & CHIP DIES
          </button>
          <button
            onClick={() => setActiveTab('racks')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition ${
              activeTab === 'racks'
                ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> 2. COMPLETE SERVER RACKS
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition ${
              activeTab === 'market'
                ? 'bg-emerald-600 text-white shadow shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" /> 3. B2B HARDWARE WHOLESALE
            {hasChipShortage && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold animate-pulse">
                HOT SURGE!
              </span>
            )}
          </button>
        </div>

        {/* Global Auto-Repeat Checkbox */}
        <label className="flex items-center gap-2 text-xs font-mono text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoRepeatSelection}
            onChange={(e) => setAutoRepeatSelection(e.target.checked)}
            className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
          />
          Auto-queue repeat runs
        </label>
      </div>

      {/* Tab 1: Silicon & Components */}
      {activeTab === 'components' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(COMPONENT_RECIPES).map(([id, recipe]) => {
            const isUnlocked = isTechUnlocked(recipe.techRequired);
            const inStock = components[id as ComponentType] || 0;

            // Check affordability
            const canAffordCash = cash >= (recipe.materialsCost.cash || 0);
            const canAffordSilicon =
              (rawMaterials.silicon || 0) >= (recipe.materialsCost.silicon || 0);
            const canAffordRare =
              (rawMaterials.rareEarth || 0) >= (recipe.materialsCost.rareEarth || 0);
            const canAffordCopper =
              (rawMaterials.copperGold || 0) >= (recipe.materialsCost.copperGold || 0);

            let canAffordSub = true;
            if (recipe.componentsCost) {
              for (const [subId, qty] of Object.entries(recipe.componentsCost)) {
                if ((components[subId as ComponentType] || 0) < (qty || 0)) {
                  canAffordSub = false;
                  break;
                }
              }
            }

            const canCraft =
              isUnlocked &&
              canAffordCash &&
              canAffordSilicon &&
              canAffordRare &&
              canAffordCopper &&
              canAffordSub &&
              occupiedSlots < fabSlots;

            return (
              <div
                key={id}
                className={`p-3.5 rounded-lg border flex flex-col justify-between gap-3 transition ${
                  !isUnlocked
                    ? 'bg-slate-950/40 border-slate-900 opacity-60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs text-white leading-snug">{recipe.name}</div>
                      <div className="text-[10px] text-cyan-400 font-mono uppercase">
                        {recipe.category} • {recipe.productionTimeSeconds}s cycle
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-200 border border-slate-800">
                      Stock: {inStock}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Requirements List */}
                  <div className="mt-3 p-2 rounded bg-slate-950/70 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase">Input Requirements:</div>
                    <div className="flex flex-wrap gap-2 text-slate-300">
                      {recipe.materialsCost.cash && (
                        <span className={cash >= recipe.materialsCost.cash ? 'text-emerald-400' : 'text-rose-400'}>
                          ${recipe.materialsCost.cash}
                        </span>
                      )}
                      {recipe.materialsCost.silicon && (
                        <span className={(rawMaterials.silicon || 0) >= recipe.materialsCost.silicon ? 'text-slate-300' : 'text-rose-400'}>
                          {recipe.materialsCost.silicon} Si
                        </span>
                      )}
                      {recipe.materialsCost.rareEarth && (
                        <span className={(rawMaterials.rareEarth || 0) >= recipe.materialsCost.rareEarth ? 'text-amber-400' : 'text-rose-400'}>
                          {recipe.materialsCost.rareEarth} RareEarth
                        </span>
                      )}
                      {recipe.materialsCost.copperGold && (
                        <span className={(rawMaterials.copperGold || 0) >= recipe.materialsCost.copperGold ? 'text-yellow-400' : 'text-rose-400'}>
                          {recipe.materialsCost.copperGold} Cu/Au
                        </span>
                      )}
                      {recipe.componentsCost &&
                        Object.entries(recipe.componentsCost).map(([cId, q]) => (
                          <span
                            key={cId}
                            className={
                              (components[cId as ComponentType] || 0) >= (q || 0)
                                ? 'text-cyan-400'
                                : 'text-rose-400'
                            }
                          >
                            {q}x {cId.split('_')[0]}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                <div>
                  {!isUnlocked ? (
                    <div className="text-center py-1 text-xs font-mono text-slate-500 bg-slate-950 rounded">
                      [Requires Research Tech]
                    </div>
                  ) : (
                    <button
                      onClick={() => onStartComponentFab(id as ComponentType, autoRepeatSelection)}
                      disabled={!canCraft}
                      className={`w-full py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition ${
                        canCraft
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      FABRICATE COMPONENT
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Complete Server Racks */}
      {activeTab === 'racks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(RACK_RECIPES).map(([id, def]) => {
            const isUnlocked = isTechUnlocked(def.techRequired);
            const inStock = rackInventory[id as RackType] || 0;

            let canAffordParts = true;
            for (const [cId, qty] of Object.entries(def.componentsCost)) {
              if ((components[cId as ComponentType] || 0) < (qty || 0)) {
                canAffordParts = false;
                break;
              }
            }

            const canCraft =
              isUnlocked &&
              cash >= def.assemblyCostCash &&
              canAffordParts &&
              occupiedSlots < fabSlots;

            return (
              <div
                key={id}
                className={`p-3.5 rounded-lg border flex flex-col justify-between gap-3 transition ${
                  !isUnlocked
                    ? 'bg-slate-950/40 border-slate-900 opacity-60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs text-white leading-snug">{def.name}</div>
                      <div className="text-[10px] text-indigo-400 font-mono">
                        Tier {def.tier} • {def.assemblyTimeSeconds}s assembly
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800">
                      In Warehouse: {inStock}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {def.description}
                  </p>

                  {/* Performance Specs */}
                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-300">
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                      Compute: <span className="text-emerald-400 font-bold">{def.computeFlops} TFLOPS</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                      Power: <span className="text-amber-400 font-bold">{def.powerDrawKw} kW</span>
                    </div>
                  </div>

                  {/* Parts Needed */}
                  <div className="mt-2 p-2 rounded bg-slate-950/70 border border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase">
                      Assembly Bill of Materials:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={cash >= def.assemblyCostCash ? 'text-emerald-400' : 'text-rose-400'}>
                        ${def.assemblyCostCash}
                      </span>
                      {Object.entries(def.componentsCost).map(([cId, q]) => (
                        <span
                          key={cId}
                          className={
                            (components[cId as ComponentType] || 0) >= (q || 0)
                              ? 'text-cyan-400'
                              : 'text-rose-400'
                          }
                        >
                          {q}x {cId.split('_')[0]} (have {components[cId as ComponentType] || 0})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  {!isUnlocked ? (
                    <div className="text-center py-1 text-xs font-mono text-slate-500 bg-slate-950 rounded">
                      [Requires Architecture Tech]
                    </div>
                  ) : (
                    <button
                      onClick={() => onStartRackAssembly(id as RackType, autoRepeatSelection)}
                      disabled={!canCraft}
                      className={`w-full py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition ${
                        canCraft
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      ASSEMBLE SERVER RACK
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: B2B Hardware Wholesale Liquidation */}
      {activeTab === 'market' && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800 text-xs font-mono text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>B2B Secondary Hyperscaler Market: Liquidate surplus fabricated parts or complete server racks directly for cash!</span>
            </div>
            {hasChipShortage && (
              <span className="font-bold text-amber-400 animate-pulse">
                CHIP SHORTAGE ACTIVE (+150% SALE VALUE)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Components liquidation */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">
                Fabricated Silicon Dies & Memory
              </h4>
              <div className="space-y-2">
                {Object.entries(COMPONENT_RECIPES).map(([cId, def]) => {
                  const qty = components[cId as ComponentType] || 0;
                  const unitVal = Math.round(def.baseMarketValue * (hasChipShortage ? 2.5 : 1.0));

                  return (
                    <div
                      key={cId}
                      className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{def.name}</div>
                        <div className="text-[10px] text-slate-400">
                          Stock: {qty} • Value: {formatCurrency(unitVal)} / unit
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onSellComponent(cId as ComponentType, 1)}
                          disabled={qty < 1}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition disabled:opacity-40"
                        >
                          Sell 1
                        </button>
                        <button
                          onClick={() => onSellComponent(cId as ComponentType, qty)}
                          disabled={qty < 1}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition disabled:opacity-40"
                        >
                          Sell All ({qty})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Complete racks liquidation */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">
                Complete Server Rack Enclosures
              </h4>
              <div className="space-y-2">
                {Object.entries(RACK_RECIPES).map(([rId, def]) => {
                  const qty = rackInventory[rId as RackType] || 0;
                  const unitVal = Math.round(def.baseMarketValue * (hasChipShortage ? 2.2 : 1.0));

                  return (
                    <div
                      key={rId}
                      className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{def.name}</div>
                        <div className="text-[10px] text-slate-400">
                          In Warehouse: {qty} • Value: {formatCurrency(unitVal)} / rack
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onSellRack(rId as RackType, 1)}
                          disabled={qty < 1}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition disabled:opacity-40"
                        >
                          Sell 1
                        </button>
                        <button
                          onClick={() => onSellRack(rId as RackType, qty)}
                          disabled={qty < 1}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition disabled:opacity-40"
                        >
                          Sell All ({qty})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
