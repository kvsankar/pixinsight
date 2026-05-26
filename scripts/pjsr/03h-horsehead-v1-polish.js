// Horsehead v1 nonlinear polish.
// Starts from the cropped MaskedStretch candidate. Applies restrained sky
// neutrality, highlight desaturation/compression, nebula contrast/color lift,
// and optional JPEG/TIFF exports.
// Usage:
//   -r=03h-horsehead-v1-polish.js,input=<xisf>,output=<xisf>,tiff=<tif>,jpg=<jpg>,log=<path>

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

var logPath = arg( "log", "work/logs/03h-horsehead-v1-polish.log" );
var f = new File;
f.createForWriting( logPath );

function logMsg( msg )
{
   f.outTextLn( new Date().toISOString() + " " + msg );
   f.flush();
   console.noteln( msg );
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

try
{
   let input = arg( "input", null );
   let output = arg( "output", null );
   let tiff = arg( "tiff", "" );
   let jpg = arg( "jpg", "" );
   if ( !input || !output )
      throw new Error( "Missing input or output" );

   let bgLow = numArg( "bgLow", 0.08 );
   let bgHigh = numArg( "bgHigh", 0.24 );
   let redNeutral = numArg( "redNeutral", 0.45 );
   let blueNeutral = numArg( "blueNeutral", 0.55 );
   let greenNeutral = numArg( "greenNeutral", 0.25 );
   let nebLow = numArg( "nebLow", 0.030 );
   let nebHigh = numArg( "nebHigh", 0.145 );
   let nebRedLift = numArg( "nebRedLift", 0.085 );
   let nebBlueDrop = numArg( "nebBlueDrop", 0.025 );
   let nebContrast = numArg( "nebContrast", 0.075 );
   let highLow = numArg( "highLow", 0.55 );
   let highHigh = numArg( "highHigh", 0.86 );
   let highDesat = numArg( "highDesat", 0.32 );
   let highCompress = numArg( "highCompress", 0.42 );
   let highKnee = numArg( "highKnee", 0.66 );
   let satAmount = numArg( "satAmount", 0.055 );
   let jpgScale = numArg( "jpgScale", 0.50 );

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
   let bg = "(1-" + smoothStepExpr( L, bgLow, bgHigh ) + ")";
   let avg = "(($T[0]+$T[1]+$T[2])/3)";

   runPixelMath(
      view,
      "max(min($T[0]-" + bg + "*" + jsNum( redNeutral ) +
         "*max($T[0]-($T[1]+$T[2])/2,0),1),0)",
      "max(min($T[1]-" + bg + "*" + jsNum( greenNeutral ) +
         "*max($T[1]-($T[0]+$T[2])/2,0),1),0)",
      "max(min($T[2]-" + bg + "*" + jsNum( blueNeutral ) +
         "*max($T[2]-($T[0]+$T[1])/2,0),1),0)",
      "sky-neutrality"
   );

   L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let high = smoothStepExpr( L, highLow, highHigh );
   avg = "(($T[0]+$T[1]+$T[2])/3)";
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
      "highlight-control"
   );

   L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let redExcess = "max(0,$T[0]-($T[1]+$T[2])/2)";
   let redSignal = smoothStepExpr( redExcess, nebLow, nebHigh );
   let starProtect = "(1-" + smoothStepExpr( L, 0.52, 0.82 ) + ")";
   let neb = "((" + redSignal + ")*(" + starProtect + "))";
   runPixelMath(
      view,
      "max(min($T[0]+" + neb + "*" + jsNum( nebRedLift ) +
         "*(1-$T[0])+" + neb + "*" + jsNum( nebContrast ) +
         "*($T[0]-0.42),1),0)",
      "max(min($T[1]+" + neb + "*" + jsNum( nebContrast*0.30 ) +
         "*($T[1]-0.42),1),0)",
      "max(min($T[2]*(1-" + neb + "*" + jsNum( nebBlueDrop ) +
         ")+" + neb + "*" + jsNum( nebContrast*0.20 ) +
         "*($T[2]-0.42),1),0)",
      "nebula-lift"
   );

   if ( satAmount > 0 )
   {
      let C = new CurvesTransformation;
      C.K = [
         [ 0.00000, 0.00000 ],
         [ 0.08000, 0.05500 ],
         [ 0.28000, 0.25500 ],
         [ 0.56000, 0.59000 ],
         [ 0.85000, 0.89500 ],
         [ 1.00000, 1.00000 ]
      ];
      C.Kt = CurvesTransformation.AkimaSubsplines;
      C.S = [
         [ 0.00000, 0.00000 ],
         [ 0.22000, 0.22000 + satAmount*0.20 ],
         [ 0.52000, 0.52000 + satAmount ],
         [ 0.82000, 0.82000 + satAmount*0.30 ],
         [ 1.00000, 1.00000 ]
      ];
      C.St = CurvesTransformation.AkimaSubsplines;
      if ( !C.executeOn( view ) )
         throw new Error( "CurvesTransformation failed" );
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
                                    image.isColor, "horsehead_v1_jpeg" );
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
