import { useState } from 'react';
import { InputField, CalcButton, ResultDisplay, TabButton } from './CalculatorUI';
import { ottoCycle, rankineCycle, dieselCycle, braytonCycle } from '@/utils/thermodynamics';

const cycles = ['Otto', 'Rankine', 'Diesel', 'Brayton'] as const;
type CycleType = typeof cycles[number];

export default function CycleCalculator() {
  const [cycle, setCycle] = useState<CycleType>('Otto');
  const [results, setResults] = useState<Record<string, string> | null>(null);

  // Otto
  const [oT1, setOT1] = useState<number | string>('');
  const [oP1, setOP1] = useState<number | string>('');
  const [oCR, setOCR] = useState<number | string>('');
  const [oGamma, setOGamma] = useState<number | string>('');
  const [oQin, setOQin] = useState<number | string>('');

  // Rankine
  const [rH1, setRH1] = useState<number | string>('');
  const [rH2, setRH2] = useState<number | string>('');
  const [rH3, setRH3] = useState<number | string>('');
  const [rH4, setRH4] = useState<number | string>('');
  const [rMF, setRMF] = useState<number | string>('');

  // Diesel
  const [dT1, setDT1] = useState<number | string>('');
  const [dP1, setDP1] = useState<number | string>('');
  const [dCR, setDCR] = useState<number | string>('');
  const [dRC, setDRC] = useState<number | string>('');
  const [dGamma, setDGamma] = useState<number | string>('');
  const [dQin, setDQin] = useState<number | string>('');

  // Brayton
  const [bT1, setBT1] = useState<number | string>('');
  const [bT3, setBT3] = useState<number | string>('');
  const [bPR, setBPR] = useState<number | string>('');
  const [bGamma, setBGamma] = useState<number | string>('');

  const num = (v: number | string) => Number(v) || 0;

  const calculate = () => {
    switch (cycle) {
      case 'Otto': {
        const r = ottoCycle({ T1: num(oT1), P1: num(oP1), compressionRatio: num(oCR), gamma: num(oGamma), Qin: num(oQin) });
        setResults({ 'Thermal Efficiency': (r.efficiency * 100).toFixed(2) + '%', 'Temperature at State 2 (T₂)': r.T2.toFixed(1) + ' K', 'Temperature at State 3 (T₃)': r.T3.toFixed(1) + ' K', 'Temperature at State 4 (T₄)': r.T4.toFixed(1) + ' K', 'Net Work Output': r.Wnet.toFixed(2) + ' kJ/kg', 'Mean Effective Pressure (MEP)': r.MEP.toFixed(2) + ' kPa', 'Heat Rejected (Q_out)': r.Qout.toFixed(2) + ' kJ/kg' });
        break;
      }
      case 'Rankine': {
        const r = rankineCycle({ boilerPressure: 6000, condenserPressure: 10, boilerTemp: 500, condenserTemp: 45.8, h1: num(rH1), h2: num(rH2), h3: num(rH3), h4: num(rH4), massFlow: num(rMF) });
        setResults({ 'Turbine Work Output': r.turbineWork.toFixed(1) + ' kJ/kg', 'Pump Work Input': r.pumpWork.toFixed(1) + ' kJ/kg', 'Net Work Output': r.netWork.toFixed(1) + ' kJ/kg', 'Thermal Efficiency': (r.efficiency * 100).toFixed(2) + '%', 'Power Output': r.powerOutput.toFixed(1) + ' kW' });
        break;
      }
      case 'Diesel': {
        const r = dieselCycle({ T1: num(dT1), P1: num(dP1), compressionRatio: num(dCR), cutoffRatio: num(dRC), gamma: num(dGamma), Qin: num(dQin) });
        setResults({ 'Thermal Efficiency': (r.efficiency * 100).toFixed(2) + '%', 'Temperature at State 2 (T₂)': r.T2.toFixed(1) + ' K', 'Temperature at State 3 (T₃)': r.T3.toFixed(1) + ' K', 'Temperature at State 4 (T₄)': r.T4.toFixed(1) + ' K', 'Net Work Output': r.Wnet.toFixed(2) + ' kJ/kg', 'Mean Effective Pressure (MEP)': r.MEP.toFixed(2) + ' kPa' });
        break;
      }
      case 'Brayton': {
        const r = braytonCycle({ T1: num(bT1), T3: num(bT3), pressureRatio: num(bPR), gamma: num(bGamma) });
        setResults({ 'Thermal Efficiency': (r.efficiency * 100).toFixed(2) + '%', 'Temperature at State 2 (T₂)': r.T2.toFixed(1) + ' K', 'Temperature at State 4 (T₄)': r.T4.toFixed(1) + ' K', 'Net Work Output': r.Wnet.toFixed(2) + ' kJ/kg', 'Compressor Work': r.Wcompressor.toFixed(2) + ' kJ/kg', 'Turbine Work': r.Wturbine.toFixed(2) + ' kJ/kg', 'Back Work Ratio': (r.backWorkRatio * 100).toFixed(1) + '%' });
        break;
      }
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-foreground mb-4">Thermodynamic Cycles</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {cycles.map((c) => (
          <TabButton key={c} active={cycle === c} onClick={() => { setCycle(c); setResults(null); }}>{c}</TabButton>
        ))}
      </div>
      <div className="gradient-card border border-border rounded-xl p-5">
        {cycle === 'Otto' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InputField label="Initial Temperature (T₁)" value={oT1} onChange={setOT1} unit="K" />
            <InputField label="Initial Pressure (P₁)" value={oP1} onChange={setOP1} unit="kPa" />
            <InputField label="Compression Ratio" value={oCR} onChange={setOCR} />
            <InputField label="Heat Capacity Ratio (γ)" value={oGamma} onChange={setOGamma} />
            <InputField label="Heat Input (Q_in)" value={oQin} onChange={setOQin} unit="kJ/kg" />
          </div>
        )}
        {cycle === 'Rankine' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InputField label="Enthalpy at Condenser Exit (h₁)" value={rH1} onChange={setRH1} unit="kJ/kg" />
            <InputField label="Enthalpy at Pump Exit (h₂)" value={rH2} onChange={setRH2} unit="kJ/kg" />
            <InputField label="Enthalpy at Turbine Inlet (h₃)" value={rH3} onChange={setRH3} unit="kJ/kg" />
            <InputField label="Enthalpy at Turbine Exit (h₄)" value={rH4} onChange={setRH4} unit="kJ/kg" />
            <InputField label="Mass Flow Rate" value={rMF} onChange={setRMF} unit="kg/s" />
          </div>
        )}
        {cycle === 'Diesel' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InputField label="Initial Temperature (T₁)" value={dT1} onChange={setDT1} unit="K" />
            <InputField label="Initial Pressure (P₁)" value={dP1} onChange={setDP1} unit="kPa" />
            <InputField label="Compression Ratio" value={dCR} onChange={setDCR} />
            <InputField label="Cutoff Ratio" value={dRC} onChange={setDRC} />
            <InputField label="Heat Capacity Ratio (γ)" value={dGamma} onChange={setDGamma} />
            <InputField label="Heat Input (Q_in)" value={dQin} onChange={setDQin} unit="kJ/kg" />
          </div>
        )}
        {cycle === 'Brayton' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InputField label="Compressor Inlet Temperature (T₁)" value={bT1} onChange={setBT1} unit="K" />
            <InputField label="Turbine Inlet Temperature (T₃)" value={bT3} onChange={setBT3} unit="K" />
            <InputField label="Pressure Ratio" value={bPR} onChange={setBPR} />
            <InputField label="Heat Capacity Ratio (γ)" value={bGamma} onChange={setBGamma} />
          </div>
        )}
        <div className="mt-5">
          <CalcButton onClick={calculate} variant="green">Calculate {cycle} Cycle</CalcButton>
        </div>
      </div>
      <ResultDisplay results={results} title={`${cycle} Cycle Results`} />
    </div>
  );
}
