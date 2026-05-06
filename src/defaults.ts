import { AppState, CalculatorRow, ExpenseItem, GlobalSettings, PotentialMoneyItem, SavedScenario } from './types';

export const uid = () => Math.random().toString(36).slice(2, 10);

export const defaultSettings: GlobalSettings = {
  managerName: 'Michael Lanctot',
  accounts: 8538384,
  averageValuePerAccount: 750,
  managerDealPercentage: 0.85,
  marketingDealFeePercentage: 0.02,
  perRepAverageRevenue: 100000,
  signedToStartRatio: 0.75,
  startToFinishRatio: 0.75,
  averageRetention: 0.75,
  defaultRookieFlatPayPercentage: 0.5,
  defaultManagerVeteranRevenue: 0,
  currentYtdRevenue: 4269192,
  currentYtdRetainedRevenue: 3201894,
  roadmapMonth: '2026',
  roadmapAccounts: 892.8571429,
  roadmapAverageValue: 560,
  roadmapTotalCommissionsOverrides: 327898.14,
  roadmapRevenue: 500000,
  seasonStartDate: '2026-05-01',
  seasonEndDate: '2026-08-31',
  useManualNeededRevenue: false,
  manualNeededRevenuePerWeek: 0,
  salesManagerLevelCost: 0,
  housingUtilitiesFurniture: 0,
  repPeakSeasonGear: 0,
  commissionsOverridesCost: 0,
  recruitingBudget: 0,
  peakSeasonIncentiveBudget: 0,
};

export const createRow = (overrides: Partial<CalculatorRow> = {}): CalculatorRow => ({
  id: uid(),
  name: 'New Team',
  rowType: 'Team',
  payType: 'Marketing Deal',
  goalRevenue: 3000000,
  currentYtdRevenue: 0,
  managerVeteranRevenue: 0,
  perRepAverage: defaultSettings.perRepAverageRevenue,
  signedToStartRatio: defaultSettings.signedToStartRatio,
  startToFinishRatio: defaultSettings.startToFinishRatio,
  retention: defaultSettings.averageRetention,
  activeRookieReps: 0,
  theirDealPercent: 0.6,
  myMarketingDealPercent: defaultSettings.managerDealPercentage,
  actualRetainedRevenue: 0,
  actualYtdOverrideEarnings: 0,
  notes: '',
  ...overrides,
});

export const createExpense = (overrides: Partial<ExpenseItem> = {}): ExpenseItem => ({
  id: uid(),
  name: 'New expense',
  category: 'Housing',
  amount: 0,
  assignedTo: '',
  comesOutOfMyMd: true,
  notes: '',
  ...overrides,
});

export const createPotentialMoney = (overrides: Partial<PotentialMoneyItem> = {}): PotentialMoneyItem => ({
  id: uid(),
  name: 'New opportunity',
  amount: 0,
  status: '',
  projectedValue: 0,
  roi: '',
  notes: '',
  ...overrides,
});

const importedRows: CalculatorRow[] = [
  createRow({ name: 'Tate Breyer', rowType: 'Individual Rep', goalRevenue: 18000000, currentYtdRevenue: 1028000, managerVeteranRevenue: 12000000, retention: 0.75, activeRookieReps: 130, theirDealPercent: 0.75, myMarketingDealPercent: 0.85, actualRetainedRevenue: 771000, actualYtdOverrideEarnings: 77100, notes: '2026 import. Needed summer ready rookies: 106.67. Goal override: 1350000.' }),
  createRow({ name: 'Pete', rowType: 'Individual Rep', goalRevenue: 14000000, currentYtdRevenue: 977952, managerVeteranRevenue: 9000000, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.79, myMarketingDealPercent: 0.85, actualRetainedRevenue: 733464, actualYtdOverrideEarnings: 44007.84, notes: '2026 import. Needed summer ready rookies: 88.89. Goal override: 630000.' }),
  createRow({ name: 'Kuba', rowType: 'Individual Rep', goalRevenue: 8000000, currentYtdRevenue: 700000, managerVeteranRevenue: 4000000, retention: 0.75, activeRookieReps: 80, theirDealPercent: 0.725, myMarketingDealPercent: 0.85, actualRetainedRevenue: 525000, actualYtdOverrideEarnings: 65625, notes: '2026 import. Needed summer ready rookies: 71.11. Goal override: 750000.' }),
  createRow({ name: 'Liam', rowType: 'Individual Rep', goalRevenue: 8000000, currentYtdRevenue: 560000, managerVeteranRevenue: 5000000, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.725, myMarketingDealPercent: 0.85, actualRetainedRevenue: 420000, actualYtdOverrideEarnings: 52500, notes: '2026 import. Needed summer ready rookies: 53.33. Goal override: 750000.' }),
  createRow({ name: 'Joon', rowType: 'Individual Rep', goalRevenue: 8000000, currentYtdRevenue: 320000, managerVeteranRevenue: 5500000, retention: 0.75, activeRookieReps: 3, theirDealPercent: 0.725, myMarketingDealPercent: 0.85, actualRetainedRevenue: 240000, actualYtdOverrideEarnings: 30000, notes: '2026 import. Needed summer ready rookies: 44.44. Goal override: 750000.' }),
  createRow({ name: 'Jasper', rowType: 'Individual Rep', goalRevenue: 5000000, currentYtdRevenue: 181000, managerVeteranRevenue: 3500000, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.81, myMarketingDealPercent: 0.85, actualRetainedRevenue: 135750, actualYtdOverrideEarnings: 5430, notes: '2026 import. Needed summer ready rookies: 26.67. Goal override: 150000.' }),
  createRow({ name: 'Omar', rowType: 'Individual Rep', goalRevenue: 3500000, currentYtdRevenue: 112800, managerVeteranRevenue: 2000000, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.75, myMarketingDealPercent: 0.85, actualRetainedRevenue: 84600, actualYtdOverrideEarnings: 8460, notes: '2026 import. Needed summer ready rookies: 26.67. Goal override: 262500.' }),
  createRow({ name: 'Luis Saldana', rowType: 'Individual Rep', goalRevenue: 2700000, currentYtdRevenue: 178440, managerVeteranRevenue: 1000000, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.69, myMarketingDealPercent: 0.85, actualRetainedRevenue: 133830, actualYtdOverrideEarnings: 21412.8, notes: '2026 import. Needed summer ready rookies: 30.22. Goal override: 324000.' }),
  createRow({ name: 'Spencer', rowType: 'Individual Rep', goalRevenue: 3000000, currentYtdRevenue: 9000, managerVeteranRevenue: 500000, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.7, myMarketingDealPercent: 0.85, actualRetainedRevenue: 6750, actualYtdOverrideEarnings: 1012.5, notes: '2026 import. Needed summer ready rookies: 44.44. Goal override: 337500.' }),
  createRow({ name: 'Hayden', rowType: 'Individual Rep', goalRevenue: 3000000, currentYtdRevenue: 70000, managerVeteranRevenue: 1000000, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.675, myMarketingDealPercent: 0.85, actualRetainedRevenue: 52500, actualYtdOverrideEarnings: 9187.5, notes: '2026 import. Needed summer ready rookies: 35.56. Goal override: 393750.' }),
  createRow({ name: 'Alex Quin', rowType: 'Individual Rep', goalRevenue: 1000000, currentYtdRevenue: 40000, managerVeteranRevenue: 750000, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.74, myMarketingDealPercent: 0.85, actualRetainedRevenue: 30000, actualYtdOverrideEarnings: 3300, notes: '2026 import. Needed summer ready rookies: 4.44. Goal override: 82500.' }),
  createRow({ name: 'Ayden Parks', rowType: 'Individual Rep', goalRevenue: 1500000, currentYtdRevenue: 0, managerVeteranRevenue: 500000, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.55, myMarketingDealPercent: 0.85, actualRetainedRevenue: 0, actualYtdOverrideEarnings: 0, notes: '2026 import. Needed summer ready rookies: 17.78. Goal override: 337500.' }),
  createRow({ name: 'Rendon', rowType: 'Individual Rep', goalRevenue: 1000000, currentYtdRevenue: 40000, managerVeteranRevenue: 100000, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.75, myMarketingDealPercent: 0.85, actualRetainedRevenue: 30000, actualYtdOverrideEarnings: 3000, notes: '2026 import. Needed summer ready rookies: 16. Goal override: 75000.' }),
  createRow({ name: 'Ignacio', rowType: 'Individual Rep', goalRevenue: 700000, currentYtdRevenue: 0, managerVeteranRevenue: 200000, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.72, myMarketingDealPercent: 0.85, actualRetainedRevenue: 0, actualYtdOverrideEarnings: 0, notes: '2026 import. Needed summer ready rookies: 8.89. Goal override: 68250.' }),
  createRow({ name: 'Clemente', rowType: 'Individual Rep', goalRevenue: 700000, currentYtdRevenue: 5000, managerVeteranRevenue: 200000, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.65, myMarketingDealPercent: 0.85, actualRetainedRevenue: 3750, actualYtdOverrideEarnings: 750, notes: '2026 import. Needed summer ready rookies: 8.89. Goal override: 105000.' }),
  createRow({ name: 'Joshua Ledbetter', rowType: 'Individual Rep', goalRevenue: 300000, currentYtdRevenue: 25000, managerVeteranRevenue: 0, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.7, myMarketingDealPercent: 0.85, actualRetainedRevenue: 18750, actualYtdOverrideEarnings: 2812.5, notes: '2026 import. Needed summer ready rookies: 5.33. Goal override: 33750.' }),
  createRow({ name: 'Chance', rowType: 'Individual Rep', goalRevenue: 250000, currentYtdRevenue: 22000, managerVeteranRevenue: 0, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.65, myMarketingDealPercent: 0.85, actualRetainedRevenue: 16500, actualYtdOverrideEarnings: 3300, notes: '2026 import. Needed summer ready rookies: 4.44. Goal override: 37500.' }),
  createRow({ name: 'Reps i sent to Kuba', rowType: 'Team', goalRevenue: 100000, currentYtdRevenue: 0, managerVeteranRevenue: 0, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.64, myMarketingDealPercent: 0.85, actualRetainedRevenue: 0, actualYtdOverrideEarnings: 0, notes: '2026 import. Needed summer ready rookies: 1.78. Goal override: 15750.' }),
  createRow({ name: 'Reps i sent to Joon (austin blair, blanding guys, caiden)', rowType: 'Team', goalRevenue: 2000000, currentYtdRevenue: 0, managerVeteranRevenue: 0, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.675, myMarketingDealPercent: 0.85, actualRetainedRevenue: 0, actualYtdOverrideEarnings: 0, notes: '2026 import. Needed summer ready rookies: 35.56. Goal override: 262500.' }),
  createRow({ name: 'Reps i sent to Alex Q (Aidan Beltran, Anthony Beeman, Landon and reps, Cole, etc)', rowType: 'Team', goalRevenue: 1500000, currentYtdRevenue: 0, managerVeteranRevenue: 0, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.67, myMarketingDealPercent: 0.85, actualRetainedRevenue: 0, actualYtdOverrideEarnings: 0, notes: '2026 import. Needed summer ready rookies: 26.67. Goal override: 202500.' }),
  createRow({ name: 'Reps i sent to Liams Downline Nathan Warner, Tenzin etc', rowType: 'Team', goalRevenue: 700000, currentYtdRevenue: 0, managerVeteranRevenue: 0, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.64, myMarketingDealPercent: 0.85, actualRetainedRevenue: 0, actualYtdOverrideEarnings: 0, notes: '2026 import. Needed summer ready rookies: 12.44. Goal override: 110250.' }),
  createRow({ name: 'Reps i sent to Omar like Troy', rowType: 'Team', goalRevenue: 300000, currentYtdRevenue: 0, managerVeteranRevenue: 0, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.64, myMarketingDealPercent: 0.85, actualRetainedRevenue: 0, actualYtdOverrideEarnings: 0, notes: '2026 import. Needed summer ready rookies: 5.33. Goal override: 47250.' }),
  createRow({ name: 'Reps i sent Elevate', rowType: 'Team', goalRevenue: 800000, currentYtdRevenue: 0, managerVeteranRevenue: 0, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.64, myMarketingDealPercent: 0.85, actualRetainedRevenue: 0, actualYtdOverrideEarnings: 0, notes: '2026 import. Needed summer ready rookies: 14.22. Goal override: 126000.' }),
  createRow({ name: 'Reps i sent Spencer', rowType: 'Team', goalRevenue: 300000, currentYtdRevenue: 0, managerVeteranRevenue: 0, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.64, myMarketingDealPercent: 0.85, actualRetainedRevenue: 0, actualYtdOverrideEarnings: 0, notes: '2026 import. Needed summer ready rookies: 5.33. Goal override: 47250.' }),
  createRow({ name: 'Reps i sent Academy', rowType: 'Team', goalRevenue: 700000, currentYtdRevenue: 0, managerVeteranRevenue: 0, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.64, myMarketingDealPercent: 0.85, actualRetainedRevenue: 0, actualYtdOverrideEarnings: 0, notes: '2026 import. Needed summer ready rookies: 12.44. Goal override: 110250.' }),
  createRow({ name: 'Reps i sent Luis', rowType: 'Team', goalRevenue: 300000, currentYtdRevenue: 0, managerVeteranRevenue: 0, retention: 0.75, activeRookieReps: 0, theirDealPercent: 0.64, myMarketingDealPercent: 0.85, actualRetainedRevenue: 0, actualYtdOverrideEarnings: 0, notes: '2026 import. Needed summer ready rookies: 5.33. Goal override: 47250.' }),
  createRow({ name: 'Reps i sent to Ignacio. Ephram, etc', rowType: 'Team', goalRevenue: 200000, currentYtdRevenue: 0, managerVeteranRevenue: 0, retention: 1, activeRookieReps: 0, theirDealPercent: 0.64, myMarketingDealPercent: 0.85, actualRetainedRevenue: 0, actualYtdOverrideEarnings: 0, notes: '2026 import. Needed summer ready rookies: 3.56.' }),
  createRow({ name: 'Reps i sent Hayden', rowType: 'Team', goalRevenue: 200000, currentYtdRevenue: 0, managerVeteranRevenue: 0, retention: 1, activeRookieReps: 0, theirDealPercent: 0.64, myMarketingDealPercent: 0.85, actualRetainedRevenue: 0, actualYtdOverrideEarnings: 0, notes: '2026 import. Needed summer ready rookies: 3.56.' }),
];

const importedExpenses: ExpenseItem[] = [
  createExpense({ name: 'Italy and Europe Trip', category: 'Travel', amount: 50000, assignedTo: 'Tate Breyer' }),
  createExpense({ name: 'Hayden Sign on', category: 'Bonuses', amount: 31000, assignedTo: 'Pete' }),
  createExpense({ name: 'LDP expenses', category: 'Miscellaneous', amount: 10000, assignedTo: 'Kuba' }),
  createExpense({ name: 'Salary', category: 'Bonuses', amount: 330000, assignedTo: 'Liam' }),
  createExpense({ name: 'Matt Sign on', category: 'Bonuses', amount: 70000, assignedTo: 'Joon' }),
  createExpense({ name: 'advances', category: 'Advances', amount: 30000, assignedTo: 'Jasper' }),
  createExpense({ name: 'Club', category: 'Miscellaneous', amount: 30000, assignedTo: 'Omar' }),
  createExpense({ name: 'Aramus owes me from negative last year', category: 'Miscellaneous', amount: -6964.24, assignedTo: 'Luis Saldana' }),
  createExpense({ name: 'Omar owes me from negative last year', category: 'Miscellaneous', amount: -23575.65, assignedTo: 'Spencer' }),
  createExpense({ name: 'Ayden Parks sign on', category: 'Bonuses', amount: 35000, assignedTo: 'Hayden' }),
  createExpense({ name: 'Josh Negative', category: 'Miscellaneous', amount: 60000, assignedTo: 'Alex Quin' }),
  createExpense({ name: 'Alex Quin', category: 'Miscellaneous', amount: 8000, assignedTo: 'Ayden Parks' }),
  createExpense({ name: 'Old Josh Jolly', category: 'Miscellaneous', amount: 28000, assignedTo: 'Rendon' }),
];

const importedPotentialMoney: PotentialMoneyItem[] = [
  createPotentialMoney({ name: 'Horse', amount: 0, status: '?', projectedValue: 100000 }),
  createPotentialMoney({ name: 'Gwagon', amount: 70000, status: '', projectedValue: 390000 }),
  createPotentialMoney({ name: 'Other Businesses, RFID, Drone etc', amount: 200000, status: 'x', projectedValue: 100000 }),
  createPotentialMoney({ name: 'Paying off loans the club has', amount: 43000, status: '', projectedValue: 50000 }),
  createPotentialMoney({ name: 'Pay off cars', amount: 46000, status: '', projectedValue: 0 }),
  createPotentialMoney({ name: 'Taxes', amount: 20000, status: '', projectedValue: 0 }),
  createPotentialMoney({ name: 'Joseph', amount: 100000, status: 'x', projectedValue: 0 }),
  createPotentialMoney({ name: 'Jerome', amount: 25000, status: 'x', projectedValue: 50000 }),
  createPotentialMoney({ name: 'Amiel', amount: 100000, status: 'x', projectedValue: 0 }),
  createPotentialMoney({ name: 'Tithing', amount: 20000, status: 'x', projectedValue: 20000 }),
  createPotentialMoney({ name: 'House with Scott', amount: 110000, status: '1/2', projectedValue: 0 }),
  createPotentialMoney({ name: 'Solar', amount: 0, status: '', projectedValue: 0 }),
  createPotentialMoney({ name: 'paying off debt to Caleb', amount: 93000, status: 'x', projectedValue: 23000 }),
  createPotentialMoney({ name: 'Potentially money into club', amount: 500000, status: 'x', projectedValue: 200000 }),
  createPotentialMoney({ name: 'buy out island park owners', amount: 275000, status: 'x', projectedValue: 8000 }),
  createPotentialMoney({ name: 'Funding Diego Property', amount: 575000, status: 'x', projectedValue: 1000000 }),
  createPotentialMoney({ name: 'Pay off money to Tate', amount: 55000, status: 'x', projectedValue: 5000 }),
  createPotentialMoney({ name: 'Life Insurance', amount: 100000, status: 'x', projectedValue: 0 }),
];

export const defaultAppState: AppState = {
  settings: defaultSettings,
  rows: importedRows,
  expenses: importedExpenses,
  potentialMoney: importedPotentialMoney,
  useManualExpenseTotal: false,
  manualExpenseTotal: 0,
  actuals: {
    actualYtdRevenue: 4269192,
    actualYtdRetainedRevenue: 3201894,
    actualYtdExpenses: 651460.11,
  },
};

export const starterScenarioNames = ['Conservative', 'Realistic', 'Aggressive'];

export const starterScenarios = (base: AppState): SavedScenario[] => {
  const factors = [0.9, 1, 1.1];
  return starterScenarioNames.map((name, index) => ({
    id: uid(),
    name,
    savedAt: new Date().toISOString(),
    state: {
      ...base,
      settings: {
        ...base.settings,
        perRepAverageRevenue: Math.round(base.settings.perRepAverageRevenue * factors[index]),
        averageRetention: Math.min(0.95, Math.max(0.55, base.settings.averageRetention * factors[index])),
      },
      rows: base.rows.map((row) => ({
        ...row,
        goalRevenue: Math.round(row.goalRevenue * factors[index]),
        retention: Math.min(1, Math.max(0.55, row.retention * factors[index])),
      })),
    },
  }));
};
