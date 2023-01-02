#!/usr/bin/env sh
# Copyright 2023 Astrogamer54. MIT License.
# Based off Denoland install script https://github.com/denoland/deno_install/

command -v curl >/dev/null || { echo "curl isn't installed\!" >&2; exit 1; }
command -v tar >/dev/null || { echo "tar isn't installed\!" >&2; exit 1; }

releases_uri=https://github.com/Astrogamer54/minimalistic-desktop/releases
if [ $# -gt 0 ]; then
	tag=$1
else
	tag=$(curl -LsH 'Accept: application/json' $releases_uri/latest)
	tag=${tag%\,\"update_url*}
	tag=${tag##*tag_name\":\"}
	tag=${tag%\"}
fi

tag=${tag#v}

echo "\x1b[34m\x1b[1mFETCHING\x1b[0m Version \x1b[32m$tag\x1b[0m"

download_uri=https://github.com/Astrogamer54/minimalistic-desktop/archive/refs/tags/v$tag.tar.gz

desktop="$HOME/minimalistic-desktop"
tar="$HOME/minimalistic-desktop.tar.gz"

[ ! -d "$desktop" ] && echo "CREATING $desktop" && mkdir -p "$desktop"

echo "\x1b[34m\x1b[1mDOWNLOADING\x1b[0m $download_uri"
curl --fail --location --progress-bar --output "$tar" "$download_uri"

echo "\x1b[34m\x1b[1mEXTRACTING\x1b[0m $tar"
tar xzf "$tar" -C "$desktop" --strip-components=1

echo "\x1b[34m\x1b[1mREMOVING\x1b[0m $tar"
rm "$tar"

plashError() 
{
    echo "\x1b[31m\x1b[1mError adding wallpaper.\x1b[0m Is Plash installed?"
    echo "\x1b[34m\x1b[1mDELETING\x1b[0m FILES"
    rm -r $desktop
    open "macappstores://itunes.apple.com/app/id1494023538"
    exit 1
}
echo "\x1b[34m\x1b[1mADDING\x1b[0m TO PLASH"
open -g "plash:add?url=file:///$desktop" || plashError 
echo "Wallpaper Successfully Installed!"
echo "\x1b[1mCONFIG Located in $desktop/index.js\x1b[0m"
