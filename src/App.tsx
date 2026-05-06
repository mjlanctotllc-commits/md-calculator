import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActualsTracker } from './components/ActualsTracker';
import { CalculatorTable } from './components/CalculatorTable';
import { DashboardLayout } from './components/DashboardLayout';
import { ExpenseTracker } from './components/ExpenseTracker';
import { InputSettings } from './components/InputSettings';
import { Login } from './components/Login';
import { PotentialMoneyTracker } from './components/PotentialMoneyTracker';
import { SummaryCards } from './components/SummaryCards';
import { createExpense, createPotentialMoney, createRow, defaultAppState, starterScenarios, uid } from './defaults';
import { getSupabaseSession, loadRemoteState, saveRemoteState, sendReset, signInWithEmail, signOutSupabase, signUpWithEmail, supabaseEnabled } from './lib/supabase';
import { AppState, AuthState, CalculatorRow, ExpenseItem, GlobalSettings, PotentialMoneyItem, SavedScenario, TabKey, ThemeMode } from './types';
import { downloadCsv, getDashboardSummary, getSettingsSummary } from './utils';

const AUTH_KEY = 'md-auth';
const APP_KEY = 'md-app-state';
const SCENARIO_KEY = 'md-scenarios';
const THEME_KEY = 'md-theme';
const IMPORT_VERSION_KEY = 'md-import-version';
const CURRENT_IMPORT_VERSION = '2026-import-v3';

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
    category: 'Housing',
  })),
});

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [state, setState] = useState<AppState>(defaultAppState);
  const [scenarios, setScenarios] = useState<SavedScenario[]>(starterScenarios(defaultAppState));
  const [statusMessage, setStatusMessage] = useState('Imported your Google Sheet defaults.');
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
          const localAuth = storedAuth ? JSON.parse(storedAuth) as AuthState : { email: session.user.email ?? '', role: 'manager' as const };
          const remote = await loadRemoteState(session.user.id);
          const nextAuth = {
            email: session.user.email ?? localAuth.email,
            role: remote.auth?.role ?? localAuth.role,
          } as AuthState;
          setAuth(nextAuth);
          localStorage.setItem(AUTH_KEY, JSON.stringify(nextAuth));
          if (remote.state) setState(normalizeState(remote.state));
          if (remote.scenarios.length) setScenarios(remote.scenarios);
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
    setState((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
  }, []);

  const updateRow = useCallback(<K extends keyof CalculatorRow>(id: string, key: K, value: CalculatorRow[K]) => {
    setState((current) => ({
      ...current,
      rows: current.rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    }));
  }, []);

  const addRow = useCallback(() => setState((current) => ({
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
  })), []);

  const duplicateRow = useCallback((id: string) => setState((current) => {
    const original = current.rows.find((row) => row.id === id);
    if (!original) return current;
    return { ...current, rows: [...current.rows, { ...original, id: uid(), name: `${original.name} Copy` }] };
  }), []);

  const deleteRow = useCallback((id: string) => setState((current) => ({ ...current, rows: current.rows.filter((row) => row.id !== id) })), []);

  const updateExpense = useCallback(<K extends keyof ExpenseItem>(id: string, key: K, value: ExpenseItem[K]) => {
    setState((current) => ({
      ...current,
      expenses: current.expenses.map((expense) => (
        expense.id === id ? { ...expense, [key]: value, category: 'Housing' } : expense
      )),
    }));
  }, []);

  const addExpense = useCallback(() => setState((current) => ({
    ...current,
    expenses: [...current.expenses, createExpense({ category: 'Housing', name: 'Housing expense' })],
  })), []);
  const deleteExpense = useCallback((id: string) => setState((current) => ({ ...current, expenses: current.expenses.filter((expense) => expense.id !== id) })), []);

  const updatePotentialMoney = useCallback(<K extends keyof PotentialMoneyItem>(id: string, key: K, value: PotentialMoneyItem[K]) => {
    setState((current) => ({
      ...current,
      potentialMoney: current.potentialMoney.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }));
  }, []);

  const addPotentialMoney = useCallback(() => setState((current) => ({ ...current, potentialMoney: [...current.potentialMoney, createPotentialMoney()] })), []);
  const deletePotentialMoney = useCallback((id: string) => setState((current) => ({ ...current, potentialMoney: current.potentialMoney.filter((item) => item.id !== id) })), []);

  const updateActuals = useCallback(<K extends keyof AppState['actuals']>(key: K, value: AppState['actuals'][K]) => {
    setState((current) => ({ ...current, actuals: { ...current.actuals, [key]: value } }));
  }, []);

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
        onLogin={async (email, password, role, mode) => {
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
              const next = { email, role } as AuthState;
              setAuth(next);
              localStorage.setItem(AUTH_KEY, JSON.stringify(next));
              if (session?.user) {
                const remote = await loadRemoteState(session.user.id);
                if (remote.state) setState(normalizeState(remote.state));
                if (remote.scenarios.length) setScenarios(remote.scenarios);
              }
              setStatusMessage(mode === 'signup' ? 'Account created.' : 'Signed in with Supabase.');
            } else {
              const next = { email, role } as AuthState;
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
          <ExpenseTracker
            expenses={state.expenses}
            useManualExpenseTotal={state.useManualExpenseTotal}
            manualExpenseTotal={state.manualExpenseTotal}
            onToggleManual={(value) => setState((current) => ({ ...current, useManualExpenseTotal: value }))}
            onManualChange={(value) => setState((current) => ({ ...current, manualExpenseTotal: value }))}
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
