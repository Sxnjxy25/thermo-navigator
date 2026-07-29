// Thermodynamics calculation engine
// Contains all formulas for ideal gas processes, cycles, heat exchange, refrigeration, and heat transfer

// ==================== CONSTANTS ====================
export const R_UNIVERSAL = 8.314; // J/(mol·K)
export const R_AIR = 0.287; // kJ/(kg·K) for air

// ==================== IDEAL GAS PROCESSES ====================

export interface GasProcessInput {
  T1: number; P1: number; V1: number;
  T2?: number; P2?: number; V2?: number;
  gamma?: number; n?: number; R?: number; Cv?: number; Cp?: number;
}

export interface GasProcessResult {
  T2: number; P2: number; V2: number;
  work: number; heat: number; deltaU: number;
  processName: string;
}

export function isothermalProcess(P1: number, V1: number, V2: number, T: number, R: number = R_AIR): GasProcessResult {
  const safeV2 = V2 || V1 || 1;
  const safeV1 = V1 || 1;
  const P2 = safeV1 > 0 ? (P1 * safeV1) / safeV2 : P1;
  const ratio = safeV2 / safeV1;
  const work = ratio > 0 ? P1 * safeV1 * Math.log(ratio) : 0;
  return { T2: T, P2, V2: safeV2, work, heat: work, deltaU: 0, processName: 'Isothermal' };
}

export function adiabaticProcess(P1: number, V1: number, T1: number, V2: number, gamma: number = 1.4): GasProcessResult {
  const g = gamma > 1 ? gamma : 1.4;
  const safeV2 = V2 || V1 || 1;
  const safeV1 = V1 || 1;
  const ratio = safeV1 / safeV2;
  const P2 = P1 * Math.pow(ratio, g);
  const T2 = T1 * Math.pow(ratio, g - 1);
  const Cv = R_AIR / (g - 1);
  const work = Cv * (T1 - T2);
  return { T2, P2, V2: safeV2, work, heat: 0, deltaU: -work, processName: 'Adiabatic' };
}

export function polytropicProcess(P1: number, V1: number, T1: number, V2: number, n: number, gamma: number = 1.4): GasProcessResult {
  const g = gamma > 1 ? gamma : 1.4;
  const safeV2 = V2 || V1 || 1;
  const safeV1 = V1 || 1;
  const ratio = safeV1 / safeV2;
  const P2 = P1 * Math.pow(ratio, n);
  const T2 = T1 * Math.pow(ratio, n - 1);
  const Cv = R_AIR / (g - 1);
  const work = Math.abs(n - 1) < 1e-6 ? P1 * safeV1 * Math.log(safeV2 / safeV1) : (P1 * safeV1 - P2 * safeV2) / (n - 1);
  const deltaU = Cv * (T2 - T1);
  const heat = deltaU + work;
  return { T2, P2, V2: safeV2, work, heat, deltaU, processName: 'Polytropic' };
}

export function isobaricProcess(P: number, V1: number, T1: number, V2: number, gamma: number = 1.4): GasProcessResult {
  const g = gamma > 1 ? gamma : 1.4;
  const safeV1 = V1 || 1;
  const T2 = T1 * (V2 / safeV1);
  const Cv = R_AIR / (g - 1);
  const Cp = Cv + R_AIR;
  const work = P * (V2 - safeV1);
  const deltaU = Cv * (T2 - T1);
  const heat = Cp * (T2 - T1);
  return { T2, P2: P, V2, work, heat, deltaU, processName: 'Isobaric' };
}

export function isochoricProcess(V: number, P1: number, T1: number, P2: number, gamma: number = 1.4): GasProcessResult {
  const g = gamma > 1 ? gamma : 1.4;
  const safeP1 = P1 || 1;
  const T2 = T1 * (P2 / safeP1);
  const Cv = R_AIR / (g - 1);
  const deltaU = Cv * (T2 - T1);
  return { T2, P2, V2: V, work: 0, heat: deltaU, deltaU, processName: 'Isochoric' };
}

// ==================== THERMODYNAMIC CYCLES ====================

export interface OttoCycleInput {
  T1: number; P1: number; compressionRatio: number; gamma: number; Qin: number; m?: number;
}

export interface OttoCycleResult {
  efficiency: number;
  T1: number; T2: number; T3: number; T4: number;
  Wnet: number; Qin: number; Qout: number;
  MEP: number;
}

export function ottoCycle(input: OttoCycleInput): OttoCycleResult {
  const { T1, P1, compressionRatio: r, gamma, Qin } = input;
  const g = gamma > 1 ? gamma : 1.4;
  const safeR = r > 1 ? r : 1.001;
  const Cv = R_AIR / (g - 1);
  
  const T2 = T1 * Math.pow(safeR, g - 1);
  const T3 = T2 + Qin / Cv;
  const T4 = T3 * Math.pow(1 / safeR, g - 1);
  
  const efficiency = 1 - 1 / Math.pow(safeR, g - 1);
  const Wnet = Qin * efficiency;
  const Qout = Qin - Wnet;
  
  const safeP1 = P1 || 100;
  const V1 = R_AIR * T1 / safeP1;
  const V2 = V1 / safeR;
  const MEP = (V1 - V2) !== 0 ? Wnet / (V1 - V2) : 0;
  
  return { efficiency, T1, T2, T3, T4, Wnet, Qin, Qout, MEP };
}

export interface RankineCycleInput {
  boilerPressure: number; condenserPressure: number;
  boilerTemp: number; condenserTemp: number;
  h1: number; h2: number; h3: number; h4: number;
  massFlow: number;
}

export interface RankineCycleResult {
  turbineWork: number; pumpWork: number; netWork: number;
  Qin: number; Qout: number; efficiency: number; powerOutput: number;
}

export function rankineCycle(input: RankineCycleInput): RankineCycleResult {
  const { h1, h2, h3, h4, massFlow } = input;
  const turbineWork = h3 - h4;
  const pumpWork = h2 - h1;
  const netWork = turbineWork - pumpWork;
  const Qin = h3 - h2;
  const Qout = h4 - h1;
  const efficiency = Qin !== 0 ? netWork / Qin : 0;
  const powerOutput = massFlow * netWork;
  return { turbineWork, pumpWork, netWork, Qin, Qout, efficiency, powerOutput };
}

export interface DieselCycleInput {
  T1: number; P1: number; compressionRatio: number; cutoffRatio: number; gamma: number; Qin: number;
}

export interface DieselCycleResult {
  efficiency: number; T1: number; T2: number; T3: number; T4: number;
  Wnet: number; Qin: number; Qout: number; MEP: number;
}

export function dieselCycle(input: DieselCycleInput): DieselCycleResult {
  const { T1, P1, compressionRatio: r, cutoffRatio: rc, gamma, Qin } = input;
  const g = gamma > 1 ? gamma : 1.4;
  const safeR = r > 1 ? r : 1.001;
  const safeRc = rc > 1 ? rc : 1.001;
  const Cv = R_AIR / (g - 1);
  const Cp = Cv + R_AIR;
  
  const T2 = T1 * Math.pow(safeR, g - 1);
  const T3 = T2 * safeRc;
  const T4 = T3 * Math.pow(safeRc / safeR, g - 1);
  
  const denom = g * (safeRc - 1);
  const term = denom !== 0 ? (Math.pow(safeRc, g) - 1) / denom : 1;
  const efficiency = 1 - (1 / Math.pow(safeR, g - 1)) * term;
  const Wnet = Qin * efficiency;
  const Qout = Qin - Wnet;
  
  const safeP1 = P1 || 100;
  const V1 = R_AIR * T1 / safeP1;
  const V2 = V1 / safeR;
  const MEP = (V1 - V2) !== 0 ? Wnet / (V1 - V2) : 0;
  
  return { efficiency, T1, T2, T3, T4, Wnet, Qin, Qout, MEP };
}

export interface BraytonCycleInput {
  T1: number; T3: number; pressureRatio: number; gamma: number;
}

export interface BraytonCycleResult {
  efficiency: number; T1: number; T2: number; T3: number; T4: number;
  Wnet: number; Wcompressor: number; Wturbine: number; backWorkRatio: number;
}

export function braytonCycle(input: BraytonCycleInput): BraytonCycleResult {
  const { T1, T3, pressureRatio: rp, gamma } = input;
  const g = gamma > 1 ? gamma : 1.4;
  const safeRp = rp > 1 ? rp : 1.001;
  const Cp = g * R_AIR / (g - 1);
  
  const T2 = T1 * Math.pow(safeRp, (g - 1) / g);
  const T4 = T3 / Math.pow(safeRp, (g - 1) / g);
  
  const efficiency = 1 - 1 / Math.pow(safeRp, (g - 1) / g);
  const Wcompressor = Cp * (T2 - T1);
  const Wturbine = Cp * (T3 - T4);
  const Wnet = Wturbine - Wcompressor;
  const backWorkRatio = Wturbine !== 0 ? Wcompressor / Wturbine : 0;
  
  return { efficiency, T1, T2, T3, T4, Wnet, Wcompressor, Wturbine, backWorkRatio };
}

// ==================== HEAT EXCHANGE ====================

export interface LMTDInput {
  Thi: number; Tho: number; Tci: number; Tco: number;
  U: number; A: number; flowType: 'parallel' | 'counter';
}

export interface LMTDResult {
  LMTD: number; Q: number; dT1: number; dT2: number;
  effectiveness: number; NTU: number;
}

export function lmtdMethod(input: LMTDInput): LMTDResult {
  const { Thi, Tho, Tci, Tco, U, A, flowType } = input;
  
  let dT1: number, dT2: number;
  if (flowType === 'counter') {
    dT1 = Thi - Tco;
    dT2 = Tho - Tci;
  } else {
    dT1 = Thi - Tci;
    dT2 = Tho - Tco;
  }
  
  const LMTD = (dT1 <= 0 || dT2 <= 0 || Math.abs(dT1 - dT2) < 0.001)
    ? (Math.abs(dT1) + Math.abs(dT2)) / 2
    : (dT1 - dT2) / Math.log(dT1 / dT2);
  const Q = U * A * LMTD;
  
  const dTh = Math.abs(Thi - Tho) || 1e-6;
  const dTc = Math.abs(Tco - Tci) || 1e-6;
  const Ch = Q / dTh;
  const Cc = Q / dTc;
  const Cmin = Math.min(Ch, Cc) || 1e-6;
  const dTmax = Math.abs(Thi - Tci) || 1e-6;
  const effectiveness = Cmin * dTmax !== 0 ? Q / (Cmin * dTmax) : 0;
  const NTU = Cmin !== 0 ? (U * A) / Cmin : 0;
  
  return { LMTD, Q, dT1, dT2, effectiveness, NTU };
}

export interface ENTUInput {
  Thi: number; Tci: number;
  Ch: number; Cc: number;
  U: number; A: number;
  flowType: 'parallel' | 'counter';
}

export interface ENTUResult {
  effectiveness: number; NTU: number; Cr: number;
  Q: number; Tho: number; Tco: number;
}

export function entuMethod(input: ENTUInput): ENTUResult {
  const { Thi, Tci, Ch, Cc, U, A, flowType } = input;
  const Cmin = Math.min(Ch, Cc) || 1e-6;
  const Cmax = Math.max(Ch, Cc) || 1e-6;
  const Cr = Cmin / Cmax;
  const NTU = (U * A) / Cmin;
  
  let effectiveness: number;
  if (flowType === 'counter') {
    if (Math.abs(Cr - 1) < 0.001) {
      effectiveness = NTU / (1 + NTU);
    } else {
      const expTerm = Math.exp(-NTU * (1 - Cr));
      effectiveness = (1 - expTerm) / (1 - Cr * expTerm);
    }
  } else {
    effectiveness = (1 - Math.exp(-NTU * (1 + Cr))) / (1 + Cr);
  }
  
  const Q = effectiveness * Cmin * (Thi - Tci);
  const safeCh = Ch || 1e-6;
  const safeCc = Cc || 1e-6;
  const Tho = Thi - Q / safeCh;
  const Tco = Tci + Q / safeCc;
  
  return { effectiveness, NTU, Cr, Q, Tho, Tco };
}

// ==================== REFRIGERATION ====================

export interface VaporCompressionInput {
  h1: number; h2: number; h3: number; h4: number;
  massFlow: number;
}

export interface VaporCompressionResult {
  COP: number; compressorWork: number; Qevaporator: number;
  Qcondenser: number; powerInput: number;
}

export function vaporCompression(input: VaporCompressionInput): VaporCompressionResult {
  const { h1, h2, h3, h4, massFlow } = input;
  const compressorWork = h2 - h1;
  const Qcondenser = h2 - h3;
  const Qevaporator = h1 - h4;
  const COP = compressorWork !== 0 ? Qevaporator / compressorWork : 0;
  const powerInput = massFlow * compressorWork;
  return { COP, compressorWork, Qevaporator, Qcondenser, powerInput };
}

// ==================== HEAT TRANSFER ====================

export interface ConductionInput {
  k: number; A: number; T1: number; T2: number; L: number;
}

export interface ConductionResult {
  Q: number; R_thermal: number; heatFlux: number;
}

export function conduction(input: ConductionInput): ConductionResult {
  const { k, A, T1, T2, L } = input;
  const denominator = k * A;
  const R_thermal = denominator !== 0 ? L / denominator : 0;
  const Q = R_thermal !== 0 ? (T1 - T2) / R_thermal : 0;
  const heatFlux = A !== 0 ? Q / A : 0;
  return { Q, R_thermal, heatFlux };
}

export interface CompositeWallLayer {
  k: number; L: number;
}

export interface CompositeWallInput {
  layers: CompositeWallLayer[];
  A: number; T1: number; T2: number;
}

export interface CompositeWallResult {
  totalResistance: number;
  Q: number;
  heatFlux: number;
  layerResistances: number[];
  interfaceTemperatures: number[];
}

export function compositeWall(input: CompositeWallInput): CompositeWallResult {
  const { layers, A, T1, T2 } = input;
  const safeA = A || 1;
  const layerResistances = layers.map(l => {
    const den = l.k * safeA;
    return den !== 0 ? l.L / den : 0;
  });
  const totalResistance = layerResistances.reduce((s, r) => s + r, 0);
  const Q = totalResistance !== 0 ? (T1 - T2) / totalResistance : 0;
  const heatFlux = safeA !== 0 ? Q / safeA : 0;
  
  const interfaceTemperatures: number[] = [T1];
  let T = T1;
  for (const R of layerResistances) {
    T = T - Q * R;
    interfaceTemperatures.push(T);
  }
  
  return { totalResistance, Q, heatFlux, layerResistances, interfaceTemperatures };
}

export interface ConvectionInput {
  h: number; A: number; Ts: number; Tinf: number;
}

export function convection(input: ConvectionInput) {
  const { h, A, Ts, Tinf } = input;
  const Q = h * A * (Ts - Tinf);
  const heatFlux = A !== 0 ? Q / A : 0;
  return { Q, heatFlux };
}

export interface RadiationInput {
  epsilon: number; A: number; T1: number; T2: number;
}

export function radiation(input: RadiationInput) {
  const sigma = 5.67e-8;
  const { epsilon, A, T1, T2 } = input;
  const Q = epsilon * sigma * A * (Math.pow(T1, 4) - Math.pow(T2, 4));
  const heatFlux = A !== 0 ? Q / A : 0;
  return { Q, heatFlux };
}

// ==================== TEST CASES ====================

export interface TestCase {
  id: number;
  title: string;
  category: string;
  description: string;
  inputs: Record<string, number | string | Record<string, number>[]>;
  expectedOutputs: Record<string, number | string>;
  run: () => Record<string, number | string>;
}

export const testCases: TestCase[] = [
  {
    id: 1,
    title: 'Otto Cycle (Gasoline Engine)',
    category: 'Thermodynamic Cycles',
    description: 'Calculate efficiency, temperatures, work output, and MEP for a gasoline engine Otto cycle.',
    inputs: { T1: 300, P1: 100, compressionRatio: 8, gamma: 1.4, Qin: 800 },
    expectedOutputs: { efficiency: '56.47%', T2: '689.2 K', T3: '1805.4 K', T4: '786.0 K' },
    run: () => {
      const r = ottoCycle({ T1: 300, P1: 100, compressionRatio: 8, gamma: 1.4, Qin: 800 });
      return {
        'Efficiency': (r.efficiency * 100).toFixed(2) + '%',
        'T2': r.T2.toFixed(1) + ' K',
        'T3': r.T3.toFixed(1) + ' K',
        'T4': r.T4.toFixed(1) + ' K',
        'Net Work': r.Wnet.toFixed(2) + ' kJ/kg',
        'MEP': r.MEP.toFixed(2) + ' kPa',
        'Heat Rejected': r.Qout.toFixed(2) + ' kJ/kg',
      };
    },
  },
  {
    id: 2,
    title: 'Rankine Cycle (Steam Power Plant)',
    category: 'Thermodynamic Cycles',
    description: 'Analyse turbine/pump work, thermal efficiency, and power output for a steam power plant.',
    inputs: { h1: 191.8, h2: 200, h3: 3230, h4: 2100, massFlow: 50 },
    expectedOutputs: { turbineWork: '1130 kJ/kg', pumpWork: '8.2 kJ/kg', efficiency: '37.0%' },
    run: () => {
      const r = rankineCycle({ boilerPressure: 6000, condenserPressure: 10, boilerTemp: 500, condenserTemp: 45.8, h1: 191.8, h2: 200, h3: 3230, h4: 2100, massFlow: 50 });
      return {
        'Turbine Work': r.turbineWork.toFixed(1) + ' kJ/kg',
        'Pump Work': r.pumpWork.toFixed(1) + ' kJ/kg',
        'Net Work': r.netWork.toFixed(1) + ' kJ/kg',
        'Heat Input': r.Qin.toFixed(1) + ' kJ/kg',
        'Efficiency': (r.efficiency * 100).toFixed(1) + '%',
        'Power Output': r.powerOutput.toFixed(1) + ' kW',
      };
    },
  },
  {
    id: 3,
    title: 'Counter-Flow Heat Exchanger',
    category: 'Heat Exchange',
    description: 'Calculate LMTD, effectiveness, NTU, and heat transfer rate for a counter-flow heat exchanger.',
    inputs: { Thi: 150, Tho: 90, Tci: 20, Tco: 60, U: 500, A: 2 },
    expectedOutputs: { LMTD: '78.4 °C', Q: '78,400 W' },
    run: () => {
      const r = lmtdMethod({ Thi: 150, Tho: 90, Tci: 20, Tco: 60, U: 500, A: 2, flowType: 'counter' });
      return {
        'LMTD': r.LMTD.toFixed(2) + ' °C',
        'ΔT₁': r.dT1.toFixed(1) + ' °C',
        'ΔT₂': r.dT2.toFixed(1) + ' °C',
        'Heat Transfer Rate': r.Q.toFixed(1) + ' W',
        'Effectiveness': (r.effectiveness * 100).toFixed(1) + '%',
        'NTU': r.NTU.toFixed(3),
      };
    },
  },
  {
    id: 4,
    title: 'Vapor Compression Refrigeration',
    category: 'Refrigeration',
    description: 'Determine COP, compressor work, and performance analysis for a vapor compression system.',
    inputs: { h1: 240, h2: 275, h3: 100, h4: 100, massFlow: 0.5 },
    expectedOutputs: { COP: '4.0', compressorWork: '35 kJ/kg' },
    run: () => {
      const r = vaporCompression({ h1: 240, h2: 275, h3: 100, h4: 100, massFlow: 0.5 });
      return {
        'COP': r.COP.toFixed(2),
        'Compressor Work': r.compressorWork.toFixed(1) + ' kJ/kg',
        'Evaporator Heat': r.Qevaporator.toFixed(1) + ' kJ/kg',
        'Condenser Heat': r.Qcondenser.toFixed(1) + ' kJ/kg',
        'Power Input': r.powerInput.toFixed(2) + ' kW',
      };
    },
  },
  {
    id: 5,
    title: 'Composite Wall Heat Conduction',
    category: 'Heat Transfer',
    description: 'Calculate thermal resistance, heat flux, and temperature distribution through a composite wall.',
    inputs: {
      layers: [{ k: 0.72, L: 0.1 }, { k: 0.04, L: 0.05 }, { k: 1.4, L: 0.15 }],
      A: 1, T1: 300, T2: 30,
    },
    expectedOutputs: { totalResistance: '1.496 K/W', heatFlux: '180.5 W/m²' },
    run: () => {
      const r = compositeWall({
        layers: [{ k: 0.72, L: 0.1 }, { k: 0.04, L: 0.05 }, { k: 1.4, L: 0.15 }],
        A: 1, T1: 300, T2: 30,
      });
      return {
        'Total Resistance': r.totalResistance.toFixed(4) + ' K/W',
        'Heat Transfer': r.Q.toFixed(2) + ' W',
        'Heat Flux': r.heatFlux.toFixed(2) + ' W/m²',
        'Layer Resistances': r.layerResistances.map(r => r.toFixed(4)).join(', ') + ' K/W',
        'Interface Temps': r.interfaceTemperatures.map(t => t.toFixed(1)).join(' → ') + ' °C',
      };
    },
  },
];
