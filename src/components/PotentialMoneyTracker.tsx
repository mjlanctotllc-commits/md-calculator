import { memo } from 'react';
import { PotentialMoneyItem } from '../types';
import { currency } from '../utils';

interface PotentialMoneyTrackerProps {
  items: PotentialMoneyItem[];
  totalPotentialOutlay: number;
  totalPotentialValue: number;
  onItemChange: <K extends keyof PotentialMoneyItem>(id: string, key: K, value: PotentialMoneyItem[K]) => void;
  onAddItem: () => void;
  onDeleteItem: (id: string) => void;
}

export const PotentialMoneyTracker = memo(function PotentialMoneyTracker({ items, totalPotentialOutlay, totalPotentialValue, onItemChange, onAddItem, onDeleteItem }: PotentialMoneyTrackerProps) {
  return (
    <section className="panel-grid two-col backend-plan-grid">
      <div className="card section-card stable-card">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Potential money in</div>
            <h3>Imported upside / payback opportunities</h3>
          </div>
          <button className="primary-button" type="button" onClick={onAddItem}>Add item</button>
        </div>
        <div className="table-wrap compact">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount In</th>
                <th>Status</th>
                <th>Notes</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><input value={item.name} onChange={(e) => onItemChange(item.id, 'name', e.target.value)} /></td>
                  <td><input type="number" value={item.amount} onChange={(e) => onItemChange(item.id, 'amount', Number(e.target.value))} /></td>
                  <td><input value={item.status} onChange={(e) => onItemChange(item.id, 'status', e.target.value)} /></td>
                  <td><input value={item.notes} onChange={(e) => onItemChange(item.id, 'notes', e.target.value)} /></td>
                  <td><button className="text-button danger" type="button" onClick={() => onDeleteItem(item.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
});
