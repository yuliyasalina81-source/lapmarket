# Connect LapMarket to GitHub + Vercel auto-deploy
# Run: powershell -ExecutionPolicy Bypass -File scripts/setup-github.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

$Gh = "$env:TEMP\gh-cli\bin\gh.exe"
if (-not (Test-Path $Gh)) {
    Write-Host "Downloading GitHub CLI..."
    $zip = "$env:TEMP\gh.zip"
    Invoke-WebRequest -Uri "https://github.com/cli/cli/releases/download/v2.67.0/gh_2.67.0_windows_amd64.zip" -OutFile $zip -UseBasicParsing
    Expand-Archive $zip -DestinationPath "$env:TEMP\gh-cli" -Force
}

$prevEAP = $ErrorActionPreference
$ErrorActionPreference = "Continue"
& $Gh auth status 2>&1 | Out-Null
$loggedIn = ($LASTEXITCODE -eq 0)
$ErrorActionPreference = $prevEAP
if (-not $loggedIn) {
    Write-Host ""
    Write-Host "Browser will open for GitHub login. Complete authorization there."
    Write-Host ""
    & $Gh auth login --hostname github.com --git-protocol https --web
}

$repoName = "lapmarket"
$ErrorActionPreference = "Continue"
& $Gh repo view $repoName 2>&1 | Out-Null
$repoExists = ($LASTEXITCODE -eq 0)
$ErrorActionPreference = $prevEAP
if (-not $repoExists) {
    Write-Host "Creating GitHub repo: $repoName"
    & $Gh repo create $repoName --public --source=. --remote=origin --description "LapMarket - pet social network and marketplace"
}
else {
    $url = & $Gh repo view $repoName --json url -q .url
    $hasOrigin = git remote 2>$null
    if (-not $hasOrigin) {
        git remote add origin "$url.git"
    }
}

Write-Host "Pushing to GitHub..."
git push -u origin master
if ($LASTEXITCODE -ne 0) {
    git branch -M main
    git push -u origin main
}

Write-Host "Connecting Vercel to Git repository..."
$remote = git remote get-url origin
npx vercel git connect $remote --yes

Write-Host ""
Write-Host "Done. Site: https://lapmarket.vercel.app"
Write-Host "Repo:" (& $Gh repo view $repoName --json url -q .url)
