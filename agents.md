## Elastic Beanstalk Packaging Process

Use this process to create a Beanstalk upload zip that is safe for Amazon Linux deployment.

### Goals

- Build a source bundle from repository files only
- Exclude local artifacts and large generated folders
- Ensure `.platform` hooks are included
- Ensure zip entry paths use forward slashes

### Exclusions

Exclude these directories from the archive:

- `.git`
- `.expo`
- `.local`
- `node_modules`
- `static-build`
- `server_dist`

Also exclude existing `*.zip` files so old bundles are not nested into the new bundle.

### Packaging Command Pattern (PowerShell)

```powershell
$ErrorActionPreference='Stop'
$root='c:\Users\GeorgeColinRamsay\Documents\GitHub\IS401Product'
$zip='c:\Users\GeorgeColinRamsay\Documents\GitHub\IS401Product\IS401Product-beanstalk-upload.zip'

if(Test-Path $zip){Remove-Item $zip -Force}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$exclude=@('\\.git\\','\\.expo\\','\\.local\\','\\node_modules\\','\\static-build\\','\\server_dist\\')

$files=Get-ChildItem -Path $root -Recurse -File -Force | Where-Object {
	$p=$_.FullName
	if($_.Name -like '*.zip'){ return $false }
	foreach($x in $exclude){ if($p -match [regex]::Escape($x)){ return $false } }
	return $true
}

$archive=[System.IO.Compression.ZipFile]::Open($zip,[System.IO.Compression.ZipArchiveMode]::Create)
try {
	foreach($f in $files){
		$entry=$f.FullName.Substring($root.Length+1).Replace('\\','/')
		[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,$f.FullName,$entry,[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
	}
} finally {
	$archive.Dispose()
}
```

Why this pattern:

- It preserves `.platform/hooks/prebuild/01_build_app.sh`
- It avoids accidental omission of hidden dot directories
- It normalizes zip entry separators for Linux environments

### Validation Checklist

After creating the zip, verify:

1. The zip opens without errors.
2. Required files are present:
	 - `Procfile`
	 - `.ebignore`
	 - `.platform/hooks/prebuild/01_build_app.sh`
	 - `package.json`
	 - `package-lock.json`
3. `package.json` in the zip includes deployment-critical settings:
	 - `dependencies.patch-package`
	 - `dependencies.esbuild`
	 - a non-fatal `postinstall` fallback message for missing patch-package

### Output Location

Write the bundle into the workspace root as:

- `IS401Product-beanstalk-upload.zip`

This keeps the archive visible in VS Code and ready for direct Beanstalk upload.
