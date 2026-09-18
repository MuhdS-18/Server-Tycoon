import { AlertTriangle, ShieldAlert, Zap, Thermometer, Radio, CheckCircle2 } from 'lucide-react';
import { Incident } from '../types/game';
import { formatCurrency } from '../utils/formatters';

interface IncidentsBannerProps {
  incidents: Incident[];
  cash: number;
  onResolve: (incidentId: string) => void;
}

export function IncidentsBanner({ incidents, cash, onResolve }: IncidentsBannerProps) {
  if (incidents.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border-b border-rose-500/40 px-4 py-2 text-slate-100 backdrop-blur-md">
      <div className="max-w-7xl mx-auto space-y-2">
        {incidents.map((incident) => {
          const canAfford = cash >= incident.resolveCost;

          let Icon = AlertTriangle;
          let badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';

          if (incident.type === 'ddos') {
            Icon = ShieldAlert;
          } else if (incident.type === 'heatwave') {
            Icon = Thermometer;
            badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
          } else if (incident.type === 'power_surge') {
            Icon = Zap;
          } else if (incident.type === 'chip_shortage') {
            Icon = Radio;
            badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
          }

          return (
            <div
              key={incident.id}
              className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-950/80 border border-rose-500/30 shadow-md shadow-rose-950/20"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Icon className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-rose-200 tracking-wide">
                      {incident.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${badgeColor}`}
                    >
                      {incident.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ⏱ {incident.remainingSec}s remaining
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{incident.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onResolve(incident.id)}
                  disabled={!canAfford}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition ${
                    canAfford
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow shadow-rose-600/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {incident.resolveActionText}
                  {incident.resolveCost > 0 && ` (${formatCurrency(incident.resolveCost)})`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
