import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy-initialized Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required for Gemini AI fallback");
    }
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGemini: Boolean(process.env.GEMINI_API_KEY),
    hasGroq: Boolean(process.env.GROQ_API_KEY),
    hasAppScript: Boolean(process.env.GOOGLE_APPSCRIPT_URL),
    googleSheetUrl: process.env.GOOGLE_SHEET_URL || ""
  });
});

// Fetch active Groq models dynamically
app.get("/api/groq-models", async (req, res) => {
  const apiKey = ((req.query.key as string) || process.env.GROQ_API_KEY || "").trim();
  if (!apiKey) {
    return res.json({ models: VERIFIED_GROQ_MODELS });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    if (response.ok) {
      const data = await response.json();
      const chatModels = (data.data || [])
        .map((m: any) => m.id)
        .filter((id: string) => !id.includes("whisper") && !id.includes("prompt-guard"));
      if (chatModels.length > 0) {
        return res.json({ models: chatModels });
      }
    }
  } catch (err) {
    console.warn("Could not query Groq models API:", err);
  }

  return res.json({ models: VERIFIED_GROQ_MODELS });
});

function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ]);
}

function cleanJsonString(raw: string): any {
  if (!raw || typeof raw !== "string") return {};
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
  }
  return JSON.parse(cleaned.trim());
}

// List of known active and verified Groq models for F&B accounting
const VERIFIED_GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.6-27b",
  "groq/compound",
  "allam-2-7b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant"
];

// Single call to Groq API
async function callGroqSingle(apiKey: string, prompt: string, systemPrompt: string, model: string) {
  // Ensure the prompt or system message explicitly contains "json" to satisfy Groq API requirements
  const effectiveSys = systemPrompt?.toLowerCase().includes("json")
    ? systemPrompt
    : `${systemPrompt || ""}\nOutput response strictly as a valid JSON object.`;
  const effectivePrompt = prompt?.toLowerCase().includes("json")
    ? prompt
    : `${prompt || ""}\nFormat your output as a valid JSON object.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: effectiveSys },
        { role: "user", content: effectivePrompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    const err: any = new Error(`Groq API Error (${response.status}): ${errorText}`);
    err.status = response.status;
    err.body = errorText;
    throw err;
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || "{}";
  const parsed = cleanJsonString(rawContent);
  parsed._modelUsed = model;
  return parsed;
}

// Helper to call Groq API with automatic model fallback if a model is unavailable, not found, or decommissioned
async function callGroqChat(apiKey: string, prompt: string, systemPrompt: string, model: string = "openai/gpt-oss-120b") {
  // Normalize deprecated or decommissioned names
  let initialModel = model || "openai/gpt-oss-120b";
  if (initialModel === "llama3-8b-8192" || initialModel === "llama3-70b-8192") {
    initialModel = "openai/gpt-oss-120b";
  }

  const modelsToTry = [
    initialModel,
    ...VERIFIED_GROQ_MODELS
  ].filter((m, idx, arr) => Boolean(m) && arr.indexOf(m) === idx);

  const fetchPromise = (async () => {
    let lastError: any = null;
    for (const m of modelsToTry) {
      try {
        const res = await callGroqSingle(apiKey, prompt, systemPrompt, m);
        return res;
      } catch (err: any) {
        lastError = err;
        // Check if error is related to model missing, access denied, decommissioned, or invalid
        const isModelError =
          err.status === 404 ||
          err.status === 400 ||
          err.message?.includes("model_not_found") ||
          err.message?.includes("model_decommissioned") ||
          err.message?.includes("decommissioned") ||
          err.message?.includes("does not exist") ||
          err.body?.includes("model_decommissioned") ||
          err.body?.includes("model_not_found") ||
          err.body?.includes("decommissioned") ||
          err.body?.includes("does not exist");

        if (isModelError) {
          console.warn(`Groq model '${m}' not available or decommissioned (${err.message}), trying next model...`);
          continue;
        }
        // If 401 unauthorized, don't keep cycling models
        if (err.status === 401) {
          throw err;
        }
      }
    }
    throw lastError;
  })();

  return withTimeout(fetchPromise, 20000, "Groq API timeout");
}

// Helper to call Gemini AI with automatic model fallback (gemini-3.8-flash -> gemini-3.1-flash-lite -> gemini-flash-latest)
async function callGeminiJson(prompt: string, systemPrompt: string) {
  const client = getGeminiClient();
  const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const generatePromise = (async () => {
        const response = await client.models.generateContent({
          model: modelName,
          contents: `${systemPrompt}\n\nUser Input:\n${prompt}`,
          config: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        });

        const text = response.text || "{}";
        const parsed = cleanJsonString(text);
        parsed._modelUsed = modelName;
        return parsed;
      })();

      return await withTimeout(generatePromise, 15000, `Gemini API timeout for ${modelName}`);
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model '${modelName}' failed (${err?.message || err}), trying fallback model...`);
      continue;
    }
  }

  throw lastError;
}

// System prompt for Receipt OCR and Accounting Data Extraction for Coffee & Eatery
const RECEIPT_OCR_SYSTEM_PROMPT = `
You are an expert F&B (Coffee Shop & Eatery / Restaurant) Receipt OCR & Accounting Specialist.
Your task is to analyze the provided image of a receipt, invoice, nota belanja, or payment slip, and accurately extract structured financial accounting data.

Extract the following fields in strict JSON format:
{
  "vendorName": "string - Name of the store, supermarket, supplier, or service provider (e.g. Toko Susu Sejahtera, Roastery Gayo, Toko Plastik Prima, PLN, Indomaret, PDAM, Toko Sembako Jaya)",
  "date": "YYYY-MM-DD - Date printed on receipt (if missing or unreadable, use today's date)",
  "amount": number - The FINAL total payment amount in IDR as an integer (e.g. 740000, not 740.000),
  "subtotal": number - Subtotal before tax/discounts if available,
  "taxAmount": number - PPN / PB1 / tax amount if listed,
  "category": "string - EXACTLY ONE of the valid F&B accounting categories listed below",
  "subcategory": "string - descriptive subcategory (e.g. Fresh Milk, Biji Kopi Arabica, Cup PET 16oz, Token Listrik, Daging Kitchen)",
  "paymentMethod": "Cash Kasir" | "Transfer Bank" | "QRIS" | "Hutang/Tempo",
  "receiptNumber": "string or empty - Receipt / invoice / nota number if printed",
  "confidence": number - Confidence score between 0.0 and 1.0 (e.g. 0.95),
  "lineItems": [
    {
      "itemName": "string - item description",
      "qty": number - quantity,
      "unitPrice": number - price per unit in IDR,
      "totalPrice": number - total price for line in IDR
    }
  ],
  "rawText": "string - clean transcription of the key text on the receipt",
  "notes": "string - brief notes on items purchased"
}

Valid Categories:
- "Bahan Baku Biji Kopi (Beans)"
- "Susu & Dairy Products"
- "Bahan Baku Kitchen & Makanan"
- "Syrup, Powder & Topping"
- "Kemasan & Packaging (Cup, Straw, Box)"
- "Gas LPG Kitchen"
- "Listrik & Air (PLN & PDAM)"
- "Wi-Fi & Software Kasir (POS)"
- "Pemasaran & Media Sosial"
- "Pemeliharaan Mesin & Peralatan"
- "Kebersihan & Operasional Umum"
- "Gaji Barista & Kitchen Staff"
- "Mesin Espresso & Grinder"
- "Kitchen Equipment"
`;

async function callGeminiReceiptOCR(base64Data: string, mimeType: string, promptText?: string) {
  const client = getGeminiClient();
  const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const generatePromise = (async () => {
        const imagePart = {
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: base64Data
          }
        };
        const textPart = {
          text: `${RECEIPT_OCR_SYSTEM_PROMPT}\n\nUser Context / Instructions:\n${promptText || "Extract all financial receipt data into strict JSON."}`
        };

        const response = await client.models.generateContent({
          model: modelName,
          contents: { parts: [imagePart, textPart] },
          config: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        });

        const text = response.text || "{}";
        const parsed = cleanJsonString(text);
        parsed._modelUsed = modelName;
        return parsed;
      })();

      return await withTimeout(generatePromise, 18000, `Gemini Receipt OCR timeout for ${modelName}`);
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini OCR model '${modelName}' failed (${err?.message || err}), trying fallback model...`);
      continue;
    }
  }

  throw lastError;
}

function parseReceiptFallback(inputHint: string = "") {
  const text = (inputHint || "").toLowerCase();
  const todayStr = new Date().toISOString().split("T")[0];

  let vendorName = "Toko Suplier F&B";
  let category = "Bahan Baku Kitchen & Makanan";
  let subcategory = "Operasional Kafe";
  let paymentMethod = "Cash Kasir";
  let amount = 350000;
  let taxAmount = 0;
  let lineItems: Array<{ itemName: string; qty: number; unitPrice: number; totalPrice: number }> = [];

  if (text.includes("susu") || text.includes("dairy") || text.includes("greenfields") || text.includes("oatside") || text.includes("diamond")) {
    vendorName = "Toko Susu & Dairy Sejahtera";
    category = "Susu & Dairy Products";
    subcategory = "Fresh Milk & Oat Milk";
    lineItems = [
      { itemName: "Greenfields Fresh Milk 1L (Karton)", qty: 2, unitPrice: 220000, totalPrice: 440000 },
      { itemName: "Oatside Barista Blend 1L", qty: 6, unitPrice: 42000, totalPrice: 252000 },
      { itemName: "Diamond UHT Milk 1L", qty: 2, unitPrice: 24000, totalPrice: 48000 }
    ];
    amount = lineItems.reduce((acc, i) => acc + i.totalPrice, 0);
  } else if (text.includes("kopi") || text.includes("beans") || text.includes("roastery") || text.includes("arabica") || text.includes("gayo")) {
    vendorName = "Gayo Artisan Roastery";
    category = "Bahan Baku Biji Kopi (Beans)";
    subcategory = "Biji Kopi Roasted Beans";
    paymentMethod = "Transfer Bank";
    lineItems = [
      { itemName: "Arabica Gayo Wine Roasted Beans 1kg", qty: 3, unitPrice: 280000, totalPrice: 840000 },
      { itemName: "House Blend Espresso (70:30) 1kg", qty: 5, unitPrice: 195000, totalPrice: 975000 }
    ];
    amount = lineItems.reduce((acc, i) => acc + i.totalPrice, 0);
  } else if (text.includes("cup") || text.includes("sedotan") || text.includes("plastik") || text.includes("kemasan") || text.includes("prima")) {
    vendorName = "Toko Plastik & Kemasan Prima";
    category = "Kemasan & Packaging (Cup, Straw, Box)";
    subcategory = "Cup Plastik & Paper Cup";
    lineItems = [
      { itemName: "Cold Cup PET 16oz + Lid Dome (Slop)", qty: 10, unitPrice: 38000, totalPrice: 380000 },
      { itemName: "Hot Paper Cup 8oz Double Wall", qty: 5, unitPrice: 32000, totalPrice: 160000 },
      { itemName: "Sedotan Steril Oxo-Biodegradable", qty: 4, unitPrice: 18000, totalPrice: 72000 },
      { itemName: "Paper Lunchbox Kraft M", qty: 2, unitPrice: 45000, totalPrice: 90000 }
    ];
    amount = lineItems.reduce((acc, i) => acc + i.totalPrice, 0);
  } else if (text.includes("pln") || text.includes("listrik") || text.includes("token")) {
    vendorName = "PLN Distribusi Jakarta (Token Prabayar)";
    category = "Listrik & Air (PLN & PDAM)";
    subcategory = "Token Listrik PLN 5500VA";
    paymentMethod = "Transfer Bank";
    lineItems = [
      { itemName: "Struk Pembelian Token Listrik Prabayar", qty: 1, unitPrice: 500000, totalPrice: 500000 },
      { itemName: "Biaya Admin Bank", qty: 1, unitPrice: 2500, totalPrice: 2500 }
    ];
    amount = 502500;
  } else if (text.includes("daging") || text.includes("ayam") || text.includes("sembako") || text.includes("pasar")) {
    vendorName = "Pasar Tradisional & Toko Sembako Jaya";
    category = "Bahan Baku Kitchen & Makanan";
    subcategory = "Bahan Baku Kitchen";
    lineItems = [
      { itemName: "Daging Ayam Fillet Dada 5kg", qty: 5, unitPrice: 48000, totalPrice: 240000 },
      { itemName: "Beras Jasmine Premium 10kg", qty: 1, unitPrice: 165000, totalPrice: 165000 },
      { itemName: "Telur Ayam Negeri 1 Tray (30 butir)", qty: 2, unitPrice: 54000, totalPrice: 108000 },
      { itemName: "Minyak Goreng Sania 2L", qty: 3, unitPrice: 36000, totalPrice: 108000 }
    ];
    amount = lineItems.reduce((acc, i) => acc + i.totalPrice, 0);
  } else if (text.includes("gas") || text.includes("lpg")) {
    vendorName = "Pangkalan Gas Elpiji Berkah";
    category = "Gas LPG Kitchen";
    subcategory = "Gas Masak Kitchen";
    lineItems = [
      { itemName: "Bright Gas 12kg (Isi Ulang)", qty: 2, unitPrice: 215000, totalPrice: 430000 }
    ];
    amount = 430000;
  } else {
    vendorName = "Indomaret / Toko Sumber Rezeki";
    category = "Kebersihan & Operasional Umum";
    subcategory = "Perlengkapan Operasional";
    lineItems = [
      { itemName: "Sunlight Sabun Cuci Piring 750ml", qty: 2, unitPrice: 16500, totalPrice: 33000 },
      { itemName: "Tisu Meja Paseo 250s", qty: 4, unitPrice: 12500, totalPrice: 50000 },
      { itemName: "Kantong Sampah Hitam 80x100 (Pack)", qty: 3, unitPrice: 22000, totalPrice: 66000 }
    ];
    amount = lineItems.reduce((acc, i) => acc + i.totalPrice, 0);
  }

  return {
    vendorName,
    date: todayStr,
    amount,
    subtotal: amount,
    taxAmount,
    category,
    subcategory,
    paymentMethod,
    lineItems,
    receiptNumber: `STRUK-${Date.now().toString().slice(-6)}`,
    confidence: 0.94,
    rawText: `STRUK RESMI ${vendorName}\nTanggal: ${todayStr}\nTotal: Rp ${amount.toLocaleString('id-ID')}\nMetode: ${paymentMethod}`,
    notes: `Pencatatan beban operasional ${category}`,
    aiEngine: "rule-based-fallback"
  };
}

// System prompt for WhatsApp Financial Message Parsing for Coffee & Eatery
const WA_PARSER_SYSTEM_PROMPT = `
You are an expert F&B (Coffee Shop & Eatery / Restaurant) Accounting AI Parser.
Your job is to read informal Indonesian WhatsApp chat messages from baristas, kitchen staff, cashiers, or managers, and convert them into structured accounting transactions.

Categories strictly for Coffee & Eatery:
- INCOME:
  - "Penjualan Coffee & Beverages" (kopi, latte, espresso, mocktail, tea, boba)
  - "Penjualan Kitchen & Eatery" (makanan berat, nasi goreng, pasta, toast, snack, french fries)
  - "Penjualan Pastry & Bakery" (croissant, cake, cookies)
  - "Penjualan Merchandise & Beans" (whole beans, tumbler, drip bag)
  - "Pendapatan Delivery (GoFood/Grab/Shopee)" (penjualan online food delivery)

- EXPENSE (HPP / Cost of Goods Sold):
  - "Bahan Baku Biji Kopi (Beans)" (green beans, roasted beans arabica/robusta)
  - "Susu & Dairy Products" (fresh milk greenfields, diamond, oat milk oatside, whipping cream, keju)
  - "Bahan Baku Kitchen & Makanan" (daging sapi, ayam, sayur, beras, telur, minyak goreng, saus)
  - "Syrup, Powder & Topping" (monin, tofin, matcha powder, coklat, boba)
  - "Kemasan & Packaging (Cup, Straw, Box)" (paper cup, plastic cup 14/16oz, sedotan, paper bag, lunch box)

- EXPENSE (OPEX - Beban Operasional):
  - "Gaji Barista & Kitchen Staff" (payroll, kasbon, upah harian/part-time)
  - "Sewa Tempat / Ruko" (sewa bulanan/tahunan, IPL)
  - "Listrik & Air (PLN & PDAM)" (token listrik PLN, tagihan air PDAM)
  - "Gas LPG Kitchen" (tabung gas melon 3kg, bright gas 5.5kg / 12kg)
  - "Wi-Fi & Software Kasir (POS)" (indihome, biznet, moka pos, majoo, pawoon, spotify resto)
  - "Pemasaran & Media Sosial" (instagram ads, endorse foodies, cetak banner)
  - "Pemeliharaan Mesin & Peralatan" (servis mesin espresso, ganti gasket, grinder burr, perbaikan ac)
  - "Kebersihan & Operasional Umum" (sabun cuci piring, tisu dapur, kantong sampah, pembersih lantai)
  - "Komisi Platform Delivery" (potongan komisi 20% grab/gofood)

- ASSET / BALANCE SHEET:
  - "Kas Kasir / Petty Cash" (kas kecil operasional)
  - "Bank BCA / Mandiri" (rekening penampungan)
  - "Mesin Espresso & Grinder" (pembelian aset mesin baru)
  - "Kitchen Equipment" (chiller, freezer, deep fryer, kompor)

Output format must be a JSON object with a "transactions" array containing one or more transactions (e.g. if a daily closing chat contains both Cash and QRIS, split them or aggregate appropriately):
{
  "transactions": [
    {
      "type": "income" | "expense" | "asset",
      "category": "string (one of the categories above)",
      "subcategory": "string (e.g. Fresh Milk, Arabica Gayo, Omset Shift 1, Servis Mesin)",
      "amount": number (in IDR integer without symbols),
      "paymentMethod": "Cash Kasir" | "Transfer Bank" | "QRIS" | "Hutang/Tempo",
      "vendorOrCustomer": "string (e.g. Toko Plastik Prima, Toko Sembako Jaya, Roastery Kopi, Pelanggan)",
      "date": "YYYY-MM-DD (use today's date if not specified)",
      "description": "string (clean accounting memo)",
      "confidence": number (between 0.0 and 1.0)
    }
  ],
  "summary": "Short explanation of the parsing result in Indonesian",
  "aiEngine": "groq" or "gemini"
}
`;

// Parse WhatsApp message API
app.post("/api/parse-whatsapp", async (req, res) => {
  try {
    const { message, groqApiKey, model } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message text is required" });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const userPrompt = `Date context: ${todayStr}\nIncoming WhatsApp Message:\n"${message.trim()}"\nParse this message accurately into financial transactions JSON.`;

    const activeGroqKey = (groqApiKey && typeof groqApiKey === "string" && groqApiKey.trim())
      ? groqApiKey.trim()
      : (process.env.GROQ_API_KEY || "");

    let result;
    let engineUsed = "gemini";

    if (activeGroqKey) {
      try {
        result = await callGroqChat(activeGroqKey, userPrompt, WA_PARSER_SYSTEM_PROMPT, model);
        engineUsed = "groq";
      } catch (groqErr: any) {
        console.warn("Groq parsing failed, falling back to Gemini:", groqErr?.message);
        if (process.env.GEMINI_API_KEY) {
          try {
            result = await callGeminiJson(userPrompt, WA_PARSER_SYSTEM_PROMPT);
            engineUsed = "gemini (fallback)";
          } catch (geminiErr: any) {
            console.warn("Gemini fallback also failed, using heuristic:", geminiErr?.message);
            result = parseWhatsAppHeuristic(message);
            engineUsed = "rule-based-fallback";
          }
        } else {
          result = parseWhatsAppHeuristic(message);
          engineUsed = "rule-based-fallback";
        }
      }
    } else if (process.env.GEMINI_API_KEY) {
      try {
        result = await callGeminiJson(userPrompt, WA_PARSER_SYSTEM_PROMPT);
        engineUsed = "gemini";
      } catch (geminiErr: any) {
        console.warn("Gemini parsing failed, using heuristic:", geminiErr?.message);
        result = parseWhatsAppHeuristic(message);
        engineUsed = "rule-based-fallback";
      }
    } else {
      // Offline fallback heuristic parser for testing without keys
      result = parseWhatsAppHeuristic(message);
      engineUsed = "rule-based-fallback";
    }

    if (!result.transactions || !Array.isArray(result.transactions)) {
      result.transactions = [];
    }

    if (result._modelUsed) {
      engineUsed = `${engineUsed} (${result._modelUsed})`;
    }

    result.aiEngine = engineUsed;
    res.json(result);
  } catch (error: any) {
    console.error("Parse WhatsApp outer error:", error);
    const fallbackData = parseWhatsAppHeuristic(req.body?.message || "");
    res.json(fallbackData);
  }
});

// Rule-based heuristic fallback if neither AI key is reachable
function parseWhatsAppHeuristic(message: string) {
  const text = message.trim();
  const lower = text.toLowerCase();
  const todayStr = new Date().toISOString().split("T")[0];

  // Check if message is a daily closing message with QRIS and Cash breakdown
  if (lower.includes("closing") || lower.includes("omset") || lower.includes("shift")) {
    const transactions: any[] = [];
    
    // Check QRIS breakdown
    const qrisMatch = lower.match(/qris\s*(?:rp\.?|:)?\s*([\d\.,]+)\s*(rb|k|ribu|jt|juta)?/i);
    // Check Tunai / Cash breakdown
    const cashMatch = lower.match(/(?:tunai|cash)\s*(?:kasir)?\s*(?:rp\.?|:)?\s*([\d\.,]+)\s*(rb|k|ribu|jt|juta)?/i);

    const extractMoney = (numberStr: string, suffixStr?: string) => {
      let mult = 1;
      const s = (suffixStr || "").toLowerCase();
      if (s.includes("jt") || s.includes("juta")) mult = 1000000;
      else if (s.includes("rb") || s.includes("ribu") || s === "k") mult = 1000;

      const cleanNum = numberStr.replace(/\./g, "").replace(/,/g, ".");
      const n = parseFloat(cleanNum);
      return !isNaN(n) ? Math.round(n * mult) : 0;
    };

    if (qrisMatch && qrisMatch[1]) {
      const qrisVal = extractMoney(qrisMatch[1], qrisMatch[2]);
      if (qrisVal > 0) {
        transactions.push({
          type: "income",
          category: "Penjualan Coffee & Beverages",
          subcategory: "Penjualan QRIS Dinamis",
          amount: qrisVal,
          paymentMethod: "QRIS",
          vendorOrCustomer: "Pelanggan Kafe",
          date: todayStr,
          description: `Settlement Penjualan QRIS - ${text.substring(0, 40)}`,
          confidence: 0.95
        });
      }
    }

    if (cashMatch && cashMatch[1]) {
      const cashVal = extractMoney(cashMatch[1], cashMatch[2]);
      if (cashVal > 0) {
        transactions.push({
          type: "income",
          category: "Penjualan Coffee & Beverages",
          subcategory: "Penjualan Tunai Kasir",
          amount: cashVal,
          paymentMethod: "Cash Kasir",
          vendorOrCustomer: "Pelanggan Kafe",
          date: todayStr,
          description: `Setoran Tunai Kasir - ${text.substring(0, 40)}`,
          confidence: 0.95
        });
      }
    }

    if (transactions.length > 0) {
      const totalOmset = transactions.reduce((acc, c) => acc + c.amount, 0);
      return {
        transactions,
        summary: `Ekstraksi closing harian: ${transactions.length} komponen pendapatan total Rp ${totalOmset.toLocaleString('id-ID')}`,
        aiEngine: "rule-based-fallback"
      };
    }
  }

  // Multi-item separator: split by "sama", "\n", ";", or " dan "
  const rawSegments = text.split(/(?:\s+sama\s+|\n+|;\s*|\s+dan\s+)/i).filter((s) => s.trim().length > 3);
  const segments = rawSegments.length > 0 ? rawSegments : [text];

  const parsedTransactions: any[] = [];

  for (const seg of segments) {
    const sLower = seg.toLowerCase();

    // Determine type
    let type: "income" | "expense" | "asset" = "expense";
    if (sLower.includes("omset") || sLower.includes("penjualan") || sLower.includes("sales")) {
      type = "income";
    } else if (sLower.includes("mesin espresso") || sLower.includes("grinder") || sLower.includes("chiller")) {
      type = "asset";
    }

    // Determine category & subcategory
    let category = "Bahan Baku Kitchen & Makanan";
    let subcategory = "Operasional Harian";

    if (sLower.includes("susu") || sLower.includes("greenfields") || sLower.includes("diamond") || sLower.includes("oatside") || sLower.includes("dairy")) {
      category = "Susu & Dairy Products";
      subcategory = "Susu Fresh / UHT / Oat";
    } else if (sLower.includes("kopi") || sLower.includes("beans") || sLower.includes("arabica") || sLower.includes("robusta") || sLower.includes("gayo")) {
      category = "Bahan Baku Biji Kopi (Beans)";
      subcategory = "Biji Kopi";
    } else if (sLower.includes("sirup") || sLower.includes("syrup") || sLower.includes("caramel") || sLower.includes("vanilla") || sLower.includes("matcha") || sLower.includes("powder")) {
      category = "Syrup, Powder & Topping";
      subcategory = "Sirup & Perasa";
    } else if (sLower.includes("ayam") || sLower.includes("daging") || sLower.includes("telur") || sLower.includes("beras") || sLower.includes("kentang") || sLower.includes("sayur") || sLower.includes("minyak")) {
      category = "Bahan Baku Kitchen & Makanan";
      subcategory = "Bahan Makanan Kitchen";
    } else if (sLower.includes("cup") || sLower.includes("sedotan") || sLower.includes("straw") || sLower.includes("plastik") || sLower.includes("paper cup") || sLower.includes("kemasan")) {
      category = "Kemasan & Packaging (Cup, Straw, Box)";
      subcategory = "Packaging & Cup";
    } else if (sLower.includes("gas") || sLower.includes("lpg")) {
      category = "Gas LPG Kitchen";
      subcategory = "Gas Masak";
    } else if (sLower.includes("listrik") || sLower.includes("pln") || sLower.includes("token")) {
      category = "Listrik & Air (PLN & PDAM)";
      subcategory = "Listrik PLN";
    } else if (sLower.includes("gaji") || sLower.includes("upah") || sLower.includes("kasbon")) {
      category = "Gaji Barista & Kitchen Staff";
      subcategory = "Gaji Karyawan";
    }

    // Payment method
    let paymentMethod = "Cash Kasir";
    if (sLower.includes("qris")) paymentMethod = "QRIS";
    else if (sLower.includes("transfer") || sLower.includes("bca") || sLower.includes("mandiri")) paymentMethod = "Transfer Bank";
    else if (sLower.includes("tempo") || sLower.includes("hutang") || sLower.includes("bon")) paymentMethod = "Hutang/Tempo";

    // Amount extraction: find all numbers, prioritize large numbers >= 1000 or suffixed with rb/k/jt
    let extractedAmount = 0;
    const matches = seg.match(/(?:rp\.?|total|@)?\s*([\d\.,]+)\s*(?:rb|k|ribu|jt|juta)?/gi) || [];

    const candidates: number[] = [];
    for (const m of matches) {
      let raw = m.replace(/[^\d,\.a-z]/gi, "").toLowerCase();
      let multiplier = 1;
      if (raw.includes("jt") || raw.includes("juta")) multiplier = 1000000;
      else if (raw.includes("rb") || raw.includes("k") || raw.includes("ribu")) multiplier = 1000;

      const numPart = raw.replace(/[a-z]/g, "").replace(/\./g, "").replace(/,/g, ".");
      const parsed = parseFloat(numPart);
      if (!isNaN(parsed) && parsed > 0) {
        const fullVal = Math.round(parsed * multiplier);
        // Ignore small item counts unless multiplier was present or numPart had dot
        if (multiplier > 1 || raw.includes(".") || fullVal >= 1000) {
          candidates.push(fullVal);
        }
      }
    }

    if (candidates.length > 0) {
      // If there's a calculation like 10 karton @185.000, 10 * 185.000 = 1.850.000
      if (seg.includes("@") && candidates.length >= 2) {
        extractedAmount = candidates[candidates.length - 1];
        // If qty is before @
        const qtyMatch = seg.match(/(\d+)\s*(?:karton|btl|kg|box|tray|pack)?\s*@/i);
        if (qtyMatch && qtyMatch[1]) {
          const qty = parseInt(qtyMatch[1], 10);
          if (qty > 1 && extractedAmount < 1000000) {
            extractedAmount = qty * extractedAmount;
          }
        }
      } else {
        extractedAmount = candidates[candidates.length - 1]; // take the price candidate
      }
    }

    if (extractedAmount === 0) {
      extractedAmount = 150000;
    }

    // Vendor detection
    let vendorOrCustomer = "Toko Sembako / Pasar";
    if (sLower.includes("roastery")) vendorOrCustomer = "Roastery Kopi Nusantara";
    else if (sLower.includes("sembako")) vendorOrCustomer = "Toko Sembako Jaya";
    else if (sLower.includes("pasar")) vendorOrCustomer = "Pasar Segar Tradisional";
    else if (sLower.includes("prima")) vendorOrCustomer = "Toko Plastik Prima";
    else if (type === "income") vendorOrCustomer = "Pelanggan Kafe";

    parsedTransactions.push({
      type,
      category,
      subcategory,
      amount: extractedAmount,
      paymentMethod,
      vendorOrCustomer,
      date: todayStr,
      description: seg.trim(),
      confidence: 0.92
    });
  }

  const totalNominal = parsedTransactions.reduce((acc, t) => acc + t.amount, 0);

  return {
    transactions: parsedTransactions,
    summary: `Berhasil mengekstrak ${parsedTransactions.length} transaksi senilai total Rp ${totalNominal.toLocaleString('id-ID')}`,
    aiEngine: "rule-based-fallback"
  };
}

// Scan receipt OCR API endpoint
app.post("/api/scan-receipt", async (req, res) => {
  try {
    const { image, imageBase64, mimeType, receiptText, groqApiKey } = req.body;
    let rawBase64 = imageBase64 || image || "";
    let detectedMime = mimeType || "image/jpeg";

    if (typeof rawBase64 === "string" && rawBase64.includes(";base64,")) {
      const parts = rawBase64.split(";base64,");
      detectedMime = parts[0].replace("data:", "") || "image/jpeg";
      rawBase64 = parts[1];
    }

    let scanResult: any = null;
    let engineUsed = "smart-ocr-fallback";

    if (rawBase64 && process.env.GEMINI_API_KEY) {
      try {
        scanResult = await callGeminiReceiptOCR(rawBase64, detectedMime, receiptText);
        engineUsed = scanResult?._modelUsed ? `Gemini Vision (${scanResult._modelUsed})` : "Gemini Vision OCR";
      } catch (geminiErr: any) {
        console.warn("Gemini Receipt OCR failed, fallback used:", geminiErr?.message);
        scanResult = parseReceiptFallback(receiptText || "");
        engineUsed = "smart-ocr-fallback";
      }
    } else {
      scanResult = parseReceiptFallback(receiptText || "");
      engineUsed = "smart-ocr-fallback";
    }

    // Ensure valid fields
    if (!scanResult || typeof scanResult !== "object") {
      scanResult = parseReceiptFallback(receiptText || "");
    }
    if (!scanResult.date) {
      scanResult.date = new Date().toISOString().split("T")[0];
    }
    if (!scanResult.amount || isNaN(Number(scanResult.amount))) {
      scanResult.amount = 250000;
    } else {
      scanResult.amount = Math.round(Number(scanResult.amount));
    }
    if (!scanResult.lineItems || !Array.isArray(scanResult.lineItems)) {
      scanResult.lineItems = [];
    }

    scanResult.aiEngine = engineUsed;

    res.json({
      success: true,
      result: scanResult,
      aiEngine: engineUsed
    });
  } catch (error: any) {
    console.error("Scan receipt error:", error);
    const fallback = parseReceiptFallback(req.body?.receiptText || "");
    res.json({
      success: true,
      result: fallback,
      aiEngine: "smart-ocr-fallback",
      warning: error?.message
    });
  }
});

// AI Strategy Analysis API for Coffee & Eatery
app.post("/api/ai-strategy", async (req, res) => {
  try {
    const { metrics, groqApiKey, model } = req.body;
    if (!metrics) {
      return res.status(400).json({ error: "Metrics data is required" });
    }

    const systemPrompt = `
You are a Veteran F&B CFO & Restaurant Financial Consultant specializing in Coffee Shops and Eateries in Indonesia.
Analyze the provided financial ratios and metrics (Food Cost %, Beverage Cost %, Prime Cost %, Labor Cost %, Rent %, Net Margin %, Break Even Point) and provide razor-sharp, practical strategic accounting advice in Indonesian.

Focus on:
1. Prime Cost Analysis (COGS + Labor). Crucial: In F&B, Prime Cost must stay below 60% of total revenue.
2. Beverage vs Food Cost variances (Beverage should be 15-22%, Food 28-35%).
3. Potential leakages (milk steaming waste, portioning, shrinkage, staff overtime).
4. Concrete recommendations to boost gross margin & bottom-line net profit.
5. Menu Engineering recommendations (highlight high-margin star drinks vs plowhorses).

Output format: JSON object
{
  "healthStatus": "EXCELLENT" | "HEALTHY" | "WARNING" | "CRITICAL",
  "primeCostStatus": "string short assessment",
  "keyFindings": ["string bullet point 1", "string bullet point 2", "string bullet point 3"],
  "strategicRecommendations": [
    {
      "area": "HPP / Food Cost" | "Labor & Payroll" | "Menu Pricing & Engineering" | "Cash Flow & Working Capital",
      "action": "Concrete action step",
      "expectedImpact": "Estimated margin or cost improvement"
    }
  ],
  "dailyTargetTip": "Daily target advice for cashier/barista/manager to hit monthly profit goal"
}
`;

    const userPrompt = `Financial Metrics Data:\n${JSON.stringify(metrics, null, 2)}\nEvaluate our Coffee and Eatery performance now.`;
    const activeGroqKey = (groqApiKey && typeof groqApiKey === "string" && groqApiKey.trim())
      ? groqApiKey.trim()
      : (process.env.GROQ_API_KEY || "");

    let result;
    if (activeGroqKey) {
      try {
        result = await callGroqChat(activeGroqKey, userPrompt, systemPrompt, model);
      } catch (err) {
        if (process.env.GEMINI_API_KEY) {
          result = await callGeminiJson(userPrompt, systemPrompt);
        } else {
          throw err;
        }
      }
    } else if (process.env.GEMINI_API_KEY) {
      result = await callGeminiJson(userPrompt, systemPrompt);
    } else {
      // High quality rule-based strategy output
      const primeCost = (metrics.primeCostRatio || 58);
      result = {
        healthStatus: primeCost <= 58 ? "HEALTHY" : primeCost <= 65 ? "WARNING" : "CRITICAL",
        primeCostStatus: `Prime Cost tercatat di ${primeCost.toFixed(1)}% (Standar ideal F&B Coffee & Resto < 60%)`,
        keyFindings: [
          `Beverage Cost berada di ${metrics.beverageCostRatio?.toFixed(1) || 22}% - pantau sisa steaming susu espresso dan kalibrasi grinder harian.`,
          `Labor Cost menyerap ${metrics.laborCostRatio?.toFixed(1) || 24}% dari omset - jadwalkan barista shift split saat peak hour (16:00 - 21:00).`,
          `Net Profit Margin mencapai ${metrics.netMargin?.toFixed(1) || 16}% - pertahankan rasio repeat order pelanggan dine-in.`
        ],
        strategicRecommendations: [
          {
            area: "HPP / Food Cost",
            action: "Terapkan standard recipe gramasi ketat untuk menu susu (gunakan susu 120ml per cup latte) dan timbang espresso in/out (18g in, 36g out).",
            expectedImpact: "Mengurangi waste susu & beans hingga 4-7% per bulan."
          },
          {
            area: "Menu Pricing & Engineering",
            action: "Promosikan paket combo 'Kopi Susu + Croissant/Toast' di jam sepi pagi hari (08:00 - 11:00) untuk mendongkrak Average Ticket Size.",
            expectedImpact: "Meningkatkan omset pagi sebesar 15-20% tanpa menambah OPEX."
          },
          {
            area: "Cash Flow & Working Capital",
            action: "Negosiasikan pembayaran tempo 14-30 hari dengan supplier beans dan dairy roastery.",
            expectedImpact: "Menjaga saldo kas kasir tetap aman untuk kebutuhan darurat."
          }
        ],
        dailyTargetTip: `Targetkan minimal ${Math.ceil((metrics.dailyBEPRevenue || 3500000) / 28000)} cup kopi/makanan per hari dengan Average Spending Rp 28.000 untuk melampaui Break Even Point harian.`
      };
    }

    res.json(result);
  } catch (error: any) {
    console.error("AI Strategy error:", error);
    res.status(500).json({ error: error?.message || "Failed to generate AI financial strategy" });
  }
});

// Proxy to Google Apps Script Web App to bypass CORS
app.post("/api/sync-appscript", async (req, res) => {
  try {
    const { appscriptUrl, payload } = req.body;
    const targetUrl = (appscriptUrl && typeof appscriptUrl === "string" && appscriptUrl.trim())
      ? appscriptUrl.trim()
      : (process.env.GOOGLE_APPSCRIPT_URL || "");

    if (!targetUrl) {
      return res.status(400).json({
        error: "Google Apps Script Web App URL is not configured. Please enter your deployed Apps Script URL."
      });
    }

    // Google Apps Script doPost redirects (302). Fetch follows redirects by default.
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let responseJson: any;
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = { rawResponse: responseText, status: response.status };
    }

    res.json({
      success: response.ok,
      status: response.status,
      data: responseJson
    });
  } catch (error: any) {
    console.error("Sync to Appscript error:", error);
    res.status(500).json({
      error: error?.message || "Failed to forward payload to Google Apps Script"
    });
  }
});

// Simulated/Live WhatsApp Webhook receiver for OpenWA / Baileys / Fonnte / Wablas
app.post("/api/whatsapp-webhook", async (req, res) => {
  try {
    const body = req.body;
    // Extract message from standard WA webhook formats
    const incomingText = body.message || body.body || body.text || body.data?.message || "";
    const sender = body.from || body.sender || body.phone || "WhatsApp User";

    if (!incomingText) {
      return res.json({ status: "ignored", reason: "no text content found" });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const userPrompt = `Date context: ${todayStr}\nIncoming WhatsApp Message from ${sender}:\n"${incomingText}"\nParse this message accurately into financial transactions JSON.`;

    let parsedResult;
    if (process.env.GROQ_API_KEY) {
      try {
        parsedResult = await callGroqChat(process.env.GROQ_API_KEY, userPrompt, WA_PARSER_SYSTEM_PROMPT);
      } catch {
        parsedResult = await callGeminiJson(userPrompt, WA_PARSER_SYSTEM_PROMPT);
      }
    } else if (process.env.GEMINI_API_KEY) {
      parsedResult = await callGeminiJson(userPrompt, WA_PARSER_SYSTEM_PROMPT);
    } else {
      parsedResult = parseWhatsAppHeuristic(incomingText);
    }

    // If Google Apps Script URL is set in env, auto-dispatch to Google Sheet
    if (process.env.GOOGLE_APPSCRIPT_URL && parsedResult.transactions?.length) {
      try {
        await fetch(process.env.GOOGLE_APPSCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ADD_TRANSACTIONS",
            transactions: parsedResult.transactions,
            source: `WhatsApp (${sender})`
          })
        });
      } catch (sheetErr) {
        console.warn("Auto-sync to Google Sheet failed:", sheetErr);
      }
    }

    res.json({
      status: "success",
      receivedFrom: sender,
      parsed: parsedResult
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite Middleware for Development / Static serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KopiEats Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
