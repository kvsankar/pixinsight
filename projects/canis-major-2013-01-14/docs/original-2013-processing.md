# Original 2013 Canis Major Processing Evidence

This note records local historical artifacts for the 2013 Canis Major wide-field image. These files are visual and procedural references only. They should not be used as calibrated inputs for the new PixInsight integration.

## Historical References Found

| Archive-relative path | Contents | Use |
| --- | --- | --- |
| `by-date/20130114-yelagiri-ymca-canis-major/processing/atttempt-01/canis-major-stacked-pse.jpg` | Old processed JPEG | Main historical visual reference |
| `by-date/20130114-yelagiri-ymca-canis-major/processing/atttempt-01/canis-major-stacked-pse.tif` | Old processed TIFF | Do not use as PixInsight input |
| `by-date/20130114-yelagiri-ymca-canis-major/processing/atttempt-01/canis-major-stacked.TIF` | Old processed/stacked TIFF | Historical reference only |
| `by-date/20130114-yelagiri-ymca-canis-major/stacking/attempt-01/Autosave.tif` | Old DSS stack output | Historical stack evidence only |
| `by-date/20130114-yelagiri-ymca-canis-major/lights-cr2/no-hallow-group/*.Info.txt` and `*.stackinfo.txt` | DSS-era quality and registration sidecars | Evidence that this branch was used historically |

The old processed JPEG was copied into this project as a compressed, public-friendly documentation reference:

```text
docs/images/original-2013-attempt-01-stacked-pse.jpg
```

## What The Historical Image Shows

The old reference shows:

- Sirius as the dominant bright star with a visible halo,
- M41 / NGC 2287 as a small open cluster below the center of the frame,
- a dense warm/cool star field,
- strong black-point contrast,
- many small elongated stars, especially away from the central field.

The reference should guide orientation and taste, but it is not ground truth. A modern result can be less crushed, have better star color, or show a calmer background if the raw data supports it.

## Old Sidecars

The `no-hallow-group` folder contains DSS-era `.Info.txt` and `.stackinfo.txt` sidecars. Some sidecars contain historical machine paths, so they should not be copied into public docs. The useful public-safe conclusion is that the `no-hallow-group` appears to be the historical stack branch.
