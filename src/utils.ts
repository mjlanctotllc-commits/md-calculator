import { AppState, CalculatorRow, DerivedRowMetrics, ExpenseItem, GlobalSettings, PotentialMoneyItem } from './types';

export const currency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0,
  );

export const percent = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(Number.isFinite(value) ? value : 0);

export const number = (value: number, digits = 0) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(Number.isFinite(value) ? value : 0);

const safeRatio = (value: number) => (value > 0 ? value : 1);

const getGlobalCostTotal = (settings: GlobalSettings) =>
  settings.housingUtilitiesFurniture +
  settings.repPeakSeasonGear +
  settings.commissionsOverridesCost +
  settings.recruitingBudget +
  settings.peakSeasonIncentiveBudget;

export const getSettingsSummary = (
  settings: GlobalSettings,
  expenseTotal: number,
  totalYtdRevenue: number,
  totalYtdRetainedRevenue: number,
) => {
  const netRetainedRevenue = totalYtdRetainedRevenue || (totalYtdRevenue * settings.averageRetention);
  const marketingDealFee = netRetainedRevenue * settings.marketingDealFeePercentage;
  const netMdPercentage = Math.max(0, settings.managerDealPercentage - settings.marketingDealFeePercentage);
  const estimatedGrossEarnings = netRetainedRevenue * netMdPercentage;
  const estimatedAfterExpenses = estimatedGrossEarnings - expenseTotal;
  const roadmapRevenuePerAccount = settings.roadmapAccounts * settings.roadmapAverageValue;

  return {
    netRetainedRevenue,
    marketingDealFee,
    netMdPercentage,
    estimatedGrossEarnings,
    estimatedAfterExpenses,
    roadmapRevenuePerAccount,
    globalCostTotal: getGlobalCostTotal(settings),
    totalYtdRevenue,
    totalYtdRetainedRevenue,
  };
};

export const deriveRow = (row: CalculatorRow, settings: GlobalSettings): DerivedRowMetrics => {
  const rookieRevenueNeeded = Math.max(0, row.goalRevenue - row.managerVeteranRevenue);
  const projectedRetainedRevenue = row.goalRevenue * row.retention;
  const requiredFinishedReps = Math.ceil(rookieRevenueNeeded / Math.max(1, row.perRepAverage));
  const requiredStartedReps = Math.ceil(requiredFinishedReps / safeRatio(row.startToFinishRatio));
  const requiredSignedReps = Math.ceil(requiredStartedReps / safeRatio(row.signedToStartRatio));

  const overridePercentage = row.payType === 'Marketing Deal'
    ? Math.max(0, row.myMarketingDealPercent - row.theirDealPercent)
    : Math.max(0, row.myMarketingDealPercent - settings.marketingDealFeePercentage - row.theirDealPercent);

  const projectedOverrideEarnings = projectedRetainedRevenue * overridePercentage;
  const ytdRetainedRevenue = row.currentYtdRevenue * row.retention;

  return {
    rookieRevenueNeeded,
    projectedRetainedRevenue,
    requiredFinishedReps,
    requiredStartedReps,
    requiredSignedReps,
    overridePercentage,
    projectedOverrideEarnings,
    ytdRetainedRevenue,
  };
};

export const getExpenseSummary = (
  expenses: ExpenseItem[],
  settings: GlobalSettings,
  useManual: boolean,
  manualExpenseTotal: number,
  projectedEarnings: number,
) => {
  const scopedExpenses = useManual ? [] : expenses.filter((item) => item.comesOutOfMyMd);
  const sumScoped = (match: (item: ExpenseItem) => boolean) =>
    scopedExpenses.filter(match).reduce((total, item) => total + item.amount, 0);
  const sumAll = (match: (item: ExpenseItem) => boolean) =>
    expenses.filter(match).reduce((total, item) => total + item.amount, 0);

  const housingCostsOnMyMd = sumScoped((item) => item.category === 'Housing' || item.category === 'Personal Housing');
  const advancesOnMyMd = sumScoped((item) => item.category === 'Advances');
  const bonusesOnMyMd = sumScoped((item) => item.category === 'Bonuses' || item.category === 'Incentives');
  const otherExpensesOnMyMd = sumScoped(
    (item) => !['Housing', 'Personal Housing', 'Advances', 'Bonuses', 'Incentives'].includes(item.category),
  );
  const totalHousingForDownline = sumAll((item) => item.category === 'Housing' || item.category === 'Personal Housing');
  const totalAdvancesBonusesForDownline = sumAll(
    (item) => item.category === 'Advances' || item.category === 'Bonuses' || item.category === 'Incentives',
  );

  const totalExpensesDeducted = useManual
    ? manualExpenseTotal
    : scopedExpenses.reduce((total, item) => total + item.amount, 0);

  return {
    housingCostsOnMyMd,
    advancesOnMyMd,
    bonusesOnMyMd,
    otherExpensesOnMyMd,
    totalHousingForDownline,
    totalAdvancesBonusesForDownline,
    totalExpenses: useManual ? manualExpenseTotal : expenses.reduce((total, item) => total + item.amount, 0),
    totalExpensesDeducted,
    projectedNetToBePaid: projectedEarnings - totalExpensesDeducted,
    globalCostTotal: getGlobalCostTotal(settings),
  };
};

const getPotentialMoneySummary = (items: PotentialMoneyItem[]) => ({
  totalPotentialOutlay: items.reduce((sum, item) => sum + item.amount, 0),
  totalPotentialValue: items.reduce((sum, item) => sum + item.projectedValue, 0),
});

const parseLocalDate = (value: string, endOfDay = false) => {
  if (!value) return null;
  const time = endOfDay ? 'T23:59:59.999' : 'T00:00:00';
  const parsed = new Date(`${value}${time}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getSeasonPacing = (settings: GlobalSettings, totalGoalRevenue: number, now = new Date()) => {
  if (settings.useManualNeededRevenue) {
    return {
      neededRevenuePerWeek: settings.manualNeededRevenuePerWeek,
      weeksRemaining: 0,
      pacingActive: true,
      isManual: true,
    };
  }

  const startDate = parseLocalDate(settings.seasonStartDate);
  const endDate = parseLocalDate(settings.seasonEndDate, true);

  if (!startDate || !endDate || endDate <= startDate) {
    return {
      neededRevenuePerWeek: 0,
      weeksRemaining: 0,
      pacingActive: false,
    };
  }

  const anchorDate = now < startDate ? startDate : now;
  const msRemaining = Math.max(0, endDate.getTime() - anchorDate.getTime());
  const weeksRemaining = msRemaining / (1000 * 60 * 60 * 24 * 7);

  return {
    neededRevenuePerWeek: weeksRemaining > 0 ? totalGoalRevenue / weeksRemaining : 0,
    weeksRemaining,
    pacingActive: true,
  };
};

export const getProjectedRevenueFromInputs = (state: AppState) =>
  state.rows.reduce((sum, row) => sum + Math.max(row.goalRevenue, row.managerVeteranRevenue + row.activeRookieReps * row.perRepAverage), 0);

export const getRoleLabelFromRevenue = (revenue: number) => {
  if (revenue < 1_250_000) return 'Rising Team Lead';
  if (revenue < 2_500_000) return 'Rising Manager';
  if (revenue < 5_000_000) return 'Rising Divisional';
  if (revenue < 10_000_000) return 'Rising Regional';
  if (revenue < 20_000_000) return 'Rising VP';
  return 'Rising President';
};

export const getDashboardSummary = (state: AppState) => {
  const derivedRows = state.rows.map((row) => deriveRow(row, state.settings));
  const totalGoalRevenue = state.rows.reduce((sum, row) => sum + row.goalRevenue, 0);
  const totalProjectedRetainedRevenue = derivedRows.reduce((sum, row) => sum + row.projectedRetainedRevenue, 0);
  const totalProjectedOverrideEarnings = derivedRows.reduce((sum, row) => sum + row.projectedOverrideEarnings, 0);
  const totalYtdRevenue = state.rows.reduce((sum, row) => sum + row.currentYtdRevenue, 0);
  const totalYtdRetainedRevenue = state.rows.reduce((sum, row) => sum + row.actualRetainedRevenue, 0);
  const totalActualYtdEarnings = state.rows.reduce((sum, row) => sum + row.actualYtdOverrideEarnings, 0);
  const requiredSummerReadyReps = derivedRows.reduce((sum, row) => sum + row.requiredSignedReps, 0);
  const currentActiveRookieReps = state.rows.reduce((sum, row) => sum + row.activeRookieReps, 0);
  const gapToGoal = Math.max(0, totalGoalRevenue - totalYtdRevenue);
  const expenseSummary = getExpenseSummary(state.expenses, state.settings, state.useManualExpenseTotal, state.manualExpenseTotal, totalProjectedOverrideEarnings);
  const visibleMdDeductions = expenseSummary.housingCostsOnMyMd + expenseSummary.advancesOnMyMd + expenseSummary.bonusesOnMyMd;
  const actualNetEarnedToDate = totalActualYtdEarnings - visibleMdDeductions;
  const goalNetAfterVisibleExpenses = totalProjectedOverrideEarnings - visibleMdDeductions;
  const potentialMoneySummary = getPotentialMoneySummary(state.potentialMoney);
  const projectedRevenueFromInputs = getProjectedRevenueFromInputs(state);
  const projectedRoleLabel = getRoleLabelFromRevenue(projectedRevenueFromInputs);
  const seasonPacing = getSeasonPacing(state.settings, totalGoalRevenue);

  return {
    derivedRows,
    totalGoalRevenue,
    totalProjectedRetainedRevenue,
    totalProjectedOverrideEarnings,
    totalYtdRevenue,
    totalYtdRetainedRevenue,
    totalActualYtdEarnings,
    requiredSummerReadyReps,
    currentActiveRookieReps,
    gapToGoal,
    projectedNetToBePaid: expenseSummary.projectedNetToBePaid,
    goalNetAfterVisibleExpenses,
    expenseSummary,
    actualNetEarnedToDate,
    potentialMoneySummary,
    projectedRevenueFromInputs,
    projectedRoleLabel,
    neededRevenuePerWeek: seasonPacing.neededRevenuePerWeek,
    seasonWeeksRemaining: seasonPacing.weeksRemaining,
    pacingActive: seasonPacing.pacingActive,
  };
};

export const downloadCsv = (state: AppState) => {
  const rows = state.rows.map((row) => {
    const derived = deriveRow(row, state.settings);
    return {
      Name: row.name,
      RowType: row.rowType,
      PayType: row.payType,
      GoalRevenue: row.goalRevenue,
      CurrentYtdRevenue: row.currentYtdRevenue,
      ManagerVeteranRevenue: row.managerVeteranRevenue,
      RookieRevenueNeeded: derived.rookieRevenueNeeded,
      PerRepAverage: row.perRepAverage,
      SignedToStartRatio: row.signedToStartRatio,
      StartToFinishRatio: row.startToFinishRatio,
      Retention: row.retention,
      RequiredFinishedReps: derived.requiredFinishedReps,
      RequiredStartedReps: derived.requiredStartedReps,
      RequiredSignedReps: derived.requiredSignedReps,
      ActiveRookieReps: row.activeRookieReps,
      TheirDealPercent: row.theirDealPercent,
      MyMarketingDealPercent: row.myMarketingDealPercent,
      OverridePercent: derived.overridePercentage,
      ProjectedRetainedRevenue: derived.projectedRetainedRevenue,
      ActualRetainedRevenue: row.actualRetainedRevenue,
      ProjectedOverrideEarnings: derived.projectedOverrideEarnings,
      ActualYtdOverrideEarnings: row.actualYtdOverrideEarnings,
      Notes: row.notes,
    };
  });

  const headers = Object.keys(rows[0] ?? { Empty: '' });
  const csvContent = [headers.join(','), ...rows.map((row) => headers.map((header) => JSON.stringify(row[header as keyof typeof row] ?? '')).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'md-earnings-scenario.csv';
  link.click();
  URL.revokeObjectURL(url);
};
