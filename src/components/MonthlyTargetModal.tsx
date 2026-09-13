import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Sliders,
  Sparkles,
  Check,
  RotateCcw,
  Coffee,
  HelpCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { MonthlyTargetSettings } from '../types';
import { AVAILABLE_REPORTING_MONTHS, DEFAULT_MONTHLY_TARGETS } from '../data/reportingData';

interface MonthlyTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
  monthlyTargets: Record<string, MonthlyTargetSettings>;
  onSaveTarget: (target: MonthlyTargetSettings) => void;
  onResetToDefaults: (monthKey: string) => void;
}

export const MonthlyTargetModal: React.FC<MonthlyTargetModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  onSelectMonth,
  monthlyTargets,
  onSaveTarget,
  onResetToDefaults
}) => {
  // Configured active month in the modal (cannot be 'all')
  const activeMonthKey = selectedMonth === 'all' ? '2026-09' : selectedMonth;
  const currentSetting =
    monthlyTargets[activeMonthKey] ||
    DEFAULT_MONTHLY_TARGETS[activeMonthKey] ||
    DEFAULT_MONTHLY_TARGETS['2026-09'];

  // Form state
  const [targetRevenue, setTargetRevenue] = useState<number>(currentSetting.targetRevenue);
  const [targetCogsPercent, setTargetCogsPercent] = useState<number>(currentSetting.targetCogsPercent);
  const [targetLaborPercent, setTargetLaborPercent] = useState<number>(currentSetting.targetLaborPercent);
  const [targetNetMarginPercent, setTargetNetMarginPercent] = useState<number>(currentSetting.targetNetMarginPercent);
  const [operatingDays, setOperatingDays] = useState<number>(currentSetting.operatingDays);
  const [dailyTargetCups, setDailyTargetCups] = useState<number>(currentSetting.dailyTargetCups);
  const [notes, setNotes] = useState<string>(currentSetting.notes || '');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sync state when activeMonthKey or monthlyTargets changes
  useEffect(() => {
    const s =
      monthlyTargets[activeMonthKey] ||
      DEFAULT_MONTHLY_TARGETS[activeMonthKey] ||
      DEFAULT_MONTHLY_TARGETS['2026-09'];
    setTargetRevenue(s.targetRevenue);
    setTargetCogsPercent(s.targetCogsPercent);
    setTargetLaborPercent(s.targetLaborPercent);
    setTargetNetMarginPercent(s.targetNetMarginPercent);
    setOperatingDays(s.operatingDays);
    setDailyTargetCups(s.dailyTargetCups);
    setNotes(s.notes || '');
    setSavedSuccess(false);
  }, [activeMonthKey, monthlyTargets]);

  if (!isOpen) return null;

  // Calculators
  const maxCogsIDR = Math.round((targetRevenue * targetCogsPercent) / 100);
  const maxLaborIDR = Math.round((targetRevenue * targetLaborPercent) / 100);
  const estNetProfitIDR = Math.round((targetRevenue * targetNetMarginPercent) / 100);
  const dailyRunRate = operatingDays > 0 ? Math.round(targetRevenue / operatingDays) : 0;

  const handleApplyPreset = (preset: 'conservative' | 'standard' | 'aggressive') => {
    if (preset === 'conservative') {
      setTargetCogsPercent(34);
      setTargetLaborPercent(22);
      setTargetNetMarginPercent(15);
    } else if (preset === 'standard') {
      setTargetCogsPercent(32);
      setTargetLaborPercent(20);
      setTargetNetMarginPercent(18);
    } else if (preset === 'aggressive') {
      setTargetCogsPercent(29);
      setTargetLaborPercent(18);
      setTargetNetMarginPercent(24);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: MonthlyTargetSettings = {
      monthKey: activeMonthKey,
      monthName:
        AVAILABLE_REPORTING_MONTHS.find((m) => m.key === activeMonthKey)?.label || activeMonthKey,
      targetRevenue: Math.max(1000000, Number(targetRevenue) || 300000000),
      targetCogsPercent: Math.min(60, Math.max(10, Number(targetCogsPercent) || 32)),
      targetLaborPercent: Math.min(50, Math.max(5, Number(targetLaborPercent) || 20)),
      targetNetMarginPercent: Math.min(50, Math.max(1, Number(targetNetMarginPercent) || 18)),
      operatingDays: Math.min(31, Math.max(1, Number(operatingDays) || 30)),
      dailyTargetCups: Math.max(10, Number(dailyTargetCups) || 200),
      notes: notes.trim()
    };

    onSaveTarget(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    onResetToDefaults(activeMonthKey);
    const def = DEFAULT_MONTHLY_TARGETS[activeMonthKey] || DEFAULT_MONTHLY_TARGETS['2026-09'];
    setTargetRevenue(def.targetRevenue);
    setTargetCogsPercent(def.targetCogsPercent);
    setTargetLaborPercent(def.targetLaborPercent);
    setTargetNetMarginPercent(def.targetNetMarginPercent);
    setOperatingDays(def.operatingDays);
    setDailyTargetCups(def.dailyTargetCups);
    setNotes(def.notes || '');
  };

  const monthOptions = AVAILABLE_REPORTING_MONTHS.filter((m) => m.key !== 'all');

  return (
    <div
      className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Target className="w-5 h-5 text-amber-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-stone-900">
                  Pengaturan Target & Anggaran Bulanan
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  F&B Benchmarking
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Konfigurasi target omset, batas toleransi HPP/Food Cost, plafon upah barista, dan target profit per bulan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month Selector Pills */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-700 block">
            Pilih Bulan yang Dikonfigurasi:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {monthOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => onSelectMonth(opt.key)}
                className={`px-2.5 py-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                  activeMonthKey === opt.key
                    ? 'bg-amber-900 text-white border-amber-900 shadow-xs font-bold'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div>{opt.shortLabel}</div>
                {opt.isCurrentMonth && (
                  <span className="text-[9px] block text-amber-300 font-normal">Berjalan</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Preset Strategy Selector */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Preset Strategi Cepat (F&B Standards):
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset Standar
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('conservative')}
                className="p-2 text-left rounded-lg border border-stone-200 bg-white hover:border-amber-400 transition-colors text-xs cursor-pointer"
              >
                <div className="font-semibold text-stone-900">🛡️ Konservatif</div>
                <div className="text-[10px] text-stone-500 mt-0.5">HPP 34% • Labor 22% • Net 15%</div>
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('standard')}
                className="p-2 text-left rounded-lg border border-stone-200 bg-white hover:border-amber-400 transition-colors text-xs cursor-pointer"
              >
                <div className="font-semibold text-stone-900">⚖️ Standar Seimbang</div>
                <div className="text-[10px] text-stone-500 mt-0.5">HPP 32% • Labor 20% • Net 18%</div>
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('aggressive')}
                className="p-2 text-left rounded-lg border border-stone-200 bg-white hover:border-amber-400 transition-colors text-xs cursor-pointer"
              >
                <div className="font-semibold text-stone-900">🚀 Efisiensi Tinggi</div>
                <div className="text-[10px] text-stone-500 mt-0.5">HPP 29% • Labor 18% • Net 24%</div>
              </button>
            </div>
          </div>

          {/* 1. Target Omset Penjualan */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900">
                1. Target Omset Penjualan (Monthly Revenue)
              </label>
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                Rp {Number(targetRevenue).toLocaleString('id-ID')}
              </span>
            </div>
            <input
              type="number"
              min={10000000}
              step={5000000}
              value={targetRevenue}
              onChange={(e) => setTargetRevenue(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
              placeholder="Contoh: 350000000"
            />
            {/* Quick revenue chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {[250000000, 300000000, 350000000, 400000000, 500000000].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setTargetRevenue(chip)}
                  className={`px-2 py-1 text-[11px] rounded border cursor-pointer ${
                    targetRevenue === chip
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  Rp {(chip / 1000000).toFixed(0)} Jt
                </button>
              ))}
            </div>
          </div>

          {/* 2. Plafon HPP & Labor Cost Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Plafon HPP (Food & Beverage Cost) */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900">
                  2. Plafon HPP / Food Cost (%)
                </label>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  {targetCogsPercent}%
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={45}
                step={0.5}
                value={targetCogsPercent}
                onChange={(e) => setTargetCogsPercent(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="text-[11px] text-stone-600 space-y-0.5 pt-1 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>Maks. Belanja Bahan:</span>
                  <strong className="text-rose-800">Rp {maxCogsIDR.toLocaleString('id-ID')}</strong>
                </div>
                <div className="text-[10px] text-stone-400">Rekomendasi Kafe: 28% - 35%</div>
              </div>
            </div>

            {/* Plafon Labor Cost */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-900">
                  3. Plafon Upah & Gaji (%)
                </label>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  {targetLaborPercent}%
                </span>
              </div>
              <input
                type="range"
                min={12}
                max={35}
                step={0.5}
                value={targetLaborPercent}
                onChange={(e) => setTargetLaborPercent(Number(e.target.value))}
                className="w-full accent-amber-700 cursor-pointer"
              />
              <div className="text-[11px] text-stone-600 space-y-0.5 pt-1 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>Maks. Beban Gaji Staf:</span>
                  <strong className="text-amber-900">Rp {maxLaborIDR.toLocaleString('id-ID')}</strong>
                </div>
                <div className="text-[10px] text-stone-400">Rekomendasi Kafe: 18% - 25%</div>
              </div>
            </div>
          </div>

          {/* 3. Operational Days & Cups Target Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Target Net Margin */}
            <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1.5">
              <label className="text-[11px] font-bold text-stone-800 block">
                Target Net Profit (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={40}
                  step={0.5}
                  value={targetNetMarginPercent}
                  onChange={(e) => setTargetNetMarginPercent(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md font-bold"
                />
                <span className="text-xs text-stone-500">%</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold pt-0.5">
                Est. Laba: Rp {estNetProfitIDR.toLocaleString('id-ID')}
              </div>
            </div>

            {/* Operating Days */}
            <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1.5">
              <label className="text-[11px] font-bold text-stone-800 block">
                Hari Kerja Operasional
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={20}
                  max={31}
                  value={operatingDays}
                  onChange={(e) => setOperatingDays(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md font-bold"
                />
                <span className="text-xs text-stone-500">hari</span>
              </div>
              <div className="text-[10px] text-teal-800 font-semibold pt-0.5">
                Run-rate: Rp {dailyRunRate.toLocaleString('id-ID')}/hari
              </div>
            </div>

            {/* Target Cups */}
            <div className="p-3 rounded-xl border border-stone-200 bg-white space-y-1.5">
              <label className="text-[11px] font-bold text-stone-800 block">
                Target Minuman / Hari
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={50}
                  max={1000}
                  step={10}
                  value={dailyTargetCups}
                  onChange={(e) => setDailyTargetCups(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-md font-bold"
                />
                <span className="text-xs text-stone-500">cup</span>
              </div>
              <div className="text-[10px] text-stone-500 pt-0.5">
                Total ~{(dailyTargetCups * operatingDays).toLocaleString('id-ID')} cup/bln
              </div>
            </div>
          </div>

          {/* Strategic Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-800 block">
              Catatan Strategis & Fokus Operasional Bulan Ini:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Fokus promosi biji kopi cold brew, optimalkan jadwal shift barista di jam ramai, dan kurangi milk waste."
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-900 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  Target Berhasil Disimpan!
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Simpan Pengaturan Bulan Ini
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
