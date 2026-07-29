import { useState, ReactNode } from 'react';

interface ResultDisplayProps {
  results: Record<string, string | number> | null;
  title: string;
}

export function ResultDisplay({ results, title }: ResultDisplayProps) {
  if (!results) return null;
  return (
    <div className="mt-6 gradient-card border border-border rounded-xl p-5">
      <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(results).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center bg-muted/30 rounded-lg px-4 py-2.5">
            <span className="text-sm text-muted-foreground">{key}</span>
            <span className="text-sm font-mono font-semibold text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const unitOptions: Record<string, string[]> = {
  '°C': ['°C', '°F', 'K'],
  'K': ['K', '°C', '°F'],
  'kPa': ['kPa', 'Pa', 'bar', 'atm', 'psi'],
  'Pa': ['Pa', 'kPa', 'bar', 'atm', 'psi'],
  'W': ['W', 'kW', 'MW', 'BTU/h'],
  'kW': ['kW', 'W', 'MW', 'BTU/h'],
  'W/mK': ['W/mK', 'BTU/(h·ft·°F)'],
  'W/m²K': ['W/m²K', 'BTU/(h·ft²·°F)'],
  'm²': ['m²', 'cm²', 'ft²'],
  'm': ['m', 'cm', 'mm', 'ft', 'in'],
  'kJ/kg': ['kJ/kg', 'J/kg', 'BTU/lb'],
  'W/K': ['W/K', 'kW/K', 'BTU/(h·°F)'],
  'kg/s': ['kg/s', 'kg/h', 'lb/s'],
  'W/m²': ['W/m²', 'kW/m²', 'BTU/(h·ft²)'],
  'K/W': ['K/W', '°C/W'],
  'J': ['J', 'kJ', 'BTU'],
  'm³': ['m³', 'L', 'cm³', 'ft³'],
};

const conversionFactors: Record<string, Record<string, { multiply: number; offset?: number }>> = {
  '°C': { '°C': { multiply: 1 }, '°F': { multiply: 9/5, offset: 32 }, 'K': { multiply: 1, offset: 273.15 } },
  'K': { 'K': { multiply: 1 }, '°C': { multiply: 1, offset: -273.15 }, '°F': { multiply: 9/5, offset: -459.67 } },
  'kPa': { 'kPa': { multiply: 1 }, 'Pa': { multiply: 1000 }, 'bar': { multiply: 0.01 }, 'atm': { multiply: 1/101.325 }, 'psi': { multiply: 0.145038 } },
  'Pa': { 'Pa': { multiply: 1 }, 'kPa': { multiply: 0.001 }, 'bar': { multiply: 1e-5 }, 'atm': { multiply: 1/101325 }, 'psi': { multiply: 0.000145038 } },
  'W': { 'W': { multiply: 1 }, 'kW': { multiply: 0.001 }, 'MW': { multiply: 1e-6 }, 'BTU/h': { multiply: 3.41214 } },
  'kW': { 'kW': { multiply: 1 }, 'W': { multiply: 1000 }, 'MW': { multiply: 0.001 }, 'BTU/h': { multiply: 3412.14 } },
  'W/mK': { 'W/mK': { multiply: 1 }, 'BTU/(h·ft·°F)': { multiply: 0.5778 } },
  'W/m²K': { 'W/m²K': { multiply: 1 }, 'BTU/(h·ft²·°F)': { multiply: 0.1761 } },
  'm²': { 'm²': { multiply: 1 }, 'cm²': { multiply: 10000 }, 'ft²': { multiply: 10.7639 } },
  'm': { 'm': { multiply: 1 }, 'cm': { multiply: 100 }, 'mm': { multiply: 1000 }, 'ft': { multiply: 3.28084 }, 'in': { multiply: 39.3701 } },
  'kJ/kg': { 'kJ/kg': { multiply: 1 }, 'J/kg': { multiply: 1000 }, 'BTU/lb': { multiply: 0.429923 } },
  'W/K': { 'W/K': { multiply: 1 }, 'kW/K': { multiply: 0.001 }, 'BTU/(h·°F)': { multiply: 1.8956 } },
  'kg/s': { 'kg/s': { multiply: 1 }, 'kg/h': { multiply: 3600 }, 'lb/s': { multiply: 2.20462 } },
  'W/m²': { 'W/m²': { multiply: 1 }, 'kW/m²': { multiply: 0.001 }, 'BTU/(h·ft²)': { multiply: 0.316998 } },
  'K/W': { 'K/W': { multiply: 1 }, '°C/W': { multiply: 1 } },
  'J': { 'J': { multiply: 1 }, 'kJ': { multiply: 0.001 }, 'BTU': { multiply: 0.000947817 } },
  'm³': { 'm³': { multiply: 1 }, 'L': { multiply: 1000 }, 'cm³': { multiply: 1e6 }, 'ft³': { multiply: 35.3147 } },
};

export function convertToBase(value: number, baseUnit: string, selectedUnit: string): number {
  if (baseUnit === selectedUnit) return value;
  const factors = conversionFactors[baseUnit];
  if (!factors || !factors[selectedUnit]) return value;
  const { multiply, offset } = factors[selectedUnit];
  // Reverse conversion: from selected unit back to base
  if (offset !== undefined) {
    if (baseUnit === '°C' && selectedUnit === '°F') return (value - 32) * 5/9;
    if (baseUnit === '°C' && selectedUnit === 'K') return value - 273.15;
    if (baseUnit === 'K' && selectedUnit === '°C') return value + 273.15;
    if (baseUnit === 'K' && selectedUnit === '°F') return (value + 459.67) * 5/9;
  }
  return value / multiply;
}

interface InputFieldProps {
  label: string;
  value: number | string;
  onChange: (v: number) => void;
  unit?: string;
  placeholder?: string;
}

export function InputField({ label, value, onChange, unit, placeholder }: InputFieldProps) {
  const [selectedUnit, setSelectedUnit] = useState(unit || '');
  const options = unit ? unitOptions[unit] : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseFloat(e.target.value) || 0;
    if (selectedUnit && unit && selectedUnit !== unit) {
      onChange(convertToBase(raw, unit, selectedUnit));
    } else {
      onChange(raw);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">
        {label}
      </label>
      <div className="flex gap-1">
        <input
          type="number"
          value={value}
          placeholder={placeholder || 'Enter value'}
          onChange={handleChange}
          className="flex-1 min-w-0 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors placeholder:text-muted-foreground/40"
        />
        {options && options.length > 1 ? (
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="bg-muted/50 border border-border rounded-lg px-2 py-2 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors cursor-pointer appearance-none min-w-[70px] text-center"
          >
            {options.map((u) => (
              <option key={u} value={u} className="bg-background text-foreground">{u}</option>
            ))}
          </select>
        ) : unit ? (
          <span className="flex items-center px-2 text-xs text-primary/70 font-mono whitespace-nowrap">{unit}</span>
        ) : null}
      </div>
    </div>
  );
}

interface CalcButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'blue' | 'green' | 'red';
}

export function CalcButton({ onClick, children, variant = 'blue' }: CalcButtonProps) {
  const cls = variant === 'green' ? 'gradient-green glow-green' : variant === 'red' ? 'gradient-red glow-red' : 'gradient-blue glow-blue';
  return (
    <button
      onClick={onClick}
      className={`${cls} text-primary-foreground font-semibold px-6 py-2.5 rounded-lg text-sm transition-all hover:opacity-90 active:scale-95`}
    >
      {children}
    </button>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}
