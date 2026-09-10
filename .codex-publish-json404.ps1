$remote = '289ce6d2de47110a7dd87b299abab0edbd2ec50c'
$source = '1bf48b07b39a6b98504862be57b99591356e261d'
$blob = git rev-parse "${source}:scripts/cms/api/app.ts"
$idx = Join-Path $env:TEMP ('cms-json-index-' + [guid]::NewGuid().ToString())
$env:GIT_INDEX_FILE = $idx
git read-tree "${remote}^{tree}"
git update-index --add --cacheinfo "100644,$blob,scripts/cms/api/app.ts"
$tree = git write-tree
$commit = (git commit-tree $tree -p $remote -m 'fix(cms): return JSON for CMS API 404s').Trim()
Remove-Item -LiteralPath $idx -Force -ErrorAction SilentlyContinue
Remove-Item Env:GIT_INDEX_FILE -ErrorAction SilentlyContinue
Write-Output "commit=$commit"
git push origin "${commit}:refs/heads/cms-crm-phase1-staging"
git ls-remote origin refs/heads/cms-crm-phase1-staging
