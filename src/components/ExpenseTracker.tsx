import { memo } from 'react';
import { ExpenseItem } from '../types';

interface ExpenseTrackerProps {
  expenses: ExpenseItem[];
  repOptions: string[];
  canEdit: boolean;
  useManualExpenseTotal: boolean;
  manualExpenseTotal: number;
  onToggleManual: (value: boolean) => void;
  onManualChange: (value: number) => void;
  onExpenseChange: <K extends keyof ExpenseItem>(id: string, key: K, value: ExpenseItem[K]) => void;
  onAddExpense: () => void;
  onDeleteExpense: (id: string) => void;
  summary: {
    totalExpenses: number;
    housingCostsOnMyMd: number;
    advancesOnMyMd: number;
    bonusesOnMyMd: number;
    otherExpensesOnMyMd: number;
    totalExpensesDeducted: number;
    projectedNetToBePaid: number;
    globalCostTotal: number;
  };
  projectedOverrideEarnings: number;
}

const expenseCategories: ExpenseItem['category'][] = ['Housing', 'Advances'];

export const ExpenseTracker = memo(function ExpenseTracker({
  expenses,
  repOptions,
  canEdit,
  useManualExpenseTotal,
  manualExpenseTotal,
  onToggleManual,
  onManualChange,
  onExpenseChange,
  onAddExpense,
  onDeleteExpense,
}: ExpenseTrackerProps) {
  return (
    <section className="stack gap-lg">
      <div className="card section-card premium-card stable-card">
        <div className="section-heading">
          <div>
            <div className="eyebrow premium-eyebrow">Expense tracker</div>
            <h3>Expenses</h3>
          </div>
          <div className="toggle-row">
            <span>Manual total</span>
            <label className="switch">
              <input type="checkbox" checked={useManualExpenseTotal} onChange={(e) => onToggleManual(e.target.checked)} disabled={!canEdit} />
              <span />
            </label>
          </div>
        </div>

        {useManualExpenseTotal ? (
          <label>
            Total expenses manually entered
            <input type="number" value={manualExpenseTotal} onChange={(e) => onManualChange(Number(e.target.value))} disabled={!canEdit} />
          </label>
        ) : (
          <>
            <div className="row between wrap">
              <p className="muted">Track housing and advances expenses, and assign each one to a rep in your downline.</p>
              {canEdit ? <button className="primary-button" type="button" onClick={onAddExpense}>Add expense</button> : <div className="muted">View only — only managers can change expenses.</div>}
            </div>
            <div className="stack gap-md">
              {expenses.length === 0 && <div className="muted expense-empty-state">No expenses yet.</div>}
              {expenses.map((expense) => (
                <div key={expense.id} className="expense-line-item stable-card">
                  <div className="expense-line-grid">
                    <label>
                      Category
                      <select value={expense.category} onChange={(e) => onExpenseChange(expense.id, 'category', e.target.value as ExpenseItem['category'])} disabled={!canEdit}>
                        {expenseCategories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Amount
                      <input type="number" value={expense.amount} onChange={(e) => onExpenseChange(expense.id, 'amount', Number(e.target.value))} disabled={!canEdit} />
                    </label>
                    <label>
                      Assign Rep In Your Downline
                      <select value={expense.assignedTo} onChange={(e) => onExpenseChange(expense.id, 'assignedTo', e.target.value)} disabled={!canEdit}>
                        <option value="">Select rep</option>
                        {repOptions.map((rep) => (
                          <option key={rep} value={rep}>{rep}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Comes Out of My MD?
                      <select value={expense.comesOutOfMyMd ? 'yes' : 'no'} onChange={(e) => onExpenseChange(expense.id, 'comesOutOfMyMd', e.target.value === 'yes')} disabled={!canEdit}>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </label>
                  </div>
                  <div className="row between wrap">
                    <label style={{ flex: 1 }}>
                      Notes
                      <input value={expense.notes} onChange={(e) => onExpenseChange(expense.id, 'notes', e.target.value)} disabled={!canEdit} />
                    </label>
                    {canEdit ? <button className="text-button danger" type="button" onClick={() => onDeleteExpense(expense.id)}>Delete</button> : null}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
});
