# RC Astro Plugin Workflow

This repo now has licensed StarXTerminator, NoiseXTerminator, and BlurXTerminator available in PixInsight. Use this page as the shared default for new targets and for reprocessing older projects. Target-specific docs should still record the exact branch, settings, and acceptance/rejection reasons.

## Installed Tools

| Tool | Primary role | Default stage |
| --- | --- | --- |
| BlurXTerminator | Linear deconvolution, PSF/aberration correction, star and nonstellar sharpening | Phase 2, before noise reduction |
| NoiseXTerminator | Linear or nonlinear denoise, with color/frequency separation when useful | Phase 2 after deconvolution, before stretch |
| StarXTerminator | Starless/stars separation for presentation control | Phase 3 after stretch |

## Default Phase Order

For normal broadband RGB/DSLR targets:

1. WBPP integration.
2. Conservative ABE/DBE/MGC background correction.
3. Optional BlurXTerminator Correct Only diagnostic on linear data when star shapes or color calibration may benefit.
4. Plate solve after any Correct Only pass that may move stellar centroids.
5. SPCC with target/camera-appropriate filters.
6. BlurXTerminator detail pass on linear data, modest settings first.
7. NoiseXTerminator on linear data after BXT and before stretch.
8. Light SCNR or residual color cleanup only if still needed.
9. Conservative stretch.
10. StarXTerminator only when starless/star recombination is useful for the target.
11. Target-specific nonlinear polish, crop, TIFF/JPEG exports, and review.

If the branch is a comparison against older stock-only results, keep the old MLT/no-plugin branch intact and create a clearly named BXT/NXT branch instead of overwriting it.

## Guardrails

- All visible sky content must come from the user's captured data or layers derived from it. StarXTerminator recombination may only add back the actual extracted stars; do not draw artificial stars, diffraction spikes, nebulosity, background texture, or other decorative sky detail.
- BlurXTerminator AI4 requires linear input. Do not run it on already stretched review JPEG/XISF products.
- Do not apply noise reduction before BlurXTerminator or any other deconvolution step.
- Do not remove stars before BlurXTerminator unless using a deliberate manual-PSF workflow.
- Use modest BXT settings first. Watch for dark halos, brittle stars, sharpened noise, invented-looking filaments, and over-hardened galaxy cores.
- Use modest NXT settings first. Watch for plastic sky, smudged dust lanes, erased IFN, and large-scale blotch removal that also removes real low-surface-brightness signal.
- Compare close crops, not only whole-frame previews. Check representative background, the target core, faint outer structure, and medium-bright stars.
- If close crops show the same fixed-pattern or walking-noise artifacts in both plugin and stock branches, stop tuning BXT/NXT strengths and revisit calibration/integration before judging the plugin workflow.
- For faint-dust and galaxy targets, reduce low-frequency luminance denoise before sacrificing real structure.
- For target-rich Milky Way fields, keep no-BXT/no-NXT or lower-strength diagnostics when the plugin branch changes color or texture too much.
- Record plugin use in `status.md`, `processing-journey.md`, `pipeline.md`, and the review checkpoint.

## Branch Naming

Use descriptive output subdirectories and filenames:

```text
02-linear-<dataset>-bxt-nxt
03-nonlinear-<dataset>-bxt-nxt-v1
<target>-<date>-bxt-nxt-v1.jpg
<target>-<date>-bxt-nxt-v1-tight-crop.jpg
```

Rejected branches should keep their logs and review JPEGs if they teach something important.

## Reprocessing Older Targets

When revisiting older projects:

1. Start from the best accepted Phase 2 pre-denoise or pre-stretch checkpoint when available.
2. If only a post-MLT linear image exists, consider rerunning Phase 2 from the accepted WBPP master so BXT precedes denoise.
3. Preserve the accepted historical final as a reference, not as a target to exactly match.
4. Export side-by-side review JPEGs before replacing any accepted final.
5. Update repo-level processing summaries only after the new branch is accepted or explicitly recorded as rejected.

Use the shared wrapper for the common linear retrofit step:

```powershell
& .\scripts\run-bxt-nxt-linear.ps1 `
  -ProjectDir .\projects\<target-slug> `
  -InputPath .\projects\<target-slug>\work\<accepted-linear-checkpoint>\02d-or-02c.xisf `
  -OutputSubdir 02-linear-bxt-nxt-v1 `
  -Fresh
```

Then run the existing target-specific nonlinear scripts from `work/<OutputSubdir>/02g-bxt-nxt.xisf` into a separate `03-nonlinear-*-bxt-nxt-v1` branch. For older targets, do not overwrite accepted `docs/images/` previews; add clearly named candidate images such as `<target>-bxt-nxt-v1.jpg`.

Initial retrofit settings should be target-sensitive:

| Target type | BXT stars | BXT nonstellar | NXT luminance/color | Note |
| --- | ---: | ---: | --- | --- |
| Broadband galaxy | 0.18-0.22 | 0.28-0.34 | 0.60 / 0.82 | Check dust lanes and galaxy core for over-sharpening. |
| Reflection dust | 0.14-0.16 | 0.18-0.22 | 0.55 / 0.78 | Preserve faint dust texture; avoid plastic sky. |
| Emission nebula | 0.14-0.18 | 0.20-0.24 | 0.58-0.62 / 0.80-0.82 | Watch fine filaments and star halos. |
| Dense Milky Way field | 0.12-0.16 | 0.18-0.22 | 0.52-0.58 / 0.76-0.80 | Keep a no-plugin comparison because stars dominate the visual read. |
