import { memo, useMemo } from 'react';
import { GlobalSettings } from '../types';
import { currency, number } from '../utils';

interface SummaryCardsProps {
  summary: {
    totalGoalRevenue: number;
    totalProjectedRetainedRevenue: number;
    totalProjectedOverrideEarnings: number;
    totalYtdRevenue: number;
    totalYtdRetainedRevenue: number;
    totalActualYtdEarnings: number;
    requiredSummerReadyReps: number;
    currentActiveRookieReps: number;
    gapToGoal: number;
    projectedNetToBePaid: number;
    goalNetAfterVisibleExpenses: number;
    expenseSummary: {
      globalCostTotal: number;
      totalExpensesDeducted: number;
      housingCostsOnMyMd: number;
      advancesOnMyMd: number;
      bonusesOnMyMd: number;
      totalHousingForDownline: number;
      totalAdvancesBonusesForDownline: number;
    };
    potentialMoneySummary: { totalPotentialValue: number; totalPotentialOutlay: number };
    actualNetEarnedToDate: number;
    projectedRoleLabel: string;
    neededRevenuePerWeek: number;
    seasonWeeksRemaining: number;
    pacingActive: boolean;
  };
  settings: GlobalSettings;
  onSettingsChange: <K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) => void;
}

const MoneyValue = memo(function MoneyValue({ value, className = '' }: { value: number; className?: string }) {
  return <div className={className}>{currency(value)}</div>;
});

const Icon = memo(function Icon({ kind }: { kind: 'goal' | 'money' | 'users' | 'gap' }) {
  const paths = {
    goal: 'M12 3l7 4v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V7l7-4zm0 5a4 4 0 100 8 4 4 0 000-8z',
    money: 'M4 7h16M4 12h16M4 17h16M7 4v16M17 4v16',
    users: 'M9 11a3 3 0 100-6 3 3 0 000 6zm6 2a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM4 19a5 5 0 0110 0M13.5 19a4 4 0 018 0',
    gap: 'M4 16l4-4 3 3 7-7M20 10V4h-6',
  } as const;

  return (
    <svg viewBox="0 0 24 24" className="metric-icon" aria-hidden="true">
      <path d={paths[kind]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

const Sparkline = memo(function Sparkline({ values, tone = 'gold' }: { values: number[]; tone?: 'gold' | 'blue' | 'green' | 'red' }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = max === min ? 50 : 90 - ((value - min) / (max - min)) * 70;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className={`sparkline sparkline-${tone}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

export const SummaryCards = memo(function SummaryCards({ summary, settings, onSettingsChange }: SummaryCardsProps) {
  const mdAdvancesBonuses = summary.expenseSummary.advancesOnMyMd + summary.expenseSummary.bonusesOnMyMd;
  const goalProgress = summary.totalGoalRevenue > 0 ? Math.min(summary.totalYtdRevenue / summary.totalGoalRevenue, 1) : 0;
  const gapTone = goalProgress > 0.8 ? 'green' : goalProgress > 0.45 ? 'gold' : 'red';

  const retainedSpark = useMemo(
    () => [0.42, 0.48, 0.57, 0.61, 0.72, 0.79].map((n) => n * summary.totalProjectedRetainedRevenue),
    [summary.totalProjectedRetainedRevenue],
  );
  const revenueSpark = useMemo(
    () => [0.3, 0.35, 0.5, 0.58, 0.71, 0.88].map((n) => n * summary.totalGoalRevenue),
    [summary.totalGoalRevenue],
  );

  return (
    <section className="executive-summary premium-shell">
      <div className="executive-top-grid premium-hero-grid">
        <div className="card premium-card hero-card matched-main-card goal-card">
          <div className="hero-ornament hero-ornament-gold" />
          <div className="hero-copy">
            <div className="eyebrow premium-eyebrow">Projected Earnings</div>
            <div className="hero-heading-row">
              <h2>Goal Earnings</h2>
              <Icon kind="goal" />
            </div>
            <MoneyValue value={summary.totalProjectedOverrideEarnings} className="hero-amount goal-amount money-gradient" />
            <div className="deduction-breakdown">
              <div className="metric-subline negative-line">
                <span>Housing out of your MD</span>
                <b>-{currency(summary.expenseSummary.housingCostsOnMyMd).replace('$', '$')}</b>
              </div>
              <div className="metric-subline negative-line">
                <span>Advances & bonuses out of your MD</span>
                <b>-{currency(mdAdvancesBonuses).replace('$', '$')}</b>
              </div>
              <div className="metric-subline negative-line">
                <span>Other visible MD deductions</span>
                <b>-{currency(summary.expenseSummary.totalExpensesDeducted - summary.expenseSummary.housingCostsOnMyMd - mdAdvancesBonuses).replace('$', '$')}</b>
              </div>
            </div>
            <div className="hero-metric compact-metric inset-financial-card full-width-compact">
              <span>Final Net To Be Paid</span>
              <MoneyValue value={summary.goalNetAfterVisibleExpenses} className="inset-amount positive-money" />
            </div>
            <div className="metric-footline muted">
              <span>Total Downline housing expense: {currency(summary.expenseSummary.totalHousingForDownline)}</span>
              <span>Total advances and bonuses from downline: {currency(summary.expenseSummary.totalAdvancesBonusesForDownline)}</span>
            </div>
          </div>
        </div>

        <div className="card premium-card hero-card matched-main-card actual-card">
          <div className="hero-ornament hero-ornament-blue" />
          <div className="hero-copy">
            <div className="eyebrow premium-eyebrow">Actual Performance</div>
            <div className="hero-heading-row">
              <h2>Actual Earnings to Date</h2>
              <Icon kind="money" />
            </div>
            <MoneyValue value={summary.totalActualYtdEarnings} className="hero-amount actual-amount money-gradient" />
            <div className="deduction-breakdown">
              <div className="metric-subline negative-line">
                <span>Housing out of your MD</span>
                <b>-{currency(summary.expenseSummary.housingCostsOnMyMd).replace('$', '$')}</b>
              </div>
              <div className="metric-subline negative-line">
                <span>Advances & bonuses out of your MD</span>
                <b>-{currency(mdAdvancesBonuses).replace('$', '$')}</b>
              </div>
              <div className="metric-subline negative-line">
                <span>Other visible MD deductions</span>
                <b>-{currency(summary.expenseSummary.totalExpensesDeducted - summary.expenseSummary.housingCostsOnMyMd - mdAdvancesBonuses).replace('$', '$')}</b>
              </div>
            </div>
            <div className="hero-metric compact-metric inset-financial-card full-width-compact">
              <span>YTD Earnings after Expenses</span>
              <MoneyValue value={summary.actualNetEarnedToDate} className="inset-amount positive-money" />
            </div>
            <div className="metric-footline muted">
              <span>Total Downline housing expense: {currency(summary.expenseSummary.totalHousingForDownline)}</span>
              <span>Total advances and bonuses from downline: {currency(summary.expenseSummary.totalAdvancesBonusesForDownline)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="executive-grid compact-three-up premium-metric-grid">
        <div className="card premium-card executive-card compact-summary-card metric-card stable-card">
          <div className="metric-card-top">
            <span className="eyebrow premium-eyebrow">Goal Revenue</span>
            <Icon kind="goal" />
          </div>
          <MoneyValue value={summary.totalGoalRevenue} className="metric-value gold-value" />
          <div className="metric-footline muted ytd-progress-line">
            <span>YTD progress: {currency(summary.totalYtdRevenue)}</span>
          </div>
          <div className={`progress-track progress-${gapTone}`}>
            <div className="progress-fill" style={{ width: `${goalProgress * 100}%` }} />
          </div>
          <Sparkline values={revenueSpark} tone="blue" />
        </div>

        <div className="card premium-card executive-card compact-summary-card metric-card stable-card">
          <div className="metric-card-top">
            <span className="eyebrow premium-eyebrow">Projected Retained Revenue</span>
            <Icon kind="money" />
          </div>
          <MoneyValue value={summary.totalProjectedRetainedRevenue} className="metric-value gold-value" />
          <div className="metric-footline muted ytd-progress-line">
            <span>YTD progress: {currency(summary.totalYtdRetainedRevenue)}</span>
          </div>
          <Sparkline values={retainedSpark} tone="gold" />
        </div>

        <div className="card premium-card executive-card metric-card stable-card">
          <div className="metric-card-top">
            <span className="eyebrow premium-eyebrow">Gap to Goal</span>
            <Icon kind="gap" />
          </div>
          <div className={`metric-value ${summary.gapToGoal > 0 ? 'negative-value' : 'positive-money'}`}>{currency(summary.gapToGoal)}</div>
          <p className="muted">Remaining revenue needed to hit the current revenue target.</p>
          <div className="gap-pacing-grid">
            <label>
              Start Date
              <input
                type="date"
                value={settings.seasonStartDate}
                onChange={(event) => onSettingsChange('seasonStartDate', event.target.value)}
                disabled={settings.useManualNeededRevenue}
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                value={settings.seasonEndDate}
                onChange={(event) => onSettingsChange('seasonEndDate', event.target.value)}
                disabled={settings.useManualNeededRevenue}
              />
            </label>
          </div>
          <div className="hero-metric compact-metric inset-financial-card full-width-compact gap-weekly-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span>Needed Revenue Per Week</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={settings.useManualNeededRevenue}
                  onChange={(event) => onSettingsChange('useManualNeededRevenue', event.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Manual
              </label>
            </div>
            {settings.useManualNeededRevenue ? (
              <input
                type="number"
                value={settings.manualNeededRevenuePerWeek}
                onChange={(event) => onSettingsChange('manualNeededRevenuePerWeek', Number(event.target.value))}
                className="large-inline-input"
              />
            ) : (
              <strong className="inset-amount gold-value">{currency(summary.neededRevenuePerWeek)}</strong>
            )}
            <small className="muted" style={{ marginTop: '0.3rem' }}>
              {settings.useManualNeededRevenue
                ? 'Using manual override.'
                : summary.pacingActive
                ? `${number(summary.seasonWeeksRemaining, 1)} weeks left. Calculated from total goal revenue.`
                : 'Add a valid start and end date to calculate weekly pacing.'}
            </small>
          </div>
          <div className={`progress-track progress-${gapTone}`}>
            <div className="progress-fill" style={{ width: `${goalProgress * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="executive-strip premium-strip-grid">
        <div className="card premium-card strip-card strip-metric-card stable-card">
          <div className="metric-card-top">
            <span>Needed Summer ready rookies</span>
            <Icon kind="users" />
          </div>
          <strong>{number(summary.requiredSummerReadyReps)}</strong>
        </div>
        <div className="card premium-card strip-card strip-metric-card stable-card">
          <div className="metric-card-top">
            <span>Active Summer ready rookies</span>
            <Icon kind="users" />
          </div>
          <strong>{number(summary.currentActiveRookieReps)}</strong>
        </div>
        <div className="card premium-card strip-card strip-metric-card stable-card">
          <div className="metric-card-top">
            <span>Total Downline housing expense</span>
            <Icon kind="money" />
          </div>
          <strong className="negative-value">{currency(summary.expenseSummary.totalHousingForDownline)}</strong>
        </div>
        <div className="card premium-card strip-card strip-metric-card stable-card">
          <div className="metric-card-top">
            <span>Total advances and bonuses from downline</span>
            <Icon kind="money" />
          </div>
          <strong className="negative-value">{currency(summary.expenseSummary.totalAdvancesBonusesForDownline)}</strong>
        </div>
        <div className="card premium-card strip-card strip-metric-card stable-card">
          <div className="metric-card-top">
            <span>Role</span>
            <Icon kind="users" />
          </div>
          <strong className="gold-value role-value">{summary.projectedRoleLabel}</strong>
        </div>
      </div>
    </section>
  );
});
