// Final tone pass for nonlinear Catalina presentation checkpoints.
// Applies black point, a gentle contrast curve, and mild saturation to an
// already-stretched real-data image. Does not apply SCNR or green suppression.
// Usage:
//   -r=03catalina-final-tone.js,input=<xisf>,output=<xisf>,jpg=<jpg>,log=<path>

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

function clamp01( x )
{
   return Math.max( 0, Math.min( 1, x ) );
}

var logPath = arg( "log", "work/logs/03catalina-final-tone.log" );
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
   let jpg = arg( "jpg", "" );
   let tiff = arg( "tiff", "" );
   let jpgScale = numArg( "jpgScale", 0.35 );
   if ( !input || !output )
      throw new Error( "Missing input or output" );

   logMsg( "input=" + input );
   logMsg( "output=" + output );
   logMsg( "jpg=" + jpg );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let win = windows[0];
   let view = win.mainView;
   if ( !view.image.isColor || view.image.numberOfChannels < 3 )
      throw new Error( "Expected RGB input" );
   logMsg( "image=" + view.image.width + "x" + view.image.height );

   let blackPoint = numArg( "blackPoint", 0.030 );
   if ( blackPoint > 0 )
   {
      let bp = jsNum( blackPoint );
      let den = jsNum( 1 - blackPoint );
      runPixelMath(
         view,
         "max(min(($T[0]-" + bp + ")/" + den + ",1),0)",
         "max(min(($T[1]-" + bp + ")/" + den + ",1),0)",
         "max(min(($T[2]-" + bp + ")/" + den + ",1),0)",
         "black-point"
      );
   }

   let contrast = numArg( "contrast", 0.55 );
   let sat = numArg( "satAmount", 0.030 );
   logMsg( "Applying curves contrast=" + contrast + " sat=" + sat );
   let C = new CurvesTransformation;
   C.K = [
      [ 0.00000, 0.00000 ],
      [ 0.08000, clamp01( 0.08000 - 0.03000*contrast ) ],
      [ 0.25000, clamp01( 0.25000 - 0.00800*contrast ) ],
      [ 0.52000, clamp01( 0.52000 + 0.03400*contrast ) ],
      [ 0.82000, clamp01( 0.82000 + 0.03000*contrast ) ],
      [ 1.00000, 1.00000 ]
   ];
   C.Kt = CurvesTransformation.AkimaSubsplines;
   C.S = [
      [ 0.00000, 0.00000 ],
      [ 0.18000, 0.18000 + sat*0.04 ],
      [ 0.50000, 0.50000 + sat ],
      [ 0.82000, 0.82000 + sat*0.16 ],
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
                                    image.isColor, "catalina_final_tone_jpeg" );
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
