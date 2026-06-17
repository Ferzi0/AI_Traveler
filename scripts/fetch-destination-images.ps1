# Thematic destination covers for AI Traveler (Pexels — verified photo IDs)
$root = Join-Path $PSScriptRoot "..\frontend\public\images\destinations"
New-Item -ItemType Directory -Force -Path $root | Out-Null

$W = "auto=compress&cs=tinysrgb&w=960&h=640&fit=crop"

function Pexels($id) {
  "https://images.pexels.com/photos/$id/pexels-photo-$id.jpeg?$W"
}

function Save-Image($url, $path) {
  Write-Host "Downloading $path"
  curl.exe -fsSL $url -o $path
  if ($LASTEXITCODE -ne 0) {
    if (Test-Path $path) { Remove-Item $path -Force }
    throw "Failed: $path"
  }
}

$destinations = @{
  "istanbul.jpg"  = (Pexels 1089305)  # Босфор / Стамбул
  "phuket.jpg"    = (Pexels 457881)   # Тропический пляж
  "london.jpg"    = (Pexels 460672)   # Биг-Бен / Темза
  "paris.jpg"     = (Pexels 1618542)  # Эйфелева башня
  "dubai.jpg"     = (Pexels 358136)   # Небоскрёбы Дубая
  "tokyo.jpg"     = (Pexels 2506923)  # Токио, огни города
  "barcelona.jpg" = (Pexels 1388038)  # Саграда Фамилия
}

foreach ($entry in $destinations.GetEnumerator()) {
  Save-Image $entry.Value (Join-Path $root $entry.Key)
}

Write-Host "Done. Destination covers updated."
