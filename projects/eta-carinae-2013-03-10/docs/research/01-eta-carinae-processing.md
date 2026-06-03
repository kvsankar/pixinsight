# Eta Carinae Processing Research

This note records target-specific facts and processing implications for the 2013 Eta Carinae / Carina Nebula data.

## Target Facts

- The Carina Nebula is NGC 3372 and is also known as the Eta Carinae Nebula or Great Carina Nebula.
- NASA describes NGC 3372 as a large gas-and-dust cloud containing massive, bright stars, including Eta Carinae near its heart: <https://science.nasa.gov/missions/hubble/hubbles-sparkling-new-view-of-the-carina-nebula>
- NASA's dark-cloud Carina note highlights that Eta Carinae was once among the brightest stars in the sky and then faded dramatically: <https://www.nasa.gov/image-article/dark-clouds-of-carina-nebula/>
- ESO's Carina Nebula image note emphasizes Eta Carinae's extreme luminosity and the richness of the surrounding nebula: <https://eso.org/public/images/etamosaicnm2>
- A practical solve seed can use Eta Carinae's position from SIMBAD-style coordinates: RA about 10h45m03.6s, Dec about -59d41m04s, or roughly RA 161.265 deg and Dec -59.6844 deg: <https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=Eta+Carinae>

## Processing Implications

1. This is not a blank-background galaxy field. Background correction must protect real large-scale emission and dust.
2. The Eta/Keyhole area is bright and may saturate in the 120s and 240s groups. The 30s/60s groups are valuable for highlight/core review.
3. The field is dense with stars. BXT should be conservative, with careful judge crops around bright stars and corners.
4. The target has rich red emission, dark dust, and bright star clusters. Over-denoise can erase texture; over-saturation can make the red nebulosity cartoonish.
5. Because the data has an exposure ladder, do not raw-combine all exposures before inspecting per-exposure integrations. Any HDR-style combination should be built from real integrated products derived from the user's frames.

## Initial Plan From Research

- Start with a 120s `good` no-dark/no-flats baseline because it is the largest homogeneous deep-light group.
- Test the 120s +33 C darks only after inspecting the no-dark branch.
- Keep 30s and 60s integrations as sibling branches for core/highlight protection.
- Treat 240s `good` as a depth diagnostic rather than a guaranteed input.
- Use LLM-as-judge crops for bright core, dust lanes, outer nebulosity/background transition, and corner stars.

## Mixed-Exposure / HDR Research

PixInsight has the relevant building blocks for mixed-exposure work:

- StarAlignment and ImageIntegration are core tools for registering and integrating image sets, and PixInsight lists HDRComposition as a tool for automatic high-dynamic-range linear images: <https://pixinsight.com/performance/index.html>
- PixInsight's image-weighting documentation describes weighting integrations to optimize properties such as SNR and star profile quality: <https://pixinsight.com/doc/docs/ImageWeighting/ImageWeighting.html>
- PixInsight forum guidance for mixed exposure lengths points toward separate exposure masters and HDRComposition when the goal is high dynamic range rather than a single undifferentiated stack: <https://pixinsight.com/forum/index.php?threads/wbpp-producing-multiple-master-lights-when-exposure-times-differ.21061/>

Implications for this dataset:

1. Do not raw-combine 30s, 60s, 120s, and 240s frames before evaluating them separately.
2. Integrate each exposure group as its own calibrated/registered master.
3. Use the same solved geometry/reference framing where possible so masters can be aligned cleanly for comparison and eventual composition.
4. Use long exposure masters for faint nebulosity only if they visibly improve signal after their own noise/trailing review.
5. Use 30s/60s masters only for bright Eta/Keyhole highlight recovery if the 120s/240s masters clip or bloat the core.
6. Prefer HDRComposition-style linear combination only after the separate masters have been accepted.
