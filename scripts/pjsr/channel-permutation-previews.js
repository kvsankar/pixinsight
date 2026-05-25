// Diagnostic helper: render RGB channel permutations from a color image.
// Usage: -r=channel-permutation-previews.js,input=<path>,outdir=<dir>,scale=0.35

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
   __log__ = "work/logs/channel-permutation-previews.log";
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

function extractChannel( view, index, id )
{
   let P = new ChannelExtraction;
   P.colorSpace = ChannelExtraction.prototype.RGB;
   P.channels = [
      [ index == 0, id ],
      [ index == 1, id ],
      [ index == 2, id ]
   ];
   P.sampleFormat = ChannelExtraction.prototype.SameAsSource;
   if ( !P.executeOn( view ) )
      throw new Error( "ChannelExtraction failed for " + id );

   let win = ImageWindow.windowById( id );
   if ( !win || win.isNull )
      throw new Error( "Extracted channel window not found: " + id );
   return win;
}

function combineAndSave( channels, order, outFile, scale )
{
   let C = new ChannelCombination;
   C.colorSpace = ChannelCombination.prototype.RGB;
   C.channels = [
      [ true, channels[ order[0] ].mainView.id ],
      [ true, channels[ order[1] ].mainView.id ],
      [ true, channels[ order[2] ].mainView.id ]
   ];
   if ( !C.executeGlobal() )
      throw new Error( "ChannelCombination failed for " + outFile );

   let win = ImageWindow.activeWindow;
   if ( scale > 0 && scale != 1 )
   {
      let R = new Resample;
      R.xSize = scale;
      R.ySize = scale;
      R.mode = Resample.prototype.RelativeDimensions;
      R.absoluteMode = Resample.prototype.ForceWidthAndHeight;
      R.interpolation = Resample.prototype.Auto;
      R.clampingThreshold = 0.30;
      R.smoothness = 1.50;
      R.executeOn( win.mainView, false );
   }

   if ( !win.saveAs( outFile, false, false, false, false ) )
      throw new Error( "saveAs failed: " + outFile );
   win.forceClose();
}

try
{
   let input = getArg( "input" );
   let outDir = getArg( "outdir" );
   let scaleArg = getArg( "scale" );
   let scale = scaleArg ? parseFloat( scaleArg ) : 0.35;
   if ( !input || !outDir )
      throw new Error( "Missing input or outdir argument" );

   if ( !File.directoryExists( outDir ) )
      File.createDirectory( outDir );

   logMsg( "input=" + input );
   logMsg( "outdir=" + outDir );
   logMsg( "scale=" + scale );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let source = windows[0];
   let channels = [
      extractChannel( source.mainView, 0, "_perm_R" ),
      extractChannel( source.mainView, 1, "_perm_G" ),
      extractChannel( source.mainView, 2, "_perm_B" )
   ];

   let perms = [
      [ "rgb", [ 0, 1, 2 ] ],
      [ "rbg", [ 0, 2, 1 ] ],
      [ "grb", [ 1, 0, 2 ] ],
      [ "gbr", [ 1, 2, 0 ] ],
      [ "brg", [ 2, 0, 1 ] ],
      [ "bgr", [ 2, 1, 0 ] ]
   ];

   for ( let i = 0; i < perms.length; ++i )
   {
      let outFile = outDir + "/preview-" + perms[i][0] + ".jpg";
      logMsg( "saving " + outFile );
      combineAndSave( channels, perms[i][1], outFile, scale );
   }

   for ( let i = 0; i < channels.length; ++i )
      channels[i].forceClose();
   source.forceClose();
   logMsg( "done" );
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
