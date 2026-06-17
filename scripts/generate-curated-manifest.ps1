# Build curated-hotels-manifest.json from Python hotel definitions
$hotelFiles = Get-ChildItem (Join-Path $PSScriptRoot "..\backend\app\data\curated_hotels\*.py") -Exclude "_helpers.py","__init__.py"
$hotels = @{}
foreach ($file in $hotelFiles) {
  $text = Get-Content $file.FullName -Raw
  $matches = [regex]::Matches($text, 'hotel\(\s*"([^"]+)"')
  foreach ($hm in $matches) {
    $hid = $hm.Groups[1].Value
    $start = $hm.Index
    $nextHotel = $text.IndexOf('hotel(', $start + 5)
    if ($nextHotel -lt 0) { $nextHotel = $text.Length }
    $block = $text.Substring($start, $nextHotel - $start)
    $rooms = @{}
    foreach ($rm in [regex]::Matches($block, 'room\("([^"]+)"')) {
      $rooms[$rm.Groups[1].Value] = 5
    }
    $hotels[$hid] = @{ hotel_photos = 4; rooms = $rooms }
  }
}
$manifest = @{ hotels = $hotels }
$path = Join-Path $PSScriptRoot "curated-hotels-manifest.json"
$manifest | ConvertTo-Json -Depth 5 | Set-Content $path -Encoding utf8
Write-Host "Manifest: $($hotels.Count) hotels -> $path"
