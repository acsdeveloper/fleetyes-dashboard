import { createWorker, PSM } from "tesseract.js"

// ─── Types ────────────────────────────────────────────────────────────────────

export type OcrStatus = "checking" | "readable" | "low" | "unreadable" | "pdf" | "error"

export interface OcrResult {
  status: OcrStatus
  confidence: number      // 0-100, 0 for non-image
  amount?: string         // e.g. "€45.67" or "GBP 38.12" — only when status is readable/low
}

// ─── Config ───────────────────────────────────────────────────────────────────

/** Max thumbnail width fed to Tesseract — larger = more accurate but slower */
const THUMB_WIDTH = 500

/** Confidence thresholds */
const THRESHOLD_READABLE = 55  // ≥55 → green
const THRESHOLD_LOW      = 25  // 25–54 → amber, <25 → red

// ─── Amount extraction ────────────────────────────────────────────────────────

/**
 * Keywords that indicate a "total" line on a receipt.
 * Covers EN, DE, FR, ES, IT, PL and common abbreviations.
 */
const TOTAL_KEYWORDS =
  /\b(total|amount|sum|subtotal|grand\s*total|net\s*total|gesamt|betrag|montant|totale|importe|summe|do\s*zap[łl]aty|amount\s*due|to\s*pay|due|invoice\s*total|payment)\b/i

/**
 * Recognised currency symbols and ISO codes.
 * Group layout: (symbol)(amount) | (amount)(symbol) | (code)(amount) | (amount)(code)
 * Amounts: digits with optional thousands separator and decimal part.
 */
const CURRENCY_RE =
  /([€£\$])\s*(\d{1,6}(?:[.,]\d{3})*(?:[.,]\d{2}))|(\d{1,6}(?:[.,]\d{3})*(?:[.,]\d{2}))\s*([€£\$])|(EUR|GBP|USD|PLN|CZK|HUF|RON|CHF|SEK|NOK|DKK)\s+(\d{1,6}(?:[.,]\d{3})*(?:[.,]\d{2}))|(\d{1,6}(?:[.,]\d{3})*(?:[.,]\d{2}))\s*(EUR|GBP|USD|PLN|CZK|HUF|RON|CHF|SEK|NOK|DKK)/gi

const SYMBOL_TO_CODE: Record<string, string> = {
  "€": "EUR", "£": "GBP", "$": "USD",
}

interface ParsedAmount {
  currency: string  // ISO code e.g. "EUR"
  value: number     // numeric value
  raw: string       // formatted string e.g. "€45.67"
}

function parseAmountsFromText(text: string): ParsedAmount[] {
  CURRENCY_RE.lastIndex = 0
  const amounts: ParsedAmount[] = []
  let m: RegExpExecArray | null

  while ((m = CURRENCY_RE.exec(text)) !== null) {
    let currency = ""
    let rawNum   = ""
    let rawStr   = m[0].trim()

    if (m[1] && m[2]) { currency = SYMBOL_TO_CODE[m[1]] ?? m[1]; rawNum = m[2] }
    else if (m[3] && m[4]) { currency = SYMBOL_TO_CODE[m[4]] ?? m[4]; rawNum = m[3] }
    else if (m[5] && m[6]) { currency = m[5].toUpperCase(); rawNum = m[6] }
    else if (m[7] && m[8]) { currency = m[8].toUpperCase(); rawNum = m[7] }

    if (!currency || !rawNum) continue

    // Normalise European decimal comma → dot for parsing
    const normalised = rawNum.replace(/\.(?=\d{3})/g, "").replace(",", ".")
    const value = parseFloat(normalised)
    if (isNaN(value) || value <= 0) continue

    amounts.push({ currency, value, raw: rawStr })
  }

  return amounts
}

/**
 * Given raw OCR text, find the best total amount.
 * Strategy:
 *   1. Gather all amounts from lines that contain a total keyword.
 *   2. If none, fall back to all amounts in the document.
 *   3. From the candidates, prefer EUR; otherwise pick the largest value.
 *
 * Returns a formatted string like "€45.67" or "GBP 38.12", or null if nothing found.
 */
export function extractReceiptAmount(text: string): string | null {
  const lines = text.split(/\r?\n/)

  // Collect amounts from "total" lines first, then whole document as fallback
  const totalLineAmounts: ParsedAmount[] = []
  const allAmounts:       ParsedAmount[] = []

  for (const line of lines) {
    const lineAmounts = parseAmountsFromText(line)
    allAmounts.push(...lineAmounts)
    if (TOTAL_KEYWORDS.test(line)) {
      totalLineAmounts.push(...lineAmounts)

      // Also check the next line (total keyword sometimes precedes the amount)
      const idx = lines.indexOf(line)
      if (idx + 1 < lines.length) {
        totalLineAmounts.push(...parseAmountsFromText(lines[idx + 1]))
      }
    }
  }

  const candidates = totalLineAmounts.length > 0 ? totalLineAmounts : allAmounts
  if (!candidates.length) return null

  // Prefer EUR, then GBP, then largest value
  const eur = candidates.find(a => a.currency === "EUR")
  if (eur) return eur.raw

  const gbp = candidates.find(a => a.currency === "GBP")
  if (gbp) return gbp.raw

  // Largest value as last resort
  const best = candidates.reduce((a, b) => b.value > a.value ? b : a)
  return best.raw
}

// ─── Canvas thumbnail helper ──────────────────────────────────────────────────

function fileToThumbnailCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale  = Math.min(1, THUMB_WIDTH / img.naturalWidth)
      const canvas = document.createElement("canvas")
      canvas.width  = Math.round(img.naturalWidth  * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")) }
    img.src = url
  })
}

// ─── Worker factory ───────────────────────────────────────────────────────────

/**
 * Creates a single Tesseract worker scoped to a modal session.
 * Call `terminate()` when the modal closes to avoid dangling workers.
 *
 * OEM 1 = LSTM_ONLY (fast neural engine)
 * PSM.SINGLE_BLOCK = treat image as a single uniform block of text
 */
export async function createOcrWorker() {
  const worker = await createWorker("eng", 1, {
    logger: () => {},       // suppress verbose progress logs
    errorHandler: () => {}, // suppress non-fatal errors
  })

  // PSM 6 = Uniform block of text — best balance of speed + accuracy for receipts
  await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK })

  /**
   * Check a single File. Returns immediately for PDFs (skipped).
   * For images: draws to thumbnail canvas → Tesseract → confidence + amount extraction.
   */
  async function checkFile(file: File): Promise<OcrResult> {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      return { status: "pdf", confidence: 0 }
    }

    try {
      const canvas = await fileToThumbnailCanvas(file)
      // v7 returns { jobId, data } — data.confidence is MeanTextConf (0-100)
      const result = await worker.recognize(canvas)
      const data = (result as { data: { confidence: number; text: string } }).data
      const confidence = Math.round(data.confidence)

      let status: OcrStatus
      if (confidence >= THRESHOLD_READABLE) {
        status = "readable"
      } else if (confidence >= THRESHOLD_LOW) {
        status = "low"
      } else {
        status = "unreadable"
      }

      // Extract amount for passable images (readable or low)
      const amount = (status === "readable" || status === "low")
        ? extractReceiptAmount(data.text) ?? undefined
        : undefined

      return { status, confidence, amount }
    } catch {
      return { status: "error", confidence: 0 }
    }
  }

  return { checkFile, terminate: () => worker.terminate() }
}

// ─── Status helpers (used by both modals) ────────────────────────────────────

export function ocrBadgeClass(status: OcrStatus): string {
  switch (status) {
    case "readable":   return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case "low":        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    case "unreadable": return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
    case "pdf":        return "bg-muted text-muted-foreground"
    case "checking":   return "bg-muted text-muted-foreground"
    default:           return "bg-muted text-muted-foreground"
  }
}

export function ocrBadgeLabel(status: OcrStatus, confidence: number): string {
  switch (status) {
    case "checking":   return "Scanning…"
    case "readable":   return `✓ Clear (${confidence}%)`
    case "low":        return `⚠ Low (${confidence}%)`
    case "unreadable": return `✕ Unreadable (${confidence}%)`
    case "pdf":        return "PDF"
    case "error":      return "Check failed"
  }
}

/** File key used to index the quality map */
export function fileKey(f: File): string {
  return f.name + f.size
}
