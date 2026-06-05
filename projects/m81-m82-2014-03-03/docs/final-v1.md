# M81 / M82 2014-03-03 Final V1

Accepted on 2026-06-05 IST. Final v1 is the cool-light/cool-dark SN-preserve v2 branch, with the presentation crop tightened by 20% after acceptance to remove the half-in/half-out edge galaxy above M81.

## Final Outputs

- [Final v1 JPEG](images/m81-m82-20140303-final-v1.jpg)
- [M82 close crop, unmarked](images/m81-m82-20140303-m82-close-cooldark-sn-preserve-v2.jpg)
- [M82 close crop, approximate SN 2014J review annotation](images/m81-m82-20140303-m82-close-cooldark-sn-preserve-v2-sn2014j-marked.jpg)

Full-size generated products are local-only under:

```text
work/03-nonlinear-20140303-cooldark-sn-preserve-v2
```

Key files:

```text
03u-m81-m82-cooldark-sn-preserve-v2-final-v1-crop.xisf
m81-m82-20140303-final-v1.tif
```

## Data Used

| Input | Value |
| --- | --- |
| Session | 2014-03-03 M81 / M82 |
| Lights selected | 33 x 180s ISO1600 Canon EOS 60D, +24 to +33 C |
| Lights integrated | 31 x 180s after WBPP rejection |
| Total integrated light time | 93 minutes |
| Darks | Canon EOS 60D library-01 180s ISO1600 +28 to +33 C |
| Flats | none |
| Optic | solved near ED80/reducer scale, about 386 mm |

## Processing Summary

1. Rejected the broad warm-dark branch because it produced severe vertical red/blue chroma streaking.
2. Kept the no-dark branch as a legacy reference, but close-crop review showed it was still not final-quality.
3. Selected cooler lights and the cooler `library-01` dark set to reduce the colored vertical pattern noise at the source.
4. Ran Phase 2 with ABE, plate solving, SPCC with Canon EOS 60D filters, SCNR, and stock linear NR.
5. Tested stock cool-dark, BXT/NXT calm, lower-stretch M82-safe, and SN-preserve nonlinear branches.
6. Demoted BXT/NXT calm because M82 became too overexposed/smoothed and the SN 2014J-era point source became less legible.
7. Accepted SN-preserve v2 because it keeps the improved cool-dark background while preserving M82 point-source structure better.
8. Tightened the final presentation crop by 20% from the accepted SN-preserve branch crop, producing a 2633 x 1671 TIFF and 922 x 585 review JPEG.

## Visual Decision

Final v1 favors historical/target-specific integrity over maximum smoothness. The BXT/NXT calm branch has the cleaner background, but it makes M82 read too much like a bright filled-in slab. The accepted branch is darker and subtler, but it keeps M82 structure and the SN 2014J-era point-source cue more believable.

The marked M82 crop is only a review annotation. It is not a presentation image and is not an astrometric identification.

## Residual Caveats

- The accepted branch uses 31 integrated lights rather than all 45 because the hotter frames and broad warm-dark library were part of the pattern-noise problem.
- No trustworthy flats were accepted, so some archive-limited background/vignetting constraints remain.
- A future v2 could test the same-trip flat set against the cool-light/cool-dark branch, but final v1 is accepted and closed for this processing pass.
