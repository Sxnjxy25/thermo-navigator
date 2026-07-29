import { useState } from 'react';
import { Flame, Thermometer, RefreshCw, Snowflake, Zap, FlaskConical, CheckCircle } from 'lucide-react';
import IdealGasCalculator from '@/components/IdealGasCalculator';
import CycleCalculator from '@/components/CycleCalculator';
import HeatExchangeCalculator from '@/components/HeatExchangeCalculator';
import RefrigerationCalculator from '@/components/RefrigerationCalculator';
import HeatTransferCalculator from '@/components/HeatTransferCalculator';
import TestCasesPanel from '@/components/TestCasesPanel';

const modules = [
  { id: 'gas', label: 'Ideal Gas Processes', icon: FlaskConical, color: 'gradient-blue' },
  { id: 'cycles', label: 'Thermo Cycles', icon: RefreshCw, color: 'gradient-green' },
  { id: 'exchange', label: 'Heat Exchange', icon: Flame, color: 'gradient-red' },
  { id: 'refrigeration', label: 'Refrigeration', icon: Snowflake, color: 'gradient-blue' },
  { id: 'transfer', label: 'Heat Transfer', icon: Thermometer, color: 'gradient-green' },
  { id: 'tests', label: 'Test Cases', icon: CheckCircle, color: 'gradient-red' },
] as const;

type ModuleId = typeof modules[number]['id'];

const Index = () => {
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);

  const renderModule = () => {
    switch (activeModule) {
      case 'gas': return <IdealGasCalculator />;
      case 'cycles': return <CycleCalculator />;
      case 'exchange': return <HeatExchangeCalculator />;
      case 'refrigeration': return <RefrigerationCalculator />;
      case 'transfer': return <HeatTransferCalculator />;
      case 'tests': return <TestCasesPanel />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-blue flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">ThermoAnalyzer Pro</h1>
              <p className="text-xs text-muted-foreground">Advanced Thermodynamics & Heat System Calculator</p>
            </div>
          </div>
          {activeModule && (
            <button
              onClick={() => setActiveModule(null)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Dashboard
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!activeModule ? (
          <div>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-2">Select a Module</h2>
              <p className="text-muted-foreground">Choose a calculation module to begin analysis</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {modules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  className="group gradient-card border border-border rounded-xl p-6 text-left hover:border-primary/50 transition-all duration-300 hover:glow-blue"
                >
                  <div className={`w-12 h-12 rounded-lg ${mod.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <mod.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{mod.label}</h3>
                  <p className="text-sm text-muted-foreground">Click to open calculator</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>{renderModule()}</div>
        )}
      </main>
    </div>
  );
};

export default Index;
