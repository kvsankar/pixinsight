// Comet Catalina historical-style presentation candidate.
// Starts from the linear no-flat SPCC branch. Applies a darker MaskedStretch,
// restrained low-sky chroma cleanup, comet color protection, mild star
// restraint, final curves, crop, and optional JPEG/TIFF exports.
// Usage:
//   -r=03catalina-historical-style.js,input=<xisf>,output=<xisf>,jpg=<jpg>,log=<path>

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

var logPath = arg( "log", "work/logs/03catalina-historical-style.log" );
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

   let w = view.image.width;
   let h = view.image.height;
   logMsg( "image=" + w + "x" + h );

   logMsg( "Applying MaskedStretch" );
   let ms = new MaskedStretch;
   ms.targetBackground = numArg( "targetBackground", 0.076 );
   ms.numberOfIterations = Math.round( numArg( "iterations", 100 ) );
   ms.clippingFraction = numArg( "clippingFraction", 0.0005 );
   ms.backgroundLow = 0.0;
   ms.backgroundHigh = numArg( "backgroundHigh", 0.05 );
   ms.backgroundReferenceViewId = "";
   ms.useROI = true;
   ms.roiX0 = Math.floor( w * numArg( "roiX0", 0.84 ) );
   ms.roiY0 = Math.floor( h * numArg( "roiY0", 0.05 ) );
   ms.roiX1 = Math.floor( w * numArg( "roiX1", 0.98 ) );
   ms.roiY1 = Math.floor( h * numArg( "roiY1", 0.20 ) );
   ms.maskType = 0;
   logMsg( "MaskedStretch targetBackground=" + ms.targetBackground +
           " roi=" + ms.roiX0 + "," + ms.roiY0 + "-" + ms.roiX1 + "," + ms.roiY1 );
   if ( !ms.executeOn( view ) )
      throw new Error( "MaskedStretch failed" );

   let L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let avg = "(($T[0]+$T[1]+$T[2])/3)";
   let cyanGreen = "max(0,(($T[1]+$T[2])/2)-$T[0])";
   let cometProtect = "((" + smoothStepExpr( cyanGreen,
                                              numArg( "cometColorLow", 0.012 ),
                                              numArg( "cometColorHigh", 0.075 ) ) +
                       ")*(" + smoothStepExpr( L,
                                                numArg( "cometLLow", 0.050 ),
                                                numArg( "cometLHigh", 0.380 ) ) +
                       ")*(1-" + smoothStepExpr( L,
                                                  numArg( "cometHighProtectLow", 0.600 ),
                                                  numArg( "cometHighProtectHigh", 0.900 ) ) +
                       "))";
   let bg = "((1-" + smoothStepExpr( L,
                                      numArg( "bgLow", 0.042 ),
                                      numArg( "bgHigh", 0.160 ) ) +
            ")*(1-" + jsNum( numArg( "cometProtectStrength", 0.72 ) ) +
            "*" + cometProtect + "))";

   runPixelMath(
      view,
      "max(min($T[0]-" + bg + "*" + jsNum( numArg( "skyRedNeutral", 0.07 ) ) +
         "*max($T[0]-" + avg + ",0),1),0)",
      "max(min($T[1]-" + bg + "*" + jsNum( numArg( "skyGreenNeutral", 0.06 ) ) +
         "*max($T[1]-" + avg + ",0),1),0)",
      "max(min($T[2]-" + bg + "*" + jsNum( numArg( "skyBlueNeutral", 0.08 ) ) +
         "*max($T[2]-" + avg + ",0),1),0)",
      "protected-low-sky-chroma-cleanup"
   );

   L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   cyanGreen = "max(0,(($T[1]+$T[2])/2)-$T[0])";
   cometProtect = "((" + smoothStepExpr( cyanGreen,
                                          numArg( "cometColorLow2", 0.010 ),
                                          numArg( "cometColorHigh2", 0.080 ) ) +
                  ")*(" + smoothStepExpr( L,
                                           numArg( "cometLLow2", 0.045 ),
                                           numArg( "cometLHigh2", 0.420 ) ) +
                  ")*(1-" + smoothStepExpr( L,
                                             numArg( "starProtectLow", 0.530 ),
                                             numArg( "starProtectHigh", 0.830 ) ) +
                  "))";
   let lift = jsNum( numArg( "cometLift", 0.030 ) );
   let contrast = jsNum( numArg( "cometContrast", 0.018 ) );
   runPixelMath(
      view,
      "max(min($T[0]+" + cometProtect + "*" + lift + "*0.55*(1-$T[0])+" +
         cometProtect + "*" + contrast + "*($T[0]-0.22),1),0)",
      "max(min($T[1]+" + cometProtect + "*" + lift + "*(1-$T[1])+" +
         cometProtect + "*" + contrast + "*($T[1]-0.22),1),0)",
      "max(min($T[2]+" + cometProtect + "*" + lift + "*0.82*(1-$T[2])+" +
         cometProtect + "*" + contrast + "*($T[2]-0.22),1),0)",
      "subtle-comet-color-and-fan-protection"
   );

   L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let high = smoothStepExpr( L, numArg( "highLow", 0.560 ),
                                 numArg( "highHigh", 0.900 ) );
   avg = "(($T[0]+$T[1]+$T[2])/3)";
   let highDesat = jsNum( numArg( "highDesat", 0.18 ) );
   let highCompress = jsNum( numArg( "highCompress", 0.08 ) );
   let highKnee = jsNum( numArg( "highKnee", 0.780 ) );
   runPixelMath(
      view,
      "max(min(($T[0]*(1-" + high + "*" + highDesat + ")+" +
         avg + "*" + high + "*" + highDesat + ")-" + high + "*" +
         highCompress + "*max($T[0]-" + highKnee + ",0),1),0)",
      "max(min(($T[1]*(1-" + high + "*" + highDesat + ")+" +
         avg + "*" + high + "*" + highDesat + ")-" + high + "*" +
         highCompress + "*max($T[1]-" + highKnee + ",0),1),0)",
      "max(min(($T[2]*(1-" + high + "*" + highDesat + ")+" +
         avg + "*" + high + "*" + highDesat + ")-" + high + "*" +
         highCompress + "*max($T[2]-" + highKnee + ",0),1),0)",
      "bright-star-restraint"
   );

   let lheAmount = numArg( "lheAmount", 0.035 );
   if ( lheAmount > 0 )
   {
      logMsg( "Applying mild LocalHistogramEqualization" );
      let LHE = new LocalHistogramEqualization;
      LHE.radius = Math.round( numArg( "lheRadius", 140 ) );
      LHE.slopeLimit = numArg( "lheSlope", 1.14 );
      LHE.amount = lheAmount;
      LHE.histogramBins = 0;
      LHE.circularKernel = true;
      if ( !LHE.executeOn( view ) )
         throw new Error( "LocalHistogramEqualization failed" );
   }

   logMsg( "Applying final curves" );
   let C = new CurvesTransformation;
   C.K = [
      [ 0.00000, 0.00000 ],
      [ 0.04000, numArg( "k04", 0.022 ) ],
      [ 0.10000, numArg( "k10", 0.070 ) ],
      [ 0.25000, numArg( "k25", 0.238 ) ],
      [ 0.52000, numArg( "k52", 0.575 ) ],
      [ 0.82000, numArg( "k82", 0.890 ) ],
      [ 1.00000, 1.00000 ]
   ];
   C.Kt = CurvesTransformation.AkimaSubsplines;
   let sat = numArg( "satAmount", 0.032 );
   C.S = [
      [ 0.00000, 0.00000 ],
      [ 0.18000, 0.18000 + sat*0.03 ],
      [ 0.50000, 0.50000 + sat ],
      [ 0.82000, 0.82000 + sat*0.16 ],
      [ 1.00000, 1.00000 ]
   ];
   C.St = CurvesTransformation.AkimaSubsplines;
   if ( !C.executeOn( view ) )
      throw new Error( "CurvesTransformation failed" );

   let cropWidth = numArg( "cropWidth", 0.966 );
   let cropHeight = numArg( "cropHeight", 0.966 );
   if ( cropWidth < 0.999 || cropHeight < 0.999 )
   {
      logMsg( "Applying border crop" );
      let crop = new DynamicCrop;
      crop.centerX = numArg( "cropCenterX", 0.5000 );
      crop.centerY = numArg( "cropCenterY", 0.5000 );
      crop.width = cropWidth;
      crop.height = cropHeight;
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
      logMsg( "cropped image=" + view.image.width + "x" + view.image.height );
   }

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
                                    image.isColor, "catalina_historical_style_jpeg" );
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
