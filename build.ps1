# Build script for Guagua Miniprogram
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$outputDir = Join-Path $projectRoot "dist"

Write-Host "=== Starting Build ===" -ForegroundColor Green

# Check required files
Write-Host "Checking required files..."
$requiredFiles = @("app.js", "app.json", "app.wxss", "project.config.json")
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        Write-Host "  OK: $file" -ForegroundColor Green
    } else {
        Write-Host "  Missing: $file" -ForegroundColor Red
    }
}

# Clean old build
if (Test-Path $outputDir) {
    Remove-Item $outputDir -Recurse -Force
    Write-Host "Cleaned old build directory" -ForegroundColor Yellow
}

# Create new build directory
New-Item -ItemType Directory -Path $outputDir | Out-Null
Write-Host "Created build directory: $outputDir" -ForegroundColor Green

# Copy files
Write-Host "Copying project files..."
Copy-Item -Path (Join-Path $projectRoot "*.js") -Destination $outputDir -Force
Copy-Item -Path (Join-Path $projectRoot "*.json") -Destination $outputDir -Force
Copy-Item -Path (Join-Path $projectRoot "*.wxml") -Destination $outputDir -Force
Copy-Item -Path (Join-Path $projectRoot "*.wxss") -Destination $outputDir -Force
Copy-Item -Path (Join-Path $projectRoot "sitemap.json") -Destination $outputDir -Force

# Copy directories
Copy-Item -Path (Join-Path $projectRoot "pages") -Destination (Join-Path $outputDir "pages") -Recurse -Force
Copy-Item -Path (Join-Path $projectRoot "utils") -Destination (Join-Path $outputDir "utils") -Recurse -Force
Copy-Item -Path (Join-Path $projectRoot "cloudfunctions") -Destination (Join-Path $outputDir "cloudfunctions") -Recurse -Force
Copy-Item -Path (Join-Path $projectRoot "data") -Destination (Join-Path $outputDir "data") -Recurse -Force

Write-Host "=== Build Complete ===" -ForegroundColor Green
Write-Host "Output directory: $outputDir"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Open WeChat DevTools"
Write-Host "2. Import project from: $outputDir"
Write-Host "3. Test your miniprogram!"
