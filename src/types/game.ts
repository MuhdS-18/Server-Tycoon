export type GameSpeed = 0 | 1 | 2 | 5;

export type PowerType = 'grid' | 'solar_wind' | 'geothermal' | 'nuclear_smr';
export type CoolingType = 'air' | 'direct_liquid' | 'immersion' | 'cryogenic';

export type RawMaterial = 'silicon' | 'rareEarth' | 'copperGold';

export type ComponentType =
  | 'wafer_300mm'
  | 'wafer_euv'
  | 'cpu_chiplet'
  | 'gpu_die'
  | 'quantum_die'
  | 'ddr5_dimm'
  | 'hbm3e_stack'
  | 'server_board'
  | 'fiber_nic';

export type RackType =
  | 'compute_blade_v1'
  | 'compute_blade_v2'
  | 'ai_tensor_v1'
  | 'ai_tensor_v2'
  | 'storage_san_v1'
  | 'quantum_node';

export interface ComponentRecipe {
  id: ComponentType;
  name: string;
  category: 'wafer' | 'die' | 'memory' | 'interconnect';
  description: string;
  techRequired?: string;
  materialsCost: {
    silicon?: number;
    rareEarth?: number;
    copperGold?: number;
    cash?: number;
  };
  componentsCost?: Partial<Record<ComponentType, number>>;
  productionTimeSeconds: number;
  baseMarketValue: number;
}

export interface RackRecipe {
  id: RackType;
  name: string;
  tier: number;
  description: string;
  techRequired?: string;
  componentsCost: Partial<Record<ComponentType, number>>;
  assemblyCostCash: number;
  assemblyTimeSeconds: number;
  // Performance attributes
  computeFlops: number; // in TFLOPS
  storageCapacityPb: number; // in PB
  powerDrawKw: number; // in kW
  heatOutputBtu: number;
  bandwidthNeedGbps: number;
  baseMarketValue: number; // For wholesale selling
}

export interface Region {
  id: string;
  name: string;
  code: string;
  country: string;
  x: number; // percentage on map (0 - 100)
  y: number; // percentage on map (0 - 100)
  unlocked: boolean;
  unlockCost: number;
  tier: 1 | 2 | 3 | 4;
  upgradeCost: number;
  maxRackSlots: number;
  racks: Record<RackType, number>;
  powerType: PowerType;
  coolingType: CoolingType;
  tempCelsius: number;
  ambientTempCelsius: number;
  pue: number; // Power Usage Effectiveness (1.05 - 1.8)
  powerConsumptionKw: number;
  bandwidthCapacityGbps: number;
  currentTrafficGbps: number;
  computeCapacityTflops: number;
  computeLoadPct: number;
  status: 'optimal' | 'warning' | 'throttled' | 'overheated';
}

export interface NetworkInterlink {
  id: string;
  fromRegionId: string;
  toRegionId: string;
  name: string;
  tier: 1 | 2 | 3;
  bandwidthTbps: number;
  latencyMs: number;
  upgradeCost: number;
}

export interface Contract {
  id: string;
  clientName: string;
  sector: 'AI Labs' | 'FinTech' | 'Cloud Gaming' | 'Enterprise ERP' | 'Gov Defense' | 'Autonomous Tech';
  requiredComputeTflops: number;
  requiredStoragePb: number;
  requiredBandwidthGbps: number;
  maxLatencyMs: number;
  preferredRegionId?: string;
  revenuePerSec: number;
  penaltyPerSec: number;
  totalDurationSec: number;
  remainingDurationSec: number;
  accepted: boolean;
  meetingSla: boolean;
}

export interface TechNode {
  id: string;
  name: string;
  branch: 'silicon' | 'cooling' | 'networking' | 'datacenter';
  tier: 1 | 2 | 3 | 4;
  cost: number; // Research points
  unlocked: boolean;
  prerequisites: string[];
  description: string;
  icon: string;
  effects: {
    fabYieldPct?: number;
    fabSpeedMultiplier?: number;
    serverPowerReductionPct?: number;
    pueReduction?: number;
    bandwidthMultiplier?: number;
    unlockedRack?: RackType;
    unlockedComponent?: ComponentType;
    unlockedCooling?: CoolingType;
    unlockedPower?: PowerType;
  };
}

export interface Incident {
  id: string;
  title: string;
  type: 'ddos' | 'subsea_cable' | 'heatwave' | 'chip_shortage' | 'power_surge';
  affectedRegionId?: string;
  description: string;
  severity: 'low' | 'medium' | 'critical';
  remainingSec: number;
  resolveCost: number;
  resolveActionText: string;
  mitigationMultiplier: number;
}

export interface ManufacturingLine {
  id: string;
  name: string;
  type: 'component' | 'rack';
  targetId: ComponentType | RackType;
  progress: number; // 0 to 100%
  active: boolean;
  isAutoRepeat: boolean;
}

export interface GameStats {
  totalRevenueGenerated: number;
  totalRacksManufactured: number;
  totalChipsFabricated: number;
  peakMarketCap: number;
  contractsCompleted: number;
  incidentsResolved: number;
  gameTicks: number;
  uptimeAveragePct: number;
}

export interface GameState {
  companyName: string;
  cash: number;
  researchPoints: number;
  researchPerSec: number;
  gameSpeed: GameSpeed;
  gameTimeSec: number;
  isSoundEnabled: boolean;
  marketCap: number;

  // Raw Materials inventory
  rawMaterials: Record<RawMaterial, number>;
  rawMaterialPrices: Record<RawMaterial, number>;

  // Manufactured components inventory
  components: Record<ComponentType, number>;

  // Manufactured server racks inventory (waiting to be deployed or sold)
  rackInventory: Record<RackType, number>;

  // Regions and Network
  regions: Region[];
  interlinks: NetworkInterlink[];
  activeRegionId: string | null;

  // Manufacturing Lines
  activeFabrications: ManufacturingLine[];
  fabSlots: number;
  fabCleanroomClass: number; // 1000 down to 1

  // Contracts
  contracts: Contract[];
  completedContractIds: string[];

  // Tech Tree
  technologies: TechNode[];

  // Incidents
  activeIncidents: Incident[];

  // Statistics
  stats: GameStats;
}
