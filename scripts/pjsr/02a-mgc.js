// Phase 2a alternative — MultiscaleGradientCorrection.
// Usage: -r=02a-mgc.js,input=<path>,output=<path>,scale=<px>,smoothness=<n>

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
   __log__ = "work/logs/phase2a-mgc-pjsr.log";
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
   return bootstrapArg( name );
}

function intArg( name, def )
{
   let v = getArg( name );
   if ( v == null || v.length == 0 )
      return def;
   let n = parseInt( v, 10 );
   return isNaN( n ) ? def : n;
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
   logMsg( "=== Phase 2a alternative: MGC starting ===" );
   let inFile = getArg( "input" );
   let outFile = getArg( "output" );
   if ( !inFile || !outFile )
      throw new Error( "Missing input or output argument" );

   logMsg( "input  = " + inFile );
   logMsg( "output = " + outFile );

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
      logMsg( "Image: " + view.image.width + "x" + view.image.height );

      let MGC = new MultiscaleGradientCorrection;
      MGC.useMARSDatabase = false;
      MGC.showGradientModel = false;
      MGC.gradientScale = intArg( "scale", 1024 );
      MGC.structureSeparation = intArg( "structureSeparation", 3 );
      MGC.modelSmoothness = numberArg( "smoothness", 1.0 );
      logMsg( "gradientScale = " + MGC.gradientScale );
      logMsg( "structureSeparation = " + MGC.structureSeparation );
      logMsg( "modelSmoothness = " + MGC.modelSmoothness );

      MGC.canExecuteOnOrThrow( view );
      let ok = MGC.executeOn( view );
      logMsg( "MGC returned: " + ok );
      if ( !ok )
         throw new Error( "MGC.executeOn returned false" );

      let saveOk = mainWin.saveAs( outFile, false, false, false, false );
      logMsg( "saveAs returned: " + saveOk );
      if ( !saveOk )
         throw new Error( "saveAs failed" );

      for ( let i = 0; i < windows.length; ++i )
         windows[i].forceClose();
      logMsg( "=== Phase 2a alternative: MGC complete ===" );
   }
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
