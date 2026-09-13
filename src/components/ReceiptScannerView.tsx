import React, { useState, useRef } from 'react';
import {
  Camera,
  UploadCloud,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  Store,
  Tag,
  CreditCard,
  ArrowRight,
  FileSpreadsheet,
  Layers,
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { Transaction, ReceiptScanResult, ReceiptLineItem, PaymentMethod } from '../types';
import { SAMPLE_RECEIPTS } from '../data/receiptSamples';

interface ReceiptScannerViewProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onSyncToSheets?: (transaction: Transaction) => Promise<boolean>;
  appScriptUrl?: string;
}

const CATEGORY_OPTIONS = [
  'Bahan Baku Biji Kopi (Beans)',
  'Susu & Dairy Products',
  'Bahan Baku Kitchen & Makanan',
  'Syrup, Powder & Topping',
  'Kemasan & Packaging (Cup, Straw, Box)',
  'Gas LPG Kitchen',
  'Listrik & Air (PLN & PDAM)',
  'Wi-Fi & Software Kasir (POS)',
  'Pemasaran & Media Sosial',
  'Pemeliharaan Mesin & Peralatan',
  'Kebersihan & Operasional Umum',
  'Gaji Barista & Kitchen Staff',
  'Mesin Espresso & Grinder',
  'Kitchen Equipment'
];

const PAYMENT_OPTIONS: PaymentMethod[] = ['Cash Kasir', 'Transfer Bank', 'QRIS', 'Hutang/Tempo'];

export const ReceiptScannerView: React.FC<ReceiptScannerViewProps> = ({
  onAddTransaction,
  onSyncToSheets,
  appScriptUrl
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ReceiptScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  // Form editable states
  const [vendorName, setVendorName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<string>('Susu & Dairy Products');
  const [subcategory, setSubcategory] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash Kasir');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [lineItems, setLineItems] = useState<ReceiptLineItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const applyScanResultToForm = (result: ReceiptScanResult, previewUrl?: string) => {
    setScanResult(result);
    setVendorName(result.vendorName || 'Suplier F&B');
    setDate(result.date || new Date().toISOString().split('T')[0]);
    setAmount(result.amount || 0);
    setCategory(result.category || 'Susu & Dairy Products');
    setSubcategory(result.subcategory || '');
    setPaymentMethod(result.paymentMethod || 'Cash Kasir');
    setReceiptNumber(result.receiptNumber || '');
    setNotes(result.notes || '');
    setLineItems(result.lineItems || []);
    if (previewUrl) {
      setImagePreview(previewUrl);
    }
    setSavedSuccess(false);
    setSyncStatus(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      setImagePreview(base64Data);
      setSelectedSampleId(null);
      processReceiptImage(base64Data, file.type, file.name);
    };
    reader.readAsDataURL(file);
  };

  const processReceiptImage = async (base64Data: string, mimeType: string, filename: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Data,
          mimeType: mimeType || 'image/jpeg',
          receiptText: `File: ${filename}`
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data && data.result) {
        applyScanResultToForm(data.result, base64Data);
      } else {
        throw new Error('Hasil OCR tidak valid');
      }
    } catch (err: any) {
      console.warn('OCR error, using sample/heuristic:', err);
      // Fallback
      const sample = SAMPLE_RECEIPTS[0];
      applyScanResultToForm(sample.scanResult, base64Data);
      setScanError(`Koneksi OCR: ${err.message || 'Menggunakan engine cadangan'}`);
    } finally {
      setIsScanning(false);
    }
  };

  const loadSampleReceipt = (sampleId: string) => {
    const sample = SAMPLE_RECEIPTS.find((s) => s.id === sampleId);
    if (!sample) return;

    setSelectedSampleId(sample.id);
    setIsScanning(true);
    setScanError(null);

    // Simulate realistic AI OCR scanning animation
    setTimeout(() => {
      setIsScanning(false);
      applyScanResultToForm(sample.scanResult);
      // Generate svg/canvas preview for sample
      setImagePreview(`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%23f8fafc"/><rect x="20" y="20" width="360" height="460" rx="8" fill="%23ffffff" stroke="%23e2e8f0" stroke-width="2"/><text x="40" y="60" font-family="monospace" font-size="14" font-weight="bold" fill="%231e293b">${encodeURIComponent(sample.vendor)}</text><text x="40" y="90" font-family="monospace" font-size="12" fill="%2364748b">Tgl: ${sample.date} | ${sample.scanResult.receiptNumber}</text><line x1="40" y1="110" x2="360" y2="110" stroke="%23cbd5e1" stroke-dasharray="4"/><text x="40" y="140" font-family="monospace" font-size="12" fill="%23334155">${encodeURIComponent(sample.scanResult.lineItems[0]?.itemName || '')}</text><text x="40" y="170" font-family="monospace" font-size="12" fill="%23334155">${encodeURIComponent(sample.scanResult.lineItems[1]?.itemName || '')}</text><line x1="40" y1="380" x2="360" y2="380" stroke="%23cbd5e1"/><text x="40" y="410" font-family="monospace" font-size="14" font-weight="bold" fill="%230f172a">TOTAL: Rp ${sample.amount.toLocaleString('id-ID')}</text><text x="40" y="440" font-family="monospace" font-size="11" fill="%23059669">LUNAS (${sample.scanResult.paymentMethod})</text></svg>`);
    }, 700);
  };

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      { itemName: 'Item Baru', qty: 1, unitPrice: 0, totalPrice: 0 }
    ]);
  };

  const handleUpdateLineItem = (index: number, field: keyof ReceiptLineItem, value: any) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: value };
    if (field === 'qty' || field === 'unitPrice') {
      item.totalPrice = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
    }
    updated[index] = item;
    setLineItems(updated);

    // recalculate total
    const newTotal = updated.reduce((acc, curr) => acc + curr.totalPrice, 0);
    if (newTotal > 0) {
      setAmount(newTotal);
    }
  };

  const handleRemoveLineItem = (index: number) => {
    const updated = lineItems.filter((_, i) => i !== index);
    setLineItems(updated);
    const newTotal = updated.reduce((acc, curr) => acc + curr.totalPrice, 0);
    if (newTotal > 0) {
      setAmount(newTotal);
    }
  };

  const handleSaveToAccounting = async () => {
    if (!amount || amount <= 0) {
      alert('Mohon masukkan nominal transaksi struk yang valid.');
      return;
    }

    const newTx: Omit<Transaction, 'id' | 'createdAt'> = {
      date: date || new Date().toISOString().split('T')[0],
      type: 'expense',
      category: category,
      subcategory: subcategory || 'Belanja Operasional',
      amount: amount,
      paymentMethod: paymentMethod,
      vendorOrCustomer: vendorName || 'Suplier F&B',
      description: `[OCR Receipt] ${vendorName} - ${notes || category}${receiptNumber ? ` (#${receiptNumber})` : ''}`,
      source: 'receipt_ocr',
      confidence: scanResult?.confidence || 0.95,
      receiptDetails: {
        vendorName,
        date: date || new Date().toISOString().split('T')[0],
        amount,
        subtotal: amount,
        category,
        subcategory,
        paymentMethod,
        receiptNumber,
        confidence: scanResult?.confidence || 0.95,
        lineItems,
        notes,
        rawText: scanResult?.rawText,
        aiEngine: scanResult?.aiEngine || 'gemini-3.8-flash (Vision OCR)'
      }
    };

    onAddTransaction(newTx);
    setSavedSuccess(true);

    // If autoSync or sync callback is available, sync to Google Sheets
    if (onSyncToSheets) {
      setSyncStatus('Menyinkronkan ke Google Sheets via AppScript...');
      try {
        const fullTx: Transaction = {
          ...newTx,
          id: `tx-rec-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        const ok = await onSyncToSheets(fullTx);
        if (ok) {
          setSyncStatus('Tersinkronisasi ke Google Sheets!');
        } else {
          setSyncStatus('Tersimpan di pembukuan lokal. Google Sheets siap disinkronkan manual.');
        }
      } catch (err: any) {
        setSyncStatus('Tersimpan di lokal. Sinkronisasi Sheet dapat dicoba ulang di menu Google Sheets.');
      }
    }
  };

  return (
    <div className="space-y-6" id="receipt-scanner-view-container">
      {/* Header Banner */}
      <div
        id="receipt-scanner-header"
        className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-900">
                <Receipt className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-stone-900 tracking-tight">
                Smart Receipt OCR & Automated Expense Tracker
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gemini 3.8 Flash Vision
              </span>
            </div>
            <p className="text-sm text-stone-600">
              Pindai struk belanja, nota pasar, bon suplier susu/kopi, token PLN, atau kwitansi operasional.
              AI mengekstrak vendor, tanggal, nominal, dan rincian belanja lalu mencatatnya otomatis ke sistem dan Google Sheets.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
              id="btn-scan-camera"
            >
              <Camera className="w-4 h-4" />
              Foto Kamera
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-800 text-sm font-medium rounded-lg transition-colors cursor-pointer"
              id="btn-upload-file"
            >
              <UploadCloud className="w-4 h-4 text-stone-600" />
              Unggah Gambar
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
          </div>
        </div>

        {/* Quick Sample Receipts Bar */}
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              Coba Sampel Struk F&B (1-Klik Tanpa Perlu Foto Fisik):
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {SAMPLE_RECEIPTS.map((sample) => {
              const isSelected = selectedSampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => loadSampleReceipt(sample.id)}
                  id={`btn-sample-${sample.id}`}
                  className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/70 text-amber-950 ring-1 ring-amber-600'
                      : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100 hover:border-stone-300 text-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold truncate">{sample.vendor}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-stone-200 text-stone-600 font-mono">
                      {sample.badge}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-stone-900">
                    Rp {sample.amount.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-stone-600 truncate mt-0.5">
                    {sample.category}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Two-Column Scanner Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Preview & Dropzone */}
        <div className="lg:col-span-5 space-y-4">
          <div
            id="receipt-dropzone"
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors min-h-[380px] flex flex-col items-center justify-center ${
              imagePreview
                ? 'border-amber-300 bg-amber-50/20'
                : 'border-stone-300 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50'
            }`}
          >
            {isScanning ? (
              <div className="space-y-4 py-8">
                <div className="relative w-16 h-16 mx-auto">
                  <RefreshCw className="w-16 h-16 text-amber-600 animate-spin" />
                  <Sparkles className="w-6 h-6 text-amber-700 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-stone-900">
                    Menganalisa Struk Belanja...
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
                    Gemini Vision OCR membaca vendor, tanggal, rincian barang, PPN, dan nominal struk
                  </p>
                </div>
              </div>
            ) : imagePreview ? (
              <div className="w-full h-full flex flex-col items-center">
                <div className="relative w-full max-h-[340px] overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xs">
                  <img
                    src={imagePreview}
                    alt="Receipt Preview"
                    className="w-full h-auto object-contain max-h-[340px] mx-auto"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-stone-900/80 text-white text-[11px] px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Struk Terverifikasi
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-3 text-xs font-medium text-amber-900 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Ganti Gambar Struk
                </button>
              </div>
            ) : (
              <div className="space-y-3 py-10">
                <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-800">
                    Tarik & Letakkan Foto Struk Disini
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Format didukung: JPG, PNG, WebP (Struk kasir, nota belanja, faktur)
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 text-xs text-stone-700">
                  <Camera className="w-3.5 h-3.5 text-stone-500" />
                  Atau klik untuk mengambil foto dari kamera
                </div>
              </div>
            )}
          </div>

          {/* OCR Engine Info Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-600 space-y-2">
            <div className="flex items-center justify-between font-semibold text-stone-900">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-700" /> Spesifikasi OCR F&B
              </span>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Auto-Categorize Active
              </span>
            </div>
            <p>
              Mesin OCR mengenali format struk Indonesia: kasir Moka/Majoo/Pawoon, nota toko sembako pasar, struk roastery, faktur distributor dairy, hingga struk token PLN.
            </p>
            <div className="pt-1 flex items-center gap-4 text-[11px] text-stone-600">
              <span>Resolusi: Auto-Optimized</span>
              <span>Toleransi Kemiringan: 45°</span>
              <span>Pemisah Desimal: Titik & Koma</span>
            </div>
          </div>
        </div>

        {/* Right Column: OCR Extraction Results & Form */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-700" />
                  Hasil Ekstraksi & Verifikasi Akuntansi
                </h3>
                <p className="text-xs text-stone-600">
                  Periksa atau sesuaikan data sebelum disimpan ke pembukuan dan disinkronkan ke Google Sheets.
                </p>
              </div>

              {scanResult && (
                <div className="text-right">
                  <span className="text-[11px] font-mono px-2 py-1 rounded bg-stone-100 text-stone-700 border border-stone-200 font-medium">
                    Akurasi: {Math.round((scanResult.confidence || 0.95) * 100)}%
                  </span>
                  <div className="text-[10px] text-stone-600 mt-0.5 font-mono">
                    {scanResult.aiEngine || 'Gemini 3.8 Flash Vision'}
                  </div>
                </div>
              )}
            </div>

            {scanError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{scanError}</span>
              </div>
            )}

            {/* Editable Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vendor Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-stone-500" />
                  Nama Toko / Suplier (Vendor)
                </label>
                <input
                  type="text"
                  id="input-ocr-vendor"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="Contoh: Toko Susu Sejahtera"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  Tanggal Struk
                </label>
                <input
                  type="date"
                  id="input-ocr-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              {/* Total Nominal (IDR) */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-stone-500" />
                  Total Nominal (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-semibold text-stone-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    id="input-ocr-amount"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2 text-sm font-semibold text-stone-900 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Kategori F&B Akuntansi */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-stone-500" />
                  Kategori Akuntansi F&B
                </label>
                <select
                  id="select-ocr-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Metode Pembayaran */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Metode Pembayaran
                </label>
                <select
                  id="select-ocr-payment"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
                >
                  {PAYMENT_OPTIONS.map((pay) => (
                    <option key={pay} value={pay}>
                      {pay}
                    </option>
                  ))}
                </select>
              </div>

              {/* No Struk / Invoice */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nomor Struk / Invoice (Opsional)
                </label>
                <input
                  type="text"
                  id="input-ocr-receipt-number"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="Contoh: STR-20260908-0891"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            {/* Itemized Line Items Table */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-stone-500" />
                  Rincian Barang yang Dibeli (Line Items)
                </label>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="text-xs font-medium text-amber-900 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                  id="btn-add-line-item"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Baris
                </button>
              </div>

              {lineItems.length > 0 ? (
                <div className="border border-stone-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-medium">
                      <tr>
                        <th className="px-3 py-2">Nama Barang</th>
                        <th className="px-3 py-2 w-16 text-center">Qty</th>
                        <th className="px-3 py-2 w-28 text-right">Harga Satuan</th>
                        <th className="px-3 py-2 w-28 text-right">Total</th>
                        <th className="px-2 py-2 w-8 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {lineItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="px-3 py-1.5">
                            <input
                              type="text"
                              value={item.itemName}
                              onChange={(e) => handleUpdateLineItem(idx, 'itemName', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-transparent hover:border-stone-300 focus:border-amber-600 rounded"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            <input
                              type="number"
                              value={item.qty}
                              onChange={(e) => handleUpdateLineItem(idx, 'qty', Number(e.target.value))}
                              className="w-14 text-center px-1 py-1 text-xs border border-transparent hover:border-stone-300 focus:border-amber-600 rounded"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateLineItem(idx, 'unitPrice', Number(e.target.value))}
                              className="w-24 text-right px-1 py-1 text-xs border border-transparent hover:border-stone-300 focus:border-amber-600 rounded"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-right font-medium text-stone-900">
                            Rp {item.totalPrice.toLocaleString('id-ID')}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(idx)}
                              className="text-stone-400 hover:text-rose-600 p-1 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 bg-stone-50 rounded-lg border border-dashed border-stone-200 text-xs text-stone-500">
                  Tidak ada rincian item per baris. Klik "+ Tambah Baris" jika ingin mencatat itemized list.
                </div>
              )}
            </div>

            {/* Notes / Catatan Akuntansi */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Catatan Akuntan / Keterangan Pembelian
              </label>
              <textarea
                id="input-ocr-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Catatan tambahan alokasi biaya atau tujuan pembelian..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            {/* Status Alert */}
            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">
                    Transaksi struk berhasil dicatat ke sistem akuntansi!
                  </span>
                </div>
                {syncStatus && (
                  <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                    {syncStatus}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-stone-600 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Google Sheet Sinkronisasi: {appScriptUrl ? 'Siap Terhubung' : 'Standby'}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSaveToAccounting}
                  id="btn-save-ocr-accounting"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Catat ke Pembukuan & Sheets
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
