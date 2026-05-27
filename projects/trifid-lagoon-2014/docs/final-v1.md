# Trifid / Lagoon 2014 Final V1

Final v1 is based on the March 2014 no-dark/no-flats integration, not the May branch.

## Final Outputs

- [Final v1 JPEG](images/trifid-lagoon-20140302-final-v1.jpg)
- [Final v1 comparison panel](images/trifid-lagoon-2014-final-v1-comparison.jpg)

Full-size generated products are local-only under:

```text
work/03-nonlinear-20140302-final-v1
```

Key files:

```text
03t-trifid-lagoon-20140302-final-v1.xisf
trifid-lagoon-20140302-final-v1.tif
```

## Data Used

| Input | Value |
| --- | --- |
| Session | 2014-03-02 Coorg / Keemale Trifid-Lagoon |
| Lights | 38 x 120s ISO1600 Canon EOS 60D |
| Total light time | 76 minutes |
| Darks | none |
| Flats | none |
| Optic | solved as ES ED80/reducer scale |

The March flat/no-dark branch was rejected because it produced visible flat mismatch and banding. The no-ABE and ABE-divide diagnostics were also rejected because they retained too much field gradient or produced severe green/chroma artifacts.

## Processing Summary

1. Integrated the March `good` lights separately in WBPP.
2. Ran Phase 2 on the March no-dark/no-flats master: subtractive ABE, ImageSolver, SPCC with Canon EOS 60D filters, SCNR, and conservative MLT linear noise reduction.
3. Solved at 386.21 mm, 2.302 arcsec/px, with a 3d 19' 27.5" x 2d 12' 39.9" field of view.
4. Built two nonlinear March review candidates:
   - `march-oldref-polish`, cleaner and more restrained.
   - `march-oldref-vivid`, brighter and closer to the 2014 attempt-02 reference.
5. Tried final passes from the vivid candidate, but they pushed the Lagoon core and red star field too hard.
6. Used the cleaner March polish branch as the final base and applied `scripts/pjsr/03t-trifid-lagoon-final-v1.js` with a restrained polish-base parameter set.
7. Exported final XISF, TIFF, JPEG, and a four-panel comparison against the 2014 attempt-02 reference.

## Visual Decision

Final v1 intentionally does not fully copy the old 2014 attempt-02 look. The historical image has more broad glow, magenta saturation, and warm background, but some of that character appears tied to gradient/vignetting and Photoshop-era color handling.

The final keeps the cleaner PixInsight background while preserving the important target signals:

- M8/Lagoon has a red emission rim and bright core without the most aggressive vivid-branch washout.
- M20/Trifid keeps its blue reflection, red emission, and dark dust lanes.
- The Sagittarius star field remains dense and natural; no star-reduction pass was accepted for v1.
- The result is darker and less theatrical than the 2014 reference, but it is a more controlled finish from the raw data.

## Residual Caveats

- No matching March darks or trustworthy flats were available.
- The dense star field and unflattened Milky Way structure make background correction subjective.
- A future v2 could test a manual DBE/MGC branch or a very subtle starless workflow, but v1 should stand as the finished single-session March result.
