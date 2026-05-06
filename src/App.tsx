import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActualsTracker } from './components/ActualsTracker';
import { CalculatorTable } from './components/CalculatorTable';
import { DashboardLayout } from './components/DashboardLayout';
import { ExpenseTracker } from './components/ExpenseTracker';
import { TeamAccessManager } from './components/TeamAccessManager';
import { InputSettings } from './components/InputSettings';
import { Login } from './components/Login';
import { PotentialMoneyTracker } from './components/PotentialMoneyTracker';
import { SummaryCards } from './components/SummaryCards';
import { createExpense, createPotentialMoney, createRow, defaultAppState, starterScenarios, uid } from './defaults';
import { getSupabaseSession, loadRemoteState, saveRemoteState, saveTeamMembers, sendReset, signInWithEmail, signOutSupabase, signUpWithEmail, supabaseEnabled } from './lib/supabase';
import { canManageOrgState, canManageTeam, getAssignableMembers } from './org';
import { AppState, AuthState, CalculatorRow, ExpenseItem, GlobalSettings, PotentialMoneyItem, SavedScenario, TabKey, TeamMember, ThemeMode } from './types';
import { downloadCsv, getDashboardSummary, getSettingsSummary } from './utils';

const AUTH_KEY = 'md-auth';
const APP_KEY = 'md-app-state';
const SCENARIO_KEY = 'md-scenarios';
const THEME_KEY = 'md-theme';
const IMPORT_VERSION_KEY = 'md-import-version';
const CURRENT_IMPORT_VERSION = '2026-import-v4';

const getGoalRevenueTotal = (appState: AppState) => appState.rows.reduce((sum, row) => sum + row.goalRevenue, 0);
const shouldRefreshImportedDefaults = (appState: AppState) => (
  appState.rows.length < defaultAppState.rows.length || getGoalRevenueTotal(appState) < 80_000_000
);
const normalizeState = (appState: AppState): AppState => ({
  ...defaultAppState,
  ...appState,
  settings: {
    ...defaultAppState.settings,
    ...appState.settings,
  },
  actuals: {
    ...defaultAppState.actuals,
    ...appState.actuals,
  },
  expenses: (appState.expenses ?? defaultAppState.expenses).map((expense) => ({
    ...expense,
    category: expense.category === 'Advances' ? 'Advances' : 'Housing',
  })),
});

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [state, setState] = useState<AppState>(defaultAppState);
  const [scenarios, setScenarios] = useState<SavedScenario[]>(starterScenarios(defaultAppState));
  const [statusMessage, setStatusMessage] = useState('Imported your Google Sheet defaults.');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const hydratedRemote = useRef(false);

  useEffect(() => {
    const boot = async () => {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      const storedState = localStorage.getItem(APP_KEY);
      const storedScenarios = localStorage.getItem(SCENARIO_KEY);
      const storedTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
      const storedImportVersion = localStorage.getItem(IMPORT_VERSION_KEY);
      let needsImportRefresh = false;

      if (storedAuth) setAuth(JSON.parse(storedAuth));
      if (storedState) {
        const parsedState = normalizeState(JSON.parse(storedState) as AppState);
        needsImportRefresh = storedImportVersion !== CURRENT_IMPORT_VERSION && shouldRefreshImportedDefaults(parsedState);
        if (needsImportRefresh) {
          const refreshedScenarios = starterScenarios(defaultAppState);
          setState(defaultAppState);
          setScenarios(refreshedScenarios);
          localStorage.setItem(APP_KEY, JSON.stringify(defaultAppState));
          localStorage.setItem(SCENARIO_KEY, JSON.stringify(refreshedScenarios));
          localStorage.setItem(IMPORT_VERSION_KEY, CURRENT_IMPORT_VERSION);
          setStatusMessage('Imported refreshed 2026 sheet defaults.');
        } else {
          setState(parsedState);
          if (storedImportVersion !== CURRENT_IMPORT_VERSION) {
            localStorage.setItem(IMPORT_VERSION_KEY, CURRENT_IMPORT_VERSION);
          }
        }
      } else {
        localStorage.setItem(IMPORT_VERSION_KEY, CURRENT_IMPORT_VERSION);
      }
      if (storedScenarios && !needsImportRefresh) setScenarios(JSON.parse(storedScenarios));
      if (storedTheme) setTheme(storedTheme);

      if (supabaseEnabled) {
        const session = await getSupabaseSession();
        if (session?.user) {
          const localAuth = storedAuth ? JSON.parse(storedAuth) as AuthState : { email: session.user.email ?? '', role: 'owner' as const };
          const remote = await loadRemoteState(session.user.id, defaultAppState);
          const nextAuth = {
            email: session.user.email ?? localAuth.email,
            role: remote.auth?.role ?? localAuth.role,
            displayName: remote.auth?.displayName ?? localAuth.displayName,
            orgOwnerId: remote.auth?.orgOwnerId ?? localAuth.orgOwnerId,
          } as AuthState;
          setAuth(nextAuth);
          localStorage.setItem(AUTH_KEY, JSON.stringify(nextAuth));
          if (remote.state) setState(normalizeState(remote.state));
          if (remote.scenarios.length) setScenarios(remote.scenarios);
          if (remote.teamMembers.length) setTeamMembers(remote.teamMembers);
          hydratedRemote.current = true;
          setStatusMessage('Supabase session restored.');
        } else {
          hydratedRemote.current = true;
        }
      } else {
        hydratedRemote.current = true;
      }
    };

    void boot();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(APP_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(SCENARIO_KEY, JSON.stringify(scenarios));
  }, [scenarios]);

  useEffect(() => {
    if (!supabaseEnabled || !auth || !hydratedRemote.current) return;
    const timeout = window.setTimeout(async () => {
      try {
        await saveRemoteState(auth, state, scenarios);
        setStatusMessage('Cloud autosave complete.');
      } catch (error) {
        console.error(error);
        setStatusMessage('Cloud save failed. Local save still active.');
      }
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [auth, scenarios, state]);


  useEffect(() => {
    if (!supabaseEnabled || !auth || !hydratedRemote.current || !canManageTeam(auth.role) || !teamMembers.length) return;
    const timeout = window.setTimeout(async () => {
      try {
        await saveTeamMembers(auth, teamMembers);
      } catch (error) {
        console.error(error);
        setStatusMessage('Team access save failed.');
      }
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [auth, teamMembers]);

  const dashboardSummary = useMemo(() => getDashboardSummary(state), [state]);
  const settingsSummary = useMemo(
    () => getSettingsSummary(
      state.settings,
      dashboardSummary.expenseSummary.totalExpensesDeducted,
      dashboardSummary.totalYtdRevenue,
      dashboardSummary.totalYtdRetainedRevenue,
    ),
    [
      state.settings,
      dashboardSummary.expenseSummary.totalExpensesDeducted,
      dashboardSummary.totalYtdRevenue,
      dashboardSummary.totalYtdRetainedRevenue,
    ],
  );

  const updateSettings = useCallback(<K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) => {
    if (!canManageOrgState(auth?.role)) return;
    setState((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
  }, [auth?.role]);

  const updateRow = useCallback(<K extends keyof CalculatorRow>(id: string, key: K, value: CalculatorRow[K]) => {
    if (!canManageOrgState(auth?.role)) return;
    setState((current) => ({
      ...current,
      rows: current.rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    }));
  }, [auth?.role]);

  const addRow = useCallback(() => { if (!canManageOrgState(auth?.role)) return; return setState((current) => ({
    ...current,
    rows: [
      ...current.rows,
      createRow({
        myMarketingDealPercent: current.settings.managerDealPercentage,
        perRepAverage: current.settings.perRepAverageRevenue,
        signedToStartRatio: current.settings.signedToStartRatio,
        startToFinishRatio: current.settings.startToFinishRatio,
        retention: current.settings.averageRetention,
        theirDealPercent: current.settings.defaultRookieFlatPayPercentage,
        managerVeteranRevenue: current.settings.defaultManagerVeteranRevenue,
      }),
    ],
  })); }, [auth?.role]);

  const duplicateRow = useCallback((id: string) => { if (!canManageOrgState(auth?.role)) return; return setState((current) => {
    const original = current.rows.find((row) => row.id === id);
    if (!original) return current;
    return { ...current, rows: [...current.rows, { ...original, id: uid(), name: `${original.name} Copy` }] };
  }); }, [auth?.role]);

  const deleteRow = useCallback((id: string) => { if (!canManageOrgState(auth?.role)) return; return setState((current) => ({ ...current, rows: current.rows.filter((row) => row.id !== id) })); }, [auth?.role]);

  const updateExpense = useCallback(<K extends keyof ExpenseItem>(id: string, key: K, value: ExpenseItem[K]) => {
    if (!canManageOrgState(auth?.role)) return;
    setState((current) => ({
      ...current,
      expenses: current.expenses.map((expense) => (
        expense.id === id ? { ...expense, [key]: value, category: key === 'category' && value === 'Advances' ? 'Advances' : (key === 'category' ? 'Housing' : expense.category) } : expense
      )),
    }));
  }, [auth?.role]);

  const addExpense = useCallback(() => { if (!canManageOrgState(auth?.role)) return; return setState((current) => ({
    ...current,
    expenses: [...current.expenses, createExpense({ category: 'Housing', name: 'Expense', createdByEmail: auth?.email ?? '' })],
  })); }, [auth?.email, auth?.role]);
  const deleteExpense = useCallback((id: string) => { if (!canManageOrgState(auth?.role)) return; return setState((current) => ({ ...current, expenses: current.expenses.filter((expense) => expense.id !== id) })); }, [auth?.role]);

  const updatePotentialMoney = useCallback(<K extends keyof PotentialMoneyItem>(id: string, key: K, value: PotentialMoneyItem[K]) => {
    if (!canManageOrgState(auth?.role)) return;
    setState((current) => ({
      ...current,
      potentialMoney: current.potentialMoney.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }));
  }, [auth?.role]);

  const addPotentialMoney = useCallback(() => { if (!canManageOrgState(auth?.role)) return; return setState((current) => ({ ...current, potentialMoney: [...current.potentialMoney, createPotentialMoney()] })); }, [auth?.role]);
  const deletePotentialMoney = useCallback((id: string) => { if (!canManageOrgState(auth?.role)) return; return setState((current) => ({ ...current, potentialMoney: current.potentialMoney.filter((item) => item.id !== id) })); }, [auth?.role]);

  const updateActuals = useCallback(<K extends keyof AppState['actuals']>(key: K, value: AppState['actuals'][K]) => {
    if (!canManageOrgState(auth?.role)) return;
    setState((current) => ({ ...current, actuals: { ...current.actuals, [key]: value } }));
  }, [auth?.role]);

  const assignableMembers = useMemo(() => teamMembers.length ? getAssignableMembers(auth, teamMembers) : [], [auth, teamMembers]);
  const repOptions = useMemo(() => {
    const fallbackOptions = state.rows
      .filter((row) => row.rowType === 'Individual Rep')
      .map((row) => row.name.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return assignableMembers.length ? assignableMembers.map((member) => member.displayName) : fallbackOptions;
  }, [assignableMembers, state.rows]);

  const headerActions = useMemo(() => (
    <>
      <button className="secondary-button" type="button" onClick={() => downloadCsv(state)}>Export CSV</button>
      <button className="secondary-button" type="button" onClick={() => window.print()}>Export PDF</button>
    </>
  ), [state]);

  if (!auth) {
    return (
      <Login
        supabaseEnabled={supabaseEnabled}
        statusMessage={statusMessage}
        onLogin={async (email, password, mode) => {
          if (mode === 'reset') {
            try {
              if (supabaseEnabled) {
                await sendReset(email);
                setStatusMessage('Password reset email sent.');
              } else {
                setStatusMessage('Add Supabase env keys to enable password reset.');
              }
            } catch (error) {
              console.error(error);
              setStatusMessage('Could not send reset email.');
            }
            return;
          }

          try {
            if (supabaseEnabled) {
              const session = mode === 'signup' ? await signUpWithEmail(email, password) : await signInWithEmail(email, password);
              if (!session?.user) {
                setStatusMessage(mode === 'signup' ? 'Check your email to confirm your account.' : 'Signed in, but no session was returned yet.');
              }
              const remote = session?.user ? await loadRemoteState(session.user.id, defaultAppState) : null;
              const next = { email, role: remote?.auth?.role ?? 'rep', displayName: remote?.auth?.displayName, orgOwnerId: remote?.auth?.orgOwnerId } as AuthState;
              setAuth(next);
              localStorage.setItem(AUTH_KEY, JSON.stringify(next));
              if (remote?.state) setState(normalizeState(remote.state));
              if (remote?.scenarios.length) setScenarios(remote.scenarios);
              if (remote?.teamMembers.length) setTeamMembers(remote.teamMembers);
              setStatusMessage(mode === 'signup' ? 'Account created.' : 'Signed in with Supabase.');
            } else {
              const next = { email, role: 'owner' } as AuthState;
              setAuth(next);
              localStorage.setItem(AUTH_KEY, JSON.stringify(next));
              setStatusMessage('Signed in locally.');
            }
          } catch (error) {
            console.error(error);
            setStatusMessage(error instanceof Error ? error.message : 'Login failed.');
          }
        }}
      />
    );
  }

  return (
    <DashboardLayout
      role={auth.role}
      roleLabel={dashboardSummary.projectedRoleLabel}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      theme={theme}
      onThemeToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      onLogout={async () => {
        localStorage.removeItem(AUTH_KEY);
        if (supabaseEnabled) await signOutSupabase();
        setAuth(null);
        setStatusMessage('Signed out.');
      }}
      headerActions={headerActions}
    >
      {activeTab === 'overview' && (
        <SummaryCards summary={dashboardSummary} settings={state.settings} onSettingsChange={updateSettings} />
      )}

      {activeTab === 'settings' && (
        <>
          <InputSettings settings={state.settings} onChange={updateSettings} summary={settingsSummary} />
          {canManageTeam(auth?.role) && teamMembers.length > 0 && auth?.email ? (
            <TeamAccessManager
              members={teamMembers}
              ownerEmail={auth.email}
              onMemberChange={(email, patch) => setTeamMembers((current) => current.map((member) => member.email === email ? { ...member, ...patch } : member))}
            />
          ) : null}
          <ExpenseTracker
            expenses={state.expenses}
            repOptions={repOptions}
            useManualExpenseTotal={state.useManualExpenseTotal}
            manualExpenseTotal={state.manualExpenseTotal}
            canEdit={canManageOrgState(auth?.role)}
            onToggleManual={(value) => canManageOrgState(auth?.role) && setState((current) => ({ ...current, useManualExpenseTotal: value }))}
            onManualChange={(value) => canManageOrgState(auth?.role) && setState((current) => ({ ...current, manualExpenseTotal: value }))}
            onExpenseChange={updateExpense}
            onAddExpense={addExpense}
            onDeleteExpense={deleteExpense}
            summary={dashboardSummary.expenseSummary}
            projectedOverrideEarnings={dashboardSummary.totalProjectedOverrideEarnings}
          />
        </>
      )}

      {activeTab === 'backend-plan' && (
        <PotentialMoneyTracker
          items={state.potentialMoney}
          totalPotentialOutlay={dashboardSummary.potentialMoneySummary.totalPotentialOutlay}
          totalPotentialValue={dashboardSummary.potentialMoneySummary.totalPotentialValue}
          onItemChange={updatePotentialMoney}
          onAddItem={addPotentialMoney}
          onDeleteItem={deletePotentialMoney}
        />
      )}

      {activeTab === 'calculator' && (
        <CalculatorTable
          rows={state.rows}
          derivedRows={dashboardSummary.derivedRows}
          settings={state.settings}
          expenses={state.expenses}
          onRowChange={updateRow}
          onAddRow={addRow}
          onDuplicateRow={duplicateRow}
          onDeleteRow={deleteRow}
        />
      )}

      {activeTab === 'actuals' && (
        <ActualsTracker
          actuals={state.actuals}
          rows={state.rows}
          derivedRows={dashboardSummary.derivedRows}
          settings={state.settings}
          actualYtdOverrideEarnings={dashboardSummary.totalActualYtdEarnings}
          actualNetEarnedToDate={dashboardSummary.actualNetEarnedToDate}
          onChange={updateActuals}
        />
      )}
    </DashboardLayout>
  );
}
