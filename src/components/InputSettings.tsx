import { memo } from 'react';
import { GlobalSettings } from '../types';
import { currency, percent } from '../utils';

interface InputSettingsProps {
  settings: GlobalSettings;
  onChange: <K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) => void;
  summary: {
    netRetainedRevenue: number;
    marketingDealFee: number;
    netMdPercentage: number;
    estimatedGrossEarnings: number;
    estimatedAfterExpenses: number;
    roadmapRevenuePerAccount: number;
    globalCostTotal: number;
    totalYtdRevenue: number;
    totalYtdRetainedRevenue: number;
  };
}

const primaryFields: { key: keyof GlobalSettings; label: string; type?: 'text' | 'number' }[] = [
  { key: 'managerName', label: 'Manager Name', type: 'text' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'averageValuePerAccount', label: 'ACV' },
  { key: 'managerDealPercentage', label: 'Manager Marketing Deal Percentage' },
  { key: 'marketingDealFeePercentage', label: 'Marketing Deal Fee Percentage' },
  { key: 'perRepAverageRevenue', label: 'Per Rep Average Revenue' },
  { key: 'signedToStartRatio', label: 'Signed-to-Start Ratio %' },
  { key: 'startToFinishRatio', label: 'Start-to-Finish Ratio %' },
  { key: 'averageRetention', label: 'Average Retention %' },
  { key: 'defaultManagerVeteranRevenue', label: 'Default Manager/Veteran Revenue Input' },
];

export const InputSettings = memo(function InputSettings({ settings, onChange, summary }: InputSettingsProps) {
  return (
    <section className="panel-grid two-col">
      <div className="stack gap-lg">
        <div className="card section-card stable-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Page 1</div>
              <h3>Input settings</h3>
            </div>
            <p className="muted">Global assumptions imported from your sheet, now editable in one clean place.</p>
          </div>
          <div className="form-grid">
            {primaryFields.map((field) => {
              const value = settings[field.key];
              const isText = field.type === 'text';
              return (
                <label key={field.key}>
                  {field.label}
                  <input
                    type={isText ? 'text' : 'number'}
                    step={isText ? undefined : '0.01'}
                    value={value as string | number}
                    onChange={(event) => onChange(field.key, isText ? event.target.value : Number(event.target.value))}
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="stack gap-lg">
        <div className="card section-card stable-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Auto-calculated</div>
              <h3>Global earnings snapshot</h3>
            </div>
          </div>
          <div className="stack gap-lg">
            <div className="stat-row"><span>Current Year-to-Date Revenue</span><strong>{currency(summary.totalYtdRevenue)}</strong></div>
            <div className="stat-row"><span>Current Year-to-Date Retained Revenue</span><strong>{currency(summary.totalYtdRetainedRevenue)}</strong></div>
            <div className="stat-row"><span>Net retained revenue after retention</span><strong>{currency(summary.netRetainedRevenue)}</strong></div>
            <div className="stat-row"><span>Marketing deal fee</span><strong>{currency(summary.marketingDealFee)}</strong></div>
            <div className="stat-row"><span>Net MD percentage after fees</span><strong>{percent(summary.netMdPercentage)}</strong></div>
            <div className="stat-row"><span>Road map revenue</span><strong>{currency(summary.roadmapRevenuePerAccount || settings.roadmapRevenue)}</strong></div>
            <div className="stat-row"><span>Estimated gross earnings</span><strong>{currency(summary.estimatedGrossEarnings)}</strong></div>
            <div className="stat-row"><span>Imported manager-level costs</span><strong>{currency(summary.globalCostTotal)}</strong></div>
            <div className="stat-row"><span>Estimated earnings after expenses</span><strong className="success">{currency(summary.estimatedAfterExpenses)}</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
});
