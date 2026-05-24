// Phase 2c — SpectrophotometricColorCalibration
// Requires a solved image from Phase 2b.
// Usage: -r=02c-spcc.js,input=<path>,output=<path>

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
   __log__ = "work/logs/phase2c-spcc-pjsr.log";
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
   logMsg( "=== Phase 2c: SPCC starting ===" );

   let inFile = getArg( "input" );
   let outFile = getArg( "output" );
   logMsg( "input  = " + inFile );
   logMsg( "output = " + outFile );

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
      let w = view.image.width, h = view.image.height;
      logMsg( "Image: " + w + "x" + h );
      logMsg( "Astrometric summary:" );
      logMsg( mainWin.astrometricSolutionSummary().trim() );

      // Clean sky ROI in the upper-right corner, avoiding M31/M110.
      let bgRect = new Rect(
         Math.floor( w * 0.84 ), Math.floor( h * 0.05 ),
         Math.floor( w * 0.98 ), Math.floor( h * 0.20 )
      );
      logMsg( "Background ROI = " + bgRect.x0 + "," + bgRect.y0 +
              " - " + bgRect.x1 + "," + bgRect.y1 );

      let SPCC = new SpectrophotometricColorCalibration;
      SPCC.whiteReferenceName = "Average Spiral Galaxy";
      SPCC.catalogId = "GaiaDR3SP";
      SPCC.autoLimitMagnitude = true;
      SPCC.neutralizeBackground = true;
      SPCC.backgroundReferenceViewId = "";
      SPCC.backgroundUseROI = true;
      SPCC.backgroundROIX0 = bgRect.x0;
      SPCC.backgroundROIY0 = bgRect.y0;
      SPCC.backgroundROIX1 = bgRect.x1;
      SPCC.backgroundROIY1 = bgRect.y1;
      SPCC.backgroundLow = -2.8;
      SPCC.backgroundHigh = 2.0;
      SPCC.applyCalibration = true;
      SPCC.generateGraphs = false;
      SPCC.generateStarMaps = false;
      SPCC.generateTextFiles = false;

      // Defaults are appropriate for a stock DSLR/OSC sensor:
      // Sony Color Sensor R/G/B-UVIRcut and Ideal QE curve.
      logMsg( "SPCC filters: " + SPCC.redFilterName + ", " +
              SPCC.greenFilterName + ", " + SPCC.blueFilterName );

      SPCC.canExecuteOnOrThrow( view );
      let ok = SPCC.executeOn( view );
      logMsg( "SPCC returned: " + ok );
      if ( !ok )
         throw new Error( "SPCC.executeOn returned false" );

      let saveOk = mainWin.saveAs( outFile, false, false, false, false );
      logMsg( "saveAs returned: " + saveOk );
      if ( !saveOk )
         throw new Error( "saveAs failed" );

      for ( let i = 0; i < windows.length; ++i )
         windows[i].forceClose();

      logMsg( "=== Phase 2c SPCC complete ===" );
   }
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
