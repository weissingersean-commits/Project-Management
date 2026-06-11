# Build script: concatenates /src/ files into index.html
# Usage: .\build.ps1
# Output: index.html (ready for GitHub Pages or open directly in browser)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

$css = Get-Content -Raw "$root\src\main.css" -Encoding utf8

$jsFiles = @(
    "$root\src\constants.js",
    "$root\src\utils.js",
    "$root\src\state.js",
    "$root\src\views\header.js",
    "$root\src\views\modal-job.js",
    "$root\src\views\tab-tasks.js",
    "$root\src\views\tab-parts.js",
    "$root\src\views\tab-docs.js",
    "$root\src\views\view-jobs.js",
    "$root\src\views\view-materials.js",
    "$root\src\views\dashboard.js",
    "$root\src\views\settings.js",
    "$root\src\render.js"
)

$js = ""
foreach ($f in $jsFiles) {
    $js += (Get-Content -Raw $f -Encoding utf8) + "`n"
}

$head = @'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Job Manager</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
'@

$mid = @'
</style>
</head>
<body>
<div id="app"></div>
<script>
'@

$tail = @'
</script>
</body>
</html>
'@

$html = $head + $css + $mid + $js + $tail
[System.IO.File]::WriteAllText("$root\index.html", $html, [System.Text.Encoding]::UTF8)

Write-Host "Built index.html" -ForegroundColor Green
Write-Host "Open index.html in your browser to use the app."
