// Export an existing image as a 16-bit PNG for external deterministic analysis.
// Usage:
//   -r=export-png16.js,input=<xisf>,output=<png>,log=<path>

#engine v8

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

var logPath = arg( "log", "work/logs/export-png16.log" );
var f = new File;
f.createForWriting( logPath );

function log( s )
{
   f.outTextLn( new Date().toISOString() + " " + s );
   f.flush();
   console.noteln( s );
}

try
{
   let input = arg( "input", "" );
   let output = arg( "output", "" );
   if ( !input || !output )
      throw new Error( "Missing input or output" );

   log( "input=" + input );
   log( "output=" + output );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed: " + input );

   let src = windows[0];
   let img = src.mainView.image;
   let out = new ImageWindow( img.width, img.height, img.numberOfChannels,
                              16, false, img.isColor, "png16_export" );
   out.mainView.beginProcess( UndoFlag.NoSwapFile );
   out.mainView.image.assign( img );
   out.mainView.endProcess();

   let ok = out.saveAs( output, false, false, false, false );
   log( "save PNG returned=" + ok );
   if ( !ok )
      throw new Error( "saveAs failed" );

   out.forceClose();
   for ( let i = 0; i < windows.length; ++i )
      windows[i].forceClose();
   log( "done" );
}
catch ( e )
{
   log( "EXCEPTION: " + e );
   if ( e.stack )
      log( "STACK: " + e.stack );
}

f.close();
