import React from 'react';
import {
  Coffee,
  LayoutDashboard,
  FileSpreadsheet,
  PieChart,
  ArrowLeftRight,
  MessageSquareCode,
  Lightbulb,
  Receipt,
  Plus,
  Radio,
  CheckCircle2,
  AlertCircle,
  Camera,
  BarChart3,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewTxModal: () => void;
  isAppScriptConfigured: boolean;
  totalTransactionsCount: number;
  engineName: string;
  googleSheetUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTxModal,
  isAppScriptConfigured,
  totalTransactionsCount,
  engineName,
  googleSheetUrl
}) => {
  const effectiveSheetUrl = googleSheetUrl?.trim() || 'https://docs.google.com/spreadsheets';
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'advanced-reporting', label: 'Laporan Interaktif', icon: BarChart3, badge: 'Baru' },
    { id: 'receipt-ocr', label: 'Scan Struk (OCR)', icon: Camera, badge: 'AI' },
    { id: 'pnl', label: 'Laba Rugi (P&L)', icon: FileSpreadsheet },
    { id: 'balance-sheet', label: 'Neraca Keuangan', icon: PieChart },
    { id: 'cash-flow', label: 'Arus Kas', icon: ArrowLeftRight },
    { id: 'whatsapp-groq', label: 'WhatsApp & Groq Hub', icon: MessageSquareCode, badge: 'AI' },
    { id: 'strategy', label: 'Strategi F&B', icon: Lightbulb },
    { id: 'ledger', label: 'Jurnal Transaksi', icon: Receipt, count: totalTransactionsCount }
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-stone-950 font-bold shadow-sm">
              <Coffee className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg tracking-tight text-stone-50">KopiEats</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 font-medium px-2 py-0.5 rounded-full border border-amber-500/30">
                  Finance & AI
                </span>
              </div>
              <p className="text-xs text-stone-400 font-normal">Coffee & Eatery Accounting Suite</p>
            </div>
          </div>

          {/* Integration Status Badges */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-stone-800/80 border border-stone-700/60 text-xs">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-stone-300">Parser:</span>
              <span className="text-amber-400 font-medium capitalize">{engineName}</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-stone-800/80 border border-stone-700/60 text-xs">
              {isAppScriptConfigured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-stone-300">G-Sheets:</span>
                  <span className="text-emerald-400 font-medium">Tersambung</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-stone-300">G-Sheets:</span>
                  <span className="text-stone-400">Siap Hubungkan</span>
                </>
              )}
            </div>

            {/* Direct Google Sheets Link Button */}
            <a
              id="nav-open-sheets-btn"
              href={effectiveSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 hover:text-emerald-200 text-xs font-medium transition-colors shadow-xs"
              title="Buka Google Sheets di tab baru"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Sheets</span>
              <ExternalLink className="w-3 h-3 text-emerald-400/80" />
            </a>

            <button
              id="nav-quick-add-btn"
              onClick={onOpenNewTxModal}
              className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Input Manual</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-stone-800/60 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
                    : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      isActive ? 'bg-stone-950 text-amber-400' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
