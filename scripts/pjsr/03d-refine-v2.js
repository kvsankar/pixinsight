// Phase 3d — v2 refinement: subtle residual green cleanup + background chroma smoothing
// Usage: -r=03d-refine-v2.js,input=<path>,output=<path>,maskdir=<path>

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
   __log__ = "work/logs/phase3d-refine-v2-pjsr.log";
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

try
{
   logMsg( "=== Phase 3d: v2 refinement starting ===" );

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

      logMsg( "Applying gentle residual green cleanup..." );
      let S = new SCNR;
      S.colorToRemove = 1;       // green
      S.amount = 0.18;           // subtle nonlinear cleanup; Phase 2 already did the main pass
      S.protectionMethod = 2;    // Average Neutral
      S.preserveLuminance = true;
      S.preserveLightness = true;
      let scnrOk = S.executeOn( view );
      logMsg( "SCNR returned: " + scnrOk );
      if ( !scnrOk )
         throw new Error( "SCNR failed" );

      let rangePath = maskDir + "/03b-galaxy-range-mask.xisf";
      let maskWindows = [];
      let rangeWin = null;
      if ( File.exists( rangePath ) )
      {
         logMsg( "Loading galaxy range mask: " + rangePath );
         maskWindows = ImageWindow.open( rangePath );
         if ( maskWindows.length == 0 )
            throw new Error( "Could not open range mask" );
         rangeWin = maskWindows[0];

         if ( rangeWin.mainView.image.width != view.image.width ||
              rangeWin.mainView.image.height != view.image.height )
            throw new Error( "Range mask dimensions do not match input image" );

         mainWin.setMask( rangeWin, false );
         mainWin.maskEnabled = true;
         mainWin.maskInverted = true; // protect galaxy; smooth background/chroma around it
         mainWin.maskVisible = false;

         logMsg( "Applying background chrominance smoothing with inverted galaxy mask..." );
      }
      else
      {
         logMsg( "Range mask missing; applying very conservative chrominance smoothing without mask." );
      }

      let MLT = new MultiscaleLinearTransform;
      MLT.layers = [
         // enabled, biasEnabled, bias, noiseReductionEnabled, threshold, amount, iterations
         [true, true, 0.000, true, 2.0000, 0.32, 1],
         [true, true, 0.000, true, 1.5000, 0.25, 1],
         [true, true, 0.000, true, 0.8000, 0.18, 1],
         [true, true, 0.000, false, 0.5000, 1.00, 1]
      ];
      MLT.transform = MultiscaleLinearTransform.StarletTransform;
      MLT.scaleDelta = 0;
      MLT.linearMask = false;
      MLT.linearMaskAmpFactor = 100;
      MLT.linearMaskSmoothness = 1.00;
      MLT.linearMaskInverted = false;
      MLT.linearMaskPreview = false;
      MLT.noiseThresholding = false;
      MLT.noiseThresholdingAmount = 1.00;
      MLT.noiseThreshold = 3.00;
      MLT.softThresholding = true;
      MLT.useMultiresolutionSupport = false;
      MLT.deringing = false;
      MLT.outputDeringingMaps = false;
      MLT.lowRange = 0.0000;
      MLT.highRange = 0.0000;
      MLT.previewMode = MultiscaleLinearTransform.Disabled;
      MLT.previewLayer = 0;
      MLT.toLuminance = false;
      MLT.toChrominance = true;
      MLT.linear = false;

      let mltOk = MLT.executeOn( view );
      logMsg( "MLT chroma smoothing returned: " + mltOk );
      if ( !mltOk )
         throw new Error( "MLT chroma smoothing failed" );

      mainWin.maskEnabled = false;
      try { mainWin.removeMask(); } catch ( e ) { logMsg( "removeMask note: " + e ); }

      let saveOk = mainWin.saveAs( outFile, false, false, false, false );
      logMsg( "saveAs returned: " + saveOk );
      if ( !saveOk )
         throw new Error( "saveAs failed" );

      for ( let i = 0; i < maskWindows.length; ++i )
         maskWindows[i].forceClose();
      for ( let i = 0; i < windows.length; ++i )
         windows[i].forceClose();

      logMsg( "=== Phase 3d v2 refinement complete ===" );
   }
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
