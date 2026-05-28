// Export an existing image as TIFF.
// Usage:
//   -r=export-tiff.js,input=<xisf>,output=<tif>,log=<path>

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

var logPath = arg( "log", "work/logs/export-tiff.log" );
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

   let win = windows[0];
   let ok = win.saveAs( output, false, false, false, false );
   log( "save TIFF returned=" + ok );
   if ( !ok )
      throw new Error( "saveAs failed" );

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
