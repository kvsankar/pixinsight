// Render an image as an 8-bit JPEG without applying STF.
// Usage: -r=render-jpeg.js,input=<path>,output=<jpg path>,scale=<relative>

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
   __log__ = "work/logs/render-jpeg-pjsr.log";
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

try
{
   let inFile = getArg( "input" );
   let outFile = getArg( "output" );
   let scaleArg = getArg( "scale" );
   let scale = scaleArg ? parseFloat( scaleArg ) : 0.35;
   logMsg( "input=" + inFile );
   logMsg( "output=" + outFile );
   logMsg( "scale=" + scale );
   if ( !inFile || !outFile )
      throw new Error( "Missing input or output argument" );

   let windows = ImageWindow.open( inFile );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let source = windows[0];
   let image = source.mainView.image;
   logMsg( "opened " + image.width + "x" + image.height );
   let preview = new ImageWindow( image.width, image.height,
                                  image.numberOfChannels, 8, false,
                                  image.isColor, "jpeg_preview" );
   preview.mainView.beginProcess( UndoFlag.NoSwapFile );
   preview.mainView.image.assign( image );
   preview.mainView.endProcess();

   if ( scale > 0 && scale != 1 )
   {
      let R = new Resample;
      R.xSize = scale;
      R.ySize = scale;
      R.mode = Resample.RelativeDimensions;
      R.absoluteMode = Resample.ForceWidthAndHeight;
      R.interpolation = Resample.Auto;
      R.clampingThreshold = 0.30;
      R.smoothness = 1.50;
      R.executeOn( preview.mainView, false );
      logMsg( "resampled to " + preview.mainView.image.width + "x" + preview.mainView.image.height );
   }

   if ( !preview.saveAs( outFile, false, false, false, false ) )
      throw new Error( "saveAs failed" );
   logMsg( "saved" );

   preview.forceClose();
   for ( let i = 0; i < windows.length; ++i )
      windows[i].forceClose();
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
