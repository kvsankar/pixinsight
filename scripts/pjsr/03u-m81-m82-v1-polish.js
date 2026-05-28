// M81/M82 v1 nonlinear polish.
// Starts from a MaskedStretch image. Applies low-sky chroma cleanup,
// background chroma smoothing protected by a galaxy mask, mild galaxy-local
// contrast, final curves, and optional TIFF/JPEG exports.
// Usage:
//   -r=03u-m81-m82-v1-polish.js,input=<xisf>,output=<xisf>,tiff=<tif>,jpg=<jpg>,log=<path>

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

var logPath = arg( "log", "work/logs/03u-m81-m82-v1-polish.log" );
var f = new File;
f.createForWriting( logPath );

function logMsg( msg )
{
   f.outTextLn( new Date().toISOString() + " " + msg );
   f.flush();
   console.noteln( msg );
}

try
{
   let input = arg( "input", "" );
   let output = arg( "output", "" );
   let tiff = arg( "tiff", "" );
   let jpg = arg( "jpg", "" );
   let jpgScale = numArg( "jpgScale", 0.35 );
   let maskDir = arg( "maskdir", "" );

   if ( !input || !output )
      throw new Error( "Missing input or output" );

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

   if ( !maskDir )
      maskDir = File.extractDrive( output ) + File.extractDirectory( output ) + "/masks";
   if ( !File.directoryExists( maskDir ) )
      File.createDirectory( maskDir );

   logMsg( "Generating galaxy range mask" );
   let beforeRange = windowIds();
   let RS = new RangeSelection;
   RS.lowRange = numArg( "maskLow", 0.105 );
   RS.highRange = numArg( "maskHigh", 1.000 );
   RS.fuzziness = numArg( "maskFuzz", 0.095 );
   RS.smoothness = numArg( "maskSmooth", 5.000 );
   RS.toLightness = true;
   RS.invert = false;
   RS.screening = false;
   if ( !RS.executeOn( view ) )
      throw new Error( "RangeSelection failed" );
   let rangeWin = findNewWindow( beforeRange );
   if ( !rangeWin )
      throw new Error( "RangeSelection did not create a mask window" );
   let rangePath = maskDir + "/03u-m81-m82-galaxy-range-mask.xisf";
   rangeWin.saveAs( rangePath, false, false, false, false );
   logMsg( "Saved range mask: " + rangePath );

   let L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let bg = "(1-" + smoothStepExpr( L, numArg( "bgLow", 0.045 ),
                                      numArg( "bgHigh", 0.175 ) ) + ")";

   runPixelMath(
      view,
      "max(min($T[0]-" + bg + "*" + jsNum( numArg( "skyRedNeutral", 0.30 ) ) +
         "*max($T[0]-($T[1]+$T[2])/2,0),1),0)",
      "max(min($T[1]-" + bg + "*" + jsNum( numArg( "skyGreenNeutral", 0.12 ) ) +
         "*max($T[1]-($T[0]+$T[2])/2,0),1),0)",
      "max(min($T[2]-" + bg + "*" + jsNum( numArg( "skyBlueNeutral", 0.28 ) ) +
         "*max($T[2]-($T[0]+$T[1])/2,0),1),0)",
      "low-sky-chroma-cleanup"
   );

   win.setMask( rangeWin, false );
   win.maskEnabled = true;
   win.maskInverted = true; // protect galaxy cores/arms while smoothing background chroma
   win.maskVisible = false;

   logMsg( "Applying background chrominance smoothing" );
   let MLT = new MultiscaleLinearTransform;
   MLT.layers = [
      [true, true, 0.000, true, 2.2000, 0.38, 1],
      [true, true, 0.000, true, 1.6000, 0.30, 1],
      [true, true, 0.000, true, 0.9000, 0.20, 1],
      [true, true, 0.000, false, 0.5000, 1.00, 1]
   ];
   MLT.transform = MultiscaleLinearTransform.StarletTransform;
   MLT.scaleDelta = 0;
   MLT.linearMask = false;
   MLT.noiseThresholding = false;
   MLT.softThresholding = true;
   MLT.toLuminance = false;
   MLT.toChrominance = true;
   MLT.linear = false;
   MLT.previewMode = MultiscaleLinearTransform.Disabled;
   if ( !MLT.executeOn( view ) )
      throw new Error( "Background chroma MLT failed" );

   win.maskEnabled = false;
   try { win.removeMask(); } catch ( e ) { logMsg( "removeMask note: " + e ); }

   logMsg( "Applying galaxy-local HDR/LHE" );
   win.setMask( rangeWin, false );
   win.maskEnabled = true;
   win.maskInverted = false;
   win.maskVisible = false;

   let HDR = new HDRMultiscaleTransform;
   HDR.numberOfLayers = Math.round( numArg( "hdrLayers", 8 ) );
   HDR.numberOfIterations = 1;
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

   let LHE = new LocalHistogramEqualization;
   LHE.radius = Math.round( numArg( "lheRadius", 84 ) );
   LHE.slopeLimit = numArg( "lheSlope", 1.16 );
   LHE.amount = numArg( "lheAmount", 0.13 );
   LHE.histogramBins = 0;
   LHE.circularKernel = true;
   if ( !LHE.executeOn( view ) )
      throw new Error( "LHE failed" );

   win.maskEnabled = false;
   try { win.removeMask(); } catch ( e2 ) { logMsg( "removeMask note: " + e2 ); }

   logMsg( "Applying final curves" );
   let C = new CurvesTransformation;
   C.K = [
      [ 0.00000, 0.00000 ],
      [ 0.07000, numArg( "k07", 0.050 ) ],
      [ 0.22000, numArg( "k22", 0.215 ) ],
      [ 0.52000, numArg( "k52", 0.565 ) ],
      [ 0.83000, numArg( "k83", 0.885 ) ],
      [ 1.00000, 1.00000 ]
   ];
   C.Kt = CurvesTransformation.AkimaSubsplines;
   let sat = numArg( "satAmount", 0.060 );
   C.S = [
      [ 0.00000, 0.00000 ],
      [ 0.18000, 0.18000 + sat*0.05 ],
      [ 0.50000, 0.50000 + sat ],
      [ 0.82000, 0.82000 + sat*0.25 ],
      [ 1.00000, 1.00000 ]
   ];
   C.St = CurvesTransformation.AkimaSubsplines;
   if ( !C.executeOn( view ) )
      throw new Error( "CurvesTransformation failed" );

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
                                    image.isColor, "m81_m82_v1_jpeg" );
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
         if ( !R.executeOn( jpgWin.mainView, false ) )
            throw new Error( "JPEG resample failed" );
      }

      ok = jpgWin.saveAs( jpg, false, false, false, false );
      logMsg( "save JPEG returned=" + ok );
      jpgWin.forceClose();
      if ( !ok )
         throw new Error( "JPEG save failed" );
   }

   if ( rangeWin && !rangeWin.isNull )
      rangeWin.forceClose();
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
