export type Role = 'owner' | 'manager' | 'rep';
export type ThemeMode = 'dark' | 'light';
export type TabKey = 'overview' | 'settings' | 'backend-plan' | 'calculator' | 'actuals';
export type RowType = 'Team' | 'Individual Rep';
export type PayType = 'Marketing Deal' | 'Flat Pay' | 'Rookie Pay';

export interface AuthState {
  email: string;
  role: Role;
  displayName?: string;
  orgOwnerId?: string;
}

export interface TeamMember {
  email: string;
  displayName: string;
  role: Role;
  parentEmail?: string | null;
  userId?: string | null;
}

export interface GlobalSettings {
  managerName: string;
  accounts: number;
  averageValuePerAccount: number;
  managerDealPercentage: number;
  marketingDealFeePercentage: number;
  perRepAverageRevenue: number;
  signedToStartRatio: number;
  startToFinishRatio: number;
  averageRetention: number;
  defaultRookieFlatPayPercentage: number;
  defaultManagerVeteranRevenue: number;
  currentYtdRevenue: number;
  currentYtdRetainedRevenue: number;
  roadmapMonth: string;
  roadmapAccounts: number;
  roadmapAverageValue: number;
  roadmapTotalCommissionsOverrides: number;
  roadmapRevenue: number;
  seasonStartDate: string;
  seasonEndDate: string;
  useManualNeededRevenue: boolean;
  manualNeededRevenuePerWeek: number;
  salesManagerLevelCost: number;
  housingUtilitiesFurniture: number;
  repPeakSeasonGear: number;
  commissionsOverridesCost: number;
  recruitingBudget: number;
  peakSeasonIncentiveBudget: number;
}

export interface CalculatorRow {
  id: string;
  name: string;
  rowType: RowType;
  payType: PayType;
  goalRevenue: number;
  currentYtdRevenue: number;
  managerVeteranRevenue: number;
  perRepAverage: number;
  signedToStartRatio: number;
  startToFinishRatio: number;
  retention: number;
  activeRookieReps: number;
  theirDealPercent: number;
  myMarketingDealPercent: number;
  actualRetainedRevenue: number;
  actualYtdOverrideEarnings: number;
  notes: string;
}


export interface DerivedRowMetrics {
  rookieRevenueNeeded: number;
  projectedRetainedRevenue: number;
  requiredFinishedReps: number;
  requiredStartedReps: number;
  requiredSignedReps: number;
  overridePercentage: number;
  projectedOverrideEarnings: number;
  ytdRetainedRevenue: number;
}

export interface ExpenseItem {
  id: string;
  name: string;
  category:
    | 'Housing'
    | 'Personal Housing'
    | 'Advances'
    | 'Bonuses'
    | 'Incentives'
    | 'Travel'
    | 'Recruiting'
    | 'Miscellaneous'
    | 'My MD'
    | 'Other';
  amount: number;
  assignedTo: string;
  comesOutOfMyMd: boolean;
  notes: string;
  createdByEmail?: string;
}

export interface ActualsState {
  actualYtdRevenue: number;
  actualYtdRetainedRevenue: number;
  actualYtdExpenses: number;
}

export interface PotentialMoneyItem {
  id: string;
  name: string;
  amount: number;
  status: string;
  projectedValue: number;
  notes: string;
}

export interface AppState {
  settings: GlobalSettings;
  rows: CalculatorRow[];
  expenses: ExpenseItem[];
  potentialMoney: PotentialMoneyItem[];
  useManualExpenseTotal: boolean;
  manualExpenseTotal: number;
  actuals: ActualsState;
}

export interface SavedScenario {
  id: string;
  name: string;
  savedAt: string;
  state: AppState;
}
