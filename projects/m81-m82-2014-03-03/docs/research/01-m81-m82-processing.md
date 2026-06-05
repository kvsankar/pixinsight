# M81 / M82 Processing Research

This note captures target-specific facts and processing implications for the 2014 M81/M82 dataset.

## Sources

- NASA Hubble Messier Catalog, [Messier 81](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-81/)
- NASA HEASARC, [M82](https://heasarc.gsfc.nasa.gov/docs/objects/agn/m82.html)
- NASA Scientific Visualization Studio, [NASA's Swift Images SN 2014J in M82](https://svs.gsfc.nasa.gov/11459)
- SIMBAD, [M81](https://simbad.u-strasbg.fr/simbad/sim-basic?Ident=m81)
- SIMBAD, [M82](https://simbad.u-strasbg.fr/simbad/sim-basic?Ident=m82)
- PixInsight Reference Documentation, [Spectrophotometry-based Color Calibration](https://pixinsight.com/doc/docs/SPCC/SPCC.html)

## Target Facts

M81 is a bright spiral galaxy in Ursa Major. NASA lists it at about 11.6 million light-years, apparent magnitude 6.9, with bluish star-forming spiral arms, sinuous dust lanes, and a large older/redder central bulge. SIMBAD gives M81 coordinates near:

```text
RA 09h55m33.17s
Dec +69d03m55.0s
```

M82 is the nearby Cigar Galaxy, an edge-on starburst galaxy in the same field. NASA HEASARC describes M82 as the nearest starburst galaxy, with intense star formation and hot gas outflows driven by its interaction with M81. M82 coordinates are near:

```text
RA 09h55m52s
Dec +69d40m47s
```

SN 2014J was discovered in M82 on 2014-01-21. NASA Swift notes that it was an exceptionally close Type Ia supernova in M82, roughly 12 million light-years away, and that it was expected to brighten into early February 2014. The local data was captured on 2014-03-03, so SN 2014J may still be visible as a point source in or near M82. The historical finished-work reference includes a red marker near M82, likely intended to call out this supernova.

## Plate-Solve Seed

Use a field center between M81 and M82:

```text
PI_SOLVE_RA=148.93
PI_SOLVE_DEC=69.37
PI_SOLVE_FOCAL_MM=386
PI_SOLVE_PIXEL_UM=4.31
PI_SOLVE_MAGNITUDE=10.0
```

This assumes the same ED80/reducer-scale configuration that has solved around 386 mm in nearby repo projects. The raw EXIF focal length of `50.0 mm` should be treated as stale until Phase 2 solves the integrated master.

## Processing Implications

### Background Extraction

M81's outer disk and halo are low-surface-brightness signal. ABE or DBE can remove this if it samples too close to the galaxy. M82 also has asymmetric real structure around the disk. Background extraction should be conservative, inspected with linked STF previews, and compared against no-ABE or no-background-neutralization diagnostics if the field looks over-flattened.

### Color Calibration

This is broadband DSLR data, so SPCC with Canon EOS 60D R/G/B filter responses is a reasonable first color calibration after WCS is present. The field has many stars and relatively compact galaxies, so SPCC should be more straightforward than nebula-rich targets. However, background neutralization can still be biased by vignetting or by sampling too near the galaxies.

### Galaxy Stretch And Detail

M81 needs core protection plus gentle arm/halo lift. M82 needs local contrast in the edge-on disk and dust lane, but the stock 60D should not be forced into a narrowband-like red outflow presentation. A good nonlinear pass should be restrained: protect cores, lift arms carefully, preserve star color, and avoid crushing the background to hide noise.

### SN 2014J

The supernova is historically interesting, but the final image should probably stay unmarked. Keep an annotated review copy or comparison crop if the point source is visible after solving/registration, especially because the old finished-work image appears to mark it.

## Initial Plan And Current Finding

1. WBPP primary: all 45 `good` CR2 lights plus the 49-frame `library-02` 180s ISO1600 dark family, no flats.
2. Render linked and unlinked STF previews of the integrated master.
3. Run a no-dark/no-flats control only if the primary dark branch shows overcorrection or pedestal warnings.
4. Test `flat/20140302-rosette-m81-m82-markarian/1by3200s/set-2` only as a diagnostic branch after the no-flats baseline is inspected.
5. Run Phase 2 with the M81/M82 solve seed and Canon EOS 60D SPCC filters.
6. Preserve a no-BN SPCC diagnostic if background neutralization muddies the field.
7. Build a clean nonlinear wide-pair candidate first, then decide whether to crop or annotate SN 2014J.

After running Phase 1 and Phase 2, the broad warm-dark branch was rejected because it produced severe post-SPCC vertical chroma streaking. A no-dark/no-flats branch became the first usable baseline, but later close-crop review still found objectionable colored vertical patterning. The accepted final v1 uses a cooler-light/cooler-dark diagnostic branch and an SN-preserving nonlinear pass, trading some integration time for a cleaner background and more legible M82/SN 2014J-era point-source structure.
