"use client"
import { useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import * as React from "react"
import {
  CheckCircle2, XCircle, AlertTriangle, Car, Users, Bell, Settings,
  ClipboardList, Wrench, ShieldCheck, Activity, Download, Plus,
  ChevronRight, Camera, PenLine, Clock, MapPin, BarChart3,
  BadgeCheck, Truck, CalendarDays, FileText, ToggleLeft,
} from "lucide-react"
import { useLang } from "@/components/lang-context"

// ─── SHARED DATA ─────────────────────────────────────────────────────────────

const vehicles = [
  { id:"v1", reg:"NUX9VAM", make:"Volvo",   model:"FH 500",   year:2021, weight:"44t", vin:"YV2RT40A4LA123456", mot:"2026-11-14", interval:6, lastPMI:"2026-01-29", status:"amber",  driver:"James O'Connor"   },
  { id:"v2", reg:"TB67KLM", make:"DAF",     model:"XF 480",   year:2020, weight:"44t", vin:"XL1AS20DA0E453201", mot:"2026-08-22", interval:6, lastPMI:"2026-01-15", status:"red",    driver:"Maria Santos"     },
  { id:"v3", reg:"PN19RFX", make:"Mercedes",model:"Actros",   year:2019, weight:"44t", vin:"WDB9634031L456789", mot:"2026-06-30", interval:8, lastPMI:"2026-02-10", status:"green",  driver:"Piotr Kowalski"   },
  { id:"v4", reg:"LK21DVA", make:"Scania",  model:"R 450",    year:2021, weight:"44t", vin:"YS2R4X20001234567", mot:"2026-10-18", interval:6, lastPMI:"2026-02-20", status:"green",  driver:"Lena Fischer"     },
  { id:"v5", reg:"OU70TBN", make:"Iveco",   model:"S-Way",    year:2020, weight:"26t", vin:"ZCFC7T0A004567890", mot:"2026-07-05", interval:4, lastPMI:"2025-12-10", status:"red",    driver:"Ahmed Hassan"     },
  { id:"v6", reg:"YJ19HKP", make:"MAN",     model:"TGX 18.510",year:2019,weight:"44t", vin:"WMA09YZZ1KM123456", mot:"2026-09-12", interval:6, lastPMI:"2026-02-05", status:"amber",  driver:"Sophie Turner"    },
]

function nextPMIDate(lastPMI: string, interval: number) {
  const d = new Date(lastPMI)
  d.setDate(d.getDate() + interval * 7)
  return d
}
function daysUntil(date: Date) {
  return Math.round((date.getTime() - Date.now()) / 86400000)
}
function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
}

// ─── SUB COMPONENTS ───────────────────────────────────────────────────────────

function KPICard({ label, value, sub, icon: Icon, color }: { label:string; value:string|number; sub?:string; icon:React.ElementType; color:string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</p>
        {sub && <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

function StatusDot({ s, statusConfig }: { s: string; statusConfig: Record<string, { dot: string }> }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${statusConfig[s]?.dot ?? "bg-muted"}`} />
}

// ─── TAB 1: DASHBOARD ─────────────────────────────────────────────────────────

function DashboardTab() {
  const { t } = useLang()
  const h = t.maintenanceHub
  const vor   = vehicles.filter(v => v.status === "red").length
  const amber = vehicles.filter(v => v.status === "amber").length
  const green = vehicles.filter(v => v.status === "green").length
  const pmiOnTime = Math.round((green / vehicles.length) * 100)

  const statusConfig = {
    green: { label: h.compliant,  bg:"bg-green-500/15",  border:"border-green-500",  text:"text-green-700 dark:text-green-400",  dot:"bg-green-500"  },
    amber: { label: h.dueSoon,    bg:"bg-amber-500/15",  border:"border-amber-500",  text:"text-amber-700 dark:text-amber-400",  dot:"bg-amber-500"  },
    red:   { label: h.overdueVOR, bg:"bg-red-500/15",    border:"border-red-500",    text:"text-red-700 dark:text-red-400",      dot:"bg-red-500"    },
  }

  const schedule: { week: string; vehicles: typeof vehicles }[] = []
  for (let w = 0; w < 8; w++) {
    const wStart = new Date(); wStart.setDate(wStart.getDate() + w * 7)
    const wEnd   = new Date(wStart); wEnd.setDate(wEnd.getDate() + 6)
    const due = vehicles.filter(v => {
      const d = nextPMIDate(v.lastPMI, v.interval)
      return d >= wStart && d <= wEnd
    })
    schedule.push({ week: `w/c ${fmtDate(wStart)}`, vehicles: due })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label={h.kpiVOR}      value={vor}   sub={h.kpiVORSub}      icon={Truck}        color="bg-red-500"    />
        <KPICard label={h.kpiDueSoon}  value={amber} sub={h.kpiDueSoonSub}  icon={AlertTriangle} color="bg-amber-500" />
        <KPICard label={h.kpiCompliant} value={green} sub={h.kpiCompliantSub} icon={CheckCircle2} color="bg-green-500" />
        <KPICard label={h.kpiPMIRate}  value={`${pmiOnTime}%`} sub={h.kpiPMIRateSub} icon={BarChart3} color="bg-indigo-500" />
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-indigo-500" />
          <h3 className="font-semibold">{h.earnedRecognition}</h3>
          <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">{h.dvsaScheme}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "PMI Completed On Time", value: pmiOnTime, target:100 },
            { label: "Defects Found & Fixed",  value: 87,        target:100 },
            { label: "Roadworthiness Rate",    value: 94,        target:100 },
          ].map(k => (
            <div key={k.label} className="rounded-lg border bg-muted/20 p-3">
              <div className="flex justify-between text-xs">
                <span className="font-medium">{k.label}</span>
                <span className={k.value >= k.target ? "text-green-600" : "text-amber-600"}>{k.value}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${k.value >= k.target ? "bg-green-500" : k.value >= 90 ? "bg-amber-500" : "bg-red-500"}`} style={{ width:`${k.value}%` }} />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">{h.target.replace("{n}", String(k.target))}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-4 font-semibold">{h.fleetStatusBoard}</h3>
        <div className="flex flex-col gap-2">
          {([...vehicles].sort((a,b)=>({red:0,amber:1,green:2}[a.status as string]??3)-({red:0,amber:1,green:2}[b.status as string]??3))).map((v,idx,arr) => {
            const next = nextPMIDate(v.lastPMI, v.interval)
            const days = daysUntil(next)
            const s = statusConfig[v.status as keyof typeof statusConfig]
            const showDivider = idx > 0 && v.status === "green" && arr[idx-1]?.status !== "green"
            return (
              <React.Fragment key={v.id}>
                {showDivider && (
                  <div className="flex items-center gap-2 my-1">
                    <div className="flex-1 border-t border-dashed" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{h.compliant}</span>
                    <div className="flex-1 border-t border-dashed" />
                  </div>
                )}
                <div className={`flex items-center gap-3 rounded-lg border-l-4 ${s.border} ${s.bg} p-3 ${v.status!=="green"?(v.status==="red"?"ring-1 ring-inset ring-red-400/50":"ring-1 ring-inset ring-amber-400/50"):""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusDot s={v.status} statusConfig={statusConfig} />
                    <span className="font-semibold text-sm font-mono">{v.reg}</span>
                    <span className="text-xs text-muted-foreground">{v.make} {v.model}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{h.driver}: {v.driver}</p>
                  <p className={`mt-0.5 text-xs font-medium ${s.text}`}>
                    {h.nextPMI}: {fmtDate(next)} ({days < 0 ? h.daysOverdue.replace("{n}", String(Math.abs(days))) : `${days}d`})
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.text} ${s.bg}`}>{s.label}</span>
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">{h.pmiSchedule}</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {schedule.map((wk, i) => (
            <div key={i} className={`rounded-lg border p-3 ${wk.vehicles.length ? "border-indigo-300 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/20" : "bg-muted/20"}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{wk.week}</p>
              {wk.vehicles.length === 0
                ? <p className="mt-1 text-xs text-muted-foreground">{h.noPMIsDue}</p>
                : wk.vehicles.map(v => <p key={v.id} className="mt-1 text-xs font-medium font-mono">{v.reg}</p>)
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── TAB 2: PMI SCHEDULE (list → detail) ──────────────────────────────────────

type ItemState = "pass" | "fail" | "advisory" | null

function sortedByUrgency() {
  return [...vehicles].sort((a, b) => {
    const da = daysUntil(nextPMIDate(a.lastPMI, a.interval))
    const db = daysUntil(nextPMIDate(b.lastPMI, b.interval))
    return da - db
  })
}

const pmiChecklist = [
  { section:"Brakes", items:["Service brake function","Air pressure warning","Brake fluid / air leaks","Handbrake function","ABS warning light"] },
  { section:"Steering", items:["Steering play & feel","Power steering fluid","Column & joints"] },
  { section:"Tyres & Wheels", items:["Tread depth (min 1mm)","Tyre condition / sidewalls","Wheel nuts torqued","Spare tyre"] },
  { section:"Lights & Electrics", items:["Headlights main beam","Headlights dipped","Tail lights & brake lights","Indicators & hazards","Reverse light & audible warning","Dashboard warning lights"] },
  { section:"Body & Cab", items:["Windscreen (no cracks)","Wipers & washers","Mirrors & condition","Horn","Seatbelts"] },
  { section:"Engine & Fluids", items:["Engine oil level","Coolant level","AdBlue level","Fuel leaks","Battery condition"] },
  { section:"Suspension & Chassis", items:["Air bags condition","Spring leaves","Chassis for cracks","Kingpin & fifth wheel"] },
  { section:"Trailer Coupling", items:["Fifth wheel lubricated","Coupling locks correctly","Trailer electrical socket","Air lines connected"] },
]

function PMIDetailSheet({ vehicleId, onBack }: { vehicleId: string; onBack: () => void }) {
  const { t } = useLang()
  const h = t.maintenanceHub
  const [states, setStates] = React.useState<Record<string, ItemState>>({})
  const [brakeAxle1, setBrakeAxle1] = React.useState("")
  const [brakeAxle2, setBrakeAxle2] = React.useState("")
  const [signed, setSigned]         = React.useState(false)
  const [sigText, setSigText]       = React.useState("")
  const [submitted, setSubmitted]   = React.useState(false)
  const now = new Date()
  const veh = vehicles.find(v => v.id === vehicleId)!
  const total    = pmiChecklist.flatMap(s => s.items).length
  const passed   = Object.values(states).filter(v => v === "pass").length
  const failed   = Object.values(states).filter(v => v === "fail").length
  const advisory = Object.values(states).filter(v => v === "advisory").length

  function setItem(key: string, v: ItemState) {
    setStates(p => ({ ...p, [key]: p[key] === v ? null : v }))
  }

  if (submitted) return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-500" />
      <h2 className="text-2xl font-bold">{h.pmiSubmitted}</h2>
      <p className="text-muted-foreground">{t.common.for} <strong>{veh.reg}</strong> {t.common.at ?? "at"} {now.toLocaleTimeString("en-GB")} · {now.toLocaleDateString("en-GB")}</p>
      <p className="text-xs text-muted-foreground">{h.pass} {passed} · {h.advisory} {advisory} · {h.fail} {failed} {t.common.of} {total} {h.itemsCompleted}</p>
      <button onClick={onBack} className="mt-2 rounded-lg border px-4 py-2 text-sm hover:bg-muted">{h.backToSchedule}</button>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h.inspectionProgress}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <p className="text-[10px] text-muted-foreground">{h.itemsCompleted}</p>
              <p className="text-sm font-semibold">{passed + failed + advisory} / {total}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">{h.results}</p>
              <p className="text-xs font-semibold">
                <span className="text-green-600">{passed} {h.pass}</span>
                {advisory > 0 && <span className="ml-1 text-amber-600">{advisory} {h.advisory}</span>}
                {failed > 0 && <span className="ml-1 text-red-600">{failed} {h.fail}</span>}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">{h.location}</p>
              <p className="text-xs font-medium">52.7233° N · Towers Business Park</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">{h.interval}</p>
              <p className="text-xs font-medium">{veh.interval}w · {veh.make} {veh.model}</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${((passed+failed+advisory)/total)*100}%` }} />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h.technicianDecl}</p>
          <input defaultValue="Gareth Williams" className="h-8 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Technician name" />
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" />
            <span>{now.toLocaleDateString("en-GB")} {now.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" })}</span>
          </div>
          <p className="text-[11px] text-muted-foreground border-t pt-2">
            I confirm that{" "}
            <span className="font-mono font-semibold text-foreground">{veh.reg}</span>{" "}
            has been inspected in accordance with the DVSA Guide to Maintaining Roadworthiness and is, to the best of my knowledge, roadworthy.
          </p>
          <div className="flex items-center gap-2">
            <input value={sigText} onChange={e => setSigText(e.target.value)} placeholder="Type full name to sign" className="h-8 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={() => setSigned(!!sigText)} disabled={!sigText} className={`shrink-0 inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors ${signed ? "bg-green-500 text-white" : "border bg-background hover:bg-muted disabled:opacity-50"}`}>
              {signed ? <><CheckCircle2 className="h-3.5 w-3.5" /> {h.signed}</> : h.sign}
            </button>
          </div>
          {signed && <p className="text-[10px] text-green-600">{h.signed}: <strong>{sigText}</strong> {t.common.at ?? "at"} {now.toLocaleTimeString("en-GB")}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {pmiChecklist.map(section => (
          <div key={section.section} className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="border-b bg-muted/40 px-3 py-2 flex items-center gap-1.5">
              <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold text-xs">{section.section}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">
                {section.items.filter(item => states[`${section.section}::${item}`] === "pass").length}/{section.items.length}
              </span>
            </div>
            <div className="divide-y">
              {section.items.map(item => {
                const key = `${section.section}::${item}`
                const st  = states[key]
                return (
                  <div key={item} className="flex items-center justify-between gap-1.5 px-3 py-1.5">
                    <span className="text-[11px] flex-1 min-w-0 truncate" title={item}>{item}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setItem(key,"pass")}     className={`rounded px-1.5 py-0.5 text-[9px] font-medium transition-colors ${st==="pass"     ? "bg-green-500 text-white" : "border hover:bg-green-50 dark:hover:bg-green-950/20 text-muted-foreground"}`}>{h.pass}</button>
                      <button onClick={() => setItem(key,"advisory")} className={`rounded px-1.5 py-0.5 text-[9px] font-medium transition-colors ${st==="advisory" ? "bg-amber-500 text-white" : "border hover:bg-amber-50 dark:hover:bg-amber-950/20 text-muted-foreground"}`}>{h.advisory}</button>
                      <button onClick={() => setItem(key,"fail")}     className={`rounded px-1.5 py-0.5 text-[9px] font-medium transition-colors ${st==="fail"     ? "bg-red-500 text-white"   : "border hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground"}`}>{h.fail}</button>
                      <button className={`flex items-center justify-center h-5 w-5 rounded border transition-colors ${st==="fail" ? "border-red-400 text-red-500 bg-red-50 dark:bg-red-950/20 hover:bg-red-100" : st==="advisory" ? "border-amber-400 text-amber-500 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100" : "border-dashed border-muted-foreground/40 text-muted-foreground/40 hover:border-muted-foreground hover:text-muted-foreground"}`}>
                        <Camera className="h-2.5 w-2.5" />
                      </button>
                      {st === "fail" && (
                        <select className="h-5 rounded border text-[9px] bg-background px-0.5"><option>{h.advisory}</option><option>Dangerous</option></select>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-4 font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-indigo-500" /> {h.brakeTest}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: h.axle1, val:brakeAxle1, set:setBrakeAxle1 },
            { label: h.axle2, val:brakeAxle2, set:setBrakeAxle2 },
          ].map(f => (
            <div key={f.label}>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
              <input type="number" min={0} max={100} value={f.val} onChange={e => f.set(e.target.value)} placeholder="e.g. 52" className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              {f.val && <p className={`mt-1 text-xs ${Number(f.val) >= 50 ? "text-green-600" : "text-red-600"}`}>{Number(f.val) >= 50 ? h.meetsDVSA : h.belowDVSA}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button disabled={!signed} onClick={() => setSubmitted(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          <ShieldCheck className="h-4 w-4" /> {h.submitPMI}
        </button>
        {!signed && <p className="text-xs text-muted-foreground">{h.signFirst}</p>}
      </div>
    </div>
  )
}

function PMITab({ openVehicleId, setOpenVehicleId }: { openVehicleId: string | null; setOpenVehicleId: (id: string | null) => void }) {
  const { t } = useLang()
  const h = t.maintenanceHub
  const statusConfig = {
    green: { label: h.compliant,  text:"text-green-700 dark:text-green-400", bg:"bg-green-500/15", dot:"bg-green-500" },
    amber: { label: h.dueSoon,    text:"text-amber-700 dark:text-amber-400", bg:"bg-amber-500/15", dot:"bg-amber-500" },
    red:   { label: h.overdueVOR, text:"text-red-700 dark:text-red-400",     bg:"bg-red-500/15",   dot:"bg-red-500"   },
  }
  const sorted = sortedByUrgency()

  if (openVehicleId) return <PMIDetailSheet vehicleId={openVehicleId} onBack={() => setOpenVehicleId(null)} />

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Select a vehicle to begin or review its PMI inspection sheet. Sorted by urgency.</p>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="border-b bg-muted/40 px-4 py-2.5 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">{h.pmiSheet}</span>
          <span className="ml-auto text-xs text-muted-foreground">{h.clickToInspect}</span>
        </div>
        <div className="divide-y">
          {sorted.map(v => {
            const next = nextPMIDate(v.lastPMI, v.interval)
            const days = daysUntil(next)
            const s = statusConfig[v.status as keyof typeof statusConfig]
            return (
              <button key={v.id} onClick={() => setOpenVehicleId(v.id)}
                className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              >
                <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold font-mono text-sm">{v.reg}</span>
                    <span className="text-xs text-muted-foreground">{v.make} {v.model}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{h.driver}: {v.driver} · {h.interval}: {v.interval}w</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-semibold ${s.text}`}>
                    {days < 0 ? h.daysOverdue.replace("{n}", String(Math.abs(days))) : days === 0 ? h.dueToday : h.dueIn.replace("{n}", String(days))}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{fmtDate(next)}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${s.text} ${s.bg}`}>{s.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── TAB 3: DEFECTS ──────────────────────────────────────────────────────────

const defects = [
  { id:"d1", date:"2026-03-10", reg:"TB67KLM", reporter:"Maria Santos",      role:"Driver",     type:"Walkaround", item:"Warning Light",       desc:"DPF warning illuminated",                status:"open"    },
  { id:"d2", date:"2026-03-05", reg:"NUX9VAM", reporter:"Gareth Williams",   role:"Technician", type:"PMI",        item:"Tyre – nearside rear", desc:"Tread depth 2.1mm – advisory",          status:"resolved"},
  { id:"d3", date:"2026-02-20", reg:"OU70TBN", reporter:"Ahmed Hassan",      role:"Driver",     type:"Walkaround", item:"Brake",               desc:"Air leak noise from rear axle group",    status:"open"    },
  { id:"d4", date:"2026-02-18", reg:"YJ19HKP", reporter:"Gareth Williams",   role:"Technician", type:"PMI",        item:"ABS light",           desc:"ABS warning fault – sensor replaced",    status:"resolved"},
]

function DefectsTab() {
  const { t } = useLang()
  const h = t.maintenanceHub
  const [filter, setFilter] = React.useState("all")
  const [signOff, setSignOff] = React.useState<Record<string, boolean>>({})
  const filtered = defects.filter(d => filter === "all" || d.status === filter)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <KPICard label={h.openDefects}  value={defects.filter(d=>d.status==="open").length}     icon={AlertTriangle} color="bg-red-500"    sub={h.requiresAction} />
        <KPICard label={h.resolved}     value={defects.filter(d=>d.status==="resolved").length} icon={CheckCircle2}  color="bg-green-500"  sub={h.completed} />
        <KPICard label={h.totalDefects} value={defects.length}                                   icon={FileText}      color="bg-indigo-500" sub={h.allTime} />
      </div>

      <div className="flex items-center gap-2">
        {["all","open","resolved"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filter===f ? "bg-primary text-primary-foreground" : "border bg-background hover:bg-muted"}`}>{f}</button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map(d => (
          <div key={d.id} className={`rounded-xl border shadow-sm overflow-hidden ${d.status==="open" ? "border-red-200 dark:border-red-900/40" : "border-green-200 dark:border-green-900/40"}`}>
            <div className={`flex items-center justify-between gap-3 px-4 py-3 ${d.status==="open" ? "bg-red-50 dark:bg-red-950/20" : "bg-green-50 dark:bg-green-950/20"}`}>
              <div className="flex items-center gap-2">
                {d.status==="open" ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                <span className="font-semibold text-sm">{d.item}</span>
                <span className="font-mono text-xs text-muted-foreground">{d.reg}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium">{d.type}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${d.status==="open" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{d.status}</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm">{d.desc}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span><Clock className="inline h-3 w-3 mr-1" />{d.date}</span>
                <span><Users className="inline h-3 w-3 mr-1" />{d.reporter} ({d.role})</span>
              </div>
              {d.status === "resolved" && (
                <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1">
                  <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">{h.rectificationRecord}</p>
                  <p><span className="font-medium">{h.partsUsed}</span> {d.id==="d2" ? "Advisory – no parts required" : "DPF pressure sensor, EGR valve gasket"}</p>
                  <p><span className="font-medium">{h.labour}</span> {d.id==="d2" ? "0h 15m" : "2h 45m"}</p>
                  <p><span className="font-medium">{h.signedOffBy}</span> Gareth Williams · {d.date}</p>
                </div>
              )}
              {d.status === "open" && !signOff[d.id] && (
                <div className="rounded-lg border border-dashed p-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">{h.logRectification}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input placeholder={h.partsUsed} className="h-8 rounded-lg border bg-background px-2 text-xs outline-none" />
                    <input placeholder={h.labour} className="h-8 rounded-lg border bg-background px-2 text-xs outline-none" />
                  </div>
                  <button onClick={() => setSignOff(p => ({ ...p, [d.id]: true }))} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-green-500 px-3 text-xs font-medium text-white hover:bg-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {h.markRoadworthy}
                  </button>
                </div>
              )}
              {d.status === "open" && signOff[d.id] && (
                <p className="text-xs text-green-600 font-medium">{h.signedOffRoadworthy}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── TAB 4: SETTINGS ─────────────────────────────────────────────────────────

const roles = [
  { name:"Gareth Williams", email:"gareth@fleetyes.co.uk",  role:"Technician", access:"PMI sheets only"   },
  { name:"Sandra Okafor",   email:"sandra@fleetyes.co.uk",  role:"Technician", access:"PMI sheets only"   },
  { name:"Fleet Manager",   email:"manager@fleetyes.co.uk", role:"Admin",      access:"Full access"       },
  { name:"DVSA Inspector",  email:"dvsa@example.gov.uk",    role:"Auditor",    access:"Read-only"         },
]

function SettingsTab() {
  const { t } = useLang()
  const h = t.maintenanceHub
  const [notifPMI, setNotifPMI] = React.useState(true)
  const [notifFail, setNotifFail] = React.useState(true)
  const [notifVOR, setNotifVOR] = React.useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
          <h3 className="font-semibold flex items-center gap-2"><Truck className="h-4 w-4" /> {h.vehicleProfiles}</h3>
          <button className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90">{h.addVehicle}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b bg-muted/20">
              {["Reg","Make / Model","Year","Weight","VIN","MOT Expiry","Interval",t.common.action ?? "Action"].map(h => (
                <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-3 py-2 font-mono font-semibold">{v.reg}</td>
                  <td className="px-3 py-2">{v.make} {v.model}</td>
                  <td className="px-3 py-2">{v.year}</td>
                  <td className="px-3 py-2">{v.weight}</td>
                  <td className="px-3 py-2 font-mono text-muted-foreground">{v.vin}</td>
                  <td className="px-3 py-2">{v.mot}</td>
                  <td className="px-3 py-2">{v.interval}w</td>
                  <td className="px-3 py-2"><button className="text-indigo-500 hover:underline">{t.common.edit}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
          <h3 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> {h.userRolesPerms}</h3>
          <button className="inline-flex h-8 items-center rounded-lg border px-3 text-xs hover:bg-muted">{h.inviteUser}</button>
        </div>
        <div className="divide-y">
          {roles.map(r => (
            <div key={r.email} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.email}</p>
              </div>
              <div className="text-right">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.role==="Admin" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" : r.role==="Auditor" ? "bg-gray-100 text-foreground" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>{r.role}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{r.access}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="border-b bg-muted/40 px-4 py-3">
          <h3 className="font-semibold flex items-center gap-2"><Bell className="h-4 w-4" /> {h.notificationEngine}</h3>
        </div>
        <div className="divide-y p-4 space-y-4">
          {[
            { label:"Alert manager 7 days before PMI is due", sub:"Email + Push", val:notifPMI,  set:setNotifPMI  },
            { label:"Alert manager immediately on PMI fail",  sub:"SMS + Email",  val:notifFail, set:setNotifFail },
            { label:"Alert manager when vehicle is placed VOR", sub:"Push",       val:notifVOR,  set:setNotifVOR  },
          ].map(n => (
            <div key={n.label} className="flex items-center justify-between gap-4 py-1">
              <div>
                <p className="text-sm font-medium">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.sub}</p>
              </div>
              <button onClick={() => n.set((p:boolean) => !p)} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${n.val ? "bg-indigo-500" : "bg-muted border"}`}>
                <span className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${n.val ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
          <h3 className="font-semibold flex items-center gap-2"><ToggleLeft className="h-4 w-4" /> {h.customChecklist}</h3>
          <button className="inline-flex h-8 items-center rounded-lg border px-3 text-xs hover:bg-muted">{h.addItem}</button>
        </div>
        <div className="divide-y">
          {["Tail lift function & safety cutout","Refrigeration unit thermostat reading","Hiab crane slew ring bolts","Load securing straps condition"].map(item => (
            <div key={item} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm">{item}</span>
              <div className="flex gap-2">
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Custom</span>
                <button className="text-xs text-muted-foreground hover:text-red-500">{h.remove}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h3 className="mb-4 font-semibold flex items-center gap-2"><Download className="h-4 w-4" /> {h.dataExport}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label:"Full Vehicle History PDF",    sub:"All PMI reports for all vehicles" },
            { label:"Compliance Report (DVSA)",    sub:"Earned Recognition format"        },
            { label:"Defect Log CSV",              sub:"All open and resolved defects"    },
            { label:"Sync with Samsara / Webfleet",sub:"Live mileage API integration"    },
          ].map(e => (
            <button key={e.label} className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3 text-left hover:bg-muted/40 transition-colors">
              <Download className="h-4 w-4 shrink-0 text-indigo-500" />
              <div>
                <p className="text-sm font-medium">{e.label}</p>
                <p className="text-xs text-muted-foreground">{e.sub}</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── PAGE SHELL ───────────────────────────────────────────────────────────────

function MaintenancePageInner() {
  const { t } = useLang()
  const h = t.maintenanceHub
  const searchParams = useSearchParams()
  const tabIds = ["dashboard", "pmi", "defects", "settings"] as const
  type TabId = typeof tabIds[number]
  const TABS = [
    { id:"dashboard" as TabId, label: h.tabDashboard, icon: BarChart3     },
    { id:"pmi"       as TabId, label: h.tabPMI,       icon: ClipboardList },
    { id:"defects"   as TabId, label: h.tabDefects,   icon: Wrench        },
    { id:"settings"  as TabId, label: h.tabSettings,  icon: Settings      },
  ]
  const initialTab = (searchParams.get("tab") ?? "dashboard") as TabId
  const [tab, setTab] = React.useState<TabId>(tabIds.includes(initialTab) ? initialTab : "dashboard")
  const vor = vehicles.filter(v => v.status === "red").length
  const [pmiVehicleId, setPmiVehicleId] = React.useState<string | null>(null)

  const statusConfig = {
    green: { label: h.compliant,  text:"text-green-700 dark:text-green-400", bg:"bg-green-500/15" },
    amber: { label: h.dueSoon,    text:"text-amber-700 dark:text-amber-400", bg:"bg-amber-500/15" },
    red:   { label: h.overdueVOR, text:"text-red-700 dark:text-red-400",     bg:"bg-red-500/15"   },
  }
  const pmiVeh = pmiVehicleId ? vehicles.find(v => v.id === pmiVehicleId) : null
  const pmiStatus = pmiVeh ? statusConfig[pmiVeh.status as keyof typeof statusConfig] : null

  return (
    <div className="flex flex-1 flex-col gap-4 p-6 md:p-8 lg:p-10">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageHeader pageKey="maintenance" />
          <p className="mt-1 text-sm text-muted-foreground">DVSA-compliant PMI management · Fleet compliance tracking</p>
        </div>
        {vor > 0 && (
          <div className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            <XCircle className="h-4 w-4" /> {h.vorAlert.replace("{n}", String(vor)).replace("{s}", vor > 1 ? "s" : "")}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1 rounded-xl border bg-muted/30 p-1">
          {TABS.map(tb => (
            <button
              key={tb.id}
              onClick={() => { setTab(tb.id); if (tb.id !== "pmi") setPmiVehicleId(null) }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-medium transition-colors ${tab===tb.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <tb.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tb.label}</span>
            </button>
          ))}
        </div>
        {tab === "pmi" && pmiVehicleId && pmiVeh && pmiStatus && (
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => setPmiVehicleId(null)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs hover:bg-muted">{h.schedule}</button>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-background px-3 text-xs text-muted-foreground hover:bg-muted"><Download className="h-3.5 w-3.5" /> PDF</button>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${pmiStatus.text} ${pmiStatus.bg}`}>{pmiStatus.label}</span>
          </div>
        )}
      </div>

      {tab === "dashboard" && <DashboardTab />}
      {tab === "pmi"       && <PMITab openVehicleId={pmiVehicleId} setOpenVehicleId={setPmiVehicleId} />}
      {tab === "defects"   && <DefectsTab />}
      {tab === "settings"  && <SettingsTab />}
    </div>
  )
}

export default function MaintenancePage() {
  return (
    <React.Suspense fallback={<div className="flex flex-1 items-center justify-center p-10 text-muted-foreground">Loading…</div>}>
      <MaintenancePageInner />
    </React.Suspense>
  )
}
