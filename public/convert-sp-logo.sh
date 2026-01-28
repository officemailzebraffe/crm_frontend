#!/bin/bash
# Script to convert SP logo to all required formats

echo "Converting SP logo to all formats..."

# You'll need to place sp.jpg in this directory first
if [ ! -f "sp.jpg" ]; then
    echo "Error: sp.jpg not found in current directory"
    echo "Please save your SP logo as sp.jpg in frontend/public/"
    exit 1
fi

# Create logo.png (200x200)
convert sp.jpg -resize 200x200 -background none -gravity center -extent 200x200 logo.png
echo "✓ Created logo.png"

# Create logo192.png
convert sp.jpg -resize 192x192 -background none -gravity center -extent 192x192 logo192.png
echo "✓ Created logo192.png"

# Create logo512.png
convert sp.jpg -resize 512x512 -background none -gravity center -extent 512x512 logo512.png
echo "✓ Created logo512.png"

# Create favicon.ico (multiple sizes in one file)
convert sp.jpg -resize 256x256 -background none -gravity center -extent 256x256 \
    \( -clone 0 -resize 128x128 \) \
    \( -clone 0 -resize 64x64 \) \
    \( -clone 0 -resize 48x48 \) \
    \( -clone 0 -resize 32x32 \) \
    \( -clone 0 -resize 16x16 \) \
    -delete 0 -colors 256 favicon.ico
echo "✓ Created favicon.ico"

# Create favicon.svg
convert sp.jpg -resize 64x64 -background none -gravity center -extent 64x64 favicon.png
# Convert PNG to SVG (simple base64 embedded)
cat > favicon.svg << SVGEOF
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="64" height="64" viewBox="0 0 64 64">
  <image width="64" height="64" xlink:href="data:image/png;base64,$(base64 -w 0 favicon.png)" />
</svg>
SVGEOF
rm favicon.png
echo "✓ Created favicon.svg"

echo ""
echo "All logo files created successfully!"
echo "Files created:"
ls -lh logo.png logo192.png logo512.png favicon.ico favicon.svg
