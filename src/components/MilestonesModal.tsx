import React from 'react';
import { GameState } from '../types/game';
import { formatCurrency, formatFlops } from '../utils/formatters';
import {
  X,
  Award,
  Cpu,
  Globe,
  Briefcase,
  Zap,
  CheckCircle,
  Lock,
  Flame,
  ShieldAlert,
} from 'lucide-react';

interface MilestonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
}

export const MilestonesModal: React.FC<MilestonesModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  if (!isOpen) return null;

  const totalUnlockedRegions = state.regions.filter((r) => r.unlocked).length;

  const hasAdvancedCooling = state.regions.some(
    (r) => r.unlocked && (r.coolingType === 'immersion' || r.coolingType === 'cryogenic')
  );

  const hasNuclearPower = state.regions.some(
    (r) => r.unlocked && r.powerType === 'nuclear_smr'
  );

  const hasQuantumNode = state.regions.some(
    (r) => r.unlocked && r.racks.quantum_node > 0
  );

  // Define Milestones
  const milestones = [
    {
      id: 'm1',
      title: 'First Silicon',
      description: 'Fabricated at least 15 semiconductor chips or wafers.',
      condition: state.stats.totalChipsFabricated >= 15,
      progress: Math.min(100, Math.round((state.stats.totalChipsFabricated / 15) * 100)),
      progressText: `${state.stats.totalChipsFabricated} / 15 Chips`,
      icon: Cpu,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
    },
    {
      id: 'm2',
      title: 'Global Footprint',
      description: 'Surpass local limits and unlock 3 global regions.',
      condition: totalUnlockedRegions >= 3,
      progress: Math.min(100, Math.round((totalUnlockedRegions / 3) * 100)),
      progressText: `${totalUnlockedRegions} / 3 Regions`,
      icon: Globe,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    },
    {
      id: 'm3',
      title: 'Silicon Unicorn',
      description: 'Attain an enterprise corporate valuation of $1,000,000.',
      condition: state.marketCap >= 1_000_000,
      progress: Math.min(100, Math.round((state.marketCap / 1_000_000) * 100)),
      progressText: `${formatCurrency(state.marketCap)} / $1.00M`,
      icon: Award,
      color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
    },
    {
      id: 'm4',
      title: 'Uptime Tycoon',
      description: 'Successfully complete 5 enterprise SLA contracts.',
      condition: state.stats.contractsCompleted >= 5,
      progress: Math.min(100, Math.round((state.stats.contractsCompleted / 5) * 100)),
      progressText: `${state.stats.contractsCompleted} / 5 SLA contracts`,
      icon: Briefcase,
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20',
    },
    {
      id: 'm5',
      title: 'Supercooled Grid',
      description: 'Deploy Immersion or Cryogenic cooling in any datacenter.',
      condition: hasAdvancedCooling,
      progress: hasAdvancedCooling ? 100 : 0,
      progressText: hasAdvancedCooling ? 'Supercooled Active' : 'No advanced cooling',
      icon: Flame,
      color: 'text-blue-400 border-blue-500/30 bg-blue-950/20',
    },
    {
      id: 'm6',
      title: 'Atomic Enterprise',
      description: 'Build a private Nuclear SMR reactor to power a region.',
      condition: hasNuclearPower,
      progress: hasNuclearPower ? 100 : 0,
      progressText: hasNuclearPower ? 'Fission Operational' : 'Grid-powered',
      icon: Zap,
      color: 'text-violet-400 border-violet-500/30 bg-violet-950/20',
    },
    {
      id: 'm7',
      title: 'Quantum Supremacy',
      description: 'Assemble and deploy a Photonic Quantum Hypercore.',
      condition: hasQuantumNode,
      progress: hasQuantumNode ? 100 : 0,
      progressText: hasQuantumNode ? 'Entanglement Achieved' : 'No quantum computing',
      icon: Award,
      color: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
    },
  ];

  const completedCount = milestones.filter((m) => m.condition).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide font-mono uppercase">
                Corporate Achievements & Milestones
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {completedCount} of {milestones.length} Strategic Goals Met
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

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 font-mono text-xs">
          {/* Progress Summary Block */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-slate-400">BOARD OF DIRECTORS REVIEW</span>
              <div className="text-lg font-bold text-white">
                {completedCount === milestones.length
                  ? 'FULL MONOPOLY ACHIEVED'
                  : completedCount >= 4
                  ? 'DOMINANT GLOBAL PLAYER'
                  : 'EMERGING TECHNOLOGY PLATFORM'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-400">{completedCount} / {milestones.length}</div>
              <div className="text-[10px] text-slate-500">Milestones Unlocked</div>
            </div>
          </div>

          {/* Milestones Grid */}
          <div className="space-y-2.5">
            {milestones.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-xl border flex items-center gap-4 transition ${
                    m.condition
                      ? 'bg-slate-900/90 border-slate-800'
                      : 'bg-slate-950/30 border-slate-900 opacity-55'
                  }`}
                >
                  {/* Badge Icon */}
                  <div
                    className={`w-11 h-11 rounded-lg border flex items-center justify-center shrink-0 ${
                      m.condition ? m.color : 'text-slate-600 border-slate-800 bg-slate-950'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Main Details */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-slate-200">
                      <span className="font-bold text-sm">{m.title}</span>
                      <span className="text-[10px] text-slate-400">{m.progressText}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{m.description}</p>

                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          m.condition
                            ? 'bg-amber-500'
                            : 'bg-slate-800'
                        }`}
                        style={{ width: `${m.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Stamp */}
                  <div className="shrink-0 pl-2">
                    {m.condition ? (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900 px-2 py-1 rounded">
                        COMPLETED
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Global Operations Stats Section */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-slate-300 font-bold text-xs border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> LIFETIME CORPORATION STATISTICS
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>Total Silicon Dies Fabricated:</span>
                <span className="font-bold text-slate-200">{state.stats.totalChipsFabricated}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Server Racks Manufactured:</span>
                <span className="font-bold text-slate-200">{state.stats.totalRacksManufactured}</span>
              </div>
              <div className="flex justify-between">
                <span>Enterprise Contracts Fulfilled:</span>
                <span className="font-bold text-slate-200">{state.stats.contractsCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span>Emergency Incidents Resolved:</span>
                <span className="font-bold text-slate-200">{state.stats.incidentsResolved}</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime SLA Average:</span>
                <span className="font-bold text-emerald-400">{state.stats.uptimeAveragePct}%</span>
              </div>
              <div className="flex justify-between">
                <span>Total Operating Ticks:</span>
                <span className="font-bold text-slate-200">{state.stats.gameTicks}</span>
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
            CLOSE REPORT
          </button>
        </div>
      </div>
    </div>
  );
};
