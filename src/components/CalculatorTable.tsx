import { memo } from 'react';
import { CalculatorRow, DerivedRowMetrics, ExpenseItem, GlobalSettings, PayType, RowType } from '../types';
import { currency, percent } from '../utils';

interface CalculatorTableProps {
  rows: CalculatorRow[];
  derivedRows: DerivedRowMetrics[];
  settings: GlobalSettings;
  expenses: ExpenseItem[];
  onRowChange: <K extends keyof CalculatorRow>(id: string, key: K, value: CalculatorRow[K]) => void;
  onAddRow: () => void;
  onDuplicateRow: (id: string) => void;
  onDeleteRow: (id: string) => void;
}

const payTypes: PayType[] = ['Marketing Deal', 'Flat Pay', 'Rookie Pay'];
const rowTypes: RowType[] = ['Team', 'Individual Rep'];
const PercentInput = memo(function PercentInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const displayValue = Number((value * 100).toFixed(2));

  return (
    <input
      type="number"
      step="0.01"
      value={displayValue}
      onChange={(e) => onChange(Number((Number(e.target.value) / 100).toFixed(4)))}
    />
  );
});

const SummaryTable = memo(function SummaryTable({
  rows,
  derivedRows,
  onRowChange,
}: {
  rows: CalculatorRow[];
  derivedRows: DerivedRowMetrics[];
  onRowChange: <K extends keyof CalculatorRow>(id: string, key: K, value: CalculatorRow[K]) => void;
}) {
  return (
    <div className="summary-table-card stable-card">
      <div className="section-heading calculator-summary-heading">
        <div>
          <div className="eyebrow">Quick edit summary</div>
          <h4>Management, revenue, YTD, and rookie pacing</h4>
        </div>
        <p className="muted">Edit here or below — both views update the same row data.</p>
      </div>

      <div className="table-wrap calculator-summary-table-wrap">
        <table className="calculator-summary-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Vet/Manager Revenue</th>
              <th>Team Revenue</th>
              <th>Current YTD</th>
              <th>Summer Ready Rookies</th>
              <th>Needed Rookies</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td>
                  <input value={row.name} onChange={(e) => onRowChange(row.id, 'name', e.target.value)} />
                </td>
                <td>
                  <input type="number" value={row.managerVeteranRevenue} onChange={(e) => onRowChange(row.id, 'managerVeteranRevenue', Number(e.target.value))} />
                </td>
                <td>
                  <input type="number" value={row.goalRevenue} onChange={(e) => onRowChange(row.id, 'goalRevenue', Number(e.target.value))} />
                </td>
                <td>
                  <input type="number" value={row.currentYtdRevenue} onChange={(e) => onRowChange(row.id, 'currentYtdRevenue', Number(e.target.value))} />
                </td>
                <td>
                  <input type="number" value={row.activeRookieReps} onChange={(e) => onRowChange(row.id, 'activeRookieReps', Number(e.target.value))} />
                </td>
                <td>
                  <div className="readonly emphasis summary-readonly-cell">{derivedRows[index]?.requiredSignedReps ?? 0}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

const CalculatorRowCard = memo(function CalculatorRowCard({
  row,
  derived,
  expenses,
  onRowChange,
  onDuplicateRow,
  onDeleteRow,
}: {
  row: CalculatorRow;
  derived: DerivedRowMetrics;
  settings: GlobalSettings;
  expenses: ExpenseItem[];
  onRowChange: <K extends keyof CalculatorRow>(id: string, key: K, value: CalculatorRow[K]) => void;
  onDuplicateRow: (id: string) => void;
  onDeleteRow: (id: string) => void;
}) {
  const assignedExpenses = expenses.filter((expense) => expense.assignedTo === row.name);
  const assignedExpenseTotal = assignedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const assignedHousingTotal = assignedExpenses.filter((expense) => expense.category === 'Housing').reduce((sum, expense) => sum + expense.amount, 0);
  const assignedAdvancesTotal = assignedExpenses.filter((expense) => expense.category === 'Advances').reduce((sum, expense) => sum + expense.amount, 0);

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
          Team Revenue
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
          <PercentInput value={row.signedToStartRatio} onChange={(value) => onRowChange(row.id, 'signedToStartRatio', value)} />
        </label>
        <label>
          Start-to-Finish %
          <PercentInput value={row.startToFinishRatio} onChange={(value) => onRowChange(row.id, 'startToFinishRatio', value)} />
        </label>
        <label>
          Retention %
          <PercentInput value={row.retention} onChange={(value) => onRowChange(row.id, 'retention', value)} />
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
          Needed Rookies
          <div className="readonly emphasis">{derived.requiredSignedReps}</div>
        </label>
        <label>
          Summer Ready Rookies
          <input type="number" value={row.activeRookieReps} onChange={(e) => onRowChange(row.id, 'activeRookieReps', Number(e.target.value))} />
        </label>
        <label>
          Their Commission / Deal %
          <PercentInput value={row.theirDealPercent} onChange={(value) => onRowChange(row.id, 'theirDealPercent', value)} />
        </label>
        <label>
          My Marketing Deal %
          <PercentInput value={row.myMarketingDealPercent} onChange={(value) => onRowChange(row.id, 'myMarketingDealPercent', value)} />
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

      <div className="row wrap" style={{ gap: 12, marginBottom: 12 }}>
        <div className="readonly" style={{ minWidth: 220 }}>Assigned housing: {currency(assignedHousingTotal)}</div>
        <div className="readonly" style={{ minWidth: 220 }}>Assigned advances: {currency(assignedAdvancesTotal)}</div>
        <div className="readonly success" style={{ minWidth: 220 }}>Total assigned expenses: {currency(assignedExpenseTotal)}</div>
      </div>

      <label>
        Notes
        <input value={row.notes} onChange={(e) => onRowChange(row.id, 'notes', e.target.value)} />
      </label>
    </article>
  );
});

export const CalculatorTable = memo(function CalculatorTable({ rows, derivedRows, settings, expenses, onRowChange, onAddRow, onDuplicateRow, onDeleteRow }: CalculatorTableProps) {
  return (
    <section className="card section-card stable-card">
      <div className="section-heading sticky-header">
        <div>
          <h3>Team Numbers</h3>
          <p className="muted">High-level summary at the top, with full row detail underneath.</p>
        </div>
        <button className="primary-button" onClick={onAddRow} type="button">Add row</button>
      </div>

      <div className="calculator-card-list">
        <SummaryTable rows={rows} derivedRows={derivedRows} onRowChange={onRowChange} />

        {rows.map((row, index) => (
          <CalculatorRowCard
            key={row.id}
            row={row}
            derived={derivedRows[index]}
            settings={settings}
            expenses={expenses}
            onRowChange={onRowChange}
            onDuplicateRow={onDuplicateRow}
            onDeleteRow={onDeleteRow}
          />
        ))}
      </div>
    </section>
  );
});
