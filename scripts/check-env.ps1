Param(
  [string]$envFile = ".env.local"
)

# Read .env.local and check that required keys exist
if (-Not (Test-Path $envFile)) {
  Write-Error "Env file '$envFile' not found. Create it at the repository root with the required keys."
  exit 2
}

$content = Get-Content $envFile -ErrorAction Stop | Where-Object { $_ -and ($_ -notmatch '^\s*#') }
$present = @{}
foreach ($line in $content) {
  if ($line -match '^\s*([A-Za-z0-9_]+)\s*=') { $present[$matches[1]] = $true }
}

$required = @(
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENROUTER_API_KEY',
  'GOOGLE_AI_KEY',
  'SERP_API_KEY',
  'WEATHER_API_KEY',
  'NEXT_PUBLIC_APP_URL'
)

$missing = @()
foreach ($k in $required) { if (-not $present.ContainsKey($k)) { $missing += $k } }

if ($missing.Count -gt 0) {
  $joined = $missing -join "`n  "
  Write-Error ("Missing required environment variables in " + $envFile + ":`n  " + $joined)
  exit 3
}

Write-Host "All required environment variables present in $envFile." -ForegroundColor Green
exit 0
