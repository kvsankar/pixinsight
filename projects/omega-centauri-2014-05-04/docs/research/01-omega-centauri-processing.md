# Omega Centauri Processing Research

This note captures target-specific facts and processing implications for the 2014 Omega Centauri dataset.

## Sources

- NASA Hubble image page, [Omega Centauri](https://science.nasa.gov/asset/hubble/omega-centauri/)
- NASA Hubble image page, [Core of Omega Centauri](https://science.nasa.gov/asset/hubble/core-of-omega-centauri/)
- ESO image page, [The globular cluster Omega Centauri](https://www.eso.org/public/images/eso0844a/)
- SIMBAD, [Omega Centauri](https://simbad.cds.unistra.fr/simbad/sim-id?Ident=Omega+Centauri)
- Repo note, [RC Astro plugin workflow](../../../../docs/rc-astro-workflow.md)

## Target Facts

Omega Centauri / NGC 5139 is a globular star cluster in Centaurus. NASA lists it as a globular star cluster with object name Omega Centauri / NGC 5139, position near RA `13h 26m 45.9s`, Dec `-47d 28m 36.99s`, and distance about 16,000 light-years. NASA's core image note describes Omega Centauri as the largest of about 150 Milky Way globular clusters, with nearly 10 million stars.

SIMBAD gives the ICRS J2000 position near:

```text
RA 13h26m47.28s
Dec -47d28m46.1s
```

ESO notes that Omega Centauri has as many as ten million stars and that the central part alone spans about half a degree on the sky. This makes the object large enough that framing, core preservation, and star handling matter even at ED80/reducer scale.

## Plate-Solve Seed

Use an initial field seed near the cluster center:

```text
PI_SOLVE_RA=201.697
PI_SOLVE_DEC=-47.4795
PI_SOLVE_FOCAL_MM=386
PI_SOLVE_PIXEL_UM=4.31
PI_SOLVE_MAGNITUDE=12.0
```

This assumes the same ED80/reducer-scale configuration that has solved around 386 mm in nearby 2014 repo projects. The raw EXIF focal length of `50.0 mm` should be treated as stale until Phase 2 solves the integrated master.

## Processing Implications

### Background Extraction

The primary risk is not nebulosity but over-flattening the outer cluster halo. ABE/DBE samples should avoid the cluster center, outer halo, and dense star concentrations. If background extraction leaves the full frame slightly uneven but preserves the cluster halo, that may be better than an overly flat result.

### Color Calibration

This is broadband DSLR data. SPCC with Canon EOS 60D R/G/B filter responses is appropriate once WCS exists. Star color is part of the subject: avoid a result where all stars collapse to white or where the field takes on a strong green/brown cast.

### Detail And Noise

Omega Centauri is star-dominated. BXT settings should be lower than for galaxy work because the target is mostly stars, and over-tightening can make the core brittle or create dark halos. NXT should reduce DSLR noise without erasing faint halo stars.

The lack of matching ISO800 darks means the first branch should be no-dark/no-flats. If a tight crop reveals walking/fixed-pattern noise, compare against a clearly labeled ISO1600-dark diagnostic rather than assuming late nonlinear denoise can fix an upstream calibration problem.

### Nonlinear Presentation

The core should be bright but not clipped. The outer halo should remain visible with a natural falloff. A final crop should keep enough surrounding field to show the scale of the cluster, but a tighter cluster-centered sibling may be useful if the full frame has weak corners or distracting field imbalance.

## Initial Plan

1. WBPP primary: 27 top-level `good` CR2 lights, no darks, no flats.
2. Render linked and unlinked STF previews of the integrated master.
3. Do not run the ISO1600 dark diagnostic unless the no-dark branch shows strong pattern noise.
4. Run Phase 2 with the Omega solve seed and Canon EOS 60D SPCC filters.
5. Apply BXT/NXT conservatively, with lower star/nonstellar settings than the Markarian galaxy branch.
6. Build a conservative nonlinear full-frame candidate and, if useful, a tighter cluster-centered crop.
7. Run LLM-as-judge review using narrow crops from the core, outer halo, corner stars, and background/edge.
