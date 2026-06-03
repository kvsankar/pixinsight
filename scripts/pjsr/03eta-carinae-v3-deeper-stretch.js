// Eta Carinae v3 deeper nonlinear stretch.
// Starts from the v2 polished crop and applies a controlled midtone lift,
// protected red-nebula/color lift, mild highlight restraint, and optional
// JPEG/TIFF exports. This is a diagnostic stronger stretch, not a replacement
// for v2 unless judge crops accept the added noise.
// Usage:
//   -r=03eta-carinae-v3-deeper-stretch.js,input=<xisf>,output=<xisf>,jpg=<jpg>,log=<path>

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

var logPath = arg( "log", "work/logs/03eta-carinae-v3-deeper-stretch.log" );
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

   logMsg( "Applying controlled luminance curve" );
   let C1 = new CurvesTransformation;
   C1.K = [
      [ 0.00000, 0.00000 ],
      [ 0.07000, numArg( "k1_07", 0.050 ) ],
      [ 0.18000, numArg( "k1_18", 0.205 ) ],
      [ 0.38000, numArg( "k1_38", 0.485 ) ],
      [ 0.65000, numArg( "k1_65", 0.760 ) ],
      [ 0.90000, numArg( "k1_90", 0.950 ) ],
      [ 1.00000, 1.00000 ]
   ];
   C1.Kt = CurvesTransformation.AkimaSubsplines;
   if ( !C1.executeOn( view ) )
      throw new Error( "midtone curve failed" );

   let L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let redExcess = "max(0,$T[0]-($T[1]+$T[2])/2)";
   let redMask = "((" + smoothStepExpr( redExcess,
                                         numArg( "redLow", 0.004 ),
                                         numArg( "redHigh", 0.058 ) ) +
                 ")*(" + smoothStepExpr( L,
                                          numArg( "nebLLow", 0.030 ),
                                          numArg( "nebLHigh", 0.440 ) ) +
                 ")*(1-" + smoothStepExpr( L,
                                            numArg( "starProtectLow", 0.500 ),
                                            numArg( "starProtectHigh", 0.850 ) ) +
                 "))";
   let bg = "(1-" + smoothStepExpr( L, numArg( "bgLow", 0.050 ),
                                      numArg( "bgHigh", 0.170 ) ) + ")";

   runPixelMath(
      view,
      "max(min($T[0]+" + redMask + "*" + jsNum( numArg( "redLift", 0.055 ) ) +
         "*(1-$T[0])-" + bg + "*" + jsNum( numArg( "skyRedControl", 0.055 ) ) +
         "*max($T[0]-($T[1]+$T[2])/2,0),1),0)",
      "max(min($T[1]*(1-" + redMask + "*" + jsNum( numArg( "greenDrop", 0.018 ) ) +
         ")-" + bg + "*" + jsNum( numArg( "skyGreenControl", 0.055 ) ) +
         "*max($T[1]-($T[0]+$T[2])/2,0),1),0)",
      "max(min($T[2]*(1-" + redMask + "*" + jsNum( numArg( "blueDrop", 0.020 ) ) +
         ")-" + bg + "*" + jsNum( numArg( "skyBlueControl", 0.050 ) ) +
         "*max($T[2]-($T[0]+$T[1])/2,0),1),0)",
      "protected-color-lift"
   );

   L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let high = smoothStepExpr( L, numArg( "highLow", 0.580 ),
                                 numArg( "highHigh", 0.900 ) );
   let avg = "(($T[0]+$T[1]+$T[2])/3)";
   runPixelMath(
      view,
      "max(min($T[0]*(1-" + high + "*" + jsNum( numArg( "highDesat", 0.10 ) ) +
         ")+" + avg + "*" + high + "*" + jsNum( numArg( "highDesat", 0.10 ) ) +
         ",1),0)",
      "max(min($T[1]*(1-" + high + "*" + jsNum( numArg( "highDesat", 0.10 ) ) +
         ")+" + avg + "*" + high + "*" + jsNum( numArg( "highDesat", 0.10 ) ) +
         ",1),0)",
      "max(min($T[2]*(1-" + high + "*" + jsNum( numArg( "highDesat", 0.10 ) ) +
         ")+" + avg + "*" + high + "*" + jsNum( numArg( "highDesat", 0.10 ) ) +
         ",1),0)",
      "mild-highlight-restraint"
   );

   logMsg( "Applying final saturation curve" );
   let C2 = new CurvesTransformation;
   let sat = numArg( "satAmount", 0.030 );
   C2.S = [
      [ 0.00000, 0.00000 ],
      [ 0.18000, 0.18000 + sat*0.05 ],
      [ 0.50000, 0.50000 + sat ],
      [ 0.82000, 0.82000 + sat*0.15 ],
      [ 1.00000, 1.00000 ]
   ];
   C2.St = CurvesTransformation.AkimaSubsplines;
   if ( !C2.executeOn( view ) )
      throw new Error( "saturation curve failed" );

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
                                    image.isColor, "eta_carinae_v3_jpeg" );
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
