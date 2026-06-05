// M81/M82 SN-preserving nonlinear proof.
// Starts from a linear RGB checkpoint. Applies a low-background hard STF
// and restrained curves without HDR/LHE so point sources in M82 remain legible.
// Usage:
//   -r=03u-m81-m82-sn-preserve.js,input=<xisf>,output=<xisf>,jpg=<jpg>,log=<path>,
//      targetBackground=0.10,shadows=-2.8,satAmount=0.035

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

var logPath = arg( "log", "work/logs/03u-m81-m82-sn-preserve.log" );
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

function stretchExpr( c, black, stretch, gamma )
{
   let x = "max($T[" + c + "]-" + jsNum( black ) + ",0)/(1-" + jsNum( black ) + ")";
   let sx = "(" + jsNum( stretch ) + "*" + x + ")";
   let denom = Math.log( stretch + Math.sqrt( stretch*stretch + 1 ) );
   return "pow(ln(" + sx + "+sqrt(" + sx + "*" + sx + "+1))/" +
          jsNum( denom ) + "," + jsNum( gamma ) + ")";
}

function findMidtonesBalance( v0, v1 )
{
   if ( v1 <= 0 )
      return 0;
   if ( v1 >= 1 )
      return 1;

   v0 = Math.range( v0, 0.0, 1.0 );
   let m0, m1;
   if ( v1 < v0 )
   {
      m0 = 0;
      m1 = 0.5;
   }
   else
   {
      m0 = 0.5;
      m1 = 1;
   }

   for ( ;; )
   {
      let m = (m0 + m1)/2;
      let v = Math.mtf( m, v1 );
      if ( Math.abs( v - v0 ) < 5.0e-05 )
         return m;
      if ( v < v0 )
         m1 = m;
      else
         m0 = m;
   }
}

function hardAutoStretch( view, shadowsClipping, targetBackground )
{
   view.image.resetSelections();
   view.image.selectedChannel = 0;
   let median = view.image.median();
   let avgDev = view.image.avgDev();
   view.image.resetSelections();

   let c0 = Math.range( median + shadowsClipping*avgDev, 0.0, 1.0 );
   let m = findMidtonesBalance( targetBackground, median - c0 );
   logMsg( "hard STF c0=" + c0 + " m=" + m + " c1=1" );

   let HT = new HistogramTransformation;
   HT.H = [
      [ 0, 0.5, 1, 0, 1 ],
      [ 0, 0.5, 1, 0, 1 ],
      [ 0, 0.5, 1, 0, 1 ],
      [ c0, m, 1, 0, 1 ],
      [ 0, 0.5, 1, 0, 1 ]
   ];
   if ( !HT.executeOn( view, false ) )
      throw new Error( "HistogramTransformation hard STF failed" );
}

try
{
   let input = arg( "input", "" );
   let output = arg( "output", "" );
   let jpg = arg( "jpg", "" );
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

   let shadows = numArg( "shadows", -2.8 );
   let targetBackground = numArg( "targetBackground", 0.10 );
   logMsg( "hard STF shadows=" + shadows + " targetBackground=" + targetBackground );
   hardAutoStretch( view, shadows, targetBackground );

   logMsg( "Applying restrained curves" );
   let C = new CurvesTransformation;
   C.K = [
      [ 0.00000, 0.00000 ],
      [ 0.07000, numArg( "k07", 0.045 ) ],
      [ 0.22000, numArg( "k22", 0.205 ) ],
      [ 0.52000, numArg( "k52", 0.515 ) ],
      [ 0.83000, numArg( "k83", 0.835 ) ],
      [ 1.00000, 1.00000 ]
   ];
   C.Kt = CurvesTransformation.AkimaSubsplines;
   let sat = numArg( "satAmount", 0.035 );
   C.S = [
      [ 0.00000, 0.00000 ],
      [ 0.18000, 0.18000 + sat*0.03 ],
      [ 0.50000, 0.50000 + sat ],
      [ 0.82000, 0.82000 + sat*0.20 ],
      [ 1.00000, 1.00000 ]
   ];
   C.St = CurvesTransformation.AkimaSubsplines;
   if ( !C.executeOn( view ) )
      throw new Error( "CurvesTransformation failed" );

   let ok = win.saveAs( output, false, false, false, false );
   logMsg( "save XISF returned=" + ok );
   if ( !ok )
      throw new Error( "XISF save failed" );

   if ( jpg )
   {
      let image = view.image;
      let jpgWin = new ImageWindow( image.width, image.height,
                                    image.numberOfChannels, 8, false,
                                    image.isColor, "m81_m82_sn_jpeg" );
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
