# Hotel room photos for AI Traveler (Pexels — verified hotel-interior IDs only)
$root = Join-Path $PSScriptRoot "..\frontend\public\images\rooms"
$W = "auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"

function Pexels($id) {
  "https://images.pexels.com/photos/$id/pexels-photo-$id.jpeg?$W"
}

function Save-RoomImage($path, $url) {
  Write-Host "Downloading $path"
  curl.exe -fsSL $url -o $path
  if ($LASTEXITCODE -ne 0) { throw "Failed: $path" }
}

$simple = @(271618, 271624, 262048, 271639)
$twin   = @(271743, 279746, 189295, 1571460)
$luxury = @(164595, 1454806, 262048, 1571460)

function Save-RoomSet($hotelId, $roomKey, [int[]]$ids) {
  $dir = Join-Path $root $hotelId
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  for ($i = 0; $i -lt 4; $i++) {
    Save-RoomImage (Join-Path $dir "$roomKey-$($i + 1).jpg") (Pexels $ids[$i])
  }
}

foreach ($hotel in @("acc_phuket_hostel", "acc_phuket_laguna", "acc_london_hotel")) {
  Save-RoomSet $hotel "std" $simple
  Save-RoomSet $hotel "family" $twin
  Save-RoomSet $hotel "suite" $luxury
}

Write-Host "Done. Room images updated."
