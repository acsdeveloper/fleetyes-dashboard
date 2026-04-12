/**
 * fix-trip-durations.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Finds all "solo" trips whose recorded duration is approximately 24h (which
 * is a data entry error — solo trips should be exactly 12h 30m) and rewrites
 * their estimated_end_date to be scheduled_at + 12h 30m.
 *
 * What counts as a "24-hour trip"?
 *   Any trip where  (estimated_end_date − scheduled_at) >= 20h
 *   This captures exactly-24h entries and also slightly-off variants.
 *
 * HOW TO USE
 * 1. Log in to the app in your browser.
 * 2. Open DevTools → Console.
 * 3. Paste this entire script and press Enter — dry-run prints automatically.
 * 4. Review the table carefully.
 * 5. Type:  await run(false)   to apply.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CONFIG = {
  BASE_URL:          "https://ontrack-api.agilecyber.com/int/v1",
  TOKEN_KEY:         "fleetyes_ontrack_token",

  /** Min duration (hours) to consider a trip "suspiciously long".
   *  Solo trips must be exactly 12h or 12.5h — anything above 12.6h is a data error. */
  MIN_BAD_HOURS:     12.6,

  /** Target duration for a solo trip — 12h 30m in ms */
  SOLO_DURATION_MS:  12.5 * 60 * 60 * 1000,

  /** Date range: cover current week AND the upcoming allocation period. */
  FROM_DATE:         "2026-04-12",
  TO_DATE:           "2026-04-25",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem(CONFIG.TOKEN_KEY) ?? "";

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${CONFIG.BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`${res.status}: ${body.error ?? body.message ?? res.statusText}`);
  }
  return res.status === 204 ? null : res.json();
}

function inDateRange(iso) {
  if (!iso) return false;
  if (!CONFIG.FROM_DATE && !CONFIG.TO_DATE) return true;
  const d = iso.slice(0, 10);
  if (CONFIG.FROM_DATE && d < CONFIG.FROM_DATE) return false;
  if (CONFIG.TO_DATE   && d > CONFIG.TO_DATE)   return false;
  return true;
}

function durationHours(start, end) {
  if (!start || !end) return null;
  return (new Date(end) - new Date(start)) / 3600000;
}

function fixedEndDate(startIso) {
  return new Date(new Date(startIso).getTime() + CONFIG.SOLO_DURATION_MS).toISOString();
}

function fmt(iso) {
  return iso ? iso.slice(0, 16).replace("T", " ") : "–";
}

function fmtH(hours) {
  if (hours === null) return "?";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ─── Fetch all pages from /orders/list ───────────────────────────────────────

async function fetchAllTrips() {
  const trips = [];
  let page = 1;
  let lastPage = 1;

  const rangeLabel = CONFIG.FROM_DATE
    ? `${CONFIG.FROM_DATE} → ${CONFIG.TO_DATE ?? "∞"}`
    : "ALL dates";

  console.log(`📡  Fetching trips from /orders/list (range: ${rangeLabel}) …`);

  do {
    const qs = new URLSearchParams({ limit: "500", page: String(page) });
    const data = await apiFetch(`/orders/list?${qs}`);
    const batch = data?.data ?? [];
    lastPage = data?.meta?.last_page ?? 1;
    const matched = batch.filter(o => inDateRange(o.scheduled_at));
    trips.push(...matched);
    console.log(`   page ${page}/${lastPage} — ${batch.length} total, ${matched.length} in range`);
    page++;
  } while (page <= lastPage);

  console.log(`\n📋  ${trips.length} trips in range\n`);
  return trips;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run(dryRun = true) {
  const allTrips = await fetchAllTrips();

  // ── Identify bad trips ────────────────────────────────────────────────────
  const badTrips = allTrips.filter(o => {
    if (!o.scheduled_at) return false;
    if (!o.estimated_end_date) return false;           // no end date — skip
    const h = durationHours(o.scheduled_at, o.estimated_end_date);
    return h !== null && h >= CONFIG.MIN_BAD_HOURS;
  });

  const clean = allTrips.length - badTrips.length;

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🔎  Trips with duration ≥ ${CONFIG.MIN_BAD_HOURS}h  →  ${badTrips.length} found`);
  console.log(`✅  Already-correct trips (< ${CONFIG.MIN_BAD_HOURS}h)  →  ${clean}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (badTrips.length === 0) {
    console.log("Nothing to fix — all trip durations look correct.");
    return;
  }

  // ── Preview table ─────────────────────────────────────────────────────────
  const tableData = badTrips.map(o => {
    const currentH = durationHours(o.scheduled_at, o.estimated_end_date);
    const newEnd   = fixedEndDate(o.scheduled_at);
    return {
      id:           o.public_id ?? o.uuid.slice(0, 8),
      driver:       o.driver_assigned?.name ?? o.driver_name ?? "–",
      start:        fmt(o.scheduled_at),
      current_end:  fmt(o.estimated_end_date),
      current_dur:  fmtH(currentH),
      new_end:      fmt(newEnd),
      new_dur:      "12h 30m",
    };
  });
  console.table(tableData);

  console.log(dryRun
    ? `\n🔍 DRY RUN — nothing changed.  To apply:  await run(false)`
    : `\n🚀 LIVE RUN — applying ${badTrips.length} fix${badTrips.length !== 1 ? "es" : ""} …`
  );

  if (dryRun) return;

  // ── Apply fixes ───────────────────────────────────────────────────────────
  let ok = 0, verifyFail = 0, fail = 0;

  for (const order of badTrips) {
    const newEnd = fixedEndDate(order.scheduled_at);
    const payload = { order: { estimated_end_date: newEnd } };

    try {
      // 1. Apply
      await apiFetch(`/orders/${order.uuid}`, {
        method: "PUT",
        body:   JSON.stringify(payload),
      });

      // 2. Verify
      const check   = await apiFetch(`/orders/list/${order.uuid}`);
      const saved   = check?.data?.estimated_end_date ?? check?.order?.estimated_end_date ?? null;
      const savedH  = saved ? durationHours(order.scheduled_at, saved) : null;
      const ok12_5  = savedH !== null && Math.abs(savedH - 12.5) < 0.1;

      if (ok12_5) {
        console.log(`  ✅ ${order.public_id ?? order.uuid.slice(0,8)}  end → ${fmt(saved)}  (12h 30m ✓)`);
        ok++;
      } else {
        console.warn(`  ⚠️  ${order.public_id ?? order.uuid.slice(0,8)}  PUT ok but end shows ${fmt(saved)} (${fmtH(savedH)})`);
        verifyFail++;
      }
    } catch (err) {
      console.error(`  ❌ ${order.public_id ?? order.uuid.slice(0,8)}  FAILED: ${err.message}`);
      fail++;
    }

    // Small throttle between writes
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n🏁 Done — ${ok} fixed, ${verifyFail} unverified, ${fail} errors.`);
  if (verifyFail > 0) {
    console.warn("⚠️  Some updates returned 200 OK but verification failed. Check payload field name.");
  }
}

// Auto dry-run on paste
console.clear();
console.log("fix-trip-durations.js ready.");
console.log(`Config: ≥${CONFIG.MIN_BAD_HOURS}h trips → 12h 30m.  Range: ${CONFIG.FROM_DATE ?? "all"} → ${CONFIG.TO_DATE ?? "all"}`);
console.log("─".repeat(60));
run(true);
