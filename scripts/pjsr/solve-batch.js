// Batch plate-solve a list of images with PixInsight ImageSolver.
// Usage:
//   -r=solve-batch.js,list=<txt>,outDir=<dir>,ra=<deg>,dec=<deg>,focal=<mm>,pixel=<um>,log=<path>

#engine v8
#define USE_SOLVER_LIBRARY true
#define SETTINGS_MODULE "SOLVER_BATCH"
#include "C:/Program Files/PixInsight/src/scripts/ImageSolver/ImageSolver.js"

function arg( name, def )
{
   for ( let i = 0; i < jsArguments.length; ++i )
   {
      let eq = jsArguments[i].indexOf( "=" );
      if ( eq > 0 && jsArguments[i].substring( 0, eq ) == name )
         return jsArguments[i].substring( eq + 1 );
   }
   return def;
}

function numberArg( name, def )
{
   let v = arg( name, "" );
   return v === "" ? def : Number( v );
}

function ensureDir( dir )
{
   if ( !File.directoryExists( dir ) )
      File.createDirectory( dir, true );
}

var logPath = arg( "log", "work/logs/solve-batch-pjsr.log" );
var f = new File;
f.createForWriting( logPath );

function log( s )
{
   f.outTextLn( new Date().toISOString() + " " + s );
   f.flush();
   console.noteln( s );
}

function readList( path )
{
   return File.readTextFile( path ).split( /\r?\n/ ).map( function( s )
   {
      return s.trim();
   } ).filter( function( s )
   {
      return s.length > 0 && s[0] != "#";
   } );
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

      log( "Target star limiter: selected " + selected.length +
           " of " + this.starTree.objects.length +
           " stars" );
   };
}

function solveOne( inFile, outFile, cfg )
{
   if ( File.exists( outFile ) )
   {
      log( "SKIP existing " + outFile );
      return true;
   }

   let windows = [];
   try
   {
      log( "OPEN " + inFile );
      windows = ImageWindow.open( inFile );
      if ( windows.length == 0 )
         throw new Error( "Open failed" );

      let mainWin = windows[0];
      log( "IMAGE " + mainWin.mainView.image.width + "x" + mainWin.mainView.image.height );

      let solver = new ImageSolver();
      solver.initialize( mainWin, false /*prioritizeSettings*/ );

      solver.metadata.ra              = cfg.ra;
      solver.metadata.dec             = cfg.dec;
      solver.metadata.focal           = cfg.focal;
      solver.metadata.xpixsz          = cfg.pixel;
      solver.metadata.referenceSystem = "ICRS";
      solver.metadata.useFocal        = true;
      solver.metadata.topocentric     = false;
      solver.metadata.mightBeApparent = false;
      solver.metadata.width           = mainWin.mainView.image.width;
      solver.metadata.height          = mainWin.mainView.image.height;
      solver.metadata.resolution      = solver.metadata.ResolutionFromFocal( cfg.focal );

      solver.solverCfg.useActive            = true;
      solver.solverCfg.files                = [];
      solver.solverCfg.catalogMode          = CatalogMode.Automatic;
      solver.solverCfg.vizierServer         = "https://vizier.cds.unistra.fr/";
      solver.solverCfg.structureLayers      = 5;
      solver.solverCfg.minStructureSize     = 0;
      solver.solverCfg.hotPixelFilterRadius = 1;
      solver.solverCfg.noiseReductionFilterRadius = 0;
      solver.solverCfg.sensitivity          = 0.3;
      solver.solverCfg.peakResponse         = 0.5;
      solver.solverCfg.brightThreshold      = 1.5;
      solver.solverCfg.maxStarDistortion    = 0.6;
      solver.solverCfg.autoPSF              = false;
      solver.solverCfg.generateErrorImg     = false;
      solver.solverCfg.showStars            = false;
      solver.solverCfg.catalog              = "PPMXL";
      solver.solverCfg.autoMagnitude        = false;
      solver.solverCfg.magnitude            = cfg.magnitude;
      solver.solverCfg.showStarMatches      = false;
      solver.solverCfg.showSimplifiedSurfaces = false;
      solver.solverCfg.showDistortion       = false;
      solver.solverCfg.distortionCorrection = true;
      solver.solverCfg.rbfType              = WCS_DEFAULT_RBF_TYPE;
      solver.solverCfg.maxSplinePoints      = WCS_DEFAULT_MAX_SPLINE_POINTS;
      solver.solverCfg.splineOrder          = 3;
      solver.solverCfg.splineSmoothing      = 0.005;
      solver.solverCfg.enableSimplifier     = true;
      solver.solverCfg.simplifierRejectFraction = 0.10;
      solver.solverCfg.outlierDetectionRadius = 160;
      solver.solverCfg.outlierDetectionMinThreshold = 4.0;
      solver.solverCfg.outlierDetectionSigma = 5.0;
      solver.solverCfg.generateDistortModel = false;
      solver.solverCfg.projection           = 1;
      solver.solverCfg.projectionOriginMode = 0;
      solver.solverCfg.restrictToHQStars    = true;
      solver.solverCfg.intersectionMode     = IntersectionMode.Automatic;
      solver.solverCfg.tryApparentCoordinates = true;
      solver.solverCfg.tryExhaustiveInitialAlignment = true;

      log( "SOLVE seed RA=" + cfg.ra + " Dec=" + cfg.dec +
           " focal=" + cfg.focal + " pixel=" + cfg.pixel +
           " mag=" + cfg.magnitude );
      solver.solveImage( mainWin );
      solver.metadata.SaveParameters();
      log( "SOLVED " + mainWin.astrometricSolutionSummary().trim().split( "\n" )[0] );

      if ( File.exists( outFile ) )
         File.remove( outFile );
      if ( !mainWin.saveAs( outFile, false, false, false, false ) )
         throw new Error( "saveAs failed" );

      log( "SAVED " + outFile );
      return true;
   }
   catch ( e )
   {
      log( "FAILED " + inFile + " :: " + e );
      if ( e.stack )
         log( "STACK " + e.stack );
      return false;
   }
   finally
   {
      for ( let i = 0; i < windows.length; ++i )
         if ( windows[i] && !windows[i].isNull )
            windows[i].forceClose();
   }
}

try
{
   let listPath = arg( "list", "" );
   let outDir = arg( "outDir", "" );
   if ( !listPath || !outDir )
      throw new Error( "Missing list or outDir argument" );
   ensureDir( outDir );

   let cfg = {
      ra: numberArg( "ra", 102.75695 ),
      dec: numberArg( "dec", -22.93256 ),
      focal: numberArg( "focal", 50 ),
      pixel: numberArg( "pixel", 4.31 ),
      magnitude: numberArg( "magnitude", 8.5 ),
      targetMax: numberArg( "targetMax", 1800 ),
      maxBox: numberArg( "maxBox", 70 )
   };
   installTargetStarLimiter( cfg.targetMax, cfg.maxBox );

   let files = readList( listPath );
   log( "Batch solve: files=" + files.length + " outDir=" + outDir );

   let ok = 0;
   for ( let i = 0; i < files.length; ++i )
   {
      let outFile = outDir + "/" + File.extractName( files[i] ) + "_solved.xisf";
      log( "FILE " + (i+1) + "/" + files.length );
      if ( solveOne( files[i], outFile, cfg ) )
         ++ok;
   }
   log( "DONE solved=" + ok + " failed=" + (files.length - ok) );
   if ( ok == 0 )
      throw new Error( "No images solved" );
}
catch ( e )
{
   log( "EXCEPTION " + e );
   if ( e.stack )
      log( "STACK " + e.stack );
}

f.close();
