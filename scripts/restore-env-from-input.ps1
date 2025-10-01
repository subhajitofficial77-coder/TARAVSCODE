# Restore .env.local from interactive input
# This script prompts for keys locally and writes them to .env.local without committing them.
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\restore-env-from-input.ps1

$envPath = Join-Path -Path (Get-Location) -ChildPath ".env.local"
Write-Host "This will create or overwrite '$envPath' with values you enter."

# Prompt for values (secure for secrets)
$NEXT_PUBLIC_SUPABASE_URL = Read-Host "NEXT_PUBLIC_SUPABASE_URL (e.g. https://<project-ref>.supabase.co)"
$NEXT_PUBLIC_SUPABASE_ANON_KEY = Read-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY (anon public key)"
$SUPABASE_SERVICE_ROLE_KEY = Read-Host -AsSecureString "SUPABASE_SERVICE_ROLE_KEY (service role key - server only)"
$SUPABASE_DB_URL = Read-Host "SUPABASE_DB_URL (postgres URL)"
$OPENROUTER_API_KEY = Read-Host -AsSecureString "OPENROUTER_API_KEY (OpenRouter key)"
$GOOGLE_AI_KEY = Read-Host -AsSecureString "GOOGLE_AI_KEY (Google AI key)"
$SERP_API_KEY = Read-Host -AsSecureString "SERP_API_KEY (Serp API key)"
$WEATHER_API_KEY = Read-Host -AsSecureString "WEATHER_API_KEY (Weather API key)"
$NEXT_PUBLIC_APP_URL = Read-Host "NEXT_PUBLIC_APP_URL (http://localhost:3000)"
$TARA_LOCATION = Read-Host "TARA_LOCATION (e.g. Indore,India)"
$TARA_TIMEZONE = Read-Host "TARA_TIMEZONE (e.g. Asia/Kolkata)"

# Convert secure strings back to plain for write (only in memory, not logged)
function Unsecure($s) {
    if ($s -is [System.Security.SecureString]) {
        $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
        try { [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
        finally { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
    } else { $s }
}

$content = @"
# WARNING: Variables prefixed with NEXT_PUBLIC_ are exposed to the browser.
# Keep other variables secret and never commit this file to source control.

NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$(Unsecure $NEXT_PUBLIC_SUPABASE_ANON_KEY)
SUPABASE_SERVICE_ROLE_KEY=$(Unsecure $SUPABASE_SERVICE_ROLE_KEY)
SUPABASE_DB_URL=$SUPABASE_DB_URL

OPENROUTER_API_KEY=$(Unsecure $OPENROUTER_API_KEY)
GOOGLE_AI_KEY=$(Unsecure $GOOGLE_AI_KEY)
GOOGLE_AI_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent

SERP_API_KEY=$(Unsecure $SERP_API_KEY)
WEATHER_API_KEY=$(Unsecure $WEATHER_API_KEY)
WEATHER_API_ENDPOINT=https://api.weatherapi.com/v1

NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
TARA_LOCATION=${TARA_LOCATION}
TARA_TIMEZONE=${TARA_TIMEZONE}
"@

Set-Content -Path $envPath -Value $content -Encoding UTF8
Write-Host "Wrote $envPath. Do NOT commit this file to source control."
