$ErrorActionPreference = 'Stop'

Push-Location $PSScriptRoot
try {
  Set-Location '../com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin/imgs/plugin/'

  magick -background none -size 256x256 marketplace.svg marketplace.png
  magick -background none -size 512x512 marketplace.svg marketplace@2x.png
}
finally {
  Pop-Location
}
