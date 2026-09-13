export type TransactionType = 'income' | 'expense' | 'asset';

export type PaymentMethod = 'Cash Kasir' | 'Transfer Bank' | 'QRIS' | 'Hutang/Tempo';

export interface ReceiptLineItem {
  itemName: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ReceiptScanResult {
  vendorName: string;
  date: string; // YYYY-MM-DD
  amount: number;
  subtotal?: number;
  taxAmount?: number;
  category: string;
  subcategory?: string;
  paymentMethod: PaymentMethod;
  lineItems: ReceiptLineItem[];
  receiptNumber?: string;
  confidence: number;
  rawText?: string;
  notes?: string;
  imageUrl?: string;
  aiEngine?: string;
}

export interface ReceiptScanResponse {
  result: ReceiptScanResult;
  success: boolean;
  message?: string;
  error?: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string;
  subcategory?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  vendorOrCustomer: string;
  description: string;
  source: 'whatsapp' | 'manual' | 'groq_ai' | 'sheet_sync' | 'receipt_ocr';
  confidence?: number;
  receiptDetails?: ReceiptScanResult;
  createdAt: string;
}

export interface WhatsAppParsedItem {
  type: TransactionType;
  category: string;
  subcategory?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  vendorOrCustomer: string;
  date: string;
  description: string;
  confidence?: number;
}

export interface WhatsAppParseResponse {
  transactions: WhatsAppParsedItem[];
  summary: string;
  aiEngine?: string;
  error?: string;
}

export interface StatementItem {
  label: string;
  amount: number;
  percentOfRevenue?: number;
  note?: string;
  categoryGroup?: string;
}

export interface ProfitLossReport {
  period: string;
  revenue: {
    coffeeAndBeverages: number;
    kitchenAndEatery: number;
    pastryAndBakery: number;
    merchandiseAndBeans: number;
    deliveryPlatforms: number;
    discounts: number;
    totalGrossRevenue: number;
    totalNetRevenue: number;
  };
  cogs: {
    coffeeBeans: number;
    dairyAndMilk: number;
    kitchenFoodIngredients: number;
    syrupsAndPowders: number;
    packagingAndDisposables: number;
    totalCogs: number;
  };
  grossProfit: number;
  grossMarginPercent: number;
  opex: {
    salariesAndLabor: number;
    rentAndProperty: number;
    utilitiesElectricWater: number;
    kitchenGasLpg: number;
    posAndWifiTech: number;
    marketingAndSocial: number;
    repairsAndEspressoService: number;
    cleaningAndSupplies: number;
    deliveryCommissions: number;
    totalOpex: number;
  };
  ebitda: number;
  depreciation: number;
  operatingProfit: number;
  restaurantTaxPb1: number;
  netIncomeTax: number;
  netProfit: number;
  netMarginPercent: number;
}

export interface BalanceSheetReport {
  asOfDate: string;
  currentAssets: {
    cashDrawerPettyCash: number;
    bankAccountBca: number;
    bankAccountMandiri: number;
    qrisSettlementPending: number;
    rawMaterialInventory: number;
    prepaidRentAndExpenses: number;
    totalCurrentAssets: number;
  };
  fixedAssets: {
    espressoMachineAndGrinders: number;
    kitchenHeavyEquipment: number;
    posSystemAndFurniture: number;
    storeRenovationAndInterior: number;
    accumulatedDepreciation: number;
    totalFixedAssets: number;
  };
  totalAssets: number;
  currentLiabilities: {
    accountsPayableSuppliers: number;
    accruedPayrollSalaries: number;
    unpaidTaxesPb1: number;
    totalCurrentLiabilities: number;
  };
  longTermLiabilities: {
    equipmentLoans: number;
    totalLongTermLiabilities: number;
  };
  totalLiabilities: number;
  equity: {
    ownersInitialCapital: number;
    retainedEarnings: number;
    currentYearNetProfit: number;
    ownersDrawings: number;
    totalEquity: number;
  };
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  variance: number;
}

export interface CashFlowReport {
  period: string;
  beginningCash: number;
  operatingActivities: {
    cashFromSalesAndCustomers: number;
    cashPaidToSuppliers: number;
    cashPaidToStaff: number;
    cashPaidForOperatingExpenses: number;
    cashPaidForTaxes: number;
    netCashFromOperations: number;
  };
  investingActivities: {
    purchaseOfEquipmentAndAssets: number;
    renovationExpenses: number;
    netCashFromInvesting: number;
  };
  financingActivities: {
    ownerCapitalContributions: number;
    ownerDrawingsOrDividends: number;
    loanProceedsOrRepayments: number;
    netCashFromFinancing: number;
  };
  netChangeInCash: number;
  endingCash: number;
  reconciliationCheck: boolean;
}

export interface FnBStrategicMetrics {
  totalRevenue: number;
  cogsTotal: number;
  foodCostRatio: number; // Benchmark: 28% - 35%
  beverageCostRatio: number; // Benchmark: 15% - 22%
  laborCostTotal: number;
  laborCostRatio: number; // Benchmark: 20% - 28%
  primeCostTotal: number; // COGS + Labor
  primeCostRatio: number; // Benchmark: MUST BE < 60%
  rentRatio: number; // Benchmark: < 10%
  grossMargin: number;
  netMargin: number;
  averageTicketSize: number;
  dailyBEPRevenue: number;
  dailyTargetCups: number;
  activeStaffCount: number;
}

export interface StrategicRecommendation {
  area: 'HPP / Food Cost' | 'Labor & Payroll' | 'Menu Pricing & Engineering' | 'Cash Flow & Working Capital';
  action: string;
  expectedImpact: string;
}

export interface AIStrategyResponse {
  healthStatus: 'EXCELLENT' | 'HEALTHY' | 'WARNING' | 'CRITICAL';
  primeCostStatus: string;
  keyFindings: string[];
  strategicRecommendations: StrategicRecommendation[];
  dailyTargetTip: string;
}

export interface AppScriptConfig {
  appscriptUrl: string;
  googleSheetUrl?: string;
  groqApiKey: string;
  groqModel: string;
  autoSyncToSheets: boolean;
  whatsappPhoneNumber: string;
  lastSyncedAt?: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  status: 'success' | 'error' | 'pending';
  action: string;
  recordsCount: number;
  responseMessage: string;
}

export type SalesPeriod = 'daily' | 'weekly' | 'monthly';

export interface MonthlyTargetSettings {
  monthKey: string;
  monthName: string;
  targetRevenue: number;
  targetCogsPercent: number;
  targetLaborPercent: number;
  targetNetMarginPercent: number;
  operatingDays: number;
  dailyTargetCups: number;
  notes?: string;
}

export interface SalesDataPoint {
  periodKey: string;
  label: string;
  dateStr?: string;
  coffeeSales: number;
  kitchenSales: number;
  pastrySales: number;
  deliverySales: number;
  totalRevenue: number;
  cogsAmount: number;
  grossProfit: number;
  orderCount: number;
  avgOrderValue: number;
}

export interface TopSellingProduct {
  id: string;
  name: string;
  category: 'Coffee & Beverages' | 'Kitchen & Eatery' | 'Pastry & Bakery';
  unitsSold: number;
  sellingPrice: number;
  totalRevenue: number;
  cogsPerUnit: number;
  grossProfit: number;
  marginPercent: number;
  popularityScore: number; // 0 - 100
  trend: 'up' | 'stable' | 'down';
  peakTime: string;
  matrixCategory: 'Star' | 'Plowhorse' | 'Puzzle' | 'Dog';
}

export interface HourlyRushHour {
  hour: string; // e.g. "08:00 - 10:00"
  label: string; // "Morning Coffee Rush"
  ordersCount: number;
  revenue: number;
  sharePercent: number;
  popularItem: string;
}

export interface CustomerSpendingAnalytics {
  averageOrderValue: number;
  dineInAOV: number;
  takeawayAOV: number;
  deliveryAOV: number;
  orderFormatSplit: {
    dineInPercent: number;
    takeawayPercent: number;
    deliveryPercent: number;
  };
  paymentMethodSplit: {
    qrisPercent: number;
    cashPercent: number;
    transferPercent: number;
  };
  basketSizeBuckets: Array<{
    range: string;
    orderCount: number;
    percent: number;
  }>;
  hourlyRushHours: HourlyRushHour[];
}

export interface DrillDownDetail {
  title: string;
  subtitle?: string;
  type: 'category' | 'date' | 'product' | 'payment_method' | 'metric';
  periodLabel?: string;
  totalValue: number;
  percentage?: number;
  breakdown: Array<{
    label: string;
    value: number;
    sublabel?: string;
    badge?: string;
  }>;
  relatedTransactions?: Transaction[];
  actionableInsights: string[];
}
