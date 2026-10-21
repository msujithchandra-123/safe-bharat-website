<#
  Writes the Resend, AI assistant (Gemini or Anthropic) and optional Cloudflare Turnstile settings into
  .env.local for local development. Run it yourself in PowerShell:

      cd C:\Users\DELL\OneDrive\Documents\claude\safebharatwebsite
      powershell -ExecutionPolicy Bypass -File scripts\configure-integrations.ps1

  - Secret values are typed into hidden prompts; they are never echoed, printed,
    logged or passed as command-line arguments.
  - Pressing Enter at a prompt keeps the current value unchanged.
  - Only the keys listed below are added or replaced. Every other line of .env.local
    (including DATABASE_URL and TEST_DATABASE_URL) is preserved and re-checked.
  - A backup of the previous .env.local is kept as .env.local.bak-<timestamp>
    (git-ignored, like .env.local itself).
  - No email is sent and no AI or Cloudflare request is made by this script.
#>
param([string]$EnvFile = (Join-Path (Split-Path $PSScriptRoot -Parent) ".env.local"))

$ErrorActionPreference = "Stop"
$freeMail = @("gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "outlook.com", "hotmail.com", "live.com", "rediffmail.com", "icloud.com")

function Read-Secret([string]$prompt) {
  $secure = Read-Host $prompt -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

# Replaces KEY=... lines (or appends them) and preserves every other line byte-for-byte.
function Set-EnvValues([string]$path, [hashtable]$values) {
  $lines = New-Object System.Collections.Generic.List[string]
  if (Test-Path -LiteralPath $path) { foreach ($l in [IO.File]::ReadAllLines($path)) { $lines.Add($l) } }
  foreach ($key in $values.Keys) {
    if ($values[$key] -match "[\r\n]") { throw "The value for $key contains a line break." }
    $entry = "$key=$($values[$key])"
    $index = -1
    for ($i = 0; $i -lt $lines.Count; $i++) { if ($lines[$i] -match "^\s*$([regex]::Escape($key))\s*=") { $index = $i; break } }
    if ($index -ge 0) { $lines[$index] = $entry } else { $lines.Add($entry) }
  }
  [IO.File]::WriteAllLines($path, $lines.ToArray(), (New-Object Text.UTF8Encoding($false)))
}

function Get-EnvKeys([string]$path) {
  if (-not (Test-Path -LiteralPath $path)) { return @{} }
  $map = @{}
  foreach ($l in [IO.File]::ReadAllLines($path)) { if ($l -match '^\s*([A-Z0-9_]+)\s*=(.*)$') { $map[$Matches[1]] = $Matches[2] } }
  return $map
}

$before = Get-EnvKeys $EnvFile
$values = @{}
Write-Host "Configuring $EnvFile (press Enter at any prompt to keep the current value)." -ForegroundColor Cyan

# ---- Resend --------------------------------------------------------------
Write-Host "`n[1/3] Resend email notifications" -ForegroundColor Cyan
$key = Read-Secret "RESEND_API_KEY (hidden; starts with re_)"
if ($key) {
  if ($key -notmatch '^re_[A-Za-z0-9_]{10,}$') { throw "That does not look like a Resend API key (expected re_...). Nothing was written." }
  $values["RESEND_API_KEY"] = $key
}
$from = Read-Host "EMAIL_FROM, e.g. Safe Bharat <enquiries@mail.your-domain.in> (must be on your Resend-verified domain)"
if ($from) {
  if ($from -notmatch '^\s*(?:[^<>@]*<)?([^<>\s@]+)@([^<>\s@]+\.[^<>\s@]+)>?\s*$') { throw "EMAIL_FROM must be an address or 'Name <address>'. Nothing was written." }
  if ($freeMail -contains $Matches[2].ToLowerInvariant()) { throw "EMAIL_FROM cannot use $($Matches[2]); Resend only sends from a domain you own and have verified. Nothing was written." }
  $values["EMAIL_FROM"] = $from.Trim()
}
$to = Read-Host "ENQUIRY_NOTIFICATION_TO (inbox for new enquiries) [Enter = safebharatsales@gmail.com]"
if (-not $to) { $to = "safebharatsales@gmail.com" }
foreach ($addr in $to.Split(",")) { if ($addr.Trim() -notmatch '^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$') { throw "Invalid notification address: $addr. Nothing was written." } }
$values["ENQUIRY_NOTIFICATION_TO"] = ($to.Split(",") | ForEach-Object { $_.Trim() }) -join ","

# ---- AI assistant provider ----------------------------------------------
# The provider is chosen explicitly (LLM_PROVIDER); the site never switches providers on its own.
Write-Host "`n[2/3] AI assistant provider" -ForegroundColor Cyan
$choice = Read-Host "Use (g)emini or (a)nthropic for the Safe Bharat Assistant? [Enter = keep current]"
if ($choice -match '^(g|gemini)$') {
  $gem = Read-Secret "GEMINI_API_KEY (hidden; from Google AI Studio)"
  if ($gem) {
    if ($gem -match '\s' -or $gem.Length -lt 30) { throw "That does not look like a Gemini API key. Nothing was written." }
    if ($gem -notmatch '^AIza') { Write-Host "      Note: Google AI Studio keys usually start with AIza. Continuing." -ForegroundColor Yellow }
    $values["GEMINI_API_KEY"] = $gem
  } elseif (-not $before.ContainsKey("GEMINI_API_KEY")) {
    throw "GEMINI_API_KEY is required to select Gemini. Nothing was written."
  }
  $values["LLM_PROVIDER"] = "gemini"
  $model = Read-Host "GEMINI_MODEL [Enter = gemini-3.5-flash-lite]"
  $values["GEMINI_MODEL"] = $(if ($model) { $model.Trim() } else { "gemini-3.5-flash-lite" })
  if ($values["GEMINI_MODEL"] -notmatch '^gemini-[a-z0-9.\-]+$') { throw "GEMINI_MODEL should look like gemini-3.5-flash-lite. Nothing was written." }
} elseif ($choice -match '^(a|anthropic)$') {
  $llm = Read-Secret "LLM_API_KEY (hidden; Anthropic key, starts with sk-ant-)"
  if ($llm) {
    if ($llm -notmatch '^sk-ant-[A-Za-z0-9_\-]{20,}$') { throw "That does not look like an Anthropic API key (expected sk-ant-...). Nothing was written." }
    $values["LLM_API_KEY"] = $llm
  } elseif (-not $before.ContainsKey("LLM_API_KEY")) {
    throw "LLM_API_KEY is required to select Anthropic. Nothing was written."
  }
  $values["LLM_PROVIDER"] = "anthropic"
}

# ---- Turnstile (optional) ------------------------------------------------
Write-Host "`n[3/3] Cloudflare Turnstile (optional for local development)" -ForegroundColor Cyan
Write-Host "      Real production keys only work on the hostnames listed on the widget. If localhost is not"
Write-Host "      listed, the widget will not load locally - keep the test keys locally and put the real keys"
Write-Host "      in your hosting provider instead."
$replace = Read-Host "Store real Turnstile keys in .env.local? (y/N)"
if ($replace -match '^(y|yes)$') {
  $site = Read-Host "NEXT_PUBLIC_TURNSTILE_SITE_KEY (public; starts with 0x)"
  $secret = Read-Secret "TURNSTILE_SECRET_KEY (hidden; starts with 0x)"
  if ($site -notmatch '^0x[A-Za-z0-9_\-]{10,}$' -or $secret -notmatch '^0x[A-Za-z0-9_\-]{10,}$') { throw "Turnstile keys from the Cloudflare dashboard start with 0x. Nothing was written." }
  $values["NEXT_PUBLIC_TURNSTILE_SITE_KEY"] = $site
  $values["TURNSTILE_SECRET_KEY"] = $secret
}

# ---- Write, then verify nothing else changed -------------------------------
if (Test-Path -LiteralPath $EnvFile) {
  $backup = "$EnvFile.bak-$(Get-Date -Format yyyyMMdd-HHmmss)"
  [IO.File]::Copy($EnvFile, $backup, $false)
  Write-Host "`nBackup of the previous file: $backup"
}
Set-EnvValues $EnvFile $values
$after = Get-EnvKeys $EnvFile
foreach ($k in $before.Keys) {
  if (-not $values.ContainsKey($k) -and $after[$k] -ne $before[$k]) { throw "Unexpected change to $k. Restore $backup." }
}
foreach ($k in $values.Keys) { if ($after[$k] -ne $values[$k]) { throw "Failed to write $k. Restore $backup." } }

Write-Host "`nUpdated keys (values not shown):" -ForegroundColor Green
foreach ($k in @("RESEND_API_KEY", "EMAIL_FROM", "ENQUIRY_NOTIFICATION_TO", "LLM_PROVIDER", "GEMINI_API_KEY", "GEMINI_MODEL", "LLM_API_KEY", "NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY")) {
  Write-Host ("  {0,-32} {1}" -f $k, $(if ($values.ContainsKey($k)) { "set" } else { "unchanged" }))
}
Write-Host "Other keys preserved: $(@($before.Keys | Where-Object { -not $values.ContainsKey($_) }) -join ', ')"
Write-Host "`nRestart the dev server (npm run dev), then open http://localhost:3000/api/v1/health."
$key = $null; $llm = $null; $gem = $null; $secret = $null
