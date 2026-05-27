// Trifid/Lagoon v1 nonlinear polish.
// Starts from a MaskedStretch image and applies restrained wide-field
// presentation shaping: sky chroma cleanup, protected red/blue nebula lift,
// mild local contrast, curves, and optional TIFF/JPEG exports.
// Usage:
//   -r=03t-trifid-lagoon-v1-polish.js,input=<xisf>,output=<xisf>,tiff=<tif>,jpg=<jpg>,log=<path>

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

var logPath = arg( "log", "work/logs/03t-trifid-lagoon-v1-polish.log" );
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
   let jpgScale = numArg( "jpgScale", 0.45 );

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

   let L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let bg = "(1-" + smoothStepExpr( L, numArg( "bgLow", 0.055 ),
                                      numArg( "bgHigh", 0.18 ) ) + ")";
   let avg = "(($T[0]+$T[1]+$T[2])/3)";

   runPixelMath(
      view,
      "max(min($T[0]-" + bg + "*" + jsNum( numArg( "skyRedNeutral", 0.15 ) ) +
         "*max($T[0]-($T[1]+$T[2])/2,0),1),0)",
      "max(min($T[1]-" + bg + "*" + jsNum( numArg( "skyGreenNeutral", 0.34 ) ) +
         "*max($T[1]-($T[0]+$T[2])/2,0),1),0)",
      "max(min($T[2]-" + bg + "*" + jsNum( numArg( "skyBlueNeutral", 0.18 ) ) +
         "*max($T[2]-($T[0]+$T[1])/2,0),1),0)",
      "low-sky-chroma-cleanup"
   );

   L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let starProtect = "(1-" + smoothStepExpr( L, numArg( "starLow", 0.32 ),
                                               numArg( "starHigh", 0.72 ) ) + ")";
   let redExcess = "max(0,$T[0]-($T[1]+$T[2])/2)";
   let blueExcess = "max(0,$T[2]-($T[0]+$T[1])/2)";
   let redMask = "((" + smoothStepExpr( redExcess,
                                         numArg( "redLow", 0.012 ),
                                         numArg( "redHigh", 0.090 ) ) +
                 ")*" + starProtect + ")";
   let blueMask = "((" + smoothStepExpr( blueExcess,
                                          numArg( "blueLow", 0.010 ),
                                          numArg( "blueHigh", 0.080 ) ) +
                  ")*" + starProtect + ")";

   runPixelMath(
      view,
      "max(min($T[0]+" + redMask + "*" + jsNum( numArg( "redLift", 0.070 ) ) +
         "*(1-$T[0])+" + redMask + "*" + jsNum( numArg( "nebContrast", 0.035 ) ) +
         "*($T[0]-0.28),1),0)",
      "max(min($T[1]*(1-" + redMask + "*" + jsNum( numArg( "greenDrop", 0.040 ) ) +
         ")+" + blueMask + "*" + jsNum( numArg( "blueGreenLift", 0.010 ) ) +
         "*(1-$T[1]),1),0)",
      "max(min($T[2]+" + blueMask + "*" + jsNum( numArg( "blueLift", 0.045 ) ) +
         "*(1-$T[2])+" + blueMask + "*" + jsNum( numArg( "blueContrast", 0.025 ) ) +
         "*($T[2]-0.25),1),0)",
      "protected-nebula-color"
   );

   logMsg( "Applying mild LocalHistogramEqualization" );
   let LHE = new LocalHistogramEqualization;
   LHE.radius = Math.round( numArg( "lheRadius", 96 ) );
   LHE.slopeLimit = numArg( "lheSlope", 1.25 );
   LHE.amount = numArg( "lheAmount", 0.10 );
   LHE.histogramBins = 0;
   LHE.circularKernel = true;
   if ( !LHE.executeOn( view ) )
      throw new Error( "LHE failed" );

   logMsg( "Applying final curves" );
   let C = new CurvesTransformation;
   let k08 = numArg( "k08", 0.058 );
   let k24 = numArg( "k24", 0.235 );
   let k52 = numArg( "k52", 0.575 );
   let k82 = numArg( "k82", 0.875 );
   C.K = [
      [ 0.00000, 0.00000 ],
      [ 0.08000, k08 ],
      [ 0.24000, k24 ],
      [ 0.52000, k52 ],
      [ 0.82000, k82 ],
      [ 1.00000, 1.00000 ]
   ];
   C.Kt = CurvesTransformation.AkimaSubsplines;
   let sat = numArg( "satAmount", 0.055 );
   C.S = [
      [ 0.00000, 0.00000 ],
      [ 0.20000, 0.20000 + sat*0.10 ],
      [ 0.52000, 0.52000 + sat ],
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
                                    image.isColor, "trifid_lagoon_v1_jpeg" );
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
