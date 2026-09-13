import React, { useState } from 'react';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  ExternalLink,
  RefreshCw,
  Cpu,
  ArrowRight,
  Plus,
  AlertCircle,
  HelpCircle,
  Code2,
  Smartphone
} from 'lucide-react';
import {
  Transaction,
  AppScriptConfig,
  SyncLog,
  WhatsAppParsedItem
} from '../types';
import { COMPLETE_APPSCRIPT_CODE } from '../data/appscriptCode';
import { SAMPLE_WHATSAPP_MESSAGES } from '../data/initialData';
import { formatIDR } from '../utils/financialCalculations';

interface WhatsAppGroqHubProps {
  config: AppScriptConfig;
  onUpdateConfig: (newConfig: Partial<AppScriptConfig>) => void;
  onAddParsedTransactions: (transactions: WhatsAppParsedItem[], rawMessage: string) => void;
  syncLogs: SyncLog[];
  onTriggerFullSheetSync: () => Promise<void>;
  isSyncing: boolean;
}

export const WhatsAppGroqHub: React.FC<WhatsAppGroqHubProps> = ({
  config,
  onUpdateConfig,
  onAddParsedTransactions,
  syncLogs,
  onTriggerFullSheetSync,
  isSyncing
}) => {
  const [inputMessage, setInputMessage] = useState(
    'Beli susu greenfields 10 karton @185.000 cash kasir sama sirup caramel 2 btl 240.000 dari toko sembako jaya'
  );
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'appscript' | 'open-wa'>('simulator');
  const sanitizeModel = (m?: string) => {
    if (!m || m.includes('llama3-') || m === 'llama-3.1-8b-instant' || m === 'llama-3.3-70b-versatile' || m === 'mixtral-8x7b-32768') {
      return 'openai/gpt-oss-120b';
    }
    return m;
  };

  const [groqKeyInput, setGroqKeyInput] = useState(config.groqApiKey || '');
  const [groqModelInput, setGroqModelInput] = useState(sanitizeModel(config.groqModel));
  const [appscriptUrlInput, setAppscriptUrlInput] = useState(config.appscriptUrl || '');
  const [googleSheetUrlInput, setGoogleSheetUrlInput] = useState(config.googleSheetUrl || '');

  // Handle parsing WhatsApp message via backend API
  const handleParseWhatsApp = async (textToParse?: string) => {
    const text = textToParse || inputMessage;
    if (!text.trim()) return;

    setIsParsing(true);
    setParseError(null);

    try {
      const response = await fetch('/api/parse-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          groqApiKey: groqKeyInput || undefined,
          model: groqModelInput || sanitizeModel(config.groqModel)
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      setParsedResult(data);
    } catch (err: any) {
      console.error('Parsing error:', err);
      setParseError(err.message || 'Gagal memproses pesan dengan AI');
    } finally {
      setIsParsing(false);
    }
  };

  // Save parsed transactions to ledger & Google Sheets
  const handleSaveToLedger = () => {
    if (!parsedResult || !parsedResult.transactions?.length) return;
    onAddParsedTransactions(parsedResult.transactions, inputMessage);
    setParsedResult(null);
  };

  const handleCopyAppScript = () => {
    navigator.clipboard.writeText(COMPLETE_APPSCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveConfig = () => {
    onUpdateConfig({
      groqApiKey: groqKeyInput,
      groqModel: groqModelInput,
      appscriptUrl: appscriptUrlInput,
      googleSheetUrl: googleSheetUrlInput
    });
  };

  // Generate Open WhatsApp pre-filled link
  const waPhoneClean = config.whatsappPhoneNumber.replace(/[^0-9]/g, '');
  const waSampleText = encodeURIComponent(
    'Pengeluaran Kasir Senja Rasa:\nBeli susu greenfields 10 karton 1.850.000 cash kasir toko sembako jaya'
  );
  const waClickUrl = `https://wa.me/${waPhoneClean}?text=${waSampleText}`;

  return (
    <div className="space-y-6">
      {/* Header with Pipeline Diagram */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 text-stone-100 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Integration Hub
              </span>
              <span className="text-xs text-stone-400">Arsitektur Otomasi F&B</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-stone-50 mt-1">
              WhatsApp &rarr; Groq AI &rarr; Google Sheets via Apps Script
            </h1>
            <p className="text-xs text-stone-300 max-w-2xl mt-1">
              Barista/kasir cukup kirim pesan WhatsApp harian. Groq AI mengekstrak nominal dan akun akuntansi, lalu Apps Script menyinkronkan secara instan ke Google Sheets.
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <button
              onClick={onTriggerFullSheetSync}
              disabled={isSyncing}
              className="flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sync ke Google Sheets'}</span>
            </button>
          </div>
        </div>

        {/* Visual Pipeline Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-800">
          <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Langkah 1</div>
              <div className="text-xs font-bold text-stone-200 truncate">WhatsApp Chat</div>
              <div className="text-[10px] text-stone-400">Pesan kasir/barista</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Langkah 2</div>
              <div className="text-xs font-bold text-stone-200 truncate">Groq AI Parser</div>
              <div className="text-[10px] text-stone-400">Ekstraksi JSON kilat</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Langkah 3</div>
              <div className="text-xs font-bold text-stone-200 truncate">KopiEats Core</div>
              <div className="text-[10px] text-stone-400">Validasi & hitung P&L</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-300 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Langkah 4</div>
              <div className="text-xs font-bold text-stone-200 truncate">Google Sheets</div>
              <div className="text-[10px] text-stone-400">Via Google Apps Script</div>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === 'simulator'
                ? 'bg-amber-500 text-stone-950 font-semibold'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            1. Simulator WhatsApp & Groq AI
          </button>
          <button
            onClick={() => setActiveSubTab('open-wa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === 'open-wa'
                ? 'bg-amber-500 text-stone-950 font-semibold'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            2. Panduan Open WhatsApp / Webhook
          </button>
          <button
            onClick={() => setActiveSubTab('appscript')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === 'appscript'
                ? 'bg-amber-500 text-stone-950 font-semibold'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            3. Kode Google Apps Script (Code.gs)
          </button>
        </div>
      </div>

      {/* SUBTAB 1: SIMULATOR WHATSAPP & GROQ AI */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Chat Simulator */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-stone-900">Uji Parser Pesan WhatsApp</h2>
                  <p className="text-xs text-stone-500">Ketik pesan informal kasir/barista atau pilih contoh siap pakai</p>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md">
                  <Cpu className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mesin: Groq LPU / Gemini Vision</span>
                </div>
              </div>

              {/* Sample Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-stone-500 uppercase">Pilih Contoh Pesan WhatsApp:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_WHATSAPP_MESSAGES.map((msg, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputMessage(msg.text);
                        handleParseWhatsApp(msg.text);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-200 border border-stone-200 text-stone-700 transition-colors"
                    >
                      {msg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Chat Area */}
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Contoh: Beli susu greenfields 10 karton @185.000 cash kasir toko sembako jaya..."
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-stone-900"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    Groq AI membaca bahasa Indonesia santai, singkatan (rb, k, jt, btl, karton), dan membagi akun F&B.
                  </span>
                  <button
                    id="btn-run-parse-wa"
                    onClick={() => handleParseWhatsApp()}
                    disabled={isParsing || !inputMessage.trim()}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50 transition-colors shadow-xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isParsing ? 'Menganalisis...' : 'Ekstrak dengan AI'}</span>
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {parseError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Parsed Result Box */}
              {parsedResult && (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-stone-900">
                        Hasil Ekstraksi Akuntansi ({parsedResult.transactions?.length || 0} Transaksi)
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-medium">
                      Engine: {parsedResult.aiEngine || 'Groq AI'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 italic">"{parsedResult.summary}"</p>

                  <div className="space-y-2">
                    {parsedResult.transactions?.map((tx: WhatsAppParsedItem, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-white border border-stone-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                tx.type === 'income'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tx.type === 'asset'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-stone-150 text-stone-900'
                              }`}
                            >
                              {tx.type.toUpperCase()}
                            </span>
                            <span className="font-bold text-stone-900">{tx.category}</span>
                            {tx.subcategory && (
                              <span className="text-stone-500 text-[11px]">({tx.subcategory})</span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-600 mt-1">
                            Vendor/Pelanggan: <span className="font-medium text-stone-800">{tx.vendorOrCustomer}</span> &bull; Metode: <span className="font-medium text-stone-800">{tx.paymentMethod}</span>
                          </div>
                          <div className="text-[11px] text-stone-500 italic mt-0.5">{tx.description}</div>
                        </div>

                        <div className="text-right sm:self-center">
                          <div className="text-sm font-bold text-stone-900 font-mono">
                            {formatIDR(tx.amount)}
                          </div>
                          <div className="text-[10px] text-emerald-700">
                            Confidence: {Math.round((tx.confidence || 0.95) * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      id="btn-save-parsed-tx"
                      onClick={handleSaveToLedger}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Simpan ke Jurnal & Kirim ke Google Sheets</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Configuration & Status */}
          <div className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900">Konfigurasi Kunci & Endpoint</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Groq API Key (Opsional)
                  </label>
                  <input
                    type="password"
                    value={groqKeyInput}
                    onChange={(e) => setGroqKeyInput(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full p-2 rounded-lg border border-stone-300 text-xs font-mono"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Jika dikosongkan, sistem otomatis memakai server fallback Gemini 3.8 Flash berkecepatan tinggi.
                  </p>
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Model AI Parser
                  </label>
                  <select
                    value={groqModelInput}
                    onChange={(e) => setGroqModelInput(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 text-xs font-medium bg-white text-stone-800"
                  >
                    <option value="openai/gpt-oss-120b">OpenAI GPT-OSS 120B (Rekomendasi Utama - Sangat Cerdas & Cepat)</option>
                    <option value="qwen/qwen3.8-27b">Qwen 3.8 27B (Presisi Tinggi Akuntansi F&B)</option>
                    <option value="openai/gpt-oss-20b">OpenAI GPT-OSS 20B (Respons Secepat Kilat)</option>
                    <option value="qwen/qwen3.6-27b">Qwen 3.6 27B (Efisiensi Tinggi)</option>
                    <option value="groq/compound">Groq Compound</option>
                    <option value="allam-2-7b">Allam 2 7B</option>
                    <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile (jika aktif di akun Anda)</option>
                    <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant (jika aktif di akun Anda)</option>
                  </select>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Sistem memiliki multi-tier auto-fallback cerdas: jika suatu model tidak tersedia, otomatis mencoba model aktif alternatif, lalu fallback ke Gemini (3.8 Flash / 3.1 Lite).
                  </p>
                </div>

                <div>
                  <label className="block text-stone-600 font-medium mb-1">
                    Google Apps Script Web App URL
                  </label>
                  <input
                    type="text"
                    value={appscriptUrlInput}
                    onChange={(e) => setAppscriptUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full p-2 rounded-lg border border-stone-300 text-xs font-mono"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    URL deployment Apps Script untuk sync otomatis ke spreadsheet Anda.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-stone-600 font-medium">
                      Link Google Spreadsheet
                    </label>
                    <a
                      href={googleSheetUrlInput || 'https://docs.google.com/spreadsheets'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-emerald-700 hover:underline flex items-center space-x-1 font-medium"
                    >
                      <span>Buka Sheet</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="url"
                    value={googleSheetUrlInput}
                    onChange={(e) => setGoogleSheetUrlInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs.../edit"
                    className="w-full p-2 rounded-lg border border-stone-300 text-xs font-mono"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Direct link spreadsheet Google Sheets kafe Anda agar mudah diakses dari dashboard.
                  </p>
                </div>

                <button
                  onClick={handleSaveConfig}
                  className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg text-xs font-semibold transition-colors"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </div>

            {/* Sync Activity History */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900">Aktivitas Sinkronisasi</h3>
                <span className="text-[11px] text-stone-500 font-mono">{syncLogs.length} logs</span>
              </div>

              {syncLogs.length === 0 ? (
                <p className="text-xs text-stone-400 py-3 text-center">Belum ada riwayat sinkronisasi.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {syncLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] space-y-0.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-stone-800">{log.action}</span>
                        <span className="text-stone-400 font-mono text-[10px]">
                          {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                        </span>
                      </div>
                      <div className="text-stone-600 truncate">{log.responseMessage}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PANDUAN OPEN WHATSAPP / WEBHOOK */}
      {activeSubTab === 'open-wa' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-stone-900">Integrasi Langsung WhatsApp (Open WA & Bot)</h2>
            <p className="text-xs text-stone-500">
              Pilihan integrasi dari handphone tim operasional (Barista & Kitchen) langsung ke sistem akuntansi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option A: Quick Open WA Link */}
            <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span>Opsi 1: Tombol Cepat "Open WhatsApp"</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Staf kasir atau supervisor dapat menekan tombol langsung untuk membuka WhatsApp dengan template format baku laporan kasir & belanja harian.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">Nomor WhatsApp Tim / Bot:</label>
                <input
                  type="text"
                  value={config.whatsappPhoneNumber}
                  onChange={(e) => onUpdateConfig({ whatsappPhoneNumber: e.target.value })}
                  placeholder="6281234567890"
                  className="w-full p-2 rounded-lg border border-stone-300 text-xs font-mono"
                />
              </div>

              <a
                href={waClickUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <span>Buka WhatsApp Sekarang (Open WA)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Option B: Incoming Webhook for WhatsApp Gateway */}
            <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-4">
              <div className="flex items-center space-x-2 text-stone-900 font-bold text-sm">
                <Cpu className="w-5 h-5 text-amber-600" />
                <span>Opsi 2: Webhook Otomatis (OpenWA / Fonnte / Baileys)</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Jika Anda menggunakan gateway WhatsApp (seperti OpenWA, Baileys, Fonnte, atau Wablas), arahkan Webhook incoming URL ke endpoint server KopiEats berikut:
              </p>

              <div className="p-3 bg-stone-900 text-emerald-400 rounded-lg text-xs font-mono break-all">
                {window.location.origin}/api/whatsapp-webhook
              </div>

              <div className="text-[11px] text-stone-500 space-y-1">
                <div>&bull; Payload format: <code className="text-stone-700 font-mono">&#123; "message": "...", "from": "..." &#125;</code></div>
                <div>&bull; Server akan otomatis memproses teks via Groq AI dan menyimpannya langsung.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: KODE GOOGLE APPS SCRIPT (Code.gs) */}
      {activeSubTab === 'appscript' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-stone-900">Kode Google Apps Script Siap Pakai (Code.gs)</h2>
              <p className="text-xs text-stone-500">
                Salin kode ini dan pasang ke Google Sheets Anda untuk membuat 4 tab spreadsheet otomatis
              </p>
            </div>

            <button
              onClick={handleCopyAppScript}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {copiedCode ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Kode Apps Script'}</span>
            </button>
          </div>

          {/* Step by Step Guide */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">Langkah 1: Buat Spreadsheet</span>
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-emerald-700 hover:underline flex items-center space-x-0.5"
                >
                  <span>Buka Sheet</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[11px] text-stone-600">
                Buka <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-medium">Google Sheets baru</a>, beri nama <span className="font-medium text-stone-800">"Keuangan Kopi & Eatery"</span>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="font-bold text-stone-900">Langkah 2: Buka Apps Script</span>
              <p className="text-[11px] text-stone-600">
                Klik menu <span className="font-medium text-stone-800">Extensions (Ekstensi) &rarr; Apps Script</span>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="font-bold text-stone-900">Langkah 3: Jalankan Inisialisasi</span>
              <p className="text-[11px] text-stone-600">
                Paste kode di bawah, pilih fungsi <span className="font-mono text-amber-700">setupAllSheets</span> lalu klik <span className="font-medium">Run</span>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="font-bold text-stone-900">Langkah 4: Deploy Web App</span>
              <p className="text-[11px] text-stone-600">
                Klik <span className="font-medium">Deploy &rarr; New deployment &rarr; Web app</span>, set akses ke <span className="font-medium">"Anyone"</span>.
              </p>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="relative rounded-xl bg-stone-950 p-4 border border-stone-800 overflow-hidden">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800 text-xs text-stone-400 font-mono">
              <span>Code.gs — Google Apps Script Multi-Sheet Handler</span>
              <button
                onClick={handleCopyAppScript}
                className="text-amber-400 hover:text-amber-300 flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin</span>
              </button>
            </div>
            <pre className="text-[11px] text-stone-300 font-mono overflow-x-auto max-h-96 mt-3 leading-relaxed">
              {COMPLETE_APPSCRIPT_CODE}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
