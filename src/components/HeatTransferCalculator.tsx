import { useState } from 'react';
import { InputField, CalcButton, ResultDisplay, TabButton } from './CalculatorUI';
import { conduction, convection, radiation, compositeWall } from '@/utils/thermodynamics';

const modes = ['Conduction', 'Convection', 'Radiation', 'Composite Wall'] as const;

export default function HeatTransferCalculator() {
  const [mode, setMode] = useState<typeof modes[number]>('Conduction');
  const [results, setResults] = useState<Record<string, string> | null>(null);

  // Conduction
  const [ck, setCk] = useState<number | string>('');
  const [cA, setCA] = useState<number | string>('');
  const [cT1, setCT1] = useState<number | string>('');
  const [cT2, setCT2] = useState<number | string>('');
  const [cL, setCL] = useState<number | string>('');

  // Convection
  const [ch, setCh] = useState<number | string>('');
  const [cvA, setCvA] = useState<number | string>('');
  const [cTs, setCTs] = useState<number | string>('');
  const [cTinf, setCTinf] = useState<number | string>('');

  // Radiation
  const [rEps, setREps] = useState<number | string>('');
  const [rA, setRA] = useState<number | string>('');
  const [rT1, setRT1] = useState<number | string>('');
  const [rT2, setRT2] = useState<number | string>('');

  // Composite
  const [layers, setLayers] = useState([{ k: '' as number | string, L: '' as number | string }]);
  const [wA, setWA] = useState<number | string>('');
  const [wT1, setWT1] = useState<number | string>('');
  const [wT2, setWT2] = useState<number | string>('');

  const num = (v: number | string) => Number(v) || 0;

  const calculate = () => {
    switch (mode) {
      case 'Conduction': {
        const r = conduction({ k: num(ck), A: num(cA), T1: num(cT1), T2: num(cT2), L: num(cL) });
        setResults({ 'Heat Transfer Rate (Q)': r.Q.toFixed(2) + ' W', 'Thermal Resistance': r.R_thermal.toFixed(6) + ' K/W', 'Heat Flux': r.heatFlux.toFixed(2) + ' W/m²' });
        break;
      }
      case 'Convection': {
        const r = convection({ h: num(ch), A: num(cvA), Ts: num(cTs), Tinf: num(cTinf) });
        setResults({ 'Heat Transfer Rate (Q)': r.Q.toFixed(2) + ' W', 'Heat Flux': r.heatFlux.toFixed(2) + ' W/m²' });
        break;
      }
      case 'Radiation': {
        const r = radiation({ epsilon: num(rEps), A: num(rA), T1: num(rT1), T2: num(rT2) });
        setResults({ 'Heat Transfer Rate (Q)': r.Q.toFixed(2) + ' W', 'Heat Flux': r.heatFlux.toFixed(2) + ' W/m²' });
        break;
      }
      case 'Composite Wall': {
        const parsedLayers = layers.map(l => ({ k: num(l.k), L: num(l.L) }));
        const r = compositeWall({ layers: parsedLayers, A: num(wA), T1: num(wT1), T2: num(wT2) });
        setResults({ 'Total Thermal Resistance': r.totalResistance.toFixed(4) + ' K/W', 'Heat Transfer Rate (Q)': r.Q.toFixed(2) + ' W', 'Heat Flux': r.heatFlux.toFixed(2) + ' W/m²', 'Interface Temperatures': r.interfaceTemperatures.map(t => t.toFixed(1)).join(' → ') + ' °C' });
        break;
      }
    }
  };

  const updateLayer = (i: number, field: 'k' | 'L', v: number) => {
    const nl = [...layers]; nl[i] = { ...nl[i], [field]: v }; setLayers(nl);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-foreground mb-4">Heat Transfer</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {modes.map((m) => (
          <TabButton key={m} active={mode === m} onClick={() => { setMode(m); setResults(null); }}>{m}</TabButton>
        ))}
      </div>
      <div className="gradient-card border border-border rounded-xl p-5">
        {mode === 'Conduction' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InputField label="Thermal Conductivity (k)" value={ck} onChange={setCk} unit="W/mK" />
            <InputField label="Cross-Sectional Area" value={cA} onChange={setCA} unit="m²" />
            <InputField label="Hot Side Temperature (T₁)" value={cT1} onChange={setCT1} unit="°C" />
            <InputField label="Cold Side Temperature (T₂)" value={cT2} onChange={setCT2} unit="°C" />
            <InputField label="Wall Thickness" value={cL} onChange={setCL} unit="m" />
          </div>
        )}
        {mode === 'Convection' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InputField label="Convection Heat Transfer Coefficient (h)" value={ch} onChange={setCh} unit="W/m²K" />
            <InputField label="Surface Area" value={cvA} onChange={setCvA} unit="m²" />
            <InputField label="Surface Temperature" value={cTs} onChange={setCTs} unit="°C" />
            <InputField label="Ambient Temperature (T∞)" value={cTinf} onChange={setCTinf} unit="°C" />
          </div>
        )}
        {mode === 'Radiation' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InputField label="Emissivity (ε)" value={rEps} onChange={setREps} />
            <InputField label="Surface Area" value={rA} onChange={setRA} unit="m²" />
            <InputField label="Surface Temperature (T₁)" value={rT1} onChange={setRT1} unit="K" />
            <InputField label="Surrounding Temperature (T₂)" value={rT2} onChange={setRT2} unit="K" />
          </div>
        )}
        {mode === 'Composite Wall' && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">Define wall layers:</p>
            {layers.map((l, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 mb-2">
                <span className="text-sm text-muted-foreground flex items-center">Layer {i + 1}</span>
                <InputField label="Thermal Conductivity (k)" value={l.k} onChange={(v) => updateLayer(i, 'k', v)} unit="W/mK" />
                <InputField label="Thickness (L)" value={l.L} onChange={(v) => updateLayer(i, 'L', v)} unit="m" />
              </div>
            ))}
            <div className="flex gap-2 my-3">
              <button onClick={() => setLayers([...layers, { k: '', L: '' }])} className="text-xs text-primary hover:underline">+ Add Layer</button>
              {layers.length > 1 && <button onClick={() => setLayers(layers.slice(0, -1))} className="text-xs text-accent hover:underline">− Remove</button>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InputField label="Wall Area" value={wA} onChange={setWA} unit="m²" />
              <InputField label="Hot Side Temperature (T₁)" value={wT1} onChange={setWT1} unit="°C" />
              <InputField label="Cold Side Temperature (T₂)" value={wT2} onChange={setWT2} unit="°C" />
            </div>
          </div>
        )}
        <div className="mt-5">
          <CalcButton onClick={calculate} variant="green">Calculate {mode}</CalcButton>
        </div>
      </div>
      <ResultDisplay results={results} title={`${mode} Results`} />
    </div>
  );
}
