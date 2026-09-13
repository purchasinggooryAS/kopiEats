import { ReceiptScanResult } from '../types';

export interface ReceiptSample {
  id: string;
  name: string;
  vendor: string;
  category: string;
  amount: number;
  date: string;
  badge: string;
  description: string;
  previewText: string;
  scanResult: ReceiptScanResult;
}

export const SAMPLE_RECEIPTS: ReceiptSample[] = [
  {
    id: 'sample-dairy',
    name: 'Struk Susu & Dairy Sejahtera',
    vendor: 'Toko Susu & Dairy Sejahtera',
    category: 'Susu & Dairy Products',
    amount: 740000,
    date: '2026-09-08',
    badge: 'HPP Susu',
    description: 'Pembelian Greenfields Fresh Milk 2 karton + Oatside Barista Blend 6 liter tunai',
    previewText: `=================================
    TOKO SUSU SEJAHTERA
Jl. Fatmawati No. 42, Jakarta Selatan
Telp: (021) 7590-1234
=================================
TANGGAL: 08/09/2026  14:35:10
KASIR  : Rian
NO STRUK: STR-20260908-0891
---------------------------------
ITEM                QTY  TOTAL
---------------------------------
Greenfields Fresh 1L  24  Rp 440.000
(2 Karton @ Rp 220.000)
Oatside Barista 1L     6  Rp 252.000
(@ Rp 42.000)
Diamond Whip Cream 1L  2  Rp  48.000
(@ Rp 24.000)
---------------------------------
SUBTOTAL                 Rp 740.000
PAJAK PB1 (0%)           Rp       0
TOTAL AKHIR              Rp 740.000
---------------------------------
BAYAR (CASH KASIR)       Rp 800.000
KEMBALIAN                Rp  60.000
=================================
 Terima Kasih Atas Kunjungan Anda
    Barang yang sudah dibeli
   tidak dapat ditukar kembali
=================================`,
    scanResult: {
      vendorName: 'Toko Susu & Dairy Sejahtera',
      date: '2026-09-08',
      amount: 740000,
      subtotal: 740000,
      taxAmount: 0,
      category: 'Susu & Dairy Products',
      subcategory: 'Fresh Milk & Oat Milk Barista',
      paymentMethod: 'Cash Kasir',
      receiptNumber: 'STR-20260908-0891',
      confidence: 0.98,
      aiEngine: 'gemini-3.8-flash (Vision OCR)',
      notes: 'Bahan baku utama latte, cappuccino & kopi susu gula aren.',
      lineItems: [
        { itemName: 'Greenfields Fresh Milk 1L (Karton isi 12)', qty: 2, unitPrice: 220000, totalPrice: 440000 },
        { itemName: 'Oatside Barista Blend 1L', qty: 6, unitPrice: 42000, totalPrice: 252000 },
        { itemName: 'Diamond Whipping Cream UHT 1L', qty: 2, unitPrice: 24000, totalPrice: 48000 }
      ],
      rawText: 'TOKO SUSU SEJAHTERA | Tgl: 08/09/2026 | Total: Rp 740.000 | Greenfields 2ktn, Oatside 6L, Diamond 2L'
    }
  },
  {
    id: 'sample-roastery',
    name: 'Invoice Roastery Biji Kopi Gayo',
    vendor: 'Gayo Artisan Roastery & Coffee Lab',
    category: 'Bahan Baku Biji Kopi (Beans)',
    amount: 1815000,
    date: '2026-09-07',
    badge: 'HPP Biji Kopi',
    description: 'Pengadaan roasted beans Arabica Gayo Natural 3kg & House Blend Espresso 5kg',
    previewText: `=================================
   GAYO ARTISAN ROASTERY
  Specialty Coffee Roasters & Lab
Jl. Senopati No. 88, Jakarta Selatan
NPWP: 02.456.789.1-012.000
=================================
INVOICE: INV/ROAST/2026/09/104
TANGGAL: 07/09/2026  10:15
CUSTOMER: Senja Rasa Coffee & Eatery
---------------------------------
PRODUK ROAST BEANS     QTY  TOTAL
---------------------------------
Arabica Gayo Natural    3kg  Rp 840.000
Roast: Medium (@ 280.000)
House Blend 70:30       5kg  Rp 975.000
(Arabica:Robusta @ 195.000)
---------------------------------
TOTAL BELANJA           Rp 1.815.000
PEMBAYARAN              TRANSFER BCA
STATUS                  LUNAS
=================================
  Simpan di suhu ruang (20-25C)
     Best before: 60 hari
=================================`,
    scanResult: {
      vendorName: 'Gayo Artisan Roastery & Coffee Lab',
      date: '2026-09-07',
      amount: 1815000,
      subtotal: 1815000,
      taxAmount: 0,
      category: 'Bahan Baku Biji Kopi (Beans)',
      subcategory: 'Specialty Roasted Beans & House Blend',
      paymentMethod: 'Transfer Bank',
      receiptNumber: 'INV/ROAST/2026/09/104',
      confidence: 0.99,
      aiEngine: 'gemini-3.8-flash (Vision OCR)',
      notes: 'Biji kopi blend espresso reguler & manual brew V60.',
      lineItems: [
        { itemName: 'Arabica Gayo Natural Medium Roast (1kg)', qty: 3, unitPrice: 280000, totalPrice: 840000 },
        { itemName: 'House Blend Espresso (70% Arabica, 30% Robusta) (1kg)', qty: 5, unitPrice: 195000, totalPrice: 975000 }
      ],
      rawText: 'GAYO ARTISAN ROASTERY | INV/ROAST/2026/09/104 | Tgl: 07/09/2026 | Total: Rp 1.815.000 Transfer BCA'
    }
  },
  {
    id: 'sample-packaging',
    name: 'Nota Toko Kemasan Plastik & Cup',
    vendor: 'Toko Plastik & Kemasan Prima Pack',
    category: 'Kemasan & Packaging (Cup, Straw, Box)',
    amount: 702000,
    date: '2026-09-06',
    badge: 'HPP Packaging',
    description: 'Cold cup PET 16oz + lid dome, paper hot cup 8oz, sedotan oxo-biodegradable',
    previewText: `=================================
      PRIMA PACK KEMASAN
 Supplier Cup, Straw, & Food Box
Pasar Pagi Mangga Dua Blok B No. 12
Telp / WA: 0812-9988-7766
=================================
NOTA NO: NOTA-77492
TANGGAL: 06/09/2026
---------------------------------
NAMA BARANG          QTY    HARGA
---------------------------------
Cold Cup PET 16oz     10 slop Rp 380.000
+ Lid Dome (@ 38.000)
Paper Cup Hot 8oz      5 slop Rp 160.000
Double Wall (@ 32.000)
Sedotan Steril Bio     4 pack Rp  72.000
Paper Lunchbox M       2 pack Rp  90.000
---------------------------------
TOTAL NOMINAL                 Rp 702.000
METODE BAYAR: CASH KASIR
=================================
Barang dicek sebelum meninggalkan toko.
=================================`,
    scanResult: {
      vendorName: 'Toko Plastik & Kemasan Prima Pack',
      date: '2026-09-06',
      amount: 702000,
      subtotal: 702000,
      taxAmount: 0,
      category: 'Kemasan & Packaging (Cup, Straw, Box)',
      subcategory: 'Cold Cup & Hot Cup Disposables',
      paymentMethod: 'Cash Kasir',
      receiptNumber: 'NOTA-77492',
      confidence: 0.96,
      aiEngine: 'gemini-3.8-flash (Vision OCR)',
      notes: 'Kemasan take-away untuk 500 cup minuman dingin & panas.',
      lineItems: [
        { itemName: 'Cold Cup PET 16oz + Lid Dome (50pcs/slop)', qty: 10, unitPrice: 38000, totalPrice: 380000 },
        { itemName: 'Hot Paper Cup 8oz Double Wall (50pcs/slop)', qty: 5, unitPrice: 32000, totalPrice: 160000 },
        { itemName: 'Sedotan Steril Oxo-Biodegradable (100pcs/pack)', qty: 4, unitPrice: 18000, totalPrice: 72000 },
        { itemName: 'Paper Lunchbox Kraft M (50pcs/pack)', qty: 2, unitPrice: 45000, totalPrice: 90000 }
      ],
      rawText: 'PRIMA PACK KEMASAN | NOTA-77492 | Tgl: 06/09/2026 | Total Rp 702.000 | Cup PET 16oz, Hot Cup 8oz'
    }
  },
  {
    id: 'sample-pln',
    name: 'Struk Pembelian Token Listrik PLN',
    vendor: 'PLN Distribusi Jakarta Raya (Prabayar)',
    category: 'Listrik & Air (PLN & PDAM)',
    amount: 502500,
    date: '2026-09-05',
    badge: 'OPEX Listrik',
    description: 'Pembelian token listrik PLN daya 5500 VA operasional mesin espresso & grinder',
    previewText: `=================================
      STRUK PEMBELIAN LISTRIK
           PRABAYAR PLN
=================================
TANGGAL : 05/09/2026  18:40:22
NO METER: 3209-8812-4431
IDPEL   : 5411-0092-7811
NAMA    : SENJA RASA COFFEE
TARIF   : B1 / 5500 VA
---------------------------------
RP BAYAR: Rp 500.000
ADMIN   : Rp   2.500
TOTAL   : Rp 502.500
---------------------------------
TOKEN   : 8741 - 2091 - 3844 - 1092 - 7721
KWH     : 312.4 kWh
=================================
Informasi Hubungi Call Center 123
=================================`,
    scanResult: {
      vendorName: 'PLN Distribusi Jakarta Raya (Prabayar)',
      date: '2026-09-05',
      amount: 502500,
      subtotal: 500000,
      taxAmount: 2500,
      category: 'Listrik & Air (PLN & PDAM)',
      subcategory: 'Token Listrik PLN 5500 VA',
      paymentMethod: 'Transfer Bank',
      receiptNumber: 'PLN-320988124431',
      confidence: 0.99,
      aiEngine: 'gemini-3.8-flash (Vision OCR)',
      notes: 'Token listrik 312.4 kWh untuk operasional 2 grup espresso machine.',
      lineItems: [
        { itemName: 'Token Listrik Prabayar PLN 5500VA (312.4 kWh)', qty: 1, unitPrice: 500000, totalPrice: 500000 },
        { itemName: 'Biaya Layanan Admin Bank Transaksi', qty: 1, unitPrice: 2500, totalPrice: 2500 }
      ],
      rawText: 'STRUK TOKEN LISTRIK PRABAYAR PLN | IDPEL: 541100927811 | Rp 502.500 | TOKEN: 8741-2091-3844-1092-7721'
    }
  }
];
