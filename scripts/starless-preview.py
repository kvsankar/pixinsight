#!/usr/bin/env python3
"""Create an approximate starless preview from a finished RGB image.

This is not a replacement for StarNet/StarXTerminator. It is a deterministic
fallback for systems without a neural star-removal tool: detect compact bright
structures, dilate the mask, and fill masked pixels from surrounding image
content with nearest-neighbor seeding plus diffusion smoothing.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--mask-output", type=Path)
    parser.add_argument(
        "--mode",
        choices=["balanced", "aggressive", "smooth", "clean", "matte"],
        default="balanced",
    )
    parser.add_argument("--quality", type=int, default=94)
    return parser.parse_args()


def remove_large_components(mask: np.ndarray, max_area: int) -> np.ndarray:
    labels, count = ndi.label(mask)
    if count == 0:
        return mask
    areas = np.bincount(labels.ravel())
    keep = areas <= max_area
    keep[0] = False
    return keep[labels]


def star_mask(rgb: np.ndarray, mode: str) -> np.ndarray:
   lum = 0.2126 * rgb[:, :, 0] + 0.7152 * rgb[:, :, 1] + 0.0722 * rgb[:, :, 2]
   small_bg = ndi.gaussian_filter(lum, sigma=2.0)
   large_bg = ndi.gaussian_filter(lum, sigma=8.0)
   highpass = lum - small_bg
   mediumpass = lum - large_bg

   local_max = lum == ndi.maximum_filter(lum, size=5)
   if mode == "aggressive":
      faint_threshold = np.percentile(highpass, 95.7)
      mid_threshold = np.percentile(highpass, 98.0)
      bright_threshold = np.percentile(lum, 98.7)
      halo_threshold = np.percentile(mediumpass, 98.0)
      grow_faint = 2
      grow_mid = 4
      grow_bright = 8
      max_area = 1800
   else:
      faint_threshold = np.percentile(highpass, 97.2)
      mid_threshold = np.percentile(highpass, 98.7)
      bright_threshold = np.percentile(lum, 99.1)
      halo_threshold = np.percentile(mediumpass, 98.6)
      grow_faint = 1
      grow_mid = 3
      grow_bright = 6
      max_area = 1300

   faint_cores = local_max & (highpass > faint_threshold) & (lum > 0.18)
   mid_cores = local_max & (highpass > mid_threshold) & (lum > 0.24)
   bright_regions = (lum > bright_threshold) & (mediumpass > halo_threshold)

   bright_regions = remove_large_components(bright_regions, max_area=max_area)

   mask = ndi.binary_dilation(faint_cores, iterations=grow_faint)
   mask |= ndi.binary_dilation(mid_cores, iterations=grow_mid)
   mask |= ndi.binary_dilation(bright_regions, iterations=grow_bright)
   return mask


def inpaint(rgb: np.ndarray, mask: np.ndarray, iterations: int) -> np.ndarray:
    # Seed masked pixels with nearest unmasked neighbors.
    _, indices = ndi.distance_transform_edt(mask, return_indices=True)
    filled = rgb.copy()
    for channel in range(3):
        source = rgb[:, :, channel]
        seeded = source[tuple(indices)]
        filled[:, :, channel][mask] = seeded[mask]

    fixed = rgb.copy()
    kernel_sigma = 1.35
    for _ in range(iterations):
        for channel in range(3):
            blurred = ndi.gaussian_filter(filled[:, :, channel], sigma=kernel_sigma)
            plane = filled[:, :, channel]
            plane[mask] = blurred[mask]
            plane[~mask] = fixed[:, :, channel][~mask]

    return filled


def smooth_starless(rgb: np.ndarray) -> np.ndarray:
    # A deliberately smooth starless support layer: median removes compact
    # sources; a mild Gaussian blend avoids a crunchy, posterized background.
    planes = []
    for channel in range(3):
        median = ndi.median_filter(rgb[:, :, channel], size=17)
        smooth = ndi.gaussian_filter(median, sigma=1.1)
        planes.append(0.72 * median + 0.28 * smooth)
    return np.dstack(planes)


def clean_starless(rgb: np.ndarray) -> np.ndarray:
    # Morphological opening removes bright compact structures much more
    # aggressively than the smooth median layer. This is intended as a
    # starless support image, not a natural final rendering.
    planes = []
    for channel in range(3):
        opened = ndi.grey_opening(rgb[:, :, channel], size=(27, 27))
        soft = ndi.gaussian_filter(opened, sigma=1.0)
        planes.append(0.86 * opened + 0.14 * soft)
    return np.dstack(planes)


def matte_starless(rgb: np.ndarray) -> np.ndarray:
    # Broad starless nebulosity matte. A low percentile filter rejects bright
    # compact sources; a wide blur keeps the large-scale color/brightness field.
    planes = []
    for channel in range(3):
        low = ndi.percentile_filter(rgb[:, :, channel], percentile=18, size=(35, 35))
        broad = ndi.gaussian_filter(rgb[:, :, channel], sigma=8.0)
        matte = 0.70 * low + 0.30 * broad
        matte = ndi.gaussian_filter(matte, sigma=1.6)
        planes.append(matte)
    out = np.dstack(planes)

    # Match the original median luminance so the matte remains comparable to
    # the source stretch instead of becoming an artificially dark background.
    src_lum = 0.2126 * rgb[:, :, 0] + 0.7152 * rgb[:, :, 1] + 0.0722 * rgb[:, :, 2]
    out_lum = 0.2126 * out[:, :, 0] + 0.7152 * out[:, :, 1] + 0.0722 * out[:, :, 2]
    scale = np.median(src_lum) / max(np.median(out_lum), 1.0e-6)
    return np.clip(out * scale, 0.0, 1.0)


def main() -> None:
    args = parse_args()
    image = Image.open(args.input).convert("RGB")
    arr = np.asarray(image, dtype=np.float32) / 255.0

    if args.mode == "smooth":
        mask = np.zeros(arr.shape[:2], dtype=bool)
        starless = np.clip(smooth_starless(arr), 0.0, 1.0)
    elif args.mode == "clean":
        mask = np.zeros(arr.shape[:2], dtype=bool)
        starless = np.clip(clean_starless(arr), 0.0, 1.0)
    elif args.mode == "matte":
        mask = np.zeros(arr.shape[:2], dtype=bool)
        starless = np.clip(matte_starless(arr), 0.0, 1.0)
    else:
        mask = star_mask(arr, args.mode)
        iterations = 56 if args.mode == "aggressive" else 38
        starless = np.clip(inpaint(arr, mask, iterations=iterations), 0.0, 1.0)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    out = Image.fromarray(np.round(starless * 255).astype(np.uint8))
    if args.output.suffix.lower() in {".jpg", ".jpeg"}:
        out.save(args.output, quality=args.quality, subsampling=0, optimize=True)
    else:
        out.save(args.output)

    if args.mask_output:
        args.mask_output.parent.mkdir(parents=True, exist_ok=True)
        mask_img = Image.fromarray(mask.astype(np.uint8) * 255)
        mask_img.save(args.mask_output)

    pct = 100.0 * float(mask.sum()) / float(mask.size)
    print(f"input={args.input}")
    print(f"output={args.output}")
    print(f"mode={args.mode}")
    print(f"masked_pixels={pct:.2f}%")


if __name__ == "__main__":
    main()
