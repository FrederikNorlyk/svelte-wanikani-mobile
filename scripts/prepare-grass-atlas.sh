#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_atlas="$repo_root/src/lib/assets/background/grass-atlas.png"
clean_atlas="$repo_root/src/lib/assets/background/grass-atlas-clean.png"
source_metadata="$repo_root/src/lib/assets/background/grass-atlas.source.json"
clean_metadata="$repo_root/src/lib/assets/background/grass-atlas.json"

if ! command -v magick >/dev/null 2>&1; then
	printf 'ImageMagick is required to prepare the grass atlas.\n' >&2
	exit 1
fi

if [[ ! -f "$source_metadata" ]]; then
	printf 'Authored sprite metadata is missing: %s\n' "$source_metadata" >&2
	exit 1
fi

# Remove nearly transparent fringe pixels while preserving the authored colour
# and layout. Sprite rectangles and root pivots live in grassSprites.ts.
magick "$source_atlas" \
	-channel A -threshold 4% +channel \
	-define png:color-type=6 \
	-strip \
	"$clean_atlas"
cp "$source_metadata" "$clean_metadata"

printf 'Prepared %s and %s\n' "$clean_atlas" "$clean_metadata"
