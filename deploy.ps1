[CmdletBinding()]
param(
    [string]$CommitMessage = 'Update LAwebs portfolio',
    [ValidateSet('All', 'GitHub', 'Prod', 'Check')][string]$Target = 'All',
    [string]$SSHHost = 'root@vee-app.co.il',
    [string]$Origin = '',
    [string]$SiteOrigin = 'https://lawebs.co.il'
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
function Run([string]$Command, [string[]]$Arguments) {
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$Command failed ($LASTEXITCODE). Update stopped." }
}
Push-Location $PSScriptRoot
try {
    $env:SITE_ORIGIN = $SiteOrigin
    if (-not $Origin) { throw 'Set -Origin to the Git remote before publishing.' }
    Run npm.cmd @('run', 'build')
    Run npm.cmd @('run', 'check')
    Run git @('diff', '--check')
    if ($Target -eq 'Check') { return }
    $currentOrigin = (Run git @('remote', 'get-url', 'origin') | Out-String).Trim()
    if (-not $currentOrigin) { Run git @('remote', 'add', 'origin', $Origin); $currentOrigin = $Origin }
    if ($currentOrigin -ne $Origin) { throw "Unexpected origin: $currentOrigin" }
    if ((Run git @('branch', '--show-current') | Out-String).Trim() -ne 'main') { throw 'Switch to main before publishing.' }
    Run git @('fetch', 'origin')
    $paths = @('src','public','dist','scripts','tests','docs','package.json','package-lock.json','playwright.config.js','README.md','PRODUCT.md','DESIGN.md','deploy.ps1','.gitignore')
    Run git (@('add', '--') + @($paths | Where-Object { Test-Path -LiteralPath $_ }))
    if (@(Run git @('diff', '--cached', '--name-only')).Count) { Run git @('commit', '-m', $CommitMessage) }
    Run git @('push', '-u', 'origin', 'HEAD:main')
    $revision = (Run git @('rev-parse', 'HEAD') | Out-String).Trim()
    if ($Target -eq 'GitHub') { return }
    $remoteRevision = ((Run git @('ls-remote', 'origin', 'refs/heads/main') | Out-String).Trim() -split '\s+')[0]
    if ($remoteRevision -ne $revision) { throw 'Remote main does not match the deployment revision.' }
    if ($SSHHost -notmatch '^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$') { throw 'Invalid SSH host.' }
    $prepare = @'
set -eu
repo=/opt/lawebs-portfolio/source.git
test "$(git --git-dir="$repo" remote get-url origin)" = '__ORIGIN__'
git --git-dir="$repo" fetch origin main
test "$(git --git-dir="$repo" rev-parse FETCH_HEAD)" = '__REV__'
install -d -m 755 /opt/lawebs-portfolio/incoming
archive=$(mktemp /opt/lawebs-portfolio/incoming/archive.XXXXXXXX)
trap 'rm -f "$archive"' EXIT
git --git-dir="$repo" archive --format=tar.gz --output="$archive" '__REV__'
mv "$archive" '/opt/lawebs-portfolio/incoming/__REV__.tar.gz'
'@
    Run ssh @('-o','BatchMode=yes','-o','ConnectTimeout=15',$SSHHost,$prepare.Replace('__REV__',$revision).Replace('__ORIGIN__',$Origin).Replace([string][char]13,''))
    Run ssh @('-o','BatchMode=yes',$SSHHost,"tar -xOf /opt/lawebs-portfolio/incoming/$revision.tar.gz scripts/deploy-linux.sh | bash -s -- $revision")
    $response = Invoke-WebRequest $SiteOrigin -UseBasicParsing
    if ($response.StatusCode -ne 200 -or $response.Content -notmatch 'LAwebs') { throw 'Public homepage verification failed.' }
    Write-Host "Live: $SiteOrigin ($revision)" -ForegroundColor Green
} finally { Pop-Location }
