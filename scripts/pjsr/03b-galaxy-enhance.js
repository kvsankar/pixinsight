// Phase 3b — Masked galaxy enhancement: range mask, HDRMT, LHE, Curves
// Usage: -r=03b-galaxy-enhance.js,input=<path>,output=<path>,maskdir=<path>

#engine v8

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
   __log__ = "work/logs/phase3b-enhance-pjsr.log";
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
      let eq = jsArguments[i].indexOf( "=" );
      if ( eq > 0 && jsArguments[i].substring( 0, eq ) == name )
         return jsArguments[i].substring( eq + 1 );
   }
   return null;
}

function windowIds()
{
   let ids = {};
   let windows = ImageWindow.windows;
   for ( let i = 0; i < windows.length; ++i )
      ids[windows[i].mainView.id] = true;
   return ids;
}

function findNewWindow( before )
{
   let windows = ImageWindow.windows;
   for ( let i = 0; i < windows.length; ++i )
      if ( !before[windows[i].mainView.id] )
         return windows[i];
   return null;
}

try
{
   logMsg( "=== Phase 3b: galaxy enhancement starting ===" );

   let inFile = getArg( "input" );
   let outFile = getArg( "output" );
   let maskDir = getArg( "maskdir" );
   if ( !maskDir )
      maskDir = "work/03-nonlinear/masks";
   logMsg( "input  = " + inFile );
   logMsg( "output = " + outFile );
   logMsg( "maskdir = " + maskDir );

   if ( !inFile || !outFile )
      throw new Error( "Missing input or output argument" );
   if ( !File.directoryExists( maskDir ) )
      File.createDirectory( maskDir );

   if ( File.exists( outFile ) )
   {
      logMsg( "[CACHED] output exists, skipping" );
   }
   else
   {
      let windows = ImageWindow.open( inFile );
      if ( windows.length == 0 )
         throw new Error( "Open failed" );

      let mainWin = windows[0];
      let view = mainWin.mainView;
      logMsg( "Image: " + view.image.width + "x" + view.image.height +
              ", channels=" + view.image.numberOfChannels );

      logMsg( "Generating galaxy range mask..." );
      let beforeRange = windowIds();
      let RS = new RangeSelection;
      RS.lowRange = 0.055;
      RS.highRange = 1.000;
      RS.fuzziness = 0.120;
      RS.smoothness = 5.000;
      RS.toLightness = true;
      RS.invert = false;
      RS.screening = false;
      let rsOk = RS.executeOn( view );
      logMsg( "RangeSelection returned: " + rsOk );
      let rangeWin = findNewWindow( beforeRange );
      if ( !rangeWin )
         throw new Error( "RangeSelection did not create a mask window" );
      let rangePath = maskDir + "/03b-galaxy-range-mask.xisf";
      rangeWin.saveAs( rangePath, false, false, false, false );
      logMsg( "Saved range mask: " + rangePath );

      mainWin.setMask( rangeWin, false );
      mainWin.maskEnabled = true;
      mainWin.maskInverted = false;
      mainWin.maskVisible = false;

      logMsg( "Applying HDRMultiscaleTransform..." );
      let HDR = new HDRMultiscaleTransform;
      HDR.numberOfLayers = 10;
      HDR.numberOfIterations = 1;
      HDR.toLightness = true;
      HDR.toLuminanceOnly = false;
      HDR.toIntensity = false;
      HDR.lightnessMask = true;
      HDR.luminanceMask = false;
      HDR.preserveHue = true;
      HDR.overdrive = 0.0;
      HDR.medianTransform = false;
      HDR.deringing = false;
      let hdrOk = HDR.executeOn( view );
      logMsg( "HDRMT returned: " + hdrOk );
      if ( !hdrOk )
         throw new Error( "HDRMT failed" );

      logMsg( "Applying LHE pass 1..." );
      let LHE1 = new LocalHistogramEqualization;
      LHE1.radius = 40;
      LHE1.slopeLimit = 1.5;
      LHE1.amount = 0.25;
      LHE1.histogramBins = 0;
      LHE1.circularKernel = true;
      let lhe1Ok = LHE1.executeOn( view );
      logMsg( "LHE1 returned: " + lhe1Ok );
      if ( !lhe1Ok )
         throw new Error( "LHE pass 1 failed" );

      logMsg( "Applying LHE pass 2..." );
      let LHE2 = new LocalHistogramEqualization;
      LHE2.radius = 150;
      LHE2.slopeLimit = 1.5;
      LHE2.amount = 0.30;
      LHE2.histogramBins = 0;
      LHE2.circularKernel = true;
      let lhe2Ok = LHE2.executeOn( view );
      logMsg( "LHE2 returned: " + lhe2Ok );
      if ( !lhe2Ok )
         throw new Error( "LHE pass 2 failed" );

      logMsg( "Applying curves..." );
      let C = new CurvesTransformation;
      C.K = [
         [0.00000, 0.00000],
         [0.25000, 0.22000],
         [0.75000, 0.80000],
         [1.00000, 1.00000]
      ];
      C.Kt = CurvesTransformation.AkimaSubsplines;
      C.S = [
         [0.00000, 0.00000],
         [0.25000, 0.30000],
         [0.50000, 0.61000],
         [0.75000, 0.84000],
         [1.00000, 1.00000]
      ];
      C.St = CurvesTransformation.AkimaSubsplines;
      let cOk = C.executeOn( view );
      logMsg( "Curves returned: " + cOk );
      if ( !cOk )
         throw new Error( "Curves failed" );

      mainWin.maskEnabled = false;
      try { mainWin.removeMask(); } catch ( e ) { logMsg( "removeMask note: " + e ); }

      logMsg( "Generating star mask for later stages..." );
      let starSource = new ImageWindow( view.image.width, view.image.height,
                                        view.image.numberOfChannels, 32, true,
                                        view.image.isColor, "star_mask_source" );
      starSource.mainView.beginProcess( UndoFlag.NoSwapFile );
      starSource.mainView.image.assign( view.image );
      starSource.mainView.endProcess();

      let flat = new HDRMultiscaleTransform;
      flat.numberOfLayers = 6;
      flat.numberOfIterations = 1;
      flat.toLightness = true;
      flat.lightnessMask = true;
      flat.executeOn( starSource.mainView );

      let beforeStar = windowIds();
      let SM = new StarMask;
      SM.noiseThreshold = 0.10;
      SM.waveletLayers = 5;
      SM.largeScaleGrowth = 2;
      SM.smallScaleGrowth = 1;
      SM.growthCompensation = 2;
      SM.smoothness = 8;
      SM.aggregateStructures = true;
      SM.midtonesBalance = 0.25;
      let smOk = SM.executeOn( starSource.mainView );
      logMsg( "StarMask returned: " + smOk );
      let starWin = findNewWindow( beforeStar );
      if ( starWin )
      {
         let starPath = maskDir + "/03b-star-mask.xisf";
         starWin.saveAs( starPath, false, false, false, false );
         logMsg( "Saved star mask: " + starPath );
      }
      else
         logMsg( "StarMask did not create a new window" );

      starSource.forceClose();

      let saveOk = mainWin.saveAs( outFile, false, false, false, false );
      logMsg( "saveAs returned: " + saveOk );
      if ( !saveOk )
         throw new Error( "saveAs failed" );

      if ( rangeWin && !rangeWin.isNull )
         rangeWin.forceClose();
      if ( starWin && !starWin.isNull )
         starWin.forceClose();
      for ( let i = 0; i < windows.length; ++i )
         windows[i].forceClose();

      logMsg( "=== Phase 3b galaxy enhancement complete ===" );
   }
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
