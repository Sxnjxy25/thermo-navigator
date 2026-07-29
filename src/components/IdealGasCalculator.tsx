import { useState } from 'react';
import { InputField, CalcButton, ResultDisplay, TabButton } from './CalculatorUI';
import {
  isothermalProcess, adiabaticProcess, polytropicProcess, isobaricProcess, isochoricProcess,
} from '@/utils/thermodynamics';

const processes = ['Isothermal', 'Adiabatic', 'Polytropic', 'Isobaric', 'Isochoric'] as const;
type ProcessType = typeof processes[number];

export default function IdealGasCalculator() {
  const [process, setProcess] = useState<ProcessType>('Isothermal');
  const [P1, setP1] = useState<number | string>('');
  const [V1, setV1] = useState<number | string>('');
  const [T1, setT1] = useState<number | string>('');
  const [V2, setV2] = useState<number | string>('');
  const [P2, setP2] = useState<number | string>('');
  const [gamma, setGamma] = useState<number | string>('');
  const [n, setN] = useState<number | string>('');
  const [results, setResults] = useState<Record<string, string> | null>(null);

  const num = (v: number | string) => Number(v) || 0;

  const calculate = () => {
    let r;
    switch (process) {
      case 'Isothermal': r = isothermalProcess(num(P1), num(V1), num(V2), num(T1)); break;
      case 'Adiabatic': r = adiabaticProcess(num(P1), num(V1), num(T1), num(V2), num(gamma)); break;
      case 'Polytropic': r = polytropicProcess(num(P1), num(V1), num(T1), num(V2), num(n), num(gamma)); break;
      case 'Isobaric': r = isobaricProcess(num(P1), num(V1), num(T1), num(V2), num(gamma)); break;
      case 'Isochoric': r = isochoricProcess(num(V1), num(P1), num(T1), num(P2), num(gamma)); break;
    }
    setResults({
      'Final Temperature': r.T2.toFixed(2) + ' K',
      'Final Pressure': r.P2.toFixed(2) + ' kPa',
      'Final Volume': r.V2.toFixed(4) + ' m³',
      'Work Done': r.work.toFixed(2) + ' kJ',
      'Heat Transfer': r.heat.toFixed(2) + ' kJ',
      'Change in Internal Energy (ΔU)': r.deltaU.toFixed(2) + ' kJ',
    });
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-foreground mb-4">Ideal Gas Processes</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {processes.map((p) => (
          <TabButton key={p} active={process === p} onClick={() => { setProcess(p); setResults(null); }}>
            {p}
          </TabButton>
        ))}
      </div>
      <div className="gradient-card border border-border rounded-xl p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InputField label="Initial Pressure (P₁)" value={P1} onChange={setP1} unit="kPa" />
          <InputField label="Initial Volume (V₁)" value={V1} onChange={setV1} unit="m³" />
          <InputField label="Initial Temperature (T₁)" value={T1} onChange={setT1} unit="K" />
          {process !== 'Isochoric' && <InputField label="Final Volume (V₂)" value={V2} onChange={setV2} unit="m³" />}
          {process === 'Isochoric' && <InputField label="Final Pressure (P₂)" value={P2} onChange={setP2} unit="kPa" />}
          {(process === 'Adiabatic' || process === 'Polytropic' || process === 'Isobaric' || process === 'Isochoric') && (
            <InputField label="Heat Capacity Ratio (γ)" value={gamma} onChange={setGamma} />
          )}
          {process === 'Polytropic' && <InputField label="Polytropic Index (n)" value={n} onChange={setN} />}
        </div>
        <div className="mt-5">
          <CalcButton onClick={calculate}>Calculate {process} Process</CalcButton>
        </div>
      </div>
      <ResultDisplay results={results} title={`${process} Process Results`} />
    </div>
  );
}
