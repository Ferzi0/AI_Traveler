# Hotel gallery photos for AI Traveler (Pexels — verified photo IDs)
$root = Join-Path $PSScriptRoot "..\frontend\public\images\hotels"
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

function Save-HotelSet($hotelId, [int[]]$ids) {
  $dir = Join-Path $root $hotelId
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  for ($i = 0; $i -lt $ids.Length; $i++) {
    Save-Image (Pexels $ids[$i]) (Join-Path $dir "$($i + 1).jpg")
  }
  Save-Image (Pexels $ids[0]) (Join-Path $root "$hotelId.jpg")
}

# Курорт / отель у моря
Save-HotelSet "acc_phuket_laguna" @(3460597, 5740342, 261105, 338504)
# Бюджетное размещение / хостел
Save-HotelSet "acc_phuket_hostel" @(271743, 271618, 271624, 271639)
# Классический городской отель
Save-HotelSet "acc_london_hotel" @(164595, 271624, 189295, 279746)

Save-Image (Pexels 3460597) (Join-Path $root "default.jpg")

Write-Host "Done. Hotel galleries updated."
