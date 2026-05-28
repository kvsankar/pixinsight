# Original 2014 M81 / M82 Processing Evidence

This note records historical local artifacts for the 2014 M81/M82 data. Use them as references only; do not use historical TIFF/PSD/DSS products as modern PixInsight integration inputs.

## Finished-Work Reference

| Artifact | Notes |
| --- | --- |
| `finished-work/20140303-M81-M82.jpg` | Final-looking 2014 JPEG, copied to `docs/images/original-2014-finished-work.jpg` |

The reference image shows a wide M81/M82 composition. M81 has a bright core and faint spiral structure. M82 is narrow and mottled, with a red marker drawn near the supernova position. The background is green/brown and should not be treated as color ground truth.

## By-Date Folder

| Archive-relative path | Contents |
| --- | --- |
| `by-date/20140303-coorg-keemale-m81-m82/good` | 45 CR2 lights, 45 `.cal.tif` files, 91 `.Info.txt` sidecars |
| `by-date/20140303-coorg-keemale-m81-m82/framing-trials` | 8 short CR2 framing/trial frames |
| `by-date/20140303-coorg-keemale-m81-m82/stacking/attempt-01` | DSS `Autosave.tif` and `Autosave.html` |
| `by-date/20140303-coorg-keemale-m81-m82/processing/attempt-01` | Historical TIFF/PSD/JPEG processing stages |

## DSS Stacking Evidence

The DSS `Autosave.html` reports:

```text
Stacking mode: Standard
Alignment method: Automatic
Light frames: 40
Light exposure: 180s ISO1600
Total exposure: 2 hr 0 min 0 s
Dark frames: 49
Dark exposure: 180s ISO1600
Flats: none
Offset/bias: none
Stacking method: Kappa-Sigma, Kappa 2.00, 5 iterations
Dark method: Median
RGB channel background calibration: No
```

The historical DSS stack used 40 of the 45 CR2 files currently in the `good` folder. The five CR2 files not listed in the DSS HTML are all late +30 C frames with low filename stdev values:

```text
M81-M82_180s_1600iso_+30c_00412stdev_20140303-03h16m54s368ms.CR2
M81-M82_180s_1600iso_+30c_00526stdev_20140303-03h13m48s402ms.CR2
M81-M82_180s_1600iso_+30c_00561stdev_20140303-03h10m42s221ms.CR2
M81-M82_180s_1600iso_+30c_00576stdev_20140303-03h07m35s959ms.CR2
M81-M82_180s_1600iso_+30c_00582stdev_20140303-03h04m22s148ms.CR2
```

There is no current reason to exclude those five from the modern PixInsight baseline.

## Historical Processing Artifacts

`processing/attempt-01` contains:

```text
m81-m82.TIF
m81-m82-cropped.tif
m81-m82-cropped-processing.psd
m81-m82-cropped-processing-flattened.tif
m81-m82-cropped-processing-flattened.psd
m81-m82-cropped-processing-flattened-raw-processed.TIF
m81-m82-cropped-processing-flattened-raw-processed.psd
m81-m82-cropped-processing-flattened-raw-processed.jpg
m81-m82-cropped-processing-flattened-raw-processed_filtered.jpg
m81-m82-cropped-processing-flattened-raw-processed_filtered-marked.jpg
m81-m82-cropped-processing-flattened-raw-processed_filtered-marked.psd
```

The marked JPEG appears to match the finished-work reference and includes the supernova marker.

## Modern Implications

1. The old result confirms that both galaxies and the supernova-era M82 point source are worth preserving.
2. The old green/brown background should be treated as processing residue, not target color.
3. The old no-flats stack suggests that a no-flats branch can produce a usable image, but modern processing should test whether the same-trip flat set helps.
4. The historical 40-frame omission should not drive the first modern integration; all 45 curated lights are the first baseline.
