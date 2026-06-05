# Moon Video Stack Status

## Project State

Stopped on 2026-06-05. The AutoStakkert stacks and the first same-phase combine were not good enough to promote, so this project is parked as a documented experiment. No output from this project is accepted as a final or presentation candidate.

## Inputs Found

The local Moon-video search staged 22 videos from the astronomy archive. Archive-relative source buckets:

- `by-date/20140202-bangalore-crescent-moon/byeos-planetary`: 7 videos, 1056 x 704, crescent Moon.
- `by-date/20230213-bangalore-moon-video/planetary`: 1 video, 1056 x 704, different phase.
- `videos/originals/20120530-moon-planetary`: 4 videos, mostly 1024 x 680.
- `videos/originals/20120531-moon-planetary`: 7 videos, including 6 at 1056 x 704.
- `videos/originals/20120601-moon`: 3 videos, 1280 x 720 and 1920 x 1080.

The initial collection included multiple Moon phases and resolutions. Future work should choose a single date/phase before opening AutoStakkert.

## Processing Log

- Added `scripts/prepare-autostakkert-batch.ps1` to stage lunar/planetary videos for AutoStakkert, generate `source-map.csv`, and optionally configure/launch AutoStakkert.
- Added optional `.env.example` entries for `PI_AUTOSTAKKERT_EXE` and `PI_AUTOSTAKKERT_WORK_DIR`.
- Staged a working set under `work/autostakkert/20260605-080829`.
- Limited AutoStakkert processing to the 1056 x 704 clips after AS reported MJPG/frame-load trouble and the mixed-resolution set made file selection confusing.
- AutoStakkert produced per-clip stacks at `P10`, `P25`, and `P50`.
- Review grouping separated the AS outputs into:
  - `2014-02-02-crescent-1056x704`: 7 clips, 21 stacked TIFs.
  - `2012-05-31-moon-1056x704`: 6 clips, 18 stacked TIFs.
  - `2023-02-13-moon-1056x704`: 1 clip, 3 stacked TIFs.
- A first same-phase combine used the 2014-02-02 `P25` outputs:
  - 7 per-clip stacks were translation-aligned.
  - The aligned stacks were averaged into a cropped master TIF and sharpened JPEG preview under the ignored `work/` tree.
  - Visual result was not acceptable, so it was not promoted.

## Current Outputs

All generated products are local-only and ignored by git:

- `work/autostakkert/20260605-080829/source-map.csv`
- `work/autostakkert/20260605-080829/input-1056x704/AS_P10`
- `work/autostakkert/20260605-080829/input-1056x704/AS_P25`
- `work/autostakkert/20260605-080829/input-1056x704/AS_P50`
- `work/autostakkert/20260605-080829/post-as-review`
- `work/autostakkert/20260605-080829/combined/2014-02-02-crescent-1056x704/P25/final-candidate`

Treat these as diagnostics only.

## Resume Notes

- Start with one date/phase only; do not batch different Moon phases together.
- Prefer a fresh AutoStakkert pass on the best same-day clips rather than trying to rescue the current combine.
- If using the 2014 crescent set again, inspect single-clip `P10`, `P25`, and `P50` stacks before combining. One clean per-clip stack may be more useful than an averaged seven-clip result.
- Keep generated TIF/JPG products under `work/`; do not commit them.
