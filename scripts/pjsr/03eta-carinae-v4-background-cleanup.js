// Eta Carinae v4 background chroma cleanup.
// Starts from the extra-stretched v4 crop and pulls low-sky color speckles
// toward neutral while protecting red nebula and bright stars.
// Usage:
//   -r=03eta-carinae-v4-background-cleanup.js,input=<xisf>,output=<xisf>,jpg=<jpg>,log=<path>

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

var logPath = arg( "log", "work/logs/03eta-carinae-v4-background-cleanup.log" );
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
   let redExcess = "max(0,$T[0]-($T[1]+$T[2])/2)";
   let redMask = "((" + smoothStepExpr( redExcess,
                                         numArg( "redLow", 0.010 ),
                                         numArg( "redHigh", 0.070 ) ) +
                 ")*(" + smoothStepExpr( L,
                                          numArg( "nebLLow", 0.045 ),
                                          numArg( "nebLHigh", 0.420 ) ) +
                 ")*(1-" + smoothStepExpr( L,
                                            numArg( "starProtectLow", 0.500 ),
                                            numArg( "starProtectHigh", 0.860 ) ) +
                 "))";
   let lowSky = "(1-" + smoothStepExpr( L,
                                         numArg( "skyLow", 0.075 ),
                                         numArg( "skyHigh", 0.240 ) ) + ")";
   let skyMask = "(" + lowSky + "*(1-" + redMask + "))";
   let avg = "(($T[0]+$T[1]+$T[2])/3)";
   let neutralAmount = jsNum( numArg( "neutralAmount", 0.38 ) );

   runPixelMath(
      view,
      "max(min($T[0]*(1-" + skyMask + "*" + neutralAmount + ")+" +
         avg + "*" + skyMask + "*" + neutralAmount + ",1),0)",
      "max(min($T[1]*(1-" + skyMask + "*" + neutralAmount + ")+" +
         avg + "*" + skyMask + "*" + neutralAmount + ",1),0)",
      "max(min($T[2]*(1-" + skyMask + "*" + neutralAmount + ")+" +
         avg + "*" + skyMask + "*" + neutralAmount + ",1),0)",
      "protected-low-sky-neutralization"
   );

   logMsg( "Applying gentle final luminance/saturation trim" );
   let C = new CurvesTransformation;
   C.K = [
      [ 0.00000, 0.00000 ],
      [ 0.07000, numArg( "k07", 0.050 ) ],
      [ 0.22000, numArg( "k22", 0.230 ) ],
      [ 0.52000, numArg( "k52", 0.575 ) ],
      [ 0.84000, numArg( "k84", 0.895 ) ],
      [ 1.00000, 1.00000 ]
   ];
   C.Kt = CurvesTransformation.AkimaSubsplines;
   let sat = numArg( "satAmount", -0.020 );
   C.S = [
      [ 0.00000, 0.00000 ],
      [ 0.20000, 0.20000 + sat*0.15 ],
      [ 0.52000, 0.52000 + sat ],
      [ 0.85000, 0.85000 + sat*0.20 ],
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
                                    image.isColor, "eta_carinae_v4_clean_jpeg" );
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
