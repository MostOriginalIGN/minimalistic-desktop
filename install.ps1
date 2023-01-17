# Copyright 2023 Astrogamer54. MIT license.
# Based off Denoland install script https://github.com/denoland/deno_install/

param (
  # Specifies the version of the Minimalistic Desktop to install
  [string] $version
)

# Minimum required version of PowerShell
$PSMinVersion = 3

# Directory for Minimalistic Desktop files
${wpdir} = "${HOME}\minimalistic-desktop"

# Path to the Lively Wallpaper executable
$livelyExePath = "C:\Program Files (x86)\Lively Wallpaper\Lively.exe"


# If the $v parameter is provided, set the version to that value
if ($v) {
  $version = $v
}

# Prints a message to the console without a newline at the end
function Write-Part ([string] $Text) {
  Write-Host $Text -NoNewline
}

# Prints a message to the console in cyan text without a newline at the end
function Write-Emphasized ([string] $Text) {
  Write-Host $Text -NoNewLine -ForegroundColor "Cyan"
}

# Prints a green "OK" to the console
function Write-Done {
  Write-Host " > " -NoNewline
  Write-Host "OK" -ForegroundColor "Green"
}

# Prints a red "ERR" to the console
function Write-Err {
  Write-Host " > " -NoNewline
  Write-Host "ERR" -ForegroundColor "Red"
}

# Prints a yellow message to the console
function Write-Warn ([string] $Text) {
  Write-Host " > " -NoNewline
  Write-Host $Text -ForegroundColor "Yellow"
}

# Check if Lively Wallpaper is installed
function Check-Lively {
  Write-Emphasized "Checking Lively Install"
  try {
    # Check if the Lively Wallpaper executable exists in the default installation directory
    if (-not (Test-Path -Path $livelyExePath -PathType Leaf)) {
      # If not, check for an installation in the local AppData directory
      $livelyExePath = "$HOME\AppData\Local\Programs\Lively Wallpaper\Lively.exe"
      if (-not (Test-Path -Path $livelyExePath -PathType Leaf)) {
        # If not found in either location, print an error and exit the script
        Write-Err
        Write-Part "Lively Wallpaper is not installed" Write-Err
        break
      }
    }
    Write-Emphasized "Lively Wallpaper is Installed"
    Write-Done
  }
  catch {
    # If an error occurs, print the error message
    Write-Error "An error occurred while checking the Lively Wallpaper installation: $($_.Exception.Message)"
  }
}

# Check if PowerShell version is greater than required version
if ($PSVersionTable.PSVersion.Major -gt $PSMinVersion) {
  # Stop script execution on error
  $ErrorActionPreference = "Stop"

  # Enable TLS 1.2 since it is required for connections to GitHub.
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

  # If version not specified, get latest release from GitHub API
  if (-not $version) {
    $latest_release_uri =
    "https://api.github.com/repos/Astrogamer54/minimalistic-desktop/releases/latest"
    # Write message to console
    Write-Part "DOWNLOADING    "; Write-Emphasized $latest_release_urisp_dir
    # Make web request to get latest release information
    $latest_release_json = Invoke-WebRequest -Uri $latest_release_uri -UseBasicParsing
    Write-Done

    # Extract version number from release information
    $version = ($latest_release_json | ConvertFrom-Json).tag_name -replace "v", ""
  }
  # Check if Lively is installed
  Check-Lively
  # Write message to console
  Write-Part "CREATING FOLDER     "; Write-Emphasized ${wpdir}
  try {
    # Create directory
    New-Item -Path ${wpdir} -ItemType Directory
    Write-Done
  }
  # If directory already exists, write warning to console
  catch [System.IO.IOException] {
    Write-Warn "Already Exists"
  } 
  # Set file path for zip file containing wallpaper package
  $zip_file = "${wpdir}\v${version}.zip"
  # Set file path for zip file containing Lively command utility
  $zip_file2 = "${wpdir}\livelycu.zip"
  # Set URL for downloading wallpaper package
  $download_uri = "https://github.com/Astrogamer54/minimalistic-desktop/archive/refs/tags/v${version}.zip"
  # Write message to console
  Write-Part "DOWNLOADING    "; Write-Emphasized $download_uri
  # Download wallpaper package
  Invoke-WebRequest -Uri $download_uri -UseBasicParsing -OutFile $zip_file
  Write-Done

  # Write message to console
  Write-Part "EXTRACTING     "; Write-Emphasized $zip_file
  Write-Part " into "; Write-Emphasized ${wpdir};
  # Extract wallpaper package
  Expand-Archive -Path $zip_file -DestinationPath $wpdir -Force
  Write-Done

  # Write message to console
  Write-Part "REMOVING       "; Write-Emphasized $zip_file
  # Remove zip file containing wallpaper package
  Remove-Item -Path $zip_file
  Write-Done


  # Set URL for downloading Lively command utility
  $download_uri2 = "https://github.com/rocksdanister/lively/releases/download/v2.0.4.0/lively_command_utility.zip"
  # Write message to console
  Write-Part "INSTALLING LIVELYCU     ";
  # Download Lively command utility
  Invoke-WebRequest -Uri $download_uri2 -UseBasicParsing -OutFile $zip_file2
  Write-Done
  
  # Write message to console
  Write-Part "EXTRACTING     "; Write-Emphasized $zip_file2
  Write-Part " into "; Write-Emphasized ${wpdir};
  # Extract Lively command utility
  Expand-Archive -Path $zip_file2 -DestinationPath $wpdir -Force
  Write-Done
  
  # Write message to console
  Write-Part "REMOVING       "; Write-Emphasized $zip_file2
  # Remove zip file containing Lively command utility
  Remove-Item -Path $zip_file2
  Write-Done
    
  # Change working directory to wallpaper directory
  Set-Location $wpdir

  $instLoc = "$($env:LOCALAPPDATA)\Lively Wallpaper\Library\wallpapers\minimalistic-desktop"
  # Write message to console
  Write-Part "CREATING FOLDER     "; Write-Emphasized ${$instLoc}
  try {
    # Create directory
    New-Item -Path $instLoc -ItemType Directory
    Write-Done
  }
  # If directory already exists, write warning to console
  catch [System.IO.IOException] {
    Write-Warn "Already Exists"
  } 

  # Write message to console
  Write-Part "COPYING FILES       "; Write-Emphasized "'${wpdir}\minimalistic-desktop-${version}' > '$($env:LOCALAPPDATA)\Lively Wallpaper\Library\wallpapers\minimalistic-desktop'"
  # Copy wallpaper files to Lively Wallpaper directory
  COPY-ITEM "${wpdir}\minimalistic-desktop-${version}\*" -Destination $instLoc -Recurse -Force
  Write-Done  
    
  # Write message to console
  Write-Part "SETTING WALLPAPER       "; Write-Emphasized "$($env:LOCALAPPDATA)\Lively Wallpaper\Library\wallpapers\minimalistic-desktop"
  # Set wallpaper using Lively command utility
  ./Livelycu.exe setwp --file "$($env:LOCALAPPDATA)\Lively Wallpaper\Library\wallpapers\minimalistic-desktop"
  Write-Done
  
  # Write message to console
  Write-Part "minimalist-desktop was installed successfully."; Write-Done

  $confirmation = Read-Host "Do you want to install now-playing-server? (y/n)"
  if ($confirmation -eq 'y') {
    Start-Process powershell {Invoke-WebRequest -useb https://raw.githubusercontent.com/Astrogamer54/now-playing-server/master/install.ps1 | Invoke-Expression}
  }

}
else {
  # Write message to console
  Write-Part "`nYour Powershell version is lesser than "; Write-Emphasized "$PSMinVersion";
  Write-Part "! Please update your PowerShell to at least version "; Write-Emphasized "$PSMinVersion"
  Write-Part " to run this script.";
}
  