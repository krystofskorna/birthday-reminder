#!/bin/bash

# Script to prepare app icon from source image
# Usage: ./scripts/prepare-icon.sh /path/to/source/image.png

if [ -z "$1" ]; then
    echo "Usage: ./scripts/prepare-icon.sh /path/to/source/image.png"
    echo "Example: ./scripts/prepare-icon.sh ~/Downloads/calendar-icon.png"
    exit 1
fi

SOURCE_IMAGE="$1"
OUTPUT_DIR="./assets/images"
OUTPUT_ICON="$OUTPUT_DIR/icon.png"
OUTPUT_FAVICON="$OUTPUT_DIR/favicon.png"

# Check if source image exists
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image not found: $SOURCE_IMAGE"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "Processing icon..."

# Crop to remove watermark (crop from center, remove 5% from bottom-right)
# This crops to 95% of the image, removing the bottom-right corner where watermark typically is
WIDTH=$(sips -g pixelWidth "$SOURCE_IMAGE" | tail -1 | awk '{print $2}')
HEIGHT=$(sips -g pixelHeight "$SOURCE_IMAGE" | tail -1 | awk '{print $2}')
CROP_WIDTH=$((WIDTH * 95 / 100))
CROP_HEIGHT=$((HEIGHT * 95 / 100))

# Crop from top-left to remove bottom-right watermark area
sips -c "$CROP_HEIGHT" "$CROP_WIDTH" "$SOURCE_IMAGE" --out "$OUTPUT_ICON.tmp" > /dev/null 2>&1

# Resize to 1024x1024 for app icon (required by Expo/iOS)
sips -z 1024 1024 "$OUTPUT_ICON.tmp" --out "$OUTPUT_ICON" > /dev/null 2>&1

# Create favicon (32x32)
sips -z 32 32 "$OUTPUT_ICON.tmp" --out "$OUTPUT_FAVICON" > /dev/null 2>&1

# Clean up temp file
rm -f "$OUTPUT_ICON.tmp"

echo "✓ Icon created: $OUTPUT_ICON (1024x1024)"
echo "✓ Favicon created: $OUTPUT_FAVICON (32x32)"
echo ""
echo "Next steps:"
echo "1. Review the icon at: $OUTPUT_ICON"
echo "2. If watermark is still visible, manually crop the image using Preview or another tool"
echo "3. Run: npx expo prebuild --clean (to regenerate native projects with new icon)"
echo "4. Rebuild the app: npx expo run:ios"


