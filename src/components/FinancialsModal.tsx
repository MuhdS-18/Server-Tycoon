import React from 'react';
import { GameState, RawMaterial, ComponentType, RackType } from '../types/game';
import { COMPONENT_RECIPES, RACK_RECIPES } from '../data/initialState';
import { formatCurrency, formatFlops } from '../utils/formatters';
import {
  X,
  TrendingUp,
  DollarSign,
  PieChart,
  Shield,
  Zap,
  Building,
  HardDrive,
} from 'lucide-react';

interface FinancialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
}

export const FinancialsModal: React.FC<FinancialsModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  if (!isOpen) return null;

  // Calculate Asset Values
  let inventoryMaterialsVal = 0;
  for (const [mat, qty] of Object.entries(state.rawMaterials)) {
    inventoryMaterialsVal += qty * (state.rawMaterialPrices[mat as RawMaterial] || 50);
  }

  let inventoryComponentsVal = 0;
  for (const [comp, qty] of Object.entries(state.components)) {
    inventoryComponentsVal += qty * (COMPONENT_RECIPES[comp]?.baseMarketValue || 1000);
  }

  let inventoryRacksVal = 0;
  for (const [rack, qty] of Object.entries(state.rackInventory)) {
    inventoryRacksVal += qty * (RACK_RECIPES[rack]?.baseMarketValue || 15000);
  }

  let infrastructureCapitalVal = 0;
  let totalPowerDrawKw = 0;
  let totalCompute = 0;

  state.regions.forEach((reg) => {
    if (reg.unlocked) {
      infrastructureCapitalVal += reg.tier * 75000;
      totalPowerDrawKw += reg.powerConsumptionKw;
      totalCompute += reg.computeCapacityTflops;
      for (const [rack, qty] of Object.entries(reg.racks)) {
        infrastructureCapitalVal +=
          qty * (RACK_RECIPES[rack]?.baseMarketValue || 20000) * 1.25;
      }
    }
  });

  const totalBookValue =
    state.cash +
    inventoryMaterialsVal +
    inventoryComponentsVal +
    inventoryRacksVal +
    infrastructureCapitalVal;

  // Estimated Revenue Per Second
  let contractRevPerSec = 0;
  state.contracts.forEach((c) => {
    if (c.accepted && c.meetingSla) contractRevPerSec += c.revenuePerSec;
  });

  const cloudSpotRevPerSec = totalCompute * 0.085;
  const grossRevPerSec = contractRevPerSec + cloudSpotRevPerSec;

  // Estimated Power OpEx per second
  let powerOpExPerSec = 0;
  state.regions.forEach((r) => {
    if (r.unlocked) {
      let rate = 0.12;
      if (r.powerType === 'solar_wind') rate = 0.04;
      if (r.powerType === 'geothermal') rate = 0.025;
      if (r.powerType === 'nuclear_smr') rate = 0.015;
      powerOpExPerSec += (r.powerConsumptionKw * rate) / 3600;
    }
  });

  const facilityMaintenancePerSec =
    state.regions.filter((r) => r.unlocked).reduce((s, r) => s + r.tier * 2.5, 0);

  const totalOpExPerSec = powerOpExPerSec + facilityMaintenancePerSec;
  const netIncomePerSec = grossRevPerSec - totalOpExPerSec;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide font-mono uppercase">
                Corporate Financial Statement & Valuation
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {state.companyName} • Audited GAAP Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs text-slate-300">
          {/* Top Key Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Enterprise Market Cap</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">
                {formatCurrency(state.marketCap)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Peak: {formatCurrency(state.stats.peakMarketCap)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Liquid Treasury Cash</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {formatCurrency(state.cash)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Instant Liquidity</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Net Run-Rate Profit</div>
              <div
                className={`text-xl font-bold mt-1 ${
                  netIncomePerSec >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {netIncomePerSec >= 0 ? '+' : ''}
                {formatCurrency(netIncomePerSec * 60)} / min
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {formatCurrency(netIncomePerSec * 3600)} / hr
              </div>
            </div>
          </div>

          {/* Balance Sheet Breakdown */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-sm font-bold text-white border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-400" />
                BALANCE SHEET ASSETS & BOOK VALUE
              </span>
              <span className="text-cyan-400">{formatCurrency(totalBookValue)}</span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Liquid Treasury Cash Reserves:</span>
                <span className="font-semibold text-emerald-400">{formatCurrency(state.cash)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Raw Materials Stock (Silicon, Rare Earths, Metals):</span>
                <span className="font-semibold">{formatCurrency(inventoryMaterialsVal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fabricated Microchips, Dies & Memory Inventory:</span>
                <span className="font-semibold">{formatCurrency(inventoryComponentsVal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Uninstalled Server Racks in Warehouse:</span>
                <span className="font-semibold">{formatCurrency(inventoryRacksVal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deployed Global Datacenter Facilities & Active Racks:</span>
                <span className="font-semibold text-indigo-300">{formatCurrency(infrastructureCapitalVal)}</span>
              </div>
            </div>
          </div>

          {/* Operating Income Statement */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-sm font-bold text-white border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                CASH FLOW & RUNNING OPERATIONAL P&L
              </span>
              <span className="text-slate-400">Per Second Metrics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Revenue */}
              <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-bold text-emerald-400 uppercase text-[11px]">
                  Recurring Revenues (+{formatCurrency(grossRevPerSec)}/s)
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Public Cloud Compute Spot Billing:</span>
                  <span>+{formatCurrency(cloudSpotRevPerSec)}/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Enterprise SLA Contracts:</span>
                  <span>+{formatCurrency(contractRevPerSec)}/s</span>
                </div>
              </div>

              {/* Expenses */}
              <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="font-bold text-rose-400 uppercase text-[11px]">
                  Operating Expenses (-{formatCurrency(totalOpExPerSec)}/s)
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Datacenter Electricity & Power:</span>
                  <span>-{formatCurrency(powerOpExPerSec)}/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Facility Maintenance & Bandwidth:</span>
                  <span>-{formatCurrency(facilityMaintenancePerSec)}/s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition"
          >
            CLOSE STATEMENT
          </button>
        </div>
      </div>
    </div>
  );
};
