# M45 / Pleiades Processing Research

This note captures target-specific processing implications for the 2013-12-30 Pleiades data.

## Sources

- NASA Science: [Messier 45](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-45/) - object type, distance, brightness, Taurus location, Merope/dust context.
- NASA Science image detail: [M45 - Pleiades - Merope](https://science.nasa.gov/image-detail/interstellar_cloud_in_pleiades/) - Hubble view of Merope illuminating a dusty reflection nebula.
- NASA APOD: [Messier 45: The Daughters of Atlas and Pleione](https://apod.nasa.gov/apod/ap191107.html) - wide-field reference emphasizing blue reflection nebulae and unrelated foreground dust cloud.
- AstroPixels: [Messier 45 - M45 - The Pleiades](https://www.astropixels.com/openclusters/M45-C01.html) - practical J2000 target coordinates, about RA 03h47m and Dec +24d07m.
- PixInsight: [Spectrophotometry-based Color Calibration](https://pixinsight.com/doc/docs/SPCC/SPCC.html) - SPCC/Gaia DR3 color-calibration context.
- PixInsight: [Multiscale Gradient Correction](https://www.pixinsight.com/tutorials/multiscale-gradient-correction/) - background/gradient correction context for fields where simple background guessing can be risky.

## Target Behavior

M45 is an open cluster in Taurus, dominated visually by a small number of bright blue-white stars. The photographic challenge is not merely resolving the cluster. The important faint signal is reflection nebulosity and dust around the cluster, especially near Merope and Maia.

NASA describes M45 as an open cluster with more than a thousand stars, while the brightest members dominate the visual field. The Hubble/Merope material is important for processing: the wispy structures are dust reflecting starlight, not red emission. The correct aesthetic and physical direction is therefore cool blue-white reflection nebulosity with subtle dust contrast, not H-alpha style red saturation.

The cluster is large on the sky. Practical J2000 coordinates for the center are about:

```text
RA  03h47m  ~= 56.75 deg
Dec +24d07m ~= +24.12 deg
```

Use these as a solve seed only. The image solver output should become the authority after Phase 2.

## Processing Risks

### Real Signal Can Look Like Gradient

M45 is surrounded by broad reflection dust. Without trusted flats, the data will probably include vignetting and sky gradients, but aggressive ABE/DBE can also subtract real nebulosity. A clean-looking flat background is not automatically a correct result.

Recommended handling:

- render a linked-STF preview of the WBPP master before any background correction;
- keep the raw integrated master as a permanent checkpoint;
- treat the first ABE output as a diagnostic, not as automatically accepted;
- compare no-ABE, gentle ABE, and manual DBE/MGC-style approaches if the reflection dust is weakened;
- do not place DBE samples on faint blue dust or dark dust lanes.

### Bright Star Halos Need Restraint

The bright Pleiades stars are central to the target, but halos can dominate a short DSLR integration. The finish should preserve bright-star presence while avoiding blown white disks and crunchy halo edges.

Recommended handling:

- use conservative nonlinear stretch first;
- protect star cores and halos during saturation and contrast moves;
- defer star reduction until after a clean baseline exists;
- if using star separation, keep a with-stars presentation as the main review candidate.

### Color Calibration Can Bleach The Target

SPCC should be attempted after a successful WCS solve, using Canon EOS 60D filter names. However, background neutralization and green removal should be judged visually against linked previews. Over-neutralization can make the dust look gray and understate the blue reflection character.

Recommended handling:

- run SPCC on a solved linear image;
- preserve an SPCC no-background-neutralization comparison if the default result looks too gray;
- apply SCNR lightly, if at all;
- avoid pushing the whole field toward saturated cyan or purple just to resemble the historical JPEG.

## Dataset-Specific Implications

The primary data is only 48 minutes of integration:

```text
12 x 240s, ISO 1600, Canon EOS 60D, +27 to +31 C
```

That is enough to recover the main reflection nebulosity, as the old finished-work image shows, but it is not a deep dust survey. Expect a tradeoff between faint dust lift and background noise.

The data was captured the same night as the 2013 Andromeda project and carries the same suspicious EXIF pattern: `50.0 mm` focal length and `FNumber=0`. Based on prior repo experience, start plate solving near the ED80/reducer scale:

```text
PI_SOLVE_RA=56.75
PI_SOLVE_DEC=24.12
PI_SOLVE_FOCAL_MM=386
PI_SOLVE_PIXEL_UM=4.31
```

If that solve fails, inspect the master before changing many knobs. The trial branch can try wider focal seeds, but the historical image scale strongly suggests this is not an ordinary 50 mm lens field.

## First-Pass PixInsight Plan

1. WBPP primary: 12 `good` CR2 lights plus 9 matching-duration darks, no flats.
2. Render a linked-STF WBPP preview before Phase 2.
3. Run Phase 2 with M45 solve seed and Canon EOS 60D SPCC filters.
4. Inspect ABE and SPCC behavior before promoting the linear checkpoint.
5. Preserve no-dark/no-flats and no-background-neutralization diagnostics if the primary branch looks suspect.
6. Build nonlinear candidates around blue reflection dust, star-halo control, and a believable dark background.
