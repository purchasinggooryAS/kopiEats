import React, { useState } from 'react';
import { X, Plus, DollarSign, Calendar, Tag, CreditCard, Building } from 'lucide-react';
import { TransactionType, PaymentMethod, Transaction } from '../types';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

const CATEGORIES = {
  income: [
    'Penjualan Coffee & Beverages',
    'Penjualan Kitchen & Eatery',
    'Penjualan Pastry & Bakery',
    'Penjualan Merchandise & Beans',
    'Pendapatan Delivery (GoFood/Grab/Shopee)'
  ],
  expense: [
    'Bahan Baku Biji Kopi (Beans)',
    'Susu & Dairy Products',
    'Bahan Baku Kitchen & Makanan',
    'Syrup, Powder & Topping',
    'Kemasan & Packaging (Cup, Straw, Box)',
    'Gaji Barista & Kitchen Staff',
    'Sewa Tempat / Ruko',
    'Listrik & Air (PLN & PDAM)',
    'Gas LPG Kitchen',
    'Wi-Fi & Software Kasir (POS)',
    'Pemasaran & Media Sosial',
    'Pemeliharaan Mesin & Peralatan',
    'Kebersihan & Operasional Umum',
    'Komisi Platform Delivery'
  ],
  asset: [
    'Mesin Espresso & Grinder',
    'Kitchen Equipment',
    'Hardware POS & Furniture',
    'Renovasi & Interior'
  ]
};

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [subcategory, setSubcategory] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash Kasir');
  const [vendorOrCustomer, setVendorOrCustomer] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(CATEGORIES[newType][0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
    if (!parsedAmount || parsedAmount <= 0) return;

    onAddTransaction({
      date,
      type,
      category,
      subcategory: subcategory.trim() || undefined,
      amount: parsedAmount,
      paymentMethod,
      vendorOrCustomer: vendorOrCustomer.trim() || (type === 'income' ? 'Pelanggan Kafe' : 'Supplier Umum'),
      description: description.trim() || `${category} - ${paymentMethod}`,
      source: 'manual',
      confidence: 1.0
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-150">
          <div>
            <h2 className="text-base font-bold text-stone-900">Catat Transaksi Manual</h2>
            <p className="text-xs text-stone-500">Input transaksi operasional kasir, HPP, atau pendapatan</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Transaction Type Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 rounded-xl font-semibold text-center border transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              + Pendapatan (Income)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 rounded-xl font-semibold text-center border transition-all ${
                type === 'expense'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              - Pengeluaran (Expense)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('asset')}
              className={`py-2 rounded-xl font-semibold text-center border transition-all ${
                type === 'asset'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              Aset / Investasi
            </button>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Nominal (Rp) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-400 font-semibold text-xs">Rp</span>
                <input
                  type="text"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="250.000"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Tanggal Transaksi</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Kategori Akun F&B</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/30"
              >
                {CATEGORIES[type].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Metode Pembayaran</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="Cash Kasir">Cash Kasir</option>
                <option value="QRIS">QRIS</option>
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="Hutang/Tempo">Hutang / Tempo Supplier</option>
              </select>
            </div>
          </div>

          {/* Vendor / Customer & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-medium mb-1">Vendor / Pelanggan</label>
              <input
                type="text"
                value={vendorOrCustomer}
                onChange={(e) => setVendorOrCustomer(e.target.value)}
                placeholder={type === 'income' ? 'Pelanggan Dine-in' : 'Supplier Biji Kopi'}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-1">Sub-Kategori / Detail Barang</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Contoh: Susu Greenfields 10L / Arabica Gayo"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-stone-700 font-medium mb-1">Keterangan / Memo Akuntansi</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan struk atau detail tambahan transaksi..."
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-150">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-700 hover:bg-stone-100 font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-xs transition-colors"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
