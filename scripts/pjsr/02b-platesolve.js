// Phase 2b — Plate-solve via ImageSolver (library mode)
// Adds WCS astrometric metadata to the image (needed for SPCC).
// Usage: -r=02b-platesolve.js,input=<path>,output=<path>
//
// Tuned for the solved M31 / Canon 60D / ED80 setup. Earlier notes assumed a
// 50 mm lens, but the solved field is 3.3 x 2.2 degrees, equivalent to ~386 mm.

#engine v8
#define USE_SOLVER_LIBRARY true
#define SETTINGS_MODULE "SOLVER"
#include "C:/Program Files/PixInsight/src/scripts/ImageSolver/ImageSolver.js"

function bootstrapArg( name )
{
   for ( let i = 0; i < jsArguments.length; ++i )
   {
      let eq = jsArguments[i].indexOf( "=" );
      if ( eq > 0 && jsArguments[i].substring( 0, eq ) == name )
         return jsArguments[i].substring( eq + 1 );
   }
   return null;
}

var __log__ = bootstrapArg( "log" );
if ( !__log__ )
   __log__ = "work/logs/phase2b-pjsr.log";
var __f__ = new File;
__f__.createForWriting( __log__ );

function logMsg( msg )
{
   __f__.outTextLn( new Date().toISOString() + " " + msg );
   __f__.flush();
   console.noteln( msg );
}

function getArg( name )
{
   for ( let i = 0; i < jsArguments.length; ++i )
   {
      let eq = jsArguments[ i ].indexOf( "=" );
      if ( eq > 0 && jsArguments[ i ].substring( 0, eq ) == name )
         return jsArguments[ i ].substring( eq + 1 );
   }
   return null;
}

function numberArg( name, defaultValue )
{
   let v = getArg( name );
   return v == null ? defaultValue : Number( v );
}

function installTargetStarLimiter( maxStars, maxBoxSize )
{
   ImageSolver.prototype.generateTargetStarsCSVFile = function( window )
   {
      let selected = this.starTree.objects.slice();
      selected = selected.filter( function( o )
      {
         if ( o.rect )
         {
            let bw = o.rect.x1 - o.rect.x0;
            let bh = o.rect.y1 - o.rect.y0;
            if ( bw > maxBoxSize || bh > maxBoxSize )
               return false;
         }
         return true;
      } );
      selected.sort( function( a, b )
      {
         return ((b.flux !== undefined) ? b.flux : 0) -
                ((a.flux !== undefined) ? a.flux : 0);
      } );
      if ( selected.length > maxStars )
         selected = selected.slice( 0, maxStars );

      let lines = [];
      lines.push( format( "%d,%d", window.width, window.height ) );
      for ( let i = 0; i < selected.length; ++i )
      {
         let o = selected[i];
         lines.push( format( "%.4f,%.4f,%.3e", o.x, o.y,
                             (o.flux !== undefined) ? o.flux : 1 ) );
      }
      File.writeTextFile( ImageSolver.starsCSVFilePath( true/*isTarget*/ ),
                          String.newLineSeparated( lines ) + '\n' );

      logMsg( "Target star limiter: selected " + selected.length +
              " of " + this.starTree.objects.length +
              " stars (maxStars=" + maxStars +
              ", maxBoxSize=" + maxBoxSize + ")" );
   };
}

try
{
   logMsg( "=== Phase 2b: plate-solve starting ===" );

   let inFile  = getArg( "input" );
   let outFile = getArg( "output" );
   let limitTargetStars = numberArg( "targetMax", 2500 );
   let maxTargetBoxSize = numberArg( "maxBox", 85 );
   let limitMagnitude = numberArg( "magnitude", 9.5 );
   logMsg( "input  = " + inFile );
   logMsg( "output = " + outFile );

   if ( !inFile || !outFile )
      throw new Error( "Missing input or output argument" );

   if ( File.exists( outFile ) )
   {
      logMsg( "[CACHED] output already exists, skipping" );
   }
   else
   {
      logMsg( "Opening " + inFile );
      let windows = ImageWindow.open( inFile );
      if ( windows.length == 0 ) throw new Error( "Open failed" );
      let mainWin = windows[ 0 ];
      logMsg( "Image: " + mainWin.mainView.image.width + "x" + mainWin.mainView.image.height );

      // M31 target parameters
      const RA_M31  = 10.6843;   // 00h 42m 44.3s in degrees
      const DEC_M31 = 41.2691;   // +41° 16' 09"
      const FOCAL_MM = numberArg( "focal", 386 );
      const PIXSZ_UM = numberArg( "pixel", 4.31 );     // Canon EOS 60D

      logMsg( "Building ImageSolver..." );
      let solver = new ImageSolver();

      // Initialize first. ImageSolver.initialize() loads persisted PixInsight
      // settings and parameters, so seed metadata assigned before this call can
      // be silently overwritten by stale GUI state.
      logMsg( "Initializing solver..." );
      solver.initialize( mainWin, false /*prioritizeSettings*/ );

      // Now force the known M31 / Canon 60D / ED80 seed.
      solver.metadata.ra              = RA_M31;
      solver.metadata.dec             = DEC_M31;
      solver.metadata.focal           = FOCAL_MM;
      solver.metadata.xpixsz          = PIXSZ_UM;
      solver.metadata.referenceSystem = "ICRS";
      solver.metadata.useFocal        = true;
      solver.metadata.topocentric     = false;
      solver.metadata.mightBeApparent = false;
      solver.metadata.width           = mainWin.mainView.image.width;
      solver.metadata.height          = mainWin.mainView.image.height;
      solver.metadata.resolution      = solver.metadata.ResolutionFromFocal( FOCAL_MM );
      logMsg( "Forced seed: RA=" + solver.metadata.ra +
              " deg, Dec=" + solver.metadata.dec +
              " deg, resolution=" + (solver.metadata.resolution*3600) +
              " arcsec/px" );

      // Override solverCfg defaults — based on BPP-Solver.js resetConfiguration()
      solver.solverCfg.useActive            = true;
      solver.solverCfg.files                = [];
      solver.solverCfg.catalogMode          = CatalogMode.Automatic;
      solver.solverCfg.vizierServer         = "https://vizier.cds.unistra.fr/";
      solver.solverCfg.magnitude            = 12;
      solver.solverCfg.maxIterations        = 100;
      solver.solverCfg.structureLayers      = 5;
      solver.solverCfg.minStructureSize     = 0;
      solver.solverCfg.hotPixelFilterRadius = 1;
      solver.solverCfg.noiseReductionFilterRadius = 0;
      solver.solverCfg.sensitivity          = 0.3;  // force detection on brighter cores (less coma noise)
      solver.solverCfg.peakResponse         = 0.5;
      solver.solverCfg.brightThreshold      = 1.5;  // de-emphasize saturated star halos
      solver.solverCfg.maxStarDistortion    = 0.6;
      solver.solverCfg.autoPSF              = false;
      solver.solverCfg.generateErrorImg     = false;
      solver.solverCfg.showStars            = false;
      solver.solverCfg.catalog              = "PPMXL";
      solver.solverCfg.autoMagnitude        = true;
      solver.solverCfg.showStarMatches      = false;
      solver.solverCfg.showSimplifiedSurfaces = false;
      solver.solverCfg.showDistortion       = false;
      solver.solverCfg.distortionCorrection = true;
      solver.solverCfg.rbfType              = WCS_DEFAULT_RBF_TYPE;
      solver.solverCfg.maxSplinePoints      = WCS_DEFAULT_MAX_SPLINE_POINTS;
      solver.solverCfg.splineOrder          = 3;   // research recommendation for wide-field
      solver.solverCfg.splineSmoothing      = 0.005;
      solver.solverCfg.enableSimplifier     = true;
      solver.solverCfg.simplifierRejectFraction = 0.10;
      solver.solverCfg.outlierDetectionRadius = 160;
      solver.solverCfg.outlierDetectionMinThreshold = 4.0;
      solver.solverCfg.outlierDetectionSigma = 5.0;
      solver.solverCfg.generateDistortModel = false;
      solver.solverCfg.outSuffix            = "_ast";
      solver.solverCfg.projection           = 1;   // 0=Gnomonic/TAN, 1=Stereographic.
      solver.solverCfg.projectionOriginMode = 0;
      solver.solverCfg.restrictToHQStars    = true;  // skip comatic corner stars
      solver.solverCfg.intersectionMode     = IntersectionMode.Automatic;
      solver.solverCfg.tryApparentCoordinates = true;
      solver.solverCfg.tryExhaustiveInitialAlignment = true;

      // Keep the current ImageSolver's automatic wide-field catalog selection,
      // but use a shallow manual magnitude and a compact-star target list. This
      // avoids matching thousands of faint/comatic DSLR detections against a
      // dense synthetic field during the fragile initial alignment stage.
      solver.solverCfg.catalogMode = CatalogMode.Automatic;
      solver.solverCfg.autoMagnitude = false;
      solver.solverCfg.magnitude = limitMagnitude;

      logMsg( "Solver config: projection=" + solver.solverCfg.projection +
              ", distortionCorrection=" + solver.solverCfg.distortionCorrection +
              ", restrictToHQStars=" + solver.solverCfg.restrictToHQStars +
              ", autoMagnitude=" + solver.solverCfg.autoMagnitude +
              ", catalogMode=" + solver.solverCfg.catalogMode +
              ", magnitude=" + solver.solverCfg.magnitude );

      installTargetStarLimiter( limitTargetStars, maxTargetBoxSize );

      logMsg( "Calling solver.solveImage()..." );
      solver.solveImage( mainWin );    // throws on failure
      logMsg( "Solved! Saving WCS to image..." );
      solver.metadata.SaveParameters();

      logMsg( "WCS summary:" );
      logMsg( mainWin.astrometricSolutionSummary().trim() );

      logMsg( "Saving to " + outFile );
      let saveOk = mainWin.saveAs( outFile, false, false, false, false );
      if ( !saveOk ) throw new Error( "saveAs failed" );

      for ( let i = 0; i < windows.length; ++i )
         windows[ i ].forceClose();

      logMsg( "=== Phase 2b complete ===" );
   }
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack ) logMsg( "STACK: " + e.stack );
}

__f__.close();
