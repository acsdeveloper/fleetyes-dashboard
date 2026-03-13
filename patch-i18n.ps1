
$base = "apps\v4\app\(dashboard)"
$import = 'import { PageHeader } from "@/components/page-header"'

$pages = @(
  @{ f="maintenance\page.tsx";  k="maintenance";  h="Maintenance Hub" },
  @{ f="compliance\page.tsx";   k="compliance";   h="Compliance Hub"  },
  @{ f="inventory\page.tsx";    k="inventory";    h="Inventory Hub"   }
)

foreach ($p in $pages) {
  $path = "$base\$($p.f)"
  $content = [System.IO.File]::ReadAllText($path)

  if (-not $content.Contains("page-header")) {
    $firstNL = $content.IndexOf("`n")
    $content = $content.Substring(0, $firstNL + 1) + $import + "`n" + $content.Substring($firstNL + 1)
  }

  $h1old = '<h1 className="text-2xl font-bold tracking-tight md:text-3xl">' + $p.h + '</h1>'
  $h1new = '<PageHeader pageKey="' + $p.k + '" />'

  if ($content.Contains($h1old)) {
    $content = $content.Replace($h1old, $h1new)
    Write-Host "OK  $($p.f)"
  } else {
    Write-Host "?   NOT FOUND: $h1old"
  }

  [System.IO.File]::WriteAllText($path, $content, [System.Text.Utf8Encoding]::new($false))
}

# import-hub has a different h1 (with icon inside)
$ibPath = "$base\import-hub\page.tsx"
$ib = [System.IO.File]::ReadAllText($ibPath)
if (-not $ib.Contains("page-header")) {
  $firstNL = $ib.IndexOf("`n")
  $ib = $ib.Substring(0, $firstNL + 1) + $import + "`n" + $ib.Substring($firstNL + 1)
}
$ibOld = '<h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">' + "`n" + '            <CloudDownload className="h-7 w-7 text-indigo-500" />' + "`n" + '            Data Import Hub' + "`n" + '          </h1>' + "`n" + '          <p className="mt-1 text-sm text-muted-foreground">' + "`n" + '            Centralised control centre for all logistics provider integrations' + "`n" + '          </p>'
$ibNew = '<PageHeader pageKey="importHub" />'
if ($ib.Contains("Data Import Hub")) {
  Write-Host "import-hub: trying multi-line replace"
}
[System.IO.File]::WriteAllText($ibPath, $ib, [System.Text.Utf8Encoding]::new($false))

# fleet-management has its own h1 with icon
$fmPath = "$base\fleet-management\page.tsx"
$fm = [System.IO.File]::ReadAllText($fmPath)
if (-not $fm.Contains("page-header")) {
  $firstNL = $fm.IndexOf("`n")
  $fm = $fm.Substring(0, $firstNL + 1) + $import + "`n" + $fm.Substring($firstNL + 1)
  [System.IO.File]::WriteAllText($fmPath, $fm, [System.Text.Utf8Encoding]::new($false))
  Write-Host "fleet-management: import added"
}
