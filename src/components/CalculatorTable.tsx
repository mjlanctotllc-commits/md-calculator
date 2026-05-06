import { memo } from 'react';
import { CalculatorRow, DerivedRowMetrics, GlobalSettings, PayType, RowType } from '../types';
import { currency, percent } from '../utils';

interface CalculatorTableProps {
  rows: CalculatorRow[];
  derivedRows: DerivedRowMetrics[];
  settings: GlobalSettings;
  onRowChange: <K extends keyof CalculatorRow>(id: string, key: K, value: CalculatorRow[K]) => void;
  onAddRow: () => void;
  onDuplicateRow: (id: string) => void;
  onDeleteRow: (id: string) => void;
}

const payTypes: PayType[] = ['Marketing Deal', 'Flat Pay', 'Rookie Pay'];
const rowTypes: RowType[] = ['Team', 'Individual Rep'];

const CalculatorRowCard = memo(function CalculatorRowCard({
  row,
  derived,
  onRowChange,
  onDuplicateRow,
  onDeleteRow,
}: {
  row: CalculatorRow;
  derived: DerivedRowMetrics;
  settings: GlobalSettings;
  onRowChange: <K extends keyof CalculatorRow>(id: string, key: K, value: CalculatorRow[K]) => void;
  onDuplicateRow: (id: string) => void;
  onDeleteRow: (id: string) => void;
}) {
  return (
    <article className="calculator-row-card stable-card">
      <div className="calculator-row-header">
        <div>
          <div className="eyebrow">{row.rowType}</div>
          <h4>{row.name || 'Untitled row'}</h4>
        </div>
        <div className="row wrap">
          <button className="secondary-button" type="button" onClick={() => onDuplicateRow(row.id)}>Duplicate</button>
          <button className="text-button danger" type="button" onClick={() => onDeleteRow(row.id)}>Delete</button>
        </div>
      </div>

      <div className="calculator-grid">
        <label>
          Name
          <input value={row.name} onChange={(e) => onRowChange(row.id, 'name', e.target.value)} />
        </label>
        <label>
          Row Type
          <select value={row.rowType} onChange={(e) => onRowChange(row.id, 'rowType', e.target.value as RowType)}>
            {rowTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label>
          Pay Type
          <select value={row.payType} onChange={(e) => onRowChange(row.id, 'payType', e.target.value as PayType)}>
            {payTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label>
          Current YTD Revenue
          <input type="number" value={row.currentYtdRevenue} onChange={(e) => onRowChange(row.id, 'currentYtdRevenue', Number(e.target.value))} />
        </label>
        <label>
          Goal Revenue
          <input type="number" value={row.goalRevenue} onChange={(e) => onRowChange(row.id, 'goalRevenue', Number(e.target.value))} />
        </label>
        <label>
          Manager / Veteran Revenue
          <input type="number" value={row.managerVeteranRevenue} onChange={(e) => onRowChange(row.id, 'managerVeteranRevenue', Number(e.target.value))} />
        </label>
        <label>
          Rookie Revenue Needed
          <div className="readonly">{currency(derived.rookieRevenueNeeded)}</div>
        </label>
        <label>
          Per Rep Average
          <input type="number" value={row.perRepAverage} onChange={(e) => onRowChange(row.id, 'perRepAverage', Number(e.target.value))} />
        </label>
        <label>
          Signed-to-Start %
          <input type="number" step="0.01" value={row.signedToStartRatio} onChange={(e) => onRowChange(row.id, 'signedToStartRatio', Number(e.target.value))} />
        </label>
        <label>
          Start-to-Finish %
          <input type="number" step="0.01" value={row.startToFinishRatio} onChange={(e) => onRowChange(row.id, 'startToFinishRatio', Number(e.target.value))} />
        </label>
        <label>
          Retention %
          <input type="number" step="0.01" value={row.retention} onChange={(e) => onRowChange(row.id, 'retention', Number(e.target.value))} />
        </label>
        <label>
          Required Finished Reps
          <div className="readonly">{derived.requiredFinishedReps}</div>
        </label>
        <label>
          Required Started Reps
          <div className="readonly">{derived.requiredStartedReps}</div>
        </label>
        <label>
          Required Signed / Summer-Ready Reps
          <div className="readonly emphasis">{derived.requiredSignedReps}</div>
        </label>
        <label>
          Active Rookie Reps
          <input type="number" value={row.activeRookieReps} onChange={(e) => onRowChange(row.id, 'activeRookieReps', Number(e.target.value))} />
        </label>
        <label>
          Their Commission / Deal %
          <input type="number" step="0.01" value={row.theirDealPercent} onChange={(e) => onRowChange(row.id, 'theirDealPercent', Number(e.target.value))} />
        </label>
        <label>
          My Marketing Deal %
          <input type="number" step="0.01" value={row.myMarketingDealPercent} onChange={(e) => onRowChange(row.id, 'myMarketingDealPercent', Number(e.target.value))} />
        </label>
        <label>
          Override %
          <div className="readonly">{percent(derived.overridePercentage)}</div>
        </label>
        <label>
          Projected Retained Revenue
          <div className="readonly">{currency(derived.projectedRetainedRevenue)}</div>
        </label>
        <label>
          Actual Retained Revenue
          <input type="number" value={row.actualRetainedRevenue} onChange={(e) => onRowChange(row.id, 'actualRetainedRevenue', Number(e.target.value))} />
        </label>
        <label>
          Projected Override Earnings
          <div className="readonly success">{currency(derived.projectedOverrideEarnings)}</div>
        </label>
        <label>
          Actual YTD Override Earnings
          <input type="number" value={row.actualYtdOverrideEarnings} onChange={(e) => onRowChange(row.id, 'actualYtdOverrideEarnings', Number(e.target.value))} />
        </label>
      </div>

      <label>
        Notes
        <input value={row.notes} onChange={(e) => onRowChange(row.id, 'notes', e.target.value)} />
      </label>
    </article>
  );
});

export const CalculatorTable = memo(function CalculatorTable({ rows, derivedRows, settings, onRowChange, onAddRow, onDuplicateRow, onDeleteRow }: CalculatorTableProps) {
  return (
    <section className="card section-card stable-card">
      <div className="section-heading sticky-header">
        <div>
          <div className="eyebrow">Page 2</div>
          <h3>Marketing deal earnings calculator</h3>
          <p className="muted">No lazy rendering. Static full-page cards with flattened styling for smoother paint.</p>
        </div>
        <button className="primary-button" onClick={onAddRow} type="button">Add row</button>
      </div>

      <div className="calculator-card-list">
        {rows.map((row, index) => (
          <CalculatorRowCard
            key={row.id}
            row={row}
            derived={derivedRows[index]}
            settings={settings}
            onRowChange={onRowChange}
            onDuplicateRow={onDuplicateRow}
            onDeleteRow={onDeleteRow}
          />
        ))}
      </div>
    </section>
  );
});
