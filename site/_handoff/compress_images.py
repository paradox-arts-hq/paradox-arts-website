#!/usr/bin/env python3
"""
Compress the website's project images so they load fast, without changing any file names.

USAGE (needs Python 3 and Pillow:  pip install pillow)
    python compress_images.py <your-site-folder>                 # writes results to <site-folder>/optimized-images/
    python compress_images.py <site-folder> --max 1800 --quality 80
    python compress_images.py <site-folder> --in-place           # overwrites the originals (keep a backup!)

WHAT IT DOES
  - Looks inside the project folders the site uses (prime-ignites, lcf, mac, ration, ca, jbb, jobrown, mv, studio-wall, about).
  - Shrinks any image whose long edge is bigger than --max (default 1800 px). Never enlarges.
  - Saves JPEGs as progressive, optimised, quality --quality (default 80), colour profile and metadata removed.
  - Saves PNGs optimised. PNGs with no transparency that are still over 400 KB are reported, because a JPEG would be much smaller.
  - Keeps every file name and folder the same, so the HTML needs no edits.
  - Prints a before/after size report.

Copy the contents of optimized-images/ over the originals when you are happy with them.
"""
import argparse, os, sys
from PIL import Image, ImageOps

FOLDERS = ['prime-ignites', 'lcf', 'mac', 'ration', 'ca', 'jbb', 'jobrown', 'mv', 'studio-wall', 'about']
EXT = ('.jpg', '.jpeg', '.png')

def human(n): return f'{n/1024:.0f} KB' if n < 1024*1024 else f'{n/1024/1024:.1f} MB'

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('site'); ap.add_argument('--max', type=int, default=1800); ap.add_argument('--quality', type=int, default=80)
    ap.add_argument('--in-place', action='store_true'); a = ap.parse_args()
    out_root = a.site if a.in_place else os.path.join(a.site, 'optimized-images')
    before = after = n = 0; heavy_png = []
    for folder in FOLDERS:
        base = os.path.join(a.site, folder)
        if not os.path.isdir(base): continue
        for root, _, files in os.walk(base):
            for f in files:
                if not f.lower().endswith(EXT): continue
                src = os.path.join(root, f); rel = os.path.relpath(src, a.site); dst = os.path.join(out_root, rel)
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                im = ImageOps.exif_transpose(Image.open(src)); w, h = im.size
                if max(w, h) > a.max:
                    k = a.max / max(w, h); im = im.resize((round(w*k), round(h*k)), Image.LANCZOS)
                if f.lower().endswith('.png'):
                    im.save(dst, 'PNG', optimize=True)
                    if im.mode in ('RGB', 'L', 'P') and os.path.getsize(dst) > 400*1024: heavy_png.append((rel, os.path.getsize(dst)))
                else:
                    im.convert('RGB').save(dst, 'JPEG', quality=a.quality, optimize=True, progressive=True)
                b, c = os.path.getsize(src), os.path.getsize(dst)
                if c >= b and not a.in_place:      # already lean: keep the original bytes
                    import shutil; shutil.copy2(src, dst); c = b
                before += b; after += c; n += 1
                print(f'{rel:55s} {human(b):>9s} -> {human(c):>9s}')
    if not n: print('No images found. Point this at the folder that contains prime-ignites/, lcf/, mac/ ... '); sys.exit(1)
    print(f'\n{n} images: {human(before)} -> {human(after)}  (saved {100*(1-after/before):.0f}%)')
    if heavy_png:
        print('\nThese PNGs are still large and have no transparency. Saving them as .jpg (and updating the file name in the work-data block) would shrink them a lot:')
        for r, sz in heavy_png: print('  ', r, human(sz))
    print('\nOutput folder:', out_root)

if __name__ == '__main__': main()
