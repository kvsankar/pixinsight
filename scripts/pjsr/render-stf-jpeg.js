// Render a linear XISF with an auto STF baked in for quick inspection.
// Usage: -r=render-stf-jpeg.js,input=<path>,output=<jpg path>

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
   __log__ = "work/logs/render-stf-pjsr.log";
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

function autoSTF( view )
{
   let n = view.image.isColor ? 3 : 1;
   let medianValues = view.computeOrFetchProperty( "Median" );
   let madValues = view.computeOrFetchProperty( "MAD" );
   let median = [];
   let mad = [];
   for ( let c = 0; c < n; ++c )
   {
      median[c] = Math.max( 0.00001, medianValues[c] );
      mad[c] = 1.4826 * madValues[c];
   }
   return view.image.computeAutoStretch( median, mad, -2.8, 0.25, false );
}

try
{
   let inFile = getArg( "input" );
   let outFile = getArg( "output" );
   logMsg( "input=" + inFile );
   logMsg( "output=" + outFile );
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
                                  image.isColor, "stf_preview" );
   preview.mainView.beginProcess( UndoFlag.NoSwapFile );
   preview.mainView.image.assign( image );
   preview.mainView.image.applyDisplayFunction( autoSTF( source.mainView ) );
   preview.mainView.endProcess();
   logMsg( "applied STF" );

   let R = new Resample;
   R.xSize = 0.35;
   R.ySize = 0.35;
   R.mode = Resample.RelativeDimensions;
   R.absoluteMode = Resample.ForceWidthAndHeight;
   R.interpolation = Resample.Auto;
   R.clampingThreshold = 0.30;
   R.smoothness = 1.50;
   R.executeOn( preview.mainView, false );
   logMsg( "resampled to " + preview.mainView.image.width + "x" + preview.mainView.image.height );

   if ( !preview.saveAs( outFile, false, false, false, false ) )
      throw new Error( "saveAs failed" );
   logMsg( "saved" );

   preview.forceClose();
   for ( let i = 0; i < windows.length; ++i )
      windows[i].forceClose();
}
catch ( e )
{
   console.criticalln( e );
   if ( e.stack )
      console.criticalln( e.stack );
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
