# Original 2014 Markarian Chain Processing Evidence

This note records historical local artifacts for the 2014 Markarian Chain data. Use them as references only; do not use historical TIFF/DSS products as modern PixInsight integration inputs.

## Finished-Work Search

No Markarian Chain, Virgo, M84, M86, NGC443x, or NGC447x finished-work JPEG was found under `finished-work/`.

The available historical references are local DSS stack artifacts inside the by-date target folder:

| Artifact | Notes |
| --- | --- |
| `by-date/20140303-coorg-keemale-markarian-chain/stacking/attempt-01/Autosave.tif` | DSS stack from 17 lights, 10 dark entries, no flats |
| `by-date/20140303-coorg-keemale-markarian-chain/stacking/attempt-01/Autosave.html` | DSS stack report for attempt 1 |
| `by-date/20140303-coorg-keemale-markarian-chain/stacking/attempt-02/Autosave001.tif` | DSS stack from all 19 lights, 10 dark entries, no flats |
| `by-date/20140303-coorg-keemale-markarian-chain/stacking/attempt-02/Autosave001.html` | DSS stack report for attempt 2 |

## By-Date Folder

| Archive-relative path | Contents |
| --- | --- |
| `by-date/20140303-coorg-keemale-markarian-chain/good` | 19 CR2 lights, 19 historical `.cal.tif` files, sidecar `.Info.txt` files, one `.cal.jpg` |
| `by-date/20140303-coorg-keemale-markarian-chain/framing-trials` | 3 short/mixed trial CR2 frames |
| `by-date/20140303-coorg-keemale-markarian-chain/bad/double-stars` | 1 rejected CR2 |
| `by-date/20140303-coorg-keemale-markarian-chain/bad/light` | 3 rejected CR2 |
| `by-date/20140303-coorg-keemale-markarian-chain/bad/sat-trails` | 2 rejected CR2 |
| `by-date/20140303-coorg-keemale-markarian-chain/bad/trailing-stars` | 1 rejected CR2 |
| `by-date/20140303-coorg-keemale-markarian-chain/stacking/attempt-01` | DSS `Autosave.tif` and `Autosave.html` |
| `by-date/20140303-coorg-keemale-markarian-chain/stacking/attempt-02` | DSS `Autosave001.tif` and `Autosave001.html` |

## DSS Stacking Evidence

Attempt 1 reports:

```text
Stacking mode: Standard
Alignment method: Automatic
Light frames: 17
Light exposure: 240s ISO1600
Total exposure: 1 hr 8 min
Dark frames: 10 entries, 240s ISO1600
Flats: none
Offset/bias: none
Stacking method: Kappa-Sigma, Kappa 2.00, 5 iterations
RGB channel background calibration: No
Per-channel background calibration: Yes
```

Attempt 2 reports:

```text
Stacking mode: Standard
Alignment method: Automatic
Light frames: 19
Light exposure: 240s ISO1600
Total exposure: 1 hr 16 min
Dark frames: 10 entries, 240s ISO1600
Flats: none
Offset/bias: none
Stacking method: Kappa-Sigma, Kappa 2.00, 5 iterations
RGB channel background calibration: No
Per-channel background calibration: Yes
```

The local dark directory currently contains 9 raw CR2 darks plus a historical `MasterDark_ISO1600_240s.tif`. The DSS report lists the master dark and the raw darks, which explains the 10 dark entries.

## Historical Calibrated Light Artifacts

The `good` folder contains historical calibrated TIFFs and sidecars for the 19 lights. These are useful for understanding previous processing but should not be fed into the modern WBPP run.

Only one calibrated JPEG was found:

```text
good/MARKARIAN-CHAIN_240s_1600iso_+24c_00585stdev_20140303-04h11m36s538ms.cal.jpg
```

This appears to be a per-frame artifact, not a final target image.

## Modern Implications

1. The all-19-light DSS attempt confirms that the full `good` folder was considered usable historically.
2. The old no-flats stack suggests the first modern baseline can be dark-calibrated with no flats.
3. The historical dark support is small, so a no-dark/no-flats control should stay close behind the primary branch.
4. The same-trip flat folder explicitly names Markarian, but no old DSS attempt used flats, so the flat set remains diagnostic.
5. Historical `.cal.tif`, `Autosave.tif`, and sidecars are references only; the modern integration should start from raw CR2 lights.
