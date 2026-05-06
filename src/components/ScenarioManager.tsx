import { SavedScenario } from '../types';

interface ScenarioManagerProps {
  scenarios: SavedScenario[];
  scenarioName: string;
  onScenarioNameChange: (value: string) => void;
  onSaveScenario: () => void;
  onLoadScenario: (id: string) => void;
  onDeleteScenario: (id: string) => void;
  onLoadPreset: (name: 'Conservative' | 'Realistic' | 'Aggressive') => void;
}

export function ScenarioManager({ scenarios, scenarioName, onScenarioNameChange, onSaveScenario, onLoadScenario, onDeleteScenario, onLoadPreset }: ScenarioManagerProps) {
  return (
    <section className="card section-card">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Scenario manager</div>
          <h3>Save, load, and compare cases</h3>
        </div>
        <div className="row wrap">
          {(['Conservative', 'Realistic', 'Aggressive'] as const).map((preset) => (
            <button className="secondary-button" type="button" key={preset} onClick={() => onLoadPreset(preset)}>{preset}</button>
          ))}
        </div>
      </div>
      <div className="row wrap gap-md">
        <input value={scenarioName} onChange={(e) => onScenarioNameChange(e.target.value)} placeholder="Scenario name" />
        <button className="primary-button" type="button" onClick={onSaveScenario}>Save scenario</button>
      </div>
      <div className="scenario-list">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="scenario-item">
            <div>
              <strong>{scenario.name}</strong>
              <div className="muted">Saved {new Date(scenario.savedAt).toLocaleString()}</div>
            </div>
            <div className="row wrap">
              <button className="secondary-button" type="button" onClick={() => onLoadScenario(scenario.id)}>Load</button>
              <button className="text-button danger" type="button" onClick={() => onDeleteScenario(scenario.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
