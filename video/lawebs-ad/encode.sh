#!/usr/bin/env bash
# Encode the frames (out/frames, or $FRAMES) + out/soundtrack.wav into the final ad: H.264 CRF 17 at 60 fps, AAC 192k,
# two-pass EBU R128 loudness normalization to -14 LUFS / -1.5 dBTP (social platforms' target).
set -euo pipefail
cd "$(dirname "$0")"
OUT=${1:-out/lawebs-ad.mp4}
FRAMES=${FRAMES:-out/frames}
measure=$(ffmpeg -hide_banner -nostats -i out/soundtrack.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$measure" | sed -n "s/.*\"$1\" : \"\([^\"]*\)\".*/\1/p"; }
LN="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true"
ffmpeg -hide_banner -loglevel error -y -framerate 60 -i "$FRAMES/f%05d.jpg" -i out/soundtrack.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -profile:v high -level 4.2 \
  -c:a aac -b:a 192k -ar 48000 -af "$LN" -movflags +faststart -t 30 "$OUT"
echo "wrote $OUT"
