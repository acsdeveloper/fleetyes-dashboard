"use client"
import * as React from "react"
import Link from "next/link"
import {
  Truck, Users, CalendarOff, TrendingUp,
  MapPin, ArrowRight, Clock, AlertTriangle,
  CheckCircle2, Calendar, ChevronRight, Wrench,
} from "lucide-react"
import { listOrders,  type Order, type OrderStatus } from "@/lib/orders-api"
import { listDrivers, type Driver }                  from "@/lib/drivers-api"
import { listVehicles, type Vehicle }                from "@/lib/vehicles-api"
import { listDriverLeave, type LeaveRequest }        from "@/lib/leave-requests-api"

// ─── Shared helpers ───────────────────────────────────────────────────────────

function toDateStr(d: Date) { return d.toISOString().slice(0, 10) }
function todayStr()         { return toDateStr(new Date()) }
function weekBounds() {
  const now = new Date()
  const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7)); mon.setHours(0,0,0,0)
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  return { mon: toDateStr(mon), sun: toDateStr(sun) }
}
function initials(name?: string | null) {
  if (!name) return "?"
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
}
function fmtTime(iso?: string | null) { return iso ? iso.slice(11, 16) : "—" }

// ─── Maintenance PMI data (mirrored from /maintenance page) ──────────────────

const PMI_VEHICLES = [
  { id:"v1", reg:"NUX9VAM", make:"Volvo",    model:"FH 500",    interval:6, lastPMI:"2026-01-29", status:"amber", driver:"James O'Connor"   },
  { id:"v2", reg:"TB67KLM", make:"DAF",      model:"XF 480",    interval:6, lastPMI:"2026-01-15", status:"red",   driver:"Maria Santos"     },
  { id:"v3", reg:"PN19RFX", make:"Mercedes", model:"Actros",    interval:8, lastPMI:"2026-02-10", status:"green", driver:"Piotr Kowalski"   },
  { id:"v4", reg:"LK21DVA", make:"Scania",   model:"R 450",     interval:6, lastPMI:"2026-02-20", status:"green", driver:"Lena Fischer"     },
  { id:"v5", reg:"OU70TBN", make:"Iveco",    model:"S-Way",     interval:4, lastPMI:"2025-12-10", status:"red",   driver:"Ahmed Hassan"     },
  { id:"v6", reg:"YJ19HKP", make:"MAN",      model:"TGX 18.510",interval:6, lastPMI:"2026-02-05", status:"amber", driver:"Sophie Turner"    },
] as const

function nextPMI(lastPMI: string, intervalWeeks: number) {
  const d = new Date(lastPMI); d.setDate(d.getDate() + intervalWeeks * 7); return d
}
function daysUntil(d: Date) { return Math.round((d.getTime() - Date.now()) / 86_400_000) }

const PMI_STATUS_CFG = {
  green: { label:"Compliant",   text:"text-emerald-700 dark:text-emerald-400", bg:"bg-emerald-500/10",  border:"border-l-emerald-500", dot:"bg-emerald-500" },
  amber: { label:"Due Soon",    text:"text-amber-700 dark:text-amber-400",    bg:"bg-amber-500/10",    border:"border-l-amber-500",   dot:"bg-amber-500"   },
  red:   { label:"Overdue",     text:"text-red-700 dark:text-red-400",        bg:"bg-red-500/10",      border:"border-l-red-500",     dot:"bg-red-500"     },
}

// ─── Trip status config ───────────────────────────────────────────────────────

const STATUS_BADGE: Record<OrderStatus, { label:string; cls:string; dot:string; border:string }> = {
  created:    { label:"Scheduled",  cls:"bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/40",      dot:"bg-blue-400",       border:"border-l-blue-400"    },
  dispatched: { label:"Dispatched", cls:"bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/40",  dot:"bg-amber-400",      border:"border-l-amber-400"   },
  started:    { label:"Started",    cls:"bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/40", dot:"bg-emerald-500", border:"border-l-emerald-500" },
  completed:  { label:"Completed",  cls:"bg-muted text-muted-foreground border-border",                                                                    dot:"bg-muted-foreground/50", border:"border-l-muted-foreground/30" },
  canceled:   { label:"Cancelled",  cls:"bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/40",              dot:"bg-red-400",        border:"border-l-red-400"     },
}

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

// ─── Components ───────────────────────────────────────────────────────────────

/** Premium KPI card with left glow accent */
function KpiCard({
  icon: Icon, label, value, sub, gradient, glowColor, loading, href,
}: {
  icon: React.ElementType; label: string; value: string | number
  sub?: React.ReactNode; gradient: string; glowColor: string
  loading?: boolean; href?: string
}) {
  const inner = (
    <div
      className="relative flex flex-col gap-4 rounded-2xl border bg-card p-5 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl group cursor-default h-full"
      style={{ boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.04)` }}
    >
      {/* Faint corner glow */}
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full ${glowColor} blur-2xl opacity-20 group-hover:opacity-30 transition-opacity`} />

      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">{label}</p>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
          <Icon className="h-4.5 w-4.5 text-white" style={{ width:18, height:18 }} />
        </div>
      </div>

      {loading ? (
        <div className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
      ) : (
        <p className="text-4xl font-black tracking-tight leading-none">{value}</p>
      )}

      {!loading && sub && (
        <div className="text-[11px] text-muted-foreground leading-snug mt-auto">{sub}</div>
      )}
    </div>
  )
  return href ? (
    <Link href={href} className="block h-full">{inner}</Link>
  ) : inner
}

/** Trip row — polished timeline card */
function TripRow({ trip }: { trip: Order }) {
  const s = STATUS_BADGE[trip.status] ?? STATUS_BADGE.created
  const noDriver = !trip.driver_assigned_uuid && trip.status !== "completed" && trip.status !== "canceled"
  return (
    <div className={`flex items-center gap-3 rounded-xl border border-l-[3px] border-border bg-background/60 px-4 py-3 shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200 ${s.border}`}>
      <div className="flex w-11 shrink-0 flex-col items-center">
        <p className="text-[12px] font-bold tabular-nums text-foreground">{fmtTime(trip.scheduled_at)}</p>
        <div className={`mt-1 h-1.5 w-1.5 rounded-full ${s.dot}`} />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-1.5 text-[11px]">
          <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/60" />
          <span className="font-semibold truncate text-foreground">{trip.pickup_name ?? trip.payload?.pickup_name ?? "—"}</span>
          <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
          <span className="truncate text-muted-foreground/80">{trip.dropoff_name ?? trip.payload?.dropoff_name ?? "—"}</span>
        </div>
        {noDriver ? (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-2.5 w-2.5" />
            <span className="text-[10px] font-semibold">No driver assigned</span>
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground/60">
            {trip.driver_assigned?.name ?? trip.driver_name ?? "Driver assigned"}
          </p>
        )}
      </div>
      <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wide ${s.cls}`}>
        {s.label}
      </span>
    </div>
  )
}

/** Mini sparkline bars for the week */
function WeekBars({ trips }: { trips: Order[] }) {
  const { mon } = weekBounds()
  const today = todayStr()
  const bars = DAYS.map((lbl, i) => {
    const d = new Date(mon); d.setDate(d.getDate() + i)
    const ds = toDateStr(d)
    return { lbl, ds, count: trips.filter(t => t.scheduled_at?.slice(0,10) === ds).length, isToday: ds === today }
  })
  const max = Math.max(...bars.map(b => b.count), 1)
  return (
    <div className="flex items-end justify-between gap-1.5" style={{ height: 80}}>
      {bars.map(b => (
        <div key={b.lbl} className="flex flex-1 flex-col items-center gap-1">
          <div className="w-full flex items-end justify-center" style={{height:52}}>
            <div
              className={`w-full rounded-t-md transition-all duration-500 ${b.isToday
                ? "bg-gradient-to-t from-[#496453] to-[#5d8068]"
                : "bg-gradient-to-t from-muted-foreground/25 to-muted-foreground/10"
              }`}
              style={{ height: `${Math.max((b.count / max) * 52, b.count > 0 ? 6 : 0)}px` }}
            />
          </div>
          <p className={`text-[9px] font-bold ${b.isToday ? "text-[#496453]" : "text-muted-foreground/50"}`}>{b.lbl}</p>
          {b.count > 0 && <p className={`text-[8px] ${b.isToday ? "text-[#496453]" : "text-muted-foreground/40"}`}>{b.count}</p>}
        </div>
      ))}
    </div>
  )
}

/** Driver availability grid */
function DriverGrid({ drivers, leavesToday }: { drivers: Driver[]; leavesToday: LeaveRequest[] }) {
  const leaveSet = new Set(leavesToday.map(l => l.user_uuid).filter(Boolean))
  const shown = drivers.slice(0, 24)
  return (
    <div className="flex flex-wrap gap-2">
      {shown.map(d => {
        const onLeave = leaveSet.has(d.user_uuid ?? "")
        const leave = onLeave ? leavesToday.find(l => l.user_uuid === d.user_uuid) : null
        return (
          <div key={d.uuid} className="group relative flex flex-col items-center gap-1" title={d.name}>
            <div className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-transform group-hover:scale-110
              ${onLeave
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 ring-2 ring-amber-400 dark:ring-amber-600"
                : "bg-gradient-to-br from-[#496453]/20 to-[#496453]/10 text-[#496453] ring-2 ring-[#496453]/30"}`}
            >
              {initials(d.name)}
              {onLeave && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-amber-500 ring-1 ring-background">
                  <CalendarOff className="h-1.5 w-1.5 text-white" />
                </span>
              )}
              {/* Active pulse for currently online (approximate) */}
              {!onLeave && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-background" />
              )}
            </div>
            <p className="w-9 truncate text-center text-[8px] leading-none text-muted-foreground/50">
              {d.name.split(" ")[0]}
            </p>
            {/* Hover tooltip */}
            {onLeave && leave && (
              <div className="absolute -top-10 left-1/2 z-20 hidden -translate-x-1/2 group-hover:block whitespace-nowrap rounded-lg border bg-popover px-2.5 py-1.5 text-[10px] shadow-xl">
                <p className="font-semibold">{d.name}</p>
                <p className="text-muted-foreground">{leave.leave_type} · until {leave.end_date.slice(0,10)}</p>
              </div>
            )}
          </div>
        )
      })}
      {drivers.length > 24 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground">
          +{drivers.length - 24}
        </div>
      )}
    </div>
  )
}

/** PMI upcoming maintenance list */
function PMIList() {
  const sorted = [...PMI_VEHICLES].sort((a, b) => {
    const da = daysUntil(nextPMI(a.lastPMI, a.interval))
    const db = daysUntil(nextPMI(b.lastPMI, b.interval))
    return da - db
  })
  return (
    <div className="flex flex-col gap-1.5">
      {sorted.map(v => {
        const due   = nextPMI(v.lastPMI, v.interval)
        const days  = daysUntil(due)
        const cfg   = PMI_STATUS_CFG[v.status as keyof typeof PMI_STATUS_CFG]
        const dueLabel = days < 0
          ? `${Math.abs(days)}d overdue`
          : days === 0 ? "Due today" : `Due in ${days}d`
        return (
          <div key={v.id} className={`flex items-center gap-3 rounded-xl border-l-[3px] border border-border px-3 py-2.5 ${cfg.border} ${cfg.bg} hover:shadow-sm transition-all`}>
            <div className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot} ${days < 0 ? "animate-pulse" : ""}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold">{v.reg}</span>
                <span className="text-[10px] text-muted-foreground">{v.make} {v.model}</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">Driver: {v.driver}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className={`text-xs font-bold ${cfg.text}`}>{dueLabel}</p>
              <p className="text-[9px] text-muted-foreground">{due.toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Upcoming leave list */
function LeaveList({ leaves }: { leaves: LeaveRequest[] }) {
  const today = todayStr()
  const in7   = new Date(); in7.setDate(in7.getDate() + 7)
  const in7s  = toDateStr(in7)
  const rows  = leaves
    .filter(l => l.status === "Approved" && l.end_date.slice(0,10) >= today && l.start_date.slice(0,10) <= in7s)
    .sort((a,b) => a.start_date.localeCompare(b.start_date))
    .slice(0, 6)
  if (!rows.length) return <p className="py-6 text-center text-sm text-muted-foreground/50">No upcoming leave in the next 7 days</p>
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map(l => (
        <div key={l.uuid} className="flex items-center gap-3 rounded-xl border bg-muted/20 px-3 py-2.5 hover:bg-muted/40 transition-colors">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-[9px] font-black text-amber-700 dark:text-amber-400">
            {initials(l.user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{l.user?.name ?? "Driver"}</p>
            <p className="text-[10px] text-muted-foreground">{l.leave_type} · {l.start_date.slice(5,10)} → {l.end_date.slice(5,10)}</p>
          </div>
          <span className="shrink-0 rounded-full border bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-400">
            {l.total_days}d
          </span>
        </div>
      ))}
    </div>
  )
}

/** Section card wrapper */
function Section({ title, href, linkLabel="View all", loading, children, icon: Icon }: {
  title:string; href?:string; linkLabel?:string; loading?:boolean; icon?:React.ElementType; children:React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground/60" />}
          <h2 className="text-sm font-bold tracking-tight">{title}</h2>
        </div>
        {href && (
          <Link href={href} className="flex items-center gap-0.5 text-[11px] font-semibold text-[#496453] hover:underline dark:text-emerald-400 transition-colors">
            {linkLabel} <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {loading ? (
        <div className="flex flex-col gap-2">
          {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : children}
    </div>
  )
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const today       = todayStr()
  const { mon, sun } = weekBounds()

  const [todayTrips,  setTodayTrips]   = React.useState<Order[]>([])
  const [weekTrips,   setWeekTrips]    = React.useState<Order[]>([])
  const [drivers,     setDrivers]      = React.useState<Driver[]>([])
  const [vehicles,    setVehicles]     = React.useState<Vehicle[]>([])
  const [leaves,      setLeaves]       = React.useState<LeaveRequest[]>([])
  const [loading,     setLoading]      = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      listOrders({ scheduled_at: today, per_page: 200 }).then(r =>
        setTodayTrips((r.orders ?? []).sort((a,b) => (a.scheduled_at??"").localeCompare(b.scheduled_at??"")))
      ),
      listOrders({ scheduled_at: mon, end_date: sun, per_page: 500 }).then(r => setWeekTrips(r.orders ?? [])),
      listDrivers().then(r => setDrivers((r.drivers ?? []).filter(d => (d.status as string) !== "pending"))),
      listVehicles().then(r => setVehicles(r.vehicles ?? [])),
      listDriverLeave({ per_page: 500 }).then(r => setLeaves(r.data ?? [])),
    ]).finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, mon, sun])

  // --- Derived ---
  const leavesToday     = leaves.filter(l => l.start_date.slice(0,10) <= today && l.end_date.slice(0,10) >= today)
  const leaveSet        = new Set(leavesToday.map(l => l.user_uuid).filter(Boolean))
  const availDrivers    = drivers.filter(d => !leaveSet.has(d.user_uuid ?? ""))
  const unassigned      = todayTrips.filter(t => !t.driver_assigned_uuid && !t.driver_assigned && t.status !== "canceled" && t.status !== "completed")
  const activeTrips     = todayTrips.filter(t => t.status === "started").length
  const completedTrips  = todayTrips.filter(t => t.status === "completed").length
  const overduePMI      = PMI_VEHICLES.filter(v => v.status === "red").length
  const dueSoonPMI      = PMI_VEHICLES.filter(v => v.status === "amber").length

  // Greeting
  const hr      = new Date().getHours()
  const greeting = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening"
  const dayLabel = new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" })

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 overflow-auto">

      {/* ── Hero Header ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[#496453]/8 via-background to-background p-6 shadow-sm">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full bg-[#496453]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 right-12 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">{greeting} 👋</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {dayLabel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/trips" className="flex items-center gap-2 rounded-xl bg-[#496453] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#496453]/20 hover:bg-[#3a5244] transition-all active:scale-95">
              <TrendingUp className="h-3.5 w-3.5" /> View Trips
            </Link>
            <Link href="/rota" className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted transition-all">
              <Calendar className="h-3.5 w-3.5" /> Open Rota
            </Link>
          </div>
        </div>

        {/* Quick stats strip */}
        {!loading && unassigned.length > 0 && (
          <Link href="/rota" className="relative mt-4 flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50/80 dark:border-amber-700/40 dark:bg-amber-900/20 px-4 py-2.5 text-sm font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-100/80 transition-colors">
            <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />
            <span>
              <strong>{unassigned.length} trip{unassigned.length > 1 ? "s" : ""}</strong> need{unassigned.length === 1 ? "s" : ""} a driver today — assign on the Rota
            </span>
            <ChevronRight className="ml-auto h-4 w-4" />
          </Link>
        )}
      </div>

      {/* ── KPI Strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={Clock}
          label="Trips Today"
          value={loading ? "—" : todayTrips.length}
          sub={
            <span className="flex flex-wrap gap-2">
              {activeTrips > 0 && <span className="font-semibold text-emerald-600 dark:text-emerald-400">● {activeTrips} active</span>}
              {completedTrips > 0 && <span className="text-muted-foreground/70">{completedTrips} done</span>}
              {!activeTrips && !completedTrips && todayTrips.length > 0 && <span>Awaiting dispatch</span>}
            </span>
          }
          gradient="from-[#496453] to-[#5d8068]"
          glowColor="bg-[#496453]"
          loading={loading}
          href="/trips"
        />
        <KpiCard
          icon={Users}
          label="Drivers Available"
          value={loading ? "—" : availDrivers.length}
          sub={
            leavesToday.length > 0
              ? <span className="font-semibold text-amber-600 dark:text-amber-400">{leavesToday.length} on leave today</span>
              : drivers.length > 0 ? <span>of {drivers.length} total drivers</span> : undefined
          }
          gradient="from-blue-500 to-indigo-600"
          glowColor="bg-blue-500"
          loading={loading}
          href="/drivers"
        />
        <KpiCard
          icon={Truck}
          label="Fleet Size"
          value={loading ? "—" : vehicles.length}
          sub={
            <span className="flex gap-2 flex-wrap">
              {overduePMI > 0 && <span className="font-semibold text-red-600 dark:text-red-400">{overduePMI} overdue PMI</span>}
              {dueSoonPMI > 0 && <span className="font-semibold text-amber-600 dark:text-amber-400">{dueSoonPMI} due soon</span>}
              {!overduePMI && !dueSoonPMI && <span>All PMIs on track ✓</span>}
            </span>
          }
          gradient="from-violet-500 to-purple-600"
          glowColor="bg-violet-500"
          loading={loading}
          href="/vehicles"
        />
        <KpiCard
          icon={TrendingUp}
          label="This Week"
          value={loading ? "—" : weekTrips.length}
          sub={<span>trips scheduled Mon–Sun</span>}
          gradient="from-orange-500 to-amber-500"
          glowColor="bg-orange-500"
          loading={loading}
          href="/trips"
        />
      </div>

      {/* ── Operational Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

        {/* Today's trips — 3/5 */}
        <div className="lg:col-span-3">
          <Section title="Today's Trips" href="/trips" icon={Clock} loading={loading}>
            {todayTrips.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">No trips today</p>
                  <p className="mt-0.5 text-sm text-muted-foreground/60">Nothing scheduled for today</p>
                </div>
                <Link href="/trips" className="text-sm font-semibold text-[#496453] hover:underline dark:text-emerald-400">
                  Create a trip →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-0.5 scrollbar-thin">
                {todayTrips.map(t => <TripRow key={t.uuid} trip={t} />)}
              </div>
            )}
          </Section>
        </div>

        {/* Driver status — 2/5 */}
        <div className="lg:col-span-2">
          <Section title="Driver Status" href="/drivers" linkLabel="All drivers" icon={Users} loading={loading}>
            {drivers.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground/60">No drivers found</p>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">{availDrivers.length} available</span>
                  </div>
                  {leavesToday.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-muted-foreground">{leavesToday.length} on leave</span>
                    </div>
                  )}
                  <p className="ml-auto text-[10px] text-muted-foreground/50 font-medium">
                    {Math.round((availDrivers.length / Math.max(drivers.length, 1)) * 100)}% available
                  </p>
                </div>
                {/* Availability bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#496453] to-emerald-400 transition-all duration-700"
                    style={{ width: `${(availDrivers.length / Math.max(drivers.length, 1)) * 100}%` }}
                  />
                </div>
                <DriverGrid drivers={drivers} leavesToday={leavesToday} />
              </div>
            )}
          </Section>
        </div>
      </div>

      {/* ── Detail Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* Week sparkline */}
        <Section title="Week at a Glance" href="/trips" icon={TrendingUp}>
          {loading
            ? <div className="h-24 rounded-xl bg-muted animate-pulse" />
            : <><WeekBars trips={weekTrips} /><p className="text-center text-[10px] text-muted-foreground/50">{weekTrips.length} trips this week</p></>
          }
        </Section>

        {/* Upcoming PMI maintenance */}
        <Section title="Upcoming Maintenance" href="/maintenance" linkLabel="Full schedule" icon={Wrench}>
          <PMIList />
          {(overduePMI > 0 || dueSoonPMI > 0) && (
            <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-semibold
              ${overduePMI > 0
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-400"
                : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-400"
              }`}>
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {overduePMI > 0
                ? `${overduePMI} vehicle${overduePMI > 1 ? "s" : ""} overdue — action required`
                : `${dueSoonPMI} vehicle${dueSoonPMI > 1 ? "s" : ""} due for PMI soon`}
            </div>
          )}
        </Section>

        {/* Upcoming Leave */}
        <Section title="Upcoming Leave" href="/holidays" linkLabel="Manage" icon={CalendarOff}>
          {loading
            ? <div className="flex flex-col gap-2">{[1,2,3].map(i => <div key={i} className="h-11 rounded-xl bg-muted animate-pulse" />)}</div>
            : <LeaveList leaves={leaves} />}
        </Section>

      </div>
    </div>
  )
}
