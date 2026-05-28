# Original 2013 Pleiades Processing Evidence

This note records local historical artifacts for the 2013 Pleiades image. These files are visual and procedural references only. They should not be used as calibrated inputs for the new PixInsight integration.

## Historical References Found

| Archive-relative path | Contents | Use |
| --- | --- | --- |
| `finished-work/20131230-Pleiades-Cluster.jpg` | Final-looking JPEG, about 9.8 MB in the local archive | Main historical visual reference |
| `by-date/20131230-coorg-keemale-m45-pleiades/processing/attempt-01/m45-stacked-pse-picasa (Large).jpg` | Smaller web-style JPEG | Secondary style reference |
| `by-date/20131230-coorg-keemale-m45-pleiades/processing/attempt-01/m45-stacked-pse-picasa.jpg` | Larger processed JPEG | Secondary style/reference artifact |
| `by-date/20131230-coorg-keemale-m45-pleiades/processing/attempt-01/m45-stacked.TIF` | Processed TIFF | Do not use as PixInsight input |
| `by-date/20131230-coorg-keemale-m45-pleiades/processing/attempt-01/m45-stacked.psd` | Photoshop document | Historical processing evidence only |
| `by-date/20131230-coorg-keemale-m45-pleiades/stacking/attempt-01/Autosave.tif` | Old stack output | Historical DSS stack evidence only |
| `by-date/20131230-coorg-keemale-m45-pleiades/stacking/attempt-01/Autosave.html` | Old stacking report | Use only if later troubleshooting needs DSS details |

The finished-work JPEG was copied into this project as a compressed, public-friendly documentation reference:

```text
docs/images/original-2013-finished-work.jpg
```

## What The Historical Image Shows

The old finished-work/reference image already shows:

- broad blue-gray reflection nebulosity around the main Pleiades stars,
- darker dust structure near the bright nebulosity,
- bright-star halos that are partly real target appearance and partly optical/processing behavior,
- a dark, somewhat cool background,
- enough signal to justify a modern PixInsight rerun from the raw lights.

The reference should guide review, but it is not ground truth. A modern result can be cleaner, less crushed, or less blue if that better matches the calibrated data.

## Old Calibrated Sidecars

The `good` folder contains `.cal.tif`, `.Info.txt`, and `.stackinfo.txt` files next to the CR2 lights. These appear to be old DSS-era calibrated/intermediate products and registration metadata. They are useful as evidence of the old workflow, but the modern PixInsight run should start from the CR2 lights.

## Separate Wide-Field Context

The archive also contains:

```text
by-date/20130113-yelagiri-ymca-jupiter-and-pleides
```

This folder has 13 x 10s Canon EOS 60D frames at f/1.8, with mixed ISO 1600 and 3200, plus old processing products. It is a different composition and optical setup. Keep it separate as historical/context material; do not combine it with the 2013-12-30 M45 raw frames.
