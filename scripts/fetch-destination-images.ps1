# Thematic destination covers for AI Traveler (Unsplash — iconic landmarks, verified URLs)
$root = Join-Path $PSScriptRoot "..\frontend\public\images\destinations"
New-Item -ItemType Directory -Force -Path $root | Out-Null

$W = "w=960&q=80&fit=crop"

function Unsplash($id) {
  "https://images.unsplash.com/$id`?$W"
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
  "istanbul.jpg"  = (Unsplash "photo-1524231757912-21f4fe3a7200")  # Босфор, мечети
  "phuket.jpg"    = (Unsplash "photo-1507525428034-b723cf961d3e")    # Тропический пляж
  "london.jpg"    = (Unsplash "photo-1539037116277-4db20889f2d4")    # Биг-Бен, Westminster
  "paris.jpg"     = (Unsplash "photo-1502602898657-3e91760cbb34")    # Эйфелева башня
  "dubai.jpg"     = (Unsplash "photo-1512453979798-5ea266f8880c")    # Панорама Дубая
  "tokyo.jpg"     = (Unsplash "photo-1542051841857-5f90071e7989")    # Токио, огни
  "barcelona.jpg" = (Unsplash "photo-1467269204594-9661b134dd2b")    # Саграда Фамилия
  "sochi.jpg"     = "https://images.pexels.com/photos/2404843/pexels-photo-2404843.jpeg?auto=compress&cs=tinysrgb&w=960&fit=crop"
}

foreach ($entry in $destinations.GetEnumerator()) {
  Save-Image $entry.Value (Join-Path $root $entry.Key)
}

Write-Host "Done. Destination covers updated."
