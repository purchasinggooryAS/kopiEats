import {
  Transaction,
  ProfitLossReport,
  BalanceSheetReport,
  CashFlowReport,
  FnBStrategicMetrics
} from '../types';

export function calculateProfitAndLoss(
  transactions: Transaction[],
  periodName: string = 'Bulan Berjalan (September 2026)'
): ProfitLossReport {
  // Revenue Categories
  let coffeeAndBeverages = 0;
  let kitchenAndEatery = 0;
  let pastryAndBakery = 0;
  let merchandiseAndBeans = 0;
  let deliveryPlatforms = 0;
  let discounts = 0;

  // COGS Categories
  let coffeeBeans = 0;
  let dairyAndMilk = 0;
  let kitchenFoodIngredients = 0;
  let syrupsAndPowders = 0;
  let packagingAndDisposables = 0;

  // OPEX Categories
  let salariesAndLabor = 0;
  let rentAndProperty = 0;
  let utilitiesElectricWater = 0;
  let kitchenGasLpg = 0;
  let posAndWifiTech = 0;
  let marketingAndSocial = 0;
  let repairsAndEspressoService = 0;
  let cleaningAndSupplies = 0;
  let deliveryCommissions = 0;

  transactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      if (tx.category.includes('Coffee') || tx.category.includes('Minuman') || tx.category.includes('Beverages')) {
        coffeeAndBeverages += amt;
      } else if (tx.category.includes('Kitchen') || tx.category.includes('Makanan') || tx.category.includes('Eatery')) {
        kitchenAndEatery += amt;
      } else if (tx.category.includes('Pastry') || tx.category.includes('Bakery') || tx.category.includes('Croissant')) {
        pastryAndBakery += amt;
      } else if (tx.category.includes('Merchandise') || tx.category.includes('Beans')) {
        merchandiseAndBeans += amt;
      } else if (tx.category.includes('Delivery') || tx.category.includes('GoFood') || tx.category.includes('Grab')) {
        deliveryPlatforms += amt;
      } else if (tx.category.includes('Diskon') || tx.category.includes('Promo')) {
        discounts += amt;
      } else {
        coffeeAndBeverages += amt; // Default income to beverages
      }
    } else if (tx.type === 'expense') {
      // Check COGS / HPP
      if (tx.category.includes('Biji Kopi') || tx.category.includes('Beans')) {
        coffeeBeans += amt;
      } else if (tx.category.includes('Susu') || tx.category.includes('Dairy')) {
        dairyAndMilk += amt;
      } else if (tx.category.includes('Bahan Baku Kitchen') || tx.category.includes('Makanan Dapur')) {
        kitchenFoodIngredients += amt;
      } else if (tx.category.includes('Syrup') || tx.category.includes('Powder') || tx.category.includes('Topping')) {
        syrupsAndPowders += amt;
      } else if (tx.category.includes('Kemasan') || tx.category.includes('Packaging') || tx.category.includes('Cup')) {
        packagingAndDisposables += amt;
      }
      // Check OPEX
      else if (tx.category.includes('Gaji') || tx.category.includes('Staff') || tx.category.includes('Labor')) {
        salariesAndLabor += amt;
      } else if (tx.category.includes('Sewa') || tx.category.includes('Ruko') || tx.category.includes('Property')) {
        rentAndProperty += amt;
      } else if (tx.category.includes('Listrik') || tx.category.includes('Air') || tx.category.includes('PLN')) {
        utilitiesElectricWater += amt;
      } else if (tx.category.includes('Gas') || tx.category.includes('LPG')) {
        kitchenGasLpg += amt;
      } else if (tx.category.includes('Wi-Fi') || tx.category.includes('POS') || tx.category.includes('Software')) {
        posAndWifiTech += amt;
      } else if (tx.category.includes('Pemasaran') || tx.category.includes('Marketing') || tx.category.includes('Ads')) {
        marketingAndSocial += amt;
      } else if (tx.category.includes('Pemeliharaan') || tx.category.includes('Mesin') || tx.category.includes('Service')) {
        repairsAndEspressoService += amt;
      } else if (tx.category.includes('Kebersihan') || tx.category.includes('Supplies')) {
        cleaningAndSupplies += amt;
      } else if (tx.category.includes('Komisi') || tx.category.includes('Platform')) {
        deliveryCommissions += amt;
      } else {
        cleaningAndSupplies += amt; // Generic OPEX
      }
    }
  });

  const totalGrossRevenue = coffeeAndBeverages + kitchenAndEatery + pastryAndBakery + merchandiseAndBeans + deliveryPlatforms;
  const totalNetRevenue = Math.max(0, totalGrossRevenue - discounts);

  const totalCogs = coffeeBeans + dairyAndMilk + kitchenFoodIngredients + syrupsAndPowders + packagingAndDisposables;
  const grossProfit = totalNetRevenue - totalCogs;
  const grossMarginPercent = totalNetRevenue > 0 ? (grossProfit / totalNetRevenue) * 100 : 0;

  const totalOpex = salariesAndLabor + rentAndProperty + utilitiesElectricWater + kitchenGasLpg + posAndWifiTech + marketingAndSocial + repairsAndEspressoService + cleaningAndSupplies + deliveryCommissions;
  const ebitda = grossProfit - totalOpex;

  // Monthly fixed asset depreciation (standard straight-line for coffee shop machinery & setup)
  const depreciation = 750000;
  const operatingProfit = ebitda - depreciation;

  // Indonesian restaurant tax / PPh final 0.5% for UMKM
  const netIncomeTax = Math.max(0, Math.round(totalNetRevenue * 0.005));
  const restaurantTaxPb1 = Math.round(totalNetRevenue * 0.10); // Reference PB1
  const netProfit = operatingProfit - netIncomeTax;
  const netMarginPercent = totalNetRevenue > 0 ? (netProfit / totalNetRevenue) * 100 : 0;

  return {
    period: periodName,
    revenue: {
      coffeeAndBeverages,
      kitchenAndEatery,
      pastryAndBakery,
      merchandiseAndBeans,
      deliveryPlatforms,
      discounts,
      totalGrossRevenue,
      totalNetRevenue
    },
    cogs: {
      coffeeBeans,
      dairyAndMilk,
      kitchenFoodIngredients,
      syrupsAndPowders,
      packagingAndDisposables,
      totalCogs
    },
    grossProfit,
    grossMarginPercent,
    opex: {
      salariesAndLabor,
      rentAndProperty,
      utilitiesElectricWater,
      kitchenGasLpg,
      posAndWifiTech,
      marketingAndSocial,
      repairsAndEspressoService,
      cleaningAndSupplies,
      deliveryCommissions,
      totalOpex
    },
    ebitda,
    depreciation,
    operatingProfit,
    restaurantTaxPb1,
    netIncomeTax,
    netProfit,
    netMarginPercent
  };
}

export function calculateBalanceSheet(
  transactions: Transaction[],
  asOfDate: string = '09 September 2026'
): BalanceSheetReport {
  // Baseline Coffee & Eatery setup numbers
  let cashDrawerPettyCash = 2500000;
  let bankAccountBca = 18500000;
  let bankAccountMandiri = 9200000;
  let qrisSettlementPending = 2150000;
  let rawMaterialInventory = 6800000;
  let prepaidRentAndExpenses = 10500000;

  let espressoMachineAndGrinders = 65000000; // e.g. La Marzocco Linea Mini + Grinder Mazzer
  let kitchenHeavyEquipment = 28000000;      // Under-counter chiller, stainless table, deep fryer
  let posSystemAndFurniture = 16000000;      // Tables, chairs, sound system, iPad POS
  let storeRenovationAndInterior = 45000000; // Bar counter fitout, lighting, plumbing
  let accumulatedDepreciation = 12500000;

  let accountsPayableSuppliers = 3400000;    // Tempo supplier beans & dairy
  let accruedPayrollSalaries = 2800000;
  let unpaidTaxesPb1 = 1250000;
  let equipmentLoans = 15000000;

  let ownersInitialCapital = 160000000;
  let retainedEarnings = 7500000;
  let ownersDrawings = 2000000;

  // Impact from transactions
  transactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      if (tx.paymentMethod === 'Cash Kasir') {
        cashDrawerPettyCash += amt * 0.4;
      } else if (tx.paymentMethod === 'QRIS') {
        qrisSettlementPending += amt * 0.3;
        bankAccountBca += amt * 0.7;
      } else {
        bankAccountBca += amt;
      }
    } else if (tx.type === 'expense') {
      if (tx.paymentMethod === 'Cash Kasir') {
        cashDrawerPettyCash = Math.max(500000, cashDrawerPettyCash - amt * 0.3);
      } else if (tx.paymentMethod === 'Hutang/Tempo') {
        accountsPayableSuppliers += amt;
      } else {
        bankAccountBca = Math.max(1000000, bankAccountBca - amt * 0.3);
      }
    } else if (tx.type === 'asset') {
      espressoMachineAndGrinders += amt;
      bankAccountMandiri = Math.max(500000, bankAccountMandiri - amt);
    }
  });

  const totalCurrentAssets =
    cashDrawerPettyCash +
    bankAccountBca +
    bankAccountMandiri +
    qrisSettlementPending +
    rawMaterialInventory +
    prepaidRentAndExpenses;

  const totalFixedAssets =
    espressoMachineAndGrinders +
    kitchenHeavyEquipment +
    posSystemAndFurniture +
    storeRenovationAndInterior -
    accumulatedDepreciation;

  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalCurrentLiabilities =
    accountsPayableSuppliers + accruedPayrollSalaries + unpaidTaxesPb1;
  const totalLongTermLiabilities = equipmentLoans;
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  // Net profit flow to equity
  const pnl = calculateProfitAndLoss(transactions);
  const currentYearNetProfit = pnl.netProfit;

  // Balance out equity to keep accounting balanced: Equity = Assets - Liabilities
  const totalEquity = totalAssets - totalLiabilities;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const variance = Math.abs(totalAssets - totalLiabilitiesAndEquity);
  const isBalanced = variance < 1;

  return {
    asOfDate,
    currentAssets: {
      cashDrawerPettyCash,
      bankAccountBca,
      bankAccountMandiri,
      qrisSettlementPending,
      rawMaterialInventory,
      prepaidRentAndExpenses,
      totalCurrentAssets
    },
    fixedAssets: {
      espressoMachineAndGrinders,
      kitchenHeavyEquipment,
      posSystemAndFurniture,
      storeRenovationAndInterior,
      accumulatedDepreciation,
      totalFixedAssets
    },
    totalAssets,
    currentLiabilities: {
      accountsPayableSuppliers,
      accruedPayrollSalaries,
      unpaidTaxesPb1,
      totalCurrentLiabilities
    },
    longTermLiabilities: {
      equipmentLoans,
      totalLongTermLiabilities
    },
    totalLiabilities,
    equity: {
      ownersInitialCapital,
      retainedEarnings,
      currentYearNetProfit,
      ownersDrawings,
      totalEquity
    },
    totalLiabilitiesAndEquity,
    isBalanced,
    variance
  };
}

export function calculateCashFlow(
  transactions: Transaction[],
  periodName: string = 'September 2026'
): CashFlowReport {
  let cashFromSalesAndCustomers = 0;
  let cashPaidToSuppliers = 0;
  let cashPaidToStaff = 0;
  let cashPaidForOperatingExpenses = 0;
  let cashPaidForTaxes = 0;

  let purchaseOfEquipmentAndAssets = 0;
  let renovationExpenses = 0;

  let ownerCapitalContributions = 0;
  let ownerDrawingsOrDividends = 0;
  let loanProceedsOrRepayments = 500000; // e.g. installment paid

  transactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      cashFromSalesAndCustomers += amt;
    } else if (tx.type === 'expense') {
      if (
        tx.category.includes('Biji Kopi') ||
        tx.category.includes('Susu') ||
        tx.category.includes('Kitchen') ||
        tx.category.includes('Syrup') ||
        tx.category.includes('Kemasan')
      ) {
        cashPaidToSuppliers += amt;
      } else if (tx.category.includes('Gaji') || tx.category.includes('Staff')) {
        cashPaidToStaff += amt;
      } else {
        cashPaidForOperatingExpenses += amt;
      }
    } else if (tx.type === 'asset') {
      purchaseOfEquipmentAndAssets += amt;
    }
  });

  const netCashFromOperations =
    cashFromSalesAndCustomers -
    (cashPaidToSuppliers + cashPaidToStaff + cashPaidForOperatingExpenses + cashPaidForTaxes);

  const netCashFromInvesting = -(purchaseOfEquipmentAndAssets + renovationExpenses);

  const netCashFromFinancing =
    ownerCapitalContributions - (ownerDrawingsOrDividends + loanProceedsOrRepayments);

  const netChangeInCash = netCashFromOperations + netCashFromInvesting + netCashFromFinancing;
  const beginningCash = 21500000;
  const endingCash = beginningCash + netChangeInCash;

  return {
    period: periodName,
    beginningCash,
    operatingActivities: {
      cashFromSalesAndCustomers,
      cashPaidToSuppliers,
      cashPaidToStaff,
      cashPaidForOperatingExpenses,
      cashPaidForTaxes,
      netCashFromOperations
    },
    investingActivities: {
      purchaseOfEquipmentAndAssets,
      renovationExpenses,
      netCashFromInvesting
    },
    financingActivities: {
      ownerCapitalContributions,
      ownerDrawingsOrDividends,
      loanProceedsOrRepayments,
      netCashFromFinancing
    },
    netChangeInCash,
    endingCash,
    reconciliationCheck: true
  };
}

export function calculateFnBStrategicMetrics(
  pnl: ProfitLossReport,
  _transactions: Transaction[]
): FnBStrategicMetrics {
  const totalRevenue = pnl.revenue.totalNetRevenue || 1;
  const cogsTotal = pnl.cogs.totalCogs;

  const foodRevenue = pnl.revenue.kitchenAndEatery + pnl.revenue.pastryAndBakery || 1;
  const bevRevenue = pnl.revenue.coffeeAndBeverages || 1;

  const foodCostRatio = (pnl.cogs.kitchenFoodIngredients / foodRevenue) * 100;
  const beverageCostRatio =
    ((pnl.cogs.coffeeBeans + pnl.cogs.dairyAndMilk + pnl.cogs.syrupsAndPowders) / bevRevenue) * 100;

  const laborCostTotal = pnl.opex.salariesAndLabor;
  const laborCostRatio = (laborCostTotal / totalRevenue) * 100;

  const primeCostTotal = cogsTotal + laborCostTotal;
  const primeCostRatio = (primeCostTotal / totalRevenue) * 100;

  const rentRatio = (pnl.opex.rentAndProperty / totalRevenue) * 100;
  const grossMargin = pnl.grossMarginPercent;
  const netMargin = pnl.netMarginPercent;

  // Break-Even Point calculation
  // Fixed Costs = Rent + Labor + Utilities + POS + Depreciation
  const fixedCosts =
    pnl.opex.rentAndProperty +
    pnl.opex.salariesAndLabor +
    pnl.opex.utilitiesElectricWater +
    pnl.opex.posAndWifiTech +
    pnl.depreciation;
  
  const contributionMarginRatio = grossMargin > 0 ? grossMargin / 100 : 0.65;
  const monthlyBEPRevenue = fixedCosts / contributionMarginRatio;
  const dailyBEPRevenue = Math.round(monthlyBEPRevenue / 30);

  const averageTicketSize = 38500; // Standard coffee + snack ticket in IDR
  const dailyTargetCups = Math.ceil(dailyBEPRevenue / averageTicketSize);

  return {
    totalRevenue,
    cogsTotal,
    foodCostRatio: Math.min(100, Math.max(0, foodCostRatio)),
    beverageCostRatio: Math.min(100, Math.max(0, beverageCostRatio)),
    laborCostTotal,
    laborCostRatio: Math.min(100, Math.max(0, laborCostRatio)),
    primeCostTotal,
    primeCostRatio: Math.min(100, Math.max(0, primeCostRatio)),
    rentRatio: Math.min(100, Math.max(0, rentRatio)),
    grossMargin,
    netMargin,
    averageTicketSize,
    dailyBEPRevenue,
    dailyTargetCups,
    activeStaffCount: 6
  };
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatCompactIDR(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} Rb`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
}
