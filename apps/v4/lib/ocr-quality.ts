import { createWorker, PSM } from "tesseract.js"

// ─── Types ────────────────────────────────────────────────────────────────────

export type OcrStatus = "checking" | "readable" | "low" | "unreadable" | "pdf" | "error"

export interface OcrResult {
  status: OcrStatus
  confidence: number // 0-100, 0 for non-image
}

// ─── Config ───────────────────────────────────────────────────────────────────

/** Max thumbnail width fed to Tesseract — larger = more accurate but slower */
const THUMB_WIDTH = 500

/** Confidence thresholds */
const THRESHOLD_READABLE = 55  // ≥55 → green
const THRESHOLD_LOW      = 25  // 25–54 → amber, <25 → red

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
   * For images: draws to thumbnail canvas → Tesseract → confidence score.
   */
  async function checkFile(file: File): Promise<OcrResult> {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      return { status: "pdf", confidence: 0 }
    }

    try {
      const canvas = await fileToThumbnailCanvas(file)
      // v7 returns { jobId, data } — data.confidence is MeanTextConf (0-100)
      const result = await worker.recognize(canvas)
      const confidence = Math.round((result as { data: { confidence: number } }).data.confidence)

      let status: OcrStatus
      if (confidence >= THRESHOLD_READABLE) {
        status = "readable"
      } else if (confidence >= THRESHOLD_LOW) {
        status = "low"
      } else {
        status = "unreadable"
      }

      return { status, confidence }
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
