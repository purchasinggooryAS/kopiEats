import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Trash2,
  Plus,
  MessageSquare,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { formatIDR } from '../utils/financialCalculations';

interface TransactionLedgerViewProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onOpenNewTxModal: () => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
  googleSheetUrl?: string;
}

export const TransactionLedgerView: React.FC<TransactionLedgerViewProps> = ({
  transactions,
  onDeleteTransaction,
  onOpenNewTxModal,
  onTriggerSync,
  isSyncing,
  googleSheetUrl
}) => {
  const effectiveSheetUrl = googleSheetUrl?.trim() || 'https://docs.google.com/spreadsheets';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.vendorOrCustomer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.subcategory && tx.subcategory.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesPayment = filterPayment === 'all' || tx.paymentMethod === filterPayment;

    return matchesSearch && matchesType && matchesPayment;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleExportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Subkategori', 'Nominal', 'Metode', 'Vendor/Pelanggan', 'Keterangan', 'Sumber'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.category}"`,
      `"${t.subcategory || '-'}"`,
      t.amount,
      t.paymentMethod,
      `"${t.vendorOrCustomer}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.source
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Jurnal_Transaksi_KopiEats_${new Date().toISOString().split('T')[0]}.csv`);
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
            <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-stone-900">Jurnal Buku Besar Transaksi</h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Riwayat lengkap transaksi kasir, pembelian bahan baku WhatsApp, dan beban operasional
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <a
            id="btn-ledger-open-sheets"
            href={effectiveSheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Buka Google Sheets di tab baru"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Buka di Google Sheets</span>
            <ExternalLink className="w-3 h-3 text-emerald-600/80" />
          </a>

          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync ke Google Sheet</span>
          </button>

          <button
            id="btn-export-ledger-csv"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh CSV</span>
          </button>

          <button
            onClick={onOpenNewTxModal}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Total Pemasukan (Filter)</div>
          <div className="text-xl font-bold text-emerald-700 mt-1 font-mono">{formatIDR(totalIncome)}</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Total Pengeluaran (Filter)</div>
          <div className="text-xl font-bold text-stone-900 mt-1 font-mono">{formatIDR(totalExpense)}</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-stone-500 font-medium">Selisih Kas Bersih</div>
          <div className={`text-xl font-bold mt-1 font-mono ${totalIncome >= totalExpense ? 'text-emerald-700' : 'text-red-700'}`}>
            {formatIDR(totalIncome - totalExpense)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi, bahan, toko, vendor..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5">
            <span className="text-stone-500">Tipe:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-stone-300 text-xs bg-white"
            >
              <option value="all">Semua Tipe</option>
              <option value="income">Pendapatan</option>
              <option value="expense">Pengeluaran</option>
              <option value="asset">Aset</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-stone-500">Metode:</span>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-stone-300 text-xs bg-white"
            >
              <option value="all">Semua Metode</option>
              <option value="Cash Kasir">Cash Kasir</option>
              <option value="QRIS">QRIS</option>
              <option value="Transfer Bank">Transfer Bank</option>
              <option value="Hutang/Tempo">Hutang/Tempo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200">
              <tr>
                <th className="py-3 px-3.5 font-semibold">Tanggal</th>
                <th className="py-3 px-3.5 font-semibold">Tipe</th>
                <th className="py-3 px-3.5 font-semibold">Kategori Akun F&B</th>
                <th className="py-3 px-3.5 font-semibold">Deskripsi & Memo</th>
                <th className="py-3 px-3.5 font-semibold">Vendor / Pelanggan</th>
                <th className="py-3 px-3.5 font-semibold">Metode</th>
                <th className="py-3 px-3.5 font-semibold">Sumber</th>
                <th className="py-3 px-3.5 font-semibold text-right">Nominal</th>
                <th className="py-3 px-3.5 font-semibold text-center w-12">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-400">
                    Tidak ada transaksi yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-stone-600 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'income'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.type === 'asset'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-semibold text-stone-900">{tx.category}</div>
                      {tx.subcategory && (
                        <div className="text-[10px] text-stone-500">{tx.subcategory}</div>
                      )}
                    </td>
                    <td className="py-3 px-3.5 max-w-xs text-stone-700 truncate" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className="py-3 px-3.5 text-stone-800 whitespace-nowrap font-medium">
                      {tx.vendorOrCustomer}
                    </td>
                    <td className="py-3 px-3.5 text-stone-600 whitespace-nowrap">
                      {tx.paymentMethod}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {tx.source === 'whatsapp' || tx.source === 'groq_ai' ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-200/60">
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp AI</span>
                        </span>
                      ) : (
                        <span className="text-stone-500 capitalize">{tx.source}</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold whitespace-nowrap">
                      <span className={tx.type === 'income' ? 'text-emerald-700' : 'text-stone-900'}>
                        {tx.type === 'income' ? '+' : '-'} {formatIDR(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
