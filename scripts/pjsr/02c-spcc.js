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

function boolArg( name, def )
{
   let v = getArg( name );
   if ( v == null )
      return def;
   v = v.toLowerCase();
   return v == "1" || v == "true" || v == "yes";
}

function stringArg( name, def )
{
   let v = getArg( name );
   return v == null || v.length == 0 ? def : v;
}

function numericArg( name, def )
{
   let v = getArg( name );
   return v == null || v.length == 0 ? def : Number( v );
}

function applyCameraPreset( SPCC, camera )
{
   camera = ( camera || "" ).toLowerCase();
   if ( camera == "canoneos500d" || camera == "eos500d" || camera == "t1i" )
   {
      SPCC.redFilterName = "Canon EOS 500D R";
      SPCC.greenFilterName = "Canon EOS 500D G";
      SPCC.blueFilterName = "Canon EOS 500D B";
   }
   else if ( camera == "canoneos60d" || camera == "eos60d" || camera == "60d" )
   {
      SPCC.redFilterName = "Canon EOS 60D R";
      SPCC.greenFilterName = "Canon EOS 60D G";
      SPCC.blueFilterName = "Canon EOS 60D B";
   }
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

      let neutralize = boolArg( "neutralize", true );

      // Default clean-sky ROI in the upper-right corner. Target-specific runs
      // can disable neutralization if this region contains faint nebulosity.
      let bgRect = new Rect(
         Math.floor( w * 0.84 ), Math.floor( h * 0.05 ),
         Math.floor( w * 0.98 ), Math.floor( h * 0.20 )
      );
      logMsg( "Background ROI = " + bgRect.x0 + "," + bgRect.y0 +
              " - " + bgRect.x1 + "," + bgRect.y1 );

      let SPCC = new SpectrophotometricColorCalibration;
      SPCC.whiteReferenceName = stringArg( "whiteReference", "Average Spiral Galaxy" );
      SPCC.catalogId = "GaiaDR3SP";
      SPCC.autoLimitMagnitude = true;
      SPCC.neutralizeBackground = neutralize;
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

      applyCameraPreset( SPCC, stringArg( "camera", "" ) );
      SPCC.redFilterName = stringArg( "redFilter", SPCC.redFilterName );
      SPCC.greenFilterName = stringArg( "greenFilter", SPCC.greenFilterName );
      SPCC.blueFilterName = stringArg( "blueFilter", SPCC.blueFilterName );
      SPCC.psfMinSNR = numericArg( "psfMinSNR", SPCC.psfMinSNR );
      SPCC.psfNoiseReductionFilterRadius = numericArg( "psfNoise", SPCC.psfNoiseReductionFilterRadius );
      SPCC.psfMaxStars = numericArg( "psfMaxStars", SPCC.psfMaxStars );
      SPCC.saturationThreshold = numericArg( "saturation", SPCC.saturationThreshold );
      SPCC.generateTextFiles = boolArg( "text", SPCC.generateTextFiles );
      SPCC.generateStarMaps = boolArg( "starMaps", SPCC.generateStarMaps );
      SPCC.outputDirectory = stringArg( "outputDirectory", SPCC.outputDirectory );

      logMsg( "SPCC neutralizeBackground: " + SPCC.neutralizeBackground );
      logMsg( "SPCC whiteReferenceName: " + SPCC.whiteReferenceName );
      logMsg( "SPCC filters: " + SPCC.redFilterName + ", " +
              SPCC.greenFilterName + ", " + SPCC.blueFilterName );
      logMsg( "SPCC signal: psfMinSNR=" + SPCC.psfMinSNR +
              ", psfNoiseReductionFilterRadius=" + SPCC.psfNoiseReductionFilterRadius +
              ", psfMaxStars=" + SPCC.psfMaxStars +
              ", saturationThreshold=" + SPCC.saturationThreshold +
              ", generateTextFiles=" + SPCC.generateTextFiles +
              ", generateStarMaps=" + SPCC.generateStarMaps +
              ", outputDirectory=" + SPCC.outputDirectory );

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
