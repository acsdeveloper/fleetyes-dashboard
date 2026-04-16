"use client"
import * as React from "react"

export type Lang = "en" | "de" | "fr" | "es" | "it" | "pl"

// BCP-47 locale tag for Intl / toLocaleDateString
export const LOCALE_TAG: Record<Lang, string> = {
  en: "en-GB",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  pl: "pl-PL",
}

// ─── SHAPE TYPE ───────────────────────────────────────────────────────────────

type PageEntry = { title: string; subtitle: string }

export type Translations = {
  nav: {
    dashboard: string
    trips: string; rota: string; importHub: string; calendar: string; maintenanceTrips: string
    drivers: string; fleetManagement: string; places: string
    fuelTracking: string; parkingMonitoring: string
    tollExpenses: string; tollReceipts: string; fuelReceipts: string
    fuel: string; toll: string
    holidays: string; offShift: string
    maintenance: string; compliance: string; inventory: string
    allocationSettings: string
    // Sidebar group headers
    groupTransport: string; groupExpenses: string; groupPeople: string; groupSettings: string
    // Issues nav item
    issues: string
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
    tryAgain: string; records: string; noData: string
    // Table headers
    date: string; vehicle: string; driver: string; status: string; action: string
    ref: string; route: string; type: string; amount: string; method: string
    litres: string; costPerLitre: string; totalCost: string; odometer: string
    mpg: string; depot: string; duration: string; location: string; cost: string
    fleet: string; name: string; phone: string; email: string; country: string; licence: string; notes: string; address: string
    // Buttons / actions
    view: string; reconcile: string; addNew: string; assign: string; approve: string
    reject: string; newCharge: string; details: string; close: string
    createRecord: string; saving: string; creating: string
    clearAll: string; apply: string; stats: string; noRecordsFound: string
    dropFile: string; supports: string; clickToChange: string
    importComplete: string; importFailed: string; rowsImported: string; rowsSkipped: string
    someRowsHadErrors: string; downloadErrorLog: string; tryAgainBtn: string
    // Status & filter tabs
    all: string; reconciled: string; scheduled: string; dispatched: string
    started: string; completed: string; cancelled: string
    // Dashboard
    tripsToday: string; driversAvailable: string; fleetSize: string; thisWeek: string
    available: string; onLeave: string; noTripsToday: string; nothingScheduled: string
    createTrip: string; driverStatus: string; allDrivers: string
    todaysTrips: string; weekAtGlance: string; vehicleDowntime: string; upcomingLeave: string
    viewCalendar: string; manage: string; viewAll: string; tripsMonSun: string
    active2: string; done: string; awaitingDispatch: string; ofTotal: string
    vehiclesRegistered: string; vehiclesOff: string; needsDriver: string
    // Greetings
    goodMorning: string; goodAfternoon: string; goodEvening: string
    // Search placeholders
    searchPlaceholder: string; searchVehicles: string; searchDrivers: string
    // Misc
    noDriverAssigned: string; driverAssigned: string; ongoing: string
    noUpcomingDowntime: string; noUpcomingLeave: string
    consumptionByVehicle: string
    at: string; for: string; of: string
  }
  pages: {
    dashboard:          PageEntry
    trips:              PageEntry
    rota:               PageEntry
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
    maintenanceTrips:   PageEntry
    compliance:         PageEntry
    inventory:          PageEntry
    allocationSettings: PageEntry
    vehicles:           PageEntry
    fleets:             PageEntry
    issues:             PageEntry
  }
  rota: {
    // Loader steps
    step1Label: string; step1Detail: string
    step2Label: string; step2Detail: string
    step3Label: string; step3Detail: string
    step4Label: string; step4Detail: string
    // Status legend
    workingDay: string; restDay: string; holiday: string; unavailable: string; off: string; notOnRota: string
    // Day abbreviations
    sun: string; mon: string; tue: string; wed: string; thu: string; fri: string; sat: string
    // Extended rota strings
    allocationPeriod: string; assignDriver: string; assignTruck: string; noRoute: string
    history: string; stats: string; relay: string; add: string; autoAllocate: string
    user: string; exportRelay: string; unassignedTrips: string; dragToAssign: string
    violations: string; warnings: string; warningsLabel: string; violationsLabel: string
    grid: string; analysis: string
    allCompliant: string; checkingCompliance: string
    noUnassignedTrips: string
    complianceReport: string; allClear: string; noComplianceDesc: string
    issuesTab: string; rulesRef: string
    allocationBlocked: string; complianceViolationBlocked: string; understood: string
    reassignTitle: string; currentlyAssigned: string; willBeReplacedWith: string
    existingTripUnassigned: string; driver: string; hrs: string
    complianceViolation: string; complianceWarning: string; complianceCompliant: string
    driversWithIssues: string
  }
  maintenance: {
    upcoming: string; historical: string
    searchPlaceholder: string
    records: string; ofRecords: string
    refresh: string; export: string
    colVehicle: string; colDateRange: string; colDays: string; colWhen: string
    loading: string; tryAgain: string
    noUpcoming: string; noUpcomingDesc: string
    noHistorical: string; noHistoricalDesc: string
    statusActive: string; statusUpcoming: string; statusCompleted: string
    today: string; inDays: string; daysAgo: string
    durationDays: string
  }
  maintenanceHub: {
    tabDashboard: string; tabPMI: string; tabDefects: string; tabSettings: string
    kpiVOR: string; kpiVORSub: string; kpiDueSoon: string; kpiDueSoonSub: string
    kpiCompliant: string; kpiCompliantSub: string; kpiPMIRate: string; kpiPMIRateSub: string
    earnedRecognition: string; dvsaScheme: string; target: string
    fleetStatusBoard: string; compliant: string; dueSoon: string; overdueVOR: string
    pmiSchedule: string; noPMIsDue: string
    driver: string; nextPMI: string; daysOverdue: string; dueToday: string; dueIn: string
    pmiSheet: string; allVehicles: string; clickToInspect: string
    inspectionProgress: string; itemsCompleted: string; results: string; location: string; interval: string
    technicianDecl: string; sign: string; signed: string; signFirst: string
    submitPMI: string; pmiSubmitted: string; backToSchedule: string
    brakeTest: string; axle1: string; axle2: string; meetsDVSA: string; belowDVSA: string
    openDefects: string; resolved: string; totalDefects: string
    requiresAction: string; completed: string; allTime: string
    rectificationRecord: string; partsUsed: string; labour: string; signedOffBy: string
    logRectification: string; markRoadworthy: string; signedOffRoadworthy: string
    vehicleProfiles: string; addVehicle: string; userRolesPerms: string; inviteUser: string
    notificationEngine: string; customChecklist: string; addItem: string; remove: string
    dataExport: string; vorAlert: string; schedule: string
    pass: string; advisory: string; fail: string
  }
  trips: {
    tripId: string; tripStatus: string; tractor: string; facilitySequence: string
    estEndTime: string; dragToAssign: string; unassignedTrips: string
    saveChanges: string; createIssue: string; newIssue: string
  }
  calendar: {
    created: string; driverUnavailable: string; assigned: string; unassigned: string
    estEnd: string; destination: string; month: string; week: string; day: string
    allDrivers: string; allVehicles: string; vehicleOff: string; fullyAssigned: string
    noVehicle: string; noDriver: string; orders: string; driverOff: string
  }
  issues: {
    newIssue: string; critical: string; high: string; medium: string; low: string
    inProgress: string; open: string; report: string; priority: string; assignee: string
    backlogged: string; requiresUpdate: string; inReview: string
    saveChanges: string; createIssue: string; unassigned: string
    type: string; category: string; assignedTo: string; reportedBy: string
    incidentLocation: string; pinLocation: string; hideMap: string; noLocationPinned: string
    scheduledMaintenance: string; pending: string; closed: string
    pickTypFirst: string; selectCategory: string
  }
  fuelTracking: {
    expense: string; addExpense: string; inclVat: string; volume: string; payment: string; card: string
    noExpenses: string; stats: string; totalRecords: string; pendingApproval: string; approved: string
    filters: string; searchPlaceholder: string
  }
  fuelReceipts: {
    captured: string; supplier: string; product: string; duplicate: string; receipt: string; uploadZip: string
    searchPlaceholder: string
    // AddReceiptsModal
    addModalTitle: string; addModalSubtitle: string
    dropTitle: string; dropActive: string; dropHint: string
    filesSelected: string
    stepZipping: string; stepUploading: string; stepImporting: string; stepProcessing: string
    progressZipping: string; progressUploading: string; progressImporting: string; progressProcessing: string
    processingNote: string
    successTitle: string; successCount: string
    errorTitle: string
    btnAdd: string; btnUpload: string; btnDone: string; btnTryAgain: string; btnClose: string
    // ReceiptFilterDrawer
    filterTitle: string; anyDriver: string; anyStatus: string; capturedFrom: string; capturedTo: string
    // Receipt detail
    detailTitle: string; ocrData: string; rawText: string
    colOcrStatus: string; colCapturedAt: string
  }
  parking: {
    pageOf: string; searchPlaceholder: string
  }
  tollReceipts: {
    upload: string; entryPoint: string; exitPoint: string; vehicleClass: string
    searchPlaceholder: string
    // AddReceiptsModal
    addModalTitle: string; addModalSubtitle: string
    dropTitle: string; dropActive: string; dropHint: string
    filesSelected: string
    stepZipping: string; stepUploading: string; stepImporting: string; stepProcessing: string
    progressZipping: string; progressUploading: string; progressImporting: string; progressProcessing: string
    processingNote: string
    successTitle: string; successCount: string
    errorTitle: string
    btnAdd: string; btnUpload: string; btnDone: string; btnTryAgain: string; btnClose: string
    // ReceiptFilterDrawer
    filterTitle: string; anyDriver: string; anyStatus: string; capturedFrom: string; capturedTo: string
    // SendToAmazonModal
    sendTitle: string; sendSubtitle: string; sendFromDate: string; sendToDate: string
    sendPreviewBtn: string; sendDownloading: string; sendBtn: string; sendSending: string
    sendWarning: string; sendSuccess: string; sendSuccessMsg: string
    // Expense tab columns
    colChargeEx: string; colVat: string; colChargeInc: string; colProcessingStatus: string
  }
  holidays: {
    reason: string; start: string; end: string; days: string
    newEntry: string; searchPlaceholder: string
    leaveTypes: { "Annual Leave": string; sick: string; Vacation: string; Other: string }
  }
  offShift: {
    cycle: string; firstLeaveDay: string; planUntil: string
    searchPlaceholder: string
  }
  vehicles: {
    year: string; lastPmi: string; tachographCal: string
    searchPlaceholder: string; addVehicle: string
  }
  places: {
    list: string; map: string; city: string; postalCode: string; depotMap: string
    plotted: string; pageSize: string; searchPlaceholder: string; addPlace: string
    code: string; address: string; stateCounty: string; country: string
  }
  login: {
    tagline: string
    signIn: string; signInDesc: string
    emailLabel: string; emailPlaceholder: string
    passwordLabel: string
    rememberMe: string; forgotPassword: string
    submit: string; submitting: string
    resetTitle: string; resetDesc: string
    sendLink: string; sending: string
    backToSignIn: string
    checkInbox: string; checkInboxDesc: string
    errorDefault: string
  }
  inventoryHub: {
    tabDashboard: string; tabParts: string; tabJobCards: string; tabPurchasing: string; tabTyres: string
    totalStockValue: string; stockoutVOR: string; lowStockParts: string; deadStock: string
    reorderAlerts: string; stockValueByCategory: string; recentMovements: string
    safetyCritical: string; addPart: string; scan: string; adjust: string
    partsIssued: string; scanPart: string; issueKit: string; newJobCard: string
    openPOs: string; autoReorder: string; coreReturns: string; raisePO: string; raiseAllPOs: string
    newPO: string; purchaseOrders: string; autoReorderSuggestions: string
    tyresToReplace: string; advisoryTyres: string; tyresTracked: string
    tyreManagement: string; fitTyre: string; bulkFluidDispensing: string
    dispense: string; confirm: string; issuePMIKit: string; stockout: string; reorder: string
  }
  complianceHub: {
    // Tabs
    tabWalkaround: string; tabDrivers: string; tabDocuments: string; tabPlanner: string
    tabTraining: string; tabFleet: string; tabAudit: string; tabSettings: string
    // Walkaround check
    newWalkaround: string; walkaroundSubmitted: string; noVehiclesFound: string; noDriversFound: string
    timerLocation: string; todayPhotograph: string; takePhoto: string
    advisory: string; pass: string; fail: string; yes: string
    driverDeclaration: string; driverDeclarationText: string; signedBy: string; submitWalkaround: string
    checkSummary: string; duration: string; results: string; antiCheatPhoto: string; dangerous: string
    checksCompletedToday: string; defectsReportedToday: string; avgCheckTime: string; dvsaMinimum: string
    recentWalkarounds: string; noWalkarounds: string; nilDefect: string; unableToLoad: string
    // DVLA / CPC
    dvlaLicence: string; refresh: string; davisRiskScore: string; entitlements: string; noEndorsements: string
    driverCPC: string; dqc: string; progress: string; modules: string; outstanding: string
    logCourse: string; previousCycle: string; addRecord: string; noTraining: string; noExpiry: string
    visaExpiry: string; uploadPassport: string
    // Audit trail
    auditTrail: string; exportCsv: string; allCategories: string; allActions: string; allUsers: string
    before: string; after: string; noEvents: string
    // Document expiry grid
    expired: string; expiringWithin90: string; noDateSet: string; bothPartiesSigned: string
    multipleDocuments: string; clickToEdit: string; noExpiries: string; showAll: string
    documentType: string; driverVehicle: string; expiry: string
    // Planner / PMI
    pmiBoard: string; bookIn: string; complianceManager: string; noManagerCandidates: string
    olicenceMarginsChecker: string; tachoInfringements: string; tachoIntegration: string
    accidentLog: string; reportAccident: string; downloadFnol: string
    forsReport: string; generateReport: string; reportAccidentFnol: string; attachPhotos: string
    // Notification settings
    notificationChannels: string; emailChannel: string; mobileNotification: string; dailyDigest: string
    operationalEvents: string; deliverAt: string; expiryAlerts: string
    alertLabel: string; early: string; remind: string; off: string; instant: string
    allSettingsSaved: string; unsavedChanges: string; reset: string
    // Filter chips
    highRisk: string; cpcCritical: string; checksDue: string; rtwExpiring: string; disqualified: string
    motExpiring: string; tachoCal: string; lolerDue: string; fullyClear: string
    overdueVor: string; dueWithin7: string; pmiOnTime: string
    expiredOverdue: string; expiringSoon: string; awaitingSignatures: string
    // Business docs tab
    documentDetails: string; editDocument: string; file: string; noFileAttached: string
    counterSigned: string; signed: string; uploaded: string
    documentTitle: string; category: string; newCategory: string; description: string; notes: string
    // Walkaround templates tab
    walkaroundTemplates: string; walkaroundTemplatesDesc: string
    helpText: string; questionType: string; dropdownOptions: string; unitLabel: string; requiredToSubmit: string
    defectSeverity: string; conditionalDisplay: string; noConditional: string
    templateName: string; vehicleAssignment: string; vehicleAssignmentDesc: string; unassigned: string
    sections: string; checks: string; vehicles: string; modified: string; actions: string; untitled: string
    assign: string
    // Training tab
    totalCourses: string; completed: string; awaitingApproval: string; totalEnrolments: string
    noEnrolments: string; back: string; publish: string; archive: string; republish: string
    courseInformation: string; completionSummary: string; editCourseDetails: string
    titleLabel: string; passMarkPct: string; deadline: string; assignTo: string
    allDrivers: string; specificDrivers: string; autoApprove: string; saveDetails: string
    learningMaterials: string; addMaterial: string; addFirstMaterial: string; noMaterials: string
    videoUrl: string; pages: string; fileUploadNote: string
    quizQuestions: string; addQuestion: string; addFirstQuestion: string; noQuestions: string
    quizQuestionType: string; scorePts: string; questionText: string; correctAnswer: string
    trueFalse: string; freeText: string; multiChoiceSingle: string; multiChoiceMulti: string
    sampleAnswer: string; addOption: string
    driverEnrolments: string; noDriversEnrolled: string
    driverCol: string; statusCol: string; attempts: string; bestScore: string
    driverSigned: string; operatorSigned: string; actionCol: string
    assessmentApproved: string; certFiled: string; assessmentRejected: string
    answerReview: string; scoreLabel: string; attemptsLabel: string; driverSignature: string
    cancel: string; searchDocs: string; searchCourses: string
    antiCheatPhotoRequired: string; antiCheatInstruction: string
    backToChecks: string; backToEnrolments: string
    courseInfo: string; editCourse: string
    defectsReported: string; defectsWorkshopNotified: string
    nilDefectCleared: string; noDefects: string; ok: string
    olicenceMargin: string; passed: string
    photoRequired: string; photoRequiredDefect: string
    requiredQuestion: string; forsReadiness: string
    loadingCheckDetail: string; loadingDrivers: string; loadingVehicles: string
    signedOn: string; suspiciousSpeed: string; vehiclesPending: string
    workshopNotified: string
    date: string; na: string; notConnected: string; integrations: string
    sent: string; saving: string; saved: string; saveChanges: string
    action: string; apiErrorLocal: string; at: string
    certificate: string; details: string; edit: string
    rePublish: string; review: string; sign: string
    status: string; template: string
    signedLabel: string; reviewNote: string
  }
  drivers: {
    // Add/edit drawer
    addTitle: string; editTitle: string
    shiftPreference: string; shiftNone: string; shiftAllDays: string; shiftCustom: string
    shiftStart: string; shiftEnd: string; maxConsecDays: string; maxTripsWeek: string
    licenceNo: string; noneSelected: string
    // Status labels (display layer)
    statusActive: string; statusInactive: string; statusPending: string; statusArchived: string
    // Inline messages
    noDriversFound: string; nameRequired: string; saveFailed: string; statusUpdateFailed: string
    retryLabel: string
  }
  fleetManagement: {
    exceptionEvents: string; engineDiagnostics: string; tripHistory: string
    allFleets: string; vehicles: string; drivers: string; onShift: string
    monthlyDistance: string; fuelThisMonth: string; newFleet: string
    vehicleLabel: string; fleetLabel: string; yearLabel: string
    mph: string; rpm: string; driverSafetyScore: string
    critical: string; warnings: string; info: string
    exceptionByType: string; noTripsToday: string; liveDiagnostic: string
    avgSpd: string; endLabel: string
  }
  importHub: {
    autoImportEnabled: string; extensionNotDetected: string; extensionActive: string
    yourColumn: string; fleeyesField: string
    tripsToday: string; lastSync: string; primary: string
    universalActivityLog: string; viewLabel: string
    tripsImportedToday: string; acrossAllProviders: string
    activeConnections: string; syncFailures: string; providersConfigured: string
    vendorGallery: string
  }
  orgSettings: {
    failedToLoad: string; orgSettings: string; recordInfo: string
    drivingHours: string; workingHours: string; myGeotab: string
  }
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────

export const translations: Record<Lang, Translations> = {

  // ── English ─────────────────────────────────────────────────────────────────
  en: {
    nav: {
      dashboard:          "Dashboard",
      trips:              "Trips",
      rota:               "Weekly Rota",
      importHub:          "Import Hub",
      calendar:           "Calendar",
      maintenanceTrips:   "Maintenance Trips",
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
      groupTransport:     "Transport",
      groupExpenses:      "Expenses",
      groupPeople:        "People",
      groupSettings:      "Settings",
      issues:             "Issues",
      fuel:               "Fuel",
      toll:               "Toll",
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
      save:"Save",cancel:"Cancel",upload:"Upload",download:"Download",search:"Search",new:"New",edit:"Edit",delete:"Delete",submit:"Submit",back:"Back",loading:"Loading…",addVehicle:"Add Vehicle",export:"Export",filter:"Filter",refresh:"Refresh",active:"Active",inactive:"Inactive",pending:"Pending",resolved:"Resolved",allVehicles:"All Vehicles",today:"Today",thisMonth:"This Month",selectAll:"Select All",tryAgain:"Try again",records:"records",noData:"No data",
      date:"Date",vehicle:"Vehicle",driver:"Driver",status:"Status",action:"Action",ref:"Ref",route:"Route",type:"Type",amount:"Amount",method:"Method",litres:"Litres",costPerLitre:"Cost/L",totalCost:"Total Cost",odometer:"Odometer (mi)",mpg:"MPG",depot:"Depot",duration:"Duration",location:"Location",cost:"Cost",fleet:"Fleet",name:"Name",phone:"Phone",email:"Email",country:"Country",licence:"Licence",notes:"Notes",
      view:"View",reconcile:"Reconcile",addNew:"Add New",assign:"Assign",approve:"Approve",reject:"Reject",newCharge:"New Charge",details:"Details",close:"Close",
      createRecord:"Create Record",saving:"Saving…",creating:"Creating…",
      clearAll:"Clear all",apply:"Apply",stats:"Stats",noRecordsFound:"No records found",
      dropFile:"Drop a file or click to browse",supports:"Supports .xlsx, .xls, .csv",clickToChange:"click to change",
      importComplete:"Import complete",importFailed:"Import failed",rowsImported:"imported",rowsSkipped:"skipped",
      someRowsHadErrors:"Some rows had errors",downloadErrorLog:"Download error log",tryAgainBtn:"Try again",
      all:"All",reconciled:"Reconciled",scheduled:"Scheduled",dispatched:"Dispatched",started:"Started",completed:"Completed",cancelled:"Cancelled",
      tripsToday:"Trips Today",driversAvailable:"Drivers Available",fleetSize:"Fleet Size",thisWeek:"This Week",available:"available",onLeave:"on leave",noTripsToday:"No trips today",nothingScheduled:"Nothing scheduled for today",createTrip:"Create a trip →",driverStatus:"Driver Status",allDrivers:"All drivers",todaysTrips:"Today's Trips",weekAtGlance:"Week at a Glance",vehicleDowntime:"Vehicle Downtime",upcomingLeave:"Upcoming Leave",viewCalendar:"View calendar",manage:"Manage",viewAll:"View all",tripsMonSun:"trips Mon–Sun",active2:"active",done:"done",awaitingDispatch:"Awaiting dispatch",ofTotal:"of {n} total",vehiclesRegistered:"vehicles registered",vehiclesOff:"{n} vehicle(s) off today",needsDriver:"{n} trip(s) need a driver today",
      goodMorning:"Good morning",goodAfternoon:"Good afternoon",goodEvening:"Good evening",
      searchPlaceholder:"Search…",searchVehicles:"Search by reg, driver, depot…",searchDrivers:"Search drivers…",
      noDriverAssigned:"No driver assigned",driverAssigned:"Driver assigned",ongoing:"Ongoing",noUpcomingDowntime:"No upcoming vehicle downtime",noUpcomingLeave:"No upcoming leave in the next 7 days",consumptionByVehicle:"Consumption by Vehicle (30 days)",address:"Address",
      at:"at",for:"for",of:"of",
    },
    pages: {
      dashboard:          { title: "Dashboard",               subtitle: "Your operational summary for today." },
      trips:              { title: "Trips",                   subtitle: "Manage and monitor all transport orders." },
      rota:               { title: "Weekly Driver Rota",      subtitle: "Plan and manage driver assignments for the week." },
      importHub:          { title: "Import Hub",              subtitle: "Central control for all vendor data connections and manual imports." },
      calendar:           { title: "Calendar",                subtitle: "View and schedule trips on the calendar." },
      drivers:            { title: "Drivers",                 subtitle: "Manage driver profiles, licences, and CPC compliance." },
      fleetManagement:    { title: "Fleet Management",        subtitle: "Live telematics, diagnostics and fleet administration — powered by MyGeotab API." },
      places:             { title: "Places",                  subtitle: "Manage depots, customer sites, and frequent stop locations." },
      fuelTracking:       { title: "Fuel Tracking",           subtitle: "Monitor consumption, MPG efficiency, and fuel spend per vehicle." },
      parkingMonitoring:  { title: "Parking Monitoring",      subtitle: "Track overnight lorry park usage, costs, and approved locations." },
      tollExpenses:       { title: "Toll Expenses",           subtitle: "Track road tolls, bridge, and tunnel charges across the fleet." },
      tollReceipts:       { title: "Toll Receipts",           subtitle: "VAT receipt capture for toll road charges across the fleet." },
      fuelReceipts:       { title: "Fuel Receipts",           subtitle: "VAT-recoverable fuel receipt management and approval workflow." },
      holidays:           { title: "Holidays & Leave",        subtitle: "Manage driver annual leave, sick days, and training absences." },
      offShift:           { title: "Off-Shift & Rest Periods",subtitle: "Monitor driver rest compliance against EU WTD rules (min 11h daily rest)." },
      maintenance:        { title: "Maintenance Hub",         subtitle: "Schedule and track vehicle servicing, repairs, and inspections." },
      maintenanceTrips:   { title: "Maintenance Trips",       subtitle: "Vehicle downtime and off-road events from the calendar." },
      compliance:         { title: "Compliance Hub",          subtitle: "Manage regulatory documents, licences, and audit readiness." },
      inventory:          { title: "Inventory Hub",           subtitle: "Track parts, consumables, and asset stock across all depots." },
      allocationSettings: { title: "Allocation Settings",     subtitle: "Configure driver pairing rules and automatic trip allocation." },
      vehicles:           { title: "Vehicles",                subtitle: "View and manage the full vehicle register." },
      fleets:             { title: "Fleets",                  subtitle: "Manage your fleet groups and driver assignments." },
      issues:             { title: "Issues",                  subtitle: "Report and track vehicle, driver, and operational issues." },
    },
    rota: {
      step1Label: "Fetching drivers",          step1Detail: "Loading driver profiles and shift patterns",
      step2Label: "Loading holiday schedule",  step2Detail: "Checking approved leave and time-off requests",
      step3Label: "Checking trip assignments", step3Detail: "Finding unassigned trips for this week",
      step4Label: "Building the schedule",     step4Detail: "Matching drivers to their trips, almost there…",
      workingDay: "Working Day", restDay: "Rest Day", holiday: "Holiday",
      unavailable: "Unavailable", off: "Off", notOnRota: "Not on Rota",
      sun: "Sun", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat",
      allocationPeriod: "Allocation Period", assignDriver: "Assign Driver", assignTruck: "Assign Truck",
      noRoute: "No route", history: "History", stats: "Stats", relay: "Relay", add: "Add",
      autoAllocate: "Auto-Allocate", user: "User", exportRelay: "Export Relay",
      unassignedTrips: "UNASSIGNED TRIPS", dragToAssign: "drag to assign",
      violations: "{n} violations · {w} warning", warnings: "{w} warning", warningsLabel: "Warnings", violationsLabel: "Violations",
      grid: "Grid", analysis: "Analysis",
      allCompliant: "All compliant", checkingCompliance: "Checking compliance…",
      noUnassignedTrips: "No unassigned trips",
      complianceReport: "Compliance Report", allClear: "All Clear",
      noComplianceDesc: "No compliance violations or warnings detected for this week. All drivers are within their permitted hours.",
      issuesTab: "Issues", rulesRef: "Rules Reference",
      allocationBlocked: "Allocation Blocked", complianceViolationBlocked: "Compliance violation prevents this assignment",
      understood: "Understood",
      reassignTitle: "Reassign", currentlyAssigned: "Currently assigned", willBeReplacedWith: "Will be replaced with",
      existingTripUnassigned: "The existing trip will be unassigned and returned to the unassigned pool.",
      driver: "Driver", hrs: "Hrs",
      complianceViolation: "Compliance violation", complianceWarning: "Compliance warning",
      complianceCompliant: "Compliant", driversWithIssues: "{n} driver with issues",
    },
    maintenance: {
      upcoming: "Upcoming", historical: "Historical",
      searchPlaceholder: "Search vehicle, reason…",
      records: "records", ofRecords: "of",
      refresh: "Refresh", export: "Export",
      colVehicle: "Vehicle", colDateRange: "Date Range", colDays: "Days", colWhen: "When",
      loading: "Loading maintenance events…", tryAgain: "Try again",
      noUpcoming: "No upcoming maintenance",    noUpcomingDesc: "No vehicle downtime is currently scheduled.",
      noHistorical: "No historical records",    noHistoricalDesc: "No past maintenance events found.",
      statusActive: "Active", statusUpcoming: "Upcoming", statusCompleted: "Completed",
      today: "Today", inDays: "In {n}d", daysAgo: "{n}d ago", durationDays: "{n}d",
    },
    maintenanceHub: {
      tabDashboard: "Dashboard", tabPMI: "PMI Sheet", tabDefects: "Defects", tabSettings: "Settings",
      kpiVOR: "VOR (Off Road)", kpiVORSub: "vehicles grounded",
      kpiDueSoon: "Due Within 7 Days", kpiDueSoonSub: "needs booking",
      kpiCompliant: "Fully Compliant", kpiCompliantSub: "vehicles in green",
      kpiPMIRate: "PMI On-Time Rate", kpiPMIRateSub: "DVSA target: 100%",
      earnedRecognition: "Earned Recognition KPIs", dvsaScheme: "DVSA Scheme", target: "Target: {n}%",
      fleetStatusBoard: "Fleet Status Board", compliant: "Compliant", dueSoon: "Due Soon", overdueVOR: "Overdue/VOR",
      pmiSchedule: "8-Week PMI Schedule", noPMIsDue: "No PMIs due",
      driver: "Driver", nextPMI: "Next PMI", daysOverdue: "{n}d overdue", dueToday: "Due today", dueIn: "Due in {n}d",
      pmiSheet: "PMI Schedule — All Vehicles", allVehicles: "All Vehicles", clickToInspect: "Click a row to open inspection sheet",
      inspectionProgress: "Inspection Progress", itemsCompleted: "Items Completed", results: "Results", location: "Location", interval: "Interval",
      technicianDecl: "Technician Declaration", sign: "Sign", signed: "Signed", signFirst: "Sign the declaration above to enable submission.",
      submitPMI: "Submit PMI Report", pmiSubmitted: "PMI Submitted", backToSchedule: "← Back to Schedule",
      brakeTest: "Brake Test Results (DVSA Required)", axle1: "Axle 1 Efficiency (%)", axle2: "Axle 2 Efficiency (%)",
      meetsDVSA: "✓ Meets DVSA minimum (50%)", belowDVSA: "✗ Below DVSA minimum – FAIL",
      openDefects: "Open Defects", resolved: "Resolved", totalDefects: "Total Defects",
      requiresAction: "requires action", completed: "completed", allTime: "all time",
      rectificationRecord: "Rectification Record", partsUsed: "Parts Used:", labour: "Labour:", signedOffBy: "Signed off by:",
      logRectification: "Log Rectification", markRoadworthy: "Mark Roadworthy & Sign Off", signedOffRoadworthy: "✓ Signed off as Roadworthy",
      vehicleProfiles: "Vehicle Profiles", addVehicle: "Add Vehicle", userRolesPerms: "User Roles & Permissions", inviteUser: "Invite User",
      notificationEngine: "Notification Engine", customChecklist: "Custom Checklist Items", addItem: "Add Item", remove: "Remove",
      dataExport: "Data Export & Integrations", vorAlert: "{n} Vehicle{s} Off Road", schedule: "← Schedule",
      pass: "P", advisory: "A", fail: "F",
    },
    trips: {
      tripId: "Trip ID", tripStatus: "Trip Status", tractor: "Tractor",
      facilitySequence: "Facility Sequence", estEndTime: "Est. End Time",
      dragToAssign: "Drag to assign", unassignedTrips: "UNASSIGNED TRIPS",
      saveChanges: "Save Changes", createIssue: "Create Issue", newIssue: "New Issue",
    },
    calendar: {
      created: "Created", driverUnavailable: "Driver unavailable", assigned: "Assigned",
      unassigned: "Unassigned", estEnd: "Est. End", destination: "Destination",
      month: "Month", week: "Week", day: "Day", allDrivers: "All drivers",
      allVehicles: "All vehicles", vehicleOff: "Veh. off", fullyAssigned: "Fully assigned",
      noVehicle: "No vehicle", noDriver: "No driver", orders: "Orders", driverOff: "Driver off",
    },
    issues: {
      newIssue: "New Issue", critical: "Critical", high: "High", medium: "Medium", low: "Low",
      inProgress: "In Progress", open: "Open", report: "Report", priority: "Priority",
      assignee: "Assignee", backlogged: "Backlogged", requiresUpdate: "Requires Update",
      inReview: "In Review", saveChanges: "Save Changes", createIssue: "Create Issue",
      unassigned: "Unassigned",
      type: "Type", category: "Category", assignedTo: "Assigned To", reportedBy: "Reported By",
      incidentLocation: "Incident Location", pinLocation: "Pin location", hideMap: "Hide map",
      noLocationPinned: "No location pinned \u2014 click \u201cPin location\u201d to drop a marker on the map",
      scheduledMaintenance: "Scheduled Maintenance", pending: "Pending", closed: "Closed",
      pickTypFirst: "Pick type first", selectCategory: "Select\u2026",
    },
    fuelTracking: {
      expense: "Expense", addExpense: "Add Expense", inclVat: "Incl. VAT",
      volume: "Volume", payment: "Payment", card: "Card",
      noExpenses: "No fuel expenses found", stats: "Stats",
      totalRecords: "Total Records", pendingApproval: "Pending Approval", approved: "Approved",
      filters: "Filters", searchPlaceholder: "Search vehicle, driver…",
    },
    fuelReceipts: {
      captured:"Captured", supplier:"Supplier", product:"Product",
      duplicate:"Duplicate", receipt:"Receipt", uploadZip:"Upload ZIP",
      searchPlaceholder:"Search by vehicle, supplier…",
      addModalTitle:"Add Fuel Receipts",
      addModalSubtitle:"Drop images or PDFs — they’ll be zipped and sent for OCR automatically",
      dropTitle:"Drag & drop receipts here", dropActive:"Drop to add",
      dropHint:"or click to browse · JPEG, PNG, WebP, PDF",
      filesSelected:"{n} file{s} selected",
      stepZipping:"Zipping", stepUploading:"Uploading",
      stepImporting:"Importing", stepProcessing:"Processing OCR",
      progressZipping:"Zipping {n} file{s}…", progressUploading:"Uploading to server…",
      progressImporting:"Importing receipt records…", progressProcessing:"Running OCR processing…",
      processingNote:"This may take a moment for large batches",
      successTitle:"Upload & processing complete", successCount:"{n} receipt{s} imported",
      errorTitle:"Upload failed",
      btnAdd:"Add", btnUpload:"Upload {n} file{s}", btnDone:"Done — Refresh List",
      btnTryAgain:"Try Again", btnClose:"Close",
      filterTitle:"Filter Receipts", anyDriver:"Any driver", anyStatus:"Any status",
      capturedFrom:"Captured from", capturedTo:"Captured to",
      detailTitle:"Fuel Receipt Detail", ocrData:"OCR Extracted Data", rawText:"Raw text",
      colOcrStatus:"OCR Status", colCapturedAt:"Captured At",
    },
    parking: {
      pageOf: "Page", searchPlaceholder: "Search vehicle, location…",
    },
    tollReceipts: {
      upload:"Upload", entryPoint:"Entry Point", exitPoint:"Exit Point",
      vehicleClass:"Vehicle Class", searchPlaceholder:"Search vehicle, route…",
      addModalTitle:"Add Toll Receipts",
      addModalSubtitle:"Drop images or PDFs — they’ll be zipped and sent for OCR automatically",
      dropTitle:"Drag & drop receipts here", dropActive:"Drop to add",
      dropHint:"or click to browse · JPEG, PNG, WebP, PDF",
      filesSelected:"{n} file{s} selected",
      stepZipping:"Zipping", stepUploading:"Uploading",
      stepImporting:"Importing", stepProcessing:"Processing OCR",
      progressZipping:"Zipping {n} file{s}…", progressUploading:"Uploading to server…",
      progressImporting:"Importing receipt records…", progressProcessing:"Running OCR processing…",
      processingNote:"This may take a moment for large batches",
      successTitle:"Upload & processing complete", successCount:"{n} receipt{s} imported",
      errorTitle:"Upload failed",
      btnAdd:"Add", btnUpload:"Upload {n} file{s}", btnDone:"Done — Refresh List",
      btnTryAgain:"Try Again", btnClose:"Close",
      filterTitle:"Filter Receipts", anyDriver:"Any driver", anyStatus:"Any status",
      capturedFrom:"Captured from", capturedTo:"Captured to",
      sendTitle:"Send to Amazon", sendSubtitle:"Submit toll charges to Amazon Relay for the selected period",
      sendFromDate:"From Date", sendToDate:"To Date",
      sendPreviewBtn:"Preview data before sending", sendDownloading:"Downloading…",
      sendBtn:"Send to Amazon Relay", sendSending:"Sending…",
      sendWarning:"This will submit all processed toll charges in the selected date range to Amazon Relay.",
      sendSuccess:"Submitted successfully",
      sendSuccessMsg:"Toll charges have been sent to Amazon Relay.",
      colChargeEx:"Charge (ex. VAT)", colVat:"VAT",
      colChargeInc:"Charge (inc. VAT)", colProcessingStatus:"Processing Status",
    },
    holidays: {
      reason: "Reason", start: "Start", end: "End", days: "Days",
      newEntry: "New Entry", searchPlaceholder: "Search driver, reason…",
      leaveTypes: { "Annual Leave": "Annual Leave", sick: "Sick Leave", Vacation: "Vacation", Other: "Other" },
    },
    offShift: {
      cycle: "Cycle", firstLeaveDay: "First Leave Day", planUntil: "Plan Until",
      searchPlaceholder: "Search driver…",
    },
    vehicles: {
      year: "Year", lastPmi: "Last PMI", tachographCal: "Tachograph Cal.",
      searchPlaceholder: "Search by reg, depot…", addVehicle: "Add Vehicle",
    },
    places: {
      list: "List", map: "Map", city: "City", postalCode: "Postal Code",
      depotMap: "Depot Map", plotted: "Plotted", pageSize: "Page Size",
      searchPlaceholder: "Search places…", addPlace: "Add Place",
      code: "Code / ID", address: "Address", stateCounty: "State / County", country: "Country",
    },
    login: {
      tagline:       "Compliance & Fleet Management",
      signIn:        "Sign in",
      signInDesc:    "Enter your credentials to access the platform",
      emailLabel:    "Email address",
      emailPlaceholder: "you@company.com",
      passwordLabel: "Password",
      rememberMe:    "Remember me",
      forgotPassword:"Forgot password?",
      submit:        "Sign In",
      submitting:    "Signing in…",
      resetTitle:    "Reset password",
      resetDesc:     "Enter your account email and we'll send you a reset link.",
      sendLink:      "Send reset link",
      sending:       "Sending…",
      backToSignIn:  "← Back to sign in",
      checkInbox:    "Check your inbox",
      checkInboxDesc:"If {email} is registered, you'll receive a reset link shortly.",
      errorDefault:  "Login failed. Check your credentials and try again.",
    },
    inventoryHub: {
      tabDashboard:"Dashboard",tabParts:"Parts",tabJobCards:"Job Cards",tabPurchasing:"Purchasing",tabTyres:"Tyres & Fluids",
      totalStockValue:"Total Stock Value",stockoutVOR:"Stockout VOR Risk",lowStockParts:"Low Stock Parts",deadStock:"Dead Stock (>12m)",
      reorderAlerts:"Reorder Alerts",stockValueByCategory:"Stock Value by Category",recentMovements:"Recent Stock Movements",
      safetyCritical:"SAFETY CRITICAL",addPart:"Add Part",scan:"Scan",adjust:"Adjust",
      partsIssued:"Parts Issued",scanPart:"Scan Part",issueKit:"Issue Kit",newJobCard:"New Job Card",
      openPOs:"Open POs",autoReorder:"Auto-Reorder Due",coreReturns:"Core Returns £",raisePO:"Raise PO",raiseAllPOs:"Raise All POs",
      newPO:"New PO",purchaseOrders:"Purchase Orders",autoReorderSuggestions:"Auto-Reorder Suggestions",
      tyresToReplace:"Tyres to Replace",advisoryTyres:"Advisory Tyres",tyresTracked:"Tyres Tracked",
      tyreManagement:"Tyre Management",fitTyre:"Fit Tyre",bulkFluidDispensing:"Bulk Fluid Dispensing",
      dispense:"Dispense",confirm:"Confirm",issuePMIKit:"Issue PMI Kit",stockout:"Stockout",reorder:"Reorder",
    },
    complianceHub: {
      tabWalkaround:"Walkaround",tabDrivers:"Drivers",tabDocuments:"Documents",tabPlanner:"Planner",
      tabTraining:"Training",tabFleet:"Fleet",tabAudit:"Audit Log",tabSettings:"Settings",
      newWalkaround:"New Walkaround Check",walkaroundSubmitted:"Walkaround Submitted",
      noVehiclesFound:"No vehicles found",noDriversFound:"No drivers found",
      timerLocation:"Timer / Location",todayPhotograph:"Today you must photograph:",takePhoto:"Take Photo",
      advisory:"Advisory",pass:"Pass",fail:"Fail",yes:"Yes",
      driverDeclaration:"Driver Declaration & Signature",
      driverDeclarationText:"I declare that I have carried out the required daily walkaround check on the vehicle identified above and it is, to the best of my knowledge, safe to drive on the road.",
      signedBy:"Signed by",submitWalkaround:"Submit Walkaround Check",
      checkSummary:"Check Summary",duration:"Duration",results:"Results",antiCheatPhoto:"Anti-Cheat Photo",dangerous:"Dangerous",
      checksCompletedToday:"Checks completed today",defectsReportedToday:"Defects reported today",
      avgCheckTime:"Avg. check time today",dvsaMinimum:"DVSA minimum: 5 mins",
      recentWalkarounds:"Recent Walkaround Checks",noWalkarounds:"No walkaround checks found.",
      nilDefect:"Nil defect",unableToLoad:"Unable to load check detail.",
      dvlaLicence:"DVLA Licence",refresh:"Refresh",davisRiskScore:"DAVIS Risk Score",entitlements:"Entitlements",
      noEndorsements:"No endorsements recorded. Clean licence confirmed by DVLA.",
      driverCPC:"Driver CPC",dqc:"DQC",progress:"Progress",modules:"Modules",outstanding:"Outstanding",
      logCourse:"Log completed course",previousCycle:"Previous cycle (5 years prior)",
      addRecord:"Add record",noTraining:"No training records.",noExpiry:"No expiry",
      visaExpiry:"Visa Expiry",uploadPassport:"Upload passport / BRP scan",
      auditTrail:"DVSA Audit Trail",exportCsv:"Export CSV",allCategories:"All categories",
      allActions:"All actions",allUsers:"All users",before:"Before",after:"After",
      noEvents:"No events match your filters.",
      expired:"Expired",expiringWithin90:"Expiring within 90 days",noDateSet:"No date set",
      bothPartiesSigned:"Both parties signed",multipleDocuments:"Multiple documents",
      clickToEdit:"Click any cell to edit",noExpiries:"No expiry dates recorded.",showAll:"Show all",
      documentType:"Document",driverVehicle:"Driver / Vehicle",expiry:"Expiry",
      pmiBoard:"Preventative Maintenance Planner Board",bookIn:"Book In",
      complianceManager:"Compliance Manager",noManagerCandidates:"No manager candidates found from API",
      olicenceMarginsChecker:"O-Licence Margin Checker",
      tachoInfringements:"Tachograph & WTD Infringements",tachoIntegration:"Integrated via TruTac / Descartes API",
      accidentLog:"Accident & Incident Log (FNOL)",reportAccident:"Report Accident",
      downloadFnol:"Download FNOL Report",forsReport:"FORS / DVSA Earned Recognition Report",
      generateReport:"Generate Report",reportAccidentFnol:"Report Accident (FNOL)",
      attachPhotos:"Attach Scene Photos",
      notificationChannels:"Notification Channels",emailChannel:"Email",
      mobileNotification:"Mobile Notification",dailyDigest:"Daily Digest",
      operationalEvents:"Operational events",deliverAt:"Deliver at",expiryAlerts:"Expiry Alerts",
      alertLabel:"Alert",early:"Early",remind:"Remind",off:"Off",instant:"Instant",
      allSettingsSaved:"All settings saved",unsavedChanges:"Unsaved changes",reset:"Reset",
      highRisk:"High Risk",cpcCritical:"CPC Critical",checksDue:"Checks Due",
      rtwExpiring:"RTW Expiring",disqualified:"Disqualified",
      motExpiring:"MOT Expiring ≤90d",tachoCal:"Tacho Cal ≤90d",lolerDue:"LOLER Due ≤90d",
      fullyClear:"Fully Clear",overdueVor:"Overdue / VOR",dueWithin7:"Due Within 7 Days",
      pmiOnTime:"PMI On-Time Rate",
      expiredOverdue:"Expired / Overdue",expiringSoon:"Expiring Soon",awaitingSignatures:"Awaiting Signatures",
      documentDetails:"Document Details",editDocument:"Edit Document",file:"File",
      noFileAttached:"No file attached yet",counterSigned:"Counter-signed",signed:"Signed",uploaded:"Uploaded",
      documentTitle:"Document Title",category:"Category",newCategory:"New Category Name",
      description:"Description",notes:"Notes",
      walkaroundTemplates:"Walkaround Templates",
      walkaroundTemplatesDesc:"Create configurable check templates with question types, mandatory photos, and conditional logic. Assign per vehicle.",
      helpText:"Help text",questionType:"Question Type",dropdownOptions:"Dropdown Options",
      unitLabel:"Unit Label",requiredToSubmit:"Required to submit?",
      defectSeverity:"Defect severity",conditionalDisplay:"Conditional display",
      noConditional:"No other questions in this section with selectable responses.",
      templateName:"Template Name",vehicleAssignment:"Vehicle Assignment",
      vehicleAssignmentDesc:"One template per vehicle. Assigning here removes from current template.",
      unassigned:"Unassigned",sections:"Sections",checks:"Checks",vehicles:"Vehicles",
      modified:"Modified",actions:"Actions",untitled:"Untitled",assign:"Assign",
      totalCourses:"Total Courses",completed:"Completed",awaitingApproval:"Awaiting Approval",
      totalEnrolments:"Total Enrolments",noEnrolments:"No enrolments yet",
      back:"Back",publish:"Publish",archive:"Archive",republish:"Re-publish",
      courseInformation:"Course Information",completionSummary:"Completion Summary",
      editCourseDetails:"Edit Course Details",titleLabel:"Title",passMarkPct:"Pass Mark (%)",
      deadline:"Deadline",assignTo:"Assign To",allDrivers:"All Drivers",specificDrivers:"Specific Drivers",
      autoApprove:"Auto-approve when driver passes",saveDetails:"Save Details",
      learningMaterials:"Learning Materials",addMaterial:"Add Material",
      addFirstMaterial:"Add First Material",noMaterials:"No materials yet.",
      videoUrl:"Video URL",pages:"Pages",
      fileUploadNote:"File upload will be available when connected to backend",
      quizQuestions:"Quiz Questions",addQuestion:"Add Question",addFirstQuestion:"Add First Question",
      noQuestions:"No questions yet.",quizQuestionType:"Question Type",scorePts:"Score (points)",questionText:"Question Text",
      correctAnswer:"Correct Answer",trueFalse:"True / False",freeText:"Free Text (manual grading)",
      multiChoiceSingle:"Multiple Choice (single answer)",multiChoiceMulti:"Multiple Choice (multiple answers)",
      sampleAnswer:"Sample Answer",addOption:"Add option",
      driverEnrolments:"Driver Enrolments",
      noDriversEnrolled:"No drivers enrolled yet. Publish the course and assign drivers.",
      driverCol:"Driver",statusCol:"Status",attempts:"Attempts",bestScore:"Best Score",
      driverSigned:"Driver Signed",operatorSigned:"Operator Signed",actionCol:"Action",
      assessmentApproved:"Assessment Approved",certFiled:"Certificate generated and filed in driver documents.",
      assessmentRejected:"Assessment Rejected",answerReview:"Answer Review",scoreLabel:"Score",
      attemptsLabel:"Attempts",driverSignature:"Driver Signature",signedLabel:"Signed",
      cancel:"Cancel",searchDocs:"Search documents...",searchCourses:"Search courses...",antiCheatPhotoRequired:"📸 Screenshot required to continue",antiCheatInstruction:"Take a photo / screenshot of your device screen",backToChecks:"Back to Checks",backToEnrolments:"Back to Enrolments",courseInfo:"Course Information",editCourse:"Edit Course Details",defectsReported:"Defects reported",defectsWorkshopNotified:"Workshop notified",nilDefectCleared:"Nil-defect cleared",noDefects:"No defects",ok:"OK",olicenceMargin:"O-Licence margin",passed:"Passed",photoRequired:"Photo required",photoRequiredDefect:"Photo required – defect",requiredQuestion:"Required",forsReadiness:"FORS Readiness",loadingCheckDetail:"Loading check detail...",loadingDrivers:"Loading drivers...",loadingVehicles:"Loading vehicles...",signedOn:"Signed on",suspiciousSpeed:"⚠️ Suspicious speed",vehiclesPending:"Vehicles pending",workshopNotified:"Workshop notified",
      date:"Date",na:"N/A",notConnected:"Not connected",integrations:"Integrations",sent:"Sent",saving:"Saving...",saved:"Saved",saveChanges:"Save Changes",
      action:"Action",apiErrorLocal:"Error (using local data)",at:"at",certificate:"Certificate",details:"Details",edit:"Edit",rePublish:"Re-publish",review:"Review",sign:"Sign",status:"Status",template:"Template",
      reviewNote:"Review the answers above, grade any free-text questions, then approve or reject.",
    },
    drivers: {
      addTitle:"Add Driver", editTitle:"Edit Driver",
      shiftPreference:"Shift Preference", shiftNone:"None", shiftAllDays:"All Days", shiftCustom:"Custom",
      shiftStart:"Shift Start", shiftEnd:"Shift End",
      maxConsecDays:"Max Consec. Days", maxTripsWeek:"Max Trips / Week",
      licenceNo:"Licence No.", noneSelected:"None selected",
      statusActive:"Active", statusInactive:"Inactive", statusPending:"Pending", statusArchived:"Archived",
      noDriversFound:"No drivers found.", nameRequired:"Driver name is required.",
      saveFailed:"Save failed", statusUpdateFailed:"Status update failed",
      retryLabel:"retry",
    },
    fleetManagement: {
      exceptionEvents:"Exception Events", engineDiagnostics:"Engine Diagnostics", tripHistory:"Trip History",
      allFleets:"All Fleets", vehicles:"Vehicles", drivers:"Drivers", onShift:"On Shift",
      monthlyDistance:"Monthly distance", fuelThisMonth:"Fuel this month", newFleet:"New Fleet",
      vehicleLabel:"Vehicle", fleetLabel:"Fleet", yearLabel:"Year",
      mph:"mph", rpm:"rpm", driverSafetyScore:"Driver Safety Score",
      critical:"Critical", warnings:"Warnings", info:"Info",
      exceptionByType:"Exception Events by Type", noTripsToday:"No trips recorded today.",
      liveDiagnostic:"Live Diagnostic Snapshot", avgSpd:"Avg Spd", endLabel:"End",
    },
    importHub: {
      autoImportEnabled:"Auto-import enabled", extensionNotDetected:"Extension Not Detected",
      extensionActive:"Extension Active",
      yourColumn:"Your Column", fleeyesField:"FleetYes Field",
      tripsToday:"Trips today", lastSync:"Last sync", primary:"Primary",
      universalActivityLog:"Universal Activity Log", viewLabel:"View",
      tripsImportedToday:"Trips imported today", acrossAllProviders:"across all providers",
      activeConnections:"Active connections", syncFailures:"Sync failures",
      providersConfigured:"Providers configured", vendorGallery:"Vendor Integration Gallery",
    },
    orgSettings: {
      failedToLoad:"Failed to load settings", orgSettings:"Organisation Settings",
      recordInfo:"Record Info", drivingHours:"Driving Hours",
      workingHours:"Working Hours", myGeotab:"MyGeotab",
    },
  },

  // ── German ──────────────────────────────────────────────────────────────────
  de: {
    nav: {
      dashboard:          "Dashboard",
      trips:              "Fahrten",
      rota:               "Wochenplan",
      importHub:          "Import-Hub",
      calendar:           "Kalender",
      maintenanceTrips:   "Wartungsfahrten",
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
      groupTransport:     "Fuhrpark",
      groupExpenses:      "Kosten",
      groupPeople:        "Personal",
      groupSettings:      "Einstellungen",
      issues:             "Meldungen",
      fuel:               "Kraftstoff",
      toll:               "Maut",
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
      save:"Speichern",cancel:"Abbrechen",upload:"Hochladen",download:"Herunterladen",search:"Suchen",new:"Neu",edit:"Bearbeiten",delete:"Löschen",submit:"Einreichen",back:"Zurück",loading:"Laden…",addVehicle:"Fahrzeug hinzufügen",export:"Exportieren",filter:"Filtern",refresh:"Aktualisieren",active:"Aktiv",inactive:"Inaktiv",pending:"Ausstehend",resolved:"Erledigt",allVehicles:"Alle Fahrzeuge",today:"Heute",thisMonth:"Diesen Monat",selectAll:"Alle auswählen",tryAgain:"Erneut versuchen",records:"Einträge",noData:"Keine Daten",
      date:"Datum",vehicle:"Fahrzeug",driver:"Fahrer",status:"Status",action:"Aktion",ref:"Ref",route:"Strecke",type:"Typ",amount:"Betrag",method:"Methode",litres:"Liter",costPerLitre:"Kosten/L",totalCost:"Gesamtkosten",odometer:"Kilometerstand",mpg:"L/100km",depot:"Depot",duration:"Dauer",location:"Standort",cost:"Kosten",fleet:"Flotte",name:"Name",phone:"Telefon",email:"E-Mail",country:"Land",licence:"Lizenz",notes:"Notizen",
      view:"Ansehen",reconcile:"Abgleichen",addNew:"Hinzufügen",assign:"Zuweisen",approve:"Genehmigen",reject:"Ablehnen",newCharge:"Neue Gebühr",details:"Details",close:"Schließen",
      createRecord:"Datensatz erstellen",saving:"Speichern…",creating:"Erstellen…",
      clearAll:"Alle löschen",apply:"Anwenden",stats:"Statistiken",noRecordsFound:"Keine Einträge gefunden",
      dropFile:"Datei hier ablegen oder klicken",supports:"Unterstützt .xlsx, .xls, .csv",clickToChange:"zum Ändern klicken",
      importComplete:"Import abgeschlossen",importFailed:"Import fehlgeschlagen",rowsImported:"importiert",rowsSkipped:"übersprungen",
      someRowsHadErrors:"Einige Zeilen enthielten Fehler",downloadErrorLog:"Fehlerprotokoll herunterladen",tryAgainBtn:"Erneut versuchen",
      all:"Alle",reconciled:"Abgeglichen",scheduled:"Geplant",dispatched:"Disponiert",started:"Gestartet",completed:"Abgeschlossen",cancelled:"Storniert",
      tripsToday:"Fahrten heute",driversAvailable:"Fahrer verfügbar",fleetSize:"Flottengröße",thisWeek:"Diese Woche",available:"verfügbar",onLeave:"im Urlaub",noTripsToday:"Keine Fahrten heute",nothingScheduled:"Nichts für heute geplant",createTrip:"Fahrt erstellen →",driverStatus:"Fahrerstatus",allDrivers:"Alle Fahrer",todaysTrips:"Heutige Fahrten",weekAtGlance:"Woche im Überblick",vehicleDowntime:"Fahrzeugausfälle",upcomingLeave:"Kommender Urlaub",viewCalendar:"Kalender anzeigen",manage:"Verwalten",viewAll:"Alle anzeigen",tripsMonSun:"Fahrten Mo–So",active2:"aktiv",done:"erledigt",awaitingDispatch:"Wartet auf Disposition",ofTotal:"von {n} gesamt",vehiclesRegistered:"Fahrzeuge registriert",vehiclesOff:"{n} Fahrzeug(e) heute abwesend",needsDriver:"{n} Fahrt(en) brauchen heute einen Fahrer",
      goodMorning:"Guten Morgen",goodAfternoon:"Guten Tag",goodEvening:"Guten Abend",
      searchPlaceholder:"Suchen…",searchVehicles:"Nach Kennzeichen, Fahrer, Depot suchen…",searchDrivers:"Fahrer suchen…",
      noDriverAssigned:"Kein Fahrer zugewiesen",driverAssigned:"Fahrer zugewiesen",ongoing:"Laufend",noUpcomingDowntime:"Keine anstehenden Fahrzeugausfälle",noUpcomingLeave:"Kein Urlaub in den nächsten 7 Tagen",consumptionByVehicle:"Verbrauch nach Fahrzeug (30 Tage)",address:"Adresse",
      at:"um",for:"für",of:"von",
    },
    pages: {
      dashboard:          { title: "Dashboard",                    subtitle: "Ihre betriebliche Zusammenfassung für heute." },
      trips:              { title: "Fahrten",                      subtitle: "Alle Transportaufträge verwalten und überwachen." },
      rota:               { title: "Wöchentlicher Fahrerplan",     subtitle: "Fahrerplanung und Schichtzuweisungen für die Woche." },
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
      maintenance:        { title: "Wartungs-Hub",                 subtitle: "Fahrzeugwartung, Reparaturen und Inspektionen planen und verfolgen." },
      maintenanceTrips:   { title: "Wartungsfahrten",              subtitle: "Fahrzeugstillstände und Außerbetriebnahmen aus dem Kalender." },
      compliance:         { title: "Compliance-Hub",               subtitle: "Regulatorische Dokumente, Lizenzen und Prüfungsbereitschaft verwalten." },
      inventory:          { title: "Inventar-Hub",                 subtitle: "Teile, Verbrauchsmaterialien und Bestand über alle Depots hinweg verfolgen." },
      allocationSettings: { title: "Zuweisungseinstellungen",      subtitle: "Fahrerpaarungsregeln und automatische Fahrtenzuweisung konfigurieren." },
      vehicles:           { title: "Fahrzeuge",                    subtitle: "Das vollständige Fahrzeugregister anzeigen und verwalten." },
      fleets:             { title: "Fuhrparks",                    subtitle: "Flottengruppen und Fahrerzuweisungen verwalten." },
      issues:             { title: "Meldungen",                    subtitle: "Fahrzeug-, Fahrer- und Betriebsprobleme erfassen und verfolgen." },
    },
    rota: {
      step1Label: "Fahrer laden",               step1Detail: "Fahrerprofile und Schichtmuster werden geladen",
      step2Label: "Urlaubsplan abrufen",         step2Detail: "Genehmigten Urlaub und Abwesenheiten prüfen",
      step3Label: "Fahrtzuweisungen prüfen",    step3Detail: "Nicht zugewiesene Fahrten für diese Woche suchen",
      step4Label: "Dienstplan erstellen",        step4Detail: "Fahrer ihren Fahrten zuordnen, fast fertig…",
      workingDay: "Arbeitstag", restDay: "Ruhetag", holiday: "Urlaub",
      unavailable: "Nicht verfügbar", off: "Frei", notOnRota: "Nicht im Plan",
      sun: "So", mon: "Mo", tue: "Di", wed: "Mi", thu: "Do", fri: "Fr", sat: "Sa",
      allocationPeriod: "Zuteilungszeitraum", assignDriver: "Fahrer zuweisen", assignTruck: "Lkw zuweisen",
      noRoute: "Keine Route", history: "Verlauf", stats: "Statistiken", relay: "Übergabe", add: "Hinzufügen",
      autoAllocate: "Automatisch zuweisen", user: "Benutzer", exportRelay: "Übergabe exportieren",
      unassignedTrips: "NICHT ZUGEWIESENE FAHRTEN", dragToAssign: "Zum Zuweisen ziehen",
      violations: "{n} Verstöße · {w} Warnung", warnings: "{w} Warnung", warningsLabel: "Warnungen", violationsLabel: "Verstöße",
      grid: "Raster", analysis: "Analyse",
      allCompliant: "Alle konform", checkingCompliance: "Konformität prüfen…",
      noUnassignedTrips: "Keine nicht zugewiesenen Fahrten",
      complianceReport: "Konformitätsbericht", allClear: "Alles in Ordnung",
      noComplianceDesc: "Keine Verstöße oder Warnungen für diese Woche erkannt. Alle Fahrer liegen innerhalb der zulässigen Stunden.",
      issuesTab: "Probleme", rulesRef: "Regelreferenz",
      allocationBlocked: "Zuweisung blockiert", complianceViolationBlocked: "Compliance-Verstoß verhindert diese Zuweisung",
      understood: "Verstanden",
      reassignTitle: "Neu zuweisen", currentlyAssigned: "Aktuell zugewiesen", willBeReplacedWith: "Wird ersetzt durch",
      existingTripUnassigned: "Die vorhandene Fahrt wird aufgehoben und in den nicht zugewiesenen Pool zurückgegeben.",
      driver: "Fahrer", hrs: "Std.",
      complianceViolation: "Compliance-Verstoß", complianceWarning: "Compliance-Warnung",
      complianceCompliant: "Konform", driversWithIssues: "{n} Fahrer mit Problemen",
    },
    maintenance: {
      upcoming: "Bevorstehend", historical: "Vergangen",
      searchPlaceholder: "Fahrzeug, Grund suchen…",
      records: "Einträge", ofRecords: "von",
      refresh: "Aktualisieren", export: "Exportieren",
      colVehicle: "Fahrzeug", colDateRange: "Zeitraum", colDays: "Tage", colWhen: "Wann",
      loading: "Wartungsereignisse laden…", tryAgain: "Erneut versuchen",
      noUpcoming: "Keine bevorstehende Wartung",    noUpcomingDesc: "Aktuell ist kein Fahrzeugstillstand geplant.",
      noHistorical: "Keine vergangenen Einträge",   noHistoricalDesc: "Keine früheren Wartungsereignisse gefunden.",
      statusActive: "Aktiv", statusUpcoming: "Bevorstehend", statusCompleted: "Abgeschlossen",
      today: "Heute", inDays: "In {n} T.", daysAgo: "Vor {n} T.", durationDays: "{n} T.",
    },
    maintenanceHub: {
      tabDashboard: "Dashboard", tabPMI: "PMI-Blatt", tabDefects: "Mängel", tabSettings: "Einstellungen",
      kpiVOR: "VOR (Ausser Betrieb)", kpiVORSub: "Fahrzeuge stillgelegt",
      kpiDueSoon: "Fällig in 7 Tagen", kpiDueSoonSub: "Buchung erforderlich",
      kpiCompliant: "Vollständig konform", kpiCompliantSub: "Fahrzeuge im grünen Bereich",
      kpiPMIRate: "PMI-Pünktlichkeitsrate", kpiPMIRateSub: "DVSA-Ziel: 100%",
      earnedRecognition: "Verdiente Anerkennung KPIs", dvsaScheme: "DVSA-Programm", target: "Ziel: {n}%",
      fleetStatusBoard: "Flottenstatus-Board", compliant: "Konform", dueSoon: "Bald fällig", overdueVOR: "Verzögert/VOR",
      pmiSchedule: "8-Wochen-PMI-Zeitplan", noPMIsDue: "Keine PMIs fällig",
      driver: "Fahrer", nextPMI: "Nächste PMI", daysOverdue: "{n}T überschritten", dueToday: "Heute fällig", dueIn: "Fällig in {n}T",
      pmiSheet: "PMI-Zeitplan — Alle Fahrzeuge", allVehicles: "Alle Fahrzeuge", clickToInspect: "Zeile anklicken um Prüfbogen zu öffnen",
      inspectionProgress: "Prüfungsfortschritt", itemsCompleted: "Abgeschlossene Punkte", results: "Ergebnisse", location: "Standort", interval: "Intervall",
      technicianDecl: "Techniker-Erklärung", sign: "Unterzeichnen", signed: "Unterzeichnet", signFirst: "Bitte die Erklärung oben unterzeichnen.",
      submitPMI: "PMI-Bericht einreichen", pmiSubmitted: "PMI eingereicht", backToSchedule: "← Zurück zum Zeitplan",
      brakeTest: "Bremstestergebnisse (DVSA erforderlich)", axle1: "Achse 1 Effizienz (%)", axle2: "Achse 2 Effizienz (%)",
      meetsDVSA: "✓ Erfüllt DVSA-Minimum (50%)", belowDVSA: "✗ Unter DVSA-Minimum – NICHT BESTANDEN",
      openDefects: "Offene Mängel", resolved: "Behoben", totalDefects: "Gesamt Mängel",
      requiresAction: "Massnahme erforderlich", completed: "Abgeschlossen", allTime: "Gesamt",
      rectificationRecord: "Reparaturprotokoll", partsUsed: "Verwendete Teile:", labour: "Arbeitszeit:", signedOffBy: "Abgezeichnet von:",
      logRectification: "Reparatur protokollieren", markRoadworthy: "Fahrtauglich bestimmen & Abzeichnen", signedOffRoadworthy: "✓ Als fahrtauglich abgezeichnet",
      vehicleProfiles: "Fahrzeugprofile", addVehicle: "Fahrzeug hinzufügen", userRolesPerms: "Benutzerrollen & Berechtigungen", inviteUser: "Benutzer einladen",
      notificationEngine: "Benachrichtigungs-Engine", customChecklist: "Benutzerdefinierte Checkliste", addItem: "Element hinzufügen", remove: "Entfernen",
      dataExport: "Datenexport & Integrationen", vorAlert: "{n} Fahrzeug{s} ausser Betrieb", schedule: "← Zeitplan",
      pass: "B", advisory: "H", fail: "F",
    },
    issues: {
      newIssue: "Neue Meldung", critical: "Kritisch", high: "Hoch", medium: "Mittel", low: "Niedrig",
      inProgress: "In Bearbeitung", open: "Offen", report: "Meldung", priority: "Priorität",
      assignee: "Zuständig", backlogged: "Im Rückstand", requiresUpdate: "Aktualisierung erforderlich",
      inReview: "In Prüfung", saveChanges: "Änderungen speichern", createIssue: "Meldung erstellen",
      unassigned: "Nicht zugewiesen",
      type: "Typ", category: "Kategorie", assignedTo: "Zugewiesen an", reportedBy: "Gemeldet von",
      incidentLocation: "Vorfallort", pinLocation: "Ort markieren", hideMap: "Karte ausblenden",
      noLocationPinned: "Kein Ort markiert \u2014 Klicken Sie auf \u201eOrt markieren\u201c um eine Markierung zu setzen",
      scheduledMaintenance: "Geplante Wartung", pending: "Ausstehend", closed: "Geschlossen",
      pickTypFirst: "Zuerst Typ wählen", selectCategory: "Auswählen\u2026",
    },
    trips: {
      tripId: "Fahrt-ID", tripStatus: "Fahrtstatus", tractor: "Zugmaschine",
      facilitySequence: "Standortfolge", estEndTime: "Voraussichtliche Endzeit",
      dragToAssign: "Zum Zuweisen ziehen", unassignedTrips: "NICHT ZUGEWIESENE FAHRTEN",
      saveChanges: "Änderungen speichern", createIssue: "Meldung erstellen", newIssue: "Neue Meldung",
    },
    calendar: {
      created: "Erstellt", driverUnavailable: "Fahrer nicht verfügbar", assigned: "Zugewiesen",
      unassigned: "Nicht zugewiesen", estEnd: "Vorh. Ende", destination: "Ziel",
      month: "Monat", week: "Woche", day: "Tag", allDrivers: "Alle Fahrer",
      allVehicles: "Alle Fahrzeuge", vehicleOff: "Fzg. weg", fullyAssigned: "Vollständig zugewiesen",
      noVehicle: "Kein Fahrzeug", noDriver: "Kein Fahrer", orders: "Aufträge", driverOff: "Fahrer frei",
    },
    fuelTracking: {
      expense: "Ausgabe", addExpense: "Ausgabe hinzufügen", inclVat: "inkl. MwSt.",
      volume: "Volumen", payment: "Zahlung", card: "Karte",
      noExpenses: "Keine Kraftstoffausgaben gefunden", stats: "Statistiken",
      totalRecords: "Gesamteinträge", pendingApproval: "Genehmigung ausstehend", approved: "Genehmigt",
      filters: "Filter", searchPlaceholder: "Fahrzeug, Fahrer suchen…",
    },
    fuelReceipts: {
      captured:"Erfasst", supplier:"Lieferant", product:"Produkt",
      duplicate:"Duplikat", receipt:"Beleg", uploadZip:"ZIP hochladen",
      searchPlaceholder:"Nach Fahrzeug, Lieferant suchen…",
      addModalTitle:"Kraftstoffbelege hinzufügen",
      addModalSubtitle:"Bilder oder PDFs ablegen — sie werden gezippt und automatisch per OCR verarbeitet",
      dropTitle:"Belege hierher ziehen & ablegen", dropActive:"Ablegen zum Hinzufügen",
      dropHint:"oder klicken zum Durchsuchen · JPEG, PNG, WebP, PDF",
      filesSelected:"{n} Datei{s} ausgewählt",
      stepZipping:"Komprimieren", stepUploading:"Hochladen",
      stepImporting:"Importieren", stepProcessing:"OCR-Verarbeitung",
      progressZipping:"Komprimiere {n} Datei{s}…", progressUploading:"Wird auf Server hochgeladen…",
      progressImporting:"Belege werden importiert…", progressProcessing:"OCR-Verarbeitung läuft…",
      processingNote:"Dies kann bei großen Stapeln einen Moment dauern",
      successTitle:"Upload & Verarbeitung abgeschlossen", successCount:"{n} Beleg{s} importiert",
      errorTitle:"Upload fehlgeschlagen",
      btnAdd:"Hinzufügen", btnUpload:"{n} Datei{s} hochladen", btnDone:"Fertig — Liste aktualisieren",
      btnTryAgain:"Erneut versuchen", btnClose:"Schließen",
      filterTitle:"Belege filtern", anyDriver:"Beliebiger Fahrer", anyStatus:"Beliebiger Status",
      capturedFrom:"Erfasst ab", capturedTo:"Erfasst bis",
      detailTitle:"Kraftstoffbeleg-Detail", ocrData:"OCR-extrahierte Daten", rawText:"Rohtext",
      colOcrStatus:"OCR-Status", colCapturedAt:"Erfasst am",
    },
    parking: {
      pageOf: "Seite", searchPlaceholder: "Fahrzeug, Standort suchen…",
    },
    tollReceipts: {
      upload:"Hochladen", entryPoint:"Einfahrtstelle", exitPoint:"Ausfahrtstelle",
      vehicleClass:"Fahrzeugklasse", searchPlaceholder:"Fahrzeug, Strecke suchen…",
      addModalTitle:"Mautbelege hinzufügen",
      addModalSubtitle:"Bilder oder PDFs ablegen — sie werden gezippt und automatisch per OCR verarbeitet",
      dropTitle:"Belege hierher ziehen & ablegen", dropActive:"Ablegen zum Hinzufügen",
      dropHint:"oder klicken zum Durchsuchen · JPEG, PNG, WebP, PDF",
      filesSelected:"{n} Datei{s} ausgewählt",
      stepZipping:"Komprimieren", stepUploading:"Hochladen",
      stepImporting:"Importieren", stepProcessing:"OCR-Verarbeitung",
      progressZipping:"Komprimiere {n} Datei{s}…", progressUploading:"Wird auf Server hochgeladen…",
      progressImporting:"Belege werden importiert…", progressProcessing:"OCR-Verarbeitung läuft…",
      processingNote:"Dies kann bei großen Stapeln einen Moment dauern",
      successTitle:"Upload & Verarbeitung abgeschlossen", successCount:"{n} Beleg{s} importiert",
      errorTitle:"Upload fehlgeschlagen",
      btnAdd:"Hinzufügen", btnUpload:"{n} Datei{s} hochladen", btnDone:"Fertig — Liste aktualisieren",
      btnTryAgain:"Erneut versuchen", btnClose:"Schließen",
      filterTitle:"Belege filtern", anyDriver:"Beliebiger Fahrer", anyStatus:"Beliebiger Status",
      capturedFrom:"Erfasst ab", capturedTo:"Erfasst bis",
      sendTitle:"An Amazon senden", sendSubtitle:"Mautgebühren für den ausgewählten Zeitraum an Amazon Relay übermitteln",
      sendFromDate:"Von Datum", sendToDate:"Bis Datum",
      sendPreviewBtn:"Daten vor dem Senden anzeigen", sendDownloading:"Wird heruntergeladen…",
      sendBtn:"An Amazon Relay senden", sendSending:"Wird gesendet.",
      sendWarning:"Alle verarbeiteten Mautgebühren im ausgewählten Zeitraum werden an Amazon Relay übermittelt.",
      sendSuccess:"Erfolgreich übermittelt",
      sendSuccessMsg:"Mautgebühren wurden an Amazon Relay gesendet.",
      colChargeEx:"Gebühr (ohne MwSt.)", colVat:"MwSt.",
      colChargeInc:"Gebühr (inkl. MwSt.)", colProcessingStatus:"Verarbeitungsstatus",
    },
    holidays: {
      reason: "Grund", start: "Beginn", end: "Ende", days: "Tage",
      newEntry: "Neuer Eintrag", searchPlaceholder: "Fahrer, Grund suchen…",
      leaveTypes: { "Annual Leave": "Jahresurlaub", sick: "Krankheit", Vacation: "Urlaub", Other: "Sonstiges" },
    },
    offShift: {
      cycle: "Zeitraum", firstLeaveDay: "Erster Urlaubstag", planUntil: "Planen bis",
      searchPlaceholder: "Fahrer suchen…",
    },
    vehicles: {
      year: "Baujahr", lastPmi: "Letzte HU", tachographCal: "Tachographenprüfung",
      searchPlaceholder: "Nach Kennzeichen, Depot suchen…", addVehicle: "Fahrzeug hinzufügen",
    },
    places: {
      list: "Liste", map: "Karte", city: "Ort", postalCode: "Postleitzahl",
      depotMap: "Depotkarte", plotted: "Angezeigt", pageSize: "Seitengröße",
      searchPlaceholder: "Standorte suchen…", addPlace: "Standort hinzufügen",
      code: "Code / Kennung", address: "Adresse", stateCounty: "Bundesland / Landkreis", country: "Land",
    },
    login: {
      tagline:       "Compliance & Flottenmanagement",
      signIn:        "Anmelden",
      signInDesc:    "Geben Sie Ihre Anmeldedaten ein, um auf die Plattform zuzugreifen",
      emailLabel:    "E-Mail-Adresse",
      emailPlaceholder: "sie@unternehmen.de",
      passwordLabel: "Passwort",
      rememberMe:    "Angemeldet bleiben",
      forgotPassword:"Passwort vergessen?",
      submit:        "Anmelden",
      submitting:    "Anmeldung läuft…",
      resetTitle:    "Passwort zurücksetzen",
      resetDesc:     "Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Reset-Link.",
      sendLink:      "Reset-Link senden",
      sending:       "Wird gesendet…",
      backToSignIn:  "← Zurück zur Anmeldung",
      checkInbox:    "Posteingang prüfen",
      checkInboxDesc:"Falls {email} registriert ist, erhalten Sie in Kürze einen Reset-Link.",
      errorDefault:  "Anmeldung fehlgeschlagen. Bitte Zugangsdaten prüfen und erneut versuchen.",
    },
    inventoryHub: {
      tabDashboard:"Dashboard",tabParts:"Teile",tabJobCards:"Auftragsübersicht",tabPurchasing:"Einkauf",tabTyres:"Reifen & Flüssigkeiten",
      totalStockValue:"Gesamtlagerwert",stockoutVOR:"VOR-Fehlbestand",lowStockParts:"Teile mit geringem Bestand",deadStock:"Toter Bestand (>12M)",
      reorderAlerts:"Nachbestellungshinweise",stockValueByCategory:"Lagerwert nach Kategorie",recentMovements:"Letzte Lagerbewegungen",
      safetyCritical:"SICHERHEITSKRITISCH",addPart:"Teil hinzufügen",scan:"Scannen",adjust:"Korrigieren",
      partsIssued:"Ausgegebene Teile",scanPart:"Teil scannen",issueKit:"Kit ausgeben",newJobCard:"Neuer Auftrag",
      openPOs:"Offene Bestellungen",autoReorder:"Nachbestellung fällig",coreReturns:"Kernrückgaben €",raisePO:"Bestellung aufgeben",raiseAllPOs:"Alle Bestellungen aufgeben",
      newPO:"Neue Bestellung",purchaseOrders:"Bestellungen",autoReorderSuggestions:"Automatische Nachbestellvorschläge",
      tyresToReplace:"Reifen auszutauschen",advisoryTyres:"Warnreifen",tyresTracked:"Erfasste Reifen",
      tyreManagement:"Reifenverwaltung",fitTyre:"Reifen montieren",bulkFluidDispensing:"Flüssigkeitsausgabe",
      dispense:"Ausgeben",confirm:"Bestätigen",issuePMIKit:"PMI-Kit ausgeben",stockout:"Ausgelagert",reorder:"Nachbestellen",
    },
    complianceHub: {
      tabWalkaround:"Fahrzeugcheck",tabDrivers:"Fahrer",tabDocuments:"Dokumente",tabPlanner:"Planer",
      tabTraining:"Schulung",tabFleet:"Flotte",tabAudit:"Prüfprotokoll",tabSettings:"Einstellungen",
      newWalkaround:"Neuer Fahrzeugcheck",walkaroundSubmitted:"Fahrzeugcheck eingereicht",
      noVehiclesFound:"Keine Fahrzeuge gefunden",noDriversFound:"Keine Fahrer gefunden",
      timerLocation:"Timer / Standort",todayPhotograph:"Heute müssen Sie fotografieren:",takePhoto:"Foto aufnehmen",
      advisory:"Hinweis",pass:"Bestanden",fail:"Nicht bestanden",yes:"Ja",
      driverDeclaration:"Fahrerererklärung & Unterschrift",
      driverDeclarationText:"Ich erkläre, dass ich die erforderliche tägliche Fahrzeugprüfung am oben genannten Fahrzeug durchgeführt habe und es nach bestem Wissen sicher für den Straßenverkehr ist.",
      signedBy:"Unterzeichnet von",submitWalkaround:"Fahrzeugcheck einreichen",
      checkSummary:"Prüfzusammenfassung",duration:"Dauer",results:"Ergebnisse",antiCheatPhoto:"Anti-Betrug-Foto",dangerous:"Gefährlich",
      checksCompletedToday:"Heute abgeschlossene Prüfungen",defectsReportedToday:"Heute gemeldete Mängel",
      avgCheckTime:"Durchschnittliche Prüfzeit heute",dvsaMinimum:"DVSA-Minimum: 5 Min.",
      recentWalkarounds:"Letzte Fahrzeugchecks",noWalkarounds:"Keine Fahrzeugchecks gefunden.",
      nilDefect:"Kein Mangel",unableToLoad:"Prüfdetails konnten nicht geladen werden.",
      dvlaLicence:"DVLA-Führerschein",refresh:"Aktualisieren",davisRiskScore:"DAVIS-Risikobewertung",entitlements:"Berechtigungen",
      noEndorsements:"Keine Eintragungen. Sauberer Führerschein durch DVLA bestätigt.",
      driverCPC:"Fahrer-CPC",dqc:"DQC",progress:"Fortschritt",modules:"Module",outstanding:"Ausstehend",
      logCourse:"Abgeschlossenen Kurs erfassen",previousCycle:"Vorheriger Zyklus (5 Jahre zuvor)",
      addRecord:"Eintrag hinzufügen",noTraining:"Keine Schulungsunterlagen.",noExpiry:"Kein Ablaufdatum",
      visaExpiry:"Visa-Ablauf",uploadPassport:"Pass / BRP-Scan hochladen",
      auditTrail:"Prüfprotokoll",exportCsv:"CSV exportieren",allCategories:"Alle Kategorien",
      allActions:"Alle Aktionen",allUsers:"Alle Benutzer",before:"Vor",after:"Nach",
      noEvents:"Keine Ereignisse entsprechen Ihren Filtern.",
      expired:"Abgelaufen",expiringWithin90:"Ablauf innerhalb von 90 Tagen",noDateSet:"Kein Datum festgelegt",
      bothPartiesSigned:"Beide Parteien unterzeichnet",multipleDocuments:"Mehrere Dokumente",
      clickToEdit:"Klicken Sie auf eine Zelle zum Bearbeiten",noExpiries:"Keine Ablaufdaten erfasst.",showAll:"Alle anzeigen",
      documentType:"Dokument",driverVehicle:"Fahrer / Fahrzeug",expiry:"Ablauf",
      pmiBoard:"Präventiver Wartungsplaner",bookIn:"Einbuchen",
      complianceManager:"Compliance-Manager",noManagerCandidates:"Keine Manager-Kandidaten von API gefunden",
      olicenceMarginsChecker:"O-Lizenz-Margenprüfer",
      tachoInfringements:"Tachograph & WTD-Verstöße",tachoIntegration:"Integriert über TruTac / Descartes API",
      accidentLog:"Unfall- & Vorfallsprotokoll (FNOL)",reportAccident:"Unfall melden",
      downloadFnol:"FNOL-Bericht herunterladen",forsReport:"FORS / DVSA-Anerkennungsbericht",
      generateReport:"Bericht erstellen",reportAccidentFnol:"Unfall melden (FNOL)",
      attachPhotos:"Fotos vom Unfallort anhängen",
      notificationChannels:"Benachrichtigungskanäle",emailChannel:"E-Mail",
      mobileNotification:"Mobile Benachrichtigung",dailyDigest:"Tägliche Zusammenfassung",
      operationalEvents:"Betriebliche Ereignisse",deliverAt:"Liefern um",expiryAlerts:"Ablaufwarnungen",
      alertLabel:"Alarm",early:"Früh",remind:"Erinnern",off:"Aus",instant:"Sofort",
      allSettingsSaved:"Alle Einstellungen gespeichert",unsavedChanges:"Ungespeicherte Änderungen",reset:"Zurücksetzen",
      highRisk:"Hohes Risiko",cpcCritical:"CPC-Kritisch",checksDue:"Fällige Prüfungen",
      rtwExpiring:"RTW läuft ab",disqualified:"Disqualifiziert",
      motExpiring:"HU fällig ≤90T",tachoCal:"Tacho-Kal. ≤90T",lolerDue:"LOLER fällig ≤90T",
      fullyClear:"Vollständig in Ordnung",overdueVor:"Fällig / VOR",dueWithin7:"In 7 Tagen fällig",
      pmiOnTime:"PMI-Pünktlichkeitsrate",
      expiredOverdue:"Abgelaufen / Überfällig",expiringSoon:"Bald ablaufend",awaitingSignatures:"Wartet auf Unterschriften",
      documentDetails:"Dokumentdetails",editDocument:"Dokument bearbeiten",file:"Datei",
      noFileAttached:"Noch keine Datei angehängt",counterSigned:"Gegengezeichnet",signed:"Unterzeichnet",uploaded:"Hochgeladen",
      documentTitle:"Dokumenttitel",category:"Kategorie",newCategory:"Neue Kategoriename",
      description:"Beschreibung",notes:"Notizen",
      walkaroundTemplates:"Fahrzeugcheck-Vorlagen",
      walkaroundTemplatesDesc:"Konfigurierbare Prüfvorlagen mit Fragetypen, Pflichtfotos und bedingter Logik erstellen. Pro Fahrzeug zuweisen.",
      helpText:"Hilfetext",questionType:"Fragetyp",dropdownOptions:"Dropdown-Optionen",
      unitLabel:"Einheitenbezeichnung",requiredToSubmit:"Zum Einreichen erforderlich?",
      defectSeverity:"Mangelschwergrad",conditionalDisplay:"Bedingte Anzeige",
      noConditional:"Keine anderen Fragen in diesem Abschnitt mit auswählbaren Antworten.",
      templateName:"Vorlagenname",vehicleAssignment:"Fahrzeugzuweisung",
      vehicleAssignmentDesc:"Eine Vorlage pro Fahrzeug. Die Zuweisung hier entfernt sie von der aktuellen Vorlage.",
      unassigned:"Nicht zugewiesen",sections:"Abschnitte",checks:"Prüfungen",vehicles:"Fahrzeuge",
      modified:"Geändert",actions:"Aktionen",untitled:"Ohne Titel",assign:"Zuweisen",
      totalCourses:"Gesamtkurse",completed:"Abgeschlossen",awaitingApproval:"Wartet auf Genehmigung",
      totalEnrolments:"Gesamte Einschreibungen",noEnrolments:"Noch keine Einschreibungen",
      back:"Zurück",publish:"Veröffentlichen",archive:"Archivieren",republish:"Erneut veröffentlichen",
      courseInformation:"Kursinformationen",completionSummary:"Abschlussübersicht",
      editCourseDetails:"Kursdetails bearbeiten",titleLabel:"Titel",passMarkPct:"Bestehensgrenze (%)",
      deadline:"Frist",assignTo:"Zuweisen an",allDrivers:"Alle Fahrer",specificDrivers:"Bestimmte Fahrer",
      autoApprove:"Automatisch genehmigen, wenn Fahrer besteht",saveDetails:"Details speichern",
      learningMaterials:"Lernmaterialien",addMaterial:"Material hinzufügen",
      addFirstMaterial:"Erstes Material hinzufügen",noMaterials:"Noch keine Materialien.",
      videoUrl:"Video-URL",pages:"Seiten",
      fileUploadNote:"Datei-Upload wird verfügbar sein, wenn mit dem Backend verbunden",
      quizQuestions:"Quizfragen",addQuestion:"Frage hinzufügen",addFirstQuestion:"Erste Frage hinzufügen",
      noQuestions:"Noch keine Fragen.",quizQuestionType:"Fragetyp",scorePts:"Punktzahl (Punkte)",questionText:"Fragetext",
      correctAnswer:"Richtige Antwort",trueFalse:"Wahr / Falsch",freeText:"Freitext (manuelle Bewertung)",
      multiChoiceSingle:"Multiple Choice (Einfachantwort)",multiChoiceMulti:"Multiple Choice (Mehrfachantwort)",
      sampleAnswer:"Beispielantwort",addOption:"Option hinzufügen",
      driverEnrolments:"Fahrer-Einschreibungen",
      noDriversEnrolled:"Noch keine Fahrer eingeschrieben. Veröffentlichen Sie den Kurs und weisen Sie Fahrer zu.",
      driverCol:"Fahrer",statusCol:"Status",attempts:"Versuche",bestScore:"Bestes Ergebnis",
      driverSigned:"Fahrer unterzeichnet",operatorSigned:"Betreiber unterzeichnet",actionCol:"Aktion",
      assessmentApproved:"Bewertung genehmigt",certFiled:"Zertifikat erstellt und in Fahrerdokumentation abgelegt.",
      assessmentRejected:"Bewertung abgelehnt",answerReview:"Antwortüberprüfung",scoreLabel:"Punktzahl",
      attemptsLabel:"Versuche",driverSignature:"Fahrerunterschrift",signedLabel:"Unterzeichnet",
      cancel:"Abbrechen",searchDocs:"Dokumente suchen...",searchCourses:"Kurse suchen...",antiCheatPhotoRequired:"📸 Screenshot erforderlich",antiCheatInstruction:"Foto / Screenshot des Bildschirms machen",backToChecks:"Zurück zu Prüfungen",backToEnrolments:"Zurück zu Anmeldungen",courseInfo:"Kursinformationen",editCourse:"Kursdetails bearbeiten",defectsReported:"Mängel gemeldet",defectsWorkshopNotified:"Werkstatt benachrichtigt",nilDefectCleared:"Kein Mangel freigegeben",noDefects:"Keine Mängel",ok:"OK",olicenceMargin:"O-Lizenz-Marge",passed:"Bestanden",photoRequired:"Foto erforderlich",photoRequiredDefect:"Foto erforderlich – Mangel",requiredQuestion:"Pflichtfeld",forsReadiness:"FORS-Bereitschaft",loadingCheckDetail:"Details werden geladen...",loadingDrivers:"Fahrer werden geladen...",loadingVehicles:"Fahrzeuge werden geladen...",signedOn:"Unterzeichnet am",suspiciousSpeed:"⚠️ Verdächtige Geschwindigkeit",vehiclesPending:"Fahrzeuge ausstehend",workshopNotified:"Werkstatt benachrichtigt",
      date:"Datum",na:"N/V",notConnected:"Nicht verbunden",integrations:"Integrationen",sent:"Gesendet",saving:"Speichern...",saved:"Gespeichert",saveChanges:"Änderungen speichern",
      action:"Aktion",apiErrorLocal:"Fehler (lokale Daten)",at:"um",certificate:"Zertifikat",details:"Details",edit:"Bearbeiten",rePublish:"Erneut veröffentlichen",review:"Überprüfen",sign:"Unterzeichnen",status:"Status",template:"Vorlage",
      reviewNote:"Antworten überprüfen, Freitextfragen bewerten, dann genehmigen oder ablehnen.",
    },
    drivers: {
      addTitle:"Fahrer hinzufügen", editTitle:"Fahrer bearbeiten",
      shiftPreference:"Schichtpräferenz", shiftNone:"Keine", shiftAllDays:"Alle Tage", shiftCustom:"Benutzerdefiniert",
      shiftStart:"Schichtbeginn", shiftEnd:"Schichtende",
      maxConsecDays:"Max. aufeinanderfolgend. Tage", maxTripsWeek:"Max. Fahrten / Woche",
      licenceNo:"Führerscheinnr.", noneSelected:"Keine Auswahl",
      statusActive:"Aktiv", statusInactive:"Inaktiv", statusPending:"Ausstehend", statusArchived:"Archiviert",
      noDriversFound:"Keine Fahrer gefunden.", nameRequired:"Fahrername ist erforderlich.",
      saveFailed:"Speichern fehlgeschlagen", statusUpdateFailed:"Statusaktualisierung fehlgeschlagen",
      retryLabel:"Erneut versuchen",
    },
    fleetManagement: {
      exceptionEvents:"Ausnahmeereignisse", engineDiagnostics:"Motordiagnostik", tripHistory:"Fahrtenverlauf",
      allFleets:"Alle Flotten", vehicles:"Fahrzeuge", drivers:"Fahrer", onShift:"Im Dienst",
      monthlyDistance:"Monatliche Distanz", fuelThisMonth:"Kraftstoff diesen Monat", newFleet:"Neue Flotte",
      vehicleLabel:"Fahrzeug", fleetLabel:"Flotte", yearLabel:"Jahr",
      mph:"mph", rpm:"rpm", driverSafetyScore:"Fahrer-Sicherheitsbewertung",
      critical:"Kritisch", warnings:"Warnungen", info:"Info",
      exceptionByType:"Ausnahmeereignisse nach Typ", noTripsToday:"Heute keine Fahrten aufgezeichnet.",
      liveDiagnostic:"Live-Diagnoseschnappschuss", avgSpd:"Durchschn. Tempo", endLabel:"Ende",
    },
    importHub: {
      autoImportEnabled:"Automatischer Import aktiviert", extensionNotDetected:"Erweiterung nicht erkannt",
      extensionActive:"Erweiterung aktiv",
      yourColumn:"Ihre Spalte", fleeyesField:"FleetYes-Feld",
      tripsToday:"Fahrten heute", lastSync:"Letzte Synchronisierung", primary:"Primär",
      universalActivityLog:"Universelles Aktivitätsprotokoll", viewLabel:"Ansehen",
      tripsImportedToday:"Heute importierte Fahrten", acrossAllProviders:"bei allen Anbietern",
      activeConnections:"Aktive Verbindungen", syncFailures:"Synchronisierungsfehler",
      providersConfigured:"Konfigurierte Anbieter", vendorGallery:"Anbieter-Integrationsgalerie",
    },
    orgSettings: {
      failedToLoad:"Einstellungen konnten nicht geladen werden", orgSettings:"Organisationseinstellungen",
      recordInfo:"Eintragsinformationen", drivingHours:"Fahrtstunden",
      workingHours:"Arbeitsstunden", myGeotab:"MyGeotab",
    },
  },

  // ── French ──────────────────────────────────────────────────────────────────
  fr: {
    nav: {
      dashboard:          "Tableau de bord",
      trips:              "Missions",
      rota:               "Planning hebdomadaire",
      importHub:          "Hub d'import",
      calendar:           "Calendrier",
      maintenanceTrips:   "Missions maintenance",
      drivers:            "Conducteurs",
      fleetManagement:    "Gestion de flotte",
      places:             "Lieux",
      fuelTracking:       "Suivi carburant",
      parkingMonitoring:  "Surveillance parking",
      tollExpenses:       "Frais de péage",
      tollReceipts:       "Reçus de péage",
      fuelReceipts:       "Reçus carburant",
      holidays:           "Congés & absences",
      offShift:           "Hors service",
      maintenance:        "Maintenance",
      compliance:         "Conformité",
      inventory:          "Inventaire",
      allocationSettings: "Paramètres d'affectation",
      groupTransport:     "Transport",
      groupExpenses:      "Coûts",
      groupPeople:        "Personnel",
      groupSettings:      "Paramètres",
      issues:             "Incidents",
      fuel:               "Carburant",
      toll:               "Péage",
    },
    topbar: {
      profile:    "Mon profil",
      settings:   "Paramètres",
      logout:     "Se déconnecter",
      lightMode:  "Clair",
      darkMode:   "Sombre",
      systemMode: "Système",
      language:   "Langue",
    },
    common: {
      save:"Enregistrer",cancel:"Annuler",upload:"Téléverser",download:"Télécharger",search:"Rechercher",new:"Nouveau",edit:"Modifier",delete:"Supprimer",submit:"Soumettre",back:"Retour",loading:"Chargement…",addVehicle:"Ajouter un véhicule",export:"Exporter",filter:"Filtrer",refresh:"Actualiser",active:"Actif",inactive:"Inactif",pending:"En attente",resolved:"Résolu",allVehicles:"Tous les véhicules",today:"Aujourd'hui",thisMonth:"Ce mois-ci",selectAll:"Tout sélectionner",tryAgain:"Réessayer",records:"entrées",noData:"Aucune donnée",
      date:"Date",vehicle:"Véhicule",driver:"Conducteur",status:"Statut",action:"Action",ref:"Réf",route:"Itinéraire",type:"Type",amount:"Montant",method:"Méthode",litres:"Litres",costPerLitre:"Coût/L",totalCost:"Coût total",odometer:"Compteur (km)",mpg:"L/100km",depot:"Dépôt",duration:"Durée",location:"Emplacement",cost:"Coût",fleet:"Flotte",name:"Nom",phone:"Téléphone",email:"Email",country:"Pays",licence:"Permis",notes:"Notes",
      view:"Voir",reconcile:"Rapprocher",addNew:"Ajouter",assign:"Affecter",approve:"Approuver",reject:"Rejeter",newCharge:"Nouveau frais",details:"Détails",close:"Fermer",
      createRecord:"Créer un enregistrement",saving:"Enregistrement…",creating:"Création…",
      clearAll:"Tout effacer",apply:"Appliquer",stats:"Statistiques",noRecordsFound:"Aucun enregistrement trouvé",
      dropFile:"Déposez un fichier ou cliquez pour parcourir",supports:"Prend en charge .xlsx, .xls, .csv",clickToChange:"cliquer pour changer",
      importComplete:"Importation terminée",importFailed:"Importation échouée",rowsImported:"importé(s)",rowsSkipped:"ignoré(s)",
      someRowsHadErrors:"Certaines lignes contiennent des erreurs",downloadErrorLog:"Télécharger le journal d\'erreur",tryAgainBtn:"Réessayer",
      all:"Tous",reconciled:"Rapproché",scheduled:"Planifié",dispatched:"Expédié",started:"Démarré",completed:"Terminé",cancelled:"Annulé",
      tripsToday:"Missions aujourd'hui",driversAvailable:"Conducteurs disponibles",fleetSize:"Taille de la flotte",thisWeek:"Cette semaine",available:"disponible(s)",onLeave:"en congé",noTripsToday:"Aucune mission aujourd'hui",nothingScheduled:"Rien de prévu aujourd'hui",createTrip:"Créer une mission →",driverStatus:"Statut conducteurs",allDrivers:"Tous les conducteurs",todaysTrips:"Missions du jour",weekAtGlance:"Semaine en un coup d'œil",vehicleDowntime:"Immobilisation véhicules",upcomingLeave:"Congés à venir",viewCalendar:"Voir le calendrier",manage:"Gérer",viewAll:"Tout voir",tripsMonSun:"missions lun–dim",active2:"actif(s)",done:"terminé(s)",awaitingDispatch:"En attente d'expédition",ofTotal:"sur {n} au total",vehiclesRegistered:"véhicules enregistrés",vehiclesOff:"{n} véhicule(s) absent(s) aujourd'hui",needsDriver:"{n} mission(s) sans conducteur",
      goodMorning:"Bonjour",goodAfternoon:"Bon après-midi",goodEvening:"Bonsoir",
      searchPlaceholder:"Rechercher…",searchVehicles:"Rechercher par immat., conducteur, dépôt…",searchDrivers:"Rechercher des conducteurs…",
      noDriverAssigned:"Aucun conducteur affecté",driverAssigned:"Conducteur affecté",ongoing:"En cours",noUpcomingDowntime:"Aucune immobilisation prévue",noUpcomingLeave:"Aucun congé dans les 7 prochains jours",consumptionByVehicle:"Consommation par véhicule (30 jours)",address:"Adresse",
      at:"à",for:"pour",of:"de",
    },
    pages: {
      dashboard:          { title: "Tableau de bord",              subtitle: "Votre résumé opérationnel du jour." },
      trips:              { title: "Missions",                     subtitle: "Gérer et suivre tous les ordres de transport." },
      rota:               { title: "Planning hebdomadaire",        subtitle: "Planifiez et gérez les affectations de conducteurs pour la semaine." },
      importHub:          { title: "Hub d'import",                 subtitle: "Contrôle central de toutes les connexions de données fournisseurs et importations manuelles." },
      calendar:           { title: "Calendrier",                   subtitle: "Visualisez et planifiez les missions dans le calendrier." },
      drivers:            { title: "Conducteurs",                  subtitle: "Gérer les profils, permis et conformité CPC des conducteurs." },
      fleetManagement:    { title: "Gestion de flotte",            subtitle: "Télématique en direct, diagnostics et administration — via l'API MyGeotab." },
      places:             { title: "Lieux",                        subtitle: "Gérer les dépôts, sites clients et arrêts fréquents." },
      fuelTracking:       { title: "Suivi carburant",              subtitle: "Surveiller la consommation, l'efficacité et les dépenses par véhicule." },
      parkingMonitoring:  { title: "Surveillance parking",         subtitle: "Suivre l'utilisation des parkings poids-lourds, coûts et sites approuvés." },
      tollExpenses:       { title: "Frais de péage",               subtitle: "Suivre les péages, ponts et tunnels de toute la flotte." },
      tollReceipts:       { title: "Reçus de péage",               subtitle: "Capture de reçus TVA pour les péages de la flotte." },
      fuelReceipts:       { title: "Reçus carburant",              subtitle: "Gestion et validation des reçus carburant récupérables en TVA." },
      holidays:           { title: "Congés & absences",            subtitle: "Gérer les congés annuels, arrêts maladie et absences formation." },
      offShift:           { title: "Hors service & repos",         subtitle: "Surveiller la conformité des temps de repos EU (min. 11h de repos quotidien)." },
      maintenance:        { title: "Hub maintenance",              subtitle: "Planifier et suivre l'entretien, réparations et contrôles des véhicules." },
      maintenanceTrips:   { title: "Missions maintenance",         subtitle: "Immobilisations et événements hors route depuis le calendrier." },
      compliance:         { title: "Hub conformité",               subtitle: "Gérer documents réglementaires, licences et préparation aux audits." },
      inventory:          { title: "Hub inventaire",               subtitle: "Suivre pièces, consommables et stocks dans tous les dépôts." },
      allocationSettings: { title: "Paramètres d'affectation",     subtitle: "Configurer les règles d'appariement conducteurs et l'affectation automatique." },
      vehicles:           { title: "Véhicules",                    subtitle: "Consulter et gérer le registre complet des véhicules." },
      fleets:             { title: "Flottes",                      subtitle: "Gérer vos groupes de flotte et affectations de conducteurs." },
      issues:             { title: "Incidents",                    subtitle: "Signaler et suivre les incidents véhicules, conducteurs et opérationnels." },
    },
    rota: {
      step1Label: "Chargement des conducteurs",     step1Detail: "Chargement des profils et des roulements",
      step2Label: "Récupération des congés",        step2Detail: "Vérification des congés approuvés et absences",
      step3Label: "Vérification des affectations", step3Detail: "Recherche des missions non affectées cette semaine",
      step4Label: "Construction du planning",      step4Detail: "Affectation des conducteurs à leurs missions, presque terminé…",
      workingDay: "Jour travaillé", restDay: "Jour de repos", holiday: "Congé",
      unavailable: "Indisponible", off: "Absent", notOnRota: "Non planifié",
      sun: "Dim", mon: "Lun", tue: "Mar", wed: "Mer", thu: "Jeu", fri: "Ven", sat: "Sam",
      allocationPeriod: "Période d'affectation", assignDriver: "Affecter un conducteur", assignTruck: "Affecter un tracteur",
      noRoute: "Sans itinéraire", history: "Historique", stats: "Statistiques", relay: "Transfert", add: "Ajouter",
      autoAllocate: "Affectation automatique", user: "Utilisateur", exportRelay: "Exporter le transfert",
      unassignedTrips: "MISSIONS NON AFFECTÉES", dragToAssign: "Glisser pour affecter",
      violations: "{n} infractions · {w} avertissement", warnings: "{w} avertissement", warningsLabel: "Avertissements", violationsLabel: "Violations",
      grid: "Grille", analysis: "Analyse",
      allCompliant: "Tous conformes", checkingCompliance: "Vérification de la conformité…",
      noUnassignedTrips: "Aucune mission non affectée",
      complianceReport: "Rapport de conformité", allClear: "Tout est en règle",
      noComplianceDesc: "Aucune violation ou avertissement de conformité détecté cette semaine. Tous les conducteurs respectent leurs heures autorisées.",
      issuesTab: "Problèmes", rulesRef: "Référence des règles",
      allocationBlocked: "Affectation bloquée", complianceViolationBlocked: "Une violation de conformité empêche cette affectation",
      understood: "Compris",
      reassignTitle: "Réaffecter", currentlyAssigned: "Actuellement affecté", willBeReplacedWith: "Sera remplacé par",
      existingTripUnassigned: "La mission existante sera désaffectée et renvoyée dans le pool non affecté.",
      driver: "Conducteur", hrs: "Hrs",
      complianceViolation: "Violation de conformité", complianceWarning: "Avertissement de conformité",
      complianceCompliant: "Conforme", driversWithIssues: "{n} conducteur avec des problèmes",
    },
    maintenance: {
      upcoming: "À venir", historical: "Historique",
      searchPlaceholder: "Chercher véhicule, raison…",
      records: "entrées", ofRecords: "sur",
      refresh: "Actualiser", export: "Exporter",
      colVehicle: "Véhicule", colDateRange: "Période", colDays: "Jours", colWhen: "Échéance",
      loading: "Chargement des événements de maintenance…", tryAgain: "Réessayer",
      noUpcoming: "Aucune maintenance à venir",      noUpcomingDesc: "Aucune immobilisation de véhicule n'est actuellement planifiée.",
      noHistorical: "Aucun historique",              noHistoricalDesc: "Aucun événement de maintenance passé trouvé.",
      statusActive: "Actif", statusUpcoming: "À venir", statusCompleted: "Terminé",
      today: "Aujourd'hui", inDays: "Dans {n}j", daysAgo: "Il y a {n}j", durationDays: "{n}j",
    },
    maintenanceHub: {
      tabDashboard: "Tableau de bord", tabPMI: "Fiche PMI", tabDefects: "Défauts", tabSettings: "Paramètres",
      kpiVOR: "VOR (Hors route)", kpiVORSub: "véhicules immobilisés",
      kpiDueSoon: "Échéance sous 7 jours", kpiDueSoonSub: "réservation nécessaire",
      kpiCompliant: "Entièrement conforme", kpiCompliantSub: "véhicules au vert",
      kpiPMIRate: "Taux PMI dans les délais", kpiPMIRateSub: "Objectif DVSA : 100 %",
      earnedRecognition: "KPIs Reconnaissance méritée", dvsaScheme: "Programme DVSA", target: "Objectif : {n} %",
      fleetStatusBoard: "Tableau d’état de flotte", compliant: "Conforme", dueSoon: "Bientôt dû", overdueVOR: "En retard/VOR",
      pmiSchedule: "Planning PMI 8 semaines", noPMIsDue: "Aucun PMI prévu",
      driver: "Conducteur", nextPMI: "Prochain PMI", daysOverdue: "{n}j de retard", dueToday: "Dû aujourd’hui", dueIn: "Dû dans {n}j",
      pmiSheet: "Planning PMI — Tous les véhicules", allVehicles: "Tous les véhicules", clickToInspect: "Cliquer sur une ligne pour ouvrir la fiche d’inspection",
      inspectionProgress: "Progression de l’inspection", itemsCompleted: "Éléments complétés", results: "Résultats", location: "Lieu", interval: "Intervalle",
      technicianDecl: "Déclaration du technicien", sign: "Signer", signed: "Signé", signFirst: "Signer la déclaration ci-dessus pour activer la soumission.",
      submitPMI: "Soumettre le rapport PMI", pmiSubmitted: "PMI soumis", backToSchedule: "← Retour au planning",
      brakeTest: "Résultats du test de freinage (requis DVSA)", axle1: "Efficacité essieu 1 (%)", axle2: "Efficacité essieu 2 (%)",
      meetsDVSA: "✓ Conforme au minimum DVSA (50 %)", belowDVSA: "✗ Inférieur au minimum DVSA – ÉCHEC",
      openDefects: "Défauts ouverts", resolved: "Résolu", totalDefects: "Total défauts",
      requiresAction: "action requise", completed: "terminé", allTime: "total",
      rectificationRecord: "Fiche de rectification", partsUsed: "Pièces utilisées :", labour: "Main-d’œuvre :", signedOffBy: "Validé par :",
      logRectification: "Enregistrer la rectification", markRoadworthy: "Marquer apte à la route & Valider", signedOffRoadworthy: "✓ Validé apte à la route",
      vehicleProfiles: "Profils de véhicule", addVehicle: "Ajouter un véhicule", userRolesPerms: "Rôles & permissions utilisateurs", inviteUser: "Inviter un utilisateur",
      notificationEngine: "Moteur de notifications", customChecklist: "Éléments de liste personnalisée", addItem: "Ajouter un élément", remove: "Supprimer",
      dataExport: "Export des données & intégrations", vorAlert: "{n} véhicule{s} hors route", schedule: "← Planning",
      pass: "P", advisory: "A", fail: "F",
    },
    issues: {
      newIssue: "Nouvel incident", critical: "Critique", high: "Élevé", medium: "Moyen", low: "Faible",
      inProgress: "En cours", open: "Ouvert", report: "Signalement", priority: "Priorité",
      assignee: "Responsable", backlogged: "En attente", requiresUpdate: "Mise à jour requise",
      inReview: "En révision", saveChanges: "Enregistrer", createIssue: "Créer l'incident",
      unassigned: "Non affecté",
      type: "Type", category: "Catégorie", assignedTo: "Assigné à", reportedBy: "Rapporté par",
      incidentLocation: "Lieu de l'incident", pinLocation: "Épingler le lieu", hideMap: "Masquer la carte",
      noLocationPinned: "Aucun lieu épinglé \u2014 cliquez sur «Épingler le lieu» pour placer un marqueur",
      scheduledMaintenance: "Maintenance programmée", pending: "En attente", closed: "Fermé",
      pickTypFirst: "Choisir le type d'abord", selectCategory: "Sélectionner\u2026",
    },
    trips: {
      tripId: "ID mission", tripStatus: "Statut mission", tractor: "Tracteur",
      facilitySequence: "Séquence sites", estEndTime: "Fin estimée",
      dragToAssign: "Glisser pour affecter", unassignedTrips: "MISSIONS NON AFFECTÉES",
      saveChanges: "Enregistrer les modifications", createIssue: "Créer un incident", newIssue: "Nouvel incident",
    },
    calendar: {
      created: "Créé", driverUnavailable: "Conducteur indisponible", assigned: "Affecté",
      unassigned: "Non affecté", estEnd: "Fin est.", destination: "Destination",
      month: "Mois", week: "Semaine", day: "Jour", allDrivers: "Tous les conducteurs",
      allVehicles: "Tous les véhicules", vehicleOff: "Veh. absent", fullyAssigned: "Entièrement affecté",
      noVehicle: "Sans véhicule", noDriver: "Sans conducteur", orders: "Commandes", driverOff: "Conducteur absent",
    },
    fuelTracking: {
      expense: "Dépense", addExpense: "Ajouter une dépense", inclVat: "TVA incluse",
      volume: "Volume", payment: "Paiement", card: "Carte",
      noExpenses: "Aucune dépense carburant trouvée", stats: "Statistiques",
      totalRecords: "Total entrées", pendingApproval: "En attente d'approbation", approved: "Approuvé",
      filters: "Filtres", searchPlaceholder: "Rechercher véhicule, conducteur…",
    },
    fuelReceipts: {
      captured:"Capturé", supplier:"Fournisseur", product:"Produit",
      duplicate:"Doublon", receipt:"Reçu", uploadZip:"Importer ZIP",
      searchPlaceholder:"Rechercher par véhicule, fournisseur…",
      addModalTitle:"Ajouter des reçus carburant",
      addModalSubtitle:"Déposez des images ou PDFs — ils seront compressés et envoyés automatiquement en OCR",
      dropTitle:"Glisser & déposer les reçus ici", dropActive:"Déposer pour ajouter",
      dropHint:"ou cliquer pour parcourir · JPEG, PNG, WebP, PDF",
      filesSelected:"{n} fichier{s} sélectionné{s}",
      stepZipping:"Compression", stepUploading:"Téléversement",
      stepImporting:"Importation", stepProcessing:"Traitement OCR",
      progressZipping:"Compression de {n} fichier{s}…", progressUploading:"Téléversement vers le serveur…",
      progressImporting:"Importation des reçus…", progressProcessing:"Traitement OCR en cours…",
      processingNote:"Cela peut prendre un moment pour les grands lots",
      successTitle:"Téléversement & traitement terminés", successCount:"{n} reçu{s} importé{s}",
      errorTitle:"Téléversement échoué",
      btnAdd:"Ajouter", btnUpload:"Téléverser {n} fichier{s}", btnDone:"Terminé — Actualiser la liste",
      btnTryAgain:"Réessayer", btnClose:"Fermer",
      filterTitle:"Filtrer les reçus", anyDriver:"Tout conducteur", anyStatus:"Tout statut",
      capturedFrom:"Capturé depuis", capturedTo:"Capturé jusqu'au",
      detailTitle:"Détail du reçu carburant", ocrData:"Données extraitées OCR", rawText:"Texte brut",
      colOcrStatus:"Statut OCR", colCapturedAt:"Capturé le",
    },
    parking: {
      pageOf: "Page", searchPlaceholder: "Rechercher véhicule, emplacement…",
    },
    tollReceipts: {
      upload:"Téléverser", entryPoint:"Point d'entrée", exitPoint:"Point de sortie",
      vehicleClass:"Classe de véhicule", searchPlaceholder:"Rechercher véhicule, itinéraire…",
      addModalTitle:"Ajouter des reçus de péage",
      addModalSubtitle:"Déposez des images ou PDFs — ils seront compressés et envoyés automatiquement en OCR",
      dropTitle:"Glisser & déposer les reçus ici", dropActive:"Déposer pour ajouter",
      dropHint:"ou cliquer pour parcourir · JPEG, PNG, WebP, PDF",
      filesSelected:"{n} fichier{s} sélectionné{s}",
      stepZipping:"Compression", stepUploading:"Téléversement",
      stepImporting:"Importation", stepProcessing:"Traitement OCR",
      progressZipping:"Compression de {n} fichier{s}…", progressUploading:"Téléversement vers le serveur…",
      progressImporting:"Importation des reçus…", progressProcessing:"Traitement OCR en cours…",
      processingNote:"Cela peut prendre un moment pour les grands lots",
      successTitle:"Téléversement & traitement terminés", successCount:"{n} reçu{s} importé{s}",
      errorTitle:"Téléversement échoué",
      btnAdd:"Ajouter", btnUpload:"Téléverser {n} fichier{s}", btnDone:"Terminé — Actualiser la liste",
      btnTryAgain:"Réessayer", btnClose:"Fermer",
      filterTitle:"Filtrer les reçus", anyDriver:"Tout conducteur", anyStatus:"Tout statut",
      capturedFrom:"Capturé depuis", capturedTo:"Capturé jusqu'au",
      sendTitle:"Envoyer à Amazon", sendSubtitle:"Soumettre les péages à Amazon Relay pour la période sélectionnée",
      sendFromDate:"Date de début", sendToDate:"Date de fin",
      sendPreviewBtn:"Aperçu avant envoi", sendDownloading:"Téléchargement…",
      sendBtn:"Envoyer à Amazon Relay", sendSending:"Envoi en cours.",
      sendWarning:"Tous les péages traités dans la plage de dates sélectionnée seront soumis à Amazon Relay.",
      sendSuccess:"Soumis avec succès",
      sendSuccessMsg:"Les péages ont été envoyés à Amazon Relay.",
      colChargeEx:"Frais (HT)", colVat:"TVA",
      colChargeInc:"Frais (TTC)", colProcessingStatus:"Statut de traitement",
    },
    holidays: {
      reason: "Motif", start: "Début", end: "Fin", days: "Jours",
      newEntry: "Nouvelle entrée", searchPlaceholder: "Rechercher conducteur, motif…",
      leaveTypes: { "Annual Leave": "Congé annuel", sick: "Congé maladie", Vacation: "Vacances", Other: "Autre" },
    },
    offShift: {
      cycle: "Cycle", firstLeaveDay: "Premier jour de congé", planUntil: "Planifier jusqu'au",
      searchPlaceholder: "Rechercher conducteur…",
    },
    vehicles: {
      year: "Année", lastPmi: "Dernier CT", tachographCal: "Étalonnage tachygraphe",
      searchPlaceholder: "Rechercher par immat., dépôt…", addVehicle: "Ajouter un véhicule",
    },
    places: {
      list: "Liste", map: "Carte", city: "Ville", postalCode: "Code postal",
      depotMap: "Carte des dépôts", plotted: "Affichés", pageSize: "Taille de page",
      searchPlaceholder: "Rechercher des lieux…", addPlace: "Ajouter un lieu",
      code: "Code / Identifiant", address: "Adresse", stateCounty: "Région / Département", country: "Pays",
    },
    login: {
      tagline:       "Conformité & Gestion de flotte",
      signIn:        "Connexion",
      signInDesc:    "Saisissez vos identifiants pour accéder à la plateforme",
      emailLabel:    "Adresse e-mail",
      emailPlaceholder: "vous@entreprise.fr",
      passwordLabel: "Mot de passe",
      rememberMe:    "Se souvenir de moi",
      forgotPassword:"Mot de passe oublié ?",
      submit:        "Se connecter",
      submitting:    "Connexion en cours…",
      resetTitle:    "Réinitialiser le mot de passe",
      resetDesc:     "Saisissez votre e-mail et nous vous enverrons un lien de réinitialisation.",
      sendLink:      "Envoyer le lien",
      sending:       "Envoi en cours…",
      backToSignIn:  "← Retour à la connexion",
      checkInbox:    "Vérifiez votre boîte mail",
      checkInboxDesc:"Si {email} est enregistré, vous recevrez un lien de réinitialisation.",
      errorDefault:  "Échec de la connexion. Vérifiez vos identifiants et réessayez.",
    },
    inventoryHub: {
      tabDashboard:"Tableau de bord",tabParts:"Pièces",tabJobCards:"Ordres de travail",tabPurchasing:"Achats",tabTyres:"Pneus & Fluides",
      totalStockValue:"Valeur totale du stock",stockoutVOR:"Risque VOR",lowStockParts:"Pièces en stock bas",deadStock:"Stock dormant (>12m)",
      reorderAlerts:"Alertes de réapprovisionnement",stockValueByCategory:"Valeur du stock par catégorie",recentMovements:"Mouvements de stock récents",
      safetyCritical:"SÉCURITÉ CRITIQUE",addPart:"Ajouter une pièce",scan:"Scanner",adjust:"Ajuster",
      partsIssued:"Pièces émises",scanPart:"Scanner la pièce",issueKit:"Livrer un kit",newJobCard:"Nouvel ordre de travail",
      openPOs:"OA ouverts",autoReorder:"Réapprovisionnement à faire",coreReturns:"Retours noyau €",raisePO:"Créer OA",raiseAllPOs:"Créer tous les OA",
      newPO:"Nouvel OA",purchaseOrders:"Commandes d'achat",autoReorderSuggestions:"Suggestions de réapprovisionnement",
      tyresToReplace:"Pneus à remplacer",advisoryTyres:"Pneus sous surveillance",tyresTracked:"Pneus suivis",
      tyreManagement:"Gestion des pneus",fitTyre:"Monter un pneu",bulkFluidDispensing:"Distribution de fluides en vrac",
      dispense:"Distribuer",confirm:"Confirmer",issuePMIKit:"Livrer kit PMI",stockout:"Rupture",reorder:"Réapprovisionner",
    },
    complianceHub: {
      tabWalkaround:"Tour de véhicule",tabDrivers:"Conducteurs",tabDocuments:"Documents",tabPlanner:"Planificateur",
      tabTraining:"Formation",tabFleet:"Flotte",tabAudit:"Journal d'audit",tabSettings:"Paramètres",
      newWalkaround:"Nouveau contrôle du tour de véhicule",walkaroundSubmitted:"Tour de véhicule soumis",
      noVehiclesFound:"Aucun véhicule trouvé",noDriversFound:"Aucun conducteur trouvé",
      timerLocation:"Minuteur / Localisation",todayPhotograph:"Aujourd'hui vous devez photographier :",takePhoto:"Prendre une photo",
      advisory:"Avis",pass:"Réussi",fail:"Échec",yes:"Oui",
      driverDeclaration:"Déclaration & signature du conducteur",
      driverDeclarationText:"Je déclare avoir effectué le contrôle quotidien requis du véhicule identifié ci-dessus et qu'il est, à ma connaissance, sûr pour circuler sur la voie publique.",
      signedBy:"Signé par",submitWalkaround:"Soumettre le contrôle",
      checkSummary:"Résumé du contrôle",duration:"Durée",results:"Résultats",antiCheatPhoto:"Photo anti-triche",dangerous:"Dangereux",
      checksCompletedToday:"Contrôles effectués aujourd'hui",defectsReportedToday:"Défauts signalés aujourd'hui",
      avgCheckTime:"Temps moyen de contrôle",dvsaMinimum:"Minimum DVSA : 5 min",
      recentWalkarounds:"Contrôles récents",noWalkarounds:"Aucun contrôle de tour de véhicule trouvé.",
      nilDefect:"Aucun défaut",unableToLoad:"Impossible de charger le détail du contrôle.",
      dvlaLicence:"Permis DVLA",refresh:"Actualiser",davisRiskScore:"Score de risque DAVIS",entitlements:"Droits",
      noEndorsements:"Aucune mention enregistrée. Permis propre confirmé par la DVLA.",
      driverCPC:"CPC conducteur",dqc:"DQC",progress:"Progression",modules:"Modules",outstanding:"En attente",
      logCourse:"Enregistrer le cours terminé",previousCycle:"Cycle précédent (5 ans avant)",
      addRecord:"Ajouter un enregistrement",noTraining:"Aucun dossier de formation.",noExpiry:"Pas de date d'expiration",
      visaExpiry:"Expiration du visa",uploadPassport:"Télécharger passeport / scan BRP",
      auditTrail:"Journal d'audit",exportCsv:"Exporter CSV",allCategories:"Toutes catégories",
      allActions:"Toutes actions",allUsers:"Tous utilisateurs",before:"Avant",after:"Après",
      noEvents:"Aucun événement ne correspond à vos filtres.",
      expired:"Expiré",expiringWithin90:"Expire dans 90 jours",noDateSet:"Aucune date définie",
      bothPartiesSigned:"Les deux parties ont signé",multipleDocuments:"Plusieurs documents",
      clickToEdit:"Cliquez sur une cellule pour modifier",noExpiries:"Aucune date d'expiration enregistrée.",showAll:"Tout afficher",
      documentType:"Document",driverVehicle:"Conducteur / Véhicule",expiry:"Expiration",
      pmiBoard:"Planificateur de maintenance préventive",bookIn:"Réserver",
      complianceManager:"Responsable conformité",noManagerCandidates:"Aucun candidat responsable trouvé via l'API",
      olicenceMarginsChecker:"Vérificateur de marge O-Licence",
      tachoInfringements:"Infractions tachygraphe & WTD",tachoIntegration:"Intégré via TruTac / Descartes API",
      accidentLog:"Journal d'accidents & incidents (FNOL)",reportAccident:"Signaler un accident",
      downloadFnol:"Télécharger le rapport FNOL",forsReport:"Rapport FORS / DVSA Earned Recognition",
      generateReport:"Générer un rapport",reportAccidentFnol:"Signaler un accident (FNOL)",
      attachPhotos:"Joindre des photos de scène",
      notificationChannels:"Canaux de notification",emailChannel:"E-mail",
      mobileNotification:"Notification mobile",dailyDigest:"Résumé quotidien",
      operationalEvents:"Événements opérationnels",deliverAt:"Livrer à",expiryAlerts:"Alertes d'expiration",
      alertLabel:"Alerte",early:"Tôt",remind:"Rappeler",off:"Désactivé",instant:"Instantané",
      allSettingsSaved:"Tous les paramètres sauvegardés",unsavedChanges:"Modifications non sauvegardées",reset:"Réinitialiser",
      highRisk:"Risque élevé",cpcCritical:"CPC critique",checksDue:"Contrôles à faire",
      rtwExpiring:"RTW expirant",disqualified:"Disqualifié",
      motExpiring:"CT ≤90j",tachoCal:"Cal. tacho ≤90j",lolerDue:"LOLER à faire ≤90j",
      fullyClear:"Tout en règle",overdueVor:"En retard / VOR",dueWithin7:"À faire dans 7 jours",
      pmiOnTime:"Taux de ponctualité PMI",
      expiredOverdue:"Expiré / En retard",expiringSoon:"Expire bientôt",awaitingSignatures:"En attente de signatures",
      documentDetails:"Détails du document",editDocument:"Modifier le document",file:"Fichier",
      noFileAttached:"Aucun fichier joint",counterSigned:"Contresigné",signed:"Signé",uploaded:"Téléversé",
      documentTitle:"Titre du document",category:"Catégorie",newCategory:"Nom de la nouvelle catégorie",
      description:"Description",notes:"Notes",
      walkaroundTemplates:"Modèles de tour de véhicule",
      walkaroundTemplatesDesc:"Créez des modèles de contrôle configurables avec types de questions, photos obligatoires et logique conditionnelle. Assignez par véhicule.",
      helpText:"Texte d'aide",questionType:"Type de question",dropdownOptions:"Options de liste déroulante",
      unitLabel:"Étiquette d'unité",requiredToSubmit:"Obligatoire pour soumettre ?",
      defectSeverity:"Gravité du défaut",conditionalDisplay:"Affichage conditionnel",
      noConditional:"Aucune autre question dans ce bloc avec réponses sélectionnables.",
      templateName:"Nom du modèle",vehicleAssignment:"Affectation du véhicule",
      vehicleAssignmentDesc:"Un modèle par véhicule. L'affecter ici le supprime du modèle actuel.",
      unassigned:"Non affecté",sections:"Sections",checks:"Contrôles",vehicles:"Véhicules",
      modified:"Modifié",actions:"Actions",untitled:"Sans titre",assign:"Affecter",
      totalCourses:"Total des cours",completed:"Terminé",awaitingApproval:"En attente d'approbation",
      totalEnrolments:"Total des inscriptions",noEnrolments:"Aucune inscription",
      back:"Retour",publish:"Publier",archive:"Archiver",republish:"Rep publier",
      courseInformation:"Informations du cours",completionSummary:"Résumé de complétion",
      editCourseDetails:"Modifier les détails du cours",titleLabel:"Titre",passMarkPct:"Note de passage (%)",
      deadline:"Date limite",assignTo:"Assigner à",allDrivers:"Tous les conducteurs",specificDrivers:"Conducteurs spécifiques",
      autoApprove:"Approuver auto. lorsque le conducteur réussit",saveDetails:"Enregistrer les détails",
      learningMaterials:"Matériaux pédagogiques",addMaterial:"Ajouter du matériel",
      addFirstMaterial:"Ajouter le premier matériel",noMaterials:"Aucun matériel pour l'instant.",
      videoUrl:"URL vidéo",pages:"Pages",
      fileUploadNote:"Le téléversement de fichiers sera disponible lors de la connexion au serveur",
      quizQuestions:"Questions du quiz",addQuestion:"Ajouter une question",addFirstQuestion:"Ajouter la première question",
      noQuestions:"Aucune question pour l'instant.",quizQuestionType:"Type de question",scorePts:"Score (points)",questionText:"Texte de la question",
      correctAnswer:"Réponse correcte",trueFalse:"Vrai / Faux",freeText:"Texte libre (correction manuelle)",
      multiChoiceSingle:"Choix multiples (réponse unique)",multiChoiceMulti:"Choix multiples (plusieurs réponses)",
      sampleAnswer:"Réponse exemple",addOption:"Ajouter une option",
      driverEnrolments:"Inscriptions des conducteurs",
      noDriversEnrolled:"Aucun conducteur inscrit. Publiez le cours et assignez des conducteurs.",
      driverCol:"Conducteur",statusCol:"Statut",attempts:"Tentatives",bestScore:"Meilleur score",
      driverSigned:"Conducteur signé",operatorSigned:"Opérateur signé",actionCol:"Action",
      assessmentApproved:"Évaluation approuvée",certFiled:"Certificat généré et classé dans les documents du conducteur.",
      assessmentRejected:"Évaluation rejetée",answerReview:"Révision des réponses",scoreLabel:"Score",
      attemptsLabel:"Tentatives",driverSignature:"Signature du conducteur",signedLabel:"Signé",
      cancel:"Annuler",searchDocs:"Rechercher des documents...",searchCourses:"Rechercher des cours...",antiCheatPhotoRequired:"📸 Capture d'écran requise",antiCheatInstruction:"Prenez une photo / capture d'écran de votre écran",backToChecks:"Retour aux contrôles",backToEnrolments:"Retour aux inscriptions",courseInfo:"Informations sur le cours",editCourse:"Modifier les détails du cours",defectsReported:"Défauts signalés",defectsWorkshopNotified:"Atelier notifié",nilDefectCleared:"Sans défaut validé",noDefects:"Aucun défaut",ok:"OK",olicenceMargin:"Marge de licence O",passed:"Réussi",photoRequired:"Photo requise",photoRequiredDefect:"Photo requise – défaut",requiredQuestion:"Obligatoire",forsReadiness:"Préparation FORS",loadingCheckDetail:"Chargement des détails...",loadingDrivers:"Chargement des conducteurs...",loadingVehicles:"Chargement des véhicules...",signedOn:"Signé le",suspiciousSpeed:"⚠️ Vitesse suspecte",vehiclesPending:"Véhicules en attente",workshopNotified:"Atelier notifié",
      date:"Date",na:"N/A",notConnected:"Non connecté",integrations:"Intégrations",sent:"Envoyé",saving:"Enregistrement...",saved:"Enregistré",saveChanges:"Enregistrer les modifications",
      action:"Action",apiErrorLocal:"Erreur (données locales)",at:"à",certificate:"Certificat",details:"Détails",edit:"Modifier",rePublish:"Republier",review:"Réviser",sign:"Signer",status:"Statut",template:"Modèle",
      reviewNote:"Révisez les réponses, notez les questions de texte libre, puis approuvez ou rejetez.",
    },
    drivers: { addTitle:"Ajouter un conducteur", editTitle:"Modifier le conducteur", shiftPreference:"Preference de decalage", shiftNone:"Aucun", shiftAllDays:"Tous les jours", shiftCustom:"Personnalise", shiftStart:"Debut du decalage", shiftEnd:"Fin du decalage", maxConsecDays:"Max jours consecutifs", maxTripsWeek:"Max trajets / semaine", licenceNo:"No de permis", noneSelected:"Aucune selection", statusActive:"Actif", statusInactive:"Inactif", statusPending:"En attente", statusArchived:"Archive", noDriversFound:"Aucun conducteur trouve.", nameRequired:"Le nom du conducteur est requis.", saveFailed:"Enregistrement echoue", statusUpdateFailed:"Mise a jour du statut echouee", retryLabel:"Reessayer" },
    fleetManagement: { exceptionEvents:"Evenements exceptionnels", engineDiagnostics:"Diagnostics moteur", tripHistory:"Historique des trajets", allFleets:"Toutes les flottes", vehicles:"Vehicules", drivers:"Conducteurs", onShift:"En service", monthlyDistance:"Distance mensuelle", fuelThisMonth:"Carburant ce mois", newFleet:"Nouvelle flotte", vehicleLabel:"Vehicule", fleetLabel:"Flotte", yearLabel:"Annee", mph:"mph", rpm:"rpm", driverSafetyScore:"Score de securite conducteur", critical:"Critique", warnings:"Avertissements", info:"Info", exceptionByType:"Evenements par type", noTripsToday:"Aucun trajet enregistre aujourd hui.", liveDiagnostic:"Instantane de diagnostic en direct", avgSpd:"Vit. moy.", endLabel:"Fin" },
    importHub: { autoImportEnabled:"Import automatique active", extensionNotDetected:"Extension non detectee", extensionActive:"Extension active", yourColumn:"Votre colonne", fleeyesField:"Champ FleetYes", tripsToday:"Trajets aujourd hui", lastSync:"Derniere sync.", primary:"Principal", universalActivityLog:"Journal d activite universel", viewLabel:"Afficher", tripsImportedToday:"Trajets importes aujourd hui", acrossAllProviders:"chez tous les fournisseurs", activeConnections:"Connexions actives", syncFailures:"Echecs de synchronisation", providersConfigured:"Fournisseurs configures", vendorGallery:"Galerie d integrations fournisseurs" },
    orgSettings: { failedToLoad:"Impossible de charger les parametres", orgSettings:"Parametres de l organisation", recordInfo:"Informations de l enregistrement", drivingHours:"Heures de conduite", workingHours:"Heures de travail", myGeotab:"MyGeotab" },
  },

  // ── Spanish ─────────────────────────────────────────────────────────────────
  es: {
    nav: {
      dashboard:          "Panel",
      trips:              "Servicios",
      rota:               "Planificación semanal",
      importHub:          "Centro de importación",
      calendar:           "Calendario",
      maintenanceTrips:   "Servicios de mantenimiento",
      drivers:            "Conductores",
      fleetManagement:    "Gestión de flota",
      places:             "Lugares",
      fuelTracking:       "Control de combustible",
      parkingMonitoring:  "Supervisión de aparcamiento",
      tollExpenses:       "Gastos de peaje",
      tollReceipts:       "Recibos de peaje",
      fuelReceipts:       "Recibos de combustible",
      holidays:           "Vacaciones y ausencias",
      offShift:           "Fuera de turno",
      maintenance:        "Mantenimiento",
      compliance:         "Cumplimiento",
      inventory:          "Inventario",
      allocationSettings: "Configuración de asignación",
      groupTransport:     "Transporte",
      groupExpenses:      "Costes",
      groupPeople:        "Personal",
      groupSettings:      "Configuración",
      issues:             "Incidencias",
      fuel:               "Combustible",
      toll:               "Peaje",
    },
    topbar: {
      profile:    "Mi perfil",
      settings:   "Configuración",
      logout:     "Cerrar sesión",
      lightMode:  "Claro",
      darkMode:   "Oscuro",
      systemMode: "Sistema",
      language:   "Idioma",
    },
    common: {
      save:"Guardar",cancel:"Cancelar",upload:"Subir",download:"Descargar",search:"Buscar",new:"Nuevo",edit:"Editar",delete:"Eliminar",submit:"Enviar",back:"Volver",loading:"Cargando…",addVehicle:"Añadir vehículo",export:"Exportar",filter:"Filtrar",refresh:"Actualizar",active:"Activo",inactive:"Inactivo",pending:"Pendiente",resolved:"Resuelto",allVehicles:"Todos los vehículos",today:"Hoy",thisMonth:"Este mes",selectAll:"Seleccionar todo",tryAgain:"Reintentar",records:"registros",noData:"Sin datos",
      date:"Fecha",vehicle:"Vehículo",driver:"Conductor",status:"Estado",action:"Acción",ref:"Ref",route:"Ruta",type:"Tipo",amount:"Importe",method:"Método",litres:"Litros",costPerLitre:"Coste/L",totalCost:"Coste total",odometer:"Cuentakilómetros",mpg:"L/100km",depot:"Base",duration:"Duración",location:"Ubicación",cost:"Coste",fleet:"Flota",name:"Nombre",phone:"Teléfono",email:"Correo",country:"Pais",licence:"Permiso",notes:"Notas",
      view:"Ver",reconcile:"Conciliar",addNew:"Añadir",assign:"Asignar",approve:"Aprobar",reject:"Rechazar",newCharge:"Nuevo cargo",details:"Detalles",close:"Cerrar",
      createRecord:"Crear registro",saving:"Guardando…",creating:"Creando…",
      clearAll:"Limpiar todo",apply:"Aplicar",stats:"Estadísticas",noRecordsFound:"No se encontraron registros",
      dropFile:"Arrastra un archivo o haz clic para buscar",supports:"Compatible con .xlsx, .xls, .csv",clickToChange:"clic para cambiar",
      importComplete:"Importación completada",importFailed:"Importación fallida",rowsImported:"importado(s)",rowsSkipped:"omitido(s)",
      someRowsHadErrors:"Algunas filas tenían errores",downloadErrorLog:"Descargar registro de errores",tryAgainBtn:"Reintentar",
      all:"Todos",reconciled:"Conciliado",scheduled:"Programado",dispatched:"Despachado",started:"Iniciado",completed:"Completado",cancelled:"Cancelado",
      tripsToday:"Servicios hoy",driversAvailable:"Conductores disponibles",fleetSize:"Tamaño de flota",thisWeek:"Esta semana",available:"disponible(s)",onLeave:"con permiso",noTripsToday:"Sin servicios hoy",nothingScheduled:"Nada programado para hoy",createTrip:"Crear servicio →",driverStatus:"Estado de conductores",allDrivers:"Todos los conductores",todaysTrips:"Servicios de hoy",weekAtGlance:"Semana de un vistazo",vehicleDowntime:"Tiempo de inactividad",upcomingLeave:"Permisos próximos",viewCalendar:"Ver calendario",manage:"Gestionar",viewAll:"Ver todo",tripsMonSun:"servicios lun–dom",active2:"activo(s)",done:"hecho(s)",awaitingDispatch:"Esperando despacho",ofTotal:"de {n} en total",vehiclesRegistered:"vehículos registrados",vehiclesOff:"{n} vehículo(s) fuera hoy",needsDriver:"{n} servicio(s) sin conductor",
      goodMorning:"Buenos días",goodAfternoon:"Buenas tardes",goodEvening:"Buenas noches",
      searchPlaceholder:"Buscar…",searchVehicles:"Buscar por matrícula, conductor, base…",searchDrivers:"Buscar conductores…",
      noDriverAssigned:"Sin conductor asignado",driverAssigned:"Conductor asignado",ongoing:"En curso",noUpcomingDowntime:"Sin inactividad prevista",noUpcomingLeave:"Sin permisos en los próximos 7 días",consumptionByVehicle:"Consumo por vehículo (30 días)",address:"Dirección",
      at:"a las",for:"para",of:"de",
    },
    pages: {
      dashboard:          { title: "Panel",                        subtitle: "Tu resumen operativo del día." },
      trips:              { title: "Servicios",                    subtitle: "Gestionar y supervisar todos los pedidos de transporte." },
      rota:               { title: "Planificación semanal",        subtitle: "Planifica y gestiona las asignaciones de conductores para la semana." },
      importHub:          { title: "Centro de importación",        subtitle: "Control centralizado de todas las conexiones de datos de proveedores e importaciones manuales." },
      calendar:           { title: "Calendario",                   subtitle: "Ver y programar servicios en el calendario." },
      drivers:            { title: "Conductores",                  subtitle: "Gestionar perfiles de conductores, licencias y conformidad CPC." },
      fleetManagement:    { title: "Gestión de flota",             subtitle: "Telemática en vivo, diagnósticos y administración — con la API de MyGeotab." },
      places:             { title: "Lugares",                      subtitle: "Gestionar bases, instalaciones de clientes y paradas frecuentes." },
      fuelTracking:       { title: "Control de combustible",       subtitle: "Supervisar el consumo, la eficiencia y el gasto por vehículo." },
      parkingMonitoring:  { title: "Supervisión de aparcamiento",  subtitle: "Seguimiento del uso de aparcamientos de camiones, costes y ubicaciones aprobadas." },
      tollExpenses:       { title: "Gastos de peaje",              subtitle: "Registrar peajes, puentes y túneles de toda la flota." },
      tollReceipts:       { title: "Recibos de peaje",             subtitle: "Captura de recibos de IVA para peajes de la flota." },
      fuelReceipts:       { title: "Recibos de combustible",       subtitle: "Gestión y aprobación de recibos de combustible recuperables a efectos de IVA." },
      holidays:           { title: "Vacaciones y ausencias",       subtitle: "Gestionar vacaciones anuales, bajas por enfermedad y ausencias de formación." },
      offShift:           { title: "Fuera de turno y descanso",    subtitle: "Supervisar el cumplimiento del descanso de conductores según la normativa EU (mín. 11h diarias)." },
      maintenance:        { title: "Hub de mantenimiento",         subtitle: "Programar y hacer seguimiento del mantenimiento, reparaciones e inspecciones." },
      maintenanceTrips:   { title: "Servicios de mantenimiento",   subtitle: "Inmovilizaciones y eventos fuera de ruta desde el calendario." },
      compliance:         { title: "Hub de cumplimiento",          subtitle: "Gestionar documentos regulatorios, licencias y preparación para auditorías." },
      inventory:          { title: "Hub de inventario",            subtitle: "Rastrear piezas, consumibles y stock en todas las bases." },
      allocationSettings: { title: "Configuración de asignación",  subtitle: "Configurar reglas de emparejamiento de conductores y asignación automática de servicios." },
      vehicles:           { title: "Vehículos",                    subtitle: "Ver y gestionar el registro completo de vehículos." },
      fleets:             { title: "Flotas",                       subtitle: "Gestionar grupos de flota y asignaciones de conductores." },
      issues:             { title: "Incidencias",                  subtitle: "Registrar y gestionar incidencias de vehículos, conductores y operaciones." },
    },
    rota: {
      step1Label: "Cargando conductores",        step1Detail: "Cargando perfiles de conductores y turnos",
      step2Label: "Cargando vacaciones",         step2Detail: "Comprobando permisos aprobados y ausencias",
      step3Label: "Revisando asignaciones",      step3Detail: "Buscando servicios no asignados para esta semana",
      step4Label: "Construyendo el horario",     step4Detail: "Asignando conductores a sus servicios, casi listo…",
      workingDay: "Día laborable", restDay: "Día de descanso", holiday: "Vacaciones",
      unavailable: "No disponible", off: "Libre", notOnRota: "No planificado",
      sun: "Dom", mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", fri: "Vie", sat: "Sáb",
      allocationPeriod: "Período de asignación", assignDriver: "Asignar conductor", assignTruck: "Asignar tractora",
      noRoute: "Sin ruta", history: "Historial", stats: "Estadísticas", relay: "Relevo", add: "Añadir",
      autoAllocate: "Asignación automática", user: "Usuario", exportRelay: "Exportar relevo",
      unassignedTrips: "SERVICIOS SIN ASIGNAR", dragToAssign: "Arrastrar para asignar",
      violations: "{n} infracciones · {w} advertencia", warnings: "{w} advertencia", warningsLabel: "Advertencias", violationsLabel: "Infracciones",
      grid: "Cuadrícula", analysis: "Análisis",
      allCompliant: "Todo conforme", checkingCompliance: "Verificando conformidad…",
      noUnassignedTrips: "Sin servicios sin asignar",
      complianceReport: "Informe de conformidad", allClear: "Todo despejado",
      noComplianceDesc: "No se detectaron infracciones ni advertencias de conformidad esta semana. Todos los conductores están dentro de sus horas permitidas.",
      issuesTab: "Problemas", rulesRef: "Referencia de normas",
      allocationBlocked: "Asignación bloqueada", complianceViolationBlocked: "Una infracción de conformidad impide esta asignación",
      understood: "Entendido",
      reassignTitle: "Reasignar", currentlyAssigned: "Actualmente asignado", willBeReplacedWith: "Será reemplazado por",
      existingTripUnassigned: "El servicio existente será desasignado y devuelto al grupo sin asignar.",
      driver: "Conductor", hrs: "Hrs",
      complianceViolation: "Infracción de conformidad", complianceWarning: "Advertencia de conformidad",
      complianceCompliant: "Conforme", driversWithIssues: "{n} conductor con problemas",
    },
    maintenance: {
      upcoming: "Próximos", historical: "Histórico",
      searchPlaceholder: "Buscar vehículo, motivo…",
      records: "registros", ofRecords: "de",
      refresh: "Actualizar", export: "Exportar",
      colVehicle: "Vehículo", colDateRange: "Período", colDays: "Días", colWhen: "Cuándo",
      loading: "Cargando eventos de mantenimiento…", tryAgain: "Reintentar",
      noUpcoming: "Sin mantenimiento próximo",       noUpcomingDesc: "No hay inmovilizaciones de vehículos programadas.",
      noHistorical: "Sin registros históricos",      noHistoricalDesc: "No se encontraron eventos de mantenimiento pasados.",
      statusActive: "Activo", statusUpcoming: "Próximo", statusCompleted: "Completado",
      today: "Hoy", inDays: "En {n}d", daysAgo: "Hace {n}d", durationDays: "{n}d",
    },
    maintenanceHub: {
      tabDashboard: "Panel", tabPMI: "Hoja PMI", tabDefects: "Defectos", tabSettings: "Configuración",
      kpiVOR: "VOR (Fuera de ruta)", kpiVORSub: "vehículos inmovilizados",
      kpiDueSoon: "Vence en 7 días", kpiDueSoonSub: "reserva necesaria",
      kpiCompliant: "Plenamente conforme", kpiCompliantSub: "vehículos en verde",
      kpiPMIRate: "Tasa PMI a tiempo", kpiPMIRateSub: "Objetivo DVSA: 100%",
      earnedRecognition: "KPIs Reconocimiento ganado", dvsaScheme: "Programa DVSA", target: "Objetivo: {n}%",
      fleetStatusBoard: "Panel de estado de flota", compliant: "Conforme", dueSoon: "Pronto", overdueVOR: "Vencido/VOR",
      pmiSchedule: "Programa PMI 8 semanas", noPMIsDue: "Sin PMIs programados",
      driver: "Conductor", nextPMI: "Próximo PMI", daysOverdue: "{n}d de retraso", dueToday: "Vence hoy", dueIn: "Vence en {n}d",
      pmiSheet: "Programa PMI — Todos los vehículos", allVehicles: "Todos los vehículos", clickToInspect: "Clic en una fila para abrir la hoja de inspección",
      inspectionProgress: "Progreso de la inspección", itemsCompleted: "Elementos completados", results: "Resultados", location: "Ubicación", interval: "Intervalo",
      technicianDecl: "Declaración del técnico", sign: "Firmar", signed: "Firmado", signFirst: "Firma la declaración anterior para habilitar el envío.",
      submitPMI: "Enviar informe PMI", pmiSubmitted: "PMI enviado", backToSchedule: "← Volver al programa",
      brakeTest: "Resultados de la prueba de frenos (requerido DVSA)", axle1: "Eficiencia eje 1 (%)", axle2: "Eficiencia eje 2 (%)",
      meetsDVSA: "✓ Cumple mínimo DVSA (50%)", belowDVSA: "✗ Por debajo del mínimo DVSA – FALLO",
      openDefects: "Defectos abiertos", resolved: "Resuelto", totalDefects: "Total defectos",
      requiresAction: "requiere acción", completed: "completado", allTime: "total",
      rectificationRecord: "Registro de rectificación", partsUsed: "Piezas usadas:", labour: "Mano de obra:", signedOffBy: "Firmado por:",
      logRectification: "Registrar rectificación", markRoadworthy: "Marcar apto para rodar & Firmar", signedOffRoadworthy: "✓ Firmado como apto para rodar",
      vehicleProfiles: "Perfiles de vehículo", addVehicle: "Añadir vehículo", userRolesPerms: "Roles & permisos de usuario", inviteUser: "Invitar usuario",
      notificationEngine: "Motor de notificaciones", customChecklist: "Elementos de lista personalizada", addItem: "Añadir elemento", remove: "Eliminar",
      dataExport: "Exportación de datos & integraciones", vorAlert: "{n} vehículo{s} fuera de ruta", schedule: "← Programa",
      pass: "A", advisory: "O", fail: "F",
    },
    issues: {
      newIssue: "Nueva incidencia", critical: "Crítico", high: "Alto", medium: "Medio", low: "Bajo",
      inProgress: "En progreso", open: "Abierto", report: "Informe", priority: "Prioridad",
      assignee: "Responsable", backlogged: "Pendiente", requiresUpdate: "Requiere actualización",
      inReview: "En revisión", saveChanges: "Guardar cambios", createIssue: "Crear incidencia",
      unassigned: "Sin asignar",
      type: "Tipo", category: "Categoría", assignedTo: "Asignado a", reportedBy: "Reportado por",
      incidentLocation: "Lugar del incidente", pinLocation: "Fijar ubicación", hideMap: "Ocultar mapa",
      noLocationPinned: "Sin ubicación fijada \u2014 haz clic en “Fijar ubicación” para marcar el punto",
      scheduledMaintenance: "Mantenimiento programado", pending: "Pendiente", closed: "Cerrado",
      pickTypFirst: "Seleccionar tipo primero", selectCategory: "Seleccionar\u2026",
    },
    trips: {
      tripId: "ID servicio", tripStatus: "Estado servicio", tractor: "Tractora",
      facilitySequence: "Secuencia ubicaciones", estEndTime: "Fin estimado",
      dragToAssign: "Arrastrar para asignar", unassignedTrips: "SERVICIOS SIN ASIGNAR",
      saveChanges: "Guardar cambios", createIssue: "Crear incidencia", newIssue: "Nueva incidencia",
    },
    calendar: {
      created: "Creado", driverUnavailable: "Conductor no disponible", assigned: "Asignado",
      unassigned: "Sin asignar", estEnd: "Fin est.", destination: "Destino",
      month: "Mes", week: "Semana", day: "Día", allDrivers: "Todos los conductores",
      allVehicles: "Todos los vehículos", vehicleOff: "Veh. fuera", fullyAssigned: "Totalmente asignado",
      noVehicle: "Sin vehículo", noDriver: "Sin conductor", orders: "Pedidos", driverOff: "Conductor libre",
    },
    fuelTracking: {
      expense: "Gasto", addExpense: "Añadir gasto", inclVat: "IVA incl.",
      volume: "Volumen", payment: "Pago", card: "Tarjeta",
      noExpenses: "No se encontraron gastos de combustible", stats: "Estadísticas",
      totalRecords: "Total registros", pendingApproval: "Pendiente de aprobación", approved: "Aprobado",
      filters: "Filtros", searchPlaceholder: "Buscar vehículo, conductor…",
    },
    fuelReceipts: {
      captured:"Capturado", supplier:"Proveedor", product:"Producto",
      duplicate:"Duplicado", receipt:"Recibo", uploadZip:"Subir ZIP",
      searchPlaceholder:"Buscar por vehículo, proveedor…",
      addModalTitle:"Añadir recibos de combustible",
      addModalSubtitle:"Suelta imágenes o PDFs — se comprimirán y enviarán automáticamente por OCR",
      dropTitle:"Arrastra & suelta los recibos aquí", dropActive:"Suelta para añadir",
      dropHint:"o haz clic para explorar · JPEG, PNG, WebP, PDF",
      filesSelected:"{n} archivo{s} seleccionado{s}",
      stepZipping:"Comprimiendo", stepUploading:"Subiendo",
      stepImporting:"Importando", stepProcessing:"Procesando OCR",
      progressZipping:"Comprimiendo {n} archivo{s}…", progressUploading:"Subiendo al servidor…",
      progressImporting:"Importando recibos…", progressProcessing:"Procesando OCR…",
      processingNote:"Esto puede tardar un momento para lotes grandes",
      successTitle:"Subida & procesamiento completados", successCount:"{n} recibo{s} importado{s}",
      errorTitle:"Error de subida",
      btnAdd:"Añadir", btnUpload:"Subir {n} archivo{s}", btnDone:"Listo — Actualizar lista",
      btnTryAgain:"Reintentar", btnClose:"Cerrar",
      filterTitle:"Filtrar recibos", anyDriver:"Cualquier conductor", anyStatus:"Cualquier estado",
      capturedFrom:"Capturado desde", capturedTo:"Capturado hasta",
      detailTitle:"Detalle del recibo de combustible", ocrData:"Datos extraídos OCR", rawText:"Texto sin formato",
      colOcrStatus:"Estado OCR", colCapturedAt:"Capturado el",
    },
    parking: {
      pageOf: "Página", searchPlaceholder: "Buscar vehículo, ubicación…",
    },
    tollReceipts: {
      upload:"Subir", entryPoint:"Punto de entrada", exitPoint:"Punto de salida",
      vehicleClass:"Clase de vehículo", searchPlaceholder:"Buscar vehículo, ruta…",
      addModalTitle:"Añadir recibos de peaje",
      addModalSubtitle:"Suelta imágenes o PDFs — se comprimirán y enviarán automáticamente por OCR",
      dropTitle:"Arrastra & suelta los recibos aquí", dropActive:"Suelta para añadir",
      dropHint:"o haz clic para explorar · JPEG, PNG, WebP, PDF",
      filesSelected:"{n} archivo{s} seleccionado{s}",
      stepZipping:"Comprimiendo", stepUploading:"Subiendo",
      stepImporting:"Importando", stepProcessing:"Procesando OCR",
      progressZipping:"Comprimiendo {n} archivo{s}…", progressUploading:"Subiendo al servidor…",
      progressImporting:"Importando recibos…", progressProcessing:"Procesando OCR…",
      processingNote:"Esto puede tardar un momento para lotes grandes",
      successTitle:"Subida & procesamiento completados", successCount:"{n} recibo{s} importado{s}",
      errorTitle:"Error de subida",
      btnAdd:"Añadir", btnUpload:"Subir {n} archivo{s}", btnDone:"Listo — Actualizar lista",
      btnTryAgain:"Reintentar", btnClose:"Cerrar",
      filterTitle:"Filtrar recibos", anyDriver:"Cualquier conductor", anyStatus:"Cualquier estado",
      capturedFrom:"Capturado desde", capturedTo:"Capturado hasta",
      sendTitle:"Enviar a Amazon", sendSubtitle:"Enviar cargos de peaje a Amazon Relay para el período seleccionado",
      sendFromDate:"Fecha de inicio", sendToDate:"Fecha de fin",
      sendPreviewBtn:"Previsualizar antes de enviar", sendDownloading:"Descargando…",
      sendBtn:"Enviar a Amazon Relay", sendSending:"Enviando.",
      sendWarning:"Esto enviará todos los cargos de peaje procesados en el rango de fechas seleccionado a Amazon Relay.",
      sendSuccess:"Enviado correctamente",
      sendSuccessMsg:"Los cargos de peaje han sido enviados a Amazon Relay.",
      colChargeEx:"Cargo (sin IVA)", colVat:"IVA",
      colChargeInc:"Cargo (con IVA)", colProcessingStatus:"Estado de procesamiento",
    },
    holidays: {
      reason: "Motivo", start: "Inicio", end: "Fin", days: "Días",
      newEntry: "Nueva entrada", searchPlaceholder: "Buscar conductor, motivo…",
      leaveTypes: { "Annual Leave": "Vacaciones anuales", sick: "Baja por enfermedad", Vacation: "Vacaciones", Other: "Otro" },
    },
    offShift: {
      cycle: "Ciclo", firstLeaveDay: "Primer día de permiso", planUntil: "Planificar hasta",
      searchPlaceholder: "Buscar conductor…",
    },
    vehicles: {
      year: "Año", lastPmi: "Última ITV", tachographCal: "Calibración tacógrafo",
      searchPlaceholder: "Buscar por matrícula, base…", addVehicle: "Añadir vehículo",
    },
    places: {
      list: "Lista", map: "Mapa", city: "Ciudad", postalCode: "Código postal",
      depotMap: "Mapa de bases", plotted: "Visualizados", pageSize: "Tamaño página",
      searchPlaceholder: "Buscar lugares…", addPlace: "Añadir lugar",
      code: "Código / ID", address: "Dirección", stateCounty: "Provincia / Comunidad", country: "País",
    },
    login: {
      tagline:       "Cumplimiento & Gestión de flota",
      signIn:        "Iniciar sesión",
      signInDesc:    "Introduce tus credenciales para acceder a la plataforma",
      emailLabel:    "Correo electrónico",
      emailPlaceholder: "tu@empresa.es",
      passwordLabel: "Contraseña",
      rememberMe:    "Recuérdame",
      forgotPassword:"¿Olvidaste tu contraseña?",
      submit:        "Iniciar sesión",
      submitting:    "Iniciando sesión…",
      resetTitle:    "Restablecer contraseña",
      resetDesc:     "Introduce tu correo y te enviaremos un enlace de restablecimiento.",
      sendLink:      "Enviar enlace",
      sending:       "Enviando…",
      backToSignIn:  "← Volver al inicio de sesión",
      checkInbox:    "Revisa tu bandeja de entrada",
      checkInboxDesc:"Si {email} está registrado, recibirás un enlace en breve.",
      errorDefault:  "Error al iniciar sesión. Comprueba tus credenciales e inténtalo de nuevo.",
    },
    inventoryHub: {
      tabDashboard:"Panel",tabParts:"Piezas",tabJobCards:"Órdenes de trabajo",tabPurchasing:"Compras",tabTyres:"Neumáticos & Fluidos",
      totalStockValue:"Valor total del stock",stockoutVOR:"Riesgo VOR sin stock",lowStockParts:"Piezas con stock bajo",deadStock:"Stock muerto (>12m)",
      reorderAlerts:"Alertas de reposición",stockValueByCategory:"Valor del stock por categoría",recentMovements:"Movimientos recientes del stock",
      safetyCritical:"CRÍTICO DE SEGURIDAD",addPart:"Añadir pieza",scan:"Escanear",adjust:"Ajustar",
      partsIssued:"Piezas emitidas",scanPart:"Escanear pieza",issueKit:"Emitir kit",newJobCard:"Nueva orden de trabajo",
      openPOs:"OC abiertas",autoReorder:"Reposición automática pendiente",coreReturns:"Devoluciones de núcleo €",raisePO:"Crear OC",raiseAllPOs:"Crear todas las OC",
      newPO:"Nueva OC",purchaseOrders:"Órdenes de compra",autoReorderSuggestions:"Sugerencias de reposición automática",
      tyresToReplace:"Neumáticos a reemplazar",advisoryTyres:"Neumáticos en observación",tyresTracked:"Neumáticos rastreados",
      tyreManagement:"Gestión de neumáticos",fitTyre:"Montar neumático",bulkFluidDispensing:"Dispensación de fluidos a granel",
      dispense:"Dispensar",confirm:"Confirmar",issuePMIKit:"Emitir kit PMI",stockout:"Sin stock",reorder:"Reponer",
    },
    complianceHub: {
      tabWalkaround:"Inspección del vehículo",tabDrivers:"Conductores",tabDocuments:"Documentos",tabPlanner:"Planificador",
      tabTraining:"Formación",tabFleet:"Flota",tabAudit:"Registro de auditoría",tabSettings:"Configuración",
      newWalkaround:"Nueva inspección del vehículo",walkaroundSubmitted:"Inspección enviada",
      noVehiclesFound:"No se encontraron vehículos",noDriversFound:"No se encontraron conductores",
      timerLocation:"Temporizador / Ubicación",todayPhotograph:"Hoy debes fotografiar:",takePhoto:"Tomar foto",
      advisory:"Aviso",pass:"Aprobado",fail:"Reprobado",yes:"Sí",
      driverDeclaration:"Declaración y firma del conductor",
      driverDeclarationText:"Declaro que he llevado a cabo la inspección diaria requerida del vehículo identificado arriba y que, según mi leal saber, es seguro para circular en la vía pública.",
      signedBy:"Firmado por",submitWalkaround:"Enviar inspección del vehículo",
      checkSummary:"Resumen de inspección",duration:"Duración",results:"Resultados",antiCheatPhoto:"Foto anti-trampa",dangerous:"Peligroso",
      checksCompletedToday:"Inspecciones completadas hoy",defectsReportedToday:"Defectos reportados hoy",
      avgCheckTime:"Tiempo prom. de inspección hoy",dvsaMinimum:"Mínimo DVSA: 5 min.",
      recentWalkarounds:"Inspecciones recientes",noWalkarounds:"No se encontraron inspecciones de vehículos.",
      nilDefect:"Sin defectos",unableToLoad:"No se pudo cargar el detalle de la inspección.",
      dvlaLicence:"Permiso DVLA",refresh:"Actualizar",davisRiskScore:"Puntuación de riesgo DAVIS",entitlements:"Autorizaciones",
      noEndorsements:"Sin anotaciones. Permiso limpio confirmado por DVLA.",
      driverCPC:"CPC del conductor",dqc:"DQC",progress:"Progreso",modules:"Módulos",outstanding:"Pendiente",
      logCourse:"Registrar curso completado",previousCycle:"Ciclo anterior (5 años antes)",
      addRecord:"Añadir registro",noTraining:"No hay registros de formación.",noExpiry:"Sin fecha de vencimiento",
      visaExpiry:"Vencimiento del visado",uploadPassport:"Subir pasaporte / escaneo BRP",
      auditTrail:"Registro de auditoría",exportCsv:"Exportar CSV",allCategories:"Todas las categorías",
      allActions:"Todas las acciones",allUsers:"Todos los usuarios",before:"Antes",after:"Después",
      noEvents:"Ningún evento coincide con sus filtros.",
      expired:"Vencido",expiringWithin90:"Vence en 90 días",noDateSet:"Sin fecha establecida",
      bothPartiesSigned:"Ambas partes firmaron",multipleDocuments:"Múltiples documentos",
      clickToEdit:"Haz clic en cualquier celda para editar",noExpiries:"No hay fechas de vencimiento registradas.",showAll:"Mostrar todo",
      documentType:"Documento",driverVehicle:"Conductor / Vehículo",expiry:"Vencimiento",
      pmiBoard:"Tablero de mantenimiento preventivo",bookIn:"Reservar",
      complianceManager:"Gestor de cumplimiento",noManagerCandidates:"No se encontraron candidatos a gestor en la API",
      olicenceMarginsChecker:"Verificador de margen de licencia O",
      tachoInfringements:"Infracciones de tacógrafo y WTD",tachoIntegration:"Integrado vía TruTac / Descartes API",
      accidentLog:"Registro de accidentes e incidentes (FNOL)",reportAccident:"Reportar accidente",
      downloadFnol:"Descargar informe FNOL",forsReport:"Informe FORS / DVSA Earned Recognition",
      generateReport:"Generar informe",reportAccidentFnol:"Reportar accidente (FNOL)",
      attachPhotos:"Adjuntar fotos del lugar",
      notificationChannels:"Canales de notificación",emailChannel:"Correo electrónico",
      mobileNotification:"Notificación móvil",dailyDigest:"Resumen diario",
      operationalEvents:"Eventos operativos",deliverAt:"Entregar a las",expiryAlerts:"Alertas de vencimiento",
      alertLabel:"Alerta",early:"Temprano",remind:"Recordar",off:"Desactivado",instant:"Instantáneo",
      allSettingsSaved:"Todos los ajustes guardados",unsavedChanges:"Cambios sin guardar",reset:"Restablecer",
      highRisk:"Alto riesgo",cpcCritical:"CPC crítico",checksDue:"Inspecciones pendientes",
      rtwExpiring:"RTW por vencer",disqualified:"Descalificado",
      motExpiring:"ITV ≤90d",tachoCal:"Cal. tacó ≤90d",lolerDue:"LOLER ≤90d",
      fullyClear:"Totalmente en regla",overdueVor:"Vencido / VOR",dueWithin7:"En 7 días",
      pmiOnTime:"Tasa de puntualidad PMI",
      expiredOverdue:"Vencido / Atrasado",expiringSoon:"Por vencer",awaitingSignatures:"Pendiente de firmas",
      documentDetails:"Detalles del documento",editDocument:"Editar documento",file:"Archivo",
      noFileAttached:"No hay archivo adjunto",counterSigned:"Contrafirmado",signed:"Firmado",uploaded:"Subido",
      documentTitle:"Título del documento",category:"Categoría",newCategory:"Nombre de nueva categoría",
      description:"Descripción",notes:"Notas",
      walkaroundTemplates:"Plantillas de inspección de vehículos",
      walkaroundTemplatesDesc:"Cree plantillas configurables mit tipos de preguntas, fotos obligatorias y lógica condicional. Asigne por vehículo.",
      helpText:"Texto de ayuda",questionType:"Tipo de pregunta",dropdownOptions:"Opciones de lista desplegable",
      unitLabel:"Etiqueta de unidad",requiredToSubmit:"¿Requerido para enviar?",
      defectSeverity:"Gravedad del defecto",conditionalDisplay:"Visualización condicional",
      noConditional:"No hay otras preguntas en esta sección mit respuestas seleccionables.",
      templateName:"Nombre de plantilla",vehicleAssignment:"Asignación de vehículo",
      vehicleAssignmentDesc:"Una plantilla por vehículo. Asignar aquí la elimina de la plantilla actual.",
      unassigned:"Sin asignar",sections:"Secciones",checks:"Inspecciones",vehicles:"Vehículos",
      modified:"Modificado",actions:"Acciones",untitled:"Sin título",assign:"Asignar",
      totalCourses:"Cursos totales",completed:"Completado",awaitingApproval:"Pendiente de aprobación",
      totalEnrolments:"Total de inscripciones",noEnrolments:"Aún no hay inscripciones",
      back:"Atrás",publish:"Publicar",archive:"Archivar",republish:"Volver a publicar",
      courseInformation:"Información del curso",completionSummary:"Resumen de finalización",
      editCourseDetails:"Editar detalles del curso",titleLabel:"Título",passMarkPct:"Nota mínima (%)",
      deadline:"Fecha límite",assignTo:"Asignar a",allDrivers:"Todos los conductores",specificDrivers:"Conductores específicos",
      autoApprove:"Aprobar autom. cuando el conductor aprueba",saveDetails:"Guardar detalles",
      learningMaterials:"Materiales de aprendizaje",addMaterial:"Añadir material",
      addFirstMaterial:"Añadir primer material",noMaterials:"Aún no hay materiales.",
      videoUrl:"URL de video",pages:"Páginas",
      fileUploadNote:"La carga de archivos estará disponible al conectarse al servidor",
      quizQuestions:"Preguntas del cuestionario",addQuestion:"Añadir pregunta",addFirstQuestion:"Añadir primera pregunta",
      noQuestions:"Aún no hay preguntas.",quizQuestionType:"Tipo de pregunta",scorePts:"Puntuación (puntos)",questionText:"Texto de la pregunta",
      correctAnswer:"Respuesta correcta",trueFalse:"Verdadero / Falso",freeText:"Texto libre (evaluación manual)",
      multiChoiceSingle:"Opción múltiple (respuesta única)",multiChoiceMulti:"Opción múltiple (varias respuestas)",
      sampleAnswer:"Respuesta de ejemplo",addOption:"Añadir opción",
      driverEnrolments:"Inscripciones de conductores",
      noDriversEnrolled:"Aún no hay conductores inscritos. Publique el curso y asigne conductores.",
      driverCol:"Conductor",statusCol:"Estado",attempts:"Intentos",bestScore:"Mejor puntuación",
      driverSigned:"Conductor firmado",operatorSigned:"Operador firmado",actionCol:"Acción",
      assessmentApproved:"Evaluación aprobada",certFiled:"Certificado generado y archivado en los documentos del conductor.",
      assessmentRejected:"Evaluación rechazada",answerReview:"Revisión de respuestas",scoreLabel:"Puntuación",
      attemptsLabel:"Intentos",driverSignature:"Firma del conductor",signedLabel:"Firmado",
      cancel:"Cancelar",searchDocs:"Buscar documentos...",searchCourses:"Buscar cursos...",antiCheatPhotoRequired:"📸 Se requiere captura de pantalla",antiCheatInstruction:"Tome una foto / captura de pantalla de tu pantalla",backToChecks:"Volver a inspecciones",backToEnrolments:"Volver a inscripciones",courseInfo:"Información del curso",editCourse:"Editar detalles del curso",defectsReported:"Defectos reportados",defectsWorkshopNotified:"Taller notificado",nilDefectCleared:"Sin defecto aprobado",noDefects:"Sin defectos",ok:"OK",olicenceMargin:"Margen de licencia O",passed:"Aprobado",photoRequired:"Foto requerida",photoRequiredDefect:"Foto requerida – defecto",requiredQuestion:"Obligatorio",forsReadiness:"Preparación FORS",loadingCheckDetail:"Cargando detalles...",loadingDrivers:"Cargando conductores...",loadingVehicles:"Cargando vehículos...",signedOn:"Firmado el",suspiciousSpeed:"⚠️ Velocidad sospechosa",vehiclesPending:"Vehículos pendientes",workshopNotified:"Taller notificado",
      date:"Fecha",na:"N/A",notConnected:"No conectado",integrations:"Integraciones",sent:"Enviado",saving:"Guardando...",saved:"Guardado",saveChanges:"Guardar cambios",
      action:"Acción",apiErrorLocal:"Error (datos locales)",at:"a las",certificate:"Certificado",details:"Detalles",edit:"Editar",rePublish:"Volver a publicar",review:"Revisar",sign:"Firmar",status:"Estado",template:"Plantilla",
      reviewNote:"Revise las respuestas, califique las preguntas de texto libre y luego apruebe o rechace.",
    },
    drivers: { addTitle:"Anadir conductor", editTitle:"Editar conductor", shiftPreference:"Preferencia de turno", shiftNone:"Ninguno", shiftAllDays:"Todos los dias", shiftCustom:"Personalizado", shiftStart:"Inicio del turno", shiftEnd:"Fin del turno", maxConsecDays:"Max. dias consecutivos", maxTripsWeek:"Max. viajes / semana", licenceNo:"No de carnet", noneSelected:"Sin seleccion", statusActive:"Activo", statusInactive:"Inactivo", statusPending:"Pendiente", statusArchived:"Archivado", noDriversFound:"No se encontraron conductores.", nameRequired:"El nombre del conductor es obligatorio.", saveFailed:"Error al guardar", statusUpdateFailed:"Error al actualizar el estado", retryLabel:"Reintentar" },
    fleetManagement: { exceptionEvents:"Eventos excepcionales", engineDiagnostics:"Diagnosticos del motor", tripHistory:"Historial de viajes", allFleets:"Todas las flotas", vehicles:"Vehiculos", drivers:"Conductores", onShift:"De turno", monthlyDistance:"Distancia mensual", fuelThisMonth:"Combustible este mes", newFleet:"Nueva flota", vehicleLabel:"Vehiculo", fleetLabel:"Flota", yearLabel:"Ano", mph:"mph", rpm:"rpm", driverSafetyScore:"Puntuacion de seguridad del conductor", critical:"Critico", warnings:"Advertencias", info:"Info", exceptionByType:"Eventos por tipo", noTripsToday:"No hay viajes registrados hoy.", liveDiagnostic:"Instantanea de diagnostico en vivo", avgSpd:"Vel. media", endLabel:"Fin" },
    importHub: { autoImportEnabled:"Importacion automatica activada", extensionNotDetected:"Extension no detectada", extensionActive:"Extension activa", yourColumn:"Tu columna", fleeyesField:"Campo FleetYes", tripsToday:"Viajes hoy", lastSync:"Ultima sincronizacion", primary:"Principal", universalActivityLog:"Registro de actividad universal", viewLabel:"Ver", tripsImportedToday:"Viajes importados hoy", acrossAllProviders:"en todos los proveedores", activeConnections:"Conexiones activas", syncFailures:"Fallos de sincronizacion", providersConfigured:"Proveedores configurados", vendorGallery:"Galeria de integraciones de proveedores" },
    orgSettings: { failedToLoad:"Error al cargar la configuracion", orgSettings:"Configuracion de la organizacion", recordInfo:"Informacion del registro", drivingHours:"Horas de conduccion", workingHours:"Horas de trabajo", myGeotab:"MyGeotab" },
  },

  // ── Italian ─────────────────────────────────────────────────────────────────
  it: {
    nav: {
      dashboard:          "Dashboard",
      trips:              "Viaggi",
      rota:               "Piano settimanale",
      importHub:          "Hub importazione",
      calendar:           "Calendario",
      maintenanceTrips:   "Viaggi manutenzione",
      drivers:            "Autisti",
      fleetManagement:    "Gestione flotta",
      places:             "Luoghi",
      fuelTracking:       "Monitoraggio carburante",
      parkingMonitoring:  "Monitoraggio parcheggio",
      tollExpenses:       "Spese pedaggi",
      tollReceipts:       "Ricevute pedaggi",
      fuelReceipts:       "Ricevute carburante",
      holidays:           "Ferie e assenze",
      offShift:           "Fuori turno",
      maintenance:        "Manutenzione",
      compliance:         "Conformità",
      inventory:          "Inventario",
      allocationSettings: "Impostazioni di assegnazione",
      groupTransport:     "Trasporti",
      groupExpenses:      "Costi",
      groupPeople:        "Personale",
      groupSettings:      "Impostazioni",
      issues:             "Segnalazioni",
      fuel:               "Carburante",
      toll:               "Pedaggio",
    },
    topbar: {
      profile:    "Il mio profilo",
      settings:   "Impostazioni",
      logout:     "Esci",
      lightMode:  "Chiaro",
      darkMode:   "Scuro",
      systemMode: "Sistema",
      language:   "Lingua",
    },
    common: {
      save:"Salva",cancel:"Annulla",upload:"Carica",download:"Scarica",search:"Cerca",new:"Nuovo",edit:"Modifica",delete:"Elimina",submit:"Invia",back:"Indietro",loading:"Caricamento…",addVehicle:"Aggiungi veicolo",export:"Esporta",filter:"Filtra",refresh:"Aggiorna",active:"Attivo",inactive:"Inattivo",pending:"In attesa",resolved:"Risolto",allVehicles:"Tutti i veicoli",today:"Oggi",thisMonth:"Questo mese",selectAll:"Seleziona tutto",tryAgain:"Riprova",records:"voci",noData:"Nessun dato",
      date:"Data",vehicle:"Veicolo",driver:"Autista",status:"Stato",action:"Azione",ref:"Rif",route:"Percorso",type:"Tipo",amount:"Importo",method:"Metodo",litres:"Litri",costPerLitre:"Costo/L",totalCost:"Costo totale",odometer:"Contachilometri",mpg:"L/100km",depot:"Deposito",duration:"Durata",location:"Posizione",cost:"Costo",fleet:"Flotta",name:"Nome",phone:"Telefono",email:"Email",country:"Paese",licence:"Patente",notes:"Note",
      view:"Vedi",reconcile:"Riconcilia",addNew:"Aggiungi",assign:"Assegna",approve:"Approva",reject:"Rifiuta",newCharge:"Nuovo addebito",details:"Dettagli",close:"Chiudi",
      createRecord:"Crea record",saving:"Salvataggio…",creating:"Creazione…",
      clearAll:"Cancella tutto",apply:"Applica",stats:"Statistiche",noRecordsFound:"Nessun record trovato",
      dropFile:"Trascina un file o clicca per sfogliare",supports:"Supporta .xlsx, .xls, .csv",clickToChange:"clicca per cambiare",
      importComplete:"Importazione completata",importFailed:"Importazione fallita",rowsImported:"importato/i",rowsSkipped:"saltato/i",
      someRowsHadErrors:"Alcune righe contenevano errori",downloadErrorLog:"Scarica registro errori",tryAgainBtn:"Riprova",
      all:"Tutti",reconciled:"Riconciliato",scheduled:"Programmato",dispatched:"Spedito",started:"Avviato",completed:"Completato",cancelled:"Annullato",
      tripsToday:"Viaggi oggi",driversAvailable:"Autisti disponibili",fleetSize:"Dimensione flotta",thisWeek:"Questa settimana",available:"disponibile/i",onLeave:"in ferie",noTripsToday:"Nessun viaggio oggi",nothingScheduled:"Niente in programma per oggi",createTrip:"Crea un viaggio →",driverStatus:"Stato autisti",allDrivers:"Tutti gli autisti",todaysTrips:"Viaggi di oggi",weekAtGlance:"Settimana in sintesi",vehicleDowntime:"Fermo veicoli",upcomingLeave:"Ferie in arrivo",viewCalendar:"Vedi calendario",manage:"Gestisci",viewAll:"Vedi tutto",tripsMonSun:"viaggi lun–dom",active2:"attivo/i",done:"completato/i",awaitingDispatch:"In attesa di spedizione",ofTotal:"di {n} totali",vehiclesRegistered:"veicoli registrati",vehiclesOff:"{n} veicolo/i assente/i oggi",needsDriver:"{n} viaggio/i senza autista",
      goodMorning:"Buongiorno",goodAfternoon:"Buon pomeriggio",goodEvening:"Buonasera",
      searchPlaceholder:"Cerca…",searchVehicles:"Cerca per targa, autista, deposito…",searchDrivers:"Cerca autisti…",
      noDriverAssigned:"Nessun autista assegnato",driverAssigned:"Autista assegnato",ongoing:"In corso",noUpcomingDowntime:"Nessun fermo veicoli previsto",noUpcomingLeave:"Nessuna ferie nei prossimi 7 giorni",consumptionByVehicle:"Consumo per veicolo (30 giorni)",address:"Indirizzo",
      at:"alle",for:"per",of:"di",
    },
    pages: {
      dashboard:          { title: "Dashboard",                    subtitle: "Il tuo riepilogo operativo di oggi." },
      trips:              { title: "Viaggi",                       subtitle: "Gestisci e monitora tutti gli ordini di trasporto." },
      rota:               { title: "Piano settimanale autisti",    subtitle: "Pianifica e gestisci le assegnazioni degli autisti per la settimana." },
      importHub:          { title: "Hub importazione",             subtitle: "Controllo centralizzato di tutte le connessioni dati fornitori e importazioni manuali." },
      calendar:           { title: "Calendario",                   subtitle: "Visualizza e pianifica i viaggi nel calendario." },
      drivers:            { title: "Autisti",                      subtitle: "Gestisci profili autisti, patenti e conformità CPC." },
      fleetManagement:    { title: "Gestione flotta",              subtitle: "Telematica in tempo reale, diagnostica e amministrazione — tramite API MyGeotab." },
      places:             { title: "Luoghi",                       subtitle: "Gestisci depositi, siti clienti e fermate frequenti." },
      fuelTracking:       { title: "Monitoraggio carburante",      subtitle: "Monitora consumo, efficienza e spesa per veicolo." },
      parkingMonitoring:  { title: "Monitoraggio parcheggio",      subtitle: "Traccia l'utilizzo dei parcheggi TIR, costi e sedi approvate." },
      tollExpenses:       { title: "Spese pedaggi",                subtitle: "Traccia pedaggi, ponti e gallerie dell'intera flotta." },
      tollReceipts:       { title: "Ricevute pedaggi",             subtitle: "Acquisizione IVA per pedaggi della flotta." },
      fuelReceipts:       { title: "Ricevute carburante",          subtitle: "Gestione e approvazione delle ricevute carburante recuperabili ai fini IVA." },
      holidays:           { title: "Ferie e assenze",              subtitle: "Gestisci ferie annuali, giorni di malattia e assenze formative." },
      offShift:           { title: "Fuori turno e riposo",         subtitle: "Monitora la conformità ai tempi di riposo UE (min. 11h giornaliere)." },
      maintenance:        { title: "Hub manutenzione",             subtitle: "Pianifica e monitora revisioni, riparazioni e ispezioni dei veicoli." },
      maintenanceTrips:   { title: "Viaggi manutenzione",          subtitle: "Fermi veicolo ed eventi fuori strada dal calendario." },
      compliance:         { title: "Hub conformità",               subtitle: "Gestisci documenti normativi, licenze e preparazione agli audit." },
      inventory:          { title: "Hub inventario",               subtitle: "Traccia ricambi, materiali di consumo e scorte in tutti i depositi." },
      allocationSettings: { title: "Impostazioni di assegnazione", subtitle: "Configura le regole di abbinamento autisti e l'assegnazione automatica dei viaggi." },
      vehicles:           { title: "Veicoli",                      subtitle: "Visualizza e gestisci il registro completo dei veicoli." },
      fleets:             { title: "Flotte",                       subtitle: "Gestisci i gruppi di flotta e le assegnazioni degli autisti." },
      issues:             { title: "Segnalazioni",                 subtitle: "Registra e gestisci segnalazioni su veicoli, autisti e operazioni." },
    },
    rota: {
      step1Label: "Caricamento autisti",         step1Detail: "Caricamento profili e turni degli autisti",
      step2Label: "Caricamento ferie",           step2Detail: "Verifica delle ferie approvate e delle assenze",
      step3Label: "Verifica assegnazioni",       step3Detail: "Ricerca di viaggi non assegnati questa settimana",
      step4Label: "Costruzione del piano",       step4Detail: "Abbinamento autisti ai loro viaggi, quasi finito…",
      workingDay: "Giorno lavorativo", restDay: "Giorno di riposo", holiday: "Ferie",
      unavailable: "Non disponibile", off: "Libero", notOnRota: "Non in piano",
      sun: "Dom", mon: "Lun", tue: "Mar", wed: "Mer", thu: "Gio", fri: "Ven", sat: "Sab",
      allocationPeriod: "Periodo di assegnazione", assignDriver: "Assegna autista", assignTruck: "Assegna motrice",
      noRoute: "Nessun percorso", history: "Storico", stats: "Statistiche", relay: "Staffetta", add: "Aggiungi",
      autoAllocate: "Assegnazione automatica", user: "Utente", exportRelay: "Esporta staffetta",
      unassignedTrips: "VIAGGI NON ASSEGNATI", dragToAssign: "Trascina per assegnare",
      violations: "{n} violazioni · {w} avviso", warnings: "{w} avviso", warningsLabel: "Avvisi", violationsLabel: "Violazioni",
      grid: "Griglia", analysis: "Analisi",
      allCompliant: "Tutti conformi", checkingCompliance: "Verifica conformità…",
      noUnassignedTrips: "Nessun viaggio non assegnato",
      complianceReport: "Rapporto di conformità", allClear: "Tutto a posto",
      noComplianceDesc: "Nessuna violazione o avviso di conformità rilevato questa settimana. Tutti i conducenti sono entro le ore consentite.",
      issuesTab: "Problemi", rulesRef: "Riferimento regole",
      allocationBlocked: "Assegnazione bloccata", complianceViolationBlocked: "Una violazione di conformità impedisce questa assegnazione",
      understood: "Capito",
      reassignTitle: "Riassegna", currentlyAssigned: "Attualmente assegnato", willBeReplacedWith: "Sarà sostituito da",
      existingTripUnassigned: "Il viaggio esistente sarà rimosso e restituito al pool non assegnato.",
      driver: "Conducente", hrs: "Ore",
      complianceViolation: "Violazione di conformità", complianceWarning: "Avviso di conformità",
      complianceCompliant: "Conforme", driversWithIssues: "{n} conducente con problemi",
    },
    maintenance: {
      upcoming: "In arrivo", historical: "Storico",
      searchPlaceholder: "Cerca veicolo, motivo…",
      records: "voci", ofRecords: "di",
      refresh: "Aggiorna", export: "Esporta",
      colVehicle: "Veicolo", colDateRange: "Periodo", colDays: "Giorni", colWhen: "Quando",
      loading: "Caricamento eventi di manutenzione…", tryAgain: "Riprova",
      noUpcoming: "Nessuna manutenzione in arrivo",  noUpcomingDesc: "Nessun fermo veicolo è attualmente pianificato.",
      noHistorical: "Nessuno storico",               noHistoricalDesc: "Nessun evento di manutenzione passato trovato.",
      statusActive: "Attivo", statusUpcoming: "In arrivo", statusCompleted: "Completato",
      today: "Oggi", inDays: "Tra {n}g", daysAgo: "{n}g fa", durationDays: "{n}g",
    },
    maintenanceHub: {
      tabDashboard: "Dashboard", tabPMI: "Scheda PMI", tabDefects: "Difetti", tabSettings: "Impostazioni",
      kpiVOR: "VOR (Fuori strada)", kpiVORSub: "veicoli fermi",
      kpiDueSoon: "Scadenza entro 7 giorni", kpiDueSoonSub: "prenotazione necessaria",
      kpiCompliant: "Completamente conforme", kpiCompliantSub: "veicoli in verde",
      kpiPMIRate: "Tasso PMI puntuale", kpiPMIRateSub: "Obiettivo DVSA: 100%",
      earnedRecognition: "KPI Riconoscimento guadagnato", dvsaScheme: "Programma DVSA", target: "Obiettivo: {n}%",
      fleetStatusBoard: "Bacheca stato flotta", compliant: "Conforme", dueSoon: "In scadenza", overdueVOR: "Scaduto/VOR",
      pmiSchedule: "Programma PMI 8 settimane", noPMIsDue: "Nessun PMI previsto",
      driver: "Conducente", nextPMI: "Prossimo PMI", daysOverdue: "{n}g di ritardo", dueToday: "Scade oggi", dueIn: "Scade tra {n}g",
      pmiSheet: "Programma PMI — Tutti i veicoli", allVehicles: "Tutti i veicoli", clickToInspect: "Clic su una riga per aprire la scheda di ispezione",
      inspectionProgress: "Avanzamento ispezione", itemsCompleted: "Elementi completati", results: "Risultati", location: "Posizione", interval: "Intervallo",
      technicianDecl: "Dichiarazione del tecnico", sign: "Firma", signed: "Firmato", signFirst: "Firmare la dichiarazione sopra per abilitare l’invio.",
      submitPMI: "Invia rapporto PMI", pmiSubmitted: "PMI inviato", backToSchedule: "← Torna al programma",
      brakeTest: "Risultati test freni (richiesto DVSA)", axle1: "Efficienza assale 1 (%)", axle2: "Efficienza assale 2 (%)",
      meetsDVSA: "✓ Soddisfa il minimo DVSA (50%)", belowDVSA: "✗ Sotto il minimo DVSA – FALLITO",
      openDefects: "Difetti aperti", resolved: "Risolto", totalDefects: "Totale difetti",
      requiresAction: "azione richiesta", completed: "completato", allTime: "totale",
      rectificationRecord: "Registro di rettifica", partsUsed: "Parti usate:", labour: "Manodopera:", signedOffBy: "Validato da:",
      logRectification: "Registra rettifica", markRoadworthy: "Segna idoneo alla guida & Valida", signedOffRoadworthy: "✓ Validato come idoneo alla guida",
      vehicleProfiles: "Profili veicolo", addVehicle: "Aggiungi veicolo", userRolesPerms: "Ruoli & permessi utente", inviteUser: "Invita utente",
      notificationEngine:"Motore notifiche", customChecklist:"Elementi lista personalizzata", addItem:"Aggiungi elemento", remove:"Rimuovi",
      dataExport:"Esportazione dati & integrazioni", vorAlert:"{n} veicolo/i fuori strada", schedule:"← Programma",
      pass:"P", advisory:"A", fail:"F",
    },
    fuelReceipts: {
      captured:"Acquisita", supplier:"Fornitore", product:"Prodotto",
      duplicate:"Duplicato", receipt:"Ricevuta", uploadZip:"Carica ZIP",
      searchPlaceholder:"Cerca per veicolo, fornitore…",
      addModalTitle:"Aggiungi ricevute carburante",
      addModalSubtitle:"Trascina immagini o PDF — verranno compressi e inviati automaticamente per OCR",
      dropTitle:"Trascina & rilascia le ricevute qui", dropActive:"Rilascia per aggiungere",
      dropHint:"o clicca per sfogliare · JPEG, PNG, WebP, PDF",
      filesSelected:"{n} file{s} selezionati",
      stepZipping:"Compressione", stepUploading:"Caricamento",
      stepImporting:"Importazione", stepProcessing:"Elaborazione OCR",
      progressZipping:"Compressione di {n} file{s}…", progressUploading:"Caricamento sul server…",
      progressImporting:"Importazione ricevute…", progressProcessing:"Elaborazione OCR in corso…",
      processingNote:"Questo potrebbe richiedere un momento per grandi batch",
      successTitle:"Caricamento & elaborazione completati", successCount:"{n} ricevuta{s} importata{s}",
      errorTitle:"Caricamento fallito",
      btnAdd:"Aggiungi", btnUpload:"Carica {n} file{s}", btnDone:"Fatto — Aggiorna lista",
      btnTryAgain:"Riprova", btnClose:"Chiudi",
      filterTitle:"Filtra ricevute", anyDriver:"Qualsiasi autista", anyStatus:"Qualsiasi stato",
      capturedFrom:"Acquisito dal", capturedTo:"Acquisito al",
      detailTitle:"Dettaglio ricevuta carburante", ocrData:"Dati estratti OCR", rawText:"Testo grezzo",
      colOcrStatus:"Stato OCR", colCapturedAt:"Acquisito il",
    },
    parking: {
      pageOf: "Pagina", searchPlaceholder: "Cerca veicolo, posizione…",
    },
    tollReceipts: {
      upload:"Carica", entryPoint:"Punto di ingresso", exitPoint:"Punto di uscita",
      vehicleClass:"Classe veicolo", searchPlaceholder:"Cerca veicolo, percorso…",
      addModalTitle:"Aggiungi ricevute pedaggi",
      addModalSubtitle:"Trascina immagini o PDF — verranno compressi e inviati automaticamente per OCR",
      dropTitle:"Trascina & rilascia le ricevute qui", dropActive:"Rilascia per aggiungere",
      dropHint:"o clicca per sfogliare · JPEG, PNG, WebP, PDF",
      filesSelected:"{n} file{s} selezionati",
      stepZipping:"Compressione", stepUploading:"Caricamento",
      stepImporting:"Importazione", stepProcessing:"Elaborazione OCR",
      progressZipping:"Compressione di {n} file{s}…", progressUploading:"Caricamento sul server…",
      progressImporting:"Importazione ricevute…", progressProcessing:"Elaborazione OCR in corso…",
      processingNote:"Questo potrebbe richiedere un momento per grandi batch",
      successTitle:"Caricamento & elaborazione completati", successCount:"{n} ricevuta{s} importata{s}",
      errorTitle:"Caricamento fallito",
      btnAdd:"Aggiungi", btnUpload:"Carica {n} file{s}", btnDone:"Fatto — Aggiorna lista",
      btnTryAgain:"Riprova", btnClose:"Chiudi",
      filterTitle:"Filtra ricevute", anyDriver:"Qualsiasi autista", anyStatus:"Qualsiasi stato",
      capturedFrom:"Acquisito dal", capturedTo:"Acquisito al",
      sendTitle:"Invia ad Amazon", sendSubtitle:"Invia i pedaggi ad Amazon Relay per il periodo selezionato",
      sendFromDate:"Data inizio", sendToDate:"Data fine",
      sendPreviewBtn:"Anteprima prima di inviare", sendDownloading:"Download…",
      sendBtn:"Invia ad Amazon Relay", sendSending:"Invio.",
      sendWarning:"Tutti i pedaggi elaborati nell'intervallo di date selezionato verranno inviati ad Amazon Relay.",
      sendSuccess:"Inviato con successo",
      sendSuccessMsg:"I pedaggi sono stati inviati ad Amazon Relay.",
      colChargeEx:"Tariffa (IVA esclusa)", colVat:"IVA",
      colChargeInc:"Tariffa (IVA inclusa)", colProcessingStatus:"Stato elaborazione",
    },
    issues: {
      newIssue: "Nuova segnalazione", critical: "Critico", high: "Alto", medium: "Medio", low: "Basso",
      inProgress: "In corso", open: "Aperto", report: "Segnalazione", priority: "Priorità",
      assignee: "Responsabile", backlogged: "In arretrato", requiresUpdate: "Aggiornamento richiesto",
      inReview: "In revisione", saveChanges: "Salva modifiche", createIssue: "Crea segnalazione",
      unassigned: "Non assegnato",
      type: "Tipo", category: "Categoria", assignedTo: "Assegnato a", reportedBy: "Segnalato da",
      incidentLocation: "Luogo dell’incidente", pinLocation: "Segna posizione", hideMap: "Nascondi mappa",
      noLocationPinned: "Nessuna posizione segnata \u2014 clicca su “Segna posizione” per posizionare un segnaposto",
      scheduledMaintenance: "Manutenzione programmata", pending: "In attesa", closed: "Chiuso",
      pickTypFirst: "Seleziona prima il tipo", selectCategory: "Seleziona\u2026",
    },
    trips: {
      tripId: "ID viaggio", tripStatus: "Stato viaggio", tractor: "Motrice",
      facilitySequence: "Sequenza sedi", estEndTime: "Fine stimata",
      dragToAssign: "Trascina per assegnare", unassignedTrips: "VIAGGI NON ASSEGNATI",
      saveChanges: "Salva modifiche", createIssue: "Crea segnalazione", newIssue: "Nuova segnalazione",
    },
    calendar: {
      created: "Creato", driverUnavailable: "Autista non disponibile", assigned: "Assegnato",
      unassigned: "Non assegnato", estEnd: "Fine stim.", destination: "Destinazione",
      month: "Mese", week: "Settimana", day: "Giorno", allDrivers: "Tutti gli autisti",
      allVehicles: "Tutti i veicoli", vehicleOff: "Veic. assente", fullyAssigned: "Completamente assegnato",
      noVehicle: "Nessun veicolo", noDriver: "Nessun autista", orders: "Ordini", driverOff: "Autista libero",
    },
    fuelTracking: {
      expense: "Spesa", addExpense: "Aggiungi spesa", inclVat: "IVA incl.",
      volume: "Volume", payment: "Pagamento", card: "Carta",
      noExpenses: "Nessuna spesa carburante trovata", stats: "Statistiche",
      totalRecords: "Totale voci", pendingApproval: "In attesa di approvazione", approved: "Approvato",
      filters: "Filtri", searchPlaceholder: "Cerca veicolo, autista…",
    },
    holidays: {
      reason: "Motivo", start: "Inizio", end: "Fine", days: "Giorni",
      newEntry: "Nuova voce", searchPlaceholder: "Cerca autista, motivo…",
      leaveTypes: { "Annual Leave": "Ferie annuali", sick: "Malattia", Vacation: "Vacanza", Other: "Altro" },
    },
    offShift: {
      cycle: "Ciclo", firstLeaveDay: "Primo giorno di ferie", planUntil: "Pianifica fino al",
      searchPlaceholder: "Cerca autista…",
    },
    vehicles: {
      year: "Anno", lastPmi: "Ultimo controllo", tachographCal: "Calibrazione tachigrafo",
      searchPlaceholder: "Cerca per targa, deposito…", addVehicle: "Aggiungi veicolo",
    },
    places: {
      list: "Lista", map: "Mappa", city: "Città", postalCode: "Codice postale",
      depotMap: "Mappa depositi", plotted: "Visualizzati", pageSize: "Dimensione pagina",
      searchPlaceholder: "Cerca luoghi…", addPlace: "Aggiungi luogo",
      code: "Codice / ID", address: "Indirizzo", stateCounty: "Regione / Provincia", country: "Paese",
    },
    login: {
      tagline:       "Conformità & Gestione flotta",
      signIn:        "Accedi",
      signInDesc:    "Inserisci le tue credenziali per accedere alla piattaforma",
      emailLabel:    "Indirizzo e-mail",
      emailPlaceholder: "tu@azienda.it",
      passwordLabel: "Password",
      rememberMe:    "Ricordami",
      forgotPassword:"Password dimenticata?",
      submit:        "Accedi",
      submitting:    "Accesso in corso…",
      resetTitle:    "Reimposta password",
      resetDesc:     "Inserisci la tua email e ti invieremo un link di reimpostazione.",
      sendLink:      "Invia link",
      sending:       "Invio in corso…",
      backToSignIn:  "← Torna all'accesso",
      checkInbox:    "Controlla la tua casella",
      checkInboxDesc:"Se {email} è registrata, riceverai un link a breve.",
      errorDefault:  "Accesso non riuscito. Verifica le credenziali e riprova.",
    },
    inventoryHub: {
      tabDashboard:"Dashboard",tabParts:"Ricambi",tabJobCards:"Ordini di lavoro",tabPurchasing:"Acquisti",tabTyres:"Pneumatici & Fluidi",
      totalStockValue:"Valore totale del magazzino",stockoutVOR:"Rischio VOR",lowStockParts:"Ricambi con stock basso",deadStock:"Stock morto (>12m)",
      reorderAlerts:"Avvisi di riordino",stockValueByCategory:"Valore per categoria",recentMovements:"Movimenti di magazzino recenti",
      safetyCritical:"CRITICO PER LA SICUREZZA",addPart:"Aggiungi ricambio",scan:"Scansiona",adjust:"Rettifica",
      partsIssued:"Ricambi emessi",scanPart:"Scansiona ricambio",issueKit:"Emetti kit",newJobCard:"Nuovo ordine di lavoro",
      openPOs:"OA aperti",autoReorder:"Riordino automatico dovuto",coreReturns:"Resi nucleo €",raisePO:"Crea OA",raiseAllPOs:"Crea tutti gli OA",
      newPO:"Nuovo OA",purchaseOrders:"Ordini di acquisto",autoReorderSuggestions:"Suggerimenti riordino automatico",
      tyresToReplace:"Pneumatici da sostituire",advisoryTyres:"Pneumatici in osservazione",tyresTracked:"Pneumatici tracciati",
      tyreManagement:"Gestione pneumatici",fitTyre:"Monta pneumatico",bulkFluidDispensing:"Distribuzione fluidi",
      dispense:"Distribuisci",confirm:"Conferma",issuePMIKit:"Emetti kit PMI",stockout:"Esaurito",reorder:"Riordina",
    },
    complianceHub: {
      tabWalkaround:"Ispezione veicolo",tabDrivers:"Conducenti",tabDocuments:"Documenti",tabPlanner:"Pianificatore",
      tabTraining:"Formazione",tabFleet:"Flotta",tabAudit:"Registro audit",tabSettings:"Impostazioni",
      newWalkaround:"Nuova ispezione del veicolo",walkaroundSubmitted:"Ispezione inviata",
      noVehiclesFound:"Nessun veicolo trovato",noDriversFound:"Nessun conducente trovato",
      timerLocation:"Timer / Posizione",todayPhotograph:"Oggi devi fotografare:",takePhoto:"Scatta foto",
      advisory:"Avviso",pass:"Superato",fail:"Non superato",yes:"Sì",
      driverDeclaration:"Dichiarazione e firma del conducente",
      driverDeclarationText:"Dichiaro di aver effettuato il controllo giornaliero richiesto del veicolo identificato sopra e che, per quanto a mia conoscenza, è sicuro per circolare su strada.",
      signedBy:"Firmato da",submitWalkaround:"Invia ispezione veicolo",
      checkSummary:"Riepilogo del controllo",duration:"Durata",results:"Risultati",antiCheatPhoto:"Foto anti-frode",dangerous:"Pericoloso",
      checksCompletedToday:"Controlli completati oggi",defectsReportedToday:"Difetti segnalati oggi",
      avgCheckTime:"Tempo medio di controllo oggi",dvsaMinimum:"Minimo DVSA: 5 min.",
      recentWalkarounds:"Controlli recenti",noWalkarounds:"Nessun controllo di ispezione trovato.",
      nilDefect:"Nessun difetto",unableToLoad:"Impossibile caricare il dettaglio del controllo.",
      dvlaLicence:"Patente DVLA",refresh:"Aggiorna",davisRiskScore:"Punteggio di rischio DAVIS",entitlements:"Autorizzazioni",
      noEndorsements:"Nessuna annotazione registrata. Patente pulita confermata da DVLA.",
      driverCPC:"CPC conducente",dqc:"DQC",progress:"Progresso",modules:"Moduli",outstanding:"In sospeso",
      logCourse:"Registra corso completato",previousCycle:"Ciclo precedente (5 anni prima)",
      addRecord:"Aggiungi record",noTraining:"Nessun record di formazione.",noExpiry:"Nessuna scadenza",
      visaExpiry:"Scadenza visto",uploadPassport:"Carica passaporto / scansione BRP",
      auditTrail:"Registro audit",exportCsv:"Esporta CSV",allCategories:"Tutte le categorie",
      allActions:"Tutte le azioni",allUsers:"Tutti gli utenti",before:"Prima",after:"Dopo",
      noEvents:"Nessun evento corrisponde ai tuoi filtri.",
      expired:"Scaduto",expiringWithin90:"Scade entro 90 giorni",noDateSet:"Nessuna data impostata",
      bothPartiesSigned:"Entrambe le parti hanno firmato",multipleDocuments:"Più documenti",
      clickToEdit:"Clicca su una cella per modificare",noExpiries:"Nessuna data di scadenza registrata.",showAll:"Mostra tutto",
      documentType:"Documento",driverVehicle:"Conducente / Veicolo",expiry:"Scadenza",
      pmiBoard:"Pianificatore di manutenzione preventiva",bookIn:"Prenota",
      complianceManager:"Responsabile conformità",noManagerCandidates:"Nessun candidato responsabile trovato dall'API",
      olicenceMarginsChecker:"Verifica margine O-Licence",
      tachoInfringements:"Infrazioni tachigrafo & WTD",tachoIntegration:"Integrato tramite TruTac / Descartes API",
      accidentLog:"Registro incidenti & sinistri (FNOL)",reportAccident:"Segnala incidente",
      downloadFnol:"Scarica report FNOL",forsReport:"Report FORS / DVSA Earned Recognition",
      generateReport:"Genera report",reportAccidentFnol:"Segnala incidente (FNOL)",
      attachPhotos:"Allega foto della scena",
      notificationChannels:"Canali di notifica",emailChannel:"E-mail",
      mobileNotification:"Notifica mobile",dailyDigest:"Digest giornaliero",
      operationalEvents:"Eventi operativi",deliverAt:"Consegna alle",expiryAlerts:"Avvisi di scadenza",
      alertLabel:"Avviso",early:"Anticipo",remind:"Ricorda",off:"Spento",instant:"Immediato",
      allSettingsSaved:"Tutte le impostazioni salvate",unsavedChanges:"Modifiche non salvate",reset:"Ripristina",
      highRisk:"Alto rischio",cpcCritical:"CPC critico",checksDue:"Controlli dovuti",
      rtwExpiring:"RTW in scadenza",disqualified:"Squalificato",
      motExpiring:"Revisione ≤90gg",tachoCal:"Cal. tacho ≤90gg",lolerDue:"LOLER ≤90gg",
      fullyClear:"Tutto in regola",overdueVor:"Scaduto / VOR",dueWithin7:"Entro 7 giorni",
      pmiOnTime:"Tasso di puntualità PMI",
      expiredOverdue:"Scaduto / In ritardo",expiringSoon:"In scadenza",awaitingSignatures:"In attesa di firme",
      documentDetails:"Dettagli documento",editDocument:"Modifica documento",file:"File",
      noFileAttached:"Nessun file allegato",counterSigned:"Controfirmato",signed:"Firmato",uploaded:"Caricato",
      documentTitle:"Titolo documento",category:"Categoria",newCategory:"Nome nuova categoria",
      description:"Descrizione",notes:"Note",
      walkaroundTemplates:"Modelli di ispezione veicolo",
      walkaroundTemplatesDesc:"Crea modelli di controllo configurabili con tipi di domande, foto obbligatorie e logica condizionale. Assegna per veicolo.",
      helpText:"Testo di aiuto",questionType:"Tipo di domanda",dropdownOptions:"Opzioni a discesa",
      unitLabel:"Etichetta unità",requiredToSubmit:"Obbligatorio per inviare?",
      defectSeverity:"Gravità del difetto",conditionalDisplay:"Visualizzazione condizionale",
      noConditional:"Nessun'altra domanda in questa sezione con risposte selezionabili.",
      templateName:"Nome modello",vehicleAssignment:"Assegnazione veicolo",
      vehicleAssignmentDesc:"Un modello per veicolo. L'assegnazione qui lo rimuove dal modello attuale.",
      unassigned:"Non assegnato",sections:"Sezioni",checks:"Controlli",vehicles:"Veicoli",
      modified:"Modificato",actions:"Azioni",untitled:"Senza titolo",assign:"Assegna",
      totalCourses:"Corsi totali",completed:"Completato",awaitingApproval:"In attesa di approvazione",
      totalEnrolments:"Iscrizioni totali",noEnrolments:"Nessuna iscrizione ancora",
      back:"Indietro",publish:"Pubblica",archive:"Archivia",republish:"Ripubblica",
      courseInformation:"Informazioni del corso",completionSummary:"Riepilogo completamento",
      editCourseDetails:"Modifica dettagli corso",titleLabel:"Titolo",passMarkPct:"Voto minimo (%)",
      deadline:"Scadenza",assignTo:"Assegna a",allDrivers:"Tutti i conducenti",specificDrivers:"Conducenti specifici",
      autoApprove:"Approva auto. quando il conducente supera",saveDetails:"Salva dettagli",
      learningMaterials:"Materiali didattici",addMaterial:"Aggiungi materiale",
      addFirstMaterial:"Aggiungi primo materiale",noMaterials:"Nessun materiale ancora.",
      videoUrl:"URL video",pages:"Pagine",
      fileUploadNote:"Il caricamento di file sarà disponibile quando connesso al server",
      quizQuestions:"Domande del quiz",addQuestion:"Aggiungi domanda",addFirstQuestion:"Aggiungi prima domanda",
      noQuestions:"Nessuna domanda ancora.",quizQuestionType:"Tipo di domanda",scorePts:"Punteggio (punti)",questionText:"Testo della domanda",
      correctAnswer:"Risposta corretta",trueFalse:"Vero / Falso",freeText:"Testo libero (valutazione manuale)",
      multiChoiceSingle:"Scelta multipla (risposta singola)",multiChoiceMulti:"Scelta multipla (più risposte)",
      sampleAnswer:"Risposta campione",addOption:"Aggiungi opzione",
      driverEnrolments:"Iscrizioni conducenti",
      noDriversEnrolled:"Nessun conducente iscritto. Pubblica il corso e assegna i conducenti.",
      driverCol:"Conducente",statusCol:"Stato",attempts:"Tentativi",bestScore:"Miglior punteggio",
      driverSigned:"Conducente firmato",operatorSigned:"Operatore firmato",actionCol:"Azione",
      assessmentApproved:"Valutazione approvata",certFiled:"Certificato generato e archiviato nella documentazione del conducente.",
      assessmentRejected:"Valutazione rifiutata",answerReview:"Revisione risposte",scoreLabel:"Punteggio",
      attemptsLabel:"Tentativi",driverSignature:"Firma del conducente",signedLabel:"Firmato",
      cancel:"Annulla",searchDocs:"Cerca documenti...",searchCourses:"Cerca corsi...",antiCheatPhotoRequired:"📸 Screenshot richiesto",antiCheatInstruction:"Scatta una foto / screenshot del tuo schermo",backToChecks:"Torna ai controlli",backToEnrolments:"Torna alle iscrizioni",courseInfo:"Informazioni sul corso",editCourse:"Modifica dettagli corso",defectsReported:"Difetti segnalati",defectsWorkshopNotified:"Officina notificata",nilDefectCleared:"Nessun difetto approvato",noDefects:"Nessun difetto",ok:"OK",olicenceMargin:"Margine licenza O",passed:"Superato",photoRequired:"Foto richiesta",photoRequiredDefect:"Foto richiesta – difetto",requiredQuestion:"Obbligatorio",forsReadiness:"Preparazione FORS",loadingCheckDetail:"Caricamento dettagli...",loadingDrivers:"Caricamento conducenti...",loadingVehicles:"Caricamento veicoli...",signedOn:"Firmato il",suspiciousSpeed:"⚠️ Velocità sospetta",vehiclesPending:"Veicoli in attesa",workshopNotified:"Officina notificata",
      date:"Data",na:"N/A",notConnected:"Non connesso",integrations:"Integrazioni",sent:"Inviato",saving:"Salvataggio...",saved:"Salvato",saveChanges:"Salva modifiche",
      action:"Azione",apiErrorLocal:"Errore (dati locali)",at:"alle",certificate:"Certificato",details:"Dettagli",edit:"Modifica",rePublish:"Ripubblica",review:"Rivedi",sign:"Firma",status:"Stato",template:"Modello",
      reviewNote:"Rivedi le risposte, valuta le domande a testo libero, poi approva o rifiuta.",
    },
    drivers: { addTitle:"Aggiungi autista", editTitle:"Modifica autista", shiftPreference:"Preferenza turno", shiftNone:"Nessuno", shiftAllDays:"Tutti i giorni", shiftCustom:"Personalizzato", shiftStart:"Inizio turno", shiftEnd:"Fine turno", maxConsecDays:"Giorni cons. max", maxTripsWeek:"Viaggi max / sett.", licenceNo:"N. patente", noneSelected:"Nessuna selezione", statusActive:"Attivo", statusInactive:"Inattivo", statusPending:"In attesa", statusArchived:"Archiviato", noDriversFound:"Nessun autista trovato.", nameRequired:"Obbligatorio.", saveFailed:"Salvataggio fallito", statusUpdateFailed:"Aggiornamento stato fallito", retryLabel:"riprova" },
    fleetManagement: { exceptionEvents:"Eventi eccezionali", engineDiagnostics:"Diagnostica motore", tripHistory:"Storico viaggi", allFleets:"Tutte le flotte", vehicles:"Veicoli", drivers:"Autisti", onShift:"In servizio", monthlyDistance:"Distanza mensile", fuelThisMonth:"Carburante questo mese", newFleet:"Nuova flotta", vehicleLabel:"Veicolo", fleetLabel:"Flotta", yearLabel:"Anno", mph:"mph", rpm:"rpm", driverSafetyScore:"Punteggio sicurezza autista", critical:"Critico", warnings:"Avvisi", info:"Info", exceptionByType:"Eventi per tipo", noTripsToday:"Nessun viaggio oggi.", liveDiagnostic:"Snapshot diagnostica live", avgSpd:"Vel. media", endLabel:"Fine" },
    importHub: { autoImportEnabled:"Importazione automatica attiva", extensionNotDetected:"Estensione non rilevata", extensionActive:"Estensione attiva", yourColumn:"La tua colonna", fleeyesField:"Campo FleetYes", tripsToday:"Viaggi oggi", lastSync:"Ultima sync.", primary:"Principale", universalActivityLog:"Registro attivita universale", viewLabel:"Visualizza", tripsImportedToday:"Viaggi importati oggi", acrossAllProviders:"su tutti i provider", activeConnections:"Connessioni attive", syncFailures:"Errori sync.", providersConfigured:"Provider configurati", vendorGallery:"Galleria integrazioni" },
    orgSettings: { failedToLoad:"Impossibile caricare le impostazioni", orgSettings:"Impostazioni organizzazione", recordInfo:"Info record", drivingHours:"Ore di guida", workingHours:"Ore lavorative", myGeotab:"MyGeotab" },
  },

  // ── Polish ──────────────────────────────────────────────────────────────────
  pl: {
    nav: {
      dashboard:          "Panel",
      trips:              "Kursy",
      rota:               "Plan tygodniowy",
      importHub:          "Hub importu",
      calendar:           "Kalendarz",
      maintenanceTrips:   "Kursy serwisowe",
      drivers:            "Kierowcy",
      fleetManagement:    "Zarządzanie flotą",
      places:             "Miejsca",
      fuelTracking:       "Monitoring paliwa",
      parkingMonitoring:  "Monitoring parkingu",
      tollExpenses:       "Opłaty za przejazd",
      tollReceipts:       "Rachunki za przejazd",
      fuelReceipts:       "Rachunki za paliwo",
      holidays:           "Urlopy i nieobecności",
      offShift:           "Poza zmianą",
      maintenance:        "Serwis",
      compliance:         "Zgodność",
      inventory:          "Inwentarz",
      allocationSettings: "Ustawienia przydziału",
      groupTransport:     "Transport",
      groupExpenses:      "Koszty",
      groupPeople:        "Pracownicy",
      groupSettings:      "Ustawienia",
      issues:             "Zgłoszenia",
      fuel:               "Paliwo",
      toll:               "Opłaty drogowe",
    },
    topbar: {
      profile:    "Mój profil",
      settings:   "Ustawienia",
      logout:     "Wyloguj się",
      lightMode:  "Jasny",
      darkMode:   "Ciemny",
      systemMode: "System",
      language:   "Język",
    },
    common: {
      save:"Zapisz",cancel:"Anuluj",upload:"Prześlij",download:"Pobierz",search:"Szukaj",new:"Nowy",edit:"Edytuj",delete:"Usuń",submit:"Wyślij",back:"Wstecz",loading:"Ładowanie…",addVehicle:"Dodaj pojazd",export:"Eksportuj",filter:"Filtruj",refresh:"Odśwież",active:"Aktywny",inactive:"Nieaktywny",pending:"Oczekujący",resolved:"Rozwiązany",allVehicles:"Wszystkie pojazdy",today:"Dziś",thisMonth:"W tym miesiącu",selectAll:"Zaznacz wszystkie",tryAgain:"Spróbuj ponownie",records:"wpisów",noData:"Brak danych",
      date:"Data",vehicle:"Pojazd",driver:"Kierowca",status:"Status",action:"Akcja",ref:"Ref",route:"Trasa",type:"Typ",amount:"Kwota",method:"Metoda",litres:"Litry",costPerLitre:"Koszt/L",totalCost:"Koszt całkowity",odometer:"Przebieg (km)",mpg:"L/100km",depot:"Baza",duration:"Czas trwania",location:"Lokalizacja",cost:"Koszt",fleet:"Flota",name:"Nazwa",phone:"Telefon",email:"Email",country:"Kraj",licence:"Prawo jazdy",notes:"Notatki",
      view:"Pokaż",reconcile:"Uzgodnij",addNew:"Dodaj",assign:"Przypisz",approve:"Zatwierdź",reject:"Odrzuć",newCharge:"Nowa opłata",details:"Szczegóły",close:"Zamknij",
      createRecord:"Utwórz rekord",saving:"Zapisywanie…",creating:"Tworzenie…",
      clearAll:"Wyczyść wszystko",apply:"Zastosuj",stats:"Statystyki",noRecordsFound:"Nie znaleziono rekordów",
      dropFile:"Upuść plik lub kliknij, aby przeglądać",supports:"Obsługuje .xlsx, .xls, .csv",clickToChange:"kliknij, aby zmienić",
      importComplete:"Import zakończony",importFailed:"Import nie powiódł się",rowsImported:"zaimportowano",rowsSkipped:"pominięto",
      someRowsHadErrors:"Niektóre wiersze zawierały błędy",downloadErrorLog:"Pobierz dziennik błędów",tryAgainBtn:"Spróbuj ponownie",
      all:"Wszystkie",reconciled:"Uzgodnione",scheduled:"Zaplanowane",dispatched:"Wysłane",started:"Rozpoczęte",completed:"Ukończone",cancelled:"Anulowane",
      tripsToday:"Kursy dziś",driversAvailable:"Dostępni kierowcy",fleetSize:"Wielkość floty",thisWeek:"Ten tydzień",available:"dostępny/ch",onLeave:"na urlopie",noTripsToday:"Brak kursów na dziś",nothingScheduled:"Nic nie zaplanowano na dziś",createTrip:"Utwórz kurs →",driverStatus:"Status kierowców",allDrivers:"Wszyscy kierowcy",todaysTrips:"Dzisiejsze kursy",weekAtGlance:"Tydzień w skrócie",vehicleDowntime:"Przestoje pojazdów",upcomingLeave:"Nadchodzące urlopy",viewCalendar:"Pokaż kalendarz",manage:"Zarządzaj",viewAll:"Pokaż wszystkie",tripsMonSun:"kursy pon–nd",active2:"aktywny/ch",done:"ukończony/ch",awaitingDispatch:"Oczekuje na wysyłkę",ofTotal:"z {n} ogółem",vehiclesRegistered:"zarejestrowanych pojazdów",vehiclesOff:"{n} pojazd(ów) nieobecny/ch dziś",needsDriver:"{n} kurs(ów) bez kierowcy dziś",
      goodMorning:"Dzień dobry",goodAfternoon:"Dzień dobry",goodEvening:"Dobry wieczór",
      searchPlaceholder:"Szukaj…",searchVehicles:"Szukaj wg rejestr., kierowcy, bazy…",searchDrivers:"Szukaj kierowców…",
      noDriverAssigned:"Brak przypisanego kierowcy",driverAssigned:"Kierowca przypisany",ongoing:"W toku",noUpcomingDowntime:"Brak zaplanowanych przestojów",noUpcomingLeave:"Brak urlopów w ciągu 7 dni",consumptionByVehicle:"Zużycie wg pojazdu (30 dni)",address:"Adres",
      at:"o",for:"dla",of:"z",
    },
    pages: {
      dashboard:          { title: "Panel",                        subtitle: "Twoje operacyjne podsumowanie dnia." },
      trips:              { title: "Kursy",                        subtitle: "Zarządzaj i monitoruj wszystkie zlecenia transportowe." },
      rota:               { title: "Tygodniowy plan kierowców",    subtitle: "Planuj i zarządzaj przydziałami kierowców na tydzień." },
      importHub:          { title: "Hub importu",                  subtitle: "Centralna kontrola wszystkich połączeń danych dostawców i ręcznych importów." },
      calendar:           { title: "Kalendarz",                    subtitle: "Przeglądaj i planuj kursy w kalendarzu." },
      drivers:            { title: "Kierowcy",                     subtitle: "Zarządzaj profilami kierowców, prawami jazdy i zgodnością CPC." },
      fleetManagement:    { title: "Zarządzanie flotą",            subtitle: "Telematyka na żywo, diagnostyka i administracja — zasilana przez API MyGeotab." },
      places:             { title: "Miejsca",                      subtitle: "Zarządzaj bazami, lokalizacjami klientów i częstymi przystankami." },
      fuelTracking:       { title: "Monitoring paliwa",            subtitle: "Monitoruj zużycie, efektywność i koszty paliwa na pojazd." },
      parkingMonitoring:  { title: "Monitoring parkingu",          subtitle: "Śledź korzystanie z parkingów dla ciężarówek, koszty i zatwierdzone lokalizacje." },
      tollExpenses:       { title: "Opłaty za przejazd",           subtitle: "Śledź opłaty drogowe, mostowe i tunelowe w całej flocie." },
      tollReceipts:       { title: "Rachunki za przejazd",         subtitle: "Przechwytywanie faktur VAT za opłaty drogowe floty." },
      fuelReceipts:       { title: "Rachunki za paliwo",           subtitle: "Zarządzanie i zatwierdzanie rachunków za paliwo z odliczeniem VAT." },
      holidays:           { title: "Urlopy i nieobecności",        subtitle: "Zarządzaj urlopami wypoczynkowymi, zwolnieniami lekarskimi i nieobecnościami szkoleniowymi." },
      offShift:           { title: "Poza zmianą i odpoczynek",     subtitle: "Monitoruj zgodność czasu odpoczynku kierowców z przepisami UE (min. 11h na dobę)." },
      maintenance:        { title: "Hub serwisowy",                subtitle: "Planuj i śledź przeglądy, naprawy i inspekcje pojazdów." },
      maintenanceTrips:   { title: "Kursy serwisowe",              subtitle: "Przestoje pojazdów i zdarzenia trasowe z kalendarza." },
      compliance:         { title: "Hub zgodności",                subtitle: "Zarządzaj dokumentami regulacyjnymi, licencjami i gotowością do audytów." },
      inventory:          { title: "Hub inwentarza",               subtitle: "Śledź części, materiały eksploatacyjne i zapasy we wszystkich bazach." },
      allocationSettings: { title: "Ustawienia przydziału",        subtitle: "Konfiguruj reguły parowania kierowców i automatyczny przydział kursów." },
      vehicles:           { title: "Pojazdy",                      subtitle: "Przeglądaj i zarządzaj pełnym rejestrem pojazdów." },
      fleets:             { title: "Floty",                        subtitle: "Zarządzaj grupami floty i przydziałami kierowców." },
      issues:             { title: "Zgłoszenia",                   subtitle: "Rejestruj i zarządzaj zgłoszeniami dotyczącymi pojazdów, kierowców i operacji." },
    },
    rota: {
      step1Label: "Wczytywanie kierowców",       step1Detail: "Ładowanie profili kierowców i wzorców zmian",
      step2Label: "Pobieranie planu urlopów",    step2Detail: "Sprawdzanie zatwierdzonych urlopów i nieobecności",
      step3Label: "Sprawdzanie przydziałów",     step3Detail: "Wyszukiwanie nieprzypisanych kursów w tym tygodniu",
      step4Label: "Budowanie harmonogramu",      step4Detail: "Przypisywanie kierowców do ich kursów, prawie gotowe…",
      workingDay: "Dzień roboczy", restDay: "Dzień wolny", holiday: "Urlop",
      unavailable: "Niedostępny", off: "Wolny", notOnRota: "Nie w planie",
      sun: "Nd", mon: "Pn", tue: "Wt", wed: "Śr", thu: "Cz", fri: "Pt", sat: "Sb",
      allocationPeriod: "Okres przydziału", assignDriver: "Przypisz kierowcę", assignTruck: "Przypisz ciągnik",
      noRoute: "Brak trasy", history: "Historia", stats: "Statystyki", relay: "Przekazanie", add: "Dodaj",
      autoAllocate: "Automatyczny przydział", user: "Użytkownik", exportRelay: "Eksportuj przekazanie",
      unassignedTrips: "NIEPRZYPISANE KURSY", dragToAssign: "Przeciągnij aby przypisać",
      violations: "{n} naruszeń · {w} ostrzeżenie", warnings: "{w} ostrzeżenie", warningsLabel: "Ostrzeżenia", violationsLabel: "Naruszenia",
      grid: "Siatka", analysis: "Analiza",
      allCompliant: "Wszyscy zgodni", checkingCompliance: "Sprawdzanie zgodności…",
      noUnassignedTrips: "Brak nieprzypisanych kursów",
      complianceReport: "Raport zgodności", allClear: "Wszystko w porządku",
      noComplianceDesc: "Nie wykryto naruszeń ani ostrzeżeń dotyczących zgodności w tym tygodniu. Wszyscy kierowcy mieszczą się w dozwolonych godzinach.",
      issuesTab: "Problemy", rulesRef: "Odniesienie do zasad",
      allocationBlocked: "Przydział zablokowany", complianceViolationBlocked: "Naruszenie zgodności uniemożliwia to przypisanie",
      understood: "Rozumiem",
      reassignTitle: "Przypisz ponownie", currentlyAssigned: "Aktualnie przypisany", willBeReplacedWith: "Zostanie zastąpiony przez",
      existingTripUnassigned: "Istniejący kurs zostanie cofnięty i zwrócony do puli nieprzypisanych.",
      driver: "Kierowca", hrs: "Godz.",
      complianceViolation: "Naruszenie zgodności", complianceWarning: "Ostrzeżenie o zgodności",
      complianceCompliant: "Zgodny", driversWithIssues: "{n} kierowca z problemami",
    },
    maintenance: {
      upcoming: "Nadchodzące", historical: "Historia",
      searchPlaceholder: "Szukaj pojazdu, powodu…",
      records: "wpisów", ofRecords: "z",
      refresh: "Odśwież", export: "Eksportuj",
      colVehicle: "Pojazd", colDateRange: "Okres", colDays: "Dni", colWhen: "Kiedy",
      loading: "Ładowanie zdarzeń serwisowych…", tryAgain: "Spróbuj ponownie",
      noUpcoming: "Brak nadchodzących serwisów",  noUpcomingDesc: "Żaden postój pojazdu nie jest aktualnie zaplanowany.",
      noHistorical: "Brak historycznych wpisów",  noHistoricalDesc: "Nie znaleziono minionych zdarzeń serwisowych.",
      statusActive: "Aktywny", statusUpcoming: "Nadchodzący", statusCompleted: "Zakończony",
      today: "Dziś", inDays: "Za {n}d", daysAgo: "{n}d temu", durationDays: "{n}d",
    },
    trips: {
      tripId: "ID kursu", tripStatus: "Status kursu", tractor: "Ciągnik siodłowy",
      facilitySequence: "Kolejność miejsc", estEndTime: "Szacowany czas zakończenia",
      dragToAssign: "Przeciągnij aby przypisać", unassignedTrips: "NIEPRZYPISANE KURSY",
      saveChanges: "Zapisz zmiany", createIssue: "Utwórz zgłoszenie", newIssue: "Nowe zgłoszenie",
    },
    calendar: {
      created: "Utworzono", driverUnavailable: "Kierowca niedostępny", assigned: "Przypisano",
      unassigned: "Nieprzypisany", estEnd: "Szac. koniec", destination: "Cel",
      month: "Miesiąc", week: "Tydzień", day: "Dzień", allDrivers: "Wszyscy kierowcy",
      allVehicles: "Wszystkie pojazdy", vehicleOff: "Pojazd nieob.", fullyAssigned: "W pełni przypisany",
      noVehicle: "Brak pojazdu", noDriver: "Brak kierowcy", orders: "Zlecenia", driverOff: "Kierowca wolny",
    },
    maintenanceHub: {
      tabDashboard: "Dashboard", tabPMI: "Arkusz PMI", tabDefects: "Usterki", tabSettings: "Ustawienia",
      kpiVOR: "VOR (Wyłączony)", kpiVORSub: "unieruchomione pojazdy",
      kpiDueSoon: "Termin za 7 dni", kpiDueSoonSub: "wymaga rezerwacji",
      kpiCompliant: "W pełni zgodny", kpiCompliantSub: "pojazdy w zielonym",
      kpiPMIRate: "Terminowość PMI", kpiPMIRateSub: "Cel DVSA: 100%",
      earnedRecognition: "KPI Wypracowane uznanie", dvsaScheme: "Program DVSA", target: "Cel: {n}%",
      fleetStatusBoard: "Tablica statusu floty", compliant: "Zgodny", dueSoon: "Wkrótce wymagany", overdueVOR: "Przeterminowany/VOR",
      pmiSchedule: "8-tygodniowy harmonogram PMI", noPMIsDue: "Brak PMI do wykonania",
      driver: "Kierowca", nextPMI: "Następny PMI", daysOverdue: "{n}d spóźnienia", dueToday: "Wymagany dziś", dueIn: "Wymagany za {n}d",
      pmiSheet: "Harmonogram PMI — Wszystkie pojazdy", allVehicles: "Wszystkie pojazdy", clickToInspect: "Kliknij wiersz, aby otworzyć arkusz inspekcji",
      inspectionProgress: "Postęp inspekcji", itemsCompleted: "Ukończone elementy", results: "Wyniki", location: "Lokalizacja", interval: "Interwał",
      technicianDecl: "Oświadczenie technika", sign: "Podpisz", signed: "Podpisano", signFirst: "Podpisz powyższe oświadczenie, aby umożliwić przesłanie.",
      submitPMI: "Wyślij raport PMI", pmiSubmitted: "PMI wysłany", backToSchedule: "← Powrót do harmonogramu",
      brakeTest: "Wyniki testu hamulców (wymagane DVSA)", axle1: "Skuteczność osi 1 (%)", axle2: "Skuteczność osi 2 (%)",
      meetsDVSA: "✓ Spełnia minimum DVSA (50%)", belowDVSA: "✗ Poniżej minimum DVSA – NIEZALICZONY",
      openDefects: "Otwarte usterki", resolved: "Rozwiązano", totalDefects: "Wszystkie usterki",
      requiresAction: "wymaga działania", completed: "ukończono", allTime: "łącznie",
      rectificationRecord: "Protokół naprawy", partsUsed: "Użyte części:", labour: "Roboczogodziny:", signedOffBy: "Zatwierdzone przez:",
      logRectification: "Zarejestruj naprawę", markRoadworthy: "Oznacz jako zdatny do drogi & Zatwierdź", signedOffRoadworthy: "✓ Zatwierdzone jako zdatne do drogi",
      vehicleProfiles: "Profile pojazdów", addVehicle: "Dodaj pojazd", userRolesPerms: "Role & uprawnienia użytkownika", inviteUser: "Zaprosić użytkownika",
      notificationEngine: "Silnik powiadomień", customChecklist: "Elementy listy kontrolnej", addItem: "Dodaj element", remove: "Usuń",
      dataExport: "Eksport danych & integracje", vorAlert: "{n} pojazd{s} wyłączony", schedule: "← Harmonogram",
      pass: "Z", advisory: "D", fail: "N",
    },
    issues: {
      newIssue: "Nowe zgłoszenie", critical: "Krytyczny", high: "Wysoki", medium: "Średni", low: "Niski",
      inProgress: "W trakcie", open: "Otwarte", report: "Raport", priority: "Priorytet",
      assignee: "Odpowiedzialny", backlogged: "Zaległe", requiresUpdate: "Wymaga aktualizacji",
      inReview: "W przeglądzie", saveChanges: "Zapisz", createIssue: "Utwórz zgłoszenie",
      unassigned: "Nieprzypisany",
      type: "Typ", category: "Kategoria", assignedTo: "Przypisano do", reportedBy: "Zgłoszone przez",
      incidentLocation: "Miejsce zdarzenia", pinLocation: "Oznacz lokalizację", hideMap: "Ukryj mapę",
      noLocationPinned: "Brak oznaczonej lokalizacji \u2014 kliknij \u201eOznacz lokalizacj\u0119\u201c aby doda\u0107 marker",
      scheduledMaintenance: "Zaplanowany serwis", pending: "Oczekujące", closed: "Zamknięte",
      pickTypFirst: "Najpierw wybierz typ", selectCategory: "Wybierz\u2026",
    },
    fuelTracking: {
      expense: "Wydatek", addExpense: "Dodaj wydatek", inclVat: "z VAT",
      volume: "Objętość", payment: "Płatność", card: "Karta",
      noExpenses: "Nie znaleziono wydatków paliwowych", stats: "Statystyki",
      totalRecords: "Łączna liczba wpisów", pendingApproval: "Oczekuje na zatwierdzenie", approved: "Zatwierdzone",
      filters: "Filtry", searchPlaceholder: "Szukaj pojazdu, kierowcy…",
    },
    fuelReceipts: {
      captured:"Przechwycony", supplier:"Dostawca", product:"Produkt",
      duplicate:"Duplikat", receipt:"Paragon", uploadZip:"Przeslij ZIP",
      searchPlaceholder:"Szukaj wg pojazdu, dostawcy...",
      addModalTitle:"Dodaj rachunki za paliwo",
      addModalSubtitle:"Upusc obrazy lub PDF - zostana spakowane i wyslane automatycznie do OCR",
      dropTitle:"Przeciagnij & upusc rachunki tutaj", dropActive:"Upusc, aby dodac",
      dropHint:"lub kliknij, aby przegladac - JPEG, PNG, WebP, PDF",
      filesSelected:"{n} plik{s} wybranych",
      stepZipping:"Pakowanie", stepUploading:"Przesylanie",
      stepImporting:"Import", stepProcessing:"Przetwarzanie OCR",
      progressZipping:"Pakowanie {n} pliku{s}...", progressUploading:"Przesylanie na serwer...",
      progressImporting:"Importowanie rachunkow...", progressProcessing:"Uruchamianie OCR...",
      processingNote:"Moze to chwile potrwac w przypadku duzych partii",
      successTitle:"Przesylanie & przetwarzanie zakonczone", successCount:"Zaimportowano {n} rachunek/rachunki",
      errorTitle:"Przesylanie nie powiodlo sie",
      btnAdd:"Dodaj", btnUpload:"Przeslij {n} plik{s}", btnDone:"Gotowe - Odswiez liste",
      btnTryAgain:"Sprobuj ponownie", btnClose:"Zamknij",
      filterTitle:"Filtruj rachunki", anyDriver:"Dowolny kierowca", anyStatus:"Dowolny status",
      capturedFrom:"Przechwycone od", capturedTo:"Przechwycone do",
      detailTitle:"Szczegoly rachunku za paliwo", ocrData:"Dane wyodrebnione OCR", rawText:"Tekst surowy",
      colOcrStatus:"Status OCR", colCapturedAt:"Przechwycone",
    },
    parking: {
      pageOf: "Strona", searchPlaceholder: "Szukaj pojazdu, lokalizacji…",
    },
    tollReceipts: {
      upload:"Przeslij", entryPoint:"Punkt wjazdu", exitPoint:"Punkt wyjazdu",
      vehicleClass:"Klasa pojazdu", searchPlaceholder:"Szukaj pojazdu, trasy...",
      addModalTitle:"Dodaj rachunki za przejazd",
      addModalSubtitle:"Upusc obrazy lub PDF - zostana spakowane i wyslane automatycznie do OCR",
      dropTitle:"Przeciagnij & upusc rachunki tutaj", dropActive:"Upusc, aby dodac",
      dropHint:"lub kliknij, aby przegladac - JPEG, PNG, WebP, PDF",
      filesSelected:"{n} plik{s} wybranych",
      stepZipping:"Pakowanie", stepUploading:"Przesylanie",
      stepImporting:"Import", stepProcessing:"Przetwarzanie OCR",
      progressZipping:"Pakowanie {n} pliku{s}...", progressUploading:"Przesylanie na serwer...",
      progressImporting:"Importowanie rachunkow...", progressProcessing:"Uruchamianie OCR...",
      processingNote:"Moze to chwile potrwac w przypadku duzych partii",
      successTitle:"Przesylanie & przetwarzanie zakonczone", successCount:"Zaimportowano {n} rachunek/rachunki",
      errorTitle:"Przesylanie nie powiodlo sie",
      btnAdd:"Dodaj", btnUpload:"Przeslij {n} plik{s}", btnDone:"Gotowe - Odswiez liste",
      btnTryAgain:"Sprobuj ponownie", btnClose:"Zamknij",
      filterTitle:"Filtruj rachunki", anyDriver:"Dowolny kierowca", anyStatus:"Dowolny status",
      capturedFrom:"Przechwycone od", capturedTo:"Przechwycone do",
      sendTitle:"Wyslij do Amazon", sendSubtitle:"Przeslij oplaty za przejazd do Amazon Relay za wybrany okres",
      sendFromDate:"Data od", sendToDate:"Data do", sendPreviewBtn:"Podglad danych przed wyslaniem", sendDownloading:"Pobieranie...",
      sendBtn:"Wyslij do Amazon Relay", sendSending:"Wysylanie...",
      sendWarning:"Spowoduje to przeslanie wszystkich przetworzonych oplat za przejazd w wybranym zakresie dat do Amazon Relay.",
      sendSuccess:"Przeslano pomyslnie",
      sendSuccessMsg:"Oplaty za przejazd zostaly wyslane do Amazon Relay.",
      colChargeEx:"Oplata (bez VAT)", colVat:"VAT",
      colChargeInc:"Oplata (z VAT)", colProcessingStatus:"Status przetwarzania",
    },
    holidays: {
      reason: "Powód", start: "Początek", end: "Koniec", days: "Dni",
      newEntry: "Nowy wpis", searchPlaceholder: "Szukaj kierowcy, powodu…",
      leaveTypes: { "Annual Leave": "Urlop wypoczynkowy", sick: "Zwolnienie lekarskie", Vacation: "Urlop", Other: "Inne" },
    },
    offShift: {
      cycle: "Cykl", firstLeaveDay: "Pierwszy dzień urlopu", planUntil: "Planuj do",
      searchPlaceholder: "Szukaj kierowcy…",
    },
    vehicles: {
      year: "Rok", lastPmi: "Ostatni przegląd", tachographCal: "Kalibracja tachografu",
      searchPlaceholder: "Szukaj wg rejestr., bazy…", addVehicle: "Dodaj pojazd",
    },
    places: {
      list: "Lista", map: "Mapa", city: "Miasto", postalCode: "Kod pocztowy",
      depotMap: "Mapa baz", plotted: "Wyświetlone", pageSize: "Rozmiar strony",
      searchPlaceholder: "Szukaj miejsc…", addPlace: "Dodaj miejsce",
      code: "Kod / ID", address: "Adres", stateCounty: "Województwo / Powiat", country: "Kraj",
    },
    login: {
      tagline:       "Zgodność i zarządzanie flotą",
      signIn:        "Zaloguj się",
      signInDesc:    "Wprowadź swoje dane, aby uzyskać dostęp do platformy",
      emailLabel:    "Adres e-mail",
      emailPlaceholder: "ty@firma.pl",
      passwordLabel: "Hasło",
      rememberMe:    "Zapamiętaj mnie",
      forgotPassword:"Nie pamiętasz hasła?",
      submit:        "Zaloguj się",
      submitting:    "Logowanie…",
      resetTitle:    "Zresetuj hasło",
      resetDesc:     "Podaj swój adres e-mail, a wyślemy Ci link do resetowania.",
      sendLink:      "Wyślij link",
      sending:       "Wysyłanie…",
      backToSignIn:  "← Powrót do logowania",
      checkInbox:    "Sprawdź skrzynkę odbiorczą",
      checkInboxDesc:"Jeśli {email} jest zarejestrowany, wkrótce otrzymasz link resetujący.",
      errorDefault:  "Logowanie nie powiodło się. Sprawdź dane i spróbuj ponownie.",
    },
    inventoryHub: {
      tabDashboard:"Panel",tabParts:"Części",tabJobCards:"Zlecenia serwisowe",tabPurchasing:"Zakupy",tabTyres:"Opony i Ciecze",
      totalStockValue:"Łączna wartość magazynu",stockoutVOR:"Ryzyko VOR",lowStockParts:"Części z niskim stanem",deadStock:"Martwy zapas (>12m)",
      reorderAlerts:"Alerty uzupełnienia",stockValueByCategory:"Wartość magazynu wg kategorii",recentMovements:"Ostatnie ruchy magazynowe",
      safetyCritical:"KRYTYCZNE DLA BEZPIECZEŃSTWA",addPart:"Dodaj część",scan:"Skanuj",adjust:"Koryguj",
      partsIssued:"Wydane części",scanPart:"Skanuj część",issueKit:"Wydaj zestaw",newJobCard:"Nowe zlecenie",
      openPOs:"Otwarte ZZ",autoReorder:"Automatyczne uzupełnienie",coreReturns:"Zwroty rdzeni €",raisePO:"Utwórz ZZ",raiseAllPOs:"Utwórz wszystkie ZZ",
      newPO:"Nowe ZZ",purchaseOrders:"Zamówienia zakupu",autoReorderSuggestions:"Propozycje automatycznego uzupełnienia",
      tyresToReplace:"Opony do wymiany",advisoryTyres:"Opony pod obserwacją",tyresTracked:"śledzone opony",
      tyreManagement:"Zarządzanie oponami",fitTyre:"Załóż oponę",bulkFluidDispensing:"Dozowanie płynów masowych",
      dispense:"Dozuj",confirm:"Potwierдź",issuePMIKit:"Wydaj zestaw PMI",stockout:"Brak w magazynie",reorder:"Uzupełnij",
    },
    complianceHub: {
      tabWalkaround:"Obchód pojazdu",tabDrivers:"Kierowcy",tabDocuments:"Dokumenty",tabPlanner:"Planista",
      tabTraining:"Szkolenie",tabFleet:"Flota",tabAudit:"Dziennik audytu",tabSettings:"Ustawienia",
      newWalkaround:"Nowy obchód pojazdu",walkaroundSubmitted:"Obchód zgłoszony",
      noVehiclesFound:"Nie znaleziono pojazdów",noDriversFound:"Nie znaleziono kierowców",
      timerLocation:"Timer / Lokalizacja",todayPhotograph:"Dziś musisz sfotografować:",takePhoto:"Zrób zdjęcie",
      advisory:"Porada",pass:"Zaliczono",fail:"Niezaliczono",yes:"Tak",
      driverDeclaration:"Oświadczenie i podpis kierowcy",
      driverDeclarationText:"Oświadczam, że przeprowadziłem wymagane codzienne sprawdzenie obchodowe pojazdu wskazanego powyżej i według mojej najlepszej wiedzy jest on bezpieczny do jazdy po drodze.",
      signedBy:"Podpisano przez",submitWalkaround:"Wyślij obchód pojazdu",
      checkSummary:"Podsumowanie kontroli",duration:"Czas trwania",results:"Wyniki",antiCheatPhoto:"Zdjęcie anty-oszustwo",dangerous:"Niebezpieczny",
      checksCompletedToday:"Kontrole wykonane dziś",defectsReportedToday:"Defekty zgłoszone dziś",
      avgCheckTime:"Średni czas kontroli dziś",dvsaMinimum:"Minimum DVSA: 5 min.",
      recentWalkarounds:"Ostatnie obchody pojazdów",noWalkarounds:"Nie znaleziono obchodów pojazdów.",
      nilDefect:"Brak usterek",unableToLoad:"Nie można załadować szczegółów kontroli.",
      dvlaLicence:"Prawo jazdy DVLA",refresh:"Odśwież",davisRiskScore:"Wskaźnik ryzyka DAVIS",entitlements:"Uprawnienia",
      noEndorsements:"Brak adnotacji. Czyste prawo jazdy potwierdzone przez DVLA.",
      driverCPC:"CPC kierowcy",dqc:"DQC",progress:"Postęp",modules:"Moduły",outstanding:"Zaległe",
      logCourse:"Zarejestruj ukończony kurs",previousCycle:"Poprzedni cykl (5 lat wcześniej)",
      addRecord:"Dodaj zapis",noTraining:"Brak akt szkoleniowych.",noExpiry:"Brak daty wygaśnięcia",
      visaExpiry:"Wygaśnięcie wizy",uploadPassport:"Prześlij paszport / skan BRP",
      auditTrail:"Dziennik audytu",exportCsv:"Eksportuj CSV",allCategories:"Wszystkie kategorie",
      allActions:"Wszystkie akcje",allUsers:"Wszyscy użytkownicy",before:"Przed",after:"Po",
      noEvents:"Żadne zdarzenia nie pasują do filtrów.",
      expired:"Wygasły",expiringWithin90:"Wygaśnie w ciągu 90 dni",noDateSet:"Brak ustawionej daty",
      bothPartiesSigned:"Obie strony podpisały",multipleDocuments:"Wiele dokumentów",
      clickToEdit:"Kliknij komórkę, aby edytować",noExpiries:"Brak dat wygaśnięcia.",showAll:"Pokaż wszystko",
      documentType:"Dokument",driverVehicle:"Kierowca / Pojazd",expiry:"Wygaśnięcie",
      pmiBoard:"Planer konserwacji zapobiegawczej",bookIn:"Zarejestruj",
      complianceManager:"Menedżer zgodności",noManagerCandidates:"Brak kandydatów na menedżera z API",
      olicenceMarginsChecker:"Weryfikator marginesu licencji O",
      tachoInfringements:"Naruszenia tachografu i WTD",tachoIntegration:"Zintegrowane przez TruTac / Descartes API",
      accidentLog:"Dziennik wypadków i incydentów (FNOL)",reportAccident:"Zgłoś wypadek",
      downloadFnol:"Pobierz raport FNOL",forsReport:"Raport FORS / DVSA Earned Recognition",
      generateReport:"Generuj raport",reportAccidentFnol:"Zgłoś wypadek (FNOL)",
      attachPhotos:"Załącz zdjęcia z miejsca",
      notificationChannels:"Kanały powiadomień",emailChannel:"E-mail",
      mobileNotification:"Powiadomienie mobilne",dailyDigest:"Codzienny skrót",
      operationalEvents:"Zdarzenia operacyjne",deliverAt:"Doręcz o",expiryAlerts:"Alerty wygaśnięcia",
      alertLabel:"Alert",early:"Wcześnie",remind:"Przypomnij",off:"Wyłączony",instant:"Natychmiastowy",
      allSettingsSaved:"Wszystkie ustawienia zapisane",unsavedChanges:"Niezapisane zmiany",reset:"Zresetuj",
      highRisk:"Wysokie ryzyko",cpcCritical:"CPC krytyczne",checksDue:"Zaległe kontrole",
      rtwExpiring:"RTW wygasa",disqualified:"Zdyskwalifikowany",
      motExpiring:"Przegląd ≤90d",tachoCal:"Kal. tacho ≤90d",lolerDue:"LOLER ≤90d",
      fullyClear:"Całkowicie poprawny",overdueVor:"Zaległy / VOR",dueWithin7:"W ciągu 7 dni",
      pmiOnTime:"Wskaźnik terminowości PMI",
      expiredOverdue:"Wygasły / Po terminie",expiringSoon:"Wkrótce wygasa",awaitingSignatures:"Oczekuje na podpisy",
      documentDetails:"Szczegóły dokumentu",editDocument:"Edytuj dokument",file:"Plik",
      noFileAttached:"Brak załączonego pliku",counterSigned:"Kontrasygnowany",signed:"Podpisany",uploaded:"Prześlany",
      documentTitle:"Tytuł dokumentu",category:"Kategoria",newCategory:"Nazwa nowej kategorii",
      description:"Opis",notes:"Notatki",
      walkaroundTemplates:"Szablony obchodu pojazdu",
      walkaroundTemplatesDesc:"Tworzenie konfigurowalnych szablonów kontrolnych z typami pytań, obowiązkowymi zdjęciami i logiką warunkową. Przypisz na pojazd.",
      helpText:"Tekst pomocy",questionType:"Typ pytania",dropdownOptions:"Opcje listy rozwijanej",
      unitLabel:"Etykieta jednostki",requiredToSubmit:"Wymagane do przesłania?",
      defectSeverity:"Waga usterki",conditionalDisplay:"Wyświetlanie warunkowe",
      noConditional:"Brak innych pytań w tej sekcji z odpowiedziami do wyboru.",
      templateName:"Nazwa szablonu",vehicleAssignment:"Przypisanie pojazdu",
      vehicleAssignmentDesc:"Jeden szablon na pojazd. Przypisanie tutaj usuwa go z bieżącego szablonu.",
      unassigned:"Nieprzypisany",sections:"Sekcje",checks:"Kontrole",vehicles:"Pojazdy",
      modified:"Zmodyfikowano",actions:"Akcje",untitled:"Bez tytułu",assign:"Przypisz",
      totalCourses:"Kursy ogółem",completed:"Ukończono",awaitingApproval:"Oczekuje na zatwierdzenie",
      totalEnrolments:"Ogółem rejestracji",noEnrolments:"Brak rejestracji",
      back:"Powrót",publish:"Opublikuj",archive:"Archiwizuj",republish:"Opublikuj ponownie",
      courseInformation:"Informacje o kursie",completionSummary:"Podsumowanie ukończenia",
      editCourseDetails:"Edytuj szczegóły kursu",titleLabel:"Tytuł",passMarkPct:"Próg zaliczenia (%)",
      deadline:"Termin",assignTo:"Przypisz do",allDrivers:"Wszyscy kierowcy",specificDrivers:"Określeni kierowcy",
      autoApprove:"Zatwierdź autom. gdy kierowca zda",saveDetails:"Zapisz szczegóły",
      learningMaterials:"Materiały dydaktyczne",addMaterial:"Dodaj materiał",
      addFirstMaterial:"Dodaj pierwszy materiał",noMaterials:"Brak materiałów.",
      videoUrl:"URL wideo",pages:"Strony",
      fileUploadNote:"Prześyłanie plików będzie dostępne po połączeniu z serwerem",
      quizQuestions:"Pytania quizu",addQuestion:"Dodaj pytanie",addFirstQuestion:"Dodaj pierwsze pytanie",
      noQuestions:"Brak pytań.",quizQuestionType:"Typ pytania",scorePts:"Wynik (punkty)",questionText:"Treść pytania",
      correctAnswer:"Poprawna odpowiedź",trueFalse:"Prawda / Fałsz",freeText:"Tekst swobodny (ręczna ocena)",
      multiChoiceSingle:"Wielokrotny wybór (jedna odpowiedź)",multiChoiceMulti:"Wielokrotny wybór (wiele odpowiedzi)",
      sampleAnswer:"Przykładowa odpowiedź",addOption:"Dodaj opcję",
      driverEnrolments:"Rejestracje kierowców",
      noDriversEnrolled:"Brak zarejestrowanych kierowców. Opublikuj kurs i przypisz kierowców.",
      driverCol:"Kierowca",statusCol:"Status",attempts:"Próby",bestScore:"Najlepszy wynik",
      driverSigned:"Kierowca podpisany",operatorSigned:"Operator podpisany",actionCol:"Akcja",
      assessmentApproved:"Ocena zatwierdzona",certFiled:"Certyfikat wygenerowany i zapisany w dokumentach kierowcy.",
      assessmentRejected:"Ocena odrzucona",answerReview:"Przegląd odpowiedzi",scoreLabel:"Wynik",
      attemptsLabel:"Próby",driverSignature:"Podpis kierowcy",signedLabel:"Podpisany",
      cancel:"Anuluj",searchDocs:"Szukaj dokumentow...",searchCourses:"Szukaj kursow...",antiCheatPhotoRequired:"📸 Wymagany zrzut ekranu",antiCheatInstruction:"Wykonaj zdjecie / zrzut ekranu swojego ekranu",backToChecks:"Powrot do kontroli",backToEnrolments:"Powrot do zapisow",courseInfo:"Informacje o kursie",editCourse:"Edytuj szczegoly kursu",defectsReported:"Zgloszono usterki",defectsWorkshopNotified:"Warsztat powiadomiony",nilDefectCleared:"Brak usterki zaakceptowany",noDefects:"Brak usterek",ok:"OK",olicenceMargin:"Marza licencji O",passed:"Zaliczono",photoRequired:"Wymagane zdjecie",photoRequiredDefect:"Wymagane zdjecie – usterka",requiredQuestion:"Wymagane",forsReadiness:"Gotowość FORS",loadingCheckDetail:"Ladowanie szczegolow...",loadingDrivers:"Ladowanie kierowcow...",loadingVehicles:"Ladowanie pojazdow...",signedOn:"Podpisano dnia",suspiciousSpeed:"⚠️ Podejrzana predkosc",vehiclesPending:"Pojazdy oczekujace",workshopNotified:"Warsztat powiadomiony",
      date:"Data",na:"N/D",notConnected:"Nie polaczono",integrations:"Integracje",sent:"Wyslano",saving:"Zapisywanie...",saved:"Zapisano",saveChanges:"Zapisz zmiany",
      action:"Akcja",apiErrorLocal:"Blad (dane lokalne)",at:"o",certificate:"Certyfikat",details:"Szczegoly",edit:"Edytuj",rePublish:"Ponownie opublikuj",review:"Przejrzyj",sign:"Podpisz",status:"Status",template:"Szablon",
      reviewNote:"Przejrzyj odpowiedzi, oceń pytania tekstowe, a następnie zatwierdź lub odrzuć.",
    },
    drivers: {
      addTitle:"Dodaj kierowcę", editTitle:"Edytuj kierowcę",
      shiftPreference:"Preferencja zmiany", shiftNone:"Brak", shiftAllDays:"Wszystkie dni", shiftCustom:"Niestandardowy",
      shiftStart:"Początek zmiany", shiftEnd:"Koniec zmiany",
      maxConsecDays:"Maks. dni z rzędu", maxTripsWeek:"Maks. tras / tydzień",
      licenceNo:"Nr prawa jazdy", noneSelected:"Brak wyboru",
      statusActive:"Aktywny", statusInactive:"Nieaktywny", statusPending:"Oczekujący", statusArchived:"Zarchiwizowany",
      noDriversFound:"Nie znaleziono kierowców.", nameRequired:"Imię i nazwisko kierowcy jest wymagane.",
      saveFailed:"Zapis nie powiódł się", statusUpdateFailed:"Aktualizacja statusu nie powiodła się",
      retryLabel:"spróbuj ponownie",
    },
    fleetManagement: {
      exceptionEvents:"Zdarzenia wyjątkowe", engineDiagnostics:"Diagnostyka silnika", tripHistory:"Historia tras",
      allFleets:"Wszystkie floty", vehicles:"Pojazdy", drivers:"Kierowcy", onShift:"Na zmianie",
      monthlyDistance:"Dystans miesięczny", fuelThisMonth:"Paliwo w tym miesiącu", newFleet:"Nowa flota",
      vehicleLabel:"Pojazd", fleetLabel:"Flota", yearLabel:"Rok",
      mph:"mph", rpm:"rpm", driverSafetyScore:"Wynik bezpieczeństwa kierowcy",
      critical:"Krytyczny", warnings:"Ostrzeżenia", info:"Info",
      exceptionByType:"Zdarzenia wyjątkowe wg typu", noTripsToday:"Brak zarejestrowanych tras dzisiaj.",
      liveDiagnostic:"Bieżący zrzut diagnostyczny", avgSpd:"Śr. prędkość", endLabel:"Koniec",
    },
    importHub: {
      autoImportEnabled:"Automatyczny import włączony", extensionNotDetected:"Rozszerzenie nie wykryte",
      extensionActive:"Rozszerzenie aktywne",
      yourColumn:"Twoja kolumna", fleeyesField:"Pole FleetYes",
      tripsToday:"Trasy dzisiaj", lastSync:"Ostatnia sync.", primary:"Główny",
      universalActivityLog:"Uniwersalny dziennik aktywności", viewLabel:"Zobacz",
      tripsImportedToday:"Trasy zaimportowane dzisiaj", acrossAllProviders:"we wszystkich dostawcach",
      activeConnections:"Aktywne połączenia", syncFailures:"Błędy synchronizacji",
      providersConfigured:"Skonfigurowanych dostawców", vendorGallery:"Galeria integracji dostawców",
    },
    orgSettings: {
      failedToLoad:"Nie udało się załadować ustawień", orgSettings:"Ustawienia organizacji",
      recordInfo:"Informacje o rekordzie", drivingHours:"Godziny jazdy",
      workingHours:"Godziny pracy", myGeotab:"MyGeotab",
    },
  },
}

// ─── CONTEXT ──────────────────────────────────────────────────────────────────

const ALL_LANGS: Lang[] = ["en", "de", "fr", "es", "it", "pl"]

type LangCtx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
  dateLocale: string
}

const LangContext = React.createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
  dateLocale: "en-GB",
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("en")

  React.useEffect(() => {
    const stored = localStorage.getItem("fy-lang") as Lang | null
    if (stored && (ALL_LANGS as string[]).includes(stored)) setLangState(stored)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem("fy-lang", l)
  }

  return (
    <LangContext.Provider value={{
      lang,
      setLang,
      t: translations[lang],
      dateLocale: LOCALE_TAG[lang],
    }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return React.useContext(LangContext)
}


