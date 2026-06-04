// M7 / Ptolemy Cluster v2 dark-lane contrast polish.
// Starts from the regular MaskedStretch branch and adds a controlled
// lower-shadow S-curve plus mild large-scale local contrast so dust lanes
// read darker against the surrounding Milky Way star field.
// Usage:
//   -r=03m7-dark-lane-contrast.js,input=<xisf>,output=<xisf>,jpg=<jpg>,log=<path>,strength=1.0

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

function clamp01( x )
{
   return Math.max( 0, Math.min( 1, x ) );
}

function mixPoint( x, target, strength )
{
   return clamp01( x + (target - x)*strength );
}

var logPath = arg( "log", "work/logs/03m7-dark-lane-contrast.log" );
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
   let jpg = arg( "jpg", "" );
   let tiff = arg( "tiff", "" );
   let jpgScale = numArg( "jpgScale", 0.35 );
   let strength = Math.max( 0, Math.min( 1.5, numArg( "strength", 1.0 ) ) );

   if ( !input || !output )
      throw new Error( "Missing input or output" );

   logMsg( "input=" + input );
   logMsg( "output=" + output );
   logMsg( "jpg=" + jpg );
   logMsg( "tiff=" + tiff );
   logMsg( "strength=" + strength );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let win = windows[0];
   let view = win.mainView;
   if ( !view.image.isColor || view.image.numberOfChannels < 3 )
      throw new Error( "Expected RGB input" );
   logMsg( "image=" + view.image.width + "x" + view.image.height );

   logMsg( "Applying large-scale LocalHistogramEqualization" );
   let LHE = new LocalHistogramEqualization;
   LHE.radius = Math.round( numArg( "lheRadius", 176 ) );
   LHE.slopeLimit = numArg( "lheSlope", 1.16 );
   LHE.amount = numArg( "lheAmount", 0.11*strength );
   LHE.histogramBins = 0;
   LHE.circularKernel = true;
   if ( !LHE.executeOn( view ) )
      throw new Error( "LocalHistogramEqualization failed" );

   logMsg( "Applying dark-lane S-curve" );
   let C = new CurvesTransformation;
   C.K = [
      [ 0.00000, 0.00000 ],
      [ 0.03500, mixPoint( 0.03500, 0.02600, strength ) ],
      [ 0.07000, mixPoint( 0.07000, 0.04800, strength ) ],
      [ 0.12000, mixPoint( 0.12000, 0.10800, strength ) ],
      [ 0.24000, mixPoint( 0.24000, 0.26600, strength ) ],
      [ 0.52000, mixPoint( 0.52000, 0.58500, strength ) ],
      [ 0.82000, mixPoint( 0.82000, 0.86800, strength ) ],
      [ 1.00000, 1.00000 ]
   ];
   C.Kt = CurvesTransformation.AkimaSubsplines;
   let sat = numArg( "satAmount", 0.030*strength );
   C.S = [
      [ 0.00000, 0.00000 ],
      [ 0.18000, 0.18000 + sat*0.05 ],
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
                                    image.isColor, "m7_dark_lane_contrast_jpeg" );
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
