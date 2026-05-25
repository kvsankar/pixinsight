// Inspect basic image metadata and robust statistics.
// Usage: -r=inspect-image.js,input=<path>,log=<path>

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
   logPath = "work/logs/inspect-image-pjsr.log";
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
   if ( !input )
      throw new Error( "Missing input" );

   log( "input=" + input );
   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let win = windows[0];
   let view = win.mainView;
   let image = view.image;
   log( "id=" + view.id );
   log( "size=" + image.width + "x" + image.height );
   log( "channels=" + image.numberOfChannels + " color=" + image.isColor );
   log( "bitsPerSample=" + image.bitsPerSample + " float=" + image.isFloatSample );
   let maskIsNull = true;
   try { maskIsNull = win.mask.isNull; } catch ( e ) { maskIsNull = true; }
   log( "hasMaskObject=" + ( win.mask != null ) +
        " maskIsNull=" + maskIsNull +
        " maskEnabled=" + win.maskEnabled +
        " maskVisible=" + win.maskVisible +
        " maskInverted=" + win.maskInverted );
   log( "keywords=" + win.keywords.length );
   log( "properties=" + view.properties.length );

   for ( let c = 0; c < image.numberOfChannels; ++c )
   {
      image.selectedChannel = c;
      log( "channel " + c +
           " min=" + image.minimum().toExponential( 8 ) +
           " max=" + image.maximum().toExponential( 8 ) +
           " mean=" + image.mean().toExponential( 8 ) +
           " median=" + image.median().toExponential( 8 ) +
           " stddev=" + image.stdDev().toExponential( 8 ) );
   }
   image.resetSelections();

   log( "astrometricSummary=" );
   log( win.astrometricSolutionSummary().trim() );

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
