// Phase 3a — Nonlinear stretch with MaskedStretch
// Usage: -r=03a-maskedstretch.js,input=<path>,output=<path>

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
   __log__ = "work/logs/phase3a-stretch-pjsr.log";
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

function numberArg( name, def )
{
   let v = getArg( name );
   if ( v == null || v.length == 0 )
      return def;
   let n = parseFloat( v );
   return isNaN( n ) ? def : n;
}

try
{
   logMsg( "=== Phase 3a: MaskedStretch starting ===" );

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
      let w = view.image.width;
      let h = view.image.height;
      logMsg( "Image: " + w + "x" + h + ", channels=" + view.image.numberOfChannels );

      // Clean sky in the solved frame's upper-right corner. Use ROI directly
      // so we do not depend on preview reference-id quirks.
      let x0 = Math.floor( w * 0.84 );
      let y0 = Math.floor( h * 0.05 );
      let x1 = Math.floor( w * 0.98 );
      let y1 = Math.floor( h * 0.20 );
      logMsg( "Background ROI = " + x0 + "," + y0 + " - " + x1 + "," + y1 );

      let P = new MaskedStretch;
      P.targetBackground = numberArg( "targetBackground", 0.105 );
      P.numberOfIterations = 100;
      P.clippingFraction = 0.0005;
      P.backgroundLow = 0.0;
      P.backgroundHigh = 0.05;
      P.backgroundReferenceViewId = "";
      P.useROI = true;
      P.roiX0 = x0;
      P.roiY0 = y0;
      P.roiX1 = x1;
      P.roiY1 = y1;
      P.maskType = 0;
      logMsg( "MaskedStretch targetBackground = " + P.targetBackground );

      let ok = P.executeOn( view );
      logMsg( "MaskedStretch returned: " + ok );
      if ( !ok )
         throw new Error( "MaskedStretch.executeOn returned false" );

      let saveOk = mainWin.saveAs( outFile, false, false, false, false );
      logMsg( "saveAs returned: " + saveOk );
      if ( !saveOk )
         throw new Error( "saveAs failed" );

      for ( let i = 0; i < windows.length; ++i )
         windows[i].forceClose();

      logMsg( "=== Phase 3a MaskedStretch complete ===" );
   }
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
