"use client"

import * as React from "react"
import {
  Search, RefreshCw, Plus, Upload, Download,
  MoreHorizontal, List, Map as MapIcon, MapPin,
} from "lucide-react"

// ─── Data ─────────────────────────────────────────────────────────────────────

type Place = {
  id: string
  code: string
  address: string
  publicId: string
  postcode: string
  country: string
  // Approximate SVG coords within UK viewBox (0 0 370 600)
  // x=0 left, x=370 right | y=0 top (north Scotland), y=600 bottom (south England)
  svgX: number
  svgY: number
}

const places: Place[] = [
  { id:  "1", code: "Web - humber bridge",       address: "WEB - HUMBER BRIDGE - TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",      publicId: "n07Z3Er", postcode: "WS15 1LX", country: "United Kingdom", svgX: 195, svgY: 330 },
  { id:  "2", code: "DXM4",                       address: "DXM4 - CROSSWAYS BUSINESS PARK, DARTFORD, DA1 5FD",                   publicId: "ewF2B05", postcode: "DA1 5FD",  country: "United Kingdom", svgX: 248, svgY: 460 },
  { id:  "3", code: "DXS1",                       address: "DXS1 - 201 UPWELL ST, SHEFFIELD, S4 8AL",                             publicId: "xnWHZcO", postcode: "S4 8AL",   country: "United Kingdom", svgX: 202, svgY: 300 },
  { id:  "4", code: "EMA43",                      address: "EMA43 - TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",                     publicId: "lNuxDHw", postcode: "WS15 1LX", country: "United Kingdom", svgX: 192, svgY: 332 },
  { id:  "5", code: "EMSA",                       address: "EMSA - TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",                      publicId: "z3TXn2a", postcode: "WS15 1LX", country: "United Kingdom", svgX: 190, svgY: 334 },
  { id:  "6", code: "DLU2",                       address: "DLU2 - UNIT 2, BEDFORDSHIRE, LU5 6JH",                                publicId: "vlPSxRE", postcode: "LU5 6JH",  country: "United Kingdom", svgX: 230, svgY: 415 },
  { id:  "7", code: "XLH3",                       address: "XLH3 - MAERSK, UNIT 49 YORKSHIRE WAY, DONCASTER, DN3 3FT",            publicId: "dcYlNX9", postcode: "DN3 3FT",  country: "United Kingdom", svgX: 210, svgY: 295 },
  { id:  "8", code: "DLS4",                       address: "DLS4 - TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",                      publicId: "oySdaLi", postcode: "WS15 1LX", country: "United Kingdom", svgX: 193, svgY: 336 },
  { id:  "9", code: "DSN1",                       address: "DSN1 - WOODSIDE RD, SWINDON, SN3 4WA",                                publicId: "0dJ31wI", postcode: "SN3 4WA",  country: "United Kingdom", svgX: 193, svgY: 430 },
  { id: "10", code: "DDN1",                       address: "DDN1 - UNIT 2A ONTARIO DRIVE, SOUTH YORKSHIRE, DN11 0BF",             publicId: "wGpB9d8", postcode: "DN11 0BF", country: "United Kingdom", svgX: 212, svgY: 297 },
  { id: "11", code: "DXM2",                       address: "DXM2 - FIFTH AVENUE, GREATER MANCHESTER, M17 1TN",                    publicId: "qRgKsvn", postcode: "M17 1TN",  country: "United Kingdom", svgX: 178, svgY: 265 },
  { id: "12", code: "DCE1",                       address: "DCE1 - DEESIDE INDUSTRIAL PARK, CH5 2FN",                             publicId: "ksepQSZ", postcode: "CH5 2FN",  country: "United Kingdom", svgX: 160, svgY: 290 },
  { id: "13", code: "DNR1",                       address: "DNR1 - 2 CALEY CL, NORWICH, NR3 2BU",                                 publicId: "gbneVP7", postcode: "NR3 2BU",  country: "United Kingdom", svgX: 270, svgY: 375 },
  { id: "14", code: "IMC_UKBH_B24_11PB_417",      address: "IMC_UKBH_B24_11PB_417 - TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",    publicId: "uKA3m90", postcode: "WS15 1LX", country: "United Kingdom", svgX: 197, svgY: 338 },
  { id: "15", code: "TBS_DIST_CO7_7DW_332",       address: "TBS_DIST_CO7_7DW_332 - FRATING, COLCHESTER CO7 7DW",                  publicId: "xnWt3iD", postcode: "CO7 7DW",  country: "United Kingdom", svgX: 260, svgY: 430 },
  { id: "16", code: "YLCY8",                      address: "YLCY8 - TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",                     publicId: "vM3aqli", postcode: "WS15 1LX", country: "United Kingdom", svgX: 195, svgY: 340 },
  { id: "17", code: "XUK6",                       address: "XUK6 - UPS WAREHOUSE DUNSTABLE, LU56JH",                              publicId: "darDyjw", postcode: "LU56JH",   country: "United Kingdom", svgX: 228, svgY: 418 },
  { id: "18", code: "MURRAY_A_BN27_4EL_331",      address: "MURRAY_A_BN27_4EL_331 - HAILSHAM BN27 4EL",                          publicId: "tSmuvGU", postcode: "BN27 4EL", country: "United Kingdom", svgX: 243, svgY: 475 },
  { id: "19", code: "DBR2",                       address: "DBR2 - TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",                      publicId: "sxihlkK", postcode: "WS15 1LX", country: "United Kingdom", svgX: 191, svgY: 342 },
  { id: "20", code: "DRM2",                       address: "DRM2 - TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",                      publicId: "s6VM7sz", postcode: "WS15 1LX", country: "United Kingdom", svgX: 189, svgY: 344 },
  { id: "21", code: "BHX8",                       address: "BHX8 - FAR MOOR LANE, WORCESTERSHIRE, B98 9AY",                       publicId: "xnW7rXj", postcode: "B98 9AY",  country: "United Kingdom", svgX: 185, svgY: 358 },
  { id: "22", code: "DEX2",                       address: "DEX2 - SKYPARK, EXETER, EX5 2FL",                                     publicId: "n2hfKNT", postcode: "EX5 2FL",  country: "United Kingdom", svgX: 143, svgY: 490 },
  { id: "23", code: "DNG2",                       address: "DNG2 - PLOT 8 HALL FARM RD, DERBY, DE74 2BF",                         publicId: "ewFpREJ", postcode: "DE74 2BF", country: "United Kingdom", svgX: 208, svgY: 320 },
  { id: "24", code: "DOX2",                       address: "DOX2 - 3 SOUTHAM RD, BANBURY, OX16 2DJ",                              publicId: "kARsbzp", postcode: "OX16 2DJ", country: "United Kingdom", svgX: 210, svgY: 405 },
  { id: "25", code: "STN7",                       address: "STN7 - AMAZON WOOTTON, BEDFORD, MK43 9QJ",                            publicId: "xnWqOGV", postcode: "MK43 9QJ", country: "United Kingdom", svgX: 235, svgY: 408 },
  { id: "26", code: "HIG3",                       address: "HIG3 - ALPHA ROAD, ENFIELD, EN3 7FU",                                 publicId: "586RMuK", postcode: "EN3 7FU",  country: "United Kingdom", svgX: 248, svgY: 445 },
  { id: "27", code: "DHW1",                       address: "DHW1 - THIRD AVENUE, HARLOW, CM19 5AW",                               publicId: "7JyaxR1", postcode: "CM19 5AW", country: "United Kingdom", svgX: 252, svgY: 440 },
  { id: "28", code: "DPE2",                       address: "DPE2 - UNIT 3, CAMBRIDGESHIRE, PE7 3AG",                              publicId: "cmlxuMy", postcode: "PE7 3AG",  country: "United Kingdom", svgX: 245, svgY: 383 },
  { id: "29", code: "DBS2",                       address: "DBS2 - POPLAR WAY E, AVONMOUTH, BRISTOL, BS11 0YH",                   publicId: "vM3n4Fg", postcode: "BS11 0YH", country: "United Kingdom", svgX: 168, svgY: 430 },
  { id: "30", code: "DHU2",                       address: "DHU2 - TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",                      publicId: "7JyaxRT", postcode: "WS15 1LX", country: "United Kingdom", svgX: 187, svgY: 346 },
  { id: "31", code: "HRM2",                       address: "HRM2 - TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",                      publicId: "yIxvzba", postcode: "WS15 1LX", country: "United Kingdom", svgX: 185, svgY: 348 },
  { id: "32", code: "NCL2",                       address: "NCL2 - NORTH CHAPELL LANE, COUNTY DURHAM T, TS22 5TH",                publicId: "3147C5n", postcode: "TS22 5TH", country: "United Kingdom", svgX: 205, svgY: 220 },
  { id: "33", code: "MME1",                       address: "MME1 - SYMMETRY PARK, DARLINGTON, DL1 4PG",                           publicId: "l5sQVPG", postcode: "DL1 4PG",  country: "United Kingdom", svgX: 207, svgY: 215 },
  { id: "34", code: "DLS2",                       address: "DLS2 - LOGIC LEEDS DISTRIBUTION PARK, LS9 0PS",                       publicId: "uKA5HDF", postcode: "LS9 0PS",  country: "United Kingdom", svgX: 200, svgY: 272 },
  { id: "35", code: "CUK8",                       address: "CUK8 - ASTON LANE NORTH, CHESHIRE, WA7 3BN",                          publicId: "8gXHWhA", postcode: "WA7 3BN",  country: "United Kingdom", svgX: 175, svgY: 275 },
  { id: "36", code: "DNE2",                       address: "DNE2 - FOLLINGSBY LANE, NORTH EAST N, NE10 8YA",                      publicId: "oySrigd", postcode: "NE10 8YA", country: "United Kingdom", svgX: 212, svgY: 205 },
  { id: "37", code: "DWN2",                       address: "DWN2 - TOWERS BUSINESS PARK, RUGELEY, WS15 1LX",                      publicId: "hZqMd96", postcode: "WS15 1LX", country: "United Kingdom", svgX: 183, svgY: 350 },
  { id: "38", code: "DCR2",                       address: "DCR2 - PETERWOOD WAY, CROYDON, CR0 4UQ",                              publicId: "sxio2nr", postcode: "CR0 4UQ",  country: "United Kingdom", svgX: 244, svgY: 458 },
  { id: "39", code: "DSO2",                       address: "DSO2 - UNIT 8, HAMPSHIRE S, SO40 9LR",                                publicId: "iz2cf7o", postcode: "SO40 9LR", country: "United Kingdom", svgX: 207, svgY: 466 },
  { id: "40", code: "DSS2",                       address: "DSS2 - CHRISTOPHER MARTIN ROAD, BASILDON, SS14 9AA",                  publicId: "z3TWaLV", postcode: "SS14 9AA", country: "United Kingdom", svgX: 258, svgY: 450 },
  { id: "41", code: "LPL2",                       address: "LPL2 - MARL ROAD, MERSEYSIDE, L33 7AP",                               publicId: "9LKpeoj", postcode: "L33 7AP",  country: "United Kingdom", svgX: 165, svgY: 268 },
  { id: "42", code: "BHX5",                       address: "BHX5 - UNIT 3, RUGBY, CV23 0XF",                                      publicId: "2Bfjkyz", postcode: "CV23 0XF", country: "United Kingdom", svgX: 207, svgY: 362 },
  { id: "43", code: "DBI7",                       address: "DBI7 - 236 HAWKE WAY, LEICESTERSHIRE L, LE17 4XR",                    publicId: "aCvSPV4", postcode: "LE17 4XR", country: "United Kingdom", svgX: 215, svgY: 355 },
  { id: "44", code: "SBS2",                       address: "SBS2 - POPLAR WAY EAST, BRISTOL, BS11 0YH",                           publicId: "rvomcZa", postcode: "BS11 0YH", country: "United Kingdom", svgX: 166, svgY: 432 },
  { id: "45", code: "XLH4",                       address: "XLH4 - UNIT 1 HURRICANE WAY, SHERBURN, LS25 6PT",                     publicId: "cmlxuMt", postcode: "LS25 6PT", country: "United Kingdom", svgX: 202, svgY: 278 },
  { id: "46", code: "DIP1",                       address: "DIP1 - PLOT 16 SPROUGHTON ENTERPRISE PARK, IPSWICH, IP1 5BL",         publicId: "l5sQVPF", postcode: "IP1 5BL",  country: "United Kingdom", svgX: 263, svgY: 400 },
  { id: "47", code: "DSA2",                       address: "DSA2 - BRICKYARD LANE, NORTH FERRIBY, HU14 3FT",                      publicId: "oPcNjTv", postcode: "HU14 3FT", country: "United Kingdom", svgX: 220, svgY: 283 },
  { id: "48", code: "DSA6",                       address: "DSA6 - NEWMARKET LANE, WEST YORKSHIRE L, LS26 9DP",                   publicId: "fUkLRxB", postcode: "LS26 9DP", country: "United Kingdom", svgX: 200, svgY: 280 },
  { id: "49", code: "XLB4",                       address: "XLB4 - GROVEHALL LN, YORKSHIRE, WF11 0AB",                            publicId: "hZqMd9e", postcode: "WF11 0AB", country: "United Kingdom", svgX: 204, svgY: 285 },
  { id: "50", code: "SNG1",                       address: "SNG1 - INTERLINK WAY EAST, COALVILLE, LE67 1LD",                      publicId: "puE2F4l", postcode: "LE67 1LD", country: "United Kingdom", svgX: 210, svgY: 340 },
]

// ─── UK SVG outline (simplified) ─────────────────────────────────────────────
const UK_PATH =
  "M185,30 L195,28 L210,35 L215,40 L205,55 L220,65 L225,80 L215,100 " +
  "L220,120 L218,140 L210,155 L215,170 L205,185 L210,200 L215,215 " +
  "L220,230 L215,245 L205,255 L210,265 L205,275 L200,285 " +
  "L215,290 L225,295 L230,305 L220,315 L215,320 " +
  "L220,335 L215,345 L205,350 L210,360 L205,370 " +
  "L215,375 L260,380 L270,390 L265,400 L270,410 " +
  "L260,420 L270,435 L265,445 L255,455 L250,465 " +
  "L255,470 L245,475 L240,485 L230,490 L215,492 " +
  "L200,488 L185,480 L170,475 L160,468 L150,460 " +
  "L145,450 L155,440 L150,430 L160,420 L155,410 " +
  "L148,400 L145,390 L155,380 L150,370 L155,360 " +
  "L160,350 L155,340 L165,330 L170,320 L165,310 " +
  "L170,300 L158,295 L148,285 L155,270 L160,260 " +
  "L155,250 L145,240 L150,230 L155,215 L148,200 " +
  "L140,185 L148,170 L145,155 L150,140 L145,125 " +
  "L148,110 L140,95 L145,80 L155,65 L165,50 L175,38 Z"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {id} {copied ? "✓" : "⎘"}
    </button>
  )
}

// ─── Map view ────────────────────────────────────────────────────────────────

function UKMap({ places, selected, onSelect }: {
  places: Place[]
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  // Group places with identical coords (same postcode area) to avoid total overlap
  const byCode: Record<string, Place[]> = {}
  places.forEach(p => {
    const key = `${p.svgX},${p.svgY}`
    if (!byCode[key]) byCode[key] = []
    byCode[key].push(p)
  })

  return (
    <div className="relative flex gap-4 h-[620px]">
      {/* Map */}
      <div className="flex-1 rounded-xl border bg-card overflow-hidden relative">
        <svg viewBox="120 25 200 500" className="w-full h-full" style={{ background: "hsl(var(--muted))" }}>
          {/* Grid lines */}
          {[100,150,200,250,300,350,400,450].map(y => (
            <line key={y} x1="60" y1={y} x2="340" y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" />
          ))}
          {[150,200,250,300].map(x => (
            <line key={x} x1={x} y1="25" x2={x} y2="530" stroke="hsl(var(--border))" strokeWidth="0.5" />
          ))}
          {/* UK silhouette */}
          <path d={UK_PATH} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />

          {/* Pins */}
          {Object.entries(byCode).map(([key, group]) => {
            const { svgX: x, svgY: y } = group[0]
            const isSelected = group.some(p => p.id === selected)
            const count = group.length
            return (
              <g key={key}
                className="cursor-pointer"
                onClick={() => onSelect(isSelected ? null : group[0].id)}
              >
                <circle
                  cx={x} cy={y} r={count > 1 ? 8 : 5}
                  fill={isSelected ? "hsl(var(--primary))" : "#6366f1"}
                  stroke="white" strokeWidth="1.5"
                  opacity={0.9}
                />
                {count > 1 && (
                  <text x={x} y={y + 3.5} textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">
                    {count}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border bg-card/90 px-3 py-2 text-xs text-muted-foreground shadow-sm">
          <span className="inline-block h-3 w-3 rounded-full bg-indigo-500" />
          <span>{places.length} depot{places.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Sidebar list */}
      <div className="w-72 flex flex-col gap-1 overflow-y-auto pr-1">
        {places.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id === selected ? null : p.id)}
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${p.id === selected ? "border-primary bg-primary/5" : "bg-card hover:bg-muted"}`}
          >
            <MapPin className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${p.id === selected ? "text-primary" : "text-indigo-500"}`} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{p.code}</p>
              <p className="truncate text-muted-foreground">{p.postcode}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlacesPage() {
  const [search, setSearch]     = React.useState("")
  const [tab, setTab]           = React.useState<"list" | "map">("list")
  const [selected, setSelected] = React.useState<string | null>(null)
  const [checked, setChecked]   = React.useState<Set<string>>(new Set())
  const [allChecked, setAllChecked] = React.useState(false)

  const filtered = places.filter(p => {
    const q = search.toLowerCase()
    return !q ||
      p.code.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.postcode.toLowerCase().includes(q)
  })

  function toggleAll() {
    if (allChecked) { setChecked(new Set()); setAllChecked(false) }
    else { setChecked(new Set(filtered.map(p => p.id))); setAllChecked(true) }
  }

  function toggleOne(id: string) {
    setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6 md:p-8 lg:p-10">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Places</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage depots and delivery locations across the UK.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Places..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:max-w-xs"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-0.5 rounded-lg border bg-muted p-0.5">
          <button
            onClick={() => setTab("list")}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${tab === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="h-3.5 w-3.5" /> List
          </button>
          <button
            onClick={() => setTab("map")}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${tab === "map" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <MapIcon className="h-3.5 w-3.5" /> Map
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setSearch("")} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted" title="Refresh">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" /> New
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted">
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {places.length} places
      </p>

      {/* ── List view ── */}
      {tab === "list" && (
        <div className="overflow-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="rounded border-border" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Code</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Address</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Postal Code</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Country</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={checked.has(p.id)}
                      onChange={() => toggleOne(p.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                      <span className="font-medium whitespace-nowrap">{p.code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground max-w-xs lg:max-w-sm">
                    <span className="line-clamp-1">{p.address}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <CopyId id={p.publicId} />
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap font-mono text-xs">{p.postcode}</td>
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap uppercase text-xs">
                    {p.country !== "-" ? p.country : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <button className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/20">
                <td colSpan={7} className="px-4 py-3 text-xs text-muted-foreground">
                  Showing {filtered.length} of {places.length} results
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ── Map view ── */}
      {tab === "map" && (
        <UKMap places={filtered} selected={selected} onSelect={setSelected} />
      )}
    </div>
  )
}
