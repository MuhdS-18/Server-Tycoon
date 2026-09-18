import React from 'react';
import { Contract, Region } from '../types/game';
import {
  formatFlops,
  formatStorage,
  formatBandwidth,
  formatCurrency,
  formatDuration,
} from '../utils/formatters';
import {
  Briefcase,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Cpu,
  Clock,
  HardDrive,
  Radio,
} from 'lucide-react';

interface ContractsViewProps {
  contracts: Contract[];
  regions: Region[];
  onAcceptContract: (contractId: string) => void;
  onAbandonContract: (contractId: string) => void;
}

export const ContractsView: React.FC<ContractsViewProps> = ({
  contracts,
  regions,
  onAcceptContract,
  onAbandonContract,
}) => {
  // Global aggregate compute & storage
  const unlockedRegions = regions.filter((r) => r.unlocked);
  const totalCompute = unlockedRegions.reduce((sum, r) => sum + r.computeCapacityTflops, 0);
  const totalStorage = unlockedRegions.reduce(
    (sum, r) =>
      sum +
      (r.racks.storage_san_v1 * 4.8 +
        r.racks.compute_blade_v1 * 0.15 +
        r.racks.compute_blade_v2 * 0.4 +
        r.racks.ai_tensor_v1 * 0.8 +
        r.racks.ai_tensor_v2 * 2.5 +
        r.racks.quantum_node * 10.0),
    0
  );
  const totalBandwidth = unlockedRegions.reduce((sum, r) => sum + r.bandwidthCapacityGbps, 0);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            ENTERPRISE SLA CONTRACTS & CLIENT TENANTS
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Sign multi-million dollar Service Level Agreements (SLAs). Maintain five-nines uptime to earn recurring payouts and prestige bonuses.
          </p>
        </div>

        {/* Global SLA capacity check pill */}
        <div className="flex items-center gap-4 text-xs font-mono p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <div>
            AVAILABLE COMPUTE: <span className="text-emerald-400 font-bold">{formatFlops(totalCompute)}</span>
          </div>
          <div className="hidden sm:block">
            STORAGE: <span className="text-cyan-400 font-bold">{formatStorage(totalStorage)}</span>
          </div>
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contracts.map((contract) => {
          const hasCompute = totalCompute >= contract.requiredComputeTflops;
          const hasStorage = totalStorage >= contract.requiredStoragePb;
          const hasBandwidth = totalBandwidth >= contract.requiredBandwidthGbps;
          const canFulfillSla = hasCompute && hasStorage && hasBandwidth;

          let sectorBadgeColor = 'bg-blue-500/10 text-blue-300 border-blue-500/20';
          if (contract.sector === 'AI Labs') sectorBadgeColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
          if (contract.sector === 'FinTech') sectorBadgeColor = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
          if (contract.sector === 'Gov Defense') sectorBadgeColor = 'bg-rose-500/10 text-rose-300 border-rose-500/20';

          return (
            <div
              key={contract.id}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition ${
                contract.accepted
                  ? contract.meetingSla
                    ? 'bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                    : 'bg-slate-900 border-rose-500/60 shadow-lg shadow-rose-950/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-white">{contract.clientName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-mono px-2 py-0.2 rounded border uppercase ${sectorBadgeColor}`}>
                        {contract.sector}
                      </span>
                    </div>
                  </div>

                  {contract.accepted && (
                    <div className="flex items-center gap-1 font-mono text-xs">
                      {contract.meetingSla ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <ShieldCheck className="w-4 h-4" /> 99.999% SLA
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 font-bold animate-pulse">
                          <ShieldAlert className="w-4 h-4" /> SLA BREACH
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Requirements Grid */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Min Compute:
                    </span>
                    <span className={hasCompute ? 'text-emerald-400' : 'text-rose-400'}>
                      {formatFlops(contract.requiredComputeTflops)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> SAN Storage:
                    </span>
                    <span className={hasStorage ? 'text-cyan-400' : 'text-rose-400'}>
                      {formatStorage(contract.requiredStoragePb)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-indigo-400" /> Bandwidth:
                    </span>
                    <span className={hasBandwidth ? 'text-indigo-400' : 'text-rose-400'}>
                      {formatBandwidth(contract.requiredBandwidthGbps)}
                    </span>
                  </div>
                </div>

                {/* Financial Terms */}
                <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500">REVENUE</div>
                    <div className="font-bold text-emerald-400">
                      +${contract.revenuePerSec}/s
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">BREACH PENALTY</div>
                    <div className="font-bold text-rose-400">
                      -${contract.penaltyPerSec}/s
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">TERM DURATION</div>
                    <div className="font-bold text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {contract.accepted
                        ? formatDuration(contract.remainingDurationSec)
                        : formatDuration(contract.totalDurationSec)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {contract.accepted ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-center py-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-mono font-semibold">
                      CONTRACT ACTIVE ({Math.round(((contract.totalDurationSec - contract.remainingDurationSec) / contract.totalDurationSec) * 100)}%)
                    </div>
                    <button
                      onClick={() => onAbandonContract(contract.id)}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 text-xs font-mono transition"
                      title="Terminate early (lose completion bonus)"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onAcceptContract(contract.id)}
                    className={`w-full py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition ${
                      canFulfillSla
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow shadow-emerald-600/30'
                        : 'bg-amber-600 hover:bg-amber-500 text-white'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {canFulfillSla ? 'SIGN CONTRACT SLA' : 'SIGN (RISK SLA PENALTY)'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
