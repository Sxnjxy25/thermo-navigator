import { useState } from 'react';
import { InputField, CalcButton, ResultDisplay } from './CalculatorUI';
import { vaporCompression } from '@/utils/thermodynamics';

export default function RefrigerationCalculator() {
  const [h1, setH1] = useState<number | string>('');
  const [h2, setH2] = useState<number | string>('');
  const [h3, setH3] = useState<number | string>('');
  const [h4, setH4] = useState<number | string>('');
  const [massFlow, setMassFlow] = useState<number | string>('');
  const [results, setResults] = useState<Record<string, string> | null>(null);

  const num = (v: number | string) => Number(v) || 0;

  const calculate = () => {
    const r = vaporCompression({ h1: num(h1), h2: num(h2), h3: num(h3), h4: num(h4), massFlow: num(massFlow) });
    setResults({
      'Coefficient of Performance (COP)': r.COP.toFixed(2),
      'Compressor Work': r.compressorWork.toFixed(1) + ' kJ/kg',
      'Evaporator Heat Absorption': r.Qevaporator.toFixed(1) + ' kJ/kg',
      'Condenser Heat Rejection': r.Qcondenser.toFixed(1) + ' kJ/kg',
      'Power Input': r.powerInput.toFixed(2) + ' kW',
    });
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-foreground mb-4">Vapor Compression Refrigeration</h3>
      <div className="gradient-card border border-border rounded-xl p-5">
        <p className="text-sm text-muted-foreground mb-4">Enter enthalpy values at each state point of the refrigeration cycle.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InputField label="Enthalpy at Evaporator Exit (h₁)" value={h1} onChange={setH1} unit="kJ/kg" />
          <InputField label="Enthalpy at Compressor Exit (h₂)" value={h2} onChange={setH2} unit="kJ/kg" />
          <InputField label="Enthalpy at Condenser Exit (h₃)" value={h3} onChange={setH3} unit="kJ/kg" />
          <InputField label="Enthalpy at Expansion Valve Exit (h₄)" value={h4} onChange={setH4} unit="kJ/kg" />
          <InputField label="Mass Flow Rate" value={massFlow} onChange={setMassFlow} unit="kg/s" />
        </div>
        <div className="mt-5">
          <CalcButton onClick={calculate}>Calculate COP & Performance</CalcButton>
        </div>
      </div>
      <ResultDisplay results={results} title="Refrigeration System Results" />
    </div>
  );
}
