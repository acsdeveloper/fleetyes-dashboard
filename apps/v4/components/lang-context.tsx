"use client"
import * as React from "react"

export type Lang = "en" | "de"

// ─── SHAPE TYPE ───────────────────────────────────────────────────────────────

type PageEntry = { title: string; subtitle: string }

export type Translations = {
  nav: {
    trips: string; importHub: string; calendar: string; drivers: string
    fleetManagement: string; places: string; fuelTracking: string
    parkingMonitoring: string; tollExpenses: string; tollReceipts: string
    fuelReceipts: string; holidays: string; offShift: string
    maintenance: string; compliance: string; inventory: string
    allocationSettings: string
  }
  topbar: {
    profile: string; settings: string; logout: string
    lightMode: string; darkMode: string; systemMode: string; language: string
  }
  common: {
    save: string; cancel: string; upload: string; download: string
    search: string; new: string; edit: string; delete: string
    submit: string; back: string; loading: string
    addVehicle: string; export: string; filter: string; refresh: string
    active: string; inactive: string; pending: string; resolved: string
    allVehicles: string; today: string; thisMonth: string; selectAll: string
  }
  pages: {
    dashboard:          PageEntry
    trips:              PageEntry
    importHub:          PageEntry
    calendar:           PageEntry
    drivers:            PageEntry
    fleetManagement:    PageEntry
    places:             PageEntry
    fuelTracking:       PageEntry
    parkingMonitoring:  PageEntry
    tollExpenses:       PageEntry
    tollReceipts:       PageEntry
    fuelReceipts:       PageEntry
    holidays:           PageEntry
    offShift:           PageEntry
    maintenance:        PageEntry
    compliance:         PageEntry
    inventory:          PageEntry
    allocationSettings: PageEntry
    vehicles:           PageEntry
    fleets:             PageEntry
  }
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────

export const translations: Record<Lang, Translations> = {
  en: {
    nav: {
      trips:              "Trips",
      importHub:          "Import Hub",
      calendar:           "Calendar",
      drivers:            "Drivers",
      fleetManagement:    "Fleet Management",
      places:             "Places",
      fuelTracking:       "Fuel Tracking",
      parkingMonitoring:  "Parking Monitoring",
      tollExpenses:       "Toll Expenses",
      tollReceipts:       "Toll Receipts",
      fuelReceipts:       "Fuel Receipts",
      holidays:           "Holidays",
      offShift:           "Off-shift",
      maintenance:        "Maintenance",
      compliance:         "Compliance",
      inventory:          "Inventory",
      allocationSettings: "Allocation Settings",
    },
    topbar: {
      profile:    "My Profile",
      settings:   "Settings",
      logout:     "Sign Out",
      lightMode:  "Light",
      darkMode:   "Dark",
      systemMode: "System",
      language:   "Language",
    },
    common: {
      save:       "Save",
      cancel:     "Cancel",
      upload:     "Upload",
      download:   "Download",
      search:     "Search",
      new:        "New",
      edit:       "Edit",
      delete:     "Delete",
      submit:     "Submit",
      back:       "Back",
      loading:    "Loading…",
      addVehicle: "Add Vehicle",
      export:     "Export",
      filter:     "Filter",
      refresh:    "Refresh",
      active:     "Active",
      inactive:   "Inactive",
      pending:    "Pending",
      resolved:   "Resolved",
      allVehicles:"All Vehicles",
      today:      "Today",
      thisMonth:  "This Month",
      selectAll:  "Select All",
    },
    pages: {
      dashboard:          { title: "Dashboard",              subtitle: "Your operational summary for today." },
      trips:              { title: "Trips",                  subtitle: "Manage and monitor all transport orders." },
      importHub:          { title: "Import Hub",             subtitle: "Central control for all vendor data connections and manual imports." },
      calendar:           { title: "Calendar",               subtitle: "View and schedule trips on the calendar." },
      drivers:            { title: "Drivers",                subtitle: "Manage driver profiles, licences, and CPC compliance." },
      fleetManagement:    { title: "Fleet Management",       subtitle: "Live telematics, diagnostics and fleet administration — powered by MyGeotab API." },
      places:             { title: "Places",                 subtitle: "Manage depots, customer sites, and frequent stop locations." },
      fuelTracking:       { title: "Fuel Tracking",          subtitle: "Monitor consumption, MPG efficiency, and fuel spend per vehicle." },
      parkingMonitoring:  { title: "Parking Monitoring",     subtitle: "Track overnight lorry park usage, costs, and approved locations." },
      tollExpenses:       { title: "Toll Expenses",          subtitle: "Track road tolls, bridge, and tunnel charges across the fleet." },
      tollReceipts:       { title: "Toll Receipts",          subtitle: "VAT receipt capture for toll road charges across the fleet." },
      fuelReceipts:       { title: "Fuel Receipts",          subtitle: "VAT-recoverable fuel receipt management and approval workflow." },
      holidays:           { title: "Holidays & Leave",       subtitle: "Manage driver annual leave, sick days, and training absences." },
      offShift:           { title: "Off-Shift & Rest Periods", subtitle: "Monitor driver rest compliance against EU WTD rules (min 11h daily rest)." },
      maintenance:        { title: "Maintenance Hub",        subtitle: "Schedule and track vehicle servicing, repairs, and inspections." },
      compliance:         { title: "Compliance Hub",         subtitle: "Manage regulatory documents, licences, and audit readiness." },
      inventory:          { title: "Inventory Hub",          subtitle: "Track parts, consumables, and asset stock across all depots." },
      allocationSettings: { title: "Allocation Settings",   subtitle: "Configure driver pairing rules and automatic trip allocation." },
      vehicles:           { title: "Vehicles",               subtitle: "View and manage the full vehicle register." },
      fleets:             { title: "Fleets",                 subtitle: "Manage your fleet groups and driver assignments." },
    },
  },
  de: {
    nav: {
      trips:              "Fahrten",
      importHub:          "Import-Hub",
      calendar:           "Kalender",
      drivers:            "Fahrer",
      fleetManagement:    "Flottenmanagement",
      places:             "Standorte",
      fuelTracking:       "Kraftstoffverfolgung",
      parkingMonitoring:  "Parküberwachung",
      tollExpenses:       "Mautkosten",
      tollReceipts:       "Mautquittungen",
      fuelReceipts:       "Tankquittungen",
      holidays:           "Urlaub & Abwesenheit",
      offShift:           "Schichtfrei",
      maintenance:        "Wartung",
      compliance:         "Compliance",
      inventory:          "Inventar",
      allocationSettings: "Zuweisungseinstellungen",
    },
    topbar: {
      profile:    "Mein Profil",
      settings:   "Einstellungen",
      logout:     "Abmelden",
      lightMode:  "Hell",
      darkMode:   "Dunkel",
      systemMode: "System",
      language:   "Sprache",
    },
    common: {
      save:       "Speichern",
      cancel:     "Abbrechen",
      upload:     "Hochladen",
      download:   "Herunterladen",
      search:     "Suchen",
      new:        "Neu",
      edit:       "Bearbeiten",
      delete:     "Löschen",
      submit:     "Einreichen",
      back:       "Zurück",
      loading:    "Laden…",
      addVehicle: "Fahrzeug hinzufügen",
      export:     "Exportieren",
      filter:     "Filtern",
      refresh:    "Aktualisieren",
      active:     "Aktiv",
      inactive:   "Inaktiv",
      pending:    "Ausstehend",
      resolved:   "Erledigt",
      allVehicles:"Alle Fahrzeuge",
      today:      "Heute",
      thisMonth:  "Diesen Monat",
      selectAll:  "Alle auswählen",
    },
    pages: {
      dashboard:          { title: "Dashboard",                    subtitle: "Ihre betriebliche Zusammenfassung für heute." },
      trips:              { title: "Fahrten",                      subtitle: "Alle Transportaufträge verwalten und überwachen." },
      importHub:          { title: "Import-Hub",                   subtitle: "Zentrale Steuerung aller Lieferantendatenverbindungen und manuellen Importe." },
      calendar:           { title: "Kalender",                     subtitle: "Fahrten im Kalender anzeigen und planen." },
      drivers:            { title: "Fahrer",                       subtitle: "Fahrerprofile, Führerscheine und CPC-Compliance verwalten." },
      fleetManagement:    { title: "Flottenmanagement",            subtitle: "Live-Telematik, Diagnose und Flottenverwaltung – gestützt auf die MyGeotab API." },
      places:             { title: "Standorte",                    subtitle: "Depots, Kundenstellen und häufige Haltepunkte verwalten." },
      fuelTracking:       { title: "Kraftstoffverfolgung",         subtitle: "Verbrauch, Kilometerleistung und Kraftstoffkosten je Fahrzeug überwachen." },
      parkingMonitoring:  { title: "Parküberwachung",              subtitle: "Nutzung von LKW-Parkplätzen, Kosten und genehmigte Standorte verfolgen." },
      tollExpenses:       { title: "Mautkosten",                   subtitle: "Straßenmaut, Brücken- und Tunnelgebühren der gesamten Flotte erfassen." },
      tollReceipts:       { title: "Mautquittungen",               subtitle: "MwSt.-Belegerfassung für Mautgebühren der Flotte." },
      fuelReceipts:       { title: "Tankquittungen",               subtitle: "Verwaltung und Genehmigung von erstattungsfähigen MwSt.-Tankbelegen." },
      holidays:           { title: "Urlaub & Abwesenheit",         subtitle: "Jahresurlaub, Krankheits- und Schulungsabwesenheiten der Fahrer verwalten." },
      offShift:           { title: "Schichtfrei & Ruhezeiten",     subtitle: "Einhaltung der EU-Lenk- und Ruhezeiten überwachen (min. 11 Std. tägliche Ruhezeit)." },
      maintenance:        { title: "Wartungs-Hub",                  subtitle: "Fahrzeugwartung, Reparaturen und Inspektionen planen und verfolgen." },
      compliance:         { title: "Compliance-Hub",               subtitle: "Regulatorische Dokumente, Lizenzen und Prüfungsbereitschaft verwalten." },
      inventory:          { title: "Inventar-Hub",                 subtitle: "Teile, Verbrauchsmaterialien und Bestand über alle Depots hinweg verfolgen." },
      allocationSettings: { title: "Zuweisungseinstellungen",      subtitle: "Fahrerpaarungsregeln und automatische Fahrtenzuweisung konfigurieren." },
      vehicles:           { title: "Fahrzeuge",                    subtitle: "Das vollständige Fahrzeugregister anzeigen und verwalten." },
      fleets:             { title: "Fuhrparks",                    subtitle: "Flottengruppen und Fahrerzuweisungen verwalten." },
    },
  },
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────

type LangCtx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
}

const LangContext = React.createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("en")

  React.useEffect(() => {
    const stored = localStorage.getItem("fy-lang") as Lang | null
    if (stored === "en" || stored === "de") setLangState(stored)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem("fy-lang", l)
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return React.useContext(LangContext)
}
