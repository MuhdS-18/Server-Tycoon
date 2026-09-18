import React, { useState } from 'react';
import {
  Region,
  RackType,
  PowerType,
  CoolingType,
  TechNode,
} from '../types/game';
import { RACK_RECIPES } from '../data/initialState';
import {
  formatFlops,
  formatPower,
  formatStorage,
  formatCurrency,
  formatBandwidth,
} from '../utils/formatters';
import {
  Server,
  Zap,
  Wind,
  Droplets,
  Radiation,
  Thermometer,
  Shield,
  Layers,
  Plus,
  Trash2,
  Cpu,
  HardDrive,
  Sun,
  Flame,
  ArrowUpCircle,
} from 'lucide-react';

interface DatacenterDetailProps {
  region: Region;
  rackInventory: Record<RackType, number>;
  cash: number;
  technologies: TechNode[];
  onDeployRack: (regionId: string, rackType: RackType) => void;
  onRemoveRack: (regionId: string, rackType: RackType) => void;
  onUpgradeTier: (regionId: string) => void;
  onChangePower: (regionId: string, power: PowerType) => void;
  onChangeCooling: (regionId: string, cooling: CoolingType) => void;
  onGoToFab: () => void;
}

export const DatacenterDetail: React.FC<DatacenterDetailProps> = ({
  region,
  rackInventory,
  cash,
  technologies,
  onDeployRack,
  onRemoveRack,
  onUpgradeTier,
  onChangePower,
  onChangeCooling,
  onGoToFab,
}) => {
  const [selectedRackToDeploy, setSelectedRackToDeploy] = useState<RackType>('compute_blade_v1');

  if (!region.unlocked) {
    return (
      <div id="datacenter-detail-section" className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <Server className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-300">Region Land Unacquired</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          {region.name} is currently undeveloped. Acquire the land rights from the world map above to construct your regional hyperscale datacenter.
        </p>
      </div>
    );
  }

  // Count total racks installed
  const totalInstalledRacks = Object.values(region.racks).reduce((a, b) => a + b, 0);
  const slotsRemaining = region.maxRackSlots - totalInstalledRacks;

  // Check tech unlocks for Power & Cooling
  const hasSolar = technologies.some((t) => t.id === 'renewable_microgrid' && t.unlocked);
  const hasGeothermal = technologies.some((t) => t.id === 'geothermal_wells' && t.unlocked);
  const hasNuclear = technologies.some((t) => t.id === 'nuclear_smr' && t.unlocked);

  const hasLiquidCooling = technologies.some((t) => t.id === 'direct_liquid' && t.unlocked);
  const hasImmersionCooling = technologies.some((t) => t.id === 'immersion_cooling' && t.unlocked);
  const hasCryogenic = technologies.some((t) => t.id === 'cryogenic_superchill' && t.unlocked);

  return (
    <div id="datacenter-detail-section" className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-6 shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white tracking-tight">{region.name}</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {region.code}
            </span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Tier {region.tier} Facility
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Global Coordinates: Lat/Long {region.x.toFixed(1)}° / {region.y.toFixed(1)}° • Rack Density: {totalInstalledRacks} / {region.maxRackSlots} Slots
          </p>
        </div>

        {/* Facility Upgrade Button */}
        {region.tier < 4 && (
          <button
            onClick={() => onUpgradeTier(region.id)}
            disabled={cash < region.upgradeCost}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition ${
              cash >= region.upgradeCost
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            UPGRADE TO TIER {region.tier + 1} ({formatCurrency(region.upgradeCost)})
          </button>
        )}
      </div>

      {/* Real-time Environmental & Electrical Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Temperature */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>CORE THERMALS</span>
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-bold font-mono flex items-baseline gap-2">
            <span
              className={
                region.tempCelsius > 65
                  ? 'text-rose-400'
                  : region.tempCelsius > 48
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }
            >
              {region.tempCelsius}°C
            </span>
            <span className="text-[11px] text-slate-500 font-normal">Ambient: {region.ambientTempCelsius}°C</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 uppercase">
            STATUS: <span className={region.status === 'optimal' ? 'text-emerald-400' : 'text-rose-400'}>{region.status}</span>
          </div>
        </div>

        {/* PUE & Power Efficiency */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>PUE EFFICIENCY</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-cyan-300">
            {region.pue.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Power Draw: {formatPower(region.powerConsumptionKw)}
          </div>
        </div>

        {/* Regional Compute Capacity */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>COMPUTE POWER</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400">
            {formatFlops(region.computeCapacityTflops)}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Load: {region.computeLoadPct}% Active
          </div>
        </div>

        {/* Regional Bandwidth Capacity */}
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>NETWORK FABRIC</span>
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-lg font-bold font-mono text-indigo-300">
            {formatBandwidth(region.bandwidthCapacityGbps)}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Carrier Grade Fiber
          </div>
        </div>
      </div>

      {/* Facility Infrastructure Architecture: Power Source & Cooling Method */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Power Source Selector */}
        <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> Power Generation Grid
            </span>
            <span className="text-[11px] font-mono text-slate-400">Operational Tariff</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              onClick={() => onChangePower(region.id, 'grid')}
              className={`p-2 rounded border text-left transition ${
                region.powerType === 'grid'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-slate-200">Public Municipal Grid</div>
              <div className="text-[10px] text-slate-400 mt-0.5">$0.120 / kWh (High OpEx)</div>
            </button>

            <button
              onClick={() => hasSolar && onChangePower(region.id, 'solar_wind')}
              disabled={!hasSolar}
              className={`p-2 rounded border text-left transition ${
                !hasSolar
                  ? 'bg-slate-950/50 border-slate-800/60 text-slate-600 cursor-not-allowed'
                  : region.powerType === 'solar_wind'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold flex items-center gap-1">
                <Sun className="w-3 h-3 text-amber-400" /> Solar & Wind Array
              </div>
              <div className="text-[10px] mt-0.5">
                {hasSolar ? '$0.040 / kWh (Clean)' : 'Requires R&D Tech'}
              </div>
            </button>

            <button
              onClick={() => hasGeothermal && onChangePower(region.id, 'geothermal')}
              disabled={!hasGeothermal}
              className={`p-2 rounded border text-left transition ${
                !hasGeothermal
                  ? 'bg-slate-950/50 border-slate-800/60 text-slate-600 cursor-not-allowed'
                  : region.powerType === 'geothermal'
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold flex items-center gap-1">
                <Flame className="w-3 h-3 text-cyan-400" /> Geothermal Wells
              </div>
              <div className="text-[10px] mt-0.5">
                {hasGeothermal ? '$0.025 / kWh (Baselined)' : 'Requires R&D Tech'}
              </div>
            </button>

            <button
              onClick={() => hasNuclear && onChangePower(region.id, 'nuclear_smr')}
              disabled={!hasNuclear}
              className={`p-2 rounded border text-left transition ${
                !hasNuclear
                  ? 'bg-slate-950/50 border-slate-800/60 text-slate-600 cursor-not-allowed'
                  : region.powerType === 'nuclear_smr'
                  ? 'bg-violet-500/10 border-violet-500 text-violet-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold flex items-center gap-1">
                <Radiation className="w-3 h-3 text-violet-400" /> Nuclear SMR Reactor
              </div>
              <div className="text-[10px] mt-0.5">
                {hasNuclear ? '$0.015 / kWh (Unlimited)' : 'Requires R&D Tech'}
              </div>
            </button>
          </div>
        </div>

        {/* Cooling System Selector */}
        <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-cyan-400" /> Thermal Cooling Architecture
            </span>
            <span className="text-[11px] font-mono text-slate-400">PUE Target</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              onClick={() => onChangeCooling(region.id, 'air')}
              className={`p-2 rounded border text-left transition ${
                region.coolingType === 'air'
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-slate-200">Hot/Cold Aisle Air</div>
              <div className="text-[10px] text-slate-400 mt-0.5">PUE ~1.55 • Standard chillers</div>
            </button>

            <button
              onClick={() => hasLiquidCooling && onChangeCooling(region.id, 'direct_liquid')}
              disabled={!hasLiquidCooling}
              className={`p-2 rounded border text-left transition ${
                !hasLiquidCooling
                  ? 'bg-slate-950/50 border-slate-800/60 text-slate-600 cursor-not-allowed'
                  : region.coolingType === 'direct_liquid'
                  ? 'bg-blue-500/10 border-blue-500 text-blue-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold flex items-center gap-1">
                <Droplets className="w-3 h-3 text-blue-400" /> Direct-to-Chip Coldplates
              </div>
              <div className="text-[10px] mt-0.5">
                {hasLiquidCooling ? 'PUE ~1.25 • 2.2x heat removal' : 'Requires R&D Tech'}
              </div>
            </button>

            <button
              onClick={() => hasImmersionCooling && onChangeCooling(region.id, 'immersion')}
              disabled={!hasImmersionCooling}
              className={`p-2 rounded border text-left transition ${
                !hasImmersionCooling
                  ? 'bg-slate-950/50 border-slate-800/60 text-slate-600 cursor-not-allowed'
                  : region.coolingType === 'immersion'
                  ? 'bg-teal-500/10 border-teal-500 text-teal-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold flex items-center gap-1">
                Two-Phase Immersion Tank
              </div>
              <div className="text-[10px] mt-0.5">
                {hasImmersionCooling ? 'PUE ~1.08 • Dielectric fluid' : 'Requires R&D Tech'}
              </div>
            </button>

            <button
              onClick={() => hasCryogenic && onChangeCooling(region.id, 'cryogenic')}
              disabled={!hasCryogenic}
              className={`p-2 rounded border text-left transition ${
                !hasCryogenic
                  ? 'bg-slate-950/50 border-slate-800/60 text-slate-600 cursor-not-allowed'
                  : region.coolingType === 'cryogenic'
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold flex items-center gap-1">
                Cryogenic Stirling Superchill
              </div>
              <div className="text-[10px] mt-0.5">
                {hasCryogenic ? 'PUE ~1.02 • Superconducting' : 'Requires R&D Tech'}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Server Rack Bays Management & Deployment */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              DEPLOYED SERVER RACKS & CLUSTERS
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Slots Utilized: <span className="text-emerald-400 font-semibold">{totalInstalledRacks}</span> / {region.maxRackSlots} Maximum
            </p>
          </div>

          {/* Quick Deploy Tool */}
          <div className="flex items-center gap-2">
            <select
              value={selectedRackToDeploy}
              onChange={(e) => setSelectedRackToDeploy(e.target.value as RackType)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(RACK_RECIPES).map(([id, def]) => {
                const stock = rackInventory[id as RackType] || 0;
                return (
                  <option key={id} value={id}>
                    {def.name} ({stock} in warehouse)
                  </option>
                );
              })}
            </select>

            <button
              onClick={() => onDeployRack(region.id, selectedRackToDeploy)}
              disabled={slotsRemaining <= 0 || (rackInventory[selectedRackToDeploy] || 0) <= 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                slotsRemaining > 0 && (rackInventory[selectedRackToDeploy] || 0) > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              DEPLOY TO BAY
            </button>

            <button
              onClick={onGoToFab}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition"
              title="Jump to Hardware Manufacturing Fab"
            >
              MANUFACTURE MORE →
            </button>
          </div>
        </div>

        {/* Active Installed Rack Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(region.racks).map(([rackId, count]) => {
            if (count === 0) return null;
            const def = RACK_RECIPES[rackId];
            if (!def) return null;

            return (
              <div
                key={rackId}
                className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3 shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white leading-tight">{def.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Tier {def.tier} Chassis</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      ×{count}
                    </span>
                  </div>

                  {/* Animated Blinking Server Blades */}
                  <div className="my-2.5 p-1.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between gap-1">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[9.5px] font-mono text-slate-400">
                      ACTIVE COMPUTATION BLADES
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Total Compute:</span>
                      <span className="text-emerald-400 font-medium">
                        {formatFlops(def.computeFlops * count)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Storage:</span>
                      <span className="text-slate-300">
                        {formatStorage(def.storageCapacityPb * count)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Combined Power:</span>
                      <span className="text-amber-400">
                        {formatPower(def.powerDrawKw * count)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-500">Decommission rack</span>
                  <button
                    onClick={() => onRemoveRack(region.id, rackId as RackType)}
                    className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Withdraw rack to warehouse"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {totalInstalledRacks === 0 && (
            <div className="col-span-full py-8 text-center bg-slate-900/40 rounded-lg border border-dashed border-slate-800 space-y-2">
              <Server className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-mono text-slate-400">
                This datacenter has no server racks deployed yet.
              </div>
              <div className="text-xs text-emerald-400 font-mono">
                Deploy manufactured racks from your inventory above!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
