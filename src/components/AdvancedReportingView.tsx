import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ShoppingBag,
  Users,
  Clock,
  DollarSign,
  Maximize2,
  X,
  ChevronRight,
  ChevronLeft,
  Download,
  Filter,
  Info,
  Target,
  Sliders,
  Settings2,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import {
  Transaction,
  SalesPeriod,
  SalesDataPoint,
  TopSellingProduct,
  DrillDownDetail,
  ProfitLossReport,
  BalanceSheetReport,
  CashFlowReport,
  FnBStrategicMetrics,
  MonthlyTargetSettings
} from '../types';
import {
  getDailySalesData,
  getWeeklySalesData,
  getMonthlySalesData,
  getDailySalesDataForMonth,
  getWeeklySalesDataForMonth,
  AVAILABLE_REPORTING_MONTHS,
  DEFAULT_MONTHLY_TARGETS,
  INITIAL_TOP_PRODUCTS,
  INITIAL_CUSTOMER_ANALYTICS,
  getDrillDownDetail
} from '../data/reportingData';
import { MonthlyTargetModal } from './MonthlyTargetModal';

interface AdvancedReportingViewProps {
  transactions: Transaction[];
  profitLoss: ProfitLossReport;
  balanceSheet: BalanceSheetReport;
  cashFlow: CashFlowReport;
  metrics: FnBStrategicMetrics;
}

type ReportingTab = 'sales' | 'pnl' | 'cash_balance' | 'products' | 'customer_spending';

const CHART_COLORS = {
  coffee: '#92400e', // amber-800
  kitchen: '#b45309', // amber-700
  pastry: '#d97706', // amber-600
  delivery: '#f59e0b', // amber-500
  revenue: '#0f766e', // teal-700
  cogs: '#e11d48', // rose-600
  grossProfit: '#059669', // emerald-600
  dineIn: '#0284c7', // sky-600
  takeaway: '#0d9488', // teal-600
  deliveryColor: '#f97316', // orange-500
  qris: '#7c3aed', // violet-600
  cash: '#16a34a', // green-600
  transfer: '#2563eb' // blue-600
};

export const AdvancedReportingView: React.FC<AdvancedReportingViewProps> = ({
  transactions,
  profitLoss,
  balanceSheet,
  cashFlow,
  metrics
}) => {
  const [activeTab, setActiveTab] = useState<ReportingTab>('sales');
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>('daily');
  const [drillDownModal, setDrillDownModal] = useState<DrillDownDetail | null>(null);
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [isMonthlyTargetModalOpen, setIsMonthlyTargetModalOpen] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Persisted monthly target settings with fallback
  const [monthlyTargets, setMonthlyTargets] = useState<Record<string, MonthlyTargetSettings>>(() => {
    try {
      const saved = localStorage.getItem('kopieats_monthly_targets_v1');
      if (saved) {
        return { ...DEFAULT_MONTHLY_TARGETS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed reading monthly targets from storage:', e);
    }
    return DEFAULT_MONTHLY_TARGETS;
  });

  const activeMonthMeta = useMemo(() => {
    return (
      AVAILABLE_REPORTING_MONTHS.find((m) => m.key === selectedMonth) ||
      AVAILABLE_REPORTING_MONTHS[0]
    );
  }, [selectedMonth]);

  const currentMonthTarget = useMemo(() => {
    const mKey = selectedMonth === 'all' ? '2026-09' : selectedMonth;
    return (
      monthlyTargets[mKey] ||
      DEFAULT_MONTHLY_TARGETS[mKey] ||
      DEFAULT_MONTHLY_TARGETS['2026-09']
    );
  }, [selectedMonth, monthlyTargets]);

  // Sales data depending on selected period and active month
  const salesData: SalesDataPoint[] = useMemo(() => {
    if (salesPeriod === 'weekly') return getWeeklySalesDataForMonth(selectedMonth);
    if (salesPeriod === 'monthly') return getMonthlySalesData();
    return getDailySalesDataForMonth(selectedMonth);
  }, [salesPeriod, selectedMonth]);

  // Aggregate totals
  const totalPeriodRevenue = useMemo(
    () => salesData.reduce((acc, d) => acc + d.totalRevenue, 0),
    [salesData]
  );
  const totalPeriodCOGS = useMemo(
    () => salesData.reduce((acc, d) => acc + d.cogsAmount, 0),
    [salesData]
  );
  const totalPeriodGrossProfit = useMemo(
    () => salesData.reduce((acc, d) => acc + d.grossProfit, 0),
    [salesData]
  );
  const totalOrders = useMemo(
    () => salesData.reduce((acc, d) => acc + d.orderCount, 0),
    [salesData]
  );
  const averagePeriodAOV = totalOrders > 0 ? Math.round(totalPeriodRevenue / totalOrders) : 0;

  // Monthly realization vs target calculations
  const currentRev = selectedMonth === 'all' ? totalPeriodRevenue : activeMonthMeta.totalRevenueEst;
  const currentCogs = selectedMonth === 'all' ? totalPeriodCOGS : activeMonthMeta.cogsEst;
  const currentGrossProfit = currentRev - currentCogs;
  const currentGrossMargin = currentRev > 0 ? (currentGrossProfit / currentRev) * 100 : 68;

  const targetRev = currentMonthTarget.targetRevenue;
  const revAchievementPct = targetRev > 0 ? (currentRev / targetRev) * 100 : 100;
  const revGap = targetRev - currentRev;

  const targetMaxCogs = Math.round((currentRev * currentMonthTarget.targetCogsPercent) / 100);
  const cogsActualPct = currentRev > 0 ? (currentCogs / currentRev) * 100 : 32;
  const cogsDiff = targetMaxCogs - currentCogs;

  const targetMaxLabor = Math.round((currentRev * currentMonthTarget.targetLaborPercent) / 100);
  const estActualLabor = Math.round(currentRev * (currentMonthTarget.targetLaborPercent > 20 ? 0.20 : 0.198));
  const laborDiff = targetMaxLabor - estActualLabor;

  const estNetProfit = Math.round(currentRev * (currentMonthTarget.targetNetMarginPercent / 100));
  const dailyRunRateActual = Math.round(currentRev / currentMonthTarget.operatingDays);
  const dailyRunRateTarget = Math.round(targetRev / currentMonthTarget.operatingDays);

  const handlePrevMonth = () => {
    const idx = AVAILABLE_REPORTING_MONTHS.findIndex((m) => m.key === selectedMonth);
    if (idx < AVAILABLE_REPORTING_MONTHS.length - 2) {
      setSelectedMonth(AVAILABLE_REPORTING_MONTHS[idx + 1].key);
    }
  };

  const handleNextMonth = () => {
    const idx = AVAILABLE_REPORTING_MONTHS.findIndex((m) => m.key === selectedMonth);
    if (idx > 0) {
      setSelectedMonth(AVAILABLE_REPORTING_MONTHS[idx - 1].key);
    }
  };

  const handleSaveMonthlyTarget = (target: MonthlyTargetSettings) => {
    setMonthlyTargets((prev) => {
      const updated = { ...prev, [target.monthKey]: target };
      try {
        localStorage.setItem('kopieats_monthly_targets_v1', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    setCopiedToast(`Pengaturan target bulan ${target.monthName} berhasil disimpan.`);
    setTimeout(() => setCopiedToast(null), 3000);
  };

  const handleResetMonthlyTargetToDefaults = (monthKey: string) => {
    const def = DEFAULT_MONTHLY_TARGETS[monthKey] || DEFAULT_MONTHLY_TARGETS['2026-09'];
    setMonthlyTargets((prev) => {
      const updated = { ...prev, [monthKey]: def };
      try {
        localStorage.setItem('kopieats_monthly_targets_v1', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleCopyMonthlySummary = () => {
    const mName = activeMonthMeta.label;
    const targetR = currentMonthTarget.targetRevenue;
    const actualR = currentRev;
    const achieveP = targetR > 0 ? ((actualR / targetR) * 100).toFixed(1) : '100';
    const cogsA = currentCogs;
    const cogsP = ((cogsA / actualR) * 100).toFixed(1);
    const targetCogsNom = (actualR * currentMonthTarget.targetCogsPercent) / 100;
    const cogsStatus = Number(cogsP) <= currentMonthTarget.targetCogsPercent ? '✅ Sesuai Plafon' : '⚠️ Melebihi Plafon';
    const dailyT = Math.round(targetR / currentMonthTarget.operatingDays);
    const dailyA = Math.round(actualR / currentMonthTarget.operatingDays);

    const text = `📊 LAPORAN KINERJA BULANAN - KOPIEATS
Periode: ${mName.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TARGET VS REALISASI:
• Target Omset: ${formatIDR(targetR)}
• Realisasi Aktual: ${formatIDR(actualR)} (${achieveP}% Tercapai)
• Target Run-Rate: ${formatIDR(dailyT)} / hari
• Realisasi Run-Rate: ${formatIDR(dailyA)} / hari

💰 EFISIENSI HPP & BIAYA:
• HPP Aktual: ${formatIDR(cogsA)} (${cogsP}% dari omset)
• Plafon Target HPP: ${currentMonthTarget.targetCogsPercent}% (${formatIDR(targetCogsNom)}) [${cogsStatus}]
• Plafon Beban Upah: ${currentMonthTarget.targetLaborPercent}% (Terkendali)
• Target Net Margin: ${currentMonthTarget.targetNetMarginPercent}% (Est. Laba Bersih: ${formatIDR((actualR * currentMonthTarget.targetNetMarginPercent) / 100)})

☕ TARGET OPERASIONAL:
• Target Minuman: ${currentMonthTarget.dailyTargetCups} cup/hari (~${(currentMonthTarget.dailyTargetCups * currentMonthTarget.operatingDays).toLocaleString('id-ID')} cup/bln)
• Hari Kerja: ${currentMonthTarget.operatingDays} hari
• Catatan Strategis: ${currentMonthTarget.notes || 'Operasional berjalan efisien sesuai SOP.'}

Generated by KopiEats Interactive Financial Suite`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedToast(`Ringkasan laporan bulan ${mName} berhasil disalin ke clipboard!`);
        setTimeout(() => setCopiedToast(null), 3500);
      }).catch(() => {
        setCopiedToast(`Gagal menyalin otomatis.`);
        setTimeout(() => setCopiedToast(null), 3500);
      });
    }
  };

  // Filtered top products
  const filteredProducts = useMemo(() => {
    if (selectedProductCategory === 'all') return INITIAL_TOP_PRODUCTS;
    return INITIAL_TOP_PRODUCTS.filter((p) => p.category === selectedProductCategory);
  }, [selectedProductCategory]);

  // Handle drill-down trigger
  const handleOpenDrillDown = (title: string) => {
    const detail = getDrillDownDetail(title, transactions);
    setDrillDownModal(detail);
  };

  const formatIDR = (num: number) => {
    return `Rp ${Math.round(num).toLocaleString('id-ID')}`;
  };

  const formatShortIDR = (num: number) => {
    if (num >= 1000000000) return `Rp ${(num / 1000000000).toFixed(1)}M`;
    if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(1)}Jt`;
    if (num >= 1000) return `Rp ${(num / 1000).toFixed(0)}Rb`;
    return `Rp ${num}`;
  };

  return (
    <div className="space-y-6" id="advanced-reporting-container">
      {/* Top Bar Header & Navigation */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-800">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-stone-900 tracking-tight">
                Advanced Financial & Sales Reporting Hub
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-medium">
                Live Interactive Visualizer
              </span>
            </div>
            <p className="text-sm text-stone-600">
              Analisis multi-dimensi performa penjualan kafe & resto, evaluasi margin P&L, arus kas, matriks menu, dan kontrol target anggaran bulanan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenDrillDown('Penjualan Coffee & Beverages')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              Drill-down Cepat
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'sales'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Penjualan & Tren (Sales Trends)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pnl')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'pnl'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Laba Rugi & Rasio Margin (P&L)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cash_balance')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'cash_balance'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Arus Kas & Neraca (Cash Flow & BS)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'products'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Menu Engineering & Produk Terlaris
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customer_spending')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'customer_spending'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Pola Belanja & Jam Ramai (Customer Patterns)
          </button>
        </div>

        {/* Monthly Control Toolbar & Period Settings */}
        <div className="pt-3 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Month Selector with Stepper & Status Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-800" />
              Pilih Bulan:
            </span>
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={selectedMonth === '2026-04'}
                className="p-1 text-stone-600 hover:text-stone-900 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Bulan Sebelumnya (Lebih Lampau)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-stone-900 px-1 focus:outline-hidden cursor-pointer"
              >
                {AVAILABLE_REPORTING_MONTHS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label} {m.isCurrentMonth ? '⭐ (Bulan Berjalan)' : ''}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleNextMonth}
                disabled={selectedMonth === '2026-09'}
                className="p-1 text-stone-600 hover:text-stone-900 rounded hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Bulan Berikutnya (Lebih Baru)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Month Status Badge */}
            {activeMonthMeta.isCurrentMonth ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Bulan Berjalan (Live POS)
              </span>
            ) : selectedMonth === 'all' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                Konsolidasi 6 Bulan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                📁 Arsip Data Historis
              </span>
            )}
          </div>

          {/* Target Settings & Copy Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMonthlyTargetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              Pengaturan Target & Budget Bulan Ini
            </button>

            <button
              type="button"
              onClick={handleCopyMonthlySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              title="Salin Ringkasan Format WhatsApp / Manajemen"
            >
              <Copy className="w-3.5 h-3.5 text-stone-500" />
              Salin Ringkasan
            </button>
          </div>
        </div>
      </div>

      {/* Copied Toast Alert */}
      {copiedToast && (
        <div className="p-3 bg-stone-900 text-white text-xs rounded-xl flex items-center justify-between shadow-lg animate-in fade-in duration-150">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            {copiedToast}
          </span>
          <button
            type="button"
            onClick={() => setCopiedToast(null)}
            className="text-stone-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Kartu Monitoring Target & Anggaran Bulanan (Realisasi vs Target) */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                Monitoring Realisasi vs Target: {activeMonthMeta.label}
              </h3>
              <p className="text-xs text-stone-600">
                Pencapaian omset penjualan, batas belanja bahan baku (HPP), dan plafon beban gaji sesuai konfigurasi bulanan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMonthlyTargetModalOpen(true)}
            className="text-xs text-amber-900 font-semibold hover:underline flex items-center gap-1 self-start sm:self-center cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Ubah Pengaturan Bulan Ini
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Realisasi Omset vs Target */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">Target Omset Bulanan</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  revAchievementPct >= 98
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {revAchievementPct.toFixed(1)}% Tercapai
              </span>
            </div>
            <div className="text-lg font-bold text-stone-900">
              {formatIDR(currentRev)}
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  revAchievementPct >= 100
                    ? 'bg-emerald-600'
                    : revAchievementPct >= 90
                    ? 'bg-teal-600'
                    : 'bg-amber-600'
                }`}
                style={{ width: `${Math.min(100, revAchievementPct)}%` }}
              ></div>
            </div>
            <div className="text-[11px] text-stone-600 flex justify-between pt-0.5">
              <span>Target: {formatShortIDR(targetRev)}</span>
              <span>
                {revGap > 0 ? `Kurang ${formatShortIDR(revGap)}` : 'Melampaui Target!'}
              </span>
            </div>
            <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-200/60">
              Run-rate: {formatShortIDR(dailyRunRateActual)}/hari (Target: {formatShortIDR(dailyRunRateTarget)}/hari)
            </div>
          </div>

          {/* 2. Plafon HPP / Food Cost */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">Kontrol HPP (Food Cost)</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  cogsActualPct <= currentMonthTarget.targetCogsPercent
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {cogsActualPct.toFixed(1)}% / Max {currentMonthTarget.targetCogsPercent}%
              </span>
            </div>
            <div className="text-lg font-bold text-stone-900">
              {formatIDR(currentCogs)}
            </div>
            <div className="text-[11px] text-stone-600">
              {cogsDiff >= 0 ? (
                <span className="text-emerald-700 font-medium">
                  ✅ Hemat {formatShortIDR(cogsDiff)} di bawah plafon
                </span>
              ) : (
                <span className="text-rose-700 font-medium">
                  ⚠️ Melebihi plafon {formatShortIDR(Math.abs(cogsDiff))}
                </span>
              )}
            </div>
            <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-200/60">
              Plafon Belanja: {formatShortIDR(targetMaxCogs)} ({currentMonthTarget.targetCogsPercent}% omset)
            </div>
          </div>

          {/* 3. Plafon Beban Upah Barista & Staf */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">Plafon Upah / Labor Cost</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  laborDiff >= 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                Max {currentMonthTarget.targetLaborPercent}%
              </span>
            </div>
            <div className="text-lg font-bold text-stone-900">
              {formatIDR(estActualLabor)}
            </div>
            <div className="text-[11px] text-stone-600">
              <span className="text-emerald-700 font-medium">
                ✅ Terkontrol (Sisa alokasi {formatShortIDR(Math.max(0, laborDiff))})
              </span>
            </div>
            <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-200/60">
              Plafon Upah: {formatShortIDR(targetMaxLabor)} ({currentMonthTarget.targetLaborPercent}% omset)
            </div>
          </div>

          {/* 4. Target Laba Bersih & Sasaran Operasional */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">Target Net Margin</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Target {currentMonthTarget.targetNetMarginPercent}%
              </span>
            </div>
            <div className="text-lg font-bold text-stone-900">
              {formatIDR(estNetProfit)}
            </div>
            <div className="text-[11px] text-stone-600 truncate" title={currentMonthTarget.notes}>
              🎯 {currentMonthTarget.notes || 'Operasional berjalan lancar sesuai target.'}
            </div>
            <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-200/60 flex justify-between">
              <span>Target Kopi: {currentMonthTarget.dailyTargetCups} cup/hr</span>
              <span>{currentMonthTarget.operatingDays} hari kerja</span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: SALES & TRENDS */}
      {activeTab === 'sales' && (
        <div className="space-y-6" id="tab-sales-content">
          {/* Period Toggle & Metric Cards */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg border border-stone-200">
              <button
                type="button"
                onClick={() => setSalesPeriod('daily')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  salesPeriod === 'daily'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Harian ({activeMonthMeta.shortLabel})
              </button>
              <button
                type="button"
                onClick={() => setSalesPeriod('weekly')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  salesPeriod === 'weekly'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Mingguan ({activeMonthMeta.shortLabel})
              </button>
              <button
                type="button"
                onClick={() => setSalesPeriod('monthly')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  salesPeriod === 'monthly'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Bulanan (Perbandingan 6 Bulan)
              </button>
            </div>

            <div className="text-xs text-stone-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Data terkalibrasi dengan POS & Penjualan WhatsApp</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => handleOpenDrillDown('Penjualan Coffee & Beverages')}
              className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs hover:border-amber-400 transition-colors cursor-pointer"
            >
              <div className="text-xs font-medium text-stone-600 flex items-center justify-between">
                <span>Total Omset Penjualan</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </div>
              <div className="text-xl font-bold text-stone-900 mt-1">
                {formatIDR(totalPeriodRevenue)}
              </div>
              <div className="text-xs text-emerald-700 flex items-center gap-1 mt-1 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs periode sebelumnya
              </div>
            </div>

            <div
              onClick={() => handleOpenDrillDown('Beban Pokok Penjualan (HPP / COGS)')}
              className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs hover:border-rose-400 transition-colors cursor-pointer"
            >
              <div className="text-xs font-medium text-stone-600 flex items-center justify-between">
                <span>Total HPP / COGS Bahan</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </div>
              <div className="text-xl font-bold text-stone-900 mt-1">
                {formatIDR(totalPeriodCOGS)}
              </div>
              <div className="text-xs text-stone-600 mt-1">
                Food & Bev Cost: {(totalPeriodRevenue > 0 ? (totalPeriodCOGS / totalPeriodRevenue) * 100 : 0).toFixed(1)}% (Aman &lt;35%)
              </div>
            </div>

            <div
              onClick={() => handleOpenDrillDown('Laba Kotor & Gross Profit')}
              className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs hover:border-emerald-400 transition-colors cursor-pointer"
            >
              <div className="text-xs font-medium text-stone-600 flex items-center justify-between">
                <span>Laba Kotor (Gross Profit)</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </div>
              <div className="text-xl font-bold text-emerald-800 mt-1">
                {formatIDR(totalPeriodGrossProfit)}
              </div>
              <div className="text-xs text-emerald-700 mt-1 font-medium">
                Gross Margin: {(totalPeriodRevenue > 0 ? (totalPeriodGrossProfit / totalPeriodRevenue) * 100 : 0).toFixed(1)}%
              </div>
            </div>

            <div
              onClick={() => handleOpenDrillDown('Pola Belanja Pelanggan')}
              className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs hover:border-sky-400 transition-colors cursor-pointer"
            >
              <div className="text-xs font-medium text-stone-600 flex items-center justify-between">
                <span>Volume Order & Rata-rata Struk</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </div>
              <div className="text-xl font-bold text-stone-900 mt-1">
                {totalOrders.toLocaleString('id-ID')} Struk
              </div>
              <div className="text-xs text-stone-600 mt-1">
                AOV: <span className="font-semibold text-stone-800">{formatIDR(averagePeriodAOV)}</span> / transaksi
              </div>
            </div>
          </div>

          {/* Main Area Chart: Revenue vs COGS vs Gross Profit */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-700" />
                  Tren Pertumbuhan Omset, HPP, & Laba Kotor
                </h3>
                <p className="text-xs text-stone-600">
                  Visualisasi perbandingan pendapatan kotor (Revenue), pengeluaran bahan baku (COGS), dan laba kotor.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-stone-700 font-medium">
                  <span className="w-3 h-3 rounded-xs bg-teal-700 inline-block"></span> Total Omset
                </span>
                <span className="flex items-center gap-1.5 text-stone-700 font-medium">
                  <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block"></span> Laba Kotor
                </span>
                <span className="flex items-center gap-1.5 text-stone-700 font-medium">
                  <span className="w-3 h-3 rounded-xs bg-rose-600 inline-block"></span> HPP (COGS)
                </span>
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.revenue} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={CHART_COLORS.revenue} stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.grossProfit} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={CHART_COLORS.grossProfit} stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorCOGS" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.cogs} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={CHART_COLORS.cogs} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(val) => formatShortIDR(val)}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any, name: string | undefined) => {
                      const labelMap: Record<string, string> = {
                        totalRevenue: 'Total Omset',
                        grossProfit: 'Laba Kotor',
                        cogsAmount: 'HPP (COGS)'
                      };
                      return [formatIDR(Number(val) || 0), (name && labelMap[name]) || name || ''];
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b', fontSize: '12px' }}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalRevenue"
                    stroke={CHART_COLORS.revenue}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="grossProfit"
                    stroke={CHART_COLORS.grossProfit}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorGross)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cogsAmount"
                    stroke={CHART_COLORS.cogs}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorCOGS)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Stacked Bar Chart: Category Contribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-700" />
                    Komposisi Penjualan per Kategori (Stacked Breakdown)
                  </h3>
                  <p className="text-xs text-stone-600">
                    Proporsi harian/mingguan antara Minuman Kopi, Makanan Dapur (Eatery), Pastry, dan Delivery.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenDrillDown('Kitchen & Food Eatery')}
                  className="text-xs text-amber-900 font-medium hover:underline flex items-center gap-1"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Drill-down
                </button>
              </div>

              <div className="h-68 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tickFormatter={(val) => formatShortIDR(val)}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val: any, name: string | undefined) => {
                        const labels: Record<string, string> = {
                          coffeeSales: 'Coffee & Beverages',
                          kitchenSales: 'Kitchen & Eatery',
                          pastrySales: 'Pastry & Bakery',
                          deliverySales: 'Online Delivery'
                        };
                        return [formatIDR(Number(val) || 0), (name && labels[name]) || name || ''];
                      }}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="coffeeSales" name="Coffee & Beverages" stackId="a" fill={CHART_COLORS.coffee} />
                    <Bar dataKey="kitchenSales" name="Kitchen & Eatery" stackId="a" fill={CHART_COLORS.kitchen} />
                    <Bar dataKey="pastrySales" name="Pastry & Bakery" stackId="a" fill={CHART_COLORS.pastry} />
                    <Bar dataKey="deliverySales" name="Online Delivery" stackId="a" fill={CHART_COLORS.delivery} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Side Category Share Pie Chart */}
            <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-amber-700" />
                  Pangsa Penjualan (Share %)
                </h3>
                <p className="text-xs text-stone-600">
                  Dominasi kategori menu dalam menghasilkan omset kafe.
                </p>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Coffee & Beverages', value: 45.7, color: CHART_COLORS.coffee },
                        { name: 'Kitchen & Eatery', value: 28.8, color: CHART_COLORS.kitchen },
                        { name: 'Online Delivery', value: 16.6, color: CHART_COLORS.delivery },
                        { name: 'Pastry & Bakery', value: 8.9, color: CHART_COLORS.pastry }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {[CHART_COLORS.coffee, CHART_COLORS.kitchen, CHART_COLORS.delivery, CHART_COLORS.pastry].map(
                        (entry, idx) => (
                          <Cell key={idx} fill={entry} />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Kontribusi Omset']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-700">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS.coffee }}></span>
                    Coffee & Beverages
                  </span>
                  <span className="font-semibold text-stone-900">45.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-700">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS.kitchen }}></span>
                    Kitchen & Eatery
                  </span>
                  <span className="font-semibold text-stone-900">28.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-700">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS.delivery }}></span>
                    Online Delivery
                  </span>
                  <span className="font-semibold text-stone-900">16.6%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-700">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS.pastry }}></span>
                    Pastry & Bakery
                  </span>
                  <span className="font-semibold text-stone-900">8.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: P&L & MARGIN ANALYSIS */}
      {activeTab === 'pnl' && (() => {
        const baseRev = profitLoss.revenue?.totalNetRevenue ?? 343500000;
        const scaleRatio = selectedMonth === '2026-09' ? 1.0 : (currentRev / (baseRev || 1));
        const totalNetRev = Math.round(baseRev * scaleRatio);
        const totalCogsVal = Math.round((profitLoss.cogs?.totalCogs ?? 109920000) * scaleRatio);
        const grossProfitVal = totalNetRev - totalCogsVal;
        const grossMarginPct = totalNetRev > 0 ? (grossProfitVal / totalNetRev) * 100 : 68;
        const totalOpexVal = Math.round((profitLoss.opex?.totalOpex ?? 150000000) * scaleRatio);
        const netProfitVal = Math.max(0, totalNetRev - totalCogsVal - totalOpexVal);
        const netMarginPct = totalNetRev > 0 ? (netProfitVal / totalNetRev) * 100 : 18;
        const primeCostPct = metrics.primeCostRatio ?? 0;
        const foodCostPct = metrics.foodCostRatio ?? 0;
        const laborCostPct = currentMonthTarget.targetLaborPercent || (metrics.laborCostRatio ?? 20);
        const rentPct = metrics.rentRatio ?? 0;
        const laborNominal = (laborCostPct * totalNetRev) / 100;
        const rentNominal = (rentPct * totalNetRev) / 100;
        const otherOpexNominal = Math.max(0, totalOpexVal - laborNominal - rentNominal);
        const otherOpexPct = totalNetRev > 0 ? (otherOpexNominal / totalNetRev) * 100 : 0;

        return (
        <div className="space-y-6" id="tab-pnl-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Total Pendapatan Bersih
              </div>
              <div className="text-2xl font-bold text-stone-900 mt-1">
                {formatIDR(totalNetRev)}
              </div>
              <p className="text-xs text-stone-600 mt-1">
                Total penjualan kotor dikurangi diskon promo member
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Laba Kotor Operasional
              </div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">
                {formatIDR(grossProfitVal)}
              </div>
              <p className="text-xs text-emerald-700 mt-1 font-medium">
                Gross Profit Margin: {grossMarginPct.toFixed(1)}%
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Laba Bersih (Net Profit)
              </div>
              <div className="text-2xl font-bold text-stone-900 mt-1">
                {formatIDR(netProfitVal)}
              </div>
              <p className="text-xs text-stone-600 mt-1">
                Net Margin: <span className="font-semibold text-stone-800">{netMarginPct.toFixed(1)}%</span> (Target F&B: 15-20%)
              </p>
            </div>
          </div>

          {/* Prime Cost Ratio Gauge & Detailed Breakdown */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  Analisis Prime Cost (COGS Bahan + Gaji Staff Barista)
                </h3>
                <p className="text-xs text-stone-600">
                  Golden Rule Industri Resto & Coffee: Prime Cost wajib di bawah 60% untuk menjaga profitabilitas jangka panjang.
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full ${
                    primeCostPct < 60
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  Prime Cost: {primeCostPct.toFixed(1)}% ({primeCostPct < 60 ? 'IDEAL / AMAN' : 'PERINGATAN TINGGI'})
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                <span>0%</span>
                <span className="text-amber-800 font-semibold">COGS Bahan: {foodCostPct.toFixed(1)}%</span>
                <span className="text-indigo-800 font-semibold">Labor Staff: {laborCostPct.toFixed(1)}%</span>
                <span className="text-stone-500">Batas Maksimal: 60%</span>
                <span>100%</span>
              </div>
              <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${Math.min(foodCostPct, 50)}%` }}
                  className="bg-amber-700 h-full"
                  title="COGS Bahan Baku"
                ></div>
                <div
                  style={{ width: `${Math.min(laborCostPct, 30)}%` }}
                  className="bg-indigo-600 h-full"
                  title="Biaya Gaji Staff"
                ></div>
                <div
                  style={{ width: `${Math.max(0, 100 - primeCostPct)}%` }}
                  className="bg-stone-200 h-full"
                  title="Sisa Margin OPEX & Laba"
                ></div>
              </div>
            </div>

            {/* P&L Line Items Table */}
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-medium">
                  <tr>
                    <th className="px-4 py-2.5">Elemen Akuntansi Laba Rugi</th>
                    <th className="px-4 py-2.5 text-right">Nominal (IDR)</th>
                    <th className="px-4 py-2.5 text-right">% dari Omset</th>
                    <th className="px-4 py-2.5 text-center">Status F&B</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr className="hover:bg-stone-50/50">
                    <td className="px-4 py-2 font-medium text-stone-900">Penjualan Bersih (Revenue)</td>
                    <td className="px-4 py-2 text-right font-semibold text-stone-900">{formatIDR(totalNetRev)}</td>
                    <td className="px-4 py-2 text-right font-medium">100.0%</td>
                    <td className="px-4 py-2 text-center"><span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700">Baseline</span></td>
                  </tr>
                  <tr className="hover:bg-stone-50/50 text-rose-800">
                    <td className="px-4 py-2 font-medium">Beban Pokok Penjualan (HPP / Food & Bev Cost)</td>
                    <td className="px-4 py-2 text-right font-semibold">({formatIDR(totalCogsVal)})</td>
                    <td className="px-4 py-2 text-right font-medium">{foodCostPct.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-center"><span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">Sehat (&lt;35%)</span></td>
                  </tr>
                  <tr className="bg-stone-50/60 font-semibold text-stone-900">
                    <td className="px-4 py-2">Laba Kotor (Gross Profit)</td>
                    <td className="px-4 py-2 text-right text-emerald-800">{formatIDR(grossProfitVal)}</td>
                    <td className="px-4 py-2 text-right">{grossMarginPct.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-center"><span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">Prima</span></td>
                  </tr>
                  <tr className="hover:bg-stone-50/50">
                    <td className="px-4 py-2 font-medium text-stone-800 pl-8">Beban Gaji & Upah Barista/Staff (Labor)</td>
                    <td className="px-4 py-2 text-right text-stone-800">({formatIDR(laborNominal)})</td>
                    <td className="px-4 py-2 text-right font-medium">{laborCostPct.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-center"><span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700">Efisien (&lt;25%)</span></td>
                  </tr>
                  <tr className="hover:bg-stone-50/50">
                    <td className="px-4 py-2 font-medium text-stone-800 pl-8">Sewa Tempat & Ruko (Rent)</td>
                    <td className="px-4 py-2 text-right text-stone-800">({formatIDR(rentNominal)})</td>
                    <td className="px-4 py-2 text-right font-medium">{rentPct.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-center"><span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">Bagus (&lt;10%)</span></td>
                  </tr>
                  <tr className="hover:bg-stone-50/50">
                    <td className="px-4 py-2 font-medium text-stone-800 pl-8">Listrik, Gas, WiFi, Pemeliharaan Mesin & OPEX Lainnya</td>
                    <td className="px-4 py-2 text-right text-stone-800">({formatIDR(otherOpexNominal)})</td>
                    <td className="px-4 py-2 text-right font-medium">{otherOpexPct.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-center"><span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700">Terkontrol</span></td>
                  </tr>
                  <tr className="bg-emerald-50/50 font-bold text-stone-900 border-t border-emerald-200">
                    <td className="px-4 py-2.5">Laba Bersih Akhir (Net Income)</td>
                    <td className="px-4 py-2.5 text-right text-emerald-800">{formatIDR(netProfitVal)}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-800">{netMarginPct.toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-center"><span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">PROFITABLE</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        );
      })()}

      {/* TAB 3: CASH FLOW & BALANCE SHEET */}
      {activeTab === 'cash_balance' && (
        <div className="space-y-6" id="tab-cash-balance-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cash Flow Summary */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                    Laporan Arus Kas (Cash Flow)
                  </h3>
                  <p className="text-xs text-stone-600">
                    Arus kas operasional dari penjualan tunai & QRIS dikurangi belanja bahan tunai.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenDrillDown('Arus Kas Masuk & Keluar')}
                  className="text-xs text-amber-900 font-medium hover:underline flex items-center gap-1"
                >
                  Drill-down
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50">
                  <span className="text-stone-700">Saldo Kas Awal Periode</span>
                  <span className="font-semibold text-stone-900">{formatIDR(cashFlow.beginningCash)}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 text-emerald-900">
                  <span className="font-medium">Arus Kas Masuk Operasional (+ Penjualan)</span>
                  <span className="font-bold">{formatIDR(cashFlow.operatingCashFlow)}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50 text-rose-900">
                  <span className="font-medium">Arus Kas Keluar Investasi (- Beli Mesin/Alat)</span>
                  <span className="font-bold">({formatIDR(Math.abs(cashFlow.investingCashFlow))})</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50">
                  <span className="text-stone-700">Arus Kas Pendanaan (Prive / Setoran Modal)</span>
                  <span className="font-semibold text-stone-900">{formatIDR(cashFlow.financingCashFlow)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200 text-stone-900">
                  <div>
                    <div className="font-bold text-sm">Saldo Kas Akhir (Ending Cash)</div>
                    <div className="text-[11px] text-stone-600">Kas Kasir + Rekening Bank BCA</div>
                  </div>
                  <span className="font-bold text-base text-amber-900">{formatIDR(cashFlow.endingCash)}</span>
                </div>
              </div>
            </div>

            {/* Balance Sheet Summary */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-700" />
                    Neraca Keuangan (Balance Sheet)
                  </h3>
                  <p className="text-xs text-stone-600">
                    Posisi Aset, Liabilitas (Hutang Suplier), dan Ekuitas Modal Pemilik.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  Seimbang (Balanced)
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg border border-stone-200 bg-stone-50 space-y-2">
                  <div className="flex items-center justify-between font-bold text-stone-900">
                    <span>TOTAL ASET (HARTA)</span>
                    <span className="text-sm">{formatIDR(balanceSheet.totalAssets)}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600 pl-3">
                    <span>- Kas & Setara Kas (Petty Cash + Bank)</span>
                    <span>{formatIDR(balanceSheet.assets.currentAssets.cash)}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600 pl-3">
                    <span>- Persediaan Biji Kopi, Susu, & Bahan Makanan</span>
                    <span>{formatIDR(balanceSheet.assets.currentAssets.inventory)}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600 pl-3">
                    <span>- Mesin Espresso, Grinder, & Kitchen Equipment</span>
                    <span>{formatIDR(balanceSheet.assets.fixedAssets.equipment)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-stone-200 bg-stone-50 space-y-2">
                  <div className="flex items-center justify-between font-bold text-stone-900">
                    <span>TOTAL KEWAJIBAN & EKUITAS</span>
                    <span className="text-sm">{formatIDR(balanceSheet.totalLiabilitiesAndEquity)}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600 pl-3">
                    <span>- Hutang Usaha Suplier / Tempo Bahan</span>
                    <span>{formatIDR(balanceSheet.liabilities.currentLiabilities.accountsPayable)}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600 pl-3">
                    <span>- Modal Pemilik & Laba Ditahan</span>
                    <span>{formatIDR(balanceSheet.equity.retainedEarnings + balanceSheet.equity.ownerEquity)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MENU ENGINEERING & TOP SELLING PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6" id="tab-products-content">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-700" />
                Menu Engineering & BCG Matrix Kategori Produk
              </h3>
              <p className="text-xs text-stone-600">
                Identifikasi menu <strong>Star</strong> (volume tinggi, margin tinggi), <strong>Plowhorse</strong> (populer tapi margin ketat), dan <strong>Dog</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedProductCategory}
                onChange={(e) => setSelectedProductCategory(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium border border-stone-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="all">Semua Kategori Menu</option>
                <option value="Coffee & Beverages">Coffee & Beverages</option>
                <option value="Kitchen & Eatery">Kitchen & Eatery</option>
                <option value="Pastry & Bakery">Pastry & Bakery</option>
              </select>
            </div>
          </div>

          {/* Matrix Quad Legend Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 text-xs">
              <div className="font-bold text-amber-900 flex items-center gap-1">
                ⭐ Star (Bintang)
              </div>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Volume Tinggi & Margin Tinggi. Pertahankan kualitas rasa & promosikan terus.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-sky-200 bg-sky-50/60 text-xs">
              <div className="font-bold text-sky-900 flex items-center gap-1">
                🐴 Plowhorse (Kuda Kerja)
              </div>
              <p className="text-[11px] text-sky-800 mt-0.5">
                Volume Tinggi tapi Margin Menengah. Naikkan harga sedikit atau pangkas gramasi porsi.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/60 text-xs">
              <div className="font-bold text-purple-900 flex items-center gap-1">
                🧩 Puzzle (Teka-teki)
              </div>
              <p className="text-[11px] text-purple-800 mt-0.5">
                Margin Sangat Tinggi tapi Volume Rendah. Tingkatkan rekomendasi kasir & display menu.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/60 text-xs">
              <div className="font-bold text-rose-900 flex items-center gap-1">
                🐕 Dog (Anjing)
              </div>
              <p className="text-[11px] text-rose-800 mt-0.5">
                Volume Rendah & Margin Rendah. Evaluasi untuk diganti atau dihentikan dari menu.
              </p>
            </div>
          </div>

          {/* Top Products Table with Interactive Drill-Down */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-medium">
                <tr>
                  <th className="px-4 py-3">Nama Menu Produk</th>
                  <th className="px-3 py-3">Kategori</th>
                  <th className="px-3 py-3 text-center">Unit Terjual</th>
                  <th className="px-3 py-3 text-right">Harga Jual</th>
                  <th className="px-3 py-3 text-right">Total Omset</th>
                  <th className="px-3 py-3 text-right">HPP / Cup</th>
                  <th className="px-3 py-3 text-center">Margin %</th>
                  <th className="px-3 py-3 text-center">Matriks Menu</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-semibold text-stone-900">
                      <div className="flex items-center gap-2">
                        <span>{prod.name}</span>
                        {prod.trend === 'up' && (
                          <span className="text-[10px] text-emerald-600 font-mono">▲</span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-500 font-normal mt-0.5">
                        Jam Ramai: {prod.peakTime}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-stone-600">{prod.category}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-stone-900">
                      {prod.unitsSold.toLocaleString('id-ID')}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-stone-700">
                      {formatIDR(prod.sellingPrice)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-stone-900">
                      {formatIDR(prod.totalRevenue)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-rose-700">
                      {formatIDR(prod.cogsPerUnit)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                        {(prod.marginPercent ?? 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          prod.matrixCategory === 'Star'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : prod.matrixCategory === 'Plowhorse'
                            ? 'bg-sky-100 text-sky-900 border border-sky-300'
                            : prod.matrixCategory === 'Puzzle'
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        {prod.matrixCategory}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenDrillDown(prod.name)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-medium transition-colors cursor-pointer"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CUSTOMER SPENDING PATTERNS & RUSH HOURS */}
      {activeTab === 'customer_spending' && (
        <div className="space-y-6" id="tab-spending-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Rata-rata Nilai Transaksi (AOV)
              </div>
              <div className="text-2xl font-bold text-stone-900 mt-1">
                {formatIDR(INITIAL_CUSTOMER_ANALYTICS.averageOrderValue)}
              </div>
              <div className="text-xs text-stone-600 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Dine-in (Makan di tempat):</span>
                  <span className="font-semibold">{formatIDR(INITIAL_CUSTOMER_ANALYTICS.dineInAOV)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Takeaway (Bawa pulang):</span>
                  <span className="font-semibold">{formatIDR(INITIAL_CUSTOMER_ANALYTICS.takeawayAOV)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Online Delivery:</span>
                  <span className="font-semibold">{formatIDR(INITIAL_CUSTOMER_ANALYTICS.deliveryAOV)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Distribusi Format Pemesanan
              </div>
              <div className="h-32 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { format: 'Dine-In', share: INITIAL_CUSTOMER_ANALYTICS.orderFormatSplit.dineInPercent, fill: CHART_COLORS.dineIn },
                      { format: 'Takeaway', share: INITIAL_CUSTOMER_ANALYTICS.orderFormatSplit.takeawayPercent, fill: CHART_COLORS.takeaway },
                      { format: 'Delivery', share: INITIAL_CUSTOMER_ANALYTICS.orderFormatSplit.deliveryPercent, fill: CHART_COLORS.deliveryColor }
                    ]}
                    margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                  >
                    <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                    <YAxis dataKey="format" type="category" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip formatter={(val: any) => [`${val}%`, 'Porsi Pesanan']} />
                    <Bar dataKey="share" radius={[0, 4, 4, 0]}>
                      {[CHART_COLORS.dineIn, CHART_COLORS.takeaway, CHART_COLORS.deliveryColor].map((c, i) => (
                        <Cell key={i} fill={c} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
              <div className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Metode Pembayaran Kasir
              </div>
              <div className="h-32 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'QRIS Dinamis', value: INITIAL_CUSTOMER_ANALYTICS.paymentMethodSplit.qrisPercent, fill: CHART_COLORS.qris },
                        { name: 'Cash Kasir', value: INITIAL_CUSTOMER_ANALYTICS.paymentMethodSplit.cashPercent, fill: CHART_COLORS.cash },
                        { name: 'Transfer Bank', value: INITIAL_CUSTOMER_ANALYTICS.paymentMethodSplit.transferPercent, fill: CHART_COLORS.transfer }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {[CHART_COLORS.qris, CHART_COLORS.cash, CHART_COLORS.transfer].map((c, idx) => (
                        <Cell key={idx} fill={c} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => [`${val}%`, 'Porsi Kasir']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around text-[11px] text-stone-600 mt-1">
                <span className="font-semibold text-violet-700">QRIS: {INITIAL_CUSTOMER_ANALYTICS.paymentMethodSplit.qrisPercent}%</span>
                <span className="font-semibold text-emerald-700">Tunai: {INITIAL_CUSTOMER_ANALYTICS.paymentMethodSplit.cashPercent}%</span>
                <span className="font-semibold text-blue-700">Transfer: {INITIAL_CUSTOMER_ANALYTICS.paymentMethodSplit.transferPercent}%</span>
              </div>
            </div>
          </div>

          {/* Peak Rush Hours Analysis */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700" />
                  Pola Jam Ramai & Alokasi Barista (Hourly Rush Hours)
                </h3>
                <p className="text-xs text-stone-600">
                  Waktu tersibuk di gerai kopi & eatery untuk optimalisasi jadwal shift dan persiapan bahan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {INITIAL_CUSTOMER_ANALYTICS.hourlyRushHours.map((rush, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2 hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">
                      {rush.hour}
                    </span>
                    <span className="text-xs font-semibold text-stone-800">
                      {rush.sharePercent}% Omset
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-stone-900">{rush.label}</h4>
                  <div className="text-xs text-stone-600 space-y-0.5">
                    <div>Volume: <strong className="text-stone-800">{rush.ordersCount} Struk</strong></div>
                    <div>Total: <strong className="text-stone-800">{formatIDR(rush.revenue)}</strong></div>
                    <div className="text-[11px] text-amber-900 pt-1">
                      Terlaris: {rush.popularItem}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Basket Size Distribution */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-stone-900">
              Distribusi Nilai Keranjang Belanja (Basket Size Buckets)
            </h3>
            <div className="space-y-2">
              {INITIAL_CUSTOMER_ANALYTICS.basketSizeBuckets.map((bucket, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs text-stone-700">
                    <span>{bucket.range} ({bucket.orderCount} struk)</span>
                    <span className="font-semibold text-stone-900">{bucket.percent}%</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-700 rounded-full"
                      style={{ width: `${bucket.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DRILL-DOWN MODAL / DETAIL POPUP */}
      {drillDownModal && (
        <div
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
          onClick={() => setDrillDownModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-stone-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
            id="drill-down-modal-content"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-1">
                  <Filter className="w-3 h-3" /> Drill-down Analysis
                </div>
                <h3 className="text-lg font-bold text-stone-900">{drillDownModal.title}</h3>
                {drillDownModal.subtitle && (
                  <p className="text-xs text-stone-600 mt-0.5">{drillDownModal.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDrillDownModal(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Highlight */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-stone-600">Total Akumulasi Periode Ini</div>
                <div className="text-2xl font-bold text-stone-900 mt-0.5">
                  {formatIDR(drillDownModal.totalValue)}
                </div>
              </div>
              {drillDownModal.percentage !== undefined && drillDownModal.percentage !== null && (
                <div className="text-right">
                  <div className="text-xs text-stone-600">Kontribusi Terhadap Total</div>
                  <div className="text-xl font-bold text-emerald-700">
                    {(drillDownModal.percentage ?? 0).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>

            {/* Breakdown Sub-Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                Rincian Sub-Kategori & Lini Transaksi:
              </h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
                {drillDownModal.breakdown.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs hover:bg-stone-50">
                    <div>
                      <div className="font-semibold text-stone-900 flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.sublabel && (
                        <div className="text-[11px] text-stone-500 mt-0.5">{item.sublabel}</div>
                      )}
                    </div>
                    <div className="text-right font-bold text-stone-900">
                      {formatIDR(item.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Insights & Recommendations */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
              <h4 className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-700" />
                Rekomendasi Strategis AI F&B:
              </h4>
              <ul className="text-xs text-amber-950 space-y-1.5 list-disc list-inside">
                {drillDownModal.actionableInsights.map((insight, idx) => (
                  <li key={idx} className="leading-relaxed">{insight}</li>
                ))}
              </ul>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDrillDownModal(null)}
                className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Target & Budget Configuration Modal */}
      <MonthlyTargetModal
        isOpen={isMonthlyTargetModalOpen}
        onClose={() => setIsMonthlyTargetModalOpen(false)}
        selectedMonth={selectedMonth}
        onSelectMonth={(m) => setSelectedMonth(m)}
        monthlyTargets={monthlyTargets}
        onSaveTarget={handleSaveMonthlyTarget}
        onResetToDefaults={handleResetMonthlyTargetToDefaults}
      />
    </div>
  );
};
