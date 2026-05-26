# Original 2014 Rosette Processing Evidence

This note records what was found in the original Rosette capture directory. Machine-specific paths are intentionally omitted.

For how this evidence shaped the new PixInsight attempts, see [Processing journey](processing-journey.md).

## DeepSkyStacker Attempt

The preserved DSS report is:

```text
stacking/attempt-01/Autosave.html
```

It reports:

| Field | Value |
|---|---|
| DeepSkyStacker version | 3.3.3 beta 51 |
| Stacking mode | Standard |
| Alignment method | Automatic |
| Light frames | 31 frames, ISO 1600 |
| Total exposure | 2 hr 4 min |
| Light integration | Kappa-Sigma, kappa 2.00, 5 iterations |
| Background calibration | Per-channel background calibration yes; RGB channels background calibration no |
| Darks | 9 frames, ISO 1600, 4 min, median |
| Offset / bias | None |
| Flats | None |

The DSS report references 27 west-side lights and 4 east-side lights. The current archival folder has top-level `good/east` and `good/west` folders plus separate `sat-trail(s)` subfolders, so the exact historical 31-frame set should be treated as a recorded baseline rather than blindly inferred from current folder names.

This mattered during the new PixInsight work: the first automated baseline used 33 top-level good lights because that is easy to reproduce from the current folder tree. Reconstructing the historical 31-light selection remains a useful comparison task, not the current active integration.

## Current Archive Counts

| Folder | CR2 count | Notes |
|---|---:|---|
| `good/east` | 3 | Top-level good east lights |
| `good/east/sat-trails` | 1 | DSS report appears to have included this timestamp under an older path/name |
| `good/west` | 30 | Top-level good west lights |
| `good/west/sat-trail` | 3 | Separated satellite-trail frames |
| `bad` | 6 | Includes aborted/short/poor frames |
| `bad/trailing` | 9 | Trailed 240s ISO 1600 frames |
| `framing-trials` | 15 | Short/high-ISO framing and exposure tests |

## Photoshop Processing

The `processing/` tree has three attempts:

| Attempt | Notable files |
|---|---|
| `attempt-01` | DSS TIFFs, `rosette-stacked-applied-ps.psd`, several Photoshop TIFF/JPEG exports |
| `attempt-02` | Cropped TIFF, full JPEG, 1000px JPEG, PSD |
| `attempt-03` | Three later PSD working files from 2015 |

Metadata found on processed files:

- DSS-generated TIFFs report `DeepSkyStacker 3.2`.
- Photoshop files report Adobe Photoshop CS6 and, for one early TIFF, Adobe Photoshop Camera Raw 7.0.
- Cropped Photoshop outputs are 2776×2776; full-frame stack/PSD outputs are 5202×3465.

## Checked-in Comparison Images

Two compressed JPEG derivatives are kept in this repository for quick visual comparison:

| Image | Source | Notes |
|---|---|---|
| [original-2014-photoshop.jpg](images/original-2014-photoshop.jpg) | `finished-work/20140302-Rosette-Nebula.jpg` | Recompressed and metadata-stripped repo copy of the historical finished-work export. |
| [rosette-starxterminator-v3b.jpg](images/rosette-starxterminator-v3b.jpg) | `work/03-nonlinear/rosette-starxterminator-v3b.jpg` | Downsampled/compressed repo copy of the 2026 PixInsight + StarXTerminator v3b result. |
| [rosette-starxterminator-v3g-old-red-depth.jpg](images/rosette-starxterminator-v3g-old-red-depth.jpg) | `work/03-nonlinear/rosette-starxterminator-v3g-old-red-protected.jpg` | Downsampled/compressed repo copy of the 2026 old-reference depth branch. |
| [rosette-starxterminator-v3h-old-red-starless.jpg](images/rosette-starxterminator-v3h-old-red-starless.jpg) | `work/03-nonlinear/rosette-starxterminator-v3h-old-red-starless.jpg` | Downsampled/compressed repo copy of the 2026 old-reference starless branch. |
| [rosette-starxterminator-v3j-sparse-anchor-stars.jpg](images/rosette-starxterminator-v3j-sparse-anchor-stars.jpg) | `work/03-nonlinear/rosette-starxterminator-v3j-sparse-anchor-stars.jpg` | Downsampled/compressed repo copy of the 2026 old-reference subtle-stars branch. |

## Metadata Caveat

ExifTool reports `FocalLength = 50.0 mm`, `FNumber = 0`, and no lens model on the CR2 files. As with the M31 project, this is not normal electronic lens metadata. Plate solving the integrated PixInsight master should be considered authoritative for actual image scale.

The new PixInsight plate solve confirmed this caveat. The solved integration reports an optical scale around 386 mm and about 2.303 arcsec/px, so the 50 mm EXIF value should not be used for future Rosette solving.

## Relevance To Current Processing

The historical output is important because it shows that the data can produce a red/pink Rosette result despite the stock Canon DSLR and the absence of flats. The preserved DSS intermediate is faint gray-pink rather than green. That makes the current PixInsight gray-green SPCC branches suspicious and supports the working theory that background/flat handling is suppressing or rebalancing real nebular signal.
