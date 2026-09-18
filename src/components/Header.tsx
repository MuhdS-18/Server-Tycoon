import {
  Server,
  Zap,
  DollarSign,
  TrendingUp,
  FlaskConical,
  Play,
  Pause,
  FastForward,
  Volume2,
  VolumeX,
  FileText,
  Award,
  RotateCcw,
} from 'lucide-react';
import { GameState, GameSpeed } from '../types/game';
import { formatCurrency, formatFlops } from '../utils/formatters';

interface HeaderProps {
  state: GameState;
  onSetSpeed: (speed: GameSpeed) => void;
  onToggleSound: () => void;
  onOpenFinancials: () => void;
  onOpenMilestones: () => void;
  onResetGame: () => void;
}

export function Header({
  state,
  onSetSpeed,
  onToggleSound,
  onOpenFinancials,
  onOpenMilestones,
  onResetGame,
}: HeaderProps) {
  // Calculate total global compute
  const totalCompute = state.regions
    .filter((r) => r.unlocked)
    .reduce((sum, r) => sum + r.computeCapacityTflops, 0);

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 px-4 py-3 select-none sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/10">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs tracking-wider uppercase text-emerald-400 font-semibold">
                GLOBAL CLOUD & FAB
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                v2.4 SIM
              </span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              {state.companyName}
            </h1>
          </div>
        </div>

        {/* Core Economic & Metric Strip */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono text-sm">
          {/* Market Cap */}
          <div
            id="header-market-cap"
            onClick={onOpenFinancials}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition"
            title="Click to view full Financials & P&L"
          >
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400 leading-none">VALUATION</div>
              <div className="font-semibold text-cyan-300 text-xs sm:text-sm">
                {formatCurrency(state.marketCap)}
              </div>
            </div>
          </div>

          {/* Cash */}
          <div
            id="header-cash"
            onClick={onOpenFinancials}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition"
            title="Click to view Financial Statement"
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 leading-none">TREASURY CASH</div>
              <div className="font-semibold text-emerald-300 text-xs sm:text-sm">
                {formatCurrency(state.cash)}
              </div>
            </div>
          </div>

          {/* Research Points */}
          <div
            id="header-research"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
          >
            <FlaskConical className="w-4 h-4 text-violet-400" />
            <div>
              <div className="text-[10px] text-slate-400 leading-none">R&D POINTS</div>
              <div className="font-semibold text-violet-300 text-xs sm:text-sm flex items-center gap-1">
                {Math.floor(state.researchPoints).toLocaleString()}
                <span className="text-[10px] text-slate-400 font-normal">
                  (+{state.researchPerSec.toFixed(1)}/s)
                </span>
              </div>
            </div>
          </div>

          {/* Global Compute Power */}
          <div
            id="header-compute"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hidden md:flex"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 leading-none">GRID COMPUTE</div>
              <div className="font-semibold text-amber-300 text-xs sm:text-sm">
                {formatFlops(totalCompute)}
              </div>
            </div>
          </div>
        </div>

        {/* Speed Controls & System Tools */}
        <div className="flex items-center gap-2">
          {/* Game Speed Buttons */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              id="speed-pause-btn"
              onClick={() => onSetSpeed(0)}
              className={`p-1.5 rounded transition ${
                state.gameSpeed === 0
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Pause Simulation"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
            <button
              id="speed-1x-btn"
              onClick={() => onSetSpeed(1)}
              className={`px-2 py-1 rounded text-xs font-mono font-medium transition ${
                state.gameSpeed === 1
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Normal Speed (1x)"
            >
              <Play className="w-3 h-3 inline mr-0.5" />
              1x
            </button>
            <button
              id="speed-2x-btn"
              onClick={() => onSetSpeed(2)}
              className={`px-2 py-1 rounded text-xs font-mono font-medium transition ${
                state.gameSpeed === 2
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Double Speed (2x)"
            >
              2x
            </button>
            <button
              id="speed-5x-btn"
              onClick={() => onSetSpeed(5)}
              className={`px-2 py-1 rounded text-xs font-mono font-medium transition ${
                state.gameSpeed === 5
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Hyperspeed (5x)"
            >
              <FastForward className="w-3 h-3 inline mr-0.5" />
              5x
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            id="toggle-sound-btn"
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition ${
              state.isSoundEnabled
                ? 'bg-slate-900 border-slate-700 text-emerald-400 hover:text-emerald-300'
                : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={state.isSoundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          >
            {state.isSoundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Financials Report */}
          <button
            id="open-financials-btn"
            onClick={onOpenFinancials}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            title="Financial Statement & Revenue Breakdown"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Milestones */}
          <button
            id="open-milestones-btn"
            onClick={onOpenMilestones}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/50 transition"
            title="Company Milestones & Badges"
          >
            <Award className="w-4 h-4" />
          </button>

          {/* Reset Save */}
          <button
            id="reset-game-btn"
            onClick={() => {
              if (window.confirm('Reset all tycoon progress to starting state?')) {
                onResetGame();
              }
            }}
            className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-500 hover:text-rose-400 hover:border-rose-500/40 transition"
            title="Restart Game from scratch"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
