# Markarian Chain Processing Research

This note captures target-specific facts and processing implications for the 2014 Markarian Chain dataset.

## Sources

- NASA APOD, [Markarian's Chain](https://apod.nasa.gov/apod/ap210522.html)
- NASA Hubble Messier Catalog, [Messier 84](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-84/)
- SIMBAD, [M84](https://simbad.u-strasbg.fr/simbad/sim-id?Ident=M++84)
- SIMBAD, [M86](https://simbad.u-strasbg.fr/simbad/sim-basic?Ident=m86)
- SIMBAD, [NGC 4438](https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=NGC+4438)
- PixInsight Reference Documentation, [Spectrophotometry-based Color Calibration](https://pixinsight.com/doc/docs/SPCC/SPCC.html)
- Repo note, [RC Astro plugin workflow](../../../../docs/rc-astro-workflow.md)

## Target Facts

Markarian's Chain is a curved line of galaxies near the heart of the Virgo Cluster. NASA APOD describes the field as anchored by M84 and M86, with NGC 4438 and NGC 4435 forming the pair often called Markarian's Eyes.

M84 is one of the Virgo Cluster galaxies. NASA's Hubble Messier catalog lists it as an elliptical galaxy in Virgo, about 60 million light-years away, with apparent magnitude 10.1. It has a bright central core and dust lanes visible in Hubble imagery. SIMBAD classifies M84 as a Seyfert 2 galaxy and gives an ICRS J2000 position near:

```text
RA 12h25m03.743s
Dec +12d53m13.139s
```

SIMBAD gives M86's ICRS J2000 position near:

```text
RA 12h26m11.814s
Dec +12d56m45.49s
```

SIMBAD gives NGC 4438's ICRS J2000 position near:

```text
RA 12h27m45.671s
Dec +13d00m31.708s
```

The chain extends beyond those three objects through smaller galaxies such as NGC 4458, NGC 4461, NGC 4473, and NGC 4477. For the 2014 data, the first solve seed should favor the chain midpoint rather than any single galaxy.

## Plate-Solve Seed

Use an initial field seed near the central chain:

```text
PI_SOLVE_RA=186.75
PI_SOLVE_DEC=13.10
PI_SOLVE_FOCAL_MM=386
PI_SOLVE_PIXEL_UM=4.31
PI_SOLVE_MAGNITUDE=12.0
```

This assumes the same ED80/reducer-scale configuration that has solved around 386 mm in nearby 2014 repo projects. The successful Phase 2 solve used limiting magnitude 12.0 after an initial magnitude 10.5 attempt failed. The raw EXIF focal length of `50.0 mm` should be treated as stale.

If the solve fails at 386 mm, inspect the image and logs before changing the seed. The fallback hypothesis is a much wider 50mm field, but the archive context and 2014 Coorg ED80-era projects make 386 mm the more likely starting point.

## Processing Implications

### Background Extraction

The target is a galaxy-rich Virgo Cluster field. The main risk is not strong emission nebulosity but over-flattening: ABE/DBE can erase faint galaxy halos, unresolved background galaxies, or subtle intracluster-looking low-surface brightness structure. Background extraction should be conservative and judged with linked-STF previews.

Avoid placing background samples over:

- M84 and M86 halos;
- NGC 4438/4435 and their disturbed region;
- the upper chain around NGC 4458/4461/4473/4477;
- dense patches of faint background galaxies.

### Color Calibration

This is broadband DSLR data. SPCC with Canon EOS 60D R/G/B filter responses is appropriate once WCS exists. The field has many stars and comparatively compact galaxies, so color calibration should be more straightforward than nebula-rich fields.

However, SPCC background neutralization can be biased if vignetting remains strong or if the background region includes galaxy halo signal. Preserve a no-background-neutralization diagnostic if the SPCC result looks muddy, overly green/brown, or too neutral around the galaxies.

### Detail And Noise

The scientifically interesting signals are small, low-contrast galaxy shapes: M84/M86 cores and halos, the disturbed NGC 4438/4435 pair, and the string of smaller galaxies up the chain. Over-sharpening can make ellipticals look brittle and can turn small galaxies into hard dots.

Use BlurXTerminator conservatively on linear data after SPCC. For a broadband galaxy field, start lower than an aggressive galaxy setting if close crops show harsh cores or halos. Use NoiseXTerminator after BXT and before stretch, with cautious low-frequency luminance denoise so faint galaxies and residual background texture are not wiped out.

### Nonlinear Presentation

The first nonlinear candidate should be a classic chain composition. A wider Virgo Cluster crop can be considered if the solved frame naturally includes M87 or other recognizable neighbors without making the chain too small.

Keep the final unannotated. If the field solves cleanly, an annotated review copy labeling M84, M86, NGC 4438/4435, and NGC 4477 would be useful for orientation, but labels should not be part of the primary presentation image.

## Initial Plan

1. WBPP primary: all 19 `good` CR2 lights plus the 9 raw 240s ISO1600 darks, no flats.
2. Render linked and unlinked STF previews of the integrated master.
3. Run a no-dark/no-flats control if the primary dark branch shows overcorrection, pedestal warnings, or vertical chroma streaking.
4. Test `flat/20140302-rosette-m81-m82-markarian/1by3200s/set-2` only as a named diagnostic after no-flats baselines are inspected.
5. Run Phase 2 with the Markarian Chain solve seed and Canon EOS 60D SPCC filters.
6. Preserve a no-BN SPCC diagnostic if background neutralization muddies the galaxy field.
7. Build a clean nonlinear chain candidate first, then decide whether to include a wider Virgo Cluster crop or annotation review copy.
