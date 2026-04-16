import { createWorker, PSM } from "tesseract.js"

// ─── Types ────────────────────────────────────────────────────────────────────

export type OcrStatus = "checking" | "readable" | "low" | "unreadable" | "pdf" | "error"

export interface OcrResult {
  status: OcrStatus
  confidence: number      // 0-100, 0 for non-image
  amount?: string         // e.g. "€45.67" — only when status is readable/low
}

// ─── Config ───────────────────────────────────────────────────────────────────

/** Max thumbnail width — larger = more accurate OCR, slower scan */
const THUMB_WIDTH = 1000

/** Confidence thresholds (after grayscale + contrast preprocessing, scores are higher) */
const THRESHOLD_READABLE = 50  // ≥50 → green
const THRESHOLD_LOW      = 20  // 20–49 → amber, <20 → red

// ─── Canvas helpers ───────────────────────────────────────────────────────────

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

/**
 * Converts canvas to grayscale and applies mild contrast stretch (factor 1.5).
 * Grayscale removes colour noise; contrast helps Tesseract find text edges.
 * Operates in-place and returns the same canvas.
 */
function preprocessForOcr(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")!
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const d = imageData.data
  const CONTRAST = 1.5

  for (let i = 0; i < d.length; i += 4) {
    // Luminance-weighted grayscale (ITU-R BT.601)
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    // Contrast stretch around midpoint 128
    const c = Math.min(255, Math.max(0, (gray - 128) * CONTRAST + 128))
    d[i] = d[i + 1] = d[i + 2] = c
    // alpha unchanged
  }
  ctx.putImageData(imageData, 0, 0)
  return canvas
}

// ─── Amount extraction ────────────────────────────────────────────────────────

const TOTAL_KEYWORDS =
  /\b(total|amount|sum|subtotal|grand\s*total|net\s*total|gesamt|betrag|montant|totale|importe|summe|do\s*zap[łl]aty|amount\s*due|to\s*pay|due|invoice\s*total|payment)\b/i

const CURRENCY_RE =
  /([€£\$])\s*(\d{1,6}(?:[.,]\d{3})*(?:[.,]\d{2}))|(\d{1,6}(?:[.,]\d{3})*(?:[.,]\d{2}))\s*([€£\$])|(EUR|GBP|USD|PLN|CZK|HUF|RON|CHF|SEK|NOK|DKK)\s+(\d{1,6}(?:[.,]\d{3})*(?:[.,]\d{2}))|(\d{1,6}(?:[.,]\d{3})*(?:[.,]\d{2}))\s*(EUR|GBP|USD|PLN|CZK|HUF|RON|CHF|SEK|NOK|DKK)/gi

const SYMBOL_TO_CODE: Record<string, string> = { "€": "EUR", "£": "GBP", "$": "USD" }

interface ParsedAmount { currency: string; value: number; raw: string }

function parseAmountsFromText(text: string): ParsedAmount[] {
  CURRENCY_RE.lastIndex = 0
  const amounts: ParsedAmount[] = []
  let m: RegExpExecArray | null
  while ((m = CURRENCY_RE.exec(text)) !== null) {
    let currency = "", rawNum = ""
    if      (m[1] && m[2]) { currency = SYMBOL_TO_CODE[m[1]] ?? m[1]; rawNum = m[2] }
    else if (m[3] && m[4]) { currency = SYMBOL_TO_CODE[m[4]] ?? m[4]; rawNum = m[3] }
    else if (m[5] && m[6]) { currency = m[5].toUpperCase(); rawNum = m[6] }
    else if (m[7] && m[8]) { currency = m[8].toUpperCase(); rawNum = m[7] }
    if (!currency || !rawNum) continue
    const value = parseFloat(rawNum.replace(/\.(?=\d{3})/g, "").replace(",", "."))
    if (isNaN(value) || value <= 0) continue
    amounts.push({ currency, value, raw: m[0].trim() })
  }
  return amounts
}

/**
 * Find the best total amount in raw OCR text.
 * Prefers total-keyword lines. Within candidates: EUR → GBP → largest value.
 */
export function extractReceiptAmount(text: string): string | null {
  const lines = text.split(/\r?\n/)
  const totalLineAmounts: ParsedAmount[] = []
  const allAmounts: ParsedAmount[] = []

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx]
    const lineAmounts = parseAmountsFromText(line)
    allAmounts.push(...lineAmounts)
    if (TOTAL_KEYWORDS.test(line)) {
      totalLineAmounts.push(...lineAmounts)
      if (idx + 1 < lines.length)
        totalLineAmounts.push(...parseAmountsFromText(lines[idx + 1]))
    }
  }

  const cands = totalLineAmounts.length > 0 ? totalLineAmounts : allAmounts
  if (!cands.length) return null
  const eur = cands.find(a => a.currency === "EUR")
  if (eur) return eur.raw
  const gbp = cands.find(a => a.currency === "GBP")
  if (gbp) return gbp.raw
  return cands.reduce((a, b) => b.value > a.value ? b : a).raw
}

// ─── Worker factory ───────────────────────────────────────────────────────────

/**
 * Creates a single Tesseract worker scoped to a modal session.
 * Call `terminate()` when the modal closes to avoid dangling workers.
 *
 * PSM 11 (SPARSE_TEXT) handles scattered receipt layouts much better than
 * PSM 6 (SINGLE_BLOCK), giving significantly higher confidence scores.
 */
export async function createOcrWorker() {
  const worker = await createWorker("eng", 1, {
    logger: () => {},
    errorHandler: () => {},
  })

  // PSM 11 = Sparse text — best for receipts with mixed layout
  await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT })

  async function checkFile(file: File): Promise<OcrResult> {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      return { status: "pdf", confidence: 0 }
    }
    try {
      const canvas = preprocessForOcr(await fileToThumbnailCanvas(file))
      const result = await worker.recognize(canvas)
      const data = (result as { data: { confidence: number; text: string } }).data
      const confidence = Math.round(data.confidence)

      let status: OcrStatus
      if      (confidence >= THRESHOLD_READABLE) status = "readable"
      else if (confidence >= THRESHOLD_LOW)      status = "low"
      else                                       status = "unreadable"

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

// ─── Status helpers ───────────────────────────────────────────────────────────

export function ocrBadgeClass(status: OcrStatus): string {
  switch (status) {
    case "readable":   return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case "low":        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    case "unreadable": return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
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

export function fileKey(f: File): string { return f.name + f.size }
