import { useState } from 'react';
import { testCases } from '@/utils/thermodynamics';
import { CalcButton } from './CalculatorUI';
import { CheckCircle, Play } from 'lucide-react';

export default function TestCasesPanel() {
  const [results, setResults] = useState<Record<number, Record<string, string | number> | null>>({});

  const runTest = (id: number) => {
    const tc = testCases.find(t => t.id === id);
    if (tc) setResults(prev => ({ ...prev, [id]: tc.run() }));
  };

  const runAll = () => {
    const all: Record<number, Record<string, string | number>> = {};
    testCases.forEach(tc => { all[tc.id] = tc.run(); });
    setResults(all);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-foreground">Test Cases</h3>
        <CalcButton onClick={runAll} variant="green">
          <span className="flex items-center gap-2"><Play className="w-4 h-4" /> Run All Tests</span>
        </CalcButton>
      </div>

      <div className="space-y-4">
        {testCases.map((tc) => (
          <div key={tc.id} className="gradient-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-0.5 rounded">Test {tc.id}</span>
                  <span className="text-xs text-muted-foreground">{tc.category}</span>
                </div>
                <h4 className="text-lg font-semibold text-foreground mt-1">{tc.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{tc.description}</p>
              </div>
              <button
                onClick={() => runTest(tc.id)}
                className="gradient-blue text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" /> Run
              </button>
            </div>

            {/* Inputs summary */}
            <div className="bg-muted/30 rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">INPUTS</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(tc.inputs).map(([k, v]) => (
                  <span key={k} className="text-xs font-mono bg-muted rounded px-2 py-1 text-foreground">
                    {k}: {typeof v === 'object' ? JSON.stringify(v) : v}
                  </span>
                ))}
              </div>
            </div>

            {/* Results */}
            {results[tc.id] && (
              <div className="border-t border-border pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm font-semibold text-success">Results</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(results[tc.id]!).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center bg-muted/30 rounded-lg px-3 py-2">
                      <span className="text-xs text-muted-foreground">{key}</span>
                      <span className="text-xs font-mono font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
