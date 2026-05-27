// M42 v1 nonlinear polish.
// Starts from a MaskedStretch image. Applies restrained core compression,
// mild local contrast, gentle color/saturation shaping, a target crop, and
// optional TIFF/JPEG exports.
// Usage:
//   -r=03m-m42-v1-polish.js,input=<xisf>,output=<xisf>,tiff=<tif>,jpg=<jpg>,log=<path>

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

function numArg( name, def )
{
   let v = Number( arg( name, "" + def ) );
   return isFinite( v ) ? v : def;
}

function jsNum( x )
{
   return x.toPrecision( 15 ).replace( /0+$/, "" ).replace( /\.$/, "" );
}

function smoothStepExpr( x, low, high )
{
   return "max(min((" + x + "-" + jsNum( low ) + ")/" +
          jsNum( high - low ) + ",1),0)";
}

var logPath = arg( "log", "work/logs/03m-m42-v1-polish.log" );
var f = new File;
f.createForWriting( logPath );

function logMsg( msg )
{
   f.outTextLn( new Date().toISOString() + " " + msg );
   f.flush();
   console.noteln( msg );
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

function applyCrop( view, centerX, centerY, width, height )
{
   let crop = new DynamicCrop;
   crop.centerX = centerX;
   crop.centerY = centerY;
   crop.width = width;
   crop.height = height;
   crop.angle = 0.0;
   crop.scaleX = 1.0;
   crop.scaleY = 1.0;
   crop.optimizeFast = true;
   crop.noGUIMessages = true;
   crop.interpolation = DynamicCrop.Auto;
   crop.clampingThreshold = 0.30;
   crop.smoothness = 1.50;
   crop.red = 0.0;
   crop.green = 0.0;
   crop.blue = 0.0;
   crop.alpha = 1.0;
   if ( !crop.executeOn( view ) )
      throw new Error( "DynamicCrop failed" );
}

function runPixelMath( view, r, g, b, label )
{
   let P = new PixelMath;
   P.useSingleExpression = false;
   P.expression0 = r;
   P.expression1 = g;
   P.expression2 = b;
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.rescale = false;
   P.createNewImage = false;
   P.showNewImage = false;
   P.generateOutput = true;
   logMsg( label + " R=" + r );
   if ( !P.executeOn( view ) )
      throw new Error( label + " PixelMath failed" );
}

try
{
   let input = arg( "input", "" );
   let output = arg( "output", "" );
   let tiff = arg( "tiff", "" );
   let jpg = arg( "jpg", "" );
   let maskDir = arg( "maskdir", "" );
   let jpgScale = numArg( "jpgScale", 0.70 );

   if ( !input || !output )
      throw new Error( "Missing input or output" );
   if ( maskDir && !File.directoryExists( maskDir ) )
      File.createDirectory( maskDir, true );

   logMsg( "input=" + input );
   logMsg( "output=" + output );
   logMsg( "tiff=" + tiff );
   logMsg( "jpg=" + jpg );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let win = windows[0];
   let view = win.mainView;
   if ( !view.image.isColor || view.image.numberOfChannels < 3 )
      throw new Error( "Expected RGB input" );
   logMsg( "image=" + view.image.width + "x" + view.image.height );

   logMsg( "Generating core mask" );
   let beforeRange = windowIds();
   let RS = new RangeSelection;
   RS.lowRange = numArg( "coreLow", 0.34 );
   RS.highRange = numArg( "coreHigh", 1.00 );
   RS.fuzziness = numArg( "coreFuzz", 0.22 );
   RS.smoothness = numArg( "coreSmooth", 7.00 );
   RS.toLightness = true;
   RS.invert = false;
   RS.screening = false;
   if ( !RS.executeOn( view ) )
      throw new Error( "RangeSelection failed" );
   let coreMask = findNewWindow( beforeRange );
   if ( !coreMask )
      throw new Error( "RangeSelection did not create a mask" );
   if ( maskDir )
      coreMask.saveAs( maskDir + "/m42-core-mask.xisf", false, false, false, false );

   win.setMask( coreMask, false );
   win.maskEnabled = true;
   win.maskInverted = false;
   win.maskVisible = false;

   logMsg( "Applying HDRMT to core" );
   let HDR = new HDRMultiscaleTransform;
   HDR.numberOfLayers = Math.round( numArg( "hdrLayers", 6 ) );
   HDR.numberOfIterations = Math.round( numArg( "hdrIterations", 1 ) );
   HDR.toLightness = true;
   HDR.toLuminanceOnly = false;
   HDR.toIntensity = false;
   HDR.lightnessMask = true;
   HDR.luminanceMask = false;
   HDR.preserveHue = true;
   HDR.overdrive = 0.0;
   HDR.medianTransform = false;
   HDR.deringing = false;
   if ( !HDR.executeOn( view ) )
      throw new Error( "HDRMT failed" );

   logMsg( "Applying mild local contrast" );
   let LHE = new LocalHistogramEqualization;
   LHE.radius = Math.round( numArg( "lheRadius", 96 ) );
   LHE.slopeLimit = numArg( "lheSlope", 1.35 );
   LHE.amount = numArg( "lheAmount", 0.15 );
   LHE.histogramBins = 0;
   LHE.circularKernel = true;
   if ( !LHE.executeOn( view ) )
      throw new Error( "LHE failed" );

   logMsg( "Desaturating/compressing bright core" );
   let L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let avg = "(($T[0]+$T[1]+$T[2])/3)";
   let high = smoothStepExpr( L, numArg( "highLow", 0.42 ), numArg( "highHigh", 0.84 ) );
   let highDesat = numArg( "highDesat", 0.78 );
   let highCompress = numArg( "highCompress", 0.28 );
   let highKnee = numArg( "highKnee", 0.70 );
   runPixelMath(
      view,
      "max(min(($T[0]*(1-" + high + "*" + jsNum( highDesat ) +
         ")+" + avg + "*" + high + "*" + jsNum( highDesat ) +
         ")-" + high + "*" + jsNum( highCompress ) +
         "*max($T[0]-" + jsNum( highKnee ) + ",0),1),0)",
      "max(min(($T[1]*(1-" + high + "*" + jsNum( highDesat ) +
         ")+" + avg + "*" + high + "*" + jsNum( highDesat ) +
         ")-" + high + "*" + jsNum( highCompress ) +
         "*max($T[1]-" + jsNum( highKnee ) + ",0),1),0)",
      "max(min(($T[2]*(1-" + high + "*" + jsNum( highDesat ) +
         ")+" + avg + "*" + high + "*" + jsNum( highDesat ) +
         ")-" + high + "*" + jsNum( highCompress ) +
         "*max($T[2]-" + jsNum( highKnee ) + ",0),1),0)",
      "core-highlight-control"
   );

   win.maskEnabled = false;
   try { win.removeMask(); } catch ( e ) { logMsg( "removeMask note: " + e ); }

   logMsg( "Applying presentation curves" );
   let C = new CurvesTransformation;
   C.K = [
      [0.00000, 0.00000],
      [0.10000, 0.08500],
      [0.32000, 0.34500],
      [0.65000, 0.70500],
      [0.90000, 0.93000],
      [1.00000, 1.00000]
   ];
   C.Kt = CurvesTransformation.AkimaSubsplines;
   C.S = [
      [0.00000, 0.00000],
      [0.22000, 0.22000 + numArg( "satLow", 0.015 )],
      [0.52000, 0.52000 + numArg( "satMid", 0.045 )],
      [0.82000, 0.82000 + numArg( "satHigh", 0.025 )],
      [1.00000, 1.00000]
   ];
   C.St = CurvesTransformation.AkimaSubsplines;
   if ( !C.executeOn( view ) )
      throw new Error( "Curves failed" );

   logMsg( "Cropping to M42/M43 field" );
   applyCrop( view,
              numArg( "centerX", 0.405 ),
              numArg( "centerY", 0.650 ),
              numArg( "width", 0.430 ),
              numArg( "height", 0.500 ) );
   logMsg( "cropped image=" + view.image.width + "x" + view.image.height );

   let ok = win.saveAs( output, false, false, false, false );
   logMsg( "save XISF returned=" + ok );
   if ( !ok )
      throw new Error( "XISF save failed" );

   if ( tiff )
   {
      ok = win.saveAs( tiff, false, false, false, false );
      logMsg( "save TIFF returned=" + ok );
      if ( !ok )
         throw new Error( "TIFF save failed" );
   }

   if ( jpg )
   {
      let image = view.image;
      let jpgWin = new ImageWindow( image.width, image.height,
                                    image.numberOfChannels, 8, false,
                                    image.isColor, "m42_v1_jpeg" );
      jpgWin.mainView.beginProcess( UndoFlag.NoSwapFile );
      jpgWin.mainView.image.assign( image );
      jpgWin.mainView.endProcess();

      if ( jpgScale > 0 && Math.abs( jpgScale - 1 ) > 0.0001 )
      {
         let R = new Resample;
         R.xSize = jpgScale;
         R.ySize = jpgScale;
         R.mode = Resample.RelativeDimensions;
         R.absoluteMode = Resample.ForceWidthAndHeight;
         R.interpolation = Resample.Auto;
         R.clampingThreshold = 0.30;
         R.smoothness = 1.50;
         R.executeOn( jpgWin.mainView, false );
      }

      ok = jpgWin.saveAs( jpg, false, false, false, false );
      logMsg( "save JPEG returned=" + ok );
      jpgWin.forceClose();
      if ( !ok )
         throw new Error( "JPEG save failed" );
   }

   if ( coreMask && !coreMask.isNull )
      coreMask.forceClose();
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

f.close();
