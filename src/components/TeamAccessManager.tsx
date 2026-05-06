import { TeamMember } from '../types';

interface TeamAccessManagerProps {
  members: TeamMember[];
  ownerEmail?: string;
  onMemberChange: (email: string, patch: Partial<TeamMember>) => void;
}

export function TeamAccessManager({ members, ownerEmail, onMemberChange }: TeamAccessManagerProps) {
  const managerOptions = members.filter((member) => member.role !== 'rep' || member.email === ownerEmail);

  return (
    <section className="card section-card stable-card">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Team access</div>
          <h3>Downline permissions</h3>
          <p className="muted">Set who can manage expenses and who each person reports to. Managers can assign expenses to themselves and anyone below them.</p>
        </div>
      </div>

      <div className="stack gap-md">
        {members.map((member) => {
          const isOwner = member.email === ownerEmail;
          return (
            <div key={member.email} className="expense-line-item stable-card">
              <div className="expense-line-grid">
                <label>
                  Name
                  <input value={member.displayName} onChange={(e) => onMemberChange(member.email, { displayName: e.target.value })} disabled={isOwner} />
                </label>
                <label>
                  Email
                  <input value={member.email} disabled />
                </label>
                <label>
                  Role
                  <select value={member.role} onChange={(e) => onMemberChange(member.email, { role: e.target.value as TeamMember['role'] })} disabled={isOwner}>
                    <option value="rep">Rep</option>
                    <option value="manager">Manager</option>
                    <option value="owner">Owner</option>
                  </select>
                </label>
                <label>
                  Reports To
                  <select value={member.parentEmail ?? ''} onChange={(e) => onMemberChange(member.email, { parentEmail: e.target.value || null })} disabled={isOwner}>
                    <option value="">No manager</option>
                    {managerOptions
                      .filter((option) => option.email !== member.email)
                      .map((option) => (
                        <option key={option.email} value={option.email}>{option.displayName}</option>
                      ))}
                  </select>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
