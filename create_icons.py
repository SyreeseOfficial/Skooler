#!/usr/bin/env python3
"""
Simple script to create placeholder icons for the Skooler extension.
Requires PIL/Pillow: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow is required. Install it with: pip install Pillow")
    exit(1)

import os

def create_icon(size, filename):
    """Create a simple icon with 'S' text"""
    # Create image with dark blue background
    img = Image.new('RGB', (size, size), color='#4a9eff')
    draw = ImageDraw.Draw(img)
    
    # Try to use a font, fallback to default if not available
    try:
        # Try to use a system font
        font_size = int(size * 0.7)
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            font = ImageFont.load_default()
    
    # Draw 'S' text in white, centered
    text = "S"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size - text_width) // 2, (size - text_height) // 2)
    
    draw.text(position, text, fill='white', font=font)
    
    # Save icon
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

def main():
    icons_dir = 'icons'
    os.makedirs(icons_dir, exist_ok=True)
    
    sizes = [16, 48, 128]
    for size in sizes:
        create_icon(size, os.path.join(icons_dir, f'icon{size}.png'))
    
    print("\nIcons created successfully!")

if __name__ == '__main__':
    main()

