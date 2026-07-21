# deploy_hf.ps1
# Helper script to clone and stage your local photo-ai changes for Hugging Face Spaces deployment.

$HF_SPACE_URL = "https://huggingface.co/spaces/akash2211/photoshare_app"
$TEMP_DIR = Join-Path $PSScriptRoot "temp_hf_deploy"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "HUGGING FACE SPACE DEPLOYMENT PREPARATION" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Clear any old temp folder
if (Test-Path $TEMP_DIR) {
    Write-Host "Cleaning up old temporary directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $TEMP_DIR
}

# 2. Clone HF Space repository
Write-Host "Cloning Hugging Face Space repository..." -ForegroundColor Green
git clone $HF_SPACE_URL $TEMP_DIR
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Git clone failed. Please check your credentials or Space URL." -ForegroundColor Red
    exit 1
}

# 3. Copy files
Write-Host "Copying updated files to staged repository..." -ForegroundColor Green
Copy-Item -Path (Join-Path $PSScriptRoot "app") -Destination $TEMP_DIR -Recurse -Force
Copy-Item -Path (Join-Path $PSScriptRoot "Dockerfile") -Destination (Join-Path $TEMP_DIR "Dockerfile") -Force
Copy-Item -Path (Join-Path $PSScriptRoot "main.py") -Destination (Join-Path $TEMP_DIR "main.py") -Force
Copy-Item -Path (Join-Path $PSScriptRoot "packages.txt") -Destination (Join-Path $TEMP_DIR "packages.txt") -Force
Copy-Item -Path (Join-Path $PSScriptRoot "requirements.txt") -Destination (Join-Path $TEMP_DIR "requirements.txt") -Force

# Copy gradio_app.py directly (the Space is configured to use gradio_app.py as app_file)
Copy-Item -Path (Join-Path $PSScriptRoot "gradio_app.py") -Destination (Join-Path $TEMP_DIR "gradio_app.py") -Force

# 4. Display git status in staged folder
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "STAGED CHANGES IN DEPLOYMENT FOLDER:" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
cd $TEMP_DIR
git status

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS TO DEPLOY:" -ForegroundColor Green
Write-Host "1. Run: cd '$TEMP_DIR'"
Write-Host "2. Run: git add ."
Write-Host "3. Run: git commit -m 'Deploy active liveness verification V5 endpoints'"
Write-Host "4. Run: git push origin main"
Write-Host "==========================================================" -ForegroundColor Cyan
