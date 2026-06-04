# M7 / Ptolemy Cluster Processing Research

## Sources

- NASA Science, [Messier 7](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-7/)
- ESO, [The star cluster Messier 7](https://www.eso.org/public/images/eso1406a/)

## Target Facts

M7, also known as Ptolemy Cluster and NGC 6475, is a bright open cluster in Scorpius. NASA lists it as an open cluster with apparent magnitude 3.3, about 980 light-years away, and about 80 stars. NASA also notes that it is the southernmost object in Messier's catalog and that open clusters are irregular groups of stars formed from a common gas/dust cloud.

ESO's M7 image page identifies the object as an open cluster and gives a useful coordinate seed:

```text
RA  17 53 51.21
Dec -34 47 34.34
```

Decimal seed:

```text
RA  268.4634 deg
Dec -34.7929 deg
```

## Processing Implications

M7 is primarily a star-field and open-cluster target. The main image quality questions are:

- Star color: preserve blue-white and warmer orange/yellow stars without pushing chroma into neon color.
- Star shape: watch for registration trails, coma, and over-hard BXT star cores.
- Star saturation: the 120s branch may show richer field depth but worse bright-star saturation than the 60s branch.
- Background restraint: the field is in the Milky Way, so aggressive ABE/DBE can remove real star-cloud variation or create an over-black artificial field.
- Composition: M7 is broad enough that a crop can improve focus, but too-tight cropping may lose the open-cluster-in-Milky-Way context.

## Dataset-Specific Notes

The local data is thin:

```text
5 x 120s
8 x 60s
1 x 30s
1 x 1s
```

This is enough for a review candidate but probably not enough for heavy sharpening or aggressive noise cleanup.

The raw EXIF reports 50 mm, but same-night Eta Carinae solved near 480 mm. Use 480 mm as the first solve seed and trust the solved result afterward.

The warmer dark library is risky:

- 120s lights are +24 to +28 C, but matching 120s darks start around +33 C.
- 60s lights are +25 to +29 C, but matching 60s darks are +31 to +33 C.

Start no-dark/no-flats, then run dark diagnostics only if no-dark artifacts dominate the first review.

## PixInsight Plan

1. Integrate 120s and 60s branches separately with WBPP, no darks/flats/bias.
2. Render linked/unlinked STF previews for both branches.
3. Run Phase 2 first on the technically stronger branch.
4. Use conservative ABE; keep no-ABE or milder background diagnostics if the field looks overcorrected.
5. Plate solve with RA 268.4634, Dec -34.7929, focal seed 480 mm, pixel 4.31 um.
6. Run SPCC with Canon EOS 60D filters.
7. Try conservative BXT/NXT only after SPCC and compare close crops.
8. Stretch conservatively, preserving star color and avoiding clipped bright star cores.
9. Create LLM-as-judge crops for core stars, background texture, corner stars, and matched 120s/60s regions.

## Similar Repo Lessons

- Canis Major showed that wide/star-field targets can fail normal registration when bright stars dominate; verify WBPP registration counts before trusting the master.
- Omega Centauri showed that LLM-as-judge crops are useful for star-shape/background review before accepting a cluster presentation.
- Eta Carinae reinforced the rule that mixed exposure groups should be integrated and inspected separately before any combined branch.
