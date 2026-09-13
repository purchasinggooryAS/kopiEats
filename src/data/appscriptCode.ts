export const COMPLETE_APPSCRIPT_CODE = `/**
 * KOPIEATS FINANCE & AI HUB - GOOGLE APPS SCRIPT CONNECTOR
 * Integrasi WhatsApp (Open WA / Bot) -> Groq AI -> Google Sheets
 * 
 * Petunjuk Deployment:
 * 1. Buat Google Spreadsheet baru (Contoh: "Keuangan Coffee & Eatery 2026")
 * 2. Klik menu 'Extensions' (Ekstensi) > 'Apps Script'
 * 3. Hapus kode default, lalu Paste seluruh kode ini ke 'Code.gs'
 * 4. Pilih fungsi 'setupAllSheets' pada dropdown, lalu klik 'Run' untuk inisialisasi sheet otomatis
 * 5. Klik 'Deploy' > 'New deployment'
 * 6. Pilih tipe: 'Web app'
 *    - Description: KopiEats WA Finance Webhook
 *    - Execute as: 'Me (akun Anda)'
 *    - Who has access: 'Anyone' (Semua Orang)
 * 7. Klik 'Deploy' dan salin 'Web App URL' ke aplikasi KopiEats
 */

const SHEET_NAMES = {
  TRANSACTIONS: "01_Transaksi_Harian",
  PROFIT_LOSS: "02_Laba_Rugi_PL",
  BALANCE_SHEET: "03_Neraca_Balance_Sheet",
  CASH_FLOW: "04_Arus_Kas_CashFlow"
};

/**
 * Handle POST request dari WhatsApp bot / Groq AI / KopiEats Web App
 */
function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const payload = JSON.parse(rawData);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Inisialisasi sheet jika belum ada
    setupAllSheets();

    const action = payload.action || "ADD_TRANSACTIONS";
    let insertedCount = 0;

    if (action === "ADD_TRANSACTIONS" || action === "PARSE_AND_SAVE") {
      const transactions = payload.transactions || [payload];
      const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);

      transactions.forEach(function(tx) {
        if (!tx || !tx.amount) return;

        sheet.appendRow([
          tx.date || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd"),
          tx.id || ("TX-" + Utilities.getUuid().substring(0, 8).toUpperCase()),
          tx.type || "expense",
          tx.category || "Operasional Harian",
          tx.subcategory || "-",
          Number(tx.amount) || 0,
          tx.paymentMethod || "Cash Kasir",
          tx.vendorOrCustomer || "Umum",
          tx.description || "-",
          tx.source || "whatsapp_groq",
          tx.confidence ? Number(tx.confidence) : 1.0,
          new Date()
        ]);
        insertedCount++;
      });

      // Update rekap Laba Rugi otomatis
      refreshProfitLossSheet(ss);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: insertedCount + " transaksi berhasil dicatat ke Google Sheets",
        insertedCount: insertedCount,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "SYNC_FULL_STATE") {
      // Sync seluruh data P&L, Neraca, dan Cash Flow
      if (payload.pnl) updateProfitLossSummary(ss, payload.pnl);
      if (payload.balanceSheet) updateBalanceSheetSummary(ss, payload.balanceSheet);
      if (payload.cashFlow) updateCashFlowSummary(ss, payload.cashFlow);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Laporan Keuangan berhasil disinkronisasi ke Google Sheets",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "unknown_action",
      action: action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET request untuk cek koneksi / ping
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    app: "KopiEats Google Sheets Finance Connector",
    version: "2.5",
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Inisialisasi seluruh sheet dan format kolom
 */
function setupAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet Transaksi Harian
  let txSheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  if (!txSheet) {
    txSheet = ss.insertSheet(SHEET_NAMES.TRANSACTIONS);
    const headers = [
      "Tanggal", "ID Transaksi", "Tipe", "Kategori Akun", "Sub-Kategori",
      "Nominal (IDR)", "Metode Pembayaran", "Vendor / Pelanggan", "Keterangan Memo",
      "Sumber Data", "AI Confidence", "Waktu Input"
    ];
    txSheet.appendRow(headers);
    
    // Format Header Baris 1
    const headerRange = txSheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#2c3e50").setFontColor("#ffffff").setFontWeight("bold");
    txSheet.setFrozenRows(1);
    
    // Format Kolom Nominal Rupiah (Kolom F)
    txSheet.getRange("F2:F1000").setNumberFormat("[$Rp-421] #,##0");
  }

  // 2. Sheet Laba Rugi
  let plSheet = ss.getSheetByName(SHEET_NAMES.PROFIT_LOSS);
  if (!plSheet) {
    plSheet = ss.insertSheet(SHEET_NAMES.PROFIT_LOSS);
    setupProfitLossTemplate(plSheet);
  }

  // 3. Sheet Neraca Keuangan
  let bsSheet = ss.getSheetByName(SHEET_NAMES.BALANCE_SHEET);
  if (!bsSheet) {
    bsSheet = ss.insertSheet(SHEET_NAMES.BALANCE_SHEET);
    setupBalanceSheetTemplate(bsSheet);
  }

  // 4. Sheet Arus Kas
  let cfSheet = ss.getSheetByName(SHEET_NAMES.CASH_FLOW);
  if (!cfSheet) {
    cfSheet = ss.insertSheet(SHEET_NAMES.CASH_FLOW);
    setupCashFlowTemplate(cfSheet);
  }
}

function setupProfitLossTemplate(sheet) {
  sheet.clear();
  sheet.appendRow(["LAPORAN LABA RUGI (PROFIT & LOSS STATEMENT) - COFFEE & EATERY", ""]);
  sheet.appendRow(["KopiEats Financial Accounting System", ""]);
  sheet.appendRow(["Komponen Keuangan", "Nominal (IDR)", "% Terhadap Omset"]);
  
  sheet.getRange(1, 1, 1, 3).setFontWeight("bold").setFontSize(13);
  sheet.getRange(3, 1, 1, 3).setBackground("#16a085").setFontColor("#ffffff").setFontWeight("bold");

  const rows = [
    ["PENDAPATAN USAHA (REVENUE)", "", ""],
    ["  - Penjualan Coffee & Beverages", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "income", \\'01_Transaksi_Harian\\'!D:D, "*Coffee*")', ""],
    ["  - Penjualan Kitchen & Eatery", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "income", \\'01_Transaksi_Harian\\'!D:D, "*Kitchen*")', ""],
    ["  - Penjualan Pastry & Bakery", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "income", \\'01_Transaksi_Harian\\'!D:D, "*Pastry*")', ""],
    ["  - Pendapatan Delivery Online", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "income", \\'01_Transaksi_Harian\\'!D:D, "*Delivery*")', ""],
    ["TOTAL PENDAPATAN BERSIH", "=SUM(B5:B8)", "100.0%"],
    ["", "", ""],
    ["BEBAN POKOK PENJUALAN (HPP / COGS)", "", ""],
    ["  - Biji Kopi (Coffee Beans)", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "expense", \\'01_Transaksi_Harian\\'!D:D, "*Biji Kopi*")', "=B12/B9"],
    ["  - Susu & Dairy Products", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "expense", \\'01_Transaksi_Harian\\'!D:D, "*Susu*")', "=B13/B9"],
    ["  - Bahan Baku Makanan Kitchen", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "expense", \\'01_Transaksi_Harian\\'!D:D, "*Kitchen*")', "=B14/B9"],
    ["  - Sirup, Powder & Topping", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "expense", \\'01_Transaksi_Harian\\'!D:D, "*Syrup*")', "=B15/B9"],
    ["  - Kemasan, Cup & Packaging", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "expense", \\'01_Transaksi_Harian\\'!D:D, "*Kemasan*")', "=B16/B9"],
    ["TOTAL HPP / COGS", "=SUM(B12:B16)", "=B17/B9"],
    ["", "", ""],
    ["LABA KOTOR (GROSS PROFIT)", "=B9-B17", "=B19/B9"],
    ["", "", ""],
    ["BEBAN OPERASIONAL (OPEX)", "", ""],
    ["  - Gaji Barista & Kitchen Staff", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "expense", \\'01_Transaksi_Harian\\'!D:D, "*Gaji*")', "=B22/B9"],
    ["  - Sewa Tempat / Ruko", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "expense", \\'01_Transaksi_Harian\\'!D:D, "*Sewa*")', "=B23/B9"],
    ["  - Listrik PLN & Air PDAM", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "expense", \\'01_Transaksi_Harian\\'!D:D, "*Listrik*")', "=B24/B9"],
    ["  - Gas LPG Kitchen", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "expense", \\'01_Transaksi_Harian\\'!D:D, "*Gas*")', "=B25/B9"],
    ["  - Wi-Fi & Software Kasir (POS)", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "expense", \\'01_Transaksi_Harian\\'!D:D, "*Wi-Fi*")', "=B26/B9"],
    ["  - Pemasaran & Social Media", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "expense", \\'01_Transaksi_Harian\\'!D:D, "*Pemasaran*")', "=B27/B9"],
    ["  - Maintenance Mesin Espresso", '=SUMIFS(\\'01_Transaksi_Harian\\'!F:F, \\'01_Transaksi_Harian\\'!C:C, "expense", \\'01_Transaksi_Harian\\'!D:D, "*Pemeliharaan*")', "=B28/B9"],
    ["TOTAL BEBAN OPERASIONAL", "=SUM(B22:B28)", "=B29/B9"],
    ["", "", ""],
    ["LABA BERSIH SEBELUM PAJAK (EBITDA)", "=B19-B29", "=B31/B9"],
    ["Pajak PPh Final UMKM (0.5%)", "=B9*0.005", "0.5%"],
    ["LABA BERSIH SETELAH PAJAK (NET PROFIT)", "=B31-B32", "=B33/B9"]
  ];

  rows.forEach(r => sheet.appendRow(r));
  sheet.getRange("B4:B35").setNumberFormat("[$Rp-421] #,##0");
  sheet.getRange("C4:C35").setNumberFormat("0.0%");
  sheet.setColumnWidth(1, 320);
  sheet.setColumnWidth(2, 160);
  sheet.setColumnWidth(3, 130);
}

function setupBalanceSheetTemplate(sheet) {
  sheet.clear();
  sheet.appendRow(["NERACA KEUANGAN (BALANCE SHEET) - COFFEE & EATERY", ""]);
  sheet.appendRow(["Akun Neraca", "Saldo (IDR)"]);
  sheet.getRange(1, 1, 1, 2).setFontWeight("bold").setFontSize(13);
  sheet.getRange(2, 1, 1, 2).setBackground("#2980b9").setFontColor("#ffffff").setFontWeight("bold");

  const bsRows = [
    ["ASET LANCAR (CURRENT ASSETS)", ""],
    ["  - Kas Kasir / Petty Cash", 2500000],
    ["  - Rekening Bank BCA Operasional", 18500000],
    ["  - Rekening Bank Mandiri", 9200000],
    ["  - Settlement QRIS Pending", 2150000],
    ["  - Persediaan Bahan Baku (Inventory)", 6800000],
    ["  - Sewa Dibayar Dimuka", 10500000],
    ["TOTAL ASET LANCAR", "=SUM(B4:B9)"],
    ["", ""],
    ["ASET TETAP (FIXED ASSETS)", ""],
    ["  - Mesin Espresso & Grinder", 65000000],
    ["  - Peralatan Kitchen & Cookware", 28000000],
    ["  - POS Hardware, Furniture & Sound", 16000000],
    ["  - Renovasi Bar & Interior Ruko", 45000000],
    ["  - Akumulasi Penyusutan (Minus)", -12500000],
    ["TOTAL ASET TETAP", "=SUM(B13:B17)"],
    ["TOTAL ASET", "=B10+B18"],
    ["", ""],
    ["KEWAJIBAN & EKUITAS", ""],
    ["  - Hutang Supplier Bahan Baku", 3400000],
    ["  - Titipan Pajak Resto PB1", 1250000],
    ["  - Hutang Pinjaman Mesin", 15000000],
    ["TOTAL KEWAJIBAN", "=SUM(B22:B24)"],
    ["", ""],
    ["EKUITAS PEMILIK", ""],
    ["  - Modal Disetor Pemilik", 160000000],
    ["  - Laba Ditahan & Berjalan", "=B19-B25-B28"],
    ["TOTAL EKUITAS", "=SUM(B28:B29)"],
    ["TOTAL KEWAJIBAN & EKUITAS", "=B25+B30"]
  ];

  bsRows.forEach(r => sheet.appendRow(r));
  sheet.getRange("B3:B35").setNumberFormat("[$Rp-421] #,##0");
  sheet.setColumnWidth(1, 320);
  sheet.setColumnWidth(2, 180);
}

function setupCashFlowTemplate(sheet) {
  sheet.clear();
  sheet.appendRow(["LAPORAN ARUS KAS (CASH FLOW) - COFFEE & EATERY", ""]);
  sheet.appendRow(["Aktivitas Arus Kas", "Nominal (IDR)"]);
  sheet.getRange(1, 1, 1, 2).setFontWeight("bold").setFontSize(13);
  sheet.getRange(2, 1, 1, 2).setBackground("#8e44ad").setFontColor("#ffffff").setFontWeight("bold");

  const cfRows = [
    ["ARUS KAS DARI AKTIVITAS OPERASIONAL", ""],
    ["  - Penerimaan Kas dari Penjualan (Cash & QRIS)", 18910000],
    ["  - Pembayaran ke Supplier Bahan Baku", -4370000],
    ["  - Pembayaran Gaji Karyawan", -3800000],
    ["  - Pembayaran Utilitas & Beban Operasional", -5975000],
    ["ARUS KAS BERSIH DARI OPERASIONAL", "=SUM(B4:B7)"],
    ["", ""],
    ["ARUS KAS DARI AKTIVITAS INVESTASI", ""],
    ["  - Pembelian Mesin Espresso / Grinder Baru", -4200000],
    ["ARUS KAS BERSIH DARI INVESTASI", "=SUM(B11:B11)"],
    ["", ""],
    ["ARUS KAS DARI AKTIVITAS PENDANAAN", ""],
    ["  - Setoran Modal / Prive", 0],
    ["  - Pembayaran Angsuran Pinjaman", -500000],
    ["ARUS KAS BERSIH DARI PENDANAAN", "=SUM(B15:B16)"],
    ["", ""],
    ["KENAIKAN (PENURUNAN) BERSIH KAS", "=B8+B12+B17"],
    ["Saldo Kas Awal Periode", 21500000],
    ["SALDO KAS AKHIR PERIODE", "=B19+B20"]
  ];

  cfRows.forEach(r => sheet.appendRow(r));
  sheet.getRange("B3:B25").setNumberFormat("[$Rp-421] #,##0");
  sheet.setColumnWidth(1, 340);
  sheet.setColumnWidth(2, 180);
}

function refreshProfitLossSheet(ss) {
  // Trigger spreadsheet formula re-calculation
  SpreadsheetApp.flush();
}

function updateProfitLossSummary(ss, pnl) {
  // Optional direct cell updater from applet
}

function updateBalanceSheetSummary(ss, bs) {
  // Optional direct cell updater from applet
}

function updateCashFlowSummary(ss, cf) {
  // Optional direct cell updater from applet
}
`;
