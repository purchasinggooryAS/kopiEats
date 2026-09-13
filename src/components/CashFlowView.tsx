import React from 'react';
import {
  ArrowLeftRight,
  Download,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { CashFlowReport } from '../types';
import { formatIDR } from '../utils/financialCalculations';

interface CashFlowViewProps {
  cashFlow: CashFlowReport;
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({ cashFlow }) => {
  const handleExportCSV = () => {
    const rows = [
      ['LAPORAN ARUS KAS (CASH FLOW STATEMENT) - KOPI & EATERY'],
      ['Periode: ' + cashFlow.period],
      [''],
      ['AKTIVITAS ARUS KAS', 'NOMINAL (IDR)'],
      ['I. ARUS KAS DARI AKTIVITAS OPERASIONAL', ''],
      ['  Penerimaan Kas dari Penjualan (Cash & QRIS)', cashFlow.operatingActivities.cashFromSalesAndCustomers],
      ['  Pembayaran Kas ke Supplier Bahan Baku', -cashFlow.operatingActivities.cashPaidToSuppliers],
      ['  Pembayaran Gaji & Upah Karyawan', -cashFlow.operatingActivities.cashPaidToStaff],
      ['  Pembayaran Beban Operasional & Utilitas', -cashFlow.operatingActivities.cashPaidForOperatingExpenses],
      ['  Pembayaran Pajak Usaha', -cashFlow.operatingActivities.cashPaidForTaxes],
      ['ARUS KAS BERSIH DARI AKTIVITAS OPERASIONAL', cashFlow.operatingActivities.netCashFromOperations],
      [''],
      ['II. ARUS KAS DARI AKTIVITAS INVESTASI', ''],
      ['  Pembelian Peralatan / Mesin Espresso Baru', cashFlow.investingActivities.purchaseOfEquipmentAndAssets],
      ['  Biaya Renovasi & Fitout Bar', cashFlow.investingActivities.renovationExpenses],
      ['ARUS KAS BERSIH DARI AKTIVITAS INVESTASI', cashFlow.investingActivities.netCashFromInvesting],
      [''],
      ['III. ARUS KAS DARI AKTIVITAS PENDANAAN', ''],
      ['  Setoran Modal Tambahan Pemilik', cashFlow.financingActivities.ownerCapitalContributions],
      ['  Penarikan Prive / Dividen Pemilik', -cashFlow.financingActivities.ownerDrawingsOrDividends],
      ['  Pembayaran Pokok Pinjaman Mesin', -cashFlow.financingActivities.loanProceedsOrRepayments],
      ['ARUS KAS BERSIH DARI AKTIVITAS PENDANAAN', cashFlow.financingActivities.netCashFromFinancing],
      [''],
      ['KENAIKAN (PENURUNAN) BERSIH KAS', cashFlow.netChangeInCash],
      ['Saldo Kas Awal Periode', cashFlow.beginningCash],
      ['SALDO KAS AKHIR PERIODE', cashFlow.endingCash]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Arus_Kas_KopiEats_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-stone-900">Laporan Arus Kas (Cash Flow Statement)</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Metode Langsung (Direct Method) memantau pergerakan uang riil masuk dan keluar
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 text-xs font-semibold">
            <Wallet className="w-4 h-4 text-stone-600" />
            <span>Kas Akhir: {formatIDR(cashFlow.endingCash)}</span>
          </div>

          <button
            id="btn-export-cf-csv"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {/* Main Cash Flow Box */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 bg-stone-50/70 border-b border-stone-200 flex items-center justify-between">
          <div className="text-xs font-semibold text-stone-700">AKTIVITAS ARUS KAS</div>
          <div className="text-xs font-semibold text-stone-600">NOMINAL (IDR)</div>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {/* 1. OPERATING ACTIVITIES */}
          <div className="p-4 bg-stone-50/30">
            <div className="flex justify-between items-center font-bold text-stone-900 mb-2">
              <span className="text-sm">I. ARUS KAS DARI AKTIVITAS OPERASIONAL</span>
            </div>

            <div className="space-y-1.5 pl-3">
              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Penerimaan Kas dari Penjualan (Tunai Kasir & Settlement QRIS)</span>
                <span className="font-mono text-emerald-700 font-semibold">
                  + {formatIDR(cashFlow.operatingActivities.cashFromSalesAndCustomers)}
                </span>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Pembayaran Kas ke Supplier Bahan Baku (Biji Kopi, Susu, Makanan)</span>
                <span className="font-mono text-red-600">
                  - {formatIDR(cashFlow.operatingActivities.cashPaidToSuppliers)}
                </span>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Pembayaran Kas Gaji Barista & Kitchen Staff</span>
                <span className="font-mono text-red-600">
                  - {formatIDR(cashFlow.operatingActivities.cashPaidToStaff)}
                </span>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Pembayaran Kas Beban Operasional, Sewa & Utilitas (PLN, Gas, POS)</span>
                <span className="font-mono text-red-600">
                  - {formatIDR(cashFlow.operatingActivities.cashPaidForOperatingExpenses)}
                </span>
              </div>

              {cashFlow.operatingActivities.cashPaidForTaxes > 0 && (
                <div className="flex justify-between items-center text-stone-700 py-1">
                  <span>Pembayaran Kas Pajak Penghasilan UMKM</span>
                  <span className="font-mono text-red-600">
                    - {formatIDR(cashFlow.operatingActivities.cashPaidForTaxes)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-stone-200 flex justify-between items-center font-bold text-stone-900">
              <span>ARUS KAS BERSIH DARI OPERASIONAL</span>
              <span className="font-mono text-sm text-emerald-800">
                {formatIDR(cashFlow.operatingActivities.netCashFromOperations)}
              </span>
            </div>
          </div>

          {/* 2. INVESTING ACTIVITIES */}
          <div className="p-4">
            <div className="flex justify-between items-center font-bold text-stone-900 mb-2">
              <span className="text-sm">II. ARUS KAS DARI AKTIVITAS INVESTASI</span>
            </div>

            <div className="space-y-1.5 pl-3">
              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Pembelian Peralatan / Mesin Espresso Baru (Grinder Single Dose)</span>
                <span className="font-mono text-stone-900">
                  {cashFlow.investingActivities.purchaseOfEquipmentAndAssets > 0
                    ? `- ${formatIDR(cashFlow.investingActivities.purchaseOfEquipmentAndAssets)}`
                    : 'Rp 0'}
                </span>
              </div>

              {cashFlow.investingActivities.renovationExpenses > 0 && (
                <div className="flex justify-between items-center text-stone-700 py-1">
                  <span>Biaya Renovasi & Fitout Bar</span>
                  <span className="font-mono text-red-600">
                    - {formatIDR(cashFlow.investingActivities.renovationExpenses)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-stone-200 flex justify-between items-center font-bold text-stone-900">
              <span>ARUS KAS BERSIH DARI INVESTASI</span>
              <span className="font-mono text-sm text-stone-800">
                {formatIDR(cashFlow.investingActivities.netCashFromInvesting)}
              </span>
            </div>
          </div>

          {/* 3. FINANCING ACTIVITIES */}
          <div className="p-4 bg-stone-50/30">
            <div className="flex justify-between items-center font-bold text-stone-900 mb-2">
              <span className="text-sm">III. ARUS KAS DARI AKTIVITAS PENDANAAN</span>
            </div>

            <div className="space-y-1.5 pl-3">
              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Setoran Modal Tambahan Pemilik</span>
                <span className="font-mono text-stone-700">
                  {cashFlow.financingActivities.ownerCapitalContributions > 0
                    ? `+ ${formatIDR(cashFlow.financingActivities.ownerCapitalContributions)}`
                    : 'Rp 0'}
                </span>
              </div>

              <div className="flex justify-between items-center text-stone-700 py-1">
                <span>Pembayaran Angsuran Pokok Pinjaman Mesin</span>
                <span className="font-mono text-red-600">
                  - {formatIDR(cashFlow.financingActivities.loanProceedsOrRepayments)}
                </span>
              </div>

              {cashFlow.financingActivities.ownerDrawingsOrDividends > 0 && (
                <div className="flex justify-between items-center text-stone-700 py-1">
                  <span>Penarikan Prive / Dividen Pemilik</span>
                  <span className="font-mono text-red-600">
                    - {formatIDR(cashFlow.financingActivities.ownerDrawingsOrDividends)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-stone-200 flex justify-between items-center font-bold text-stone-900">
              <span>ARUS KAS BERSIH DARI PENDANAAN</span>
              <span className="font-mono text-sm text-stone-800">
                {formatIDR(cashFlow.financingActivities.netCashFromFinancing)}
              </span>
            </div>
          </div>

          {/* SUMMARY RECONCILIATION */}
          <div className="p-5 bg-purple-50/60 border-t border-purple-200 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-purple-950">
              <span>KENAIKAN (PENURUNAN) BERSIH KAS</span>
              <span className="font-mono text-sm font-bold">
                {cashFlow.netChangeInCash >= 0 ? '+' : ''}
                {formatIDR(cashFlow.netChangeInCash)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-stone-600">
              <span>Saldo Kas Awal Periode</span>
              <span className="font-mono font-semibold">{formatIDR(cashFlow.beginningCash)}</span>
            </div>

            <div className="pt-2 border-t border-purple-200 flex justify-between items-center text-sm font-extrabold text-purple-950">
              <span>SALDO KAS AKHIR PERIODE (REKONSILIASI KAS & BANK)</span>
              <span className="font-mono text-base text-purple-900">{formatIDR(cashFlow.endingCash)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
