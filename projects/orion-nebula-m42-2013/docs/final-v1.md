# Orion Nebula / M42 2013 - Final v1

Final v1 is the accepted 2026 PixInsight presentation result for the February 2013 Orion Nebula / M42 data.

Post-final note: later BXT/NXT v1/v2 diagnostics exist for review. BXT/NXT is now the preferred replacement direction after visual review, but this page still records the previously accepted final v1 result.

## Accepted Output

- [Final v1 JPEG](images/m42-2013-v8-presentation.jpg)
- [2013 / v7 / final v1 comparison](images/m42-2013-original-v7-v8-presentation-comparison.jpg)
- [Final v1 vs BXT/NXT v1 diagnostic](images/m42-2013-v8-vs-bxt-nxt-v1-comparison.jpg)
- [Final v1 vs BXT/NXT v1 core crop](images/m42-2013-v8-vs-bxt-nxt-v1-core-crop.jpg)
- [Final v1 vs BXT/NXT v1 sky crop](images/m42-2013-v8-vs-bxt-nxt-v1-sky-crop.jpg)
- [Final v1 vs BXT/NXT v1/v2 comparison](images/m42-2013-v8-vs-bxt-nxt-v1-v2-comparison.jpg)
- [Final v1 vs BXT/NXT v1/v2 core crop](images/m42-2013-v8-vs-bxt-nxt-v1-v2-core-crop.jpg)
- [Final v1 vs BXT/NXT v1/v2 sky crop](images/m42-2013-v8-vs-bxt-nxt-v1-v2-sky-crop.jpg)

The final PixInsight work products are under the ignored project `work/` directory:

- `work/03-nonlinear-2013-m42-180s-noflats-v1/03m-m42-v8-presentation.xisf`
- `work/03-nonlinear-2013-m42-180s-noflats-v1/m42-2013-v8-presentation.tif`

## Selected Data

The accepted result uses the February 2013 M42/M43/Running Man data from the Canon EOS 60D and Canon EF 70-200 mm f/2.8L IS II USM at the published 200 mm f/3.5 setting.

Primary image base:

- 31 x 180s ISO 1600 lights
- 9 x 180s ISO 1600 darks at about 33 C
- no flats in the selected baseline branch

Faint-nebulosity support:

- 20 x 300s ISO 1600 lights
- no matching 300s darks found
- historical flat candidate tested, then the registered 300s linear product was used only as conservative faint-support signal

Rejected or diagnostic-only support:

- 60s frames were too sparse and mixed to support a clean Trapezium replacement.
- The single 120s frame was not enough for integration.
- January 2013 wide-field Orion data remains a separate possible context branch.
- December 2013 ES ED80 trial frames remain excluded from this M42 result.

## Processing Summary

1. Ran separate WBPP branches for 180s, 300s, and 60s diagnostic groups.
2. Compared 180s flat-calibrated and no-flats branches through identical Phase 2 linear processing.
3. Selected the 180s no-flats branch because it preserved more M42/M43 outer structure after the same linear treatment.
4. Plate solved the selected branches at about 193 mm effective focal length and 4.60 arcsec/px, confirming the published 200 mm acquisition setting as directionally correct while using solved scale for processing notes.
5. Ran SPCC with Canon EOS 60D filters, SCNR, and conservative linear noise reduction.
6. Created a conservative MaskedStretch nonlinear base.
7. Built M42-specific nonlinear polish with core masking, HDRMultiscaleTransform, mild LocalHistogramEqualization, highlight compression/desaturation, and controlled crop/export.
8. Iterated v3 through v7 based on visual feedback about the core, crop, color, and contrast.
9. Built final v1 from the v8 branch:
   - crop adjusted to `centerY=0.585`
   - richer 180s field processing
   - quieter 180s core variant blended into the bright center
   - registered 300s layer blended only as protected, brighten-only faint-nebulosity support
   - final presentation with lighter black point and faint-nebulosity lift

## Caveats

- The bright M42 core/Trapezium is better controlled than the historical 2013 JPEG, but this is not a true Trapezium recovery. Representative raw frames show clipped core pixels, and the available short exposures are too sparse for a clean HDR replacement.
- The 300s support layer restores more broad surrounding haze, but it also brings some background texture and residual gradient/noise. Final v1 accepts that tradeoff because it better matches the desired background-nebulosity presentation.
- The f/2.8 historical flats did not become the selected main baseline for the 180s image, because the no-flats branch preserved more useful outer structure after linear treatment.

## Human Feedback Incorporated

- The original v6 crop placed the nebula too high in the frame.
- v7 improved crop/color/contrast but became too conservative on background nebulosity.
- Final v1 accepts the v8 balance: slightly revised crop, more faint surrounding haze, and controlled core behavior.
