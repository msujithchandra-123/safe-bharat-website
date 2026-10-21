<#
  Creates a dedicated, least-privilege PostgreSQL role and two databases for the
  Safe Bharat website on the native Windows PostgreSQL service, and writes the
  connection strings to .env.local.

  Run it yourself in PowerShell from the project folder:
      powershell -ExecutionPolicy Bypass -File scripts\setup-local-db.ps1

  Safety:
  - Asks for the PostgreSQL admin password with a hidden prompt; it is kept only in
    this process's memory and is never written to disk or printed.
  - Generates a random password for the new role. It is written only to .env.local
    (git-ignored) and never printed.
  - Stops without changing anything if the role or either database already exists.
  - Only CREATEs new objects. It does not alter, drop or reset any existing role,
    password, database or configuration file.
#>
param(
  [string]$PgBin = "C:\Program Files\PostgreSQL\17\bin",
  [string]$AdminUser = "postgres",
  [int]$Port = 5432,
  [string]$AppRole = "safebharat_app",
  [string]$Database = "safebharat",
  [string]$TestDatabase = "safebharat_test"
)
$ErrorActionPreference = "Stop"
$psql = Join-Path $PgBin "psql.exe"
if (-not (Test-Path $psql)) { throw "psql.exe not found at $psql" }
if (-not $TestDatabase.EndsWith("_test")) { throw "The test database name must end in _test." }
$envFile = Join-Path (Split-Path $PSScriptRoot -Parent) ".env.local"

$secure = Read-Host "Password for PostgreSQL user '$AdminUser' (hidden, not stored)" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

function Invoke-Query([string]$sql) {
  $out = & $psql -h localhost -p $Port -U $AdminUser -d postgres -v ON_ERROR_STOP=1 -tAX -c $sql
  if ($LASTEXITCODE -ne 0) { throw "psql query failed (exit $LASTEXITCODE). Nothing further was changed." }
  return ($out | Out-String).Trim()
}

try {
  # 1. Read-only pre-checks
  $version = Invoke-Query "SHOW server_version"
  Write-Host "Connected to PostgreSQL $version as $AdminUser."
  $taken = Invoke-Query "SELECT coalesce(string_agg(datname, ', '), '') FROM pg_database WHERE datname IN ('$Database', '$TestDatabase')"
  $roleCount = Invoke-Query "SELECT count(*) FROM pg_roles WHERE rolname = '$AppRole'"
  if ($taken -or $roleCount -ne "0") {
    throw "Stopping: already exists -> databases: [$taken], role '$AppRole' count: $roleCount. Nothing was changed."
  }

  # 2. Random password for the application role (letters and digits only, so it needs no URL encoding)
  $chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
  $bytes = New-Object byte[] 32
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $appPassword = -join ($bytes | ForEach-Object { $chars[$_ % $chars.Length] })

  # 3. Create the role and databases. Statements go through stdin (not the command line),
  #    each in its own transaction (CREATE DATABASE cannot run inside one).
  $sql = @"
CREATE ROLE $AppRole LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 20 PASSWORD '$appPassword';
CREATE DATABASE $Database OWNER $AppRole;
CREATE DATABASE $TestDatabase OWNER $AppRole;
REVOKE ALL ON DATABASE $Database FROM PUBLIC;
REVOKE ALL ON DATABASE $TestDatabase FROM PUBLIC;
"@
  $sql | & $psql -h localhost -p $Port -U $AdminUser -d postgres -v ON_ERROR_STOP=1 -q -f -
  if ($LASTEXITCODE -ne 0) { throw "Creating the role or databases failed (exit $LASTEXITCODE). Check the output above; partially created objects can be listed with \l and \du." }
  Write-Host "Created role '$AppRole' and databases '$Database' and '$TestDatabase'."

  # 4. Write the connection strings to .env.local (other lines are preserved)
  $lines = @()
  if (Test-Path $envFile) { $lines = @(Get-Content $envFile | Where-Object { $_ -notmatch '^(DATABASE_URL|TEST_DATABASE_URL)=' }) }
  $lines += "DATABASE_URL=postgresql://${AppRole}:${appPassword}@localhost:${Port}/${Database}"
  $lines += "TEST_DATABASE_URL=postgresql://${AppRole}:${appPassword}@localhost:${Port}/${TestDatabase}"
  [IO.File]::WriteAllLines($envFile, [string[]]$lines, (New-Object Text.UTF8Encoding($false)))
  Write-Host "Wrote DATABASE_URL and TEST_DATABASE_URL to .env.local (password not shown)."
}
finally {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  $appPassword = $null
}
