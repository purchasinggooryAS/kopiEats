import {
  Transaction,
  SalesDataPoint,
  TopSellingProduct,
  CustomerSpendingAnalytics,
  DrillDownDetail,
  MonthlyTargetSettings
} from '../types';

export interface ReportingMonthOption {
  key: string;
  label: string;
  shortLabel: string;
  isCurrentMonth: boolean;
  totalRevenueEst: number;
  cogsEst: number;
  orderCountEst: number;
  grossMarginEst: number;
}

export const AVAILABLE_REPORTING_MONTHS: ReportingMonthOption[] = [
  { key: '2026-09', label: 'September 2026', shortLabel: 'Sep 2026', isCurrentMonth: true, totalRevenueEst: 343500000, cogsEst: 109920000, orderCountEst: 6920, grossMarginEst: 68.0 },
  { key: '2026-08', label: 'Agustus 2026', shortLabel: 'Agu 2026', isCurrentMonth: false, totalRevenueEst: 323000000, cogsEst: 103360000, orderCountEst: 6580, grossMarginEst: 68.0 },
  { key: '2026-07', label: 'Juli 2026', shortLabel: 'Jul 2026', isCurrentMonth: false, totalRevenueEst: 300800000, cogsEst: 96250000, orderCountEst: 6180, grossMarginEst: 68.0 },
  { key: '2026-06', label: 'Juni 2026', shortLabel: 'Jun 2026', isCurrentMonth: false, totalRevenueEst: 281400000, cogsEst: 90040000, orderCountEst: 5820, grossMarginEst: 68.0 },
  { key: '2026-05', label: 'Mei 2026', shortLabel: 'Mei 2026', isCurrentMonth: false, totalRevenueEst: 261800000, cogsEst: 83770000, orderCountEst: 5460, grossMarginEst: 68.0 },
  { key: '2026-04', label: 'April 2026', shortLabel: 'Apr 2026', isCurrentMonth: false, totalRevenueEst: 241500000, cogsEst: 77280000, orderCountEst: 5100, grossMarginEst: 68.0 },
  { key: 'all', label: 'Semua Bulan (Konsolidasi)', shortLabel: 'Semua', isCurrentMonth: false, totalRevenueEst: 1752000000, cogsEst: 560620000, orderCountEst: 36060, grossMarginEst: 68.0 }
];

export const DEFAULT_MONTHLY_TARGETS: Record<string, MonthlyTargetSettings> = {
  '2026-09': {
    monthKey: '2026-09',
    monthName: 'September 2026',
    targetRevenue: 350000000,
    targetCogsPercent: 32.0,
    targetLaborPercent: 20.0,
    targetNetMarginPercent: 18.0,
    operatingDays: 30,
    dailyTargetCups: 230,
    notes: 'Fokus penguatan margin manual brew, cold brew & minimalisir milk waste.'
  },
  '2026-08': {
    monthKey: '2026-08',
    monthName: 'Agustus 2026',
    targetRevenue: 320000000,
    targetCogsPercent: 32.0,
    targetLaborPercent: 21.0,
    targetNetMarginPercent: 17.5,
    operatingDays: 31,
    dailyTargetCups: 210,
    notes: 'Kampanye semarak kemerdekaan & event komunitas kopi lokal.'
  },
  '2026-07': {
    monthKey: '2026-07',
    monthName: 'Juli 2026',
    targetRevenue: 300000000,
    targetCogsPercent: 32.5,
    targetLaborPercent: 21.5,
    targetNetMarginPercent: 17.0,
    operatingDays: 31,
    dailyTargetCups: 200,
    notes: 'Lonjakan traffic libur sekolah & penambahan varian pastry artisan.'
  },
  '2026-06': {
    monthKey: '2026-06',
    monthName: 'Juni 2026',
    targetRevenue: 280000000,
    targetCogsPercent: 33.0,
    targetLaborPercent: 22.0,
    targetNetMarginPercent: 16.5,
    operatingDays: 30,
    dailyTargetCups: 190,
    notes: 'Optimalisasi jam operasional malam & paket combo makan siang.'
  },
  '2026-05': {
    monthKey: '2026-05',
    monthName: 'Mei 2026',
    targetRevenue: 260000000,
    targetCogsPercent: 33.0,
    targetLaborPercent: 22.0,
    targetNetMarginPercent: 16.0,
    operatingDays: 31,
    dailyTargetCups: 180,
    notes: 'Penyesuaian shift barista & standarisasi resep sirup.'
  },
  '2026-04': {
    monthKey: '2026-04',
    monthName: 'April 2026',
    targetRevenue: 240000000,
    targetCogsPercent: 33.5,
    targetLaborPercent: 22.5,
    targetNetMarginPercent: 15.5,
    operatingDays: 30,
    dailyTargetCups: 170,
    notes: 'Peluncuran perdana menu seasonal spring & loyalty stamp card.'
  }
};

export const INITIAL_TOP_PRODUCTS: TopSellingProduct[] = [
  {
    id: 'prod-01',
    name: 'Kopi Susu Gula Aren Senja',
    category: 'Coffee & Beverages',
    unitsSold: 1420,
    sellingPrice: 22000,
    totalRevenue: 31240000,
    cogsPerUnit: 6800,
    grossProfit: 21584000,
    marginPercent: 69.1,
    popularityScore: 98,
    trend: 'up',
    peakTime: '13:00 - 16:00',
    matrixCategory: 'Star'
  },
  {
    id: 'prod-02',
    name: 'Iced Caramel Macchiato',
    category: 'Coffee & Beverages',
    unitsSold: 890,
    sellingPrice: 28000,
    totalRevenue: 24920000,
    cogsPerUnit: 7900,
    grossProfit: 17889000,
    marginPercent: 71.8,
    popularityScore: 91,
    trend: 'up',
    peakTime: '15:00 - 18:00',
    matrixCategory: 'Star'
  },
  {
    id: 'prod-03',
    name: 'Truffle Cream Mushroom Pasta',
    category: 'Kitchen & Eatery',
    unitsSold: 410,
    sellingPrice: 48000,
    totalRevenue: 19680000,
    cogsPerUnit: 16500,
    grossProfit: 12915000,
    marginPercent: 65.6,
    popularityScore: 88,
    trend: 'up',
    peakTime: '12:00 - 14:00 & 19:00 - 21:00',
    matrixCategory: 'Star'
  },
  {
    id: 'prod-04',
    name: 'Beef Teriyaki Rice Bowl',
    category: 'Kitchen & Eatery',
    unitsSold: 520,
    sellingPrice: 38000,
    totalRevenue: 19760000,
    cogsPerUnit: 14800,
    grossProfit: 12064000,
    marginPercent: 61.1,
    popularityScore: 89,
    trend: 'stable',
    peakTime: '12:00 - 14:00',
    matrixCategory: 'Plowhorse'
  },
  {
    id: 'prod-05',
    name: 'Croissant Butter Almond',
    category: 'Pastry & Bakery',
    unitsSold: 640,
    sellingPrice: 25000,
    totalRevenue: 16000000,
    cogsPerUnit: 9200,
    grossProfit: 10112000,
    marginPercent: 63.2,
    popularityScore: 84,
    trend: 'up',
    peakTime: '08:00 - 11:00',
    matrixCategory: 'Star'
  },
  {
    id: 'prod-06',
    name: 'Matcha Oat Latte',
    category: 'Coffee & Beverages',
    unitsSold: 480,
    sellingPrice: 32000,
    totalRevenue: 15360000,
    cogsPerUnit: 11200,
    grossProfit: 9984000,
    marginPercent: 65.0,
    popularityScore: 82,
    trend: 'up',
    peakTime: '16:00 - 19:00',
    matrixCategory: 'Star'
  },
  {
    id: 'prod-07',
    name: 'Manual Brew V60 Single Origin (Gayo/Kamojang)',
    category: 'Coffee & Beverages',
    unitsSold: 310,
    sellingPrice: 35000,
    totalRevenue: 10850000,
    cogsPerUnit: 8500,
    grossProfit: 8215000,
    marginPercent: 75.7,
    popularityScore: 76,
    trend: 'stable',
    peakTime: '10:00 - 12:00 & 20:00 - 22:00',
    matrixCategory: 'Puzzle'
  },
  {
    id: 'prod-08',
    name: 'Artisan Smoked Beef Toast',
    category: 'Kitchen & Eatery',
    unitsSold: 350,
    sellingPrice: 34000,
    totalRevenue: 11900000,
    cogsPerUnit: 12800,
    grossProfit: 7420000,
    marginPercent: 62.4,
    popularityScore: 78,
    trend: 'stable',
    peakTime: '08:30 - 11:30',
    matrixCategory: 'Plowhorse'
  },
  {
    id: 'prod-09',
    name: 'Crispy Truffle Fries',
    category: 'Kitchen & Eatery',
    unitsSold: 580,
    sellingPrice: 26000,
    totalRevenue: 15080000,
    cogsPerUnit: 7800,
    grossProfit: 10556000,
    marginPercent: 70.0,
    popularityScore: 92,
    trend: 'up',
    peakTime: '15:00 - 22:00',
    matrixCategory: 'Star'
  },
  {
    id: 'prod-10',
    name: 'Espresso Tonic Refresh',
    category: 'Coffee & Beverages',
    unitsSold: 190,
    sellingPrice: 29000,
    totalRevenue: 5510000,
    cogsPerUnit: 11500,
    grossProfit: 3325000,
    marginPercent: 60.3,
    popularityScore: 58,
    trend: 'down',
    peakTime: '13:00 - 15:00',
    matrixCategory: 'Dog'
  }
];

export const INITIAL_CUSTOMER_ANALYTICS: CustomerSpendingAnalytics = {
  averageOrderValue: 48500,
  dineInAOV: 54000,
  takeawayAOV: 36500,
  deliveryAOV: 62000,
  orderFormatSplit: {
    dineInPercent: 54,
    takeawayPercent: 28,
    deliveryPercent: 18
  },
  paymentMethodSplit: {
    qrisPercent: 68,
    cashPercent: 22,
    transferPercent: 10
  },
  basketSizeBuckets: [
    { range: '< Rp 25.000 (1 Cup)', orderCount: 420, percent: 18 },
    { range: 'Rp 25.000 - Rp 50.000 (Drink + Snack)', orderCount: 980, percent: 42 },
    { range: 'Rp 50.000 - Rp 100.000 (Dine-in Meal + Drink)', orderCount: 680, percent: 29 },
    { range: '> Rp 100.000 (Group / Family Order)', orderCount: 260, percent: 11 }
  ],
  hourlyRushHours: [
    {
      hour: '07:30 - 10:00',
      label: 'Morning Coffee & Breakfast Rush',
      ordersCount: 290,
      revenue: 11600000,
      sharePercent: 16.2,
      popularItem: 'Kopi Susu Aren + Croissant Butter'
    },
    {
      hour: '11:30 - 14:00',
      label: 'Lunch & Eatery Peak',
      ordersCount: 410,
      revenue: 22550000,
      sharePercent: 31.5,
      popularItem: 'Truffle Pasta & Beef Rice Bowl'
    },
    {
      hour: '15:00 - 18:00',
      label: 'Afternoon Hangout & Work-From-Cafe',
      ordersCount: 480,
      revenue: 21600000,
      sharePercent: 30.2,
      popularItem: 'Iced Caramel Macchiato & Truffle Fries'
    },
    {
      hour: '18:30 - 22:00',
      label: 'Dinner & Evening Chill',
      ordersCount: 310,
      revenue: 15800000,
      sharePercent: 22.1,
      popularItem: 'Manual Brew V60 & Rice Bowls'
    }
  ]
};

// Generate 14-day daily sales history
export function getDailySalesData(): SalesDataPoint[] {
  return [
    { periodKey: '2026-08-27', label: '27 Agu', dateStr: '2026-08-27', coffeeSales: 4100000, kitchenSales: 2400000, pastrySales: 650000, deliverySales: 1200000, totalRevenue: 8350000, cogsAmount: 2680000, grossProfit: 5670000, orderCount: 174, avgOrderValue: 47988 },
    { periodKey: '2026-08-28', label: '28 Agu', dateStr: '2026-08-28', coffeeSales: 4350000, kitchenSales: 2650000, pastrySales: 720000, deliverySales: 1400000, totalRevenue: 9120000, cogsAmount: 2910000, grossProfit: 6210000, orderCount: 188, avgOrderValue: 48510 },
    { periodKey: '2026-08-29', label: '29 Agu (Sab)', dateStr: '2026-08-29', coffeeSales: 5900000, kitchenSales: 3800000, pastrySales: 1100000, deliverySales: 1950000, totalRevenue: 12750000, cogsAmount: 3950000, grossProfit: 8800000, orderCount: 255, avgOrderValue: 50000 },
    { periodKey: '2026-08-30', label: '30 Agu (Min)', dateStr: '2026-08-30', coffeeSales: 6200000, kitchenSales: 4100000, pastrySales: 1250000, deliverySales: 2100000, totalRevenue: 13650000, cogsAmount: 4230000, grossProfit: 9420000, orderCount: 268, avgOrderValue: 50932 },
    { periodKey: '2026-08-31', label: '31 Agu', dateStr: '2026-08-31', coffeeSales: 3850000, kitchenSales: 2150000, pastrySales: 580000, deliverySales: 1100000, totalRevenue: 7680000, cogsAmount: 2450000, grossProfit: 5230000, orderCount: 165, avgOrderValue: 46545 },
    { periodKey: '2026-09-01', label: '01 Sep', dateStr: '2026-09-01', coffeeSales: 4200000, kitchenSales: 2500000, pastrySales: 700000, deliverySales: 1350000, totalRevenue: 8750000, cogsAmount: 2790000, grossProfit: 5960000, orderCount: 180, avgOrderValue: 48611 },
    { periodKey: '2026-09-02', label: '02 Sep', dateStr: '2026-09-02', coffeeSales: 4400000, kitchenSales: 2700000, pastrySales: 750000, deliverySales: 1450000, totalRevenue: 9300000, cogsAmount: 2970000, grossProfit: 6330000, orderCount: 191, avgOrderValue: 48691 },
    { periodKey: '2026-09-03', label: '03 Sep', dateStr: '2026-09-03', coffeeSales: 4650000, kitchenSales: 2850000, pastrySales: 800000, deliverySales: 1550000, totalRevenue: 9850000, cogsAmount: 3150000, grossProfit: 6700000, orderCount: 202, avgOrderValue: 48762 },
    { periodKey: '2026-09-04', label: '04 Sep', dateStr: '2026-09-04', coffeeSales: 4900000, kitchenSales: 3100000, pastrySales: 880000, deliverySales: 1700000, totalRevenue: 10580000, cogsAmount: 3380000, grossProfit: 7200000, orderCount: 215, avgOrderValue: 49209 },
    { periodKey: '2026-09-05', label: '05 Sep (Sab)', dateStr: '2026-09-05', coffeeSales: 6450000, kitchenSales: 4300000, pastrySales: 1350000, deliverySales: 2250000, totalRevenue: 14350000, cogsAmount: 4450000, grossProfit: 9900000, orderCount: 280, avgOrderValue: 51250 },
    { periodKey: '2026-09-06', label: '06 Sep (Min)', dateStr: '2026-09-06', coffeeSales: 6800000, kitchenSales: 4550000, pastrySales: 1420000, deliverySales: 2400000, totalRevenue: 15170000, cogsAmount: 4700000, grossProfit: 10470000, orderCount: 295, avgOrderValue: 51423 },
    { periodKey: '2026-09-07', label: '07 Sep', dateStr: '2026-09-07', coffeeSales: 5120000, kitchenSales: 2890000, pastrySales: 820000, deliverySales: 1620000, totalRevenue: 10450000, cogsAmount: 3240000, grossProfit: 7210000, orderCount: 212, avgOrderValue: 49292 },
    { periodKey: '2026-09-08', label: '08 Sep', dateStr: '2026-09-08', coffeeSales: 4850000, kitchenSales: 3200000, pastrySales: 950000, deliverySales: 1750000, totalRevenue: 10750000, cogsAmount: 3350000, grossProfit: 7400000, orderCount: 218, avgOrderValue: 49311 },
    { periodKey: '2026-09-09', label: '09 Sep (Hari ini)', dateStr: '2026-09-09', coffeeSales: 5350000, kitchenSales: 3450000, pastrySales: 1020000, deliverySales: 1850000, totalRevenue: 11670000, cogsAmount: 3620000, grossProfit: 8050000, orderCount: 236, avgOrderValue: 49449 }
  ];
}

// Generate daily sales history for any given month
export function getDailySalesDataForMonth(monthKey: string = '2026-09'): SalesDataPoint[] {
  if (monthKey === 'all' || !monthKey) {
    return getDailySalesData();
  }

  const monthMeta = AVAILABLE_REPORTING_MONTHS.find(m => m.key === monthKey);
  const totalRev = monthMeta ? monthMeta.totalRevenueEst : 320000000;
  
  // Days in month
  const parts = monthKey.split('-');
  const year = parseInt(parts[0], 10) || 2026;
  const month = parseInt(parts[1], 10) || 9;
  const daysInMonth = new Date(year, month, 0).getDate();

  const monthNamesId: Record<number, string> = {
    1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'Mei', 6: 'Jun',
    7: 'Jul', 8: 'Agu', 9: 'Sep', 10: 'Okt', 11: 'Nov', 12: 'Des'
  };
  const mName = monthNamesId[month] || 'Bln';

  const baseDailyRev = totalRev / daysInMonth;
  const points: SalesDataPoint[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0: Sun, 6: Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Multiplier for weekend peaks (Sabtu - Minggu)
    const factor = isWeekend ? 1.35 + ((day % 3) * 0.05) : 0.88 + ((day % 5) * 0.04);
    const dayRev = Math.round(baseDailyRev * factor);

    const coffeeSales = Math.round(dayRev * 0.45);
    const kitchenSales = Math.round(dayRev * 0.29);
    const pastrySales = Math.round(dayRev * 0.09);
    const deliverySales = dayRev - (coffeeSales + kitchenSales + pastrySales);

    const cogsAmount = Math.round(dayRev * 0.32);
    const grossProfit = dayRev - cogsAmount;
    const aov = Math.round(48000 + (day % 7) * 450);
    const orderCount = Math.max(1, Math.round(dayRev / aov));

    const dayNameSuffix = dayOfWeek === 6 ? ' (Sab)' : dayOfWeek === 0 ? ' (Min)' : '';

    points.push({
      periodKey: dStr,
      label: `${String(day).padStart(2, '0')} ${mName}${dayNameSuffix}`,
      dateStr: dStr,
      coffeeSales,
      kitchenSales,
      pastrySales,
      deliverySales,
      totalRevenue: dayRev,
      cogsAmount,
      grossProfit,
      orderCount,
      avgOrderValue: aov
    });
  }

  return points;
}

// Generate weekly sales data for the selected month or all
export function getWeeklySalesDataForMonth(monthKey: string = '2026-09'): SalesDataPoint[] {
  if (monthKey === 'all' || !monthKey) {
    return getWeeklySalesData();
  }

  const dailyPoints = getDailySalesDataForMonth(monthKey);
  const monthMeta = AVAILABLE_REPORTING_MONTHS.find(m => m.key === monthKey);
  const mLabel = monthMeta ? monthMeta.shortLabel : monthKey;

  const weeks: SalesDataPoint[] = [];
  const chunkSize = 7;

  for (let i = 0; i < dailyPoints.length; i += chunkSize) {
    const chunk = dailyPoints.slice(i, i + chunkSize);
    const weekNum = Math.floor(i / chunkSize) + 1;
    const startDay = chunk[0].label.split(' ')[0];
    const endDay = chunk[chunk.length - 1].label.split(' ')[0];

    const weekCoffee = chunk.reduce((sum, p) => sum + p.coffeeSales, 0);
    const weekKitchen = chunk.reduce((sum, p) => sum + p.kitchenSales, 0);
    const weekPastry = chunk.reduce((sum, p) => sum + p.pastrySales, 0);
    const weekDelivery = chunk.reduce((sum, p) => sum + p.deliverySales, 0);
    const weekRev = chunk.reduce((sum, p) => sum + p.totalRevenue, 0);
    const weekCogs = chunk.reduce((sum, p) => sum + p.cogsAmount, 0);
    const weekGross = weekRev - weekCogs;
    const weekOrders = chunk.reduce((sum, p) => sum + p.orderCount, 0);
    const weekAov = weekOrders > 0 ? Math.round(weekRev / weekOrders) : 48500;

    weeks.push({
      periodKey: `${monthKey}-W${weekNum}`,
      label: `Mg ${weekNum} (${startDay}-${endDay} ${mLabel.split(' ')[0]})`,
      coffeeSales: weekCoffee,
      kitchenSales: weekKitchen,
      pastrySales: weekPastry,
      deliverySales: weekDelivery,
      totalRevenue: weekRev,
      cogsAmount: weekCogs,
      grossProfit: weekGross,
      orderCount: weekOrders,
      avgOrderValue: weekAov
    });
  }

  return weeks;
}

// Generate 8-week sales history
export function getWeeklySalesData(): SalesDataPoint[] {
  return [
    { periodKey: 'W-29', label: 'Minggu 29 (Jul)', coffeeSales: 28500000, kitchenSales: 17800000, pastrySales: 5100000, deliverySales: 9800000, totalRevenue: 61200000, cogsAmount: 19580000, grossProfit: 41620000, orderCount: 1280, avgOrderValue: 47812 },
    { periodKey: 'W-30', label: 'Minggu 30 (Jul)', coffeeSales: 29800000, kitchenSales: 18500000, pastrySales: 5300000, deliverySales: 10200000, totalRevenue: 63800000, cogsAmount: 20410000, grossProfit: 43390000, orderCount: 1320, avgOrderValue: 48333 },
    { periodKey: 'W-31', label: 'Minggu 31 (Agu)', coffeeSales: 31200000, kitchenSales: 19400000, pastrySales: 5600000, deliverySales: 10900000, totalRevenue: 67100000, cogsAmount: 21470000, grossProfit: 45630000, orderCount: 1385, avgOrderValue: 48447 },
    { periodKey: 'W-32', label: 'Minggu 32 (Agu)', coffeeSales: 32500000, kitchenSales: 20200000, pastrySales: 5900000, deliverySales: 11400000, totalRevenue: 70000000, cogsAmount: 22400000, grossProfit: 47600000, orderCount: 1440, avgOrderValue: 48611 },
    { periodKey: 'W-33', label: 'Minggu 33 (Agu)', coffeeSales: 34100000, kitchenSales: 21500000, pastrySales: 6300000, deliverySales: 12100000, totalRevenue: 74000000, cogsAmount: 23680000, grossProfit: 50320000, orderCount: 1510, avgOrderValue: 49006 },
    { periodKey: 'W-34', label: 'Minggu 34 (Agu)', coffeeSales: 35600000, kitchenSales: 22400000, pastrySales: 6700000, deliverySales: 12800000, totalRevenue: 77500000, cogsAmount: 24800000, grossProfit: 52700000, orderCount: 1575, avgOrderValue: 49206 },
    { periodKey: 'W-35', label: 'Minggu 35 (Sep)', coffeeSales: 36800000, kitchenSales: 23200000, pastrySales: 7050000, deliverySales: 13200000, totalRevenue: 80250000, cogsAmount: 25680000, grossProfit: 54570000, orderCount: 1620, avgOrderValue: 49537 },
    { periodKey: 'W-36', label: 'Minggu 36 (Berjalan)', coffeeSales: 38200000, kitchenSales: 24100000, pastrySales: 7350000, deliverySales: 13950000, totalRevenue: 83600000, cogsAmount: 26750000, grossProfit: 56850000, orderCount: 1680, avgOrderValue: 49761 }
  ];
}

// Generate 6-month sales history
export function getMonthlySalesData(): SalesDataPoint[] {
  return [
    { periodKey: '2026-04', label: 'April 2026', coffeeSales: 112000000, kitchenSales: 71000000, pastrySales: 19500000, deliverySales: 39000000, totalRevenue: 241500000, cogsAmount: 77280000, grossProfit: 164220000, orderCount: 5100, avgOrderValue: 47352 },
    { periodKey: '2026-05', label: 'Mei 2026', coffeeSales: 121000000, kitchenSales: 76500000, pastrySales: 21800000, deliverySales: 42500000, totalRevenue: 261800000, cogsAmount: 83770000, grossProfit: 178030000, orderCount: 5460, avgOrderValue: 47948 },
    { periodKey: '2026-06', label: 'Juni 2026', coffeeSales: 129500000, kitchenSales: 82000000, pastrySales: 23900000, deliverySales: 46000000, totalRevenue: 281400000, cogsAmount: 90040000, grossProfit: 191360000, orderCount: 5820, avgOrderValue: 48350 },
    { periodKey: '2026-07', label: 'Juli 2026', coffeeSales: 138000000, kitchenSales: 87500000, pastrySales: 25800000, deliverySales: 49500000, totalRevenue: 300800000, cogsAmount: 96250000, grossProfit: 204550000, orderCount: 6180, avgOrderValue: 48673 },
    { periodKey: '2026-08', label: 'Agustus 2026', coffeeSales: 147500000, kitchenSales: 93800000, pastrySales: 28200000, deliverySales: 53500000, totalRevenue: 323000000, cogsAmount: 103360000, grossProfit: 219640000, orderCount: 6580, avgOrderValue: 49088 },
    { periodKey: '2026-09', label: 'September 2026 (Est.)', coffeeSales: 156000000, kitchenSales: 99500000, pastrySales: 30500000, deliverySales: 57500000, totalRevenue: 343500000, cogsAmount: 109920000, grossProfit: 233580000, orderCount: 6920, avgOrderValue: 49638 }
  ];
}

// Generate drill-down detail for detailed analysis
export function getDrillDownDetail(
  identifier: string,
  transactions: Transaction[]
): DrillDownDetail {
  const lower = identifier.toLowerCase();

  if (lower.includes('kopi') || lower.includes('beverage') || lower.includes('minuman')) {
    const related = transactions.filter(t => t.category.includes('Coffee') || t.category.includes('Biji Kopi') || t.category.includes('Susu'));
    return {
      title: 'Drill-down: Penjualan Coffee & Beverages',
      subtitle: 'Analisis mendalam lini menu kopi, beans, dan minuman signature',
      type: 'category',
      periodLabel: 'September 2026',
      totalValue: 38200000,
      percentage: 45.7,
      breakdown: [
        { label: 'Espresso-based Milk Drinks (Latte, Cappuccino, Kopi Susu)', value: 24100000, sublabel: '63.1% omset minuman', badge: 'Terlaris' },
        { label: 'Manual Brew Single Origin V60 & Cold Brew', value: 5800000, sublabel: '15.2% omset minuman', badge: 'High Margin' },
        { label: 'Artisan Tea, Matcha & Mocktails', value: 4900000, sublabel: '12.8% omset minuman', badge: 'Afternoon Peak' },
        { label: 'Whole Beans & Drip Bag Retail', value: 3400000, sublabel: '8.9% omset minuman', badge: 'Merchandise' }
      ],
      relatedTransactions: related.slice(0, 5),
      actionableInsights: [
        'Kopi Susu Aren menghasilkan margin kotor tertinggi (69.1%). Pertahankan kualitas sirup aren organik.',
        'Volume penjualan susu mencapai 42 liter per hari. Negosiasikan harga grosir kartonan untuk menurunkan Beverage Cost sebesar 2.5%.',
        'Manual brew mengalami kenaikan di akhir pekan. Sediakan opsi beans geisha / anaerobic fermentation untuk mendongkrak AOV.'
      ]
    };
  }

  if (lower.includes('kitchen') || lower.includes('food') || lower.includes('makanan')) {
    const related = transactions.filter(t => t.category.includes('Kitchen') || t.category.includes('Eatery'));
    return {
      title: 'Drill-down: Penjualan Kitchen & Food Eatery',
      subtitle: 'Analisis kontribusi menu makanan berat, pasta, rice bowls, dan camilan',
      type: 'category',
      periodLabel: 'September 2026',
      totalValue: 24100000,
      percentage: 28.8,
      breakdown: [
        { label: 'Pasta & Noodles (Truffle Pasta, Aglio Olio)', value: 8900000, sublabel: '36.9% penjualan kitchen', badge: 'High Margin' },
        { label: 'Rice Bowls (Beef Teriyaki, Salted Egg Chicken)', value: 8100000, sublabel: '33.6% penjualan kitchen', badge: 'Lunch Favorite' },
        { label: 'Artisan Toast & Breakfast Sandwiches', value: 4200000, sublabel: '17.4% penjualan kitchen', badge: 'Morning Combo' },
        { label: 'Finger Food & Truffle Fries', value: 2900000, sublabel: '12.1% penjualan kitchen', badge: 'Add-on Snack' }
      ],
      relatedTransactions: related.slice(0, 5),
      actionableInsights: [
        'Pasta Truffle menghasilkan kontribusi laba kotor terbesar di Kitchen. Pastikan standard recipe cream 50ml konsisten.',
        'Rice Bowls sangat laris saat jam 12:00 - 14:00. Lakukan prep potong ayam & bumbu marinate di pagi hari untuk mempercepat kitchen ticket time.',
        'Bundling paket Makan Siang + Es Kopi Susu terbukti meningkatkan conversion rate dine-in hingga 22%.'
      ]
    };
  }

  if (lower.includes('cogs') || lower.includes('hpp') || lower.includes('bahan')) {
    const related = transactions.filter(t => t.type === 'expense');
    return {
      title: 'Drill-down: Beban Pokok Penjualan (HPP / COGS)',
      subtitle: 'Rincian belanja bahan baku kopi, susu dairy, kitchen food, dan packaging',
      type: 'metric',
      periodLabel: 'September 2026',
      totalValue: 26750000,
      percentage: 32.0,
      breakdown: [
        { label: 'Susu Fresh Milk & Oat Milk Dairy', value: 9200000, sublabel: '34.4% dari total HPP', badge: 'Sensitif Limbah' },
        { label: 'Bahan Baku Kitchen & Daging/Ayam', value: 7850000, sublabel: '29.3% dari total HPP', badge: 'Food Cost' },
        { label: 'Biji Kopi Roasted Beans Arabica/Blend', value: 5200000, sublabel: '19.4% dari total HPP', badge: 'Coffee Cost' },
        { label: 'Kemasan Cup, Sedotan, Paper Bag', value: 2650000, sublabel: '9.9% dari total HPP', badge: 'Packaging' },
        { label: 'Sirup, Powder Matcha & Boba Topping', value: 1850000, sublabel: '6.9% dari total HPP', badge: 'Flavoring' }
      ],
      relatedTransactions: related.slice(0, 5),
      actionableInsights: [
        'Susu segar merupakan pengeluaran HPP nomor 1. Kalibrasi ukuran jug susu barista (gunakan jug 350ml bukan 600ml untuk single cup) dapat menekan waste susu hingga 15%.',
        'Simpan biji kopi di wadah kedap udara one-way valve untuk menghindari oksidasi dan pembuangan beans stale.',
        'Gunakan sedotan dan cup bersertifikat ramah lingkungan dari supplier grosir per dus untuk memangkas biaya kemasan sebesar 12%.'
      ]
    };
  }

  if (lower.includes('cash') || lower.includes('arus kas') || lower.includes('kasir')) {
    const related = transactions.filter(t => t.paymentMethod === 'Cash Kasir' || t.paymentMethod === 'QRIS');
    return {
      title: 'Drill-down: Dinamika Arus Kas Masuk & Keluar',
      subtitle: 'Kanal penerimaan tunai, settlement QRIS, dan pencairan kas kecil',
      type: 'metric',
      periodLabel: 'September 2026',
      totalValue: 83600000,
      breakdown: [
        { label: 'Settlement QRIS Dinamis (H+1 Kliring)', value: 56848000, sublabel: '68% transaksi - masuk rekening BCA', badge: 'Non-Tunai' },
        { label: 'Penerimaan Tunai Kas Kasir', value: 18392000, sublabel: '22% transaksi - setor tunai berkala', badge: 'Petty Cash' },
        { label: 'Transfer Bank & GoFood/Grab Settlement', value: 8360000, sublabel: '10% transaksi - masuk rekening operasional', badge: 'Transfer' }
      ],
      relatedTransactions: related.slice(0, 5),
      actionableInsights: [
        'QRIS menyerap 68% total transaksi. Pastikan rekonsiliasi harian antara laporan settlement bank dan POS kasir selalu cocok.',
        'Terapkan batas maksimal uang tunai di laci kasir (Cash Drawer Limit Rp 2.000.000). Sisanya wajib disetorkan ke brankas/bank.',
        'Arus kas operasional positif Rp 14.500.000/minggu memberikan cadangan kas (runway) lebih dari 45 hari.'
      ]
    };
  }

  // Default product or generic drilldown
  return {
    title: `Drill-down Analitik: ${identifier}`,
    subtitle: 'Rincian transaksi, komposisi pendapatan, dan rekomendasi margin',
    type: 'metric',
    periodLabel: 'September 2026',
    totalValue: 18500000,
    breakdown: [
      { label: 'Komponen Operasional Reguler', value: 11200000, sublabel: '60.5% porsi', badge: 'Utama' },
      { label: 'Komponen Variabel & Bahan', value: 5100000, sublabel: '27.6% porsi', badge: 'Variabel' },
      { label: 'Biaya Layanan & Pajak PB1', value: 2200000, sublabel: '11.9% porsi', badge: 'Pajak' }
    ],
    relatedTransactions: transactions.slice(0, 5),
    actionableInsights: [
      'Data performa menunjukkan tren pertumbuhan positif sebesar 14.2% dalam 30 hari terakhir.',
      'Optimalkan penjadwalan stok dan bahan baku menjelang lonjakan akhir pekan (Jumat - Minggu).',
      'Lakukan review berkala pada laporan laba rugi dan buku besar transaksi.'
    ]
  };
}
