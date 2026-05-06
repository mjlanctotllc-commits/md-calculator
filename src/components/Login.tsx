import { useState } from 'react';
import { Role } from '../types';

interface LoginProps {
  supabaseEnabled: boolean;
  statusMessage: string;
  onLogin: (email: string, password: string, role: Role, mode: 'signin' | 'signup' | 'reset') => void;
}

export function Login({ supabaseEnabled, statusMessage, onLogin }: LoginProps) {
  const [email, setEmail] = useState('manager@example.com');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState<Role>('manager');

  return (
    <div className="auth-shell">
      <div className="auth-card card">
        <div>
          <div className="badge">MD Earnings Calculator</div>
          <h1>Sign in to your earnings dashboard</h1>
          <p className="muted">{supabaseEnabled ? 'Supabase auth is live when env keys are present. Role still controls the dashboard label and saved profile metadata.' : 'Using placeholder local auth right now. Add Supabase env keys to turn on real auth + cloud persistence.'}</p>
        </div>

        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
        </label>

        <div className="row between">
          <div className="segmented compact">
            {(['manager', 'admin'] as Role[]).map((option) => (
              <button
                key={option}
                className={role === option ? 'active' : ''}
                onClick={() => setRole(option)}
                type="button"
              >
                {option[0].toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
          <button className="text-button" type="button" onClick={() => onLogin(email, password, role, 'reset')}>Forgot password</button>
        </div>

        <div className="row wrap">
          <button className="primary-button" type="button" onClick={() => onLogin(email, password, role, 'signin')} disabled={!email || !password}>
            Sign in
          </button>
          <button className="secondary-button" type="button" onClick={() => onLogin(email, password, role, 'signup')} disabled={!email || !password}>
            Create account
          </button>
        </div>
        <div className="muted">{statusMessage}</div>
      </div>
    </div>
  );
}
