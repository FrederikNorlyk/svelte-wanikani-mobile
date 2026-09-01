#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_atlas="$repo_root/src/lib/assets/background/grass-atlas.png"
clean_atlas="$repo_root/src/lib/assets/background/grass-atlas-clean.png"

if ! command -v magick >/dev/null 2>&1; then
	printf 'ImageMagick is required to prepare the grass atlas.\n' >&2
	exit 1
fi

# Remove nearly transparent fringe pixels while preserving the authored colour
# and layout. Sprite rectangles and root pivots live in grassSprites.ts.
magick "$source_atlas" \
	-channel A -threshold 4% +channel \
	-define png:color-type=6 \
	-strip \
	"$clean_atlas"

printf 'Prepared %s\n' "$clean_atlas"
