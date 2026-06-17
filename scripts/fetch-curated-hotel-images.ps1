# Curated hotel & room photos — только проверенные Pexels ID (отель/курорт/номер)
param(
  [string]$ManifestPath = "",
  [switch]$Force
)

$root = Join-Path $PSScriptRoot "..\frontend\public\images"
$W = "auto=compress&cs=tinysrgb&w=960&h=640&fit=crop"

function Pexels($id) {
  "https://images.pexels.com/photos/$id/pexels-photo-$id.jpeg?$W"
}

function Save-Image($url, $path) {
  if (-not $Force -and (Test-Path $path) -and ((Get-Item $path).Length -gt 8000)) {
    return
  }
  $dir = Split-Path $path -Parent
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  for ($attempt = 1; $attempt -le 3; $attempt++) {
    Write-Host "Downloading $path"
    curl.exe -fsSL $url -o $path
    if ($LASTEXITCODE -eq 0 -and (Test-Path $path) -and ((Get-Item $path).Length -gt 8000)) {
      return
    }
    if (Test-Path $path) { Remove-Item $path -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
  }
  Write-Warning "Failed: $path"
}

function Hash-Seed($text) {
  $h = 0
  foreach ($c in $text.ToCharArray()) {
    $h = ($h * 31 + [int][char]$c) % 1000003
  }
  return [Math]::Abs($h)
}

function Pick-FromPool($seed, [int[]]$pool, [int]$count) {
  $h = Hash-Seed $seed
  $picked = @()
  for ($i = 0; $i -lt $count; $i++) {
    $idx = ($h + $i * 7) % $pool.Length
    $id = $pool[$idx]
    $guard = 0
    while ($picked -contains $id -and $guard -lt $pool.Length) {
      $idx = ($idx + 1) % $pool.Length
      $id = $pool[$idx]
      $guard++
    }
    $picked += $id
  }
  return $picked
}

# Курорт / бассейн / пляж (проверено вручную; 2901209 и 774909 удалены — не отели)
$ResortGallery = @(
  457881, 3460597, 5746250, 5740342, 14024023, 8484839, 261105, 338504
)
# Интерьер отеля / люкс (без городских панорам и цветов; 1457842 и 259862 удалены)
$CityGallery = @(
  164595, 1454806, 271624, 189295, 1571460, 271618, 279746, 262048
)
# Бюджет / хостел
$BudgetGallery = @(
  271743, 271618, 271624, 271639, 279746, 189295
)

# Только спальни (проверено)
$RoomStandard = @(271618, 271624, 262048, 271639)
$RoomFamily   = @(271743, 189295, 1571460, 271618, 279746)
$RoomSuite    = @(164595, 1454806, 262048, 1571460, 189295)

function Hotel-GalleryIds($hotelId) {
  if ($hotelId -match 'hostel|rove|cheers|generator|lubd') {
    return Pick-FromPool $hotelId $BudgetGallery 4
  }
  if ($hotelId -match 'phuket|sochi|banyan|slate|jw|movenpick|pullman|amari|novotel|laguna|radisson|marriott|bridge|bogatyr|goldentulip|hyatt|rodina|atlantis|jumeirah|kempinski|burj|raffles|address|fourseasons|anantara|lemeridien|hilton|sheraton|rixos|rix|palm') {
    return Pick-FromPool $hotelId $ResortGallery 4
  }
  return Pick-FromPool $hotelId $CityGallery 4
}

function Room-GalleryIds($roomKey) {
  $seed = "room:$roomKey"
  if ($roomKey -match 'suite|villa|royal|grand|penthouse|presidential|underwater|palace|signature|prestige|chalet|pavilion|ocean|executive|armani|ritz|bristol|georgev|shangri|plaza|meurice|lutetia') {
    return Pick-FromPool $seed $RoomSuite 5
  }
  if ($roomKey -match 'family|twin|triple|quad|two_bedroom|connect|dorm') {
    return Pick-FromPool $seed $RoomFamily 5
  }
  return Pick-FromPool $seed $RoomStandard 5
}

if (-not $ManifestPath) {
  $ManifestPath = Join-Path $PSScriptRoot "curated-hotels-manifest.json"
}

if (-not (Test-Path $ManifestPath)) {
  & (Join-Path $PSScriptRoot "generate-curated-manifest.ps1")
}

$manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
$roomCount = 0

foreach ($prop in $manifest.hotels.PSObject.Properties) {
  $hotelId = $prop.Name
  $spec = $prop.Value
  $hids = Hotel-GalleryIds $hotelId
  for ($i = 0; $i -lt $hids.Length; $i++) {
    Save-Image (Pexels $hids[$i]) (Join-Path $root "hotels\$hotelId\$($i + 1).jpg")
  }
  Save-Image (Pexels $hids[0]) (Join-Path $root "hotels\$hotelId.jpg")

  foreach ($roomProp in $spec.rooms.PSObject.Properties) {
    $roomKey = $roomProp.Name
    $rids = Room-GalleryIds "$hotelId`:$roomKey"
    for ($j = 0; $j -lt $rids.Length; $j++) {
      Save-Image (Pexels $rids[$j]) (Join-Path $root "rooms\$hotelId\$roomKey-$($j + 1).jpg")
      $roomCount++
    }
  }
}

Write-Host "Done. Hotels: $($manifest.hotels.PSObject.Properties.Count), room files: $roomCount"
