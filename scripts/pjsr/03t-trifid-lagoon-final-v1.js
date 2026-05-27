// Trifid/Lagoon final v1 finishing pass.
// Starts from the March old-reference vivid XISF and applies a restrained
// final balance: low-sky chroma calming, mild star-field red cleanup,
// gentle nebula protection/lift, final curves, and optional TIFF/JPEG export.
// Usage:
//   -r=03t-trifid-lagoon-final-v1.js,input=<xisf>,output=<xisf>,tiff=<tif>,jpg=<jpg>,log=<path>

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

var logPath = arg( "log", "work/logs/03t-trifid-lagoon-final-v1.log" );
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
   let avg = "(($T[0]+$T[1]+$T[2])/3)";
   let redExcess = "max(0,$T[0]-($T[1]+$T[2])/2)";
   let blueExcess = "max(0,$T[2]-($T[0]+$T[1])/2)";
   let redNeb = smoothStepExpr( redExcess,
                                numArg( "redNebLow", 0.040 ),
                                numArg( "redNebHigh", 0.150 ) );
   let blueNeb = smoothStepExpr( blueExcess,
                                 numArg( "blueNebLow", 0.035 ),
                                 numArg( "blueNebHigh", 0.120 ) );
   let nebProtect = "max(" + redNeb + "," + blueNeb + ")";
   let lowSky = "(1-" + smoothStepExpr( L,
                                       numArg( "skyLow", 0.105 ),
                                       numArg( "skyHigh", 0.300 ) ) + ")";
   let calmMask = "(" + lowSky + "*(1-" + nebProtect + "))";

   runPixelMath(
      view,
      "max(min($T[0]-" + calmMask + "*" + jsNum( numArg( "skyRedCalm", 0.135 ) ) +
         "*max($T[0]-" + avg + ",0),1),0)",
      "max(min($T[1]-" + calmMask + "*" + jsNum( numArg( "skyGreenCalm", 0.030 ) ) +
         "*max($T[1]-" + avg + ",0),1),0)",
      "max(min($T[2]-" + calmMask + "*" + jsNum( numArg( "skyBlueCalm", 0.070 ) ) +
         "*max($T[2]-" + avg + ",0),1),0)",
      "low-sky-chroma-calm"
   );

   L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   avg = "(($T[0]+$T[1]+$T[2])/3)";
   redExcess = "max(0,$T[0]-($T[1]+$T[2])/2)";
   blueExcess = "max(0,$T[2]-($T[0]+$T[1])/2)";
   redNeb = smoothStepExpr( redExcess, 0.040, 0.150 );
   blueNeb = smoothStepExpr( blueExcess, 0.035, 0.120 );
   nebProtect = "max(" + redNeb + "," + blueNeb + ")";
   let starField = "(" + smoothStepExpr( L,
                                        numArg( "starLow", 0.300 ),
                                        numArg( "starHigh", 0.830 ) ) +
                   "*(1-" + nebProtect + "))";

   runPixelMath(
      view,
      "max(min($T[0]-" + starField + "*" + jsNum( numArg( "starRedCalm", 0.045 ) ) +
         "*max($T[0]-" + avg + ",0)+" + redNeb + "*" +
         jsNum( numArg( "redNebulaLift", 0.018 ) ) + "*(1-$T[0]),1),0)",
      "max(min($T[1]*(1-" + redNeb + "*" + jsNum( numArg( "redGreenProtect", 0.010 ) ) +
         ")+" + blueNeb + "*" + jsNum( numArg( "blueGreenSupport", 0.010 ) ) +
         "*(1-$T[1]),1),0)",
      "max(min($T[2]+" + blueNeb + "*" + jsNum( numArg( "blueNebulaLift", 0.020 ) ) +
         "*(1-$T[2])+" + starField + "*" + jsNum( numArg( "starBlueRecover", 0.010 ) ) +
         "*(1-$T[2]),1),0)",
      "star-field-and-nebula-balance"
   );

   logMsg( "Applying final curves" );
   let C = new CurvesTransformation;
   C.K = [
      [ 0.00000, 0.00000 ],
      [ 0.08000, numArg( "k08", 0.100 ) ],
      [ 0.24000, numArg( "k24", 0.335 ) ],
      [ 0.52000, numArg( "k52", 0.710 ) ],
      [ 0.82000, numArg( "k82", 0.935 ) ],
      [ 1.00000, 1.00000 ]
   ];
   C.Kt = CurvesTransformation.AkimaSubsplines;
   let sat = numArg( "satTrim", -0.020 );
   C.S = [
      [ 0.00000, 0.00000 ],
      [ 0.20000, 0.20000 + sat*0.30 ],
      [ 0.52000, 0.52000 + sat ],
      [ 0.82000, 0.82000 + sat*0.10 ],
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
                                    image.isColor, "trifid_lagoon_final_v1_jpeg" );
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
   throw e;
}
finally
{
   f.close();
}
