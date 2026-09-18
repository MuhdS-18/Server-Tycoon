import { useState } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { Header } from './components/Header';
import { IncidentsBanner } from './components/IncidentsBanner';
import { WorldMap } from './components/WorldMap';
import { DatacenterDetail } from './components/DatacenterDetail';
import { HardwareFab } from './components/HardwareFab';
import { TechTree } from './components/TechTree';
import { ContractsView } from './components/ContractsView';
import { FinancialsModal } from './components/FinancialsModal';
import { MilestonesModal } from './components/MilestonesModal';
import { Globe, Cpu, Briefcase, FlaskConical } from 'lucide-react';

export default function App() {
  const {
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
  } = useGameEngine();

  // Tabs state
  const [activeTab, setActiveTab] = useState<'datacenter' | 'fab' | 'contracts' | 'tech'>('datacenter');

  // Modals state
  const [isFinancialsOpen, setIsFinancialsOpen] = useState(false);
  const [isMilestonesOpen, setIsMilestonesOpen] = useState(false);

  // Active region details object
  const activeRegion = state.regions.find((r) => r.id === state.activeRegionId) || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Header Navigation and Stats */}
      <Header
        state={state}
        onSetSpeed={setGameSpeed}
        onToggleSound={toggleSound}
        onOpenFinancials={() => setIsFinancialsOpen(true)}
        onOpenMilestones={() => setIsMilestonesOpen(true)}
        onResetGame={resetGame}
      />

      {/* 2. Critical Alert/Incident Strip */}
      <IncidentsBanner
        incidents={state.activeIncidents}
        cash={state.cash}
        onResolve={resolveIncident}
      />

      {/* 3. Main Operational Dashboard Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Core Domain Tab Selection Bar */}
        <div className="flex border-b border-slate-800 p-1 bg-slate-900/60 rounded-xl max-w-2xl">
          <button
            onClick={() => setActiveTab('datacenter')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all ${
              activeTab === 'datacenter'
                ? 'bg-slate-950 text-cyan-400 shadow-md shadow-slate-950 border border-slate-800'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/45'
            }`}
          >
            <Globe className="w-4 h-4" />
            GRID MAP
          </button>
          <button
            onClick={() => setActiveTab('fab')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all ${
              activeTab === 'fab'
                ? 'bg-slate-950 text-cyan-400 shadow-md shadow-slate-950 border border-slate-800'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/45'
            }`}
          >
            <Cpu className="w-4 h-4" />
            SILICON FAB
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all ${
              activeTab === 'contracts'
                ? 'bg-slate-950 text-cyan-400 shadow-md shadow-slate-950 border border-slate-800'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/45'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            SLA TENANTS
          </button>
          <button
            onClick={() => setActiveTab('tech')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all ${
              activeTab === 'tech'
                ? 'bg-slate-950 text-cyan-400 shadow-md shadow-slate-950 border border-slate-800'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/45'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            R&D TECH
          </button>
        </div>

        {/* Tab Operation Interfaces */}
        <div className="space-y-6">
          {activeTab === 'datacenter' && (
            <div className="space-y-6">
              {/* Interactive SVG World Map */}
              <WorldMap
                regions={state.regions}
                interlinks={state.interlinks}
                activeRegionId={state.activeRegionId}
                onSelectRegion={setActiveRegion}
                onUnlockRegion={unlockRegion}
                cash={state.cash}
              />

              {/* Selected Datacenter Telemetry, Upgrades and Operations */}
              {activeRegion && (
                <DatacenterDetail
                  region={activeRegion}
                  rackInventory={state.rackInventory}
                  cash={state.cash}
                  technologies={state.technologies}
                  onDeployRack={deployRackToRegion}
                  onRemoveRack={removeRackFromRegion}
                  onUpgradeTier={upgradeRegionTier}
                  onChangePower={changeRegionPower}
                  onChangeCooling={changeRegionCooling}
                  onGoToFab={() => setActiveTab('fab')}
                />
              )}
            </div>
          )}

          {activeTab === 'fab' && (
            <HardwareFab
              cash={state.cash}
              rawMaterials={state.rawMaterials}
              rawMaterialPrices={state.rawMaterialPrices}
              components={state.components}
              rackInventory={state.rackInventory}
              activeFabrications={state.activeFabrications}
              fabSlots={state.fabSlots}
              fabCleanroomClass={state.fabCleanroomClass}
              technologies={state.technologies}
              hasChipShortage={state.activeIncidents.some((i) => i.type === 'chip_shortage')}
              onBuyRawMaterial={buyRawMaterial}
              onStartComponentFab={startComponentFabrication}
              onStartRackAssembly={startRackAssembly}
              onCancelFab={cancelFabrication}
              onToggleAutoRepeat={toggleAutoRepeat}
              onUpgradeFabSlots={upgradeFabSlots}
              onSellComponent={sellComponent}
              onSellRack={sellRack}
            />
          )}

          {activeTab === 'contracts' && (
            <ContractsView
              contracts={state.contracts}
              regions={state.regions}
              onAcceptContract={acceptContract}
              onAbandonContract={abandonContract}
            />
          )}

          {activeTab === 'tech' && (
            <TechTree
              technologies={state.technologies}
              researchPoints={state.researchPoints}
              onUnlockTech={unlockTechnology}
            />
          )}
        </div>
      </main>

      {/* 4. Financial Status Modal */}
      <FinancialsModal
        isOpen={isFinancialsOpen}
        onClose={() => setIsFinancialsOpen(false)}
        state={state}
      />

      {/* 5. Company Milestones/Achievements Modal */}
      <MilestonesModal
        isOpen={isMilestonesOpen}
        onClose={() => setIsMilestonesOpen(false)}
        state={state}
      />
    </div>
  );
}
