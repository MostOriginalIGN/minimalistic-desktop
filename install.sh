#!/usr/bin/env sh
# Copyright 2023 Astrogamer54. MIT License.
# Based off Denoland install script https://github.com/denoland/deno_install/

# Check that curl is installed
command -v curl >/dev/null || { echo "curl isn't installed!" >&2; exit 1; }
# Check that tar is installed
command -v tar >/dev/null || { echo "tar isn't installed!" >&2; exit 1; }

# URL of the releases page on GitHub
releases_uri=https://github.com/Astrogamer54/minimalistic-desktop/releases

# If a tag was passed as an argument, use that, otherwise fetch the latest release
if [ $# -gt 0 ]; then
	tag=$1
else
	# Fetch the latest release from the releases page
	tag=$(curl -LsH 'Accept: application/json' $releases_uri/latest)
	# Remove everything after the tag name
	tag=${tag%\,\"update_url*}
	# Remove everything before the tag name
	tag=${tag##*tag_name\":\"}
	# Remove the enclosing quotes
	tag=${tag%\"}
fi

# Remove the "v" prefix from the tag name
tag=${tag#v}

# Print the version number to be downloaded
echo "\x1b[34m\x1b[1mFETCHING\x1b[0m Version \x1b[32m$tag\x1b[0m"

# Construct the URL of the tar.gz archive for the specified version
download_uri=https://github.com/Astrogamer54/minimalistic-desktop/archive/refs/tags/v$tag.tar.gz

# Path to the destination folder for the downloaded files
desktop="$HOME/minimalistic-desktop"
# Path to the downloaded tar.gz archive
tar="$HOME/minimalistic-desktop.tar.gz"

# If the destination folder does not exist, create it
[ ! -d "$desktop" ] && echo "CREATING $desktop" && mkdir -p "$desktop"

# Download the tar.gz archive
echo "\x1b[34m\x1b[1mDOWNLOADING\x1b[0m $download_uri"
curl --fail --location --progress-bar --output "$tar" "$download_uri"

# Extract the contents of the tar.gz archive to the destination folder
echo "\x1b[34m\x1b[1mEXTRACTING\x1b[0m $tar"
tar xzf "$tar" -C "$desktop" --strip-components=1

# Delete the tar.gz archive
echo "\x1b[34m\x1b[1mREMOVING\x1b[0m $tar"
rm "$tar"

# Function to be called if adding the wallpaper fails
plashError() 
{
    # Print an error message
    echo "\x1b[31m\x1b[1mError adding wallpaper.\x1b[0m Is Plash installed?"
    # Delete the downloaded files
    echo "\x1b[34m\x1b[1mDELETING\x1b[0m FILES"
    rm -r $desktop
    # Open the App Store page for Plash
    open "macappstores://itunes.apple.com/app/id1494023538"
    # Exit the script with an error code
    exit 1
}

# Try to add the wallpaper to Plash
echo "\x1b[34m\x1b[1mADDING\x1b[0m TO PLASH"
open -g "plash:add?url=file:///$desktop" || plashError 

# Print a success message
echo "Wallpaper Successfully Installed!"
# Print the location of the configuration file
echo "\x1b[1mCONFIG Located in $desktop/index.js\x1b[0m"

