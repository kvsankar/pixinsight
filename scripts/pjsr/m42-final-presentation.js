// M42 final presentation polish.
// Applies a small post-blend color/contrast adjustment to an already nonlinear
// image. This is intended for presentation exports, not calibration.
// Usage:
//   -r=m42-final-presentation.js,input=<xisf>,output=<xisf>,tiff=<tif>,jpg=<jpg>,log=<path>

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

function clamp01( x )
{
   return Math.max( 0, Math.min( 1, x ) );
}

var logPath = arg( "log", "work/logs/m42-final-presentation.log" );
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
   let jpgScale = numArg( "jpgScale", 0.70 );
   if ( !input || !output )
      throw new Error( "Missing input or output" );

   logMsg( "input=" + input );
   logMsg( "output=" + output );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let win = windows[0];
   let view = win.mainView;
   if ( !view.image.isColor || view.image.numberOfChannels < 3 )
      throw new Error( "Expected RGB input" );
   logMsg( "image=" + view.image.width + "x" + view.image.height );

   let greenReduce = numArg( "greenReduce", 0.35 );
   if ( greenReduce > 0 )
   {
      let g = "$T[1]-" + jsNum( greenReduce ) + "*max($T[1]-max($T[0],$T[2]),0)";
      runPixelMath( view, "$T[0]", "max(min(" + g + ",1),0)", "$T[2]",
                    "excess-green-reduction" );
   }

   let faintLift = numArg( "faintLift", 0.0 );
   if ( faintLift > 0 )
   {
      let L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
      let signal = smoothStepExpr( L, numArg( "faintLow", 0.025 ),
                                   numArg( "faintHigh", 0.180 ) );
      let protect = "1-" + smoothStepExpr( L, numArg( "faintProtectLow", 0.380 ),
                                           numArg( "faintProtectHigh", 0.650 ) );
      let m = "(" + signal + ")*(" + protect + ")";
      let lift = jsNum( faintLift );
      runPixelMath(
         view,
         "max(min($T[0]+" + lift + "*" + m + "*(1-$T[0]),1),0)",
         "max(min($T[1]+" + lift + "*" + m + "*(1-$T[1]),1),0)",
         "max(min($T[2]+" + lift + "*" + m + "*(1-$T[2]),1),0)",
         "faint-nebulosity-lift"
      );
   }

   let blackPoint = numArg( "blackPoint", 0.010 );
   if ( blackPoint > 0 )
   {
      let den = jsNum( 1 - blackPoint );
      let bp = jsNum( blackPoint );
      runPixelMath(
         view,
         "max(min(($T[0]-" + bp + ")/" + den + ",1),0)",
         "max(min(($T[1]-" + bp + ")/" + den + ",1),0)",
         "max(min(($T[2]-" + bp + ")/" + den + ",1),0)",
         "black-point-contrast"
      );
   }

   let contrast = numArg( "contrast", 1.0 );
   let satCurve = numArg( "satCurve", 1.0 );
   if ( Math.abs( contrast ) > 0.0001 || Math.abs( satCurve ) > 0.0001 )
   {
      logMsg( "Applying final curves contrast=" + contrast + " satCurve=" + satCurve );
      let C = new CurvesTransformation;
      C.K = [
         [0.00000, 0.00000],
         [0.08000, clamp01( 0.08000 - 0.03500*contrast )],
         [0.35000, clamp01( 0.35000 + 0.01500*contrast )],
         [0.65000, clamp01( 0.65000 + 0.04000*contrast )],
         [0.90000, clamp01( 0.90000 + 0.01500*contrast )],
         [1.00000, 1.00000]
      ];
      C.Kt = CurvesTransformation.AkimaSubsplines;
      C.S = [
         [0.00000, 0.00000],
         [0.18000, clamp01( 0.18000 + 0.04000*satCurve )],
         [0.50000, clamp01( 0.50000 + 0.14000*satCurve )],
         [0.80000, clamp01( 0.80000 + 0.06000*satCurve )],
         [1.00000, 1.00000]
      ];
      C.St = CurvesTransformation.AkimaSubsplines;
      if ( !C.executeOn( view ) )
         throw new Error( "Final curves failed" );
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
                                    image.isColor, "m42_final_jpeg" );
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
   logMsg( "ERROR: " + e );
   f.close();
   throw e;
}

f.close();
