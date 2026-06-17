# Download all thematic card images (destinations, hotels, rooms, detail tree)
$here = $PSScriptRoot
& (Join-Path $here "generate-curated-manifest.ps1")
& (Join-Path $here "fetch-destination-images.ps1")
& (Join-Path $here "fetch-curated-hotel-images.ps1")
& (Join-Path $here "fetch-room-images.ps1")
& (Join-Path $here "fetch-detail-images.ps1")
Write-Host "All card images fetched."
