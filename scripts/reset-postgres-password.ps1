<#
  Resets the password of the PostgreSQL "postgres" administrator on the native
  Windows service postgresql-x64-17, using PostgreSQL's documented recovery method:
  a temporary localhost "trust" rule, a hidden \password prompt, then restoring
  the original authentication file byte-for-byte.

  Run it yourself in an ELEVATED Windows PowerShell console (Run as Administrator).
  Do not use PowerShell ISE: it cannot show psql's hidden password prompt.
      cd C:\Users\DELL\OneDrive\Documents\claude\safebharatwebsite
      powershell -ExecutionPolicy Bypass -File scripts\reset-postgres-password.ps1

  What it changes:    the "postgres" role's password, and pg_hba.conf for about a
                      minute (restored byte-for-byte and verified by SHA-256).
  What it never does: restart or stop the service, create/drop/alter databases or
                      other roles, run migrations, touch project configuration, or
                      put a password in a file, an argument, a log or the output.
                      psql's \password hashes the password on the client (SCRAM),
                      so the plaintext is never sent to or logged by the server.
#>
param(
  [string]$PgRoot = "C:\Program Files\PostgreSQL\17",
  [string]$ServiceName = "postgresql-x64-17",
  [int]$Port = 5432
)

$ErrorActionPreference = "Stop"
$bin = Join-Path $PgRoot "bin"
$psql = Join-Path $bin "psql.exe"
$pgCtl = Join-Path $bin "pg_ctl.exe"
$dataDir = Join-Path $PgRoot "data"
$hba = Join-Path $dataDir "pg_hba.conf"
$trustLine = "host    all    postgres    127.0.0.1/32    trust    # TEMPORARY - added by reset-postgres-password.ps1"

function Write-Step([string]$text) { Write-Host ""; Write-Host "==> $text" -ForegroundColor Cyan }
function Write-Fail([string]$text) { Write-Host $text -ForegroundColor Red }
function Normalize-Path([string]$p) { return ($p -replace '/', '\').TrimEnd('\').ToLowerInvariant() }

# ---------------------------------------------------------------------------
# Process-only environment (nothing here persists after the script ends).
# No inherited password or password file may influence the checks; messages are
# forced to English so the authentication checks can be parsed reliably.
# ---------------------------------------------------------------------------
foreach ($name in @("PGPASSWORD", "PGSERVICE", "PGSERVICEFILE", "PGUSER", "PGHOST", "PGHOSTADDR", "PGPORT", "PGDATABASE", "PGOPTIONS")) {
  Remove-Item "Env:$name" -ErrorAction SilentlyContinue
}
$env:PGPASSFILE = Join-Path $env:TEMP ("no-pgpass-" + [guid]::NewGuid().ToString("N"))
$env:PGCONNECT_TIMEOUT = "5"
$env:LC_MESSAGES = "C"
$env:LANGUAGE = "en"

# Runs a native command without letting Windows PowerShell 5.1 turn stderr into terminating
# errors. Returns @{ Code = exit code; Text = combined output }.
function Invoke-Native([string]$exe, [string[]]$arguments) {
  $previous = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $text = (& $exe @arguments 2>&1 | ForEach-Object { "$_" }) -join "`n"
    return @{ Code = $LASTEXITCODE; Text = $text }
  } finally { $ErrorActionPreference = $previous }
}

# Authentication state for user "postgres" over 127.0.0.1, without ever prompting (-w):
#   "trust"       - logged in without a password
#   "password"    - server reachable and demanding a password (the normal, safe state)
#   "unreachable" - could not connect
#   "unknown"     - anything else
function Get-AuthState {
  $r = Invoke-Native $psql @("-h", "127.0.0.1", "-p", "$Port", "-U", "postgres", "-d", "postgres", "-w", "-tAXc", "select 1")
  if ($r.Code -eq 0) { return "trust" }
  if ($r.Text -match "no password supplied|password authentication failed") { return "password" }
  if ($r.Text -match "could not connect|Connection refused|timeout expired|server closed the connection") { return "unreachable" }
  return "unknown"
}

# Reload is asynchronous: poll until the authentication state matches what we expect.
function Wait-AuthState([string]$expected, [int]$attempts = 20) {
  $state = ""
  for ($i = 0; $i -lt $attempts; $i++) {
    $state = Get-AuthState
    if ($state -eq $expected) { return $state }
    Start-Sleep -Milliseconds 500
  }
  return $state
}

function Show-ManualRecovery([string]$backup) {
  Write-Fail "  1. In an elevated PowerShell window run:"
  Write-Fail "       Copy-Item `"$backup`" `"$hba`" -Force"
  Write-Fail "       & `"$pgCtl`" reload -D `"$dataDir`""
  Write-Fail "  2. Confirm the temporary rule is gone (this must print nothing):"
  Write-Fail "       Select-String -Path `"$hba`" -Pattern 'reset-postgres-password' -SimpleMatch"
  Write-Fail "  The backup is never deleted by this script: $backup"
}

# ---------------------------------------------------------------------------
# 1. Pre-flight checks (read-only; any failure stops the script before changes)
# ---------------------------------------------------------------------------
Write-Step "Pre-flight checks"
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw "Run this script from PowerShell opened with 'Run as Administrator'. Nothing was changed."
}
if ($Host.Name -match "ISE") { throw "PowerShell ISE cannot show psql's hidden password prompt. Use the normal PowerShell console. Nothing was changed." }
foreach ($path in @($psql, $pgCtl, $hba, (Join-Path $dataDir "postmaster.pid"))) {
  if (-not (Test-Path -LiteralPath $path)) { throw "Not found: $path. Nothing was changed." }
}

# The service must use exactly this data directory.
$service = Get-CimInstance Win32_Service -Filter "Name='$ServiceName'"
if (-not $service -or $service.State -ne "Running") { throw "Service $ServiceName is not running. Nothing was changed." }
if ($service.PathName -notmatch '-D\s+"([^"]+)"' -or (Normalize-Path $Matches[1]) -ne (Normalize-Path $dataDir)) {
  throw "Service $ServiceName does not use data directory $dataDir. Nothing was changed."
}

# The server listening on $Port must be the one running from this data directory.
$pidFile = Get-Content -LiteralPath (Join-Path $dataDir "postmaster.pid")
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $listener -or $listener.OwningProcess -ne [int]$pidFile[0] -or (Normalize-Path $pidFile[1]) -ne (Normalize-Path $dataDir) -or $pidFile[3].Trim() -ne "$Port") {
  throw "The server on port $Port is not the one running from $dataDir. Nothing was changed."
}

# pg_hba.conf must not have been relocated (otherwise editing this file would have no effect).
$relocation = @(Get-Content -LiteralPath (Join-Path $dataDir "postgresql.conf")) + @(Get-Content -LiteralPath (Join-Path $dataDir "postgresql.auto.conf") -ErrorAction SilentlyContinue) |
  Where-Object { $_ -match '^\s*(hba_file|include|include_dir|include_if_exists)\b' }
if ($relocation) { throw "postgresql.conf relocates or includes configuration ($($relocation -join '; ')). Review manually. Nothing was changed." }

$item = Get-Item -LiteralPath $hba
if ($item.IsReadOnly) { throw "pg_hba.conf is read-only. Nothing was changed." }
if (Select-String -LiteralPath $hba -Pattern "reset-postgres-password.ps1" -SimpleMatch -Quiet) {
  throw "pg_hba.conf already contains a temporary rule from an earlier run. Restore it from its .bak file first. Nothing was changed."
}

$state = Get-AuthState
if ($state -ne "password") { throw "Expected the server to be reachable and demanding a password, but the state is '$state'. Nothing was changed." }
Write-Host "    Elevated console: yes | Service data directory: verified | Server on port ${Port}: PID $($pidFile[0]), verified"
Write-Host "    pg_hba.conf: default location, writable | Current authentication: password required"

# ---------------------------------------------------------------------------
# 2. Backup (never overwrites an existing file) and three-way verification
# ---------------------------------------------------------------------------
Write-Step "Backing up pg_hba.conf"
$originalBytes = [IO.File]::ReadAllBytes($hba)
$sha = [Security.Cryptography.SHA256]::Create()
$memoryHash = [BitConverter]::ToString($sha.ComputeHash($originalBytes)).Replace("-", "")
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = "$hba.bak-$stamp"
$n = 1
while (Test-Path -LiteralPath $backup) { $backup = "$hba.bak-$stamp-$n"; $n++ }
[IO.File]::Copy($hba, $backup, $false)   # $false = throw rather than overwrite
$fileHash = (Get-FileHash -LiteralPath $hba -Algorithm SHA256).Hash
$backupHash = (Get-FileHash -LiteralPath $backup -Algorithm SHA256).Hash
if ($memoryHash -ne $fileHash -or $memoryHash -ne $backupHash) {
  throw "Backup verification failed (hash mismatch). pg_hba.conf was not changed. Backup: $backup"
}
Write-Host "    Backup: $backup"
Write-Host "    SHA-256 (original = backup = in-memory copy): $memoryHash"

Write-Host ""
Write-Host "If this window is closed or interrupted before the script finishes, restore manually:" -ForegroundColor Yellow
Show-ManualRecovery $backup
Write-Host "Do not press Ctrl+C or close the window while the script runs." -ForegroundColor Yellow

$restoreOk = $false
$passwordStepOk = $false
try {
  # -------------------------------------------------------------------------
  # 3. Temporary rule: only user "postgres", only IPv4 localhost. First match wins, so it goes first.
  # -------------------------------------------------------------------------
  Write-Step "Adding the temporary localhost trust rule for 'postgres'"
  $hasBom = $originalBytes.Length -ge 3 -and $originalBytes[0] -eq 0xEF -and $originalBytes[1] -eq 0xBB -and $originalBytes[2] -eq 0xBF
  $bomLength = if ($hasBom) { 3 } else { 0 }
  $prefix = [Text.Encoding]::ASCII.GetBytes($trustLine + "`r`n")
  $temporary = New-Object byte[] ($originalBytes.Length + $prefix.Length)
  [Buffer]::BlockCopy($originalBytes, 0, $temporary, 0, $bomLength)                                   # keep a BOM, if any, first
  [Buffer]::BlockCopy($prefix, 0, $temporary, $bomLength, $prefix.Length)                              # temporary rule
  [Buffer]::BlockCopy($originalBytes, $bomLength, $temporary, $bomLength + $prefix.Length, $originalBytes.Length - $bomLength)  # original rules
  [IO.File]::WriteAllBytes($hba, $temporary)

  # -------------------------------------------------------------------------
  # 4. Reload (no restart; existing connections are unaffected)
  # -------------------------------------------------------------------------
  Write-Step "Reloading the configuration (no restart)"
  $reload = Invoke-Native $pgCtl @("reload", "-D", $dataDir)
  if ($reload.Code -ne 0) { throw "pg_ctl reload failed: $($reload.Text)" }
  $state = Wait-AuthState "trust"
  if ($state -ne "trust") { throw "The temporary rule did not take effect (state '$state'); see the server log in $dataDir\log." }
  Write-Host "    Temporary rule is active."

  # Read-only: database names, so every project's database can be identified.
  Write-Step "Existing databases (read-only listing)"
  $list = Invoke-Native $psql @("-h", "127.0.0.1", "-p", "$Port", "-U", "postgres", "-d", "postgres", "-w", "-tAXc", "select datname from pg_database where not datistemplate order by 1")
  $list.Text -split "`n" | ForEach-Object { Write-Host "    $_" }

  # -------------------------------------------------------------------------
  # 5. Hidden password prompt. psql reads it directly from the console (no PowerShell
  #    redirection, so the prompt stays interactive); it is never echoed or logged.
  # -------------------------------------------------------------------------
  Write-Step "Set the new password for 'postgres' (you will be asked twice; input is hidden)"
  $previous = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    & $psql -h 127.0.0.1 -p $Port -U postgres -d postgres -w -c "\password postgres"
    $code = $LASTEXITCODE
  } finally { $ErrorActionPreference = $previous }
  if ($code -ne 0) { throw "psql \password did not complete (exit $code). The password is probably unchanged." }
  $passwordStepOk = $true
}
catch {
  Write-Fail "Error: $($_.Exception.Message)"
}
finally {
  # -------------------------------------------------------------------------
  # 6. Always restore the original bytes, verify the hash, reload, and confirm the
  #    server is reachable AND demanding a password again.
  # -------------------------------------------------------------------------
  Write-Step "Restoring the original pg_hba.conf"
  try {
    [IO.File]::WriteAllBytes($hba, $originalBytes)
    $restoredHash = (Get-FileHash -LiteralPath $hba -Algorithm SHA256).Hash
    if ($restoredHash -ne $memoryHash) { throw "Restored file hash ($restoredHash) does not match the original ($memoryHash)." }
    Write-Host "    Restored byte-for-byte (SHA-256 matches the original)."
    $reload = Invoke-Native $pgCtl @("reload", "-D", $dataDir)
    if ($reload.Code -ne 0) { throw "pg_ctl reload failed after restoring: $($reload.Text)" }
    $state = Wait-AuthState "password"
    if ($state -ne "password") { throw "After restoring and reloading, the authentication state is '$state' instead of 'password'." }
    Write-Host "    Reloaded. The server is reachable and requires a password again."
    $restoreOk = $true
  }
  catch {
    Write-Fail ""
    Write-Fail "RESTORE COULD NOT BE VERIFIED: $($_.Exception.Message)"
    Write-Fail "The temporary trust rule may still be active. Follow these steps now:"
    Show-ManualRecovery $backup
  }
}

if (-not $restoreOk) { exit 2 }

# ---------------------------------------------------------------------------
# 7. Verify password login with the original rules back in place (psql prompts, hidden)
# ---------------------------------------------------------------------------
if (-not $passwordStepOk) {
  Write-Fail ""
  Write-Fail "The original rules are restored and verified, but the password was NOT changed. You can run the script again."
  exit 1
}
Write-Step "Verifying login with the new password (enter it once more; input is hidden)"
$previous = $ErrorActionPreference
$ErrorActionPreference = "Continue"
try {
  & $psql -h localhost -p $Port -U postgres -d postgres -W -tAXc "select 'Password login OK as ' || current_user"
  $code = $LASTEXITCODE
} finally { $ErrorActionPreference = $previous }
if ($code -ne 0) {
  Write-Fail "Password login failed. The original rules are restored; if you mistyped, run the script again."
  exit 1
}
Write-Host ""
Write-Host "Done. Original authentication restored and verified; the new 'postgres' password works." -ForegroundColor Green
Write-Host "The backup of pg_hba.conf is kept at: $backup"
Write-Host "Next: powershell -ExecutionPolicy Bypass -File scripts\setup-local-db.ps1"
exit 0
