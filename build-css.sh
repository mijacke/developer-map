#!/bin/bash

# Script to compile all CSS files into dm.css
# Run this after making changes to any CSS file in styles/

cd "$(dirname "$0")/public/assets"

echo "/* Developer Map - Compiled CSS */" > dm.css
echo "/* Generated: $(date '+%Y-%m-%d %H:%M:%S') */" >> dm.css
echo "/* Version: 0.2.1 */" >> dm.css
echo "" >> dm.css

# Add all CSS files in correct order
for file in \
    styles/base.css \
    styles/layout-shell.css \
    styles/board.css \
    styles/hierarchy.css \
    styles/page.css \
    styles/cards.css \
    styles/dashboard.css \
    styles/settings.css \
    styles/modal.css \
    styles/draw.css \
    styles/responsive.css
do
    if [ -f "$file" ]; then
        echo "/* === $(basename $file) === */" >> dm.css
        cat "$file" >> dm.css
        echo "" >> dm.css
    fi
done

echo "✅ CSS compiled successfully to dm.css"
