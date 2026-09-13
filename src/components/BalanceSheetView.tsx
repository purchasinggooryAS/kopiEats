import React from 'react';
import {
  PieChart,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { BalanceSheetReport } from '../types';
import { formatIDR } from '../utils/financialCalculations';

interface BalanceSheetViewProps {
  balanceSheet: BalanceSheetReport;
}

export const BalanceSheetView: React.FC<BalanceSheetViewProps> = ({ balanceSheet }) => {
  const handleExportCSV = () => {
    const rows = [
      ['NERACA KEUANGAN (BALANCE SHEET) - KOPI & EATERY'],
      ['Per Tanggal: ' + balanceSheet.asOfDate],
      [''],
      ['KOMPONEN ASET', 'NOMINAL (IDR)'],
      ['ASET LANCAR (CURRENT ASSETS)', ''],
      ['  Kas Kasir (Petty Cash)', balanceSheet.currentAssets.cashDrawerPettyCash],
      ['  Rekening Bank BCA Operasional', balanceSheet.currentAssets.bankAccountBca],
      ['  Rekening Bank Mandiri Cadangan', balanceSheet.currentAssets.bankAccountMandiri],
      ['  Settlement QRIS Pending', balanceSheet.currentAssets.qrisSettlementPending],
      ['  Persediaan Bahan Baku (Inventory)', balanceSheet.currentAssets.rawMaterialInventory],
      ['  Sewa Dibayar Dimuka', balanceSheet.currentAssets.prepaidRentAndExpenses],
      ['TOTAL ASET LANCAR', balanceSheet.currentAssets.totalCurrentAssets],
      [''],
      ['ASET TETAP (FIXED ASSETS)', ''],
      ['  Mesin Espresso & Grinder', balanceSheet.fixedAssets.espressoMachineAndGrinders],
      ['  Peralatan Dapur & Kitchen Cookware', balanceSheet.fixedAssets.kitchenHeavyEquipment],
      ['  Perangkat POS, Furniture & Sound', balanceSheet.fixedAssets.posSystemAndFurniture],
      ['  Renovasi Interior & Bar Counter', balanceSheet.fixedAssets.storeRenovationAndInterior],
      ['  Akumulasi Penyusutan (Minus)', -balanceSheet.fixedAssets.accumulatedDepreciation],
      ['TOTAL ASET TETAP', balanceSheet.fixedAssets.totalFixedAssets],
      ['TOTAL ASET', balanceSheet.totalAssets],
      [''],
      ['KEWAJIBAN & EKUITAS', ''],
      ['KEWAJIBAN (LIABILITIES)', ''],
      ['  Hutang Supplier Bahan Baku', balanceSheet.currentLiabilities.accountsPayableSuppliers],
      ['  Hutang Gaji Karyawan', balanceSheet.currentLiabilities.accruedPayrollSalaries],
      ['  Titipan Pajak Resto PB1', balanceSheet.currentLiabilities.unpaidTaxesPb1],
      ['  Pinjaman Pembiayaan Mesin', balanceSheet.longTermLiabilities.equipmentLoans],
      ['TOTAL KEWAJIBAN', balanceSheet.totalLiabilities],
      [''],
      ['EKUITAS (EQUITY)', ''],
      ['  Modal Disetor Pemilik', balanceSheet.equity.ownersInitialCapital],
      ['  Laba Ditahan', balanceSheet.equity.retainedEarnings],
      ['  Laba Bersih Periode Berjalan', balanceSheet.equity.currentYearNetProfit],
      ['  Penarikan Prive Pemilik', -balanceSheet.equity.ownersDrawings],
      ['TOTAL EKUITAS', balanceSheet.equity.totalEquity],
      ['TOTAL KEWAJIBAN & EKUITAS', balanceSheet.totalLiabilitiesAndEquity]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Neraca_Keuangan_KopiEats_${new Date().toISOString().split('T')[0]}.csv`);
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
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-stone-900">Neraca Keuangan (Balance Sheet)</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Posisi Aset, Kewajiban, dan Ekuitas Modal Kopi & Eatery per {balanceSheet.asOfDate}
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Neraca Seimbang (Aset = Kewajiban + Ekuitas)</span>
          </div>

          <button
            id="btn-export-bs-csv"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Assets vs Liabilities & Equity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: ASSETS */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-sky-50/70 border-b border-sky-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-sky-700" />
              <h2 className="text-sm font-bold text-sky-950">ASET (ASSETS)</h2>
            </div>
            <span className="text-xs font-bold text-sky-900 font-mono">
              {formatIDR(balanceSheet.totalAssets)}
            </span>
          </div>

          <div className="p-4 space-y-5 text-xs">
            {/* CURRENT ASSETS */}
            <div className="space-y-2">
              <div className="font-bold text-stone-900 border-b border-stone-150 pb-1 flex justify-between">
                <span>1. ASET LANCAR (CURRENT ASSETS)</span>
                <span className="font-mono text-stone-700">
                  {formatIDR(balanceSheet.currentAssets.totalCurrentAssets)}
                </span>
              </div>

              <div className="space-y-1.5 pl-2">
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Kas Kasir / Petty Cash (Cash Drawer)</span>
                  <span className="font-mono">{formatIDR(balanceSheet.currentAssets.cashDrawerPettyCash)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Rekening Bank BCA Operasional</span>
                  <span className="font-mono">{formatIDR(balanceSheet.currentAssets.bankAccountBca)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Rekening Bank Mandiri Cadangan</span>
                  <span className="font-mono">{formatIDR(balanceSheet.currentAssets.bankAccountMandiri)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Settlement QRIS Pending (Dana Kliring H+1)</span>
                  <span className="font-mono">{formatIDR(balanceSheet.currentAssets.qrisSettlementPending)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Persediaan Bahan Baku (Biji Kopi, Susu, Kitchen Stock)</span>
                  <span className="font-mono">{formatIDR(balanceSheet.currentAssets.rawMaterialInventory)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Sewa Tempat Ruko Dibayar Dimuka</span>
                  <span className="font-mono">{formatIDR(balanceSheet.currentAssets.prepaidRentAndExpenses)}</span>
                </div>
              </div>
            </div>

            {/* FIXED ASSETS */}
            <div className="space-y-2 pt-2">
              <div className="font-bold text-stone-900 border-b border-stone-150 pb-1 flex justify-between">
                <span>2. ASET TETAP (FIXED ASSETS)</span>
                <span className="font-mono text-stone-700">
                  {formatIDR(balanceSheet.fixedAssets.totalFixedAssets)}
                </span>
              </div>

              <div className="space-y-1.5 pl-2">
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Mesin Espresso (La Marzocco) & Grinder Komersial</span>
                  <span className="font-mono">{formatIDR(balanceSheet.fixedAssets.espressoMachineAndGrinders)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Peralatan Kitchen Resto (Chiller, Freezer, Deep Fryer)</span>
                  <span className="font-mono">{formatIDR(balanceSheet.fixedAssets.kitchenHeavyEquipment)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Hardware POS Kasir, Furniture Meja & Sound System</span>
                  <span className="font-mono">{formatIDR(balanceSheet.fixedAssets.posSystemAndFurniture)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Renovasi Bar Counter, Interior & Instalasi Plumbing</span>
                  <span className="font-mono">{formatIDR(balanceSheet.fixedAssets.storeRenovationAndInterior)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-red-600">
                  <span>Akumulasi Penyusutan Aset Tetap</span>
                  <span className="font-mono">- {formatIDR(balanceSheet.fixedAssets.accumulatedDepreciation)}</span>
                </div>
              </div>
            </div>

            {/* TOTAL ASSETS FOOTER */}
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200/80 flex justify-between items-center font-bold text-sky-950">
              <span className="text-xs uppercase">TOTAL ASET KESELURUHAN</span>
              <span className="text-sm font-mono">{formatIDR(balanceSheet.totalAssets)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIABILITIES & EQUITY */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-amber-700" />
              <h2 className="text-sm font-bold text-amber-950">KEWAJIBAN & EKUITAS</h2>
            </div>
            <span className="text-xs font-bold text-amber-900 font-mono">
              {formatIDR(balanceSheet.totalLiabilitiesAndEquity)}
            </span>
          </div>

          <div className="p-4 space-y-5 text-xs">
            {/* LIABILITIES */}
            <div className="space-y-2">
              <div className="font-bold text-stone-900 border-b border-stone-150 pb-1 flex justify-between">
                <span>1. KEWAJIBAN (LIABILITIES)</span>
                <span className="font-mono text-stone-700">
                  {formatIDR(balanceSheet.totalLiabilities)}
                </span>
              </div>

              <div className="space-y-1.5 pl-2">
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Hutang Usaha Supplier (Biji Kopi & Dairy)</span>
                  <span className="font-mono">{formatIDR(balanceSheet.currentLiabilities.accountsPayableSuppliers)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Hutang Gaji Karyawan Akrual</span>
                  <span className="font-mono">{formatIDR(balanceSheet.currentLiabilities.accruedPayrollSalaries)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Titipan Pajak Restoran (PB1)</span>
                  <span className="font-mono">{formatIDR(balanceSheet.currentLiabilities.unpaidTaxesPb1)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Pinjaman Pembiayaan Mesin Espresso (Equipment Loan)</span>
                  <span className="font-mono">{formatIDR(balanceSheet.longTermLiabilities.equipmentLoans)}</span>
                </div>
              </div>
            </div>

            {/* EQUITY */}
            <div className="space-y-2 pt-2">
              <div className="font-bold text-stone-900 border-b border-stone-150 pb-1 flex justify-between">
                <span>2. EKUITAS PEMILIK (OWNERS EQUITY)</span>
                <span className="font-mono text-stone-700">
                  {formatIDR(balanceSheet.equity.totalEquity)}
                </span>
              </div>

              <div className="space-y-1.5 pl-2">
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Modal Disetor Pemilik (Initial Capital)</span>
                  <span className="font-mono">{formatIDR(balanceSheet.equity.ownersInitialCapital)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-stone-700">
                  <span>Laba Ditahan Periode Lalu (Retained Earnings)</span>
                  <span className="font-mono">{formatIDR(balanceSheet.equity.retainedEarnings)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-emerald-700 font-semibold">
                  <span>Laba Bersih Tahun / Periode Berjalan</span>
                  <span className="font-mono">{formatIDR(balanceSheet.equity.currentYearNetProfit)}</span>
                </div>
                <div className="flex justify-between py-0.5 text-red-600">
                  <span>Penarikan Prive Pemilik / Dividen</span>
                  <span className="font-mono">- {formatIDR(balanceSheet.equity.ownersDrawings)}</span>
                </div>
              </div>
            </div>

            {/* TOTAL LIABILITIES & EQUITY FOOTER */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex justify-between items-center font-bold text-amber-950">
              <span className="text-xs uppercase">TOTAL KEWAJIBAN & EKUITAS</span>
              <span className="text-sm font-mono">{formatIDR(balanceSheet.totalLiabilitiesAndEquity)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
