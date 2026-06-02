"""Recombine selected real star objects over a processed starless base.

This diagnostic helper does not synthesize star positions, colors, spikes, or
highlight shapes. It reads a stars-only layer, selects connected star components
by measured flux, and recombines those real star pixels with a faint full-star
layer over an already processed starless image.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def read_rgb(path: Path) -> np.ndarray:
    image = Image.open(path)
    arr = np.asarray(image)
    if arr.ndim == 2:
        arr = np.repeat(arr[:, :, None], 3, axis=2)
    if arr.shape[2] > 3:
        arr = arr[:, :, :3]
    scale = 65535.0 if arr.dtype == np.uint16 else 255.0
    return arr.astype(np.float32) / scale


def save_jpeg(path: Path, image: np.ndarray, quality: int) -> None:
    out = (np.clip(image, 0, 1) * 255 + 0.5).astype(np.uint8)
    Image.fromarray(out).save(path, quality=quality, subsampling=1)


def center_crop_to(source: np.ndarray, height: int, width: int) -> np.ndarray:
    sh, sw = source.shape[:2]
    if sh < height or sw < width:
        raise ValueError(f"source {sw}x{sh} is smaller than requested {width}x{height}")
    top = (sh - height) // 2
    left = (sw - width) // 2
    return source[top : top + height, left : left + width]


def repair_magenta(stars: np.ndarray, amount: float) -> np.ndarray:
    if amount <= 0:
        return stars
    r = stars[..., 0]
    g = stars[..., 1]
    b = stars[..., 2]
    magenta = np.maximum(np.minimum(r, b) - g, 0.0)
    repaired = stars.copy()
    repaired[..., 0] = np.clip(r - amount * 0.72 * magenta, 0, 1)
    repaired[..., 1] = np.clip(g + amount * 0.30 * magenta, 0, 1)
    repaired[..., 2] = np.clip(b - amount * 0.44 * magenta, 0, 1)
    return repaired


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", required=True, type=Path)
    parser.add_argument("--stars", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--crop-output", type=Path)
    parser.add_argument("--mask-output", type=Path)
    parser.add_argument("--core-threshold", type=float, default=0.47)
    parser.add_argument("--flux-threshold", type=float, default=70.0)
    parser.add_argument("--dilate", type=int, default=4)
    parser.add_argument("--blur-sigma", type=float, default=1.1)
    parser.add_argument("--magenta-repair", type=float, default=0.90)
    parser.add_argument("--chroma-boost", type=float, default=1.25)
    parser.add_argument("--shine-gamma", type=float, default=0.86)
    parser.add_argument("--faint-scale", type=float, default=0.060)
    parser.add_argument("--anchor-scale", type=float, default=0.44)
    parser.add_argument("--crop-width", type=int, default=1566)
    parser.add_argument("--crop-height", type=int, default=1288)
    parser.add_argument("--quality", type=int, default=96)
    args = parser.parse_args()

    base = read_rgb(args.base)
    stars = read_rgb(args.stars)
    bh, bw = base.shape[:2]
    stars = center_crop_to(stars, bh, bw)
    stars = repair_magenta(stars, args.magenta_repair)

    lum = stars.mean(axis=2)
    labels, count = ndi.label(lum > args.core_threshold)
    ids = np.arange(1, count + 1)
    flux = ndi.sum(lum, labels, ids)
    selected = np.isin(labels, ids[flux > args.flux_threshold])

    soft = ndi.binary_dilation(selected, iterations=args.dilate)
    soft = ndi.gaussian_filter(soft.astype(np.float32), sigma=args.blur_sigma)
    soft = np.clip(soft / max(float(soft.max()), 1e-6), 0, 1)[:, :, None]

    star_lum = stars.mean(axis=2, keepdims=True)
    stars_color = np.clip(star_lum + (stars - star_lum) * args.chroma_boost, 0, 1)
    stars_shine = np.power(np.clip(stars_color, 0, 1), args.shine_gamma)
    star_term = args.faint_scale * stars_color + args.anchor_scale * soft * stars_shine

    result = np.clip(base + star_term, 0, 1)
    save_jpeg(args.output, result, args.quality)

    if args.crop_output:
        crop = center_crop_to(result, args.crop_height, args.crop_width)
        save_jpeg(args.crop_output, crop, args.quality)

    if args.mask_output:
        save_jpeg(args.mask_output, np.repeat(soft, 3, axis=2), args.quality)

    print(f"components={count} selected={int((flux > args.flux_threshold).sum())}")
    print(f"output={args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
