"use client"

/**
 * ClockTimePicker
 * ───────────────
 * Material Design 3-style circular time picker.
 * • 24-hour dual-ring hour face  (outer: 12–11, inner: 0, 13–23)
 * • 5-minute-increment minute face
 * • Clicking the hour auto-advances to minute mode
 * • Clear / Cancel / OK footer
 * • value / onChange use "HH:MM" strings (API-compatible)
 */

import * as React from "react"
import { Clock } from "lucide-react"

// ─── Geometry ──────────────────────────────────────────────────────────────────

const SIZE     = 264           // SVG viewport
const CX       = SIZE / 2
const CY       = SIZE / 2
const OUTER_R  = 100           // outer ring radius
const INNER_R  = 64            // inner ring radius
const BUBBLE_R = 20            // selection highlight radius

const FONT = "'Inter', 'Montserrat', system-ui, sans-serif"

function polar(angleRad: number, r: number) {
  return { x: CX + r * Math.cos(angleRad), y: CY + r * Math.sin(angleRad) }
}

/** 0 = top (12 o'clock), increases clockwise */
function idxToAngle(idx: number, total = 12) {
  return (idx / total) * 2 * Math.PI - Math.PI / 2
}

function coordToNorm(dx: number, dy: number) {
  const raw = Math.atan2(dy, dx) + Math.PI / 2
  return ((raw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
}

// ─── Hour / minute layouts ────────────────────────────────────────────────────

const OUTER_HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const INNER_HOURS = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
const MINUTES     = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

// ─── Hand position helper ─────────────────────────────────────────────────────

function handTarget(mode: "hour" | "minute", hour: number, minute: number) {
  if (mode === "hour") {
    let idx: number, r: number
    if (hour === 0)        { idx = 0;          r = INNER_R }
    else if (hour === 12)  { idx = 0;          r = OUTER_R }
    else if (hour >= 13)   { idx = hour - 12;  r = INNER_R }
    else                   { idx = hour;        r = OUTER_R }
    return polar(idxToAngle(idx), r)
  } else {
    return polar(idxToAngle((minute / 5) % 12), OUTER_R)
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  value:     string                  // "HH:MM" or ""
  onChange:  (v: string) => void
  disabled?: boolean
}

export function ClockTimePicker({ value, onChange, disabled = false }: Props) {
  const [open,   setOpen]   = React.useState(false)
  const [mode,   setMode]   = React.useState<"hour" | "minute">("hour")
  const [hour,   setHour]   = React.useState(8)
  const [minute, setMinute] = React.useState(0)
  const svgRef = React.useRef<SVGSVGElement>(null)

  // ── Populate from prop when opening ──

  React.useEffect(() => {
    if (!open) return
    if (value) {
      const [h, m] = value.split(":").map(Number)
      setHour(isNaN(h) ? 8 : Math.max(0, Math.min(23, h)))
      setMinute(isNaN(m) ? 0 : Math.round(m / 5) * 5 % 60)
    } else {
      setHour(8); setMinute(0)
    }
    setMode("hour")
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Interaction ──

  const getCursorPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = svgRef.current!.getBoundingClientRect()
    const src = "touches" in e ? e.touches[0] : (e as React.MouseEvent)
    const dx = src.clientX - rect.left - CX
    const dy = src.clientY - rect.top  - CY
    return { dx, dy, dist: Math.sqrt(dx * dx + dy * dy) }
  }

  const pick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const { dx, dy, dist } = getCursorPos(e)
    const norm = coordToNorm(dx, dy)
    const idx12 = Math.round(norm / (2 * Math.PI) * 12) % 12

    if (mode === "hour") {
      const threshold = (OUTER_R + INNER_R) / 2
      if (dist < threshold) {
        // Inner ring
        setHour(idx12 === 0 ? 0 : idx12 + 12)
      } else {
        // Outer ring
        setHour(idx12 === 0 ? 12 : idx12)
      }
      setTimeout(() => setMode("minute"), 160)
    } else {
      setMinute(idx12 * 5)
    }
  }

  // ── Derived ──

  const dH = String(hour).padStart(2, "0")
  const dM = String(minute).padStart(2, "0")
  const displayLabel = value ? `${dH}:${dM}` : "-- : --"

  const hand = handTarget(mode, hour, minute)

  const confirm = () => {
    onChange(`${dH}:${dM}`)
    setOpen(false)
  }

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={[
          "inline-flex h-8 items-center gap-1.5 rounded-lg border bg-background px-2.5",
          "text-sm outline-none transition-all",
          "hover:border-ring/60 hover:bg-muted/30 focus:ring-1 focus:ring-ring",
          "disabled:opacity-30 disabled:cursor-not-allowed",
          value ? "text-foreground" : "text-muted-foreground",
        ].join(" ")}
      >
        <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className="font-mono tabular-nums tracking-tight text-xs">{displayLabel}</span>
      </button>

      {/* ── Modal ── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2
                          w-72 overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">

            {/* ── Header ── */}
            <div className="bg-primary/8 px-6 pt-6 pb-4 dark:bg-primary/15">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {mode === "hour" ? "Select hour" : "Select minute"}
              </p>
              <div className="flex items-end gap-0.5">
                <button
                  onClick={() => setMode("hour")}
                  className={`text-5xl font-bold tabular-nums leading-none transition-colors ${
                    mode === "hour" ? "text-primary" : "text-foreground/30 hover:text-foreground/60"
                  }`}
                >
                  {dH}
                </button>
                <span className="mb-0.5 text-4xl font-bold text-foreground/20 select-none">:</span>
                <button
                  onClick={() => setMode("minute")}
                  className={`text-5xl font-bold tabular-nums leading-none transition-colors ${
                    mode === "minute" ? "text-primary" : "text-foreground/30 hover:text-foreground/60"
                  }`}
                >
                  {dM}
                </button>
              </div>
            </div>

            {/* ── Clock face ── */}
            <div className="flex justify-center bg-muted/20 py-3">
              <svg
                ref={svgRef}
                width={SIZE}
                height={SIZE}
                onClick={pick}
                onTouchStart={pick}
                style={{ touchAction: "none", cursor: "pointer", userSelect: "none" }}
              >
                {/* Track circle */}
                <circle
                  cx={CX} cy={CY}
                  r={OUTER_R + 22}
                  fill="var(--color-card, white)"
                  stroke="var(--color-border)"
                  strokeWidth={1}
                />

                {/* Hand */}
                <line
                  x1={CX} y1={CY} x2={hand.x} y2={hand.y}
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />

                {/* Center dot */}
                <circle cx={CX} cy={CY} r={4} fill="var(--color-primary)" />

                {/* Selection bubble */}
                <circle cx={hand.x} cy={hand.y} r={BUBBLE_R} fill="var(--color-primary)" />

                {/* ── Hour numbers ── */}
                {mode === "hour" && (
                  <>
                    {OUTER_HOURS.map((h, i) => {
                      const p = polar(idxToAngle(i), OUTER_R)
                      const sel = hour === h
                      return (
                        <text key={`o${h}`} x={p.x} y={p.y}
                          textAnchor="middle" dominantBaseline="central"
                          fontSize={13} fontWeight={sel ? 700 : 500}
                          fontFamily={FONT}
                          fill={sel ? "white" : "var(--color-foreground)"}>
                          {String(h).padStart(2, "0")}
                        </text>
                      )
                    })}
                    {INNER_HOURS.map((h, i) => {
                      const p = polar(idxToAngle(i), INNER_R)
                      const sel = hour === h
                      return (
                        <text key={`i${h}`} x={p.x} y={p.y}
                          textAnchor="middle" dominantBaseline="central"
                          fontSize={11} fontWeight={sel ? 700 : 400}
                          fontFamily={FONT}
                          fill={sel ? "white" : "var(--color-muted-foreground)"}>
                          {String(h).padStart(2, "0")}
                        </text>
                      )
                    })}
                  </>
                )}

                {/* ── Minute numbers ── */}
                {mode === "minute" && MINUTES.map((m, i) => {
                  const p = polar(idxToAngle(i), OUTER_R)
                  const sel = minute === m
                  return (
                    <text key={m} x={p.x} y={p.y}
                      textAnchor="middle" dominantBaseline="central"
                      fontSize={13} fontWeight={sel ? 700 : 500}
                      fontFamily={FONT}
                      fill={sel ? "white" : "var(--color-foreground)"}>
                      {String(m).padStart(2, "0")}
                    </text>
                  )
                })}
              </svg>
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-between border-t px-5 py-3">
              <button
                onClick={() => { onChange(""); setOpen(false) }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="h-8 rounded-lg px-4 text-sm text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirm}
                  className="h-8 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
