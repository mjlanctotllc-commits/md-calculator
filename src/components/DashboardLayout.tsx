import { memo, ReactNode, useMemo, useState } from 'react';
import { Role, TabKey, ThemeMode } from '../types';

interface DashboardLayoutProps {
  role: Role;
  roleLabel?: string;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  onLogout: () => void;
  headerActions?: ReactNode;
  children: ReactNode;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'settings', label: 'Inputs' },
  { key: 'calculator', label: 'Calculator' },
  { key: 'actuals', label: 'YTD Actuals' },
  { key: 'backend-plan', label: 'Backend Plan' },
];

export const DashboardLayout = memo(function DashboardLayout({ role, roleLabel, activeTab, onTabChange, theme, onThemeToggle, onLogout, headerActions, children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navButtons = useMemo(
    () => tabs.map((tab) => (
      <button key={tab.key} className={activeTab === tab.key ? 'nav-item active' : 'nav-item'} onClick={() => onTabChange(tab.key)} title={tab.label}>
        {collapsed ? tab.label.charAt(0) : tab.label}
      </button>
    )),
    [activeTab, collapsed, onTabChange],
  );

  const mobileTabs = useMemo(
    () => tabs.map((tab) => (
      <button key={tab.key} className={activeTab === tab.key ? 'nav-item active' : 'nav-item'} onClick={() => onTabChange(tab.key)}>
        {tab.label}
      </button>
    )),
    [activeTab, onTabChange],
  );

  return (
    <div className={collapsed ? 'app-shell sidebar-hidden' : 'app-shell'}>
      <aside className={collapsed ? 'sidebar card hidden' : 'sidebar card'}>
        <div>
          <div className="row between">
            <div className="badge">Dashboard</div>
            <button className="secondary-button collapse-button" type="button" onClick={() => setCollapsed((v) => !v)}>
              {collapsed ? '→' : '←'}
            </button>
          </div>
          {!collapsed && <h2>MD Earnings Calculator</h2>}
        </div>
        <nav className={collapsed ? 'nav-list collapsed' : 'nav-list'}>{navButtons}</nav>
        <div className="sidebar-footer">
          {!collapsed && <div className="pill">Role: {roleLabel ?? role}</div>}
          <button className="secondary-button" onClick={onThemeToggle} type="button">
            {collapsed ? 'Theme' : `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          </button>
          <button className="text-button" onClick={onLogout} type="button">{collapsed ? 'Out' : 'Log out'}</button>
        </div>
      </aside>
      <main className="main-panel">
        <header className="topbar card compact-topbar">
          <div className="row" style={{ alignItems: 'center' }}>
            {collapsed && (
              <button className="hamburger-button" type="button" onClick={() => setCollapsed(false)} aria-label="Open sidebar">
                <span />
                <span />
                <span />
              </button>
            )}
            <div className="topbar-logo-wrap">
              <img src="/ynr-logo-cropped.png" alt="Young N Retired logo" className="topbar-logo topbar-logo-white" />
            </div>
            <h1>Earnings</h1>
          </div>
          <div className="row wrap mobile-actions-stack">{headerActions}</div>
        </header>
        <div className="mobile-tabbar card">{mobileTabs}</div>
        {children}
      </main>
    </div>
  );
});
