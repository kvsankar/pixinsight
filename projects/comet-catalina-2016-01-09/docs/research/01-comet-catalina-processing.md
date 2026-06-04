# Comet Catalina C/2013 US10 Processing Research

## Object Facts

- Target: Comet Catalina, official designation `C/2013 US10 (Catalina)`.
- Discovery/history: JPL CNEOS notes that 2013 US10 was initially reported as a large near-Earth asteroid, then new observations showed cometary activity and the object was designated `C/2013 US10 (Catalina)`.
- Orbit class: JPL SBDB currently lists it as a hyperbolic comet with perihelion distance `q = 0.823 au`, inclination about `149 deg`, and comet total magnitude parameter `M1 = 8.5`.
- Perihelion: JPL Horizons gives perihelion on 2015-Nov-15.7216418288 TDB.
- Apparition context: NASA APOD described Catalina as a predawn object near Arcturus at the start of 2016, with separated dust and ion tails, and noted its closest Earth approach on 2016-Jan-17 at about 110 million km.

Sources:

- JPL CNEOS news: <https://cneos.jpl.nasa.gov/news/news181a.html>
- JPL SBDB API query used on 2026-06-04: <https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=C%2F2013%20US10&ca-data=true&ca-body=Earth&ca-time=both&phys-par=true>
- JPL Horizons API: <https://ssd.jpl.nasa.gov/api/horizons.api>
- NASA APOD 2016-01-01: <https://apod.nasa.gov/apod/ap160101.html>
- PixInsight CometAlignment reference documentation: <https://pixinsight.com/doc/tools/CometAlignment/CometAlignment.html>
- PixInsight C/2022 E3 processing example: <https://pixinsight.com/examples/C2022-E3-ZTF/>

## Ephemeris Seed

The capture timestamps in the CR2 files do not record a timezone. Because the archive site is in India and the filename times look like early-morning local observing times, the first plan should treat the 2016-01-09 `04h16m` to `05h14m` T1i sequence as likely IST, then verify before using CometAlignment or ephemeris interpolation.

JPL Horizons geocentric ephemeris for `C/2013 US10`:

| Assumption | Approximate time span | RA/Dec seed |
| --- | --- | --- |
| Camera clock was IST | 2016-01-08 22:46 to 23:44 UTC | about RA `14h07m25s`, Dec `+34d07m` |
| Camera clock was UTC | 2016-01-09 04:16 to 05:14 UTC | about RA `14h07m07s`, Dec `+34d40m` |

The difference is small enough for a wide field but large enough to matter for a tight solve or comet path check. The first solve should use a generous search radius and should record the solved field center before any target-aligned branch is accepted.

Horizons rates near 2016-01-08 23:00 UTC were approximately `-40.6 arcsec/hour` in RA*cos(Dec) and `+343 arcsec/hour` in Dec. Over the historical 12 minute T1i stack this is roughly one arcminute of comet motion; over a longer 60D sequence it is several arcminutes. A star-aligned integration can keep stars clean but will soften or smear the comet head and tail.

## PixInsight Comet Workflow Implications

PixInsight's CometAlignment documentation says comet/asteroid motion is non-negligible, so a star-aligned integration will blur the moving object. It recommends star registration first when possible, because CometAlignment applies a nucleus-referenced translation and expects no remaining rotation or scale change. It also requires accurate acquisition time metadata from XISF `Observation:Time:Start` or FITS `DATE-OBS`; files without valid times cannot be used.

PixInsight's official C/2022 E3 processing example reinforces the same separation of concerns: calibrated subframes, comet/target alignment, and color calibration need to be planned as distinct steps, especially when the moving target and the star field cannot both be clean in one integration. SPCC is still the best color baseline for the star-aligned branch because it uses Gaia DR3/SP spectra and the actual RGB filter responses, but a comet-aligned product needs documented color transfer or a separate, defensible color-calibration plan.

For this repo:

- Keep a star-aligned branch for WCS, SPCC/PCC, star colors, and background judgment.
- Build any comet-aligned branch from calibrated/debayered/star-registered frames, preserving acquisition times.
- Define at least first and last comet nucleus positions; use the historical DSS `Comet = x, y` values as a sanity check, not as final measurements.
- Integrate the comet-aligned frames with rejection settings tuned for star trails. With only 5-6 likely primary frames, star rejection may be imperfect.
- Do not clone out star trails or paint missing background. If star trails remain, either accept them as a data limitation or recombine with a stars-only layer derived from the same frames.
- Use the star-aligned branch for color calibration and transfer color balance to the comet-aligned branch only by a documented PixelMath/linear-fit method.

## Color And Structure To Protect

Real signals expected in this data:

- Green/cyan coma around the nucleus.
- Faint dust tail or fan, likely broad and low contrast.
- Possible ion-tail direction, but the local historical JPEG mainly shows a compact green coma and very faint tail signal.
- Dense background stars and possible small galaxies in the field.

Processing risks:

- Global SCNR can erase real green coma signal.
- ABE/DBE can subtract faint tail as background if samples are placed too close to the comet or along the tail.
- BlurXTerminator can harden the nucleus/coma or create brittle-looking tail texture. Keep a stock/no-BXT diagnostic before using BXT on comet-aligned data.
- NoiseXTerminator can erase faint tail structure. Use mild settings and review crops around the coma, tail, clean sky, and star-trail zones.
- StarXTerminator may be useful only as a layer tool after stretch or as a diagnostic; any star layer must come from the user's actual frames.

## Presentation And Historical-Reference Findings

The 2016 human edit is significantly better than the first 2026 SPCC/STF diagnostic as a presentation image. It has a darker, more controlled sky, a tighter comet head, less obvious background/chroma noise, warmer and more varied star color, and better restraint around the broad green halo. The modern diagnostic is more traceable and color-calibrated, but it is not finished: its linked-STF stretch lifts gradients/noise, makes the coma look bloated, and makes the green/cyan signal read garish instead of cometary.

Processing implication:

- Do not judge the project by raw linked-STF or SPCC preview color.
- Use the no-flat star-aligned SPCC branch as the clean color baseline.
- Use the no-flat comet-aligned branch as a structure diagnostic, not a standalone presentation candidate yet.
- Build the next branch as a historical-style presentation candidate: darker sky, restrained halos, protected green/cyan coma, preserved faint fan/tail, and no broad SCNR.
- If a later comet-plus-stars composite is attempted, every layer must come from this same Catalina data and the recombination formula must be recorded.

## Dataset-Specific Takeaways

- The likely primary historical input is the T1i `originals/good/star-tracking` group: 6 x 120 s ISO1600, temperatures +25 C to +29 C, unknown focal length, 4752 x 3168.
- The archive also contains one 60D 120 s frame in the same `star-tracking` folder, two 60D 300 s star-tracking frames, twelve uncategorized 60D 120 s frames from the previous morning, and one 60D 300 s comet-tracking frame. These should be diagnostic/support data, not raw-combined with T1i frames.
- The same-date flats include 34 curated T1i flats at 1/125 s ISO1600. No matching T1i dark library was found in the local dark archive search.
- 60D dark candidates exist for 120 s ISO1600 at +33 C to +36 C, but they are warmer than the +23 C to +29 C 60D lights and should only be a diagnostic.
- The historical DSS logs used no darks, and either no flats or 34 flats, with "align on stars and comet." That is evidence for the old result, not a reason to skip modern controls.

## First Review Questions

- Does the T1i 6-frame set solve cleanly, and what focal length/scale does it report?
- Are the 34 T1i flats helpful, or do they overcorrect due missing bias/dark-flat support?
- Can a comet-aligned integration from 5-6 T1i frames reject stars acceptably, or is a star-aligned historical-style composite technically safer?
- Is the 60D data a separate wide-field diagnostic, or does it have a usable overlap/support role after independent inspection?
- Should the first accepted branch prioritize a clean star field with a slightly softened comet, or a sharper comet with documented star-trail compromises?
