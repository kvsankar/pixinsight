# Original 2016 Processing Evidence

## Finished Work

Found one historical finished-work JPEG:

- `finished-work/20160109-Comet-Catalina.jpg`

Metadata:

- Size: 4608 x 3072.
- File size: about 2.4 MB.
- Software: Adobe Photoshop CC 2015.
- Created: 2016-01-10 12:32:06 +05:30.

Visual reference:

- Green coma near the center of a dense star field.
- Faint tail/fan signal visible to the right of the coma.
- Background is dark, somewhat noisy, and likely stretched for comet visibility.
- This is a historical/taste reference only, not source data for modern processing.

## Local Processing Products

Found under `by-date/20160109-yelagiri-ymca-comet-catalina/processing`:

- `catalina-star-aligned-stacked-settings-applied.TIF`
- `catalina-star-aligned-stacked-settings-applied.jpg`
- `catalina-star-aligned-stacked-settings-applied_filtered.jpg`
- `catalina-star-aligned-stacked-settings-applied_filtered-copyright.jpg`
- `catalina-star-aligned-stacked-settings-applied.psd`
- `catalina-star-aligned-stacked-settings-applied_filtered.psd`
- `catalina-star-aligned-stacked-settings-applied-trial-2.jpg`
- `catalina-star-aligned-stacked-settings-applied-trial-2_filtered.jpg`
- `catalina-star-aligned-stacked-settings-applied-trial-2.psd`
- `catalina-star-and-comet-aligned-stacked.TIF`
- `catalina-star-and-comet-aligned-stacked.psd`

These products confirm that the old workflow explored both star-aligned and star-plus-comet aligned outputs.

## DSS Logs

Found DSS `Autosave*.html`, `*.Info.txt`, and `*.stackinfo.txt` under:

- `by-date/20160109-yelagiri-ymca-comet-catalina/originals/good/star-tracking`

Key findings:

- DSS version: DeepSkyStacker 3.3.4.
- Historical light set: 5 or 6 T1i 120 s ISO1600 frames.
- Total exposure in DSS logs: 10 to 12 minutes.
- Stacking method: Kappa-Sigma, kappa 2.00, 5 iterations.
- Background calibration: per-channel background calibration enabled.
- Darks: none.
- Offsets/bias: none.
- Flats:
  - Some logs use no flats.
  - Later logs use 34 flats, ISO1600, exposure about 1/128 s.
- Comet mode:
  - Several logs say `Comet processing : Align on stars and comet`.
- Cosmetic correction:
  - The latest log applies DSS hot/cold pixel cosmetic correction.

Historical DSS comet coordinate examples:

| Frame | Comet coordinate |
| --- | --- |
| `LIGHT_120s_1600iso_+29c_00625stdev_20160109-04h16m11s929ms.CR2` | `2246.64, 1664.44` |
| `LIGHT_120s_1600iso_+29c_00611stdev_20160109-04h18m16s604ms.CR2` | `2241.78, 1663.60` |
| `LIGHT_120s_1600iso_+27c_00605stdev_20160109-04h20m22s138ms.CR2` | `2236.80, 1662.73` |
| `LIGHT_120s_1600iso_+27c_00576stdev_20160109-04h25m26s152ms.CR2` | `2272.57, 1665.51` |
| `LIGHT_120s_1600iso_+25c_00586stdev_20160109-04h23m20s229ms.CR2` | `2276.89, 1665.60` |
| `LIGHT_120s_1600iso_+26c_00573stdev_20160109-04h29m53s694ms.CR2` | `2261.91, 1664.51` |

The coordinate ordering in the DSS logs does not follow filename time order perfectly, so these values should be used as sanity checks only. Modern CometAlignment should remeasure the nucleus on calibrated/registered frames.

## Processing Implications

- The old result appears to be T1i-based, not a 60D all-folder stack.
- The old result did not use dark calibration.
- The same-date T1i flats were part of at least one historical attempt, but need a modern flat/no-flat diagnostic because no bias or dark-flat support was found.
- The historical Photoshop/JPEG output is useful for framing and taste, but not a truth target for color, background, or faint tail intensity.
