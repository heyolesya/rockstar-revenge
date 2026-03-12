#!/usr/bin/env python3
"""Process pixel art images into game-ready sprites.
Uses pre-made transparent PNGs from img/pixel-transparent/."""
from PIL import Image
import os

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "img", "pixel-transparent")
SRC_ORIG = os.path.join(BASE, "img", "pixel")  # for non-character assets
OUT = os.path.join(BASE, "img", "sprites")
os.makedirs(OUT, exist_ok=True)

def auto_crop(img, padding=2):
    """Crop to non-transparent bounding box with padding."""
    bbox = img.getbbox()
    if bbox is None:
        return img
    x1, y1, x2, y2 = bbox
    x1 = max(0, x1 - padding)
    y1 = max(0, y1 - padding)
    x2 = min(img.width, x2 + padding)
    y2 = min(img.height, y2 + padding)
    return img.crop((x1, y1, x2, y2))

def extract_grid_frames(img, cols, rows):
    """Extract frames from a grid spritesheet."""
    fw = img.width // cols
    fh = img.height // rows
    frames = []
    for r in range(rows):
        for c in range(cols):
            frame = img.crop((c * fw, r * fh, (c + 1) * fw, (r + 1) * fh))
            frames.append(frame)
    return frames

def resize_keep_aspect(img, target_height):
    """Resize keeping aspect ratio to target height."""
    ratio = target_height / img.height
    new_w = max(1, int(img.width * ratio))
    return img.resize((new_w, target_height), Image.LANCZOS)

def clean_alpha(img, min_alpha=20):
    """Remove very faint semi-transparent fringe pixels."""
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a < min_alpha:
                pixels[x, y] = (0, 0, 0, 0)
    return img

# ===========================================================
# 1. VOCALIST CHARACTER SHEET -> player sprites
# ===========================================================
print("Processing vocalist character sheet...")
sheet = Image.open(os.path.join(SRC, "vocalist-char-sheet.png")).convert("RGBA")
frames = extract_grid_frames(sheet, 4, 2)

vocalist_map = {
    "rockstar-idle": 0,
    "rockstar-walk-1": 1,
    "rockstar-walk-2": 2,
    "rockstar-walk-3": 3,
    "rockstar-walk-4": 1,
    "rockstar-attack-1": 4,
    "rockstar-attack-2": 5,
    "rockstar-attack-3": 6,
    "rockstar-hurt": 7,
}

for name, idx in vocalist_map.items():
    frame = frames[idx]
    frame = auto_crop(frame)
    frame = clean_alpha(frame)
    frame = resize_keep_aspect(frame, 72)
    frame.save(os.path.join(OUT, f"{name}.png"))
    print(f"  {name}.png: {frame.width}x{frame.height}")

# ===========================================================
# 2. GRUNGE GUY -> enemy sprites
# ===========================================================
print("Processing grunge guy sheet...")
sheet = Image.open(os.path.join(SRC, "grunge-guy.png")).convert("RGBA")
frames = extract_grid_frames(sheet, 4, 2)

grunge_map = {
    "grunge-idle": 0,
    "grunge-walk-1": 1,
    "grunge-walk-2": 2,
    "grunge-walk-3": 3,
    "grunge-walk-4": 6,
    "grunge-attack": 7,
    "grunge-hurt": 5,
}

for name, idx in grunge_map.items():
    frame = frames[idx]
    frame = auto_crop(frame)
    frame = clean_alpha(frame)
    frame = resize_keep_aspect(frame, 64)
    frame.save(os.path.join(OUT, f"{name}.png"))
    print(f"  {name}.png: {frame.width}x{frame.height}")

# Also export a grunge-idle for sitting on speakers (slightly smaller)
frame = frames[4]  # sitting pose
frame = auto_crop(frame)
frame = clean_alpha(frame)
frame = resize_keep_aspect(frame, 48)
frame.save(os.path.join(OUT, "grunge-sitting.png"))
print(f"  grunge-sitting.png: {frame.width}x{frame.height}")

# ===========================================================
# 3. STAGE BACKGROUND -> Level 1 bg
# ===========================================================
print("Processing stage background...")
stage = Image.open(os.path.join(SRC_ORIG, "stage-option-1.png")).convert("RGB")
stage = stage.resize((480, 270), Image.LANCZOS)
stage.save(os.path.join(OUT, "bg-stage.png"))
print(f"  bg-stage.png: 480x270")

# ===========================================================
# 4. ULRICH -> dartboard face (larger for 50%+ coverage)
# ===========================================================
print("Processing Ulrich portrait...")
ulrich = Image.open(os.path.join(SRC_ORIG, "ulrich.png")).convert("RGBA")
w, h = ulrich.size
margin_x = int(w * 0.15)
margin_top = int(h * 0.05)
margin_bot = int(h * 0.25)
face = ulrich.crop((margin_x, margin_top, w - margin_x, h - margin_bot))
face = face.resize((120, 120), Image.LANCZOS)
face.save(os.path.join(OUT, "ulrich-face.png"))
print(f"  ulrich-face.png: 120x120")

# ===========================================================
# 5. BAND MEMBERS -> Level 1 background band
# ===========================================================
print("Processing band members...")
for name, target_h in [("drummer", 80), ("guitarist", 70), ("bassist", 70)]:
    img = Image.open(os.path.join(SRC, f"{name}.png")).convert("RGBA")
    img = auto_crop(img, padding=4)
    img = clean_alpha(img)
    img = resize_keep_aspect(img, target_h)
    img.save(os.path.join(OUT, f"band-{name}.png"))
    print(f"  band-{name}.png: {img.width}x{img.height}")

# ===========================================================
# 6. VOCALIST-2 -> Level 1 completion cutscene
# ===========================================================
print("Processing vocalist-2 for cutscene...")
img = Image.open(os.path.join(SRC, "vocalist-2.png")).convert("RGBA")
img = auto_crop(img, padding=4)
img = clean_alpha(img)
img = resize_keep_aspect(img, 180)
img.save(os.path.join(OUT, "vocalist-portrait-2.png"))
print(f"  vocalist-portrait-2.png: {img.width}x{img.height}")

# Also make a smaller version for general use
img2 = resize_keep_aspect(img, 120)
img2.save(os.path.join(OUT, "vocalist-portrait-1.png"))
print(f"  vocalist-portrait-1.png: {img2.width}x{img2.height}")

# ===========================================================
# 7. BEAVIS CHARACTER SHEET -> enemy sprites
# ===========================================================
print("Processing Beavis character sheet...")
sheet = Image.open(os.path.join(SRC, "beavis-char-sheet.png")).convert("RGBA")
frames = extract_grid_frames(sheet, 4, 2)

beavis_map = {
    "beavis-idle": 0,
    "beavis-walk-1": 1,
    "beavis-walk-2": 2,
    "beavis-walk-3": 3,
    "beavis-walk-4": 1,
    "beavis-attack": 4,
    "beavis-hurt": 7,
}

for name, idx in beavis_map.items():
    frame = frames[idx]
    frame = auto_crop(frame)
    frame = clean_alpha(frame)
    frame = resize_keep_aspect(frame, 64)
    frame.save(os.path.join(OUT, f"{name}.png"))
    print(f"  {name}.png: {frame.width}x{frame.height}")

# ===========================================================
# 8. BUTT-HEAD CHARACTER SHEET -> enemy sprites
# ===========================================================
print("Processing Butt-Head character sheet...")
sheet = Image.open(os.path.join(SRC, "butt-head-char-sheet.png")).convert("RGBA")
frames = extract_grid_frames(sheet, 4, 2)

butthead_map = {
    "butthead-idle": 0,
    "butthead-walk-1": 1,
    "butthead-walk-2": 2,
    "butthead-walk-3": 1,
    "butthead-walk-4": 2,
    "butthead-attack": 3,
    "butthead-hurt": 7,
}

for name, idx in butthead_map.items():
    frame = frames[idx]
    frame = auto_crop(frame)
    frame = clean_alpha(frame)
    frame = resize_keep_aspect(frame, 64)
    frame.save(os.path.join(OUT, f"{name}.png"))
    print(f"  {name}.png: {frame.width}x{frame.height}")

print("\nDone! All sprites saved to img/sprites/")
