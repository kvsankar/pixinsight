// Remove any active mask from an image and save a clean copy.
// Usage: -r=clean-mask.js,input=<path>,output=<path>,log=<path>

#engine v8

function arg( name )
{
   for ( let i = 0; i < jsArguments.length; ++i )
   {
      let eq = jsArguments[i].indexOf( "=" );
      if ( eq > 0 && jsArguments[i].substring( 0, eq ) == name )
         return jsArguments[i].substring( eq + 1 );
   }
   return null;
}

var logPath = arg( "log" );
if ( !logPath )
   logPath = "work/logs/clean-mask-pjsr.log";
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
   let input = arg( "input" );
   let output = arg( "output" );
   if ( !input || !output )
      throw new Error( "Missing input or output" );

   log( "input=" + input );
   log( "output=" + output );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let win = windows[0];
   log( "before mask: hasMask=" + ( win.mask != null ) +
        " enabled=" + win.maskEnabled +
        " visible=" + win.maskVisible +
        " inverted=" + win.maskInverted );

   win.maskEnabled = false;
   try
   {
      win.removeMask();
      log( "removeMask returned" );
   }
   catch ( e )
   {
      log( "removeMask note: " + e );
   }
   win.maskVisible = false;
   win.maskInverted = false;

   log( "after mask: hasMask=" + ( win.mask != null ) +
        " enabled=" + win.maskEnabled +
        " visible=" + win.maskVisible +
        " inverted=" + win.maskInverted );

   let ok = win.saveAs( output, false, false, false, false );
   log( "saveAs returned: " + ok );
   if ( !ok )
      throw new Error( "saveAs failed" );

   for ( let i = 0; i < windows.length; ++i )
      windows[i].forceClose();
}
catch ( e )
{
   log( "EXCEPTION: " + e );
   if ( e.stack )
      log( "STACK: " + e.stack );
}

f.close();
