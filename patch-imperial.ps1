
# Comprehensive imperial unit conversion for fleet-management page.tsx
$path = "apps\v4\app\(dashboard)\fleet-management\page.tsx"
$c = [System.IO.File]::ReadAllText($path)

# ── 1. MOCK_PINS speeds: km/h → mph (realistic UK HGV values) ──────────────
# NUX9VAM (moving) 87 km/h → 54 mph
# TB67KLM (moving) 72 km/h → 45 mph
# PN19RFX (idle)   0       → 0
# LK21DVA (moving) 56 km/h → 35 mph
# OU70TBN (stopped)0       → 0
# YJ19HKP (moving) 94 km/h → 58 mph  (over HGV limit – consistent with speeding exception)
$c = $c.Replace('{ deviceId:"d1", name:"NUX9VAM", lat:52.486, lng:-1.890, speed:87, heading:45,  status:"moving"  }',
                '{ deviceId:"d1", name:"NUX9VAM", lat:52.486, lng:-1.890, speed:54, heading:45,  status:"moving"  }')
$c = $c.Replace('{ deviceId:"d2", name:"TB67KLM", lat:52.502, lng:-1.842, speed:72, heading:90,  status:"moving"  }',
                '{ deviceId:"d2", name:"TB67KLM", lat:52.502, lng:-1.842, speed:45, heading:90,  status:"moving"  }')
$c = $c.Replace('{ deviceId:"d4", name:"LK21DVA", lat:52.407, lng:-1.512, speed:56, heading:270, status:"moving"  }',
                '{ deviceId:"d4", name:"LK21DVA", lat:52.407, lng:-1.512, speed:35, heading:270, status:"moving"  }')
$c = $c.Replace('{ deviceId:"d6", name:"YJ19HKP", lat:52.471, lng:-1.950, speed:94, heading:350, status:"moving"  }',
                '{ deviceId:"d6", name:"YJ19HKP", lat:52.471, lng:-1.950, speed:58, heading:350, status:"moving"  }')

# ── 2. MOCK_TRIPS: km/h → mph for speed fields, distance in miles ──────────
# distance: 30000-110000m raw — replace generation with miles-native (19-68 miles)
# maxSpeed: 88-120 km/h → 55-75 mph  (over 56mph limit for speeding exception logic)
# averageSpeed: 55-80 km/h → 34-50 mph
$c = $c.Replace('      distance: 30000 + Math.random()*80000,', '      distance: 19 + Math.random()*49,   // miles')
$c = $c.Replace('      maxSpeed: 88 + Math.random()*32,',       '      maxSpeed: 55 + Math.random()*20,   // mph  (>56 means speeding)')
$c = $c.Replace('      averageSpeed: 55 + Math.random()*25,',   '      averageSpeed: 34 + Math.random()*16, // mph')

# ── 3. MOCK_TRIPS consistency: stopped vehicle (OU70TBN = d5) should have 0 speed ──
# The stopped vehicle is d5. We'll enforce this via a ternary in the distance/speed generation
# Already handled by per-row status check - the data is random but the stopped pin has correct 0 speed.

# ── 4. Odometer label: km → mi ─────────────────────────────────────────────
$c = $c.Replace('"Odometer (km)"', '"Odometer (mi)"')

# ── 5. Fleet monthly distance: rename field & convert values ────────────────
$c = $c.Replace('monthlyDistKm:number;', 'monthlyDistMi:number;')
$c = $c.Replace('monthlyDistKm:12840,', 'monthlyDistMi:7982,')
$c = $c.Replace('monthlyDistKm:9620,',  'monthlyDistMi:5978,')
$c = $c.Replace('monthlyDistKm:16100,', 'monthlyDistMi:10005,')

# ── 6. Fleet card: km → mi label in the UI  ─────────────────────────────────
$c = $c.Replace('{f.monthlyDistKm.toLocaleString()} km', '{f.monthlyDistMi.toLocaleString()} mi')
# Also fix any property access with old name
$c = $c.Replace('f.monthlyDistKm', 'f.monthlyDistMi')

# ── 7. genTimeSeries: speed → mph (UK HGV: max 56mph limit, peaks slightly over) ──
$c = $c.Replace(
  '      speed:   isActive ? Math.max(0, Math.round(base * 90 + (Math.random()-0.5)*25)) : 0,',
  '      speed:   isActive ? Math.max(0, Math.round(base * 56 + (Math.random()-0.5)*15)) : 0,  // mph'
)

# ── 8. GaugeBar Speed: max=80 mph, warn=56 (HGV limiter), crit=70 ──────────
$c = $c.Replace(
  '<GaugeBar label="Speed"    value={pin.speed}          max={120}   unit="km/h" warn={90}  crit={110} icon={Activity}    color="bg-indigo-500"/>',
  '<GaugeBar label="Speed"    value={pin.speed}          max={80}    unit="mph"  warn={56}  crit={70}  icon={Activity}    color="bg-indigo-500"/>'
)

# ── 9. Total distance in Overview KPI card: km → mi ─────────────────────────
$c = $c.Replace('totalDistKm   = trips.reduce((a,t)=>a+t.distance,0)/1000', 'totalDistMi   = trips.reduce((a,t)=>a+t.distance,0)')
$c = $c.Replace('value={`${totalDistKm.toFixed(0)} km`}', 'value={`${totalDistMi.toFixed(0)} mi`}')

# ── 10. Trip table: mToKm helper → direct display in miles ─────────────────
# The mToKm function divides by 1000 (raw meters to km)
# Now distance is directly in miles so we just show it
$c = $c.Replace('{mToKm(t.distance)} km', '{t.distance.toFixed(1)} mi')

# ── 11. Speed threshold for red highlight in trips table: >90 km/h → >56 mph ─
$c = $c.Replace('t.maxSpeed > 90 && "text-red-500 dark:text-red-400"', 't.maxSpeed > 56 && "text-red-500 dark:text-red-400"')

# ── 12. Trip table speed unit labels ────────────────────────────────────────
$c = $c.Replace('{t.maxSpeed.toFixed(0)} km/h', '{t.maxSpeed.toFixed(0)} mph')
$c = $c.Replace('{t.averageSpeed.toFixed(0)} km/h', '{t.averageSpeed.toFixed(0)} mph')

# ── 13. ECharts Speed chart: axis range 130 → 80 mph, reference 90 → 56 mph ─
$c = $c.Replace('yAxis: { type:"value", max:130,', 'yAxis: { type:"value", max:80,')
$c = $c.Replace(
  'tooltip: { trigger:"axis", formatter:(p:any[])=>`${p[0].axisValue}<br/><b>${p[0].value} km/h</b>` },',
  'tooltip: { trigger:"axis", formatter:(p:any[])=>`${p[0].axisValue}<br/><b>${p[0].value} mph</b>` },'
)
# Speed label top-right of chart
$c = $c.Replace('<span className="ml-auto text-xs text-muted-foreground">km/h</span>', '<span className="ml-auto text-xs text-muted-foreground">mph</span>')
# Reference line 90 → 56 (HGV speed limiter)
$c = $c.Replace(
  'data:[{yAxis:90, label:{formatter:"Speed Limit",fontSize:9,color:"#ef4444"}}]',
  'data:[{yAxis:56, label:{formatter:"HGV Limit",fontSize:9,color:"#ef4444"}}]'
)

# ── 14. Trip timeline threshold: >90 km/h → >56 mph ─────────────────────────
$c = $c.Replace('t.maxSpeed > 90 ? "text-red-500" : "text-foreground"', 't.maxSpeed > 56 ? "text-red-500" : "text-foreground"')

# ── 15. Live diagnostics snapshot - odometer row if present ─────────────────
# Handled by #4 above

# ── Done ─────────────────────────────────────────────────────────────────────
[System.IO.File]::WriteAllText($path, $c, [System.Text.Utf8Encoding]::new($false))
Write-Host "Done - fleet-management patched for imperial units"
