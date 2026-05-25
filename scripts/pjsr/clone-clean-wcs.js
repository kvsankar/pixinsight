// Clone image pixels into a new mask-free window, copy WCS, and save.
// Usage: -r=clone-clean-wcs.js,input=<path>,output=<path>,log=<path>

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
   logPath = "work/logs/clone-clean-wcs-pjsr.log";
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

   let src = windows[0];
   let srcView = src.mainView;
   let image = srcView.image;
   log( "source=" + image.width + "x" + image.height +
        " channels=" + image.numberOfChannels +
        " color=" + image.isColor +
        " maskEnabled=" + src.maskEnabled );

   let dst = new ImageWindow( image.width, image.height,
                              image.numberOfChannels,
                              image.bitsPerSample,
                              true,
                              image.isColor,
                              "dbe_manual_clean" );
   dst.mainView.beginProcess( UndoFlag.NoSwapFile );
   dst.mainView.image.assign( image );
   dst.mainView.endProcess();

   dst.copyAstrometricSolution( src );
   dst.keywords = src.keywords;
   dst.maskEnabled = false;
   dst.maskVisible = false;
   dst.maskInverted = false;

   log( "dst astrometric:" );
   log( dst.astrometricSolutionSummary().trim() );
   log( "dst maskEnabled=" + dst.maskEnabled );

   let ok = dst.saveAs( output, false, false, false, false );
   log( "saveAs returned: " + ok );
   if ( !ok )
      throw new Error( "saveAs failed" );

   dst.forceClose();
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
