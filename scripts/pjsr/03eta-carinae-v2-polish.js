// Eta Carinae v2 nonlinear polish.
// Starts from the cropped brighter MaskedStretch candidate and applies
// restrained sky cleanup, protected red-nebula lift, mild local contrast,
// curves, and optional JPEG/TIFF exports.
// Usage:
//   -r=03eta-carinae-v2-polish.js,input=<xisf>,output=<xisf>,jpg=<jpg>,log=<path>

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

var logPath = arg( "log", "work/logs/03eta-carinae-v2-polish.log" );
var f = new File;
f.createForWriting( logPath );

function logMsg( msg )
{
   f.outTextLn( new Date().toISOString() + " " + msg );
   f.flush();
   console.noteln( msg );
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
   let jpgScale = numArg( "jpgScale", 0.50 );

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
   let bg = "(1-" + smoothStepExpr( L, numArg( "bgLow", 0.045 ),
                                      numArg( "bgHigh", 0.180 ) ) + ")";

   runPixelMath(
      view,
      "max(min($T[0]-" + bg + "*" + jsNum( numArg( "skyRedNeutral", 0.10 ) ) +
         "*max($T[0]-($T[1]+$T[2])/2,0),1),0)",
      "max(min($T[1]-" + bg + "*" + jsNum( numArg( "skyGreenNeutral", 0.22 ) ) +
         "*max($T[1]-($T[0]+$T[2])/2,0),1),0)",
      "max(min($T[2]-" + bg + "*" + jsNum( numArg( "skyBlueNeutral", 0.18 ) ) +
         "*max($T[2]-($T[0]+$T[1])/2,0),1),0)",
      "low-sky-chroma-cleanup"
   );

   L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let redExcess = "max(0,$T[0]-($T[1]+$T[2])/2)";
   let redMask = "((" + smoothStepExpr( redExcess,
                                         numArg( "redLow", 0.006 ),
                                         numArg( "redHigh", 0.065 ) ) +
                 ")*(" + smoothStepExpr( L,
                                          numArg( "nebLLow", 0.035 ),
                                          numArg( "nebLHigh", 0.360 ) ) +
                 ")*(1-" + smoothStepExpr( L,
                                            numArg( "starProtectLow", 0.500 ),
                                            numArg( "starProtectHigh", 0.820 ) ) +
                 "))";

   runPixelMath(
      view,
      "max(min($T[0]+" + redMask + "*" + jsNum( numArg( "redLift", 0.100 ) ) +
         "*(1-$T[0])+" + redMask + "*" + jsNum( numArg( "nebContrast", 0.045 ) ) +
         "*($T[0]-0.28),1),0)",
      "max(min($T[1]*(1-" + redMask + "*" + jsNum( numArg( "greenDrop", 0.030 ) ) +
         ")+" + redMask + "*" + jsNum( numArg( "greenContrast", 0.010 ) ) +
         "*($T[1]-0.28),1),0)",
      "max(min($T[2]*(1-" + redMask + "*" + jsNum( numArg( "blueDrop", 0.045 ) ) +
         "),1),0)",
      "protected-red-nebula-lift"
   );

   logMsg( "Applying mild LocalHistogramEqualization" );
   let LHE = new LocalHistogramEqualization;
   LHE.radius = Math.round( numArg( "lheRadius", 104 ) );
   LHE.slopeLimit = numArg( "lheSlope", 1.22 );
   LHE.amount = numArg( "lheAmount", 0.12 );
   LHE.histogramBins = 0;
   LHE.circularKernel = true;
   if ( !LHE.executeOn( view ) )
      throw new Error( "LHE failed" );

   logMsg( "Applying final curves" );
   let C = new CurvesTransformation;
   C.K = [
      [ 0.00000, 0.00000 ],
      [ 0.08000, numArg( "k08", 0.052 ) ],
      [ 0.24000, numArg( "k24", 0.222 ) ],
      [ 0.52000, numArg( "k52", 0.602 ) ],
      [ 0.82000, numArg( "k82", 0.900 ) ],
      [ 1.00000, 1.00000 ]
   ];
   C.Kt = CurvesTransformation.AkimaSubsplines;
   let sat = numArg( "satAmount", 0.068 );
   C.S = [
      [ 0.00000, 0.00000 ],
      [ 0.18000, 0.18000 + sat*0.05 ],
      [ 0.50000, 0.50000 + sat ],
      [ 0.82000, 0.82000 + sat*0.22 ],
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
                                    image.isColor, "eta_carinae_v2_jpeg" );
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
