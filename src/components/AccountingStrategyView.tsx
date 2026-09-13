import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Coffee,
  Utensils,
  Percent,
  RefreshCw,
  Award,
  HelpCircle
} from 'lucide-react';
import {
  ProfitLossReport,
  FnBStrategicMetrics,
  AIStrategyResponse
} from '../types';
import { formatIDR } from '../utils/financialCalculations';

interface AccountingStrategyViewProps {
  pnl: ProfitLossReport;
  metrics: FnBStrategicMetrics;
  groqApiKey?: string;
}

export const AccountingStrategyView: React.FC<AccountingStrategyViewProps> = ({
  pnl,
  metrics,
  groqApiKey
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<AIStrategyResponse | null>(null);

  // Default AI strategic baseline
  const defaultAdvice: AIStrategyResponse = {
    healthStatus: (metrics?.primeCostRatio ?? 0) <= 60 ? 'HEALTHY' : 'WARNING',
    primeCostStatus: `Prime Cost tercatat ${(metrics?.primeCostRatio ?? 0).toFixed(1)}% (Ambang batas aman F&B Coffee & Resto: < 60%)`,
    keyFindings: [
      `Beverage Cost berada di level ${(metrics?.beverageCostRatio ?? 0).toFixed(1)}% — pantau rasio susu dan waste steaming barista saat shift sibuk.`,
      `Food Cost Kitchen berada di level ${(metrics?.foodCostRatio ?? 0).toFixed(1)}% — lakukan audit gramasi daging ayam & keju mozzarella secara berkala.`,
      `Labor Cost menyerap ${(metrics?.laborCostRatio ?? 0).toFixed(1)}% omset — pertahankan efisiensi dengan shift split saat peak hours sore-malam.`
    ],
    strategicRecommendations: [
      {
        area: 'HPP / Food Cost',
        action: 'Standarisasi resep espresso (18g in, 36g out) dan gunakan milk pitcher bertanda takaran 120ml untuk iced latte guna mencegah susu terbuang.',
        expectedImpact: 'Dapat menghemat HPP susu hingga 5% - 8% per bulan.'
      },
      {
        area: 'Menu Pricing & Engineering',
        action: 'Terapkan strategi bundling "Kopi Susu Senja + Croissant Butter" dengan harga paket Rp 39.000 pada jam sepi (08.00 - 11.00).',
        expectedImpact: 'Meningkatkan Average Ticket Size dan omset pagi hari sebesar 18%.'
      },
      {
        area: 'Cash Flow & Working Capital',
        action: 'Gunakan fasilitas tempo pembayaran 14-21 hari dari supplier roastery kopi dan distributor sirup Monin.',
        expectedImpact: 'Mempertahankan saldo kas kasir tetap aman untuk kebutuhan darurat operasional.'
      }
    ],
    dailyTargetTip: `Target harian kafe: Jual minimal ${metrics.dailyTargetCups} cup/pesanan (rata-rata ${formatIDR(metrics.averageTicketSize)}) untuk mencapai titik impas harian ${formatIDR(metrics.dailyBEPRevenue)}.`
  };

  const currentAdvice = aiAdvice || defaultAdvice;

  const handleGenerateAiStrategy = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics,
          groqApiKey: groqApiKey || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Gagal mendapatkan analisa AI');
      }

      const data = await response.json();
      setAiAdvice(data);
    } catch (err) {
      console.warn('AI analysis fallback used:', err);
      setAiAdvice(defaultAdvice);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-850 border border-stone-800 rounded-2xl p-6 text-stone-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              F&B Accounting Intelligence
            </span>
            <span className="text-xs text-stone-400">Coffee & Resto Financial Benchmarks</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-stone-50 mt-1">
            Analisis Strategi Keuangan & Penasihat AI
          </h1>
          <p className="text-xs text-stone-300 max-w-2xl mt-1">
            Panduan strategis tim accounting untuk mengoptimalkan margin kotor, mengendalikan Prime Cost (HPP + Labor), dan memitigasi kebocoran bahan baku.
          </p>
        </div>

        <button
          onClick={handleGenerateAiStrategy}
          disabled={isAnalyzing}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-xs disabled:opacity-50 transition-colors"
        >
          <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Menganalisis Angka...' : 'Jalankan Analisa AI Baru'}</span>
        </button>
      </div>

      {/* Benchmark Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Prime Cost */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-600">Prime Cost Ratio</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              (metrics?.primeCostRatio ?? 0) <= 60 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {(metrics?.primeCostRatio ?? 0) <= 60 ? 'AMAN' : 'TINGGI'}
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">
            {(metrics?.primeCostRatio ?? 0).toFixed(1)}%
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Standar F&B: <span className="font-medium text-stone-700">Maksimal 60.0%</span>
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            HPP ({formatIDR(metrics?.cogsTotal ?? 0)}) + Gaji ({formatIDR(metrics?.laborCostTotal ?? 0)})
          </div>
        </div>

        {/* Beverage Cost */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-600">Beverage Cost Ratio</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              (metrics?.beverageCostRatio ?? 0) <= 22 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {(metrics?.beverageCostRatio ?? 0) <= 22 ? 'IDEAL' : 'PERIKSA'}
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">
            {(metrics?.beverageCostRatio ?? 0).toFixed(1)}%
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Standar Kafe Kopi: <span className="font-medium text-stone-700">15% - 22%</span>
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            Beans kopi, susu segar, syrup & topping
          </div>
        </div>

        {/* Food Cost */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-600">Food Cost Ratio (Eatery)</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              (metrics?.foodCostRatio ?? 0) <= 35 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {(metrics?.foodCostRatio ?? 0) <= 35 ? 'SEHAT' : 'TINGGI'}
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">
            {(metrics?.foodCostRatio ?? 0).toFixed(1)}%
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Standar Resto: <span className="font-medium text-stone-700">28% - 35%</span>
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            Daging, ayam, beras, sayuran & bumbu
          </div>
        </div>

        {/* Labor Cost */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-600">Labor Cost Ratio</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              SEHAT
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">
            {(metrics?.laborCostRatio ?? 0).toFixed(1)}%
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Standar Kafe/Resto: <span className="font-medium text-stone-700">20% - 28%</span>
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            Upah 6 staff barista, cook & kasir
          </div>
        </div>
      </div>

      {/* AI Strategy Advisor Section */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Hasil Analisa & Rekomendasi Strategis AI</h2>
              <p className="text-xs text-stone-500">Evaluasi otomatis data P&L, Neraca, dan Arus Kas berjalan</p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            currentAdvice.healthStatus === 'HEALTHY' || currentAdvice.healthStatus === 'EXCELLENT'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            Kondisi Usaha: {currentAdvice.healthStatus}
          </span>
        </div>

        {/* Key Findings */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
          <div className="text-xs font-bold text-stone-900 uppercase tracking-wide">
            Temuan Kunci Finansial (Key Findings):
          </div>
          <ul className="space-y-1.5 pl-4 text-xs text-stone-700 list-disc">
            {currentAdvice.keyFindings.map((finding, idx) => (
              <li key={idx} className="leading-relaxed">{finding}</li>
            ))}
          </ul>
        </div>

        {/* Strategic Actions Grid */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-stone-900 uppercase tracking-wide">
            Langkah Aksi Konkret Tim Accounting & Manajemen:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentAdvice.strategicRecommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-xl border border-stone-200 bg-white space-y-2 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 mb-1.5">
                    {rec.area}
                  </span>
                  <p className="text-xs text-stone-800 font-medium leading-relaxed">
                    {rec.action}
                  </p>
                </div>
                <div className="pt-2 border-t border-stone-100 text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span>Dampak: {rec.expectedImpact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Target Advice Tip */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start space-x-3">
          <Coffee className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Instruksi Target Operasional Kasir & Supervisor:</span>
            <p className="text-amber-900 leading-relaxed">{currentAdvice.dailyTargetTip}</p>
          </div>
        </div>
      </div>

      {/* Menu Engineering (BCG Matrix for Restaurant) */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-stone-900">Matriks Menu Engineering F&B</h2>
          <p className="text-xs text-stone-500">
            Klasifikasi menu berdasarkan Margin Laba Kotor vs Popularitas Penjualan di Coffee Shop & Eatery
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Stars */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex justify-between items-center font-bold text-emerald-950">
              <span className="flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>1. STARS (BINTANG) — Margin Tinggi & Laris</span>
              </span>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-bold">
                PRIORITAS UTAMA
              </span>
            </div>
            <p className="text-stone-600 text-[11px]">
              Menu: <span className="font-semibold text-stone-800">Signature Iced Palm Sugar Latte, Iced Caramel Macchiato, Truffle Cheese Fries</span>.
            </p>
            <p className="text-stone-700 font-medium text-[11px]">
              Aksi: Jaga konsistensi rasa, pertahankan lokasi menu di eye-level display kasir, dan jadikan menu unggulan media sosial.
            </p>
          </div>

          {/* Plowhorses */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
            <div className="flex justify-between items-center font-bold text-blue-950">
              <span className="flex items-center space-x-1.5">
                <Coffee className="w-4 h-4 text-blue-700" />
                <span>2. PLOWHORSES (KUDA PENARIK) — Margin Rendah & Laris</span>
              </span>
              <span className="text-[10px] bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded font-bold">
                OPTIMASI HPP
              </span>
            </div>
            <p className="text-stone-600 text-[11px]">
              Menu: <span className="font-semibold text-stone-800">Iced Americano, Nasi Goreng Spesial Telur, French Fries Reguler</span>.
            </p>
            <p className="text-stone-700 font-medium text-[11px]">
              Aksi: Naikkan harga secara bertahap Rp 1.500 - Rp 2.500 atau negosiasi ulang harga bahan baku dengan supplier telur & kentang beku.
            </p>
          </div>

          {/* Puzzles */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex justify-between items-center font-bold text-amber-950">
              <span className="flex items-center space-x-1.5">
                <Utensils className="w-4 h-4 text-amber-700" />
                <span>3. PUZZLES (TEKA-TEKI) — Margin Tinggi & Kurang Laris</span>
              </span>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-bold">
                PROMOSI & UPSELLING
              </span>
            </div>
            <p className="text-stone-600 text-[11px]">
              Menu: <span className="font-semibold text-stone-800">Creamy Truffle Pasta, Artisan Cascara Tea, Salmon Toast</span>.
            </p>
            <p className="text-stone-700 font-medium text-[11px]">
              Aksi: Latih barista dan waitstaff untuk merekomendasikan menu ini saat pelanggan ragu memilih (suggestive selling).
            </p>
          </div>

          {/* Dogs */}
          <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 space-y-2">
            <div className="flex justify-between items-center font-bold text-stone-800">
              <span className="flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-stone-500" />
                <span>4. DOGS (BEBAN) — Margin Rendah & Kurang Laris</span>
              </span>
              <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-bold">
                ELIMINASI
              </span>
            </div>
            <p className="text-stone-600 text-[11px]">
              Menu: <span className="font-semibold text-stone-800">Jus Buah Segar Musiman, Risotto Jamur Kering</span>.
            </p>
            <p className="text-stone-700 font-medium text-[11px]">
              Aksi: Hapus menu ini dari daftar pesanan untuk menghemat ruang chiller, menghindari risiko buah busuk, dan menyederhanakan stok dapur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
