import React, { useState } from 'react';
import { Region, NetworkInterlink } from '../types/game';
import { formatFlops, formatCurrency, formatPower } from '../utils/formatters';
import { Globe, Lock, Activity, Thermometer, ShieldCheck } from 'lucide-react';

interface WorldMapProps {
  regions: Region[];
  interlinks: NetworkInterlink[];
  activeRegionId: string | null;
  onSelectRegion: (id: string) => void;
  onUnlockRegion: (id: string) => void;
  cash: number;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  regions,
  interlinks,
  activeRegionId,
  onSelectRegion,
  onUnlockRegion,
  cash,
}) => {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  const activeRegion = regions.find((r) => r.id === activeRegionId);
  const hoveredRegion = regions.find((r) => r.id === hoveredRegionId);

  // Region lookup for interlinks
  const regionMap = new Map(regions.map((r) => [r.id, r]));

  const totalUnlocked = regions.filter((r) => r.unlocked).length;
  const avgPue =
    regions.filter((r) => r.unlocked).reduce((s, r) => s + r.pue, 0) / (totalUnlocked || 1);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Map Header & Summary Strip */}
      <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-200">
          <Globe className="w-4 h-4 text-emerald-400 animate-spin-slow" />
          <span className="font-bold tracking-wide uppercase">GLOBAL HIGH-SPEED FIBER & HYPERSCALE BACKBONE</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <div>
            REGIONS: <span className="text-emerald-400 font-semibold">{totalUnlocked}</span> / {regions.length} ACTIVE
          </div>
          <div className="hidden sm:block">
            AVG PUE: <span className="text-cyan-400 font-semibold">{avgPue.toFixed(2)}</span>
          </div>
          <div className="hidden md:block">
            STATUS: <span className="text-emerald-400 font-semibold">ALL BACKBONES OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative w-full aspect-[16/9] min-h-[380px] sm:min-h-[460px] bg-gradient-to-b from-slate-950 via-[#070d18] to-slate-950 select-none overflow-hidden">
        <svg
          viewBox="0 0 1000 560"
          className="w-full h-full object-cover"
          style={{ filter: 'drop-shadow(0 0 1px rgba(0,255,200,0.05))' }}
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="grid-dots" width="25" height="25" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.75" fill="#1e293b" opacity="0.6" />
            </pattern>

            {/* Glowing filter for nodes */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="cable-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width="1000" height="560" fill="url(#grid-dots)" />

          {/* Equator & Meridian Guides */}
          <line x1="0" y1="280" x2="1000" y2="280" stroke="#0f172a" strokeWidth="1" strokeDasharray="4,6" />
          <line x1="500" y1="0" x2="500" y2="560" stroke="#0f172a" strokeWidth="1" strokeDasharray="4,6" />

          {/* Continental Outlines (Polished Stylized Geometry) */}
          <g fill="#0b1322" stroke="#1e293b" strokeWidth="1.2" opacity="0.85">
            {/* North America */}
            <path d="M 120,80 L 250,70 L 320,110 L 290,180 L 300,240 L 220,280 L 160,240 L 110,180 Z" />
            {/* Greenland */}
            <path d="M 370,40 L 440,35 L 420,95 L 360,85 Z" />
            {/* South America */}
            <path d="M 270,300 L 360,330 L 400,420 L 340,510 L 290,440 L 260,340 Z" />
            {/* Europe */}
            <path d="M 470,110 L 590,95 L 610,150 L 550,230 L 470,220 L 460,160 Z" />
            {/* Africa */}
            <path d="M 470,235 L 600,240 L 640,340 L 580,480 L 510,480 L 460,320 Z" />
            {/* Asia */}
            <path d="M 600,90 L 890,95 L 940,160 L 880,310 L 760,320 L 680,240 Z" />
            {/* India Subcontinent */}
            <path d="M 670,240 L 730,250 L 720,330 L 665,300 Z" />
            {/* Southeast Asia Archipelago */}
            <path d="M 770,320 L 820,330 L 840,380 L 780,390 Z" />
            {/* Australia */}
            <path d="M 800,400 L 920,390 L 930,470 L 840,490 L 790,450 Z" />
          </g>

          {/* Subsea Cable Network Interlinks */}
          <g>
            {interlinks.map((link) => {
              const fromReg = regionMap.get(link.fromRegionId);
              const toReg = regionMap.get(link.toRegionId);
              if (!fromReg || !toReg) return null;

              const x1 = fromReg.x * 10;
              const y1 = fromReg.y * 5.6;
              const x2 = toReg.x * 10;
              const y2 = toReg.y * 5.6;

              const isBothUnlocked = fromReg.unlocked && toReg.unlocked;

              // Quadratic curve control point for graceful organic arch
              const dx = x2 - x1;
              const dy = y2 - y1;
              const cx = (x1 + x2) / 2 - dy * 0.15;
              const cy = (y1 + y2) / 2 + dx * 0.15;
              const pathD = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

              return (
                <g key={link.id}>
                  {/* Outer glow line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isBothUnlocked ? '#10b981' : '#334155'}
                    strokeWidth={isBothUnlocked ? 2.5 : 1}
                    strokeOpacity={isBothUnlocked ? 0.35 : 0.25}
                    filter={isBothUnlocked ? 'url(#cable-glow)' : undefined}
                  />

                  {/* Core cable line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isBothUnlocked ? '#34d399' : '#475569'}
                    strokeWidth={isBothUnlocked ? 1.5 : 0.8}
                    strokeDasharray={isBothUnlocked ? '6,4' : '3,5'}
                    strokeOpacity={isBothUnlocked ? 0.9 : 0.4}
                  />

                  {/* Animated Data Packets along active routes */}
                  {isBothUnlocked && (
                    <circle r="2.5" fill="#a7f3d0">
                      <animateMotion
                        path={pathD}
                        dur={`${Math.max(2, link.latencyMs / 25)}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </g>

          {/* Region Datacenter Nodes */}
          {regions.map((region) => {
            const cx = region.x * 10;
            const cy = region.y * 5.6;
            const isSelected = region.id === activeRegionId;
            const isHovered = region.id === hoveredRegionId;

            // Status color mappings
            let primaryColor = '#10b981'; // optimal green
            if (!region.unlocked) primaryColor = '#64748b'; // locked gray
            else if (region.status === 'warning') primaryColor = '#f59e0b'; // amber
            else if (region.status === 'throttled' || region.status === 'overheated') primaryColor = '#f43f5e'; // red

            return (
              <g
                key={region.id}
                className="cursor-pointer transition-transform"
                onClick={() => onSelectRegion(region.id)}
                onMouseEnter={() => setHoveredRegionId(region.id)}
                onMouseLeave={() => setHoveredRegionId(null)}
              >
                {/* Ping pulse for active online datacenters */}
                {region.unlocked && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth="1.2"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      values="6;22;26"
                      dur="2.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.2;0"
                      dur="2.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Selected Halo */}
                {isSelected && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="16"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                    className="animate-spin-slow"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 8 : isHovered ? 7 : 5.5}
                  fill={region.unlocked ? primaryColor : '#0f172a'}
                  stroke={isSelected ? '#38bdf8' : region.unlocked ? '#ecfdf5' : '#475569'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  filter={region.unlocked ? 'url(#glow)' : undefined}
                />

                {/* Text Label */}
                <text
                  x={cx}
                  y={cy - 12}
                  textAnchor="middle"
                  fill={region.unlocked ? '#e2e8f0' : '#94a3b8'}
                  fontSize="11"
                  fontWeight={isSelected ? 'bold' : '600'}
                  fontFamily="monospace"
                  className="pointer-events-none drop-shadow-md select-none"
                >
                  {region.name.split('(')[0].trim()}
                </text>

                {/* Compute / Locked pill tag below */}
                <text
                  x={cx}
                  y={cy + 16}
                  textAnchor="middle"
                  fill={region.unlocked ? primaryColor : '#64748b'}
                  fontSize="9.5"
                  fontFamily="monospace"
                  className="pointer-events-none drop-shadow-md select-none"
                >
                  {region.unlocked
                    ? `${region.computeCapacityTflops} TFLOPS`
                    : `[LOCKED - ${formatCurrency(region.unlockCost)}]`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredRegion && (
          <div
            className="absolute z-20 pointer-events-none p-3 rounded-lg bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md text-xs font-mono text-slate-200 transition-all"
            style={{
              left: `${Math.min(78, Math.max(12, hoveredRegion.x))}%`,
              top: `${Math.min(75, Math.max(10, hoveredRegion.y))}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="font-bold text-white text-sm flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5 mb-1.5">
              <span>{hoveredRegion.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {hoveredRegion.code}
              </span>
            </div>
            {hoveredRegion.unlocked ? (
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Compute:</span>
                  <span className="text-emerald-400 font-semibold">
                    {formatFlops(hoveredRegion.computeCapacityTflops)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Temperature:</span>
                  <span
                    className={
                      hoveredRegion.tempCelsius > 55
                        ? 'text-rose-400 font-semibold'
                        : 'text-cyan-400'
                    }
                  >
                    {hoveredRegion.tempCelsius}°C
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Power:</span>
                  <span className="text-amber-400">
                    {formatPower(hoveredRegion.powerConsumptionKw)} (PUE {hoveredRegion.pue})
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Tier:</span>
                  <span className="text-indigo-300">Facility Tier {hoveredRegion.tier}</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-400">
                <div>Site survey available.</div>
                <div className="text-emerald-400 font-semibold mt-1">
                  Cost to Acquire: {formatCurrency(hoveredRegion.unlockCost)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Region Quick Action / Telemetry Bar */}
      {activeRegion && (
        <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                !activeRegion.unlocked
                  ? 'bg-slate-500'
                  : activeRegion.status === 'optimal'
                  ? 'bg-emerald-400 animate-pulse'
                  : activeRegion.status === 'warning'
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
            />
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{activeRegion.name}</span>
                <span className="text-xs font-mono text-slate-400">({activeRegion.code})</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3 font-mono">
                {activeRegion.unlocked ? (
                  <>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-400" />
                      {formatFlops(activeRegion.computeCapacityTflops)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-cyan-400" />
                      {activeRegion.tempCelsius}°C
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-indigo-400" />
                      Tier {activeRegion.tier}
                    </span>
                  </>
                ) : (
                  <span className="text-amber-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Unlocked Land Ready for Datacenter Construction
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            {!activeRegion.unlocked ? (
              <button
                onClick={() => onUnlockRegion(activeRegion.id)}
                disabled={cash < activeRegion.unlockCost}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition ${
                  cash >= activeRegion.unlockCost
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                ACQUIRE & BUILD ({formatCurrency(activeRegion.unlockCost)})
              </button>
            ) : (
              <button
                onClick={() => {
                  const el = document.getElementById('datacenter-detail-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-semibold transition flex items-center gap-2"
              >
                OPEN REGIONAL CONTROLS ↓
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
