# Thematic detail images for AI Traveler (Unsplash)
$root = Join-Path $PSScriptRoot "..\frontend\public\images\detail"
$categories = Join-Path $root "categories"
$variants = Join-Path $root "variants"
$items = Join-Path $root "items"

New-Item -ItemType Directory -Force -Path $categories, $variants, $items | Out-Null

function Save-Image($url, $path) {
  Write-Host "Downloading $path"
  curl.exe -fsSL "$url" -o $path
  if ($LASTEXITCODE -ne 0 -and (Test-Path $path)) { Remove-Item $path -Force }
}

function Copy-IfMissing($src, $dst) {
  if ((Test-Path $src) -and -not (Test-Path $dst)) {
    Copy-Item $src $dst
    Write-Host "Copied $dst"
  }
}

$W = "w=640&q=80&fit=crop"

# Category covers
Save-Image "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?$W" (Join-Path $categories "restaurants.jpg")
Save-Image "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?$W" (Join-Path $categories "attractions.jpg")
Save-Image "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?$W" (Join-Path $categories "events.jpg")
Save-Image "https://images.unsplash.com/photo-1551632810-562948b24505?$W" (Join-Path $categories "walking_routes.jpg")
Save-Image "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?$W" (Join-Path $categories "public_transport.jpg")
Save-Image "https://images.unsplash.com/photo-1449965414446-460a09280577?$W" (Join-Path $categories "taxi.jpg")
Save-Image "https://images.unsplash.com/photo-1558981403-c5f98991a608?$W" (Join-Path $categories "rent.jpg")
Save-Image "https://images.unsplash.com/photo-1544551763-46a013bb70d5?$W" (Join-Path $categories "ferry.jpg")

# Variants
Save-Image "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?$W" (Join-Path $variants "restaurants-1.jpg")
Save-Image "https://images.unsplash.com/photo-1559339352-11d035aa65de?$W" (Join-Path $variants "restaurants-2.jpg")
Save-Image "https://images.unsplash.com/photo-1552566626-52f8b828add9?$W" (Join-Path $variants "restaurants-3.jpg")
Save-Image "https://images.unsplash.com/photo-1504674900247-0877df9cc836?$W" (Join-Path $variants "restaurants-4.jpg")
Save-Image "https://images.unsplash.com/photo-1469474968028-56623f02e42e?$W" (Join-Path $variants "attractions-1.jpg")
Save-Image "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?$W" (Join-Path $variants "attractions-2.jpg")
Save-Image "https://images.unsplash.com/photo-1528181304800-259b08848526?$W" (Join-Path $variants "attractions-3.jpg")
Save-Image "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?$W" (Join-Path $variants "attractions-4.jpg")
Save-Image "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?$W" (Join-Path $variants "events-1.jpg")
Save-Image "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?$W" (Join-Path $variants "events-2.jpg")
Save-Image "https://images.unsplash.com/photo-1506157786151-b8491531f063?$W" (Join-Path $variants "events-3.jpg")
Save-Image "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?$W" (Join-Path $variants "walking_routes-1.jpg")
Save-Image "https://images.unsplash.com/photo-1551524164-687a55dd1126?$W" (Join-Path $variants "walking_routes-2.jpg")
Save-Image "https://images.unsplash.com/photo-1559827260-dc66d52bef19?$W" (Join-Path $variants "walking_routes-3.jpg")
Save-Image "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?$W" (Join-Path $variants "public_transport-1.jpg")
Save-Image "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?$W" (Join-Path $variants "public_transport-2.jpg")
Save-Image "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?$W" (Join-Path $variants "public_transport-3.jpg")
Save-Image "https://images.unsplash.com/photo-1553440569-bcc63803a83d?$W" (Join-Path $variants "taxi-1.jpg")
Save-Image "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?$W" (Join-Path $variants "taxi-2.jpg")
Save-Image "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?$W" (Join-Path $variants "taxi-3.jpg")
Save-Image "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?$W" (Join-Path $variants "rent-1.jpg")
Save-Image "https://images.unsplash.com/photo-1571068316344-75bc76f77890?$W" (Join-Path $variants "rent-2.jpg")
Save-Image "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?$W" (Join-Path $variants "rent-3.jpg")
Save-Image "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?$W" (Join-Path $variants "ferry-1.jpg")
Save-Image "https://images.unsplash.com/photo-1578662996442-48f60103fc96?$W" (Join-Path $variants "ferry-2.jpg")
Save-Image "https://images.unsplash.com/photo-1519681393784-d120267933ba?$W" (Join-Path $variants "ferry-3.jpg")

$itemUrls = @{
  "laguna_rest_1" = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?$W"
  "laguna_rest_2" = "https://images.unsplash.com/photo-1551218808-94e220e084d2?$W"
  "laguna_rest_3" = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?$W"
  "laguna_attr_1" = "https://images.unsplash.com/photo-1548013146-72479768bada?$W"
  "laguna_attr_2" = "https://images.unsplash.com/photo-1552465011-b0f589247184?$W"
  "laguna_event_1" = "https://images.unsplash.com/photo-1533177861766-c1185136836e?$W"
  "laguna_event_2" = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?$W"
  "laguna_walk_1" = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?$W"
  "laguna_walk_2" = "https://images.unsplash.com/photo-1439066615861-d1af74d74000?$W"
  "hostel_rest_1" = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?$W"
  "hostel_rest_2" = "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?$W"
  "hostel_attr_1" = "https://images.unsplash.com/photo-1528181304800-259b08848526?$W"
  "hostel_event_1" = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?$W"
  "hostel_walk_1" = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?$W"
  "london_rest_1" = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?$W"
  "london_attr_1" = "https://images.unsplash.com/photo-1513635269977-59663e0ac1ad?$W"
  "london_event_1" = "https://images.unsplash.com/photo-1507676184292-7587a6a6b0bd?$W"
  "london_walk_1" = "https://images.unsplash.com/photo-1511735111811-156782d4d2e7?$W"
  "phuket_bus_1" = "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?$W"
  "phuket_taxi_1" = "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?$W"
  "phuket_rent_1" = "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?$W"
  "phuket_ferry_1" = "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?$W"
  "london_public_1" = "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?$W"
  "london_taxi_1" = "https://images.unsplash.com/photo-1449965414446-460a09280577?$W"
  "london_rent_1" = "https://images.unsplash.com/photo-1571068316344-75bc76f77890?$W"
  "istanbul_public_1" = "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?$W"
  "istanbul_taxi_1" = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?$W"
  "istanbul_ferry_1" = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?$W"
}

foreach ($entry in $itemUrls.GetEnumerator()) {
  Save-Image $entry.Value (Join-Path $items "$($entry.Key).jpg")
}

# Fallbacks from variants when download failed
Copy-IfMissing (Join-Path $variants "walking_routes-1.jpg") (Join-Path $categories "walking_routes.jpg")
Copy-IfMissing (Join-Path $variants "public_transport-1.jpg") (Join-Path $categories "public_transport.jpg")
Copy-IfMissing (Join-Path $variants "taxi-1.jpg") (Join-Path $categories "taxi.jpg")
Copy-IfMissing (Join-Path $variants "rent-2.jpg") (Join-Path $categories "rent.jpg")

$itemFallbacks = @{
  "laguna_attr_1" = "attractions-3.jpg"
  "laguna_attr_2" = "attractions-4.jpg"
  "laguna_event_1" = "events-2.jpg"
  "london_attr_1" = "attractions-2.jpg"
  "london_event_1" = "events-1.jpg"
  "london_walk_1" = "walking_routes-2.jpg"
  "london_public_1" = "public_transport-2.jpg"
  "london_taxi_1" = "taxi-1.jpg"
  "phuket_bus_1" = "public_transport-3.jpg"
  "phuket_rent_1" = "rent-2.jpg"
}

foreach ($entry in $itemFallbacks.GetEnumerator()) {
  Copy-IfMissing (Join-Path $variants $entry.Value) (Join-Path $items "$($entry.Key).jpg")
}

Write-Host "Done."
