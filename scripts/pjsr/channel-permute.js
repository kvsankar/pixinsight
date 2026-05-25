// Save a channel-permuted copy of an RGB image, preserving WCS metadata.
// Usage: -r=channel-permute.js,input=<xisf>,output=<xisf>,order=rgb|rbg|grb|gbr|brg|bgr

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

var __log__ = arg( "log", "work/logs/channel-permute-pjsr.log" );
var __f__ = new File;
__f__.createForWriting( __log__ );

function logMsg( msg )
{
   __f__.outTextLn( new Date().toISOString() + " " + msg );
   __f__.flush();
   console.noteln( msg );
}

try
{
   let input = arg( "input", null );
   let output = arg( "output", null );
   let order = arg( "order", "rgb" ).toLowerCase();
   if ( !input || !output )
      throw new Error( "Missing input or output" );
   if ( !/^[rgb]{3}$/.test( order ) )
      throw new Error( "Invalid order: " + order );

   let ix = { r:0, g:1, b:2 };
   logMsg( "input=" + input );
   logMsg( "output=" + output );
   logMsg( "order=" + order );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let win = windows[0];
   let view = win.mainView;
   if ( !view.image.isColor || view.image.numberOfChannels < 3 )
      throw new Error( "Expected RGB image" );

   let P = new PixelMath;
   P.useSingleExpression = false;
   P.expression0 = "$T[" + ix[order[0]] + "]";
   P.expression1 = "$T[" + ix[order[1]] + "]";
   P.expression2 = "$T[" + ix[order[2]] + "]";
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.rescale = false;
   P.createNewImage = false;
   P.showNewImage = false;
   P.generateOutput = true;
   if ( !P.executeOn( view ) )
      throw new Error( "PixelMath failed" );

   if ( !win.saveAs( output, false, false, false, false ) )
      throw new Error( "saveAs failed" );

   for ( let i = 0; i < windows.length; ++i )
      windows[i].forceClose();
   logMsg( "complete" );
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
