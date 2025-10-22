# Apache SSL Setup for HR Performance Management System
# Run as Administrator

Write-Host ""
Write-Host "Apache SSL Setup - HR Performance Management System" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: Run as Administrator!" -ForegroundColor Red
    pause
    exit 1
}

# Configuration
$apacheDir = "C:\xampp\apache"
$sslDir = "$apacheDir\conf\ssl.crt"
$keyDir = "$apacheDir\conf\ssl.key"
$domain = "hrpmg.costaatt.edu.tt"

Write-Host "Domain: $domain" -ForegroundColor Yellow
Write-Host ""

# Step 1: Verify Apache
Write-Host "[1/5] Verifying Apache..." -ForegroundColor Cyan
if (-not (Test-Path "$apacheDir\bin\httpd.exe")) {
    Write-Host "ERROR: Apache not found at $apacheDir" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "  OK" -ForegroundColor Green

# Step 2: Create SSL Directories
Write-Host "[2/5] Creating SSL directories..." -ForegroundColor Cyan
if (-not (Test-Path $sslDir)) {
    New-Item -ItemType Directory -Force -Path $sslDir | Out-Null
}
if (-not (Test-Path $keyDir)) {
    New-Item -ItemType Directory -Force -Path $keyDir | Out-Null
}
Write-Host "  OK" -ForegroundColor Green

# Step 3: Generate SSL Certificate
Write-Host "[3/5] Generating SSL certificate..." -ForegroundColor Cyan

$certPath = "$sslDir\$domain.crt"
$keyPath = "$keyDir\$domain.key"
$pfxPath = "$sslDir\$domain.pfx"

$cert = New-SelfSignedCertificate -DnsName $domain, "www.$domain", "10.2.1.27" -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddYears(10) -FriendlyName "HR Performance Management System"

$password = ConvertTo-SecureString -String "hrpmg2025" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $password | Out-Null

$opensslPath = "$apacheDir\bin\openssl.exe"
$env:OPENSSL_CONF = "$apacheDir\bin\openssl.cnf"

& $opensslPath pkcs12 -in $pfxPath -out $certPath -clcerts -nokeys -password pass:hrpmg2025 2>$null
if ($LASTEXITCODE -ne 0) {
    & $opensslPath pkcs12 -in $pfxPath -out $certPath -clcerts -nokeys -password pass:hrpmg2025 -legacy 2>$null
}

& $opensslPath pkcs12 -in $pfxPath -out $keyPath -nocerts -nodes -password pass:hrpmg2025 2>$null
if ($LASTEXITCODE -ne 0) {
    & $opensslPath pkcs12 -in $pfxPath -out $keyPath -nocerts -nodes -password pass:hrpmg2025 -legacy 2>$null
}

Write-Host "  OK - Certificate created" -ForegroundColor Green

# Step 4: Create Apache Virtual Host Configuration
Write-Host "[4/5] Creating Apache vhost config..." -ForegroundColor Cyan

$vhostConfigFile = "$apacheDir\conf\extra\httpd-hr-vhost.conf"
$certPathFwd = $certPath -replace '\\', '/'
$keyPathFwd = $keyPath -replace '\\', '/'

# Write configuration file directly
$config = New-Object System.Collections.ArrayList
$config.Add("# HR Performance Management System - Virtual Host Configuration") | Out-Null
$config.Add("") | Out-Null
$config.Add("# HTTP Virtual Host (Port 80) - Redirect to HTTPS") | Out-Null
$config.Add("<VirtualHost *:80>") | Out-Null
$config.Add("    ServerName $domain") | Out-Null
$config.Add("    ServerAlias www.$domain") | Out-Null
$config.Add("    ") | Out-Null
$config.Add("    RewriteEngine On") | Out-Null
$config.Add("    RewriteCond %{HTTPS} off") | Out-Null
$config.Add("    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]") | Out-Null
$config.Add("    ") | Out-Null
$config.Add("    ErrorLog `"logs/${domain}_error.log`"") | Out-Null
$config.Add("    CustomLog `"logs/${domain}_access.log`" combined") | Out-Null
$config.Add("</VirtualHost>") | Out-Null
$config.Add("") | Out-Null
$config.Add("# HTTPS Virtual Host (Port 443)") | Out-Null
$config.Add("<VirtualHost *:443>") | Out-Null
$config.Add("    ServerName $domain") | Out-Null
$config.Add("    ServerAlias www.$domain") | Out-Null
$config.Add("    ") | Out-Null
$config.Add("    SSLEngine on") | Out-Null
$config.Add("    SSLCertificateFile `"$certPathFwd`"") | Out-Null
$config.Add("    SSLCertificateKeyFile `"$keyPathFwd`"") | Out-Null
$config.Add("    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1") | Out-Null
$config.Add("    SSLCipherSuite HIGH:!aNULL:!MD5:!3DES") | Out-Null
$config.Add("    SSLHonorCipherOrder on") | Out-Null
$config.Add("    ") | Out-Null
$config.Add("    ProxyPreserveHost On") | Out-Null
$config.Add("    ProxyRequests Off") | Out-Null
$config.Add("    ProxyTimeout 600") | Out-Null
$config.Add("    ") | Out-Null
$config.Add("    ProxyPass /api/ http://127.0.0.1:3000/") | Out-Null
$config.Add("    ProxyPassReverse /api/ http://127.0.0.1:3000/") | Out-Null
$config.Add("    ") | Out-Null
$config.Add("    ProxyPass /auth/ http://127.0.0.1:3000/auth/") | Out-Null
$config.Add("    ProxyPassReverse /auth/ http://127.0.0.1:3000/auth/") | Out-Null
$config.Add("    ") | Out-Null
$config.Add("    ProxyPass /appraisals http://127.0.0.1:3000/appraisals") | Out-Null
$config.Add("    ProxyPassReverse /appraisals http://127.0.0.1:3000/appraisals") | Out-Null
$config.Add("    ") | Out-Null
$config.Add("    ProxyPass /employees http://127.0.0.1:3000/employees") | Out-Null
$config.Add("    ProxyPassReverse /employees http://127.0.0.1:3000/employees") | Out-Null
$config.Add("    ") | Out-Null
$config.Add("    ProxyPass /competencies http://127.0.0.1:3000/competencies") | Out-Null
$config.Add("    ProxyPassReverse /competencies http://127.0.0.1:3000/competencies") | Out-Null
$config.Add("    ") | Out-Null
$config.Add("    ProxyPass /cycles http://127.0.0.1:3000/cycles") | Out-Null
$config.Add("    ProxyPassReverse /cycles http://127.0.0.1:3000/cycles") | Out-Null
$config.Add("    ") | Out-Null
$config.Add("    ProxyPass /templates http://127.0.0.1:3000/templates") | Out-Null
$config.Add("    ProxyPassReverse /templates http://127.0.0.1:3000/templates") | Out-Null
$config.Add("    ") | Out-Null
$config.Add("    ProxyPass /self-evaluations http://127.0.0.1:3000/self-evaluations") | Out-Null
$config.Add("    ProxyPassReverse /self-evaluations http://127.0.0.1:3000/self-evaluations") | Out-Null
$config.Add("    ") | Out-Null
$config.Add("    ProxyPass /users http://127.0.0.1:3000/users") | Out-Null
$config.Add("    ProxyPassReverse /users http://127.0.0.1:3000/users") | Out-Null
$config.Add("    ") | Out-Null
$config.Add("    ProxyPass / http://127.0.0.1:5173/") | Out-Null
$config.Add("    ProxyPassReverse / http://127.0.0.1:5173/") | Out-Null
$config.Add("    ") | Out-Null
$config.Add("    ErrorLog `"logs/${domain}_ssl_error.log`"") | Out-Null
$config.Add("    CustomLog `"logs/${domain}_ssl_access.log`" combined") | Out-Null
$config.Add("</VirtualHost>") | Out-Null

$config | Set-Content -Path $vhostConfigFile -Encoding UTF8

# Add include to httpd.conf
$httpdConf = "$apacheDir\conf\httpd.conf"
$httpdContent = Get-Content $httpdConf -Raw
if ($httpdContent -notmatch "httpd-hr-vhost\.conf") {
    Add-Content -Path $httpdConf -Value "`nInclude conf/extra/httpd-hr-vhost.conf"
}

Write-Host "  OK - Configuration created" -ForegroundColor Green

# Step 5: Configure Firewall
Write-Host "[5/5] Configuring firewall..." -ForegroundColor Cyan

$httpRule = Get-NetFirewallRule -DisplayName "Apache HTTP" -ErrorAction SilentlyContinue
if (-not $httpRule) {
    New-NetFirewallRule -DisplayName "Apache HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow | Out-Null
}

$httpsRule = Get-NetFirewallRule -DisplayName "Apache HTTPS" -ErrorAction SilentlyContinue
if (-not $httpsRule) {
    New-NetFirewallRule -DisplayName "Apache HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow | Out-Null
}

Write-Host "  OK - Firewall rules configured" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Certificate created: $certPath" -ForegroundColor White
Write-Host "Private key: $keyPath" -ForegroundColor White
Write-Host ""
Write-Host "Next: Restart Apache" -ForegroundColor Yellow
Write-Host "  C:\xampp\apache\bin\httpd.exe -k restart" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then access: https://$domain" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter to restart Apache now..." -ForegroundColor Yellow
$null = Read-Host

Write-Host "Restarting Apache..." -ForegroundColor Cyan
& "$apacheDir\bin\httpd.exe" -k restart

Start-Sleep -Seconds 2

$apacheProc = Get-Process httpd -ErrorAction SilentlyContinue
if ($apacheProc) {
    Write-Host "Apache is running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access your site at: https://$domain" -ForegroundColor Cyan
} else {
    Write-Host "Apache may not be running. Check XAMPP Control Panel." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host ""


