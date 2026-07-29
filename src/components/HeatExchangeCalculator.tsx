import { useState } from 'react';
import { InputField, CalcButton, ResultDisplay, TabButton } from './CalculatorUI';
import { lmtdMethod, entuMethod } from '@/utils/thermodynamics';

export default function HeatExchangeCalculator() {
  const [method, setMethod] = useState<'LMTD' | 'ε-NTU'>('LMTD');
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [flowType, setFlowType] = useState<'parallel' | 'counter'>('counter');

  // LMTD
  const [Thi, setThi] = useState<number | string>('');
  const [Tho, setTho] = useState<number | string>('');
  const [Tci, setTci] = useState<number | string>('');
  const [Tco, setTco] = useState<number | string>('');
  const [U, setU] = useState<number | string>('');
  const [A, setA] = useState<number | string>('');

  // ε-NTU
  const [eThi, setEThi] = useState<number | string>('');
  const [eTci, setETci] = useState<number | string>('');
  const [Ch, setCh] = useState<number | string>('');
  const [Cc, setCc] = useState<number | string>('');
  const [eU, setEU] = useState<number | string>('');
  const [eA, setEA] = useState<number | string>('');

  const num = (v: number | string) => Number(v) || 0;

  const calculate = () => {
    if (method === 'LMTD') {
      const r = lmtdMethod({ Thi: num(Thi), Tho: num(Tho), Tci: num(Tci), Tco: num(Tco), U: num(U), A: num(A), flowType });
      setResults({
        'Log Mean Temperature Difference (LMTD)': r.LMTD.toFixed(2) + ' °C',
        'Temperature Difference at Inlet (ΔT₁)': r.dT1.toFixed(1) + ' °C',
        'Temperature Difference at Outlet (ΔT₂)': r.dT2.toFixed(1) + ' °C',
        'Heat Transfer Rate (Q)': r.Q.toFixed(1) + ' W',
        'Effectiveness (ε)': (r.effectiveness * 100).toFixed(1) + '%',
        'Number of Transfer Units (NTU)': r.NTU.toFixed(3),
      });
    } else {
      const r = entuMethod({ Thi: num(eThi), Tci: num(eTci), Ch: num(Ch), Cc: num(Cc), U: num(eU), A: num(eA), flowType });
      setResults({
        'Effectiveness (ε)': (r.effectiveness * 100).toFixed(2) + '%',
        'Number of Transfer Units (NTU)': r.NTU.toFixed(3),
        'Capacity Ratio (C_r)': r.Cr.toFixed(3),
        'Heat Transfer Rate (Q)': r.Q.toFixed(1) + ' W',
        'Hot Fluid Outlet Temperature': r.Tho.toFixed(1) + ' °C',
        'Cold Fluid Outlet Temperature': r.Tco.toFixed(1) + ' °C',
      });
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-foreground mb-4">Heat Exchange Analysis</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        <TabButton active={method === 'LMTD'} onClick={() => { setMethod('LMTD'); setResults(null); }}>LMTD Method</TabButton>
        <TabButton active={method === 'ε-NTU'} onClick={() => { setMethod('ε-NTU'); setResults(null); }}>ε-NTU Method</TabButton>
      </div>
      <div className="gradient-card border border-border rounded-xl p-5">
        <div className="mb-4 flex gap-2">
          <TabButton active={flowType === 'counter'} onClick={() => setFlowType('counter')}>Counter-Flow</TabButton>
          <TabButton active={flowType === 'parallel'} onClick={() => setFlowType('parallel')}>Parallel-Flow</TabButton>
        </div>
        {method === 'LMTD' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InputField label="Hot Fluid Inlet Temperature" value={Thi} onChange={setThi} unit="°C" />
            <InputField label="Hot Fluid Outlet Temperature" value={Tho} onChange={setTho} unit="°C" />
            <InputField label="Cold Fluid Inlet Temperature" value={Tci} onChange={setTci} unit="°C" />
            <InputField label="Cold Fluid Outlet Temperature" value={Tco} onChange={setTco} unit="°C" />
            <InputField label="Overall Heat Transfer Coefficient (U)" value={U} onChange={setU} unit="W/m²K" />
            <InputField label="Heat Transfer Area" value={A} onChange={setA} unit="m²" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InputField label="Hot Fluid Inlet Temperature" value={eThi} onChange={setEThi} unit="°C" />
            <InputField label="Cold Fluid Inlet Temperature" value={eTci} onChange={setETci} unit="°C" />
            <InputField label="Hot Fluid Heat Capacity Rate (C_hot)" value={Ch} onChange={setCh} unit="W/K" />
            <InputField label="Cold Fluid Heat Capacity Rate (C_cold)" value={Cc} onChange={setCc} unit="W/K" />
            <InputField label="Overall Heat Transfer Coefficient (U)" value={eU} onChange={setEU} unit="W/m²K" />
            <InputField label="Heat Transfer Area" value={eA} onChange={setEA} unit="m²" />
          </div>
        )}
        <div className="mt-5">
          <CalcButton onClick={calculate} variant="red">Calculate {method}</CalcButton>
        </div>
      </div>
      <ResultDisplay results={results} title={`${method} Results (${flowType})`} />
    </div>
  );
}
