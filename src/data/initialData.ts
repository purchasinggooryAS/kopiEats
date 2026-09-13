import { Transaction, AppScriptConfig } from '../types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // PENJUALAN / REVENUE
  {
    id: 'tx-101',
    date: '2026-09-08',
    type: 'income',
    category: 'Penjualan Coffee & Beverages',
    subcategory: 'Espresso-based & Signature Drinks',
    amount: 4850000,
    paymentMethod: 'QRIS',
    vendorOrCustomer: 'Pelanggan Dine-in & Takeaway',
    description: 'Omset penjualan kopi espresso & signature iced latte shift pagi-malam',
    source: 'whatsapp',
    confidence: 0.98,
    createdAt: '2026-09-08T22:30:00.000Z'
  },
  {
    id: 'tx-102',
    date: '2026-09-08',
    type: 'income',
    category: 'Penjualan Kitchen & Eatery',
    subcategory: 'Main Course & Snacks',
    amount: 3200000,
    paymentMethod: 'Cash Kasir',
    vendorOrCustomer: 'Pelanggan Resto',
    description: 'Penjualan pasta, artisan toast, rice bowls & french fries',
    source: 'groq_ai',
    confidence: 0.95,
    createdAt: '2026-09-08T22:31:00.000Z'
  },
  {
    id: 'tx-103',
    date: '2026-09-08',
    type: 'income',
    category: 'Pendapatan Delivery (GoFood/Grab/Shopee)',
    subcategory: 'Online Food Delivery',
    amount: 1750000,
    paymentMethod: 'Transfer Bank',
    vendorOrCustomer: 'Platform GoFood & GrabFood',
    description: 'Settlement penjualan online delivery harian',
    source: 'sheet_sync',
    confidence: 0.99,
    createdAt: '2026-09-08T23:00:00.000Z'
  },
  {
    id: 'tx-104',
    date: '2026-09-07',
    type: 'income',
    category: 'Penjualan Coffee & Beverages',
    subcategory: 'Manual Brew & Cold Brew',
    amount: 5120000,
    paymentMethod: 'QRIS',
    vendorOrCustomer: 'Pelanggan Kafe',
    description: 'Omset minuman kopi & mocktail segar akhir pekan',
    source: 'whatsapp',
    confidence: 0.97,
    createdAt: '2026-09-07T22:15:00.000Z'
  },
  {
    id: 'tx-105',
    date: '2026-09-07',
    type: 'income',
    category: 'Penjualan Kitchen & Eatery',
    subcategory: 'Kitchen Food',
    amount: 2890000,
    paymentMethod: 'Cash Kasir',
    vendorOrCustomer: 'Pelanggan Resto',
    description: 'Penjualan makanan dan camilan sore',
    source: 'manual',
    confidence: 1.0,
    createdAt: '2026-09-07T22:20:00.000Z'
  },
  {
    id: 'tx-106',
    date: '2026-09-06',
    type: 'income',
    category: 'Penjualan Pastry & Bakery',
    subcategory: 'Croissant & Cakes',
    amount: 950000,
    paymentMethod: 'QRIS',
    vendorOrCustomer: 'Pelanggan Kafe',
    description: 'Penjualan croissant almond, pain au chocolat, red velvet slice',
    source: 'whatsapp',
    confidence: 0.96,
    createdAt: '2026-09-06T18:00:00.000Z'
  },

  // HPP / COGS (BEBAN POKOK PENJUALAN)
  {
    id: 'tx-201',
    date: '2026-09-08',
    type: 'expense',
    category: 'Susu & Dairy Products',
    subcategory: 'Fresh Milk & Oat Milk',
    amount: 740000,
    paymentMethod: 'Cash Kasir',
    vendorOrCustomer: 'Toko Susu Sejahtera',
    description: 'Beli susu Greenfields 2 karton (24 liter) + Oatside 6 liter tunai',
    source: 'whatsapp',
    confidence: 0.96,
    createdAt: '2026-09-08T09:15:00.000Z'
  },
  {
    id: 'tx-202',
    date: '2026-09-07',
    type: 'expense',
    category: 'Bahan Baku Biji Kopi (Beans)',
    subcategory: 'House Blend & Single Origin',
    amount: 1450000,
    paymentMethod: 'Transfer Bank',
    vendorOrCustomer: 'Roastery Kopi Nusantara',
    description: 'Restock beans Arabica Gayo 3kg dan Flores Bajawa 2kg @290rb',
    source: 'whatsapp',
    confidence: 0.99,
    createdAt: '2026-09-07T11:00:00.000Z'
  },
  {
    id: 'tx-203',
    date: '2026-09-07',
    type: 'expense',
    category: 'Bahan Baku Kitchen & Makanan',
    subcategory: 'Daging, Sayur & Bahan Pokok',
    amount: 980000,
    paymentMethod: 'Cash Kasir',
    vendorOrCustomer: 'Pasar Induk & Supplier Daging',
    description: 'Beli daging ayam fillet 6kg, smoked beef, keju mozzarella, sayuran segar',
    source: 'groq_ai',
    confidence: 0.94,
    createdAt: '2026-09-07T08:30:00.000Z'
  },
  {
    id: 'tx-204',
    date: '2026-09-05',
    type: 'expense',
    category: 'Kemasan & Packaging (Cup, Straw, Box)',
    subcategory: 'Paper Cup & Lunch Box',
    amount: 520000,
    paymentMethod: 'Transfer Bank',
    vendorOrCustomer: 'Toko Kemasan Prima',
    description: 'Cup 16oz dingin 500 pcs, cup hot 8oz 200 pcs, sedotan kertas & tas take-away',
    source: 'whatsapp',
    confidence: 0.95,
    createdAt: '2026-09-05T14:20:00.000Z'
  },
  {
    id: 'tx-205',
    date: '2026-09-04',
    type: 'expense',
    category: 'Syrup, Powder & Topping',
    subcategory: 'Monin Syrup & Matcha Powder',
    amount: 680000,
    paymentMethod: 'Transfer Bank',
    vendorOrCustomer: 'Distributor Beverage Solution',
    description: 'Sirup Caramel Monin 2 btl, Hazelnut 1 btl, Pure Uji Matcha powder 500g',
    source: 'sheet_sync',
    confidence: 0.98,
    createdAt: '2026-09-04T13:00:00.000Z'
  },

  // OPEX (BEBAN OPERASIONAL)
  {
    id: 'tx-301',
    date: '2026-09-05',
    type: 'expense',
    category: 'Gaji Barista & Kitchen Staff',
    subcategory: 'Payroll Karyawan Periode 1',
    amount: 3800000,
    paymentMethod: 'Transfer Bank',
    vendorOrCustomer: 'Tim Barista & Cook',
    description: 'Upah mingguan & uang transport 4 staff barista dan 2 kitchen helper',
    source: 'manual',
    confidence: 1.0,
    createdAt: '2026-09-05T17:00:00.000Z'
  },
  {
    id: 'tx-302',
    date: '2026-09-06',
    type: 'expense',
    category: 'Listrik & Air (PLN & PDAM)',
    subcategory: 'Listrik Kafe 6600VA',
    amount: 850000,
    paymentMethod: 'Transfer Bank',
    vendorOrCustomer: 'PLN Persero',
    description: 'Isi token listrik 6600VA untuk mesin kopi, chiller & pendingin ruangan',
    source: 'whatsapp',
    confidence: 0.97,
    createdAt: '2026-09-06T10:00:00.000Z'
  },
  {
    id: 'tx-303',
    date: '2026-09-06',
    type: 'expense',
    category: 'Gas LPG Kitchen',
    subcategory: 'Gas Bright 12kg',
    amount: 225000,
    paymentMethod: 'Cash Kasir',
    vendorOrCustomer: 'Agen Gas Sumber Rezeki',
    description: 'Refill gas Bright Gas 12kg untuk kitchen kompor goreng & pasta',
    source: 'whatsapp',
    confidence: 0.96,
    createdAt: '2026-09-06T11:45:00.000Z'
  },
  {
    id: 'tx-304',
    date: '2026-09-03',
    type: 'expense',
    category: 'Wi-Fi & Software Kasir (POS)',
    subcategory: 'Moka POS & Internet',
    amount: 450000,
    paymentMethod: 'Transfer Bank',
    vendorOrCustomer: 'Moka POS & Indihome',
    description: 'Langganan software POS kasir & tagihan internet Wi-Fi 100Mbps',
    source: 'manual',
    confidence: 1.0,
    createdAt: '2026-09-03T09:00:00.000Z'
  },
  {
    id: 'tx-305',
    date: '2026-09-02',
    type: 'expense',
    category: 'Pemeliharaan Mesin & Peralatan',
    subcategory: 'Maintenance Espresso Machine',
    amount: 450000,
    paymentMethod: 'Transfer Bank',
    vendorOrCustomer: 'Teknisi Espresso Care',
    description: 'Penggantian group head silicone gasket, shower screen & descaling La Marzocco',
    source: 'whatsapp',
    confidence: 0.95,
    createdAt: '2026-09-02T15:30:00.000Z'
  },
  {
    id: 'tx-306',
    date: '2026-09-01',
    type: 'expense',
    category: 'Pemasaran & Media Sosial',
    subcategory: 'Instagram Ads & Promo Influencer',
    amount: 500000,
    paymentMethod: 'Transfer Bank',
    vendorOrCustomer: 'Meta Ads',
    description: 'Iklan Instagram targeted radius 5km untuk promosi menu signature mocktail',
    source: 'manual',
    confidence: 1.0,
    createdAt: '2026-09-01T12:00:00.000Z'
  },
  {
    id: 'tx-307',
    date: '2026-09-01',
    type: 'expense',
    category: 'Sewa Tempat / Ruko',
    subcategory: 'Alokasi Beban Sewa Bulanan',
    amount: 3500000,
    paymentMethod: 'Transfer Bank',
    vendorOrCustomer: 'Pemilik Ruko',
    description: 'Alokasi amortisasi beban sewa tempat ruko bulan berjalan',
    source: 'manual',
    confidence: 1.0,
    createdAt: '2026-09-01T08:00:00.000Z'
  },

  // ASSET / CAPITAL
  {
    id: 'tx-401',
    date: '2026-09-01',
    type: 'asset',
    category: 'Mesin Espresso & Grinder',
    subcategory: 'Grinder Espresso Single Dose',
    amount: 4200000,
    paymentMethod: 'Transfer Bank',
    vendorOrCustomer: 'Kopi Hardware Indonesia',
    description: 'Pembelian grinder single dose untuk manual brew bar',
    source: 'manual',
    confidence: 1.0,
    createdAt: '2026-09-01T10:00:00.000Z'
  }
];

export const INITIAL_APPSCRIPT_CONFIG: AppScriptConfig = {
  appscriptUrl: '',
  googleSheetUrl: '',
  groqApiKey: '',
  groqModel: 'openai/gpt-oss-120b',
  autoSyncToSheets: true,
  whatsappPhoneNumber: '6281234567890',
  lastSyncedAt: new Date().toISOString()
};

export const SAMPLE_WHATSAPP_MESSAGES = [
  {
    label: 'Beli Susu & Sirup (Cash)',
    text: 'Beli susu greenfields 10 karton @185.000 cash kasir sama sirup caramel 2 btl 240.000 dari toko sembako jaya'
  },
  {
    label: 'Closing Shift Malam (Omset)',
    text: 'Closing shift malam: total omset 4.850.000 (QRIS 3.200.000, Tunai Kasir 1.650.000). Total cup kopi 142 cup.'
  },
  {
    label: 'Restock Beans Arabica (Transfer)',
    text: 'Restock biji kopi arabica gayo 6kg total 1.680.000 transfer bca ke roastery kopi nusantara'
  },
  {
    label: 'Belanja Sayur & Ayam Dapur',
    text: 'Belanja dapur basah: ayam fillet 5kg 195rb, sayuran selada tomat 85rb, telur 2 tray 110rb cash kasir pasar segar'
  },
  {
    label: 'Bayar Token Listrik PLN',
    text: 'Isi token listrik pln kafe 500.000 transfer bca bukti struk terlampir'
  },
  {
    label: 'Beli Cup & Paper Bag',
    text: 'Beli cup dingin 16oz 1000 pcs 450rb dan sedotan 50rb bayar tunai toko plastik sumber baru'
  }
];
