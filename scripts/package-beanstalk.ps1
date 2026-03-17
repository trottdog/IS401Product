$ErrorActionPreference = "Stop"

$root = "c:\Users\GeorgeColinRamsay\Documents\GitHub\IS401Product"
$zip = Join-Path $root "IS401Product-beanstalk-upload.zip"

if (Test-Path $zip) {
  Remove-Item $zip -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$excludeDirs = @(
  ".git",
  ".expo",
  ".local",
  "node_modules",
  "static-build",
  "server_dist",
  "deploy-bundle"
)

$files = Get-ChildItem -Path $root -Recurse -File -Force | Where-Object {
  $relativePath = $_.FullName.Substring($root.Length + 1)
  if ($_.Name -like "*.zip") { return $false }
  foreach ($dir in $excludeDirs) {
    if ($relativePath -eq $dir -or $relativePath.StartsWith("$dir\") -or $relativePath.StartsWith("$dir/")) {
      return $false
    }
  }
  return $true
}

$archive = [System.IO.Compression.ZipFile]::Open($zip, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($file in $files) {
    $entry = $file.FullName.Substring($root.Length + 1).Replace("\", "/")
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $archive,
      $file.FullName,
      $entry,
      [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
  }
} finally {
  $archive.Dispose()
}

Write-Output $zip
