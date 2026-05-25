// Phase 2a — AutomaticBackgroundExtractor
// Usage: -r=02a-abe.js,input=<path>,output=<path>

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
   __log__ = "work/logs/phase2a-pjsr.log";
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

function intArg( name, def )
{
   let v = getArg( name );
   if ( v == null || v.length == 0 )
      return def;
   let n = parseInt( v, 10 );
   return isNaN( n ) ? def : n;
}

try
{
   logMsg( "=== Phase 2a starting ===" );
   logMsg( "jsArguments.length = " + jsArguments.length );

   let inFile  = getArg( "input" );
   let outFile = getArg( "output" );
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
      logMsg( "Opening input..." );
      let windows = ImageWindow.open( inFile );
      logMsg( "Opened, got " + windows.length + " window(s)" );
      if ( windows.length == 0 )
         throw new Error( "Failed to open " + inFile );

      // Master XISF may contain main image + ancillary views (rejection maps).
      // Find the main image — largest one, typically index 0.
      let mainWin = windows[ 0 ];
      let view = mainWin.mainView;
      logMsg( "Main view id = " + view.id );
      logMsg( "Image size = " + view.image.width + "x" + view.image.height +
              ", channels = " + view.image.numberOfChannels );

      logMsg( "Configuring ABE..." );
      let ABE = new AutomaticBackgroundExtractor;
      ABE.tolerance         = 1.0;
      ABE.deviation         = 0.8;
      ABE.unbalance         = 1.8;
      ABE.minBoxFraction    = 0.05;
      ABE.useBrightnessLimits = false;
      ABE.polyDegree        = 4;
      ABE.boxSize           = 5;
      ABE.boxSeparation     = 0;
      ABE.abeDownsample     = 2.0;
      ABE.writeSampleBoxes  = false;
      ABE.justTrySamples    = false;
      ABE.targetCorrection  = intArg( "correction", 1 );  // 0=None, 1=Subtract, 2=Divide
      ABE.normalize         = true;
      ABE.discardBackgroundModel = true;
      ABE.replaceTarget     = true;
      logMsg( "ABE targetCorrection = " + ABE.targetCorrection );

      logMsg( "Executing ABE..." );
      let ok = ABE.executeOn( view );
      logMsg( "ABE returned: " + ok );
      if ( !ok )
         throw new Error( "ABE.executeOn returned false" );

      // Save the corrected image. saveAs args: (path, queryOptions, allowMessages, strict, verifyOverwrites)
      logMsg( "Saving to " + outFile + " ..." );
      let saveOk = mainWin.saveAs( outFile, false, false, false, false );
      logMsg( "saveAs returned: " + saveOk );
      if ( !saveOk )
         throw new Error( "saveAs failed" );

      // Close all opened windows
      for ( let i = 0; i < windows.length; ++i )
         windows[ i ].forceClose();

      logMsg( "=== Phase 2a complete ===" );
   }
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack ) logMsg( "STACK: " + e.stack );
}

__f__.close();
