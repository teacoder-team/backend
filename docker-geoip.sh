#!/bin/sh
set -eu

feed="$1"
cache="$2"
target="$3"
release="${GEOLITE_RELEASE:-latest}"

repository='P3TERX/GeoLite.mmdb'

if [ "$release" = latest ]; then
	release=$(sed -n 's|.*:Repository/[0-9]*/\([^<]*\)</id>.*|\1|p' "$feed" | head -n 1)
fi

if [ -z "$release" ]; then
	echo "Could not read the newest ${repository} release from ${feed}" >&2

	exit 1
fi

cached="${cache}/GeoLite2-City-${release}.mmdb"

if [ -s "$cached" ]; then
	echo "Reusing cached GeoLite2 City database ${release}"
else
	echo "Downloading GeoLite2 City database ${release}"

	curl -fL --retry 3 --retry-delay 2 \
		"https://github.com/${repository}/releases/download/${release}/GeoLite2-City.mmdb" \
		-o "${cached}.part"

	mv "${cached}.part" "$cached"

	find "$cache" -maxdepth 1 -name 'GeoLite2-City-*.mmdb' ! -name "GeoLite2-City-${release}.mmdb" -delete
fi

mkdir -p "$(dirname "$target")"

cp "$cached" "$target"
