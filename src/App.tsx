import React, { useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  AppScriptConfig,
  SyncLog,
  WhatsAppParsedItem
} from './types';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_APPSCRIPT_CONFIG
} from './data/initialData';
import {
  calculateProfitAndLoss,
  calculateBalanceSheet,
  calculateCashFlow,
  calculateFnBStrategicMetrics
} from './utils/financialCalculations';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ProfitLossView } from './components/ProfitLossView';
import { BalanceSheetView } from './components/BalanceSheetView';
import { CashFlowView } from './components/CashFlowView';
import { WhatsAppGroqHub } from './components/WhatsAppGroqHub';
import { AccountingStrategyView } from './components/AccountingStrategyView';
import { TransactionLedgerView } from './components/TransactionLedgerView';
import { NewTransactionModal } from './components/NewTransactionModal';
import { ReceiptScannerView } from './components/ReceiptScannerView';
import { AdvancedReportingView } from './components/AdvancedReportingView';

export default function App() {
  // Load saved state from localStorage or fallback to defaults
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('kopieats_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [config, setConfig] = useState<AppScriptConfig>(() => {
    try {
      const saved = localStorage.getItem('kopieats_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Automatically upgrade decommissioned or unavailable models to verified high-performance models
        if (
          !parsed.groqModel ||
          parsed.groqModel === 'llama-3.1-8b-instant' ||
          parsed.groqModel === 'llama-3.3-70b-versatile' ||
          parsed.groqModel === 'llama3-8b-8192' ||
          parsed.groqModel === 'llama3-70b-8192' ||
          parsed.groqModel === 'mixtral-8x7b-32768'
        ) {
          parsed.groqModel = 'openai/gpt-oss-120b';
        }
        return parsed;
      }
      return INITIAL_APPSCRIPT_CONFIG;
    } catch {
      return INITIAL_APPSCRIPT_CONFIG;
    }
  });

  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(() => {
    try {
      const saved = localStorage.getItem('kopieats_sync_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [engineName, setEngineName] = useState<string>('Groq AI (Ultra-Fast LPU)');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('kopieats_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('kopieats_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('kopieats_sync_logs', JSON.stringify(syncLogs));
  }, [syncLogs]);

  // Check health and engine
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasGroq) {
          setEngineName('Groq LPU (GPT-OSS / Qwen)');
        } else if (data.hasGemini) {
          setEngineName('Gemini AI (3.8 Flash / 3.1 Lite)');
        } else {
          setEngineName('AI Engine');
        }
        if (data.googleSheetUrl) {
          setConfig((prev) => {
            if (!prev.googleSheetUrl) {
              return { ...prev, googleSheetUrl: data.googleSheetUrl };
            }
            return prev;
          });
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleUpdateGoogleSheetUrl = (newUrl: string) => {
    setConfig((prev) => ({ ...prev, googleSheetUrl: newUrl }));
    showToast('Link Google Sheets berhasil disimpan!');
  };

  // Recalculate financial statements
  const pnl = useMemo(() => calculateProfitAndLoss(transactions), [transactions]);
  const balanceSheet = useMemo(() => calculateBalanceSheet(transactions), [transactions]);
  const cashFlow = useMemo(() => calculateCashFlow(transactions), [transactions]);
  const metrics = useMemo(() => calculateFnBStrategicMetrics(pnl, transactions), [pnl, transactions]);

  // Handler to add manual transaction
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: 'tx-' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Transaksi "${newTx.category}" senilai Rp ${newTx.amount.toLocaleString('id-ID')} berhasil dicatat.`);

    // Auto sync to Google Sheets if configured
    if (config.appscriptUrl && config.autoSyncToSheets) {
      dispatchSyncToAppscript([newTx], 'Input Transaksi Manual');
    }
  };

  // Handler when parsed items from WhatsApp are approved
  const handleAddParsedWhatsAppTransactions = (
    parsedItems: WhatsAppParsedItem[],
    rawMessage: string
  ) => {
    const newTransactions: Transaction[] = parsedItems.map((item, idx) => ({
      ...item,
      id: 'wa-' + (Date.now() + idx).toString(36),
      source: 'whatsapp',
      createdAt: new Date().toISOString()
    }));

    setTransactions((prev) => [...newTransactions, ...prev]);
    showToast(`${newTransactions.length} transaksi dari WhatsApp berhasil ditambahkan ke Jurnal.`);

    // Push to Google Sheets Appscript
    if (config.appscriptUrl) {
      dispatchSyncToAppscript(newTransactions, `WhatsApp: "${rawMessage.substring(0, 30)}..."`);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaksi telah dihapus dari jurnal.');
  };

  // Dispatch sync to Google Apps Script backend proxy
  const dispatchSyncToAppscript = async (
    txsToSync: Transaction[],
    sourceDescription: string = 'Sinkronisasi Jurnal'
  ) => {
    if (!config.appscriptUrl) return;

    try {
      const response = await fetch('/api/sync-appscript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appscriptUrl: config.appscriptUrl,
          payload: {
            action: 'ADD_TRANSACTIONS',
            transactions: txsToSync,
            source: sourceDescription,
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      const newLog: SyncLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        status: response.ok ? 'success' : 'error',
        action: sourceDescription,
        recordsCount: txsToSync.length,
        responseMessage: data.data?.message || (response.ok ? 'Terkirim ke Google Sheets' : data.error || 'Gagal terhubung')
      };

      setSyncLogs((prev) => [newLog, ...prev.slice(0, 20)]);
    } catch (err: any) {
      const newLog: SyncLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        status: 'error',
        action: sourceDescription,
        recordsCount: txsToSync.length,
        responseMessage: err?.message || 'Gagal koneksi ke Apps Script'
      };
      setSyncLogs((prev) => [newLog, ...prev.slice(0, 20)]);
    }
  };

  // Full state sync (All transactions + P&L + Neraca + Cash Flow)
  const handleTriggerFullSheetSync = async () => {
    if (!config.appscriptUrl) {
      setActiveTab('whatsapp-groq');
      showToast('Harap masukkan URL Google Apps Script Anda terlebih dahulu.');
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync-appscript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appscriptUrl: config.appscriptUrl,
          payload: {
            action: 'SYNC_FULL_STATE',
            transactions: transactions,
            pnl: pnl,
            balanceSheet: balanceSheet,
            cashFlow: cashFlow,
            timestamp: new Date().toISOString()
          }
        })
      });

      const result = await response.json();
      const newLog: SyncLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        status: response.ok ? 'success' : 'error',
        action: 'Full Sync Transaksi & Laporan',
        recordsCount: transactions.length,
        responseMessage: result.data?.message || (response.ok ? 'Sinkronisasi lengkap sukses' : result.error)
      };

      setSyncLogs((prev) => [newLog, ...prev.slice(0, 20)]);
      showToast(response.ok ? 'Seluruh data berhasil disinkronkan ke Google Sheets!' : 'Gagal menyinkronkan data.');
    } catch (err: any) {
      showToast('Gagal terhubung ke Google Apps Script: ' + err?.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Single transaction sync for OCR receipts
  const handleSyncSingleTransactionToSheets = async (tx: Transaction): Promise<boolean> => {
    if (!config.appscriptUrl) return false;
    try {
      await dispatchSyncToAppscript([tx], `OCR Struk: ${tx.vendorOrCustomer}`);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-stone-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTxModal={() => setIsNewTxModalOpen(true)}
        isAppScriptConfigured={Boolean(config.appscriptUrl)}
        totalTransactionsCount={transactions.length}
        engineName={engineName}
        googleSheetUrl={config.googleSheetUrl}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            pnl={pnl}
            balanceSheet={balanceSheet}
            metrics={metrics}
            recentTransactions={transactions}
            onNavigateToTab={setActiveTab}
            onOpenQuickWAParser={() => setActiveTab('whatsapp-groq')}
            googleSheetUrl={config.googleSheetUrl}
            onUpdateGoogleSheetUrl={handleUpdateGoogleSheetUrl}
            onTriggerSync={handleTriggerFullSheetSync}
            isSyncing={isSyncing}
            isAppScriptConfigured={Boolean(config.appscriptUrl)}
          />
        )}

        {activeTab === 'advanced-reporting' && (
          <AdvancedReportingView
            transactions={transactions}
            profitLoss={pnl}
            balanceSheet={balanceSheet}
            cashFlow={cashFlow}
            metrics={metrics}
          />
        )}

        {activeTab === 'receipt-ocr' && (
          <ReceiptScannerView
            onAddTransaction={handleAddTransaction}
            onSyncToSheets={handleSyncSingleTransactionToSheets}
            appScriptUrl={config.appscriptUrl}
          />
        )}

        {activeTab === 'pnl' && <ProfitLossView pnl={pnl} />}

        {activeTab === 'balance-sheet' && <BalanceSheetView balanceSheet={balanceSheet} />}

        {activeTab === 'cash-flow' && <CashFlowView cashFlow={cashFlow} />}

        {activeTab === 'whatsapp-groq' && (
          <WhatsAppGroqHub
            config={config}
            onUpdateConfig={(newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }))}
            onAddParsedTransactions={handleAddParsedWhatsAppTransactions}
            syncLogs={syncLogs}
            onTriggerFullSheetSync={handleTriggerFullSheetSync}
            isSyncing={isSyncing}
          />
        )}

        {activeTab === 'strategy' && (
          <AccountingStrategyView
            pnl={pnl}
            metrics={metrics}
            groqApiKey={config.groqApiKey}
          />
        )}

        {activeTab === 'ledger' && (
          <TransactionLedgerView
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenNewTxModal={() => setIsNewTxModalOpen(true)}
            onTriggerSync={handleTriggerFullSheetSync}
            isSyncing={isSyncing}
            googleSheetUrl={config.googleSheetUrl}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-stone-100 text-xs px-4 py-3 rounded-xl shadow-xl border border-stone-800 flex items-center space-x-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Manual Transaction Modal */}
      <NewTransactionModal
        isOpen={isNewTxModalOpen}
        onClose={() => setIsNewTxModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
}
