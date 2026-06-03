// Canis Major wide-field v1 nonlinear polish.
// Starts from a MaskedStretch image. Applies low-sky chroma cleanup,
// restrained highlight desaturation/compression, final curves, and optional
// TIFF/JPEG exports.
// Usage:
//   -r=03canis-major-v1-polish.js,input=<xisf>,output=<xisf>,tiff=<tif>,jpg=<jpg>,log=<path>

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

var logPath = arg( "log", "work/logs/03canis-major-v1-polish.log" );
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
   logMsg( "image=" + view.image.width + "x" + view.image.height );

   let L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let bg = "(1-" + smoothStepExpr( L, numArg( "bgLow", 0.055 ),
                                      numArg( "bgHigh", 0.180 ) ) + ")";

   runPixelMath(
      view,
      "max(min($T[0]-" + bg + "*" + jsNum( numArg( "skyRedNeutral", 0.10 ) ) +
         "*max($T[0]-($T[1]+$T[2])/2,0),1),0)",
      "max(min($T[1]-" + bg + "*" + jsNum( numArg( "skyGreenNeutral", 0.08 ) ) +
         "*max($T[1]-($T[0]+$T[2])/2,0),1),0)",
      "max(min($T[2]-" + bg + "*" + jsNum( numArg( "skyBlueNeutral", 0.10 ) ) +
         "*max($T[2]-($T[0]+$T[1])/2,0),1),0)",
      "low-sky-chroma-cleanup"
   );

   L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let high = smoothStepExpr( L, numArg( "highLow", 0.600 ),
                                 numArg( "highHigh", 0.900 ) );
   let avg = "(($T[0]+$T[1]+$T[2])/3)";
   let highDesat = jsNum( numArg( "highDesat", 0.18 ) );
   let highCompress = jsNum( numArg( "highCompress", 0.10 ) );
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

   logMsg( "Applying final curves" );
   let C = new CurvesTransformation;
   C.K = [
      [ 0.00000, 0.00000 ],
      [ 0.05500, numArg( "k055", 0.032 ) ],
      [ 0.15000, numArg( "k15", 0.120 ) ],
      [ 0.38000, numArg( "k38", 0.385 ) ],
      [ 0.76000, numArg( "k76", 0.805 ) ],
      [ 1.00000, 1.00000 ]
   ];
   C.Kt = CurvesTransformation.AkimaSubsplines;
   let sat = numArg( "satAmount", 0.040 );
   C.S = [
      [ 0.00000, 0.00000 ],
      [ 0.18000, 0.18000 + sat*0.04 ],
      [ 0.52000, 0.52000 + sat ],
      [ 0.86000, 0.86000 + sat*0.18 ],
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
                                    image.isColor, "canis_major_v1_jpeg" );
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
