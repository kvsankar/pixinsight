# Original 2013 Processing Evidence

This note records what was found in the original capture directory during the 2026 PixInsight automation work. Paths are described relative to the original capture root so the public repo does not depend on machine-specific folders.

## Capture layout found on disk

```text
<original-capture-root>/
├── bad/
├── good/
│   ├── 240s-1600iso/
│   └── 240s-800iso/
├── processing/
│   └── attempt-01/
├── stacking/
│   ├── attempt-01/
│   └── attempt-02/
└── trial-shots/
```

The usable long-exposure set is split by ISO:

| Folder | Contents |
|---|---:|
| `good/240s-1600iso/` | 27 CR2 lights, 27 DSS calibrated TIFFs, 27 DSS `.Info.txt` files, 1 DSS `.stackinfo.txt` file |
| `good/240s-800iso/` | 1 CR2 light |
| `bad/` | 1 CR2 light |
| `trial-shots/` | 23 CR2 test frames |

The current PixInsight rerun correctly uses the 27 ISO 1600 lights and drops the single ISO 800 light. The ISO 800 frame has no matching ISO 800 darks in the documented calibration set, so mixing it into the ISO 1600 integration would add calibration and weighting complexity for little benefit.

## DeepSkyStacker attempts

Two DSS stacking reports were preserved:

| Attempt | Report | Light frames | Total exposure | Light stack method | Calibration |
|---|---|---:|---:|---|---|
| `stacking/attempt-01` | `Autosave.html` | 24 ISO 1600 lights | 1h 36m | Auto Adaptive Weighted Average, 5 iterations | 9 ISO 1600 darks, median; no offset, no flat |
| `stacking/attempt-02` | `Autosave001.html` | 27 ISO 1600 lights | 1h 48m | Kappa-Sigma, kappa 2.00, 5 iterations | 9 ISO 1600 darks, median; no offset, no flat |

Both reports identify DeepSkyStacker 3.3.3 beta 51. The calibrated per-light TIFF files report `DeepSkyStacker 3.2` in metadata.

Attempt 1 appears to be a quality-pruned stack. Attempt 2 includes all 27 ISO 1600 lights and is the closest historical equivalent to the current PixInsight Phase 1 integration.

The three ISO 1600 lights omitted from the 24-frame attempt were the three lowest DSS-scored frames:

| Omitted from attempt 1 | DSS quality | Stars |
|---|---:|---:|
| `LIGHT_240s_1600iso_+28c_00721stdev_20131230-23h12m14s396ms.CR2` | 7820.67 | 1213 |
| `LIGHT_240s_1600iso_+31c_00900stdev_20131230-23h05m03s740ms.CR2` | 10768.82 | 1681 |
| `LIGHT_240s_1600iso_+31c_00927stdev_20131230-23h00m58s020ms.CR2` | 12367.23 | 1922 |

## Photoshop processing

The `processing/attempt-01/` folder contains the 2013/2014 Photoshop finishing products:

| File | Metadata / role |
|---|---|
| `andromeda-stacked.TIF` | DSS stack copied forward for processing; 5202×3465 |
| `andromeda-stacked-ps.psd` | Adobe Photoshop CS6 working file; 3690×2460, 16-bit, about 99 MB |
| `andromeda-stacked-ps.jpg` | Photoshop JPEG export; 3690×2460 |
| `andromeda-stacked-ps (Large).jpg` | Smaller Photoshop JPEG export; 1620×1080 |

The Photoshop files record Adobe Photoshop CS6 and a create timestamp of 2014-01-02.

## Checked-in comparison images

Two compressed JPEG derivatives are kept in this repository for quick visual comparison:

| Image | Source | Notes |
|---|---|---|
| [original-2013-photoshop.jpg](images/original-2013-photoshop.jpg) | `processing/attempt-01/andromeda-stacked-ps.jpg` | Downsampled/compressed repo copy of the original Photoshop CS6 result. |
| [pixinsight-v3-ed80.jpg](images/pixinsight-v3-ed80.jpg) | `work/03-nonlinear/m31-final-v3.jpg` | Downsampled/compressed repo copy of the 2026 PixInsight automation v3 result. |

## Metadata caveat

ExifTool reports `FocalLength = 50.0 mm`, `FNumber = 0`, and no lens model on the CR2 light frames. Because `FNumber = 0` and `LensModel` is empty, this is not normal electronic lens metadata. Treat the 50 mm value as unreliable for astrometric scale. The solved PixInsight WCS result on the integrated image remains the better evidence for image scale: 386.29 mm effective focal length, 2.301 arcsec/pixel, and 3°18'11.2" × 2°12'6.0" field of view.
