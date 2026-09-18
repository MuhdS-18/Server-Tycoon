import React, { useState } from 'react';
import { TechNode } from '../types/game';
import {
  FlaskConical,
  Cpu,
  Wind,
  Zap,
  Globe,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface TechTreeProps {
  technologies: TechNode[];
  researchPoints: number;
  onUnlockTech: (techId: string) => void;
}

export const TechTree: React.FC<TechTreeProps> = ({
  technologies,
  researchPoints,
  onUnlockTech,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<
    'all' | 'silicon' | 'cooling' | 'datacenter' | 'networking'
  >('all');

  const branches = [
    { id: 'all', name: 'All Domains', icon: Sparkles },
    { id: 'silicon', name: 'Silicon Lithography', icon: Cpu },
    { id: 'cooling', name: 'Thermal Dynamics', icon: Wind },
    { id: 'datacenter', name: 'Green Microgrids', icon: Zap },
    { id: 'networking', name: 'Subsea & Optical Mesh', icon: Globe },
  ];

  const filteredTechs =
    selectedBranch === 'all'
      ? technologies
      : technologies.filter((t) => t.branch === selectedBranch);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-violet-400" />
            R&D RESEARCH & ARCHITECTURAL BREAKTHROUGHS
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Unlock proprietary lithography nodes, immersion cooling solutions, and ultra-terabit interconnects.
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">AVAILABLE RESEARCH POINTS:</span>
          <span className="text-violet-400 font-bold text-sm">
            {Math.floor(researchPoints).toLocaleString()} RP
          </span>
        </div>
      </div>

      {/* Branch Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {branches.map((b) => {
          const Icon = b.icon;
          const isSelected = selectedBranch === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBranch(b.id as typeof selectedBranch)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition ${
                isSelected
                  ? 'bg-violet-600 text-white shadow shadow-violet-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {b.name}
            </button>
          );
        })}
      </div>

      {/* Technologies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredTechs.map((tech) => {
          // Check prerequisites
          const prereqsMet = tech.prerequisites.every((pId) => {
            const p = technologies.find((t) => t.id === pId);
            return p && p.unlocked;
          });

          const canUnlock = !tech.unlocked && prereqsMet && researchPoints >= tech.cost;

          let branchColor = 'border-violet-800 text-violet-300';
          if (tech.branch === 'silicon') branchColor = 'border-cyan-800 text-cyan-300';
          if (tech.branch === 'cooling') branchColor = 'border-blue-800 text-blue-300';
          if (tech.branch === 'datacenter') branchColor = 'border-amber-800 text-amber-300';
          if (tech.branch === 'networking') branchColor = 'border-emerald-800 text-emerald-300';

          return (
            <div
              key={tech.id}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition ${
                tech.unlocked
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-md shadow-emerald-950/20'
                  : canUnlock
                  ? 'bg-slate-900 border-violet-500/60 shadow-lg shadow-violet-950/30'
                  : 'bg-slate-950/50 border-slate-800/80 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-sm text-white">{tech.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border uppercase ${branchColor}`}>
                        {tech.branch}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Tier {tech.tier}
                      </span>
                    </div>
                  </div>

                  {tech.unlocked ? (
                    <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : !prereqsMet ? (
                    <div className="p-1 rounded bg-slate-800 text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                  ) : (
                    <span className="text-xs font-mono font-bold text-violet-300">
                      {tech.cost} RP
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  {tech.description}
                </p>

                {/* Prerequisites list */}
                {tech.prerequisites.length > 0 && (
                  <div className="mt-3 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <span>Prereq:</span>
                    {tech.prerequisites.map((pId) => {
                      const p = technologies.find((t) => t.id === pId);
                      return (
                        <span
                          key={pId}
                          className={`px-1.5 py-0.2 rounded border ${
                            p?.unlocked
                              ? 'border-emerald-800 text-emerald-400'
                              : 'border-slate-800 text-slate-500'
                          }`}
                        >
                          {p?.name}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                {tech.unlocked ? (
                  <div className="text-center py-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 rounded-lg">
                    RESEARCH COMPLETE
                  </div>
                ) : (
                  <button
                    onClick={() => onUnlockTech(tech.id)}
                    disabled={!canUnlock}
                    className={`w-full py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition ${
                      canUnlock
                        ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    UNLOCK ARCHITECTURE ({tech.cost} RP)
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
