$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $PSScriptRoot
$ImageName = "prelegal"
$ContainerName = "prelegal"

docker build -t $ImageName $RootDir

docker rm -f $ContainerName *> $null

$EnvArgs = @()
$EnvFile = Join-Path $RootDir ".env"
if (Test-Path $EnvFile) {
    $EnvArgs = @("--env-file", $EnvFile)
}

docker run -d --rm --name $ContainerName -p 8000:8000 @EnvArgs $ImageName

Write-Host "Prelegal is running at http://localhost:8000"
