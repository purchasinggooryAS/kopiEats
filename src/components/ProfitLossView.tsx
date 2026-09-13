import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Percent,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { ProfitLossReport } from '../types';
import { formatIDR } from '../utils/financialCalculations';

interface ProfitLossViewProps {
  pnl: ProfitLossReport;
}

export const ProfitLossView: React.FC<ProfitLossViewProps> = ({ pnl }) => {
  const [activePeriod, setActivePeriod] = useState('Bulan Ini (September 2026)');

  const totalRev = pnl.revenue?.totalNetRevenue || 1;
  const getPct = (val: number) => (((val || 0) / totalRev) * 100).toFixed(1) + '%';

  const handleExportCSV = () => {
    const rows = [
      ['LAPORAN LABA RUGI (PROFIT & LOSS STATEMENT) - KOPI & EATERY'],
      ['Periode: ' + pnl.period],
      [''],
      ['Komponen Akun', 'Nominal (IDR)', '% Terhadap Omset'],
      ['PENDAPATAN USAHA (REVENUE)', '', ''],
      ['  Penjualan Coffee & Beverages', pnl.revenue.coffeeAndBeverages, getPct(pnl.revenue.coffeeAndBeverages)],
      ['  Penjualan Kitchen & Eatery', pnl.revenue.kitchenAndEatery, getPct(pnl.revenue.kitchenAndEatery)],
      ['  Penjualan Pastry & Bakery', pnl.revenue.pastryAndBakery, getPct(pnl.revenue.pastryAndBakery)],
      ['  Penjualan Merchandise & Beans', pnl.revenue.merchandiseAndBeans, getPct(pnl.revenue.merchandiseAndBeans)],
      ['  Pendapatan Online Delivery', pnl.revenue.deliveryPlatforms, getPct(pnl.revenue.deliveryPlatforms)],
      ['  Diskon Penjualan', -pnl.revenue.discounts, getPct(pnl.revenue.discounts)],
      ['TOTAL PENDAPATAN BERSIH', pnl.revenue.totalNetRevenue, '100.0%'],
      [''],
      ['BEBAN POKOK PENJUALAN (HPP / COGS)', '', ''],
      ['  Bahan Baku Biji Kopi (Beans)', pnl.cogs.coffeeBeans, getPct(pnl.cogs.coffeeBeans)],
      ['  Susu Segar & Dairy Products', pnl.cogs.dairyAndMilk, getPct(pnl.cogs.dairyAndMilk)],
      ['  Bahan Baku Makanan Kitchen', pnl.cogs.kitchenFoodIngredients, getPct(pnl.cogs.kitchenFoodIngredients)],
      ['  Sirup, Powder & Topping', pnl.cogs.syrupsAndPowders, getPct(pnl.cogs.syrupsAndPowders)],
      ['  Kemasan, Cup & Packaging', pnl.cogs.packagingAndDisposables, getPct(pnl.cogs.packagingAndDisposables)],
      ['TOTAL HPP / COGS', pnl.cogs.totalCogs, getPct(pnl.cogs.totalCogs)],
      [''],
      ['LABA KOTOR (GROSS PROFIT)', pnl.grossProfit, getPct(pnl.grossProfit)],
      [''],
      ['BEBAN OPERASIONAL (OPEX)', '', ''],
      ['  Gaji Barista & Kitchen Staff', pnl.opex.salariesAndLabor, getPct(pnl.opex.salariesAndLabor)],
      ['  Sewa Tempat / Ruko', pnl.opex.rentAndProperty, getPct(pnl.opex.rentAndProperty)],
      ['  Listrik PLN & Air PDAM', pnl.opex.utilitiesElectricWater, getPct(pnl.opex.utilitiesElectricWater)],
      ['  Gas LPG Kitchen', pnl.opex.kitchenGasLpg, getPct(pnl.opex.kitchenGasLpg)],
      ['  Software POS & Wi-Fi Kafe', pnl.opex.posAndWifiTech, getPct(pnl.opex.posAndWifiTech)],
      ['  Pemasaran & Media Sosial', pnl.opex.marketingAndSocial, getPct(pnl.opex.marketingAndSocial)],
      ['  Perawatan Mesin Espresso', pnl.opex.repairsAndEspressoService, getPct(pnl.opex.repairsAndEspressoService)],
      ['  Kebersihan & Supplies', pnl.opex.cleaningAndSupplies, getPct(pnl.opex.cleaningAndSupplies)],
      ['  Komisi Delivery Platform', pnl.opex.deliveryCommissions, getPct(pnl.opex.deliveryCommissions)],
      ['TOTAL BEBAN OPERASIONAL', pnl.opex.totalOpex, getPct(pnl.opex.totalOpex)],
      [''],
      ['EBITDA', pnl.ebitda, getPct(pnl.ebitda)],
      ['Beban Depresiasi Mesin & Fit-out', pnl.depreciation, getPct(pnl.depreciation)],
      ['LABA OPERASIONAL', pnl.operatingProfit, getPct(pnl.operatingProfit)],
      ['Pajak PPh Final UMKM (0.5%)', pnl.netIncomeTax, '0.5%'],
      ['LABA BERSIH SETELAH PAJAK (NET PROFIT)', pnl.netProfit, getPct(pnl.netProfit)]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Laba_Rugi_KopiEats_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-stone-900">Laporan Laba Rugi (Profit & Loss Statement)</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Format standar akuntansi F&B Indonesia untuk Coffee Shop & Eatery / Bistro
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-xs text-stone-700">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>{activePeriod}</span>
          </div>

          <button
            id="btn-export-pnl-csv"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {/* Main Statement Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 bg-stone-50/70 border-b border-stone-200 flex items-center justify-between">
          <div className="text-xs font-semibold text-stone-700">RINCIAN AKUN LABA RUGI</div>
          <div className="flex items-center space-x-8 text-xs font-semibold text-stone-600">
            <span>NOMINAL (IDR)</span>
            <span className="w-16 text-right">% OMSET</span>
          </div>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {/* SECTION 1: REVENUE */}
          <div className="p-4 bg-stone-50/40">
            <div className="flex justify-between items-center font-bold text-stone-900 mb-2">
              <span className="text-sm">I. PENDAPATAN USAHA (REVENUE)</span>
            </div>

            <div className="space-y-1.5 pl-3">
              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Penjualan Coffee & Beverages (Espresso, Latte, Manual Brew, Tea)</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.revenue.coffeeAndBeverages)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.revenue.coffeeAndBeverages)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Penjualan Kitchen & Eatery (Pasta, Rice Bowls, Toast, Snacks)</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.revenue.kitchenAndEatery)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.revenue.kitchenAndEatery)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Penjualan Pastry & Bakery (Croissant, Cookies, Slice Cake)</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.revenue.pastryAndBakery)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.revenue.pastryAndBakery)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Pendapatan Online Delivery (GoFood, GrabFood, ShopeeFood)</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.revenue.deliveryPlatforms)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.revenue.deliveryPlatforms)}</span>
                </div>
              </div>

              {pnl.revenue.discounts > 0 && (
                <div className="flex justify-between items-center text-red-600 py-1">
                  <span>Potongan Harga & Promo Diskon Kasir</span>
                  <div className="flex items-center space-x-8 font-mono">
                    <span>- {formatIDR(pnl.revenue.discounts)}</span>
                    <span className="w-16 text-right">-{getPct(pnl.revenue.discounts)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-stone-200 flex justify-between items-center font-bold text-stone-900">
              <span>TOTAL PENDAPATAN BERSIH (NET REVENUE)</span>
              <div className="flex items-center space-x-8 font-mono text-sm">
                <span className="text-emerald-800">{formatIDR(pnl.revenue.totalNetRevenue)}</span>
                <span className="w-16 text-right text-stone-700">100.0%</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: COGS / HPP */}
          <div className="p-4">
            <div className="flex justify-between items-center font-bold text-stone-900 mb-2">
              <span className="text-sm">II. BEBAN POKOK PENJUALAN (HPP / COGS)</span>
            </div>

            <div className="space-y-1.5 pl-3">
              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Biji Kopi (Roasted Beans Arabica House Blend & Single Origin)</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.cogs.coffeeBeans)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.cogs.coffeeBeans)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Susu & Dairy (Fresh Milk Greenfields/Diamond, Oat Milk Oatside)</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.cogs.dairyAndMilk)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.cogs.dairyAndMilk)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Bahan Baku Makanan Dapur (Daging, Unggas, Telur, Sayuran Segar)</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.cogs.kitchenFoodIngredients)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.cogs.kitchenFoodIngredients)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Sirup, Powder Minuman & Topping (Monin, Matcha, Coklat)</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.cogs.syrupsAndPowders)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.cogs.syrupsAndPowders)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Kemasan & Disposables (Cup 16oz, Lid, Sedotan Kertas, Paper Bag)</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.cogs.packagingAndDisposables)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.cogs.packagingAndDisposables)}</span>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-stone-200 flex justify-between items-center font-bold text-amber-900">
              <span>TOTAL HPP / COGS</span>
              <div className="flex items-center space-x-8 font-mono text-sm">
                <span>{formatIDR(pnl.cogs.totalCogs)}</span>
                <span className="w-16 text-right">{getPct(pnl.cogs.totalCogs)}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: GROSS PROFIT */}
          <div className="p-4 bg-amber-50/50">
            <div className="flex justify-between items-center font-bold text-amber-950">
              <span className="text-sm">III. LABA KOTOR (GROSS PROFIT)</span>
              <div className="flex items-center space-x-8 font-mono text-base font-bold">
                <span className="text-stone-900">{formatIDR(pnl.grossProfit)}</span>
                <span className="w-16 text-right text-amber-800">{(pnl?.grossMarginPercent ?? 0).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-[11px] text-amber-800 mt-1">
              Margin Kotor: {(pnl?.grossMarginPercent ?? 0).toFixed(1)}% (Benchmark industri coffee & eatery sehat: 65% - 72%)
            </p>
          </div>

          {/* SECTION 4: OPEX */}
          <div className="p-4">
            <div className="flex justify-between items-center font-bold text-stone-900 mb-2">
              <span className="text-sm">IV. BEBAN OPERASIONAL (OPERATING EXPENSES)</span>
            </div>

            <div className="space-y-1.5 pl-3">
              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Gaji & Upah Karyawan (Barista, Kitchen Cook, Kasir)</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.opex.salariesAndLabor)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.opex.salariesAndLabor)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Sewa Tempat / Ruko & Biaya Pengelolaan Gedung (IPL)</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.opex.rentAndProperty)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.opex.rentAndProperty)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Utilitas: Listrik PLN & Tagihan Air PDAM Kafe</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.opex.utilitiesElectricWater)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.opex.utilitiesElectricWater)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Gas LPG Kitchen (Bright Gas 12kg)</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.opex.kitchenGasLpg)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.opex.kitchenGasLpg)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Software POS Kasir, Internet Wi-Fi 100Mbps & Musik Royalty</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.opex.posAndWifiTech)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.opex.posAndWifiTech)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Pemasaran, Instagram Ads & Review Food Blogger</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.opex.marketingAndSocial)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.opex.marketingAndSocial)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Servis Mesin Espresso, Gasket & Pemeliharaan Peralatan</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.opex.repairsAndEspressoService)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.opex.repairsAndEspressoService)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Kebersihan, Sabun Cuci, Kantong Sampah & Operasional Toko</span>
                <div className="flex items-center space-x-8 font-mono">
                  <span>{formatIDR(pnl.opex.cleaningAndSupplies)}</span>
                  <span className="w-16 text-right text-stone-500">{getPct(pnl.opex.cleaningAndSupplies)}</span>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-stone-200 flex justify-between items-center font-bold text-stone-900">
              <span>TOTAL BEBAN OPERASIONAL (OPEX)</span>
              <div className="flex items-center space-x-8 font-mono text-sm">
                <span>{formatIDR(pnl.opex.totalOpex)}</span>
                <span className="w-16 text-right">{getPct(pnl.opex.totalOpex)}</span>
              </div>
            </div>
          </div>

          {/* SECTION 5: EBITDA & DEPRECIATION */}
          <div className="p-4 bg-stone-50/40">
            <div className="flex justify-between items-center font-bold text-stone-900 py-1">
              <span>V. EBITDA (Laba Sebelum Bunga, Pajak & Depresiasi)</span>
              <div className="flex items-center space-x-8 font-mono">
                <span>{formatIDR(pnl.ebitda)}</span>
                <span className="w-16 text-right">{getPct(pnl.ebitda)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-stone-600 py-1 pl-3">
              <span>Beban Penyusutan / Depresiasi Mesin & Fit-out (Straight Line)</span>
              <div className="flex items-center space-x-8 font-mono">
                <span>- {formatIDR(pnl.depreciation)}</span>
                <span className="w-16 text-right text-stone-500">-{getPct(pnl.depreciation)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center font-bold text-stone-900 pt-2 border-t border-stone-200">
              <span>VI. LABA OPERASIONAL SEBELUM PAJAK</span>
              <div className="flex items-center space-x-8 font-mono">
                <span>{formatIDR(pnl.operatingProfit)}</span>
                <span className="w-16 text-right">{getPct(pnl.operatingProfit)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-stone-600 py-1 pl-3">
              <span>Pajak Penghasilan PPh Final UMKM PP 55/2022 (0.5%)</span>
              <div className="flex items-center space-x-8 font-mono">
                <span>- {formatIDR(pnl.netIncomeTax)}</span>
                <span className="w-16 text-right text-stone-500">0.5%</span>
              </div>
            </div>
          </div>

          {/* FINAL BOTTOM LINE: NET PROFIT */}
          <div className="p-5 bg-emerald-50/80 border-t-2 border-emerald-500">
            <div className="flex justify-between items-center font-bold text-emerald-950">
              <div>
                <div className="text-base font-extrabold tracking-tight">
                  VII. LABA BERSIH SETELAH PAJAK (NET PROFIT)
                </div>
                <div className="text-xs font-normal text-emerald-800">
                  Laba bersih periode berjalan yang dapat diatribusikan ke Ekuitas Pemilik
                </div>
              </div>
              <div className="flex items-center space-x-8 font-mono text-xl font-bold">
                <span className="text-emerald-900">{formatIDR(pnl.netProfit)}</span>
                <span className="w-16 text-right text-emerald-700 text-base">{(pnl?.netMarginPercent ?? 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
