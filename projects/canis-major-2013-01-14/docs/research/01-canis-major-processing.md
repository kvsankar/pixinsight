# Canis Major 2013-01-14 Processing Research

This research note records target facts and processing implications for the 2013 Canis Major wide-field dataset.

## Sources Checked

- SIMBAD Sirius basic data: <https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=Sirius>
- SIMBAD M41 basic data: <https://simbad.cds.unistra.fr/simbad/sim-id?Ident=M41>
- Messier Objects M41 overview: <https://www.messier-objects.com/messier-41/>

## Target Facts

This is a wide-field Canis Major composition rather than a single deep-sky close-up.

Important real features:

- Sirius / Alpha Canis Majoris is the dominant bright star. SIMBAD lists it as `alf CMa` and gives J2000 coordinates RA 06 45 08.91728, Dec -16 42 58.0171.
- M41 / NGC 2287 is an open cluster. SIMBAD lists it as `M 41 -- Open Cluster` with J2000 coordinates RA 06 46 03.1, Dec -20 43 07 and angular size about 39.8 arcmin.
- The Messier Objects overview describes M41 as a bright open cluster near Sirius, about 4 degrees south of Sirius, with apparent magnitude about 4.5 and apparent diameter about 38 arcmin.

Approximate processing seed:

```text
Center RA: 101.40 deg
Center Dec: -18.70 deg
Focal length: 50 mm
Pixel size: 4.31 um
Scale: about 17.8 arcsec/px
Field: about 25.6 deg x 17.1 deg
```

## Processing Implications

- This is a star-field presentation target. The main signal is real star color, density, and cluster structure, not faint nebulosity.
- Sirius will naturally be bright and probably saturated. Processing should preserve a plausible halo and avoid hard clipping/ringing artifacts.
- M41 should remain recognizable as a cluster with varied star color.
- The wide-open EF 50mm f/1.8 field may have vignetting, chromatic aberration, coma, and corner star distortion. Do not overinterpret off-axis aberration as a registration failure until the integrated master is inspected.
- Background correction should address lens vignetting and sky gradient without flattening the natural star-density gradient of the Milky Way field.
- SPCC should be useful because the field has many stars, but background neutralization may need review due dense star coverage and possible sky gradient.
- BXT/NXT, if used, should be conservative. This image is almost all stars, and over-sharpening could make lens aberrations brittle or artificial.

## Branch Implications From The Actual Data

- Start from `no-hallow-group` because preview frames show more useful star signal and a better-controlled Sirius halo.
- Keep `hallow-group` separate. Its preview frame shows a broader Sirius halo and weaker useful star field.
- Use the 10s ISO1600 Canon EOS 60D darks as the primary calibration support. The 30-33 C library-02 set covers most of the primary lights well by count.
- Keep a no-dark control because the primary lights extend up to +39 C while the large dark set is concentrated around +32 C.
- Reject the available `f10` flats for the first pass because the science data is f/1.8.

## Review Priorities

1. Sirius core and halo: clipping, color fringe, ringing, and halo naturalness.
2. M41: cluster contrast, star color, and whether the cluster survives the full-field stretch.
3. Star field: roundness, registration, chromatic aberration, and color balance.
4. Background: vignetting, gradient, color cast, and whether the black point is too crushed.
