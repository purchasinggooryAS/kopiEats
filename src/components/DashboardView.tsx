import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Coffee,
  Utensils,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  MessageSquare,
  Building2,
  Users,
  Camera,
  BarChart3,
  FileSpreadsheet,
  ExternalLink,
  Link2,
  Edit3,
  Check,
  Copy,
  RefreshCw
} from 'lucide-react';
import {
  ProfitLossReport,
  BalanceSheetReport,
  FnBStrategicMetrics,
  Transaction
} from '../types';
import { formatIDR } from '../utils/financialCalculations';

interface DashboardViewProps {
  pnl: ProfitLossReport;
  balanceSheet: BalanceSheetReport;
  metrics: FnBStrategicMetrics;
  recentTransactions: Transaction[];
  onNavigateToTab: (tab: string) => void;
  onOpenQuickWAParser: () => void;
  googleSheetUrl?: string;
  onUpdateGoogleSheetUrl?: (url: string) => void;
  onTriggerSync?: () => Promise<void>;
  isSyncing?: boolean;
  isAppScriptConfigured?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pnl,
  balanceSheet,
  metrics,
  recentTransactions,
  onNavigateToTab,
  onOpenQuickWAParser,
  googleSheetUrl,
  onUpdateGoogleSheetUrl,
  onTriggerSync,
  isSyncing = false,
  isAppScriptConfigured = false
}) => {
  const isPrimeCostSafe = metrics.primeCostRatio <= 60;
  const isFoodCostSafe = metrics.foodCostRatio <= 35;
  const isBeverageCostSafe = metrics.beverageCostRatio <= 25;

  const [isEditingSheetUrl, setIsEditingSheetUrl] = useState(false);
  const [tempSheetUrl, setTempSheetUrl] = useState(googleSheetUrl || '');
  const [copiedLink, setCopiedLink] = useState(false);

  const effectiveSheetUrl = googleSheetUrl?.trim() || 'https://docs.google.com/spreadsheets';
  const hasCustomSheetUrl = Boolean(googleSheetUrl && googleSheetUrl.trim());

  const handleCopyLink = () => {
    navigator.clipboard.writeText(effectiveSheetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveSheetUrl = () => {
    if (onUpdateGoogleSheetUrl) {
      onUpdateGoogleSheetUrl(tempSheetUrl.trim());
    }
    setIsEditingSheetUrl(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Coffee & Eatery Health & WhatsApp-Groq Status */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-2xl p-5 text-stone-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Live F&B Financial Pulse
            </span>
            <span className="text-xs text-stone-400">Periode: {pnl.period}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-stone-50">
            Kopi & Eatery Senja Rasa — Accounting Dashboard
          </h1>
          <p className="text-xs text-stone-300 max-w-2xl">
            Sistem terintegrasi WhatsApp &rarr; Groq AI &rarr; Google Sheets via Apps Script.
            Seluruh data operasional kasir & barista disinkronkan secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Direct Google Sheets Action Button */}
          <a
            id="dash-open-sheets-header-btn"
            href={effectiveSheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
            title="Buka Google Sheets di tab baru"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Buka Google Sheets</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          <button
            id="dash-scan-receipt-btn"
            onClick={() => onNavigateToTab('receipt-ocr')}
            className="flex items-center justify-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Struk OCR</span>
          </button>
          <button
            id="dash-advanced-reporting-btn"
            onClick={() => onNavigateToTab('advanced-reporting')}
            className="flex items-center justify-center space-x-1.5 bg-teal-700 hover:bg-teal-600 text-white font-semibold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Laporan Interaktif</span>
          </button>
          <button
            id="dash-quick-wa-btn"
            onClick={onOpenQuickWAParser}
            className="flex items-center justify-center space-x-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Hub</span>
          </button>
          <button
            id="dash-view-strategy-btn"
            onClick={() => onNavigateToTab('strategy')}
            className="flex items-center justify-center space-x-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Advisor</span>
          </button>
        </div>
      </div>

      {/* Google Sheets Quick Access & Sync Ribbon */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-stone-900">Google Spreadsheet Keuangan Kafe</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  hasCustomSheetUrl || isAppScriptConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    hasCustomSheetUrl || isAppScriptConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  {hasCustomSheetUrl ? 'Spreadsheet Terhubung' : 'Google Sheets Siap Akses'}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <a
                  id="dash-spreadsheet-inline-link"
                  href={effectiveSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-medium hover:underline truncate max-w-xs sm:max-w-md flex items-center space-x-1"
                  title="Klik untuk langsung membuka Google Sheets"
                >
                  <span>{hasCustomSheetUrl ? effectiveSheetUrl : 'https://docs.google.com/spreadsheets (Buka Google Sheets)'}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
                <button
                  id="dash-copy-sheet-link-btn"
                  onClick={handleCopyLink}
                  className="text-[11px] text-stone-500 hover:text-stone-700 px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 transition-colors flex items-center space-x-1"
                  title="Salin link Google Sheets"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <a
              id="dash-open-sheets-main-btn"
              href={effectiveSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Buka Google Sheets</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {onTriggerSync && (
              <button
                id="dash-sync-sheets-btn"
                onClick={onTriggerSync}
                disabled={isSyncing}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                title="Sinkronkan data saat ini ke Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : 'text-stone-600'}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sync ke Sheets'}</span>
              </button>
            )}

            <button
              id="dash-edit-sheet-url-btn"
              onClick={() => {
                setTempSheetUrl(googleSheetUrl || '');
                setIsEditingSheetUrl(!isEditingSheetUrl);
              }}
              className="flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 hover:text-stone-900 text-xs transition-colors cursor-pointer"
              title="Atur atau ubah link Google Spreadsheet"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{hasCustomSheetUrl ? 'Ubah Link' : 'Atur Link'}</span>
            </button>
          </div>
        </div>

        {/* Inline URL configuration input when expanded */}
        {isEditingSheetUrl && (
          <div className="mt-3 pt-3 border-t border-stone-100 bg-stone-50/80 -mx-4 -mb-4 p-4 rounded-b-2xl space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-stone-800 flex items-center space-x-1.5">
                <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Masukkan Link Google Spreadsheet Kafe Anda:</span>
              </label>
              <a
                href="https://sheets.new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-700 hover:underline flex items-center space-x-1"
              >
                <span>Buat Spreadsheet Baru (sheets.new)</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="input-custom-sheet-url"
                type="url"
                value={tempSheetUrl}
                onChange={(e) => setTempSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0.../edit"
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white font-mono text-stone-900"
              />
              <div className="flex items-center space-x-2">
                <button
                  id="btn-save-custom-sheet-url"
                  onClick={handleSaveSheetUrl}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Link</span>
                </button>
                <button
                  onClick={() => setIsEditingSheetUrl(false)}
                  className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
            <p className="text-[11px] text-stone-500">
              Tips: Buka spreadsheet Google Sheets Anda di tab baru, lalu salin URL browser dan simpan di sini agar dashboard dapat langsung membukanya kapan saja.
            </p>
          </div>
        )}
      </div>

      {/* High-Level Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Net Revenue */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Total Omset Bersih
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-stone-900">
              {formatIDR(pnl.revenue.totalNetRevenue)}
            </div>
            <div className="mt-1 flex items-center text-xs text-stone-500 space-x-1">
              <span className="text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
              </span>
              <span>vs bulan lalu</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between text-[11px] text-stone-500">
            <span>Minuman: {formatIDR(pnl.revenue.coffeeAndBeverages)}</span>
            <span>Makanan: {formatIDR(pnl.revenue.kitchenAndEatery)}</span>
          </div>
        </div>

        {/* Card 2: HPP / Cost of Goods Sold */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              HPP / Beban Pokok (COGS)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-stone-900">
              {formatIDR(pnl.cogs.totalCogs)}
            </div>
            <div className="mt-1 flex items-center space-x-2 text-xs">
              <span className="font-semibold text-stone-800">
                {(100 - (pnl?.grossMarginPercent ?? 0)).toFixed(1)}% dari Omset
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-medium">
                Target 28-35%
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between text-[11px] text-stone-500">
            <span>Beans: {formatIDR(pnl.cogs.coffeeBeans)}</span>
            <span>Dairy/Susu: {formatIDR(pnl.cogs.dairyAndMilk)}</span>
          </div>
        </div>

        {/* Card 3: Prime Cost Gauge (Benchmark F&B < 60%) */}
        <div className={`border rounded-2xl p-5 shadow-xs transition-all ${
          isPrimeCostSafe ? 'bg-white border-stone-200' : 'bg-red-50/50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                Prime Cost (HPP + Labor)
              </span>
            </div>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isPrimeCostSafe ? 'bg-emerald-50 text-emerald-600' : 'bg-red-100 text-red-600'
            }`}>
              {isPrimeCostSafe ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold ${isPrimeCostSafe ? 'text-stone-900' : 'text-red-700'}`}>
                {(metrics?.primeCostRatio ?? 0).toFixed(1)}%
              </span>
              <span className="text-xs text-stone-500">
                ({formatIDR(metrics.primeCostTotal)})
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-stone-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isPrimeCostSafe ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, metrics.primeCostRatio)}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between text-[11px]">
            <span className="text-stone-500">Standar F&B: Max 60%</span>
            <span className={`font-semibold ${isPrimeCostSafe ? 'text-emerald-700' : 'text-red-600'}`}>
              {isPrimeCostSafe ? 'Sehat (Ideal)' : 'Tinggi (Waspada)'}
            </span>
          </div>
        </div>

        {/* Card 4: Net Profit (Laba Bersih) */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Laba Bersih (Net Profit)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-700">
              {formatIDR(pnl.netProfit)}
            </div>
            <div className="mt-1 flex items-center space-x-2 text-xs">
              <span className="font-semibold text-stone-800">
                Net Margin {(pnl?.netMarginPercent ?? 0).toFixed(1)}%
              </span>
              <span className="text-stone-500 text-[11px]">
                setelah PPh Final & Beban
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between text-[11px] text-stone-500">
            <span>EBITDA: {formatIDR(pnl.ebitda)}</span>
            <span>Kasir: {formatIDR(balanceSheet.currentAssets.cashDrawerPettyCash)}</span>
          </div>
        </div>
      </div>

      {/* Main Middle Section: Visual Breakdown & F&B Cost Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Revenue & Cost Structure Breakdown */}
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-stone-900">Struktur Pendapatan & Pengeluaran</h2>
              <p className="text-xs text-stone-500">Distribusi sumber omset dan alokasi modal kerja F&B</p>
            </div>
            <button
              onClick={() => onNavigateToTab('pnl')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
            >
              <span>Detail Laba Rugi</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Revenue Distribution Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-stone-700">Komposisi Penjualan (Total: {formatIDR(pnl.revenue.totalGrossRevenue)})</span>
              <span className="text-stone-500">100%</span>
            </div>
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-stone-100">
              <div
                title="Coffee & Beverages"
                className="bg-amber-600 h-full"
                style={{ width: `${(pnl.revenue.coffeeAndBeverages / (pnl.revenue.totalGrossRevenue || 1)) * 100}%` }}
              />
              <div
                title="Kitchen & Eatery"
                className="bg-emerald-600 h-full"
                style={{ width: `${(pnl.revenue.kitchenAndEatery / (pnl.revenue.totalGrossRevenue || 1)) * 100}%` }}
              />
              <div
                title="Pastry & Bakery"
                className="bg-yellow-500 h-full"
                style={{ width: `${(pnl.revenue.pastryAndBakery / (pnl.revenue.totalGrossRevenue || 1)) * 100}%` }}
              />
              <div
                title="Online Delivery Platforms"
                className="bg-sky-500 h-full"
                style={{ width: `${(pnl.revenue.deliveryPlatforms / (pnl.revenue.totalGrossRevenue || 1)) * 100}%` }}
              />
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-stone-600">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-600 shrink-0" />
                <span className="truncate">Kopi & Minuman ({((pnl.revenue.coffeeAndBeverages / (pnl.revenue.totalGrossRevenue || 1)) * 100).toFixed(0)}%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 shrink-0" />
                <span className="truncate">Kitchen Resto ({((pnl.revenue.kitchenAndEatery / (pnl.revenue.totalGrossRevenue || 1)) * 100).toFixed(0)}%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500 shrink-0" />
                <span className="truncate">Pastry & Cake ({((pnl.revenue.pastryAndBakery / (pnl.revenue.totalGrossRevenue || 1)) * 100).toFixed(0)}%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 shrink-0" />
                <span className="truncate">Delivery Online ({((pnl.revenue.deliveryPlatforms / (pnl.revenue.totalGrossRevenue || 1)) * 100).toFixed(0)}%)</span>
              </div>
            </div>
          </div>

          {/* Key Cost Breakdown Items */}
          <div className="border-t border-stone-100 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-800 flex items-center space-x-1.5">
                  <Coffee className="w-4 h-4 text-amber-600" />
                  <span>Beverage Cost Ratio</span>
                </span>
                <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                  isBeverageCostSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {(metrics?.beverageCostRatio ?? 0).toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Biaya biji kopi, susu segar, oat milk, dan sirup per cup. Standar kafe specialty adalah 15% - 22%.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-800 flex items-center space-x-1.5">
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  <span>Food Cost Ratio (Eatery)</span>
                </span>
                <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                  isFoodCostSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {(metrics?.foodCostRatio ?? 0).toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Biaya bahan baku dapur, daging, sayuran, dan bumbu makanan. Standar resto bistro adalah 28% - 35%.
              </p>
            </div>
          </div>

          {/* Daily Break-Even Point (BEP) Card */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-amber-900 flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-amber-700" />
                <span>Target Break-Even Point (BEP) Harian</span>
              </div>
              <p className="text-xs text-amber-800">
                Untuk menutup sewa, gaji staff, listrik & depresiasi:
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-bold text-amber-950">
                  {formatIDR(metrics.dailyBEPRevenue)} / hari
                </div>
                <div className="text-[11px] text-amber-800">
                  Minimal &plusmn;{metrics.dailyTargetCups} cup kopi / pesanan
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Balance & Cash Summary */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-stone-900">Likuiditas & Kas Aktif</h2>
            </div>
            <button
              onClick={() => onNavigateToTab('balance-sheet')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
            >
              <span>Neraca</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-stone-50 border border-stone-150">
              <div>
                <div className="text-xs font-medium text-stone-900">Kas Kasir (Cash Drawer)</div>
                <div className="text-[11px] text-stone-500">Uang tunai kas kecil harian</div>
              </div>
              <span className="text-sm font-bold text-stone-900">
                {formatIDR(balanceSheet.currentAssets.cashDrawerPettyCash)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-stone-50 border border-stone-150">
              <div>
                <div className="text-xs font-medium text-stone-900">Bank BCA Operasional</div>
                <div className="text-[11px] text-stone-500">Rekening penampungan QRIS & EDC</div>
              </div>
              <span className="text-sm font-bold text-stone-900">
                {formatIDR(balanceSheet.currentAssets.bankAccountBca)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-stone-50 border border-stone-150">
              <div>
                <div className="text-xs font-medium text-stone-900">Bank Mandiri Cadangan</div>
                <div className="text-[11px] text-stone-500">Dana darurat & payroll</div>
              </div>
              <span className="text-sm font-bold text-stone-900">
                {formatIDR(balanceSheet.currentAssets.bankAccountMandiri)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-amber-50/50 border border-amber-100">
              <div>
                <div className="text-xs font-medium text-amber-950">Settlement QRIS Pending</div>
                <div className="text-[11px] text-amber-700">Settlement H+1 masuk rekening</div>
              </div>
              <span className="text-sm font-bold text-amber-950">
                {formatIDR(balanceSheet.currentAssets.qrisSettlementPending)}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">Total Aset Keseluruhan</span>
              <span className="font-bold text-stone-900">{formatIDR(balanceSheet.totalAssets)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">Hutang Supplier (Tempo Beans/Dairy)</span>
              <span className="font-semibold text-amber-700">
                {formatIDR(balanceSheet.currentLiabilities.accountsPayableSuppliers)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">Status Neraca (Balance Check)</span>
              <span className="font-semibold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Seimbang (Balanced)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Feeds from WhatsApp & Ledger */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-stone-900">Transaksi Terbaru & Feed WhatsApp</h2>
            <p className="text-xs text-stone-500">Catatan pengeluaran harian barista, pembelian bahan baku, dan closing kasir</p>
          </div>
          <button
            onClick={() => onNavigateToTab('ledger')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
          >
            <span>Buka Jurnal Lengkap</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Tanggal</th>
                <th className="py-2.5 px-3 font-semibold">Kategori / Akun</th>
                <th className="py-2.5 px-3 font-semibold">Keterangan</th>
                <th className="py-2.5 px-3 font-semibold">Metode</th>
                <th className="py-2.5 px-3 font-semibold">Sumber</th>
                <th className="py-2.5 px-3 font-semibold text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentTransactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono text-stone-600 whitespace-nowrap">{tx.date}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                        : tx.type === 'asset'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200/60'
                        : 'bg-stone-100 text-stone-800 border border-stone-200'
                    }`}>
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-stone-800 max-w-xs truncate" title={tx.description}>
                    {tx.description}
                  </td>
                  <td className="py-3 px-3 text-stone-600 whitespace-nowrap">{tx.paymentMethod}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {tx.source === 'whatsapp' || tx.source === 'groq_ai' ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-200/60">
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp AI</span>
                      </span>
                    ) : (
                      <span className="text-stone-500 capitalize">{tx.source}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold whitespace-nowrap">
                    <span className={tx.type === 'income' ? 'text-emerald-700' : 'text-stone-900'}>
                      {tx.type === 'income' ? '+' : '-'} {formatIDR(tx.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
