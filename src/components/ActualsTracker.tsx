import { memo } from 'react';
import { ActualsState, CalculatorRow, DerivedRowMetrics, GlobalSettings } from '../types';
import { currency, percent } from '../utils';

interface ActualsTrackerProps {
  actuals: ActualsState;
  rows: CalculatorRow[];
  derivedRows: DerivedRowMetrics[];
  settings: GlobalSettings;
  actualYtdOverrideEarnings: number;
  actualNetEarnedToDate: number;
  onChange: <K extends keyof ActualsState>(key: K, value: ActualsState[K]) => void;
}

const ActualsRowCard = memo(function ActualsRowCard({ row, derived }: { row: CalculatorRow; derived: DerivedRowMetrics; settings: GlobalSettings }) {
  return (
    <article className="calculator-row-card stable-card">
      <div className="calculator-row-header">
        <div>
          <div className="eyebrow">{row.rowType}</div>
          <h4>{row.name}</h4>
        </div>
        <div className="pill">{row.payType}</div>
      </div>
      <div className="actuals-team-grid">
        <div className="readonly-block">
          <span>Actual Revenue</span>
          <strong>{currency(row.currentYtdRevenue)}</strong>
        </div>
        <div className="readonly-block">
          <span>Actual Retained Revenue</span>
          <strong>{currency(row.actualRetainedRevenue)}</strong>
        </div>
        <div className="readonly-block">
          <span>Actual Override Earnings</span>
          <strong className="success">{currency(row.actualYtdOverrideEarnings)}</strong>
        </div>
        <div className="readonly-block">
          <span>Override %</span>
          <strong>{percent(derived.overridePercentage)}</strong>
        </div>
        <div className="readonly-block">
          <span>My MD %</span>
          <strong>{percent(row.myMarketingDealPercent)}</strong>
        </div>
        <div className="readonly-block">
          <span>Their Deal / Commission %</span>
          <strong>{percent(row.theirDealPercent)}</strong>
        </div>
      </div>
    </article>
  );
});

export const ActualsTracker = memo(function ActualsTracker({ actuals, rows, derivedRows, settings, actualYtdOverrideEarnings, actualNetEarnedToDate, onChange }: ActualsTrackerProps) {
  return (
    <section className="stack gap-lg">
      <div className="panel-grid two-col">
        <div className="card section-card stable-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Year-to-date actuals</div>
              <h3>Top-line actuals</h3>
            </div>
          </div>
          <div className="form-grid single-col">
            <label>
              Actual YTD Revenue
              <input type="number" value={actuals.actualYtdRevenue} onChange={(e) => onChange('actualYtdRevenue', Number(e.target.value))} />
            </label>
            <label>
              Actual YTD Retained Revenue
              <input type="number" value={actuals.actualYtdRetainedRevenue} onChange={(e) => onChange('actualYtdRetainedRevenue', Number(e.target.value))} />
            </label>
            <label>
              Actual YTD Expenses
              <input type="number" value={actuals.actualYtdExpenses} onChange={(e) => onChange('actualYtdExpenses', Number(e.target.value))} />
            </label>
          </div>
        </div>
        <div className="card section-card stable-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Actuals summary</div>
              <h3>Earned to date</h3>
            </div>
          </div>
          <div className="stack gap-lg">
            <div className="stat-row"><span>Actual YTD Revenue</span><strong>{currency(actuals.actualYtdRevenue)}</strong></div>
            <div className="stat-row"><span>Actual YTD Retained Revenue</span><strong>{currency(actuals.actualYtdRetainedRevenue)}</strong></div>
            <div className="stat-row"><span>Actual YTD Override Earnings</span><strong>{currency(actualYtdOverrideEarnings)}</strong></div>
            <div className="stat-row"><span>Actual YTD Expenses</span><strong>{currency(actuals.actualYtdExpenses)}</strong></div>
            <div className="stat-row success"><span>Actual Net Earned To Date</span><strong>{currency(actualNetEarnedToDate)}</strong></div>
          </div>
        </div>
      </div>

      <div className="card section-card stable-card">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Team actuals</div>
            <h3>Revenue, retained revenue, and override breakdown by team</h3>
          </div>
        </div>
        <div className="calculator-card-list">
          {rows.map((row, index) => (
            <ActualsRowCard key={row.id} row={row} derived={derivedRows[index]} settings={settings} />
          ))}
        </div>
      </div>
    </section>
  );
});
