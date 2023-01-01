# Copyright 2023 Astrogamer54. MIT license.
# Based off Denoland install script https://github.com/denoland/deno_install/

param (
  [string] $version
)

$PSMinVersion = 3
${wpdir} = "${HOME}\minimalistic-desktop"
$livelyPath = "C:\Program Files (x86)\Lively Wallpaper"
$livelyExePath = "C:\Program Files (x86)\Lively Wallpaper\Lively.exe"



if ($v) {
    $version = $v
}

function Write-Part ([string] $Text) {
  Write-Host $Text -NoNewline
}

function Write-Emphasized ([string] $Text) {
  Write-Host $Text -NoNewLine -ForegroundColor "Cyan"
}

function Write-Done {
  Write-Host " > " -NoNewline
  Write-Host "OK" -ForegroundColor "Green"
}

function Write-Err {
  Write-Host " > " -NoNewline
  Write-Host "ERR" -ForegroundColor "Red"
}

function Write-Warn ([string] $Text) {
  Write-Host " > " -NoNewline
  Write-Host $Text -ForegroundColor "Yellow"
}

function Check-Lively {
    Write-Emphasized "Checking Lively Install"
    try {
        if (-not (Test-Path -Path $livelyExePath -PathType Leaf)) {
            $livelyPath = "$HOME\AppData\Local\Programs\Lively Wallpaper"
            $livelyExePath = "$HOME\AppData\Local\Programs\Lively Wallpaper\Lively.exe"
            if (-not (Test-Path -Path $livelyExePath -PathType Leaf)) {
                Write-Err
                Write-Part "Lively Wallpaper is not installed" Write-Err
                Exit
            }
        }
        Write-Emphasized "Lively Wallpaper is Installed"
        Write-Done
    }
    catch {
        Write-Error "An error occurred while checking the Lively Wallpaper installation: $($_.Exception.Message)"
    }
}

if ($PSVersionTable.PSVersion.Major -gt $PSMinVersion) {
  $ErrorActionPreference = "Stop"

  # Enable TLS 1.2 since it is required for connections to GitHub.
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

  if (-not $version) {
    $latest_release_uri =
    "https://api.github.com/repos/Astrogamer54/minimalistic-desktop/releases/latest"
    Write-Part "DOWNLOADING    "; Write-Emphasized $latest_release_urisp_dir
    $latest_release_json = Invoke-WebRequest -Uri $latest_release_uri -UseBasicParsing
    Write-Done

    $version = ($latest_release_json | ConvertFrom-Json).tag_name -replace "v", ""
  }
  Check-Lively
  Write-Part "CREATING FOLDER     "; Write-Emphasized ${wpdir}
  try {
    New-Item -Path ${wpdir} -ItemType Directory
    Write-Done
  }
  catch [System.IO.IOException]{
      Write-Warn "Already Exists"
  } 
  $zip_file = "${wpdir}\v${version}.zip"
  $zip_file2 = "${wpdir}\livelycu.zip"
  $download_uri = "https://github.com/Astrogamer54/minimalistic-desktop/archive/refs/tags/v${version}.zip"
  Write-Part "DOWNLOADING    "; Write-Emphasized $download_uri
  Invoke-WebRequest -Uri $download_uri -UseBasicParsing -OutFile $zip_file
  Write-Done

  Write-Part "EXTRACTING     "; Write-Emphasized $zip_file
  Write-Part " into "; Write-Emphasized ${wpdir};
  Expand-Archive -Path $zip_file -DestinationPath $wpdir -Force
  Write-Done

  Write-Part "REMOVING       "; Write-Emphasized $zip_file
  Remove-Item -Path $zip_file
  Write-Done


  $download_uri2 = "https://github.com/rocksdanister/lively/releases/download/v2.0.4.0/lively_command_utility.zip"
  Write-Part "INSTALLING LIVELYCU     ";
  Invoke-WebRequest -Uri $download_uri2 -UseBasicParsing -OutFile $zip_file2
  Write-Done

  Write-Part "EXTRACTING     "; Write-Emphasized $zip_file2
  Write-Part " into "; Write-Emphasized ${wpdir};
  Expand-Archive -Path $zip_file2 -DestinationPath $wpdir -Force
  Write-Done

  Write-Part "REMOVING       "; Write-Emphasized $zip_file2
  Remove-Item -Path $zip_file2
  Write-Done
  
  cd $wpdir

  Write-Part "COPYING FILES       "; Write-Emphasized "'${wpdir}\minimalistic-desktop-${version}' > '$($env:LOCALAPPDATA)\Lively Wallpaper\Library\wallpapers\minimalistic-desktop'"
  COPY-ITEM "${wpdir}\minimalistic-desktop-${version}\*" -Destination "$($env:LOCALAPPDATA)\Lively Wallpaper\Library\wallpapers\minimalistic-desktop" -Recurse -Force
  Write-Done  
  
  Write-Part "SETTING WALLPAPER       "; Write-Emphasized "$($env:LOCALAPPDATA)\Lively Wallpaper\Library\wallpapers\minimalistic-desktop"
  ./Livelycu.exe setwp --file "$($env:LOCALAPPDATA)\Lively Wallpaper\Library\wallpapers\minimalistic-desktop"
  Write-Done

  Write-Part "minimalist-desktop was installed successfully."; Write-Done
} else {
  Write-Part "`nYour Powershell version is lesser than "; Write-Emphasized "$PSMinVersion";
  Write-Part "`nPlease, update your Powershell downloading the "; Write-Emphasized "'Windows Management Framework'"; Write-Part " greater than "; Write-Emphasized "$PSMinVersion"
}