// Conservative star reduction for nonlinear RGB images.
// Generates a StarMask, applies one mild MorphologicalTransformation pass, and
// saves a clean unmasked copy.
// Usage:
//   -r=03r-star-reduction.js,input=<xisf>,output=<xisf>,mask=<optional xisf>

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

var __log__ = arg( "log", "work/logs/phase3r-star-reduction.log" );
var __f__ = new File;
__f__.createForWriting( __log__ );

function logMsg( msg )
{
   __f__.outTextLn( new Date().toISOString() + " " + msg );
   __f__.flush();
   console.noteln( msg );
}

function numArg( name, def )
{
   let v = Number( arg( name, "" + def ) );
   return isFinite( v ) ? v : def;
}

function windowIds()
{
   let ids = {};
   let windows = ImageWindow.windows;
   for ( let i = 0; i < windows.length; ++i )
      ids[windows[i].mainView.id] = true;
   return ids;
}

function findNewWindow( before )
{
   let windows = ImageWindow.windows;
   for ( let i = 0; i < windows.length; ++i )
      if ( !before[windows[i].mainView.id] )
         return windows[i];
   return null;
}

try
{
   let input = arg( "input", null );
   let output = arg( "output", null );
   let maskPath = arg( "mask", null );
   if ( !input || !output )
      throw new Error( "Missing input or output" );

   let amount = numArg( "amount", 0.16 );
   let selection = numArg( "selection", 0.24 );
   let noise = numArg( "noise", 0.10 );
   let smoothness = numArg( "smoothness", 8 );
   let waveletLayers = numArg( "waveletLayers", 5 );
   let largeScaleGrowth = numArg( "largeScaleGrowth", 2 );
   let smallScaleGrowth = numArg( "smallScaleGrowth", 1 );
   let growthCompensation = numArg( "growthCompensation", 2 );
   let midtonesBalance = numArg( "midtonesBalance", 0.25 );
   let aggregateStructures = arg( "aggregateStructures", "true" ) != "false";
   let structureSize = numArg( "structureSize", 5 );
   let iterations = numArg( "iterations", 1 );

   logMsg( "input=" + input );
   logMsg( "output=" + output );
   logMsg( "mask=" + maskPath );
   logMsg( "amount=" + amount + " selection=" + selection +
           " noise=" + noise + " smoothness=" + smoothness +
           " waveletLayers=" + waveletLayers +
           " largeScaleGrowth=" + largeScaleGrowth +
           " smallScaleGrowth=" + smallScaleGrowth +
           " growthCompensation=" + growthCompensation +
           " midtonesBalance=" + midtonesBalance +
           " aggregateStructures=" + aggregateStructures +
           " structureSize=" + structureSize +
           " iterations=" + iterations );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );
   let win = windows[0];
   let view = win.mainView;

   let source = new ImageWindow( view.image.width, view.image.height,
                                 view.image.numberOfChannels, 32, true,
                                 view.image.isColor, "star_mask_source" );
   source.mainView.beginProcess( UndoFlag.NoSwapFile );
   source.mainView.image.assign( view.image );
   source.mainView.endProcess();

   let before = windowIds();
   let SM = new StarMask;
   SM.noiseThreshold = noise;
   SM.waveletLayers = waveletLayers;
   SM.largeScaleGrowth = largeScaleGrowth;
   SM.smallScaleGrowth = smallScaleGrowth;
   SM.growthCompensation = growthCompensation;
   SM.smoothness = smoothness;
   SM.aggregateStructures = aggregateStructures;
   SM.midtonesBalance = midtonesBalance;
   if ( !SM.executeOn( source.mainView ) )
      throw new Error( "StarMask failed" );

   let starWin = findNewWindow( before );
   if ( !starWin )
      throw new Error( "StarMask did not create a new window" );
   if ( maskPath )
      starWin.saveAs( maskPath, false, false, false, false );

   win.setMask( starWin, false );
   win.maskEnabled = true;
   win.maskInverted = false;
   win.maskVisible = false;

   let MT = new MorphologicalTransformation;
   MT.operator = MorphologicalTransformation.Selection;
   MT.selectionPoint = selection;
   MT.numberOfIterations = iterations;
   MT.amount = amount;
   MT.structureSize = structureSize;
   MT.structureWayTable = [
      [[
         0x00,0x01,0x00,0x01,0x00,
         0x01,0x01,0x01,0x01,0x01,
         0x00,0x01,0x01,0x01,0x00,
         0x01,0x01,0x01,0x01,0x01,
         0x00,0x01,0x00,0x01,0x00
      ]]
   ];
   MT.lowThreshold = 0.000000;
   MT.highThreshold = 0.900000;
   if ( !MT.executeOn( view ) )
      throw new Error( "MorphologicalTransformation failed" );

   win.maskEnabled = false;
   try { win.removeMask(); } catch ( e ) { logMsg( "removeMask note: " + e ); }
   win.maskVisible = false;
   win.maskInverted = false;

   let ok = win.saveAs( output, false, false, false, false );
   logMsg( "saveAs returned: " + ok );
   if ( !ok )
      throw new Error( "saveAs failed" );

   source.forceClose();
   starWin.forceClose();
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
