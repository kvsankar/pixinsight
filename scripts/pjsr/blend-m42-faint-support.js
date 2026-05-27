// Blend a registered/stretched long-exposure M42 support image into a base
// image, limited to broad faint/medium nebulosity. This intentionally protects
// the bright core and stars, and only brightens from the support layer.
// Inputs must be registered/cropped to the same dimensions.
// Usage:
//   -r=blend-m42-faint-support.js,base=<xisf>,support=<xisf>,output=<xisf>,jpg=<jpg>,log=<path>

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

var logPath = arg( "log", "work/logs/blend-m42-faint-support.log" );
var f = new File;
f.createForWriting( logPath );

function logMsg( msg )
{
   f.outTextLn( new Date().toISOString() + " " + msg );
   f.flush();
   console.noteln( msg );
}

function openOne( path )
{
   let wins = ImageWindow.open( path );
   if ( wins.length == 0 )
      throw new Error( "Open failed: " + path );
   return wins[0];
}

function smoothstep( t )
{
   t = Math.max( 0, Math.min( 1, t ) );
   return t * t * ( 3 - 2 * t );
}

function luminance( r, g, b )
{
   return 0.2126*r + 0.7152*g + 0.0722*b;
}

try
{
   let basePath = arg( "base", "" );
   let supportPath = arg( "support", "" );
   let output = arg( "output", "" );
   let jpg = arg( "jpg", "" );
   let jpgScale = numArg( "jpgScale", 0.70 );
   if ( !basePath || !supportPath || !output )
      throw new Error( "Missing base, support, or output" );

   let baseWin = openOne( basePath );
   let supportWin = openOne( supportPath );
   let base = baseWin.mainView.image;
   let support = supportWin.mainView.image;
   if ( base.width != support.width || base.height != support.height ||
        base.numberOfChannels != support.numberOfChannels )
      throw new Error( "Input dimensions/channels do not match" );
   if ( !base.isColor || base.numberOfChannels < 3 )
      throw new Error( "Expected RGB inputs" );

   let w = base.width;
   let h = base.height;
   logMsg( "image=" + w + "x" + h );

   let outWin = new ImageWindow( w, h, base.numberOfChannels, 32, true,
                                 base.isColor, "m42_faint_support_blend" );
   outWin.mainView.beginProcess( UndoFlag.NoSwapFile );
   outWin.mainView.image.assign( base );
   let out = outWin.mainView.image;

   let cx = numArg( "centerX", 0.52 ) * w;
   let cy = numArg( "centerY", 0.49 ) * h;
   let rx = numArg( "radiusX", 0.62 ) * w;
   let ry = numArg( "radiusY", 0.60 ) * h;
   let amount = numArg( "amount", 0.25 );
   let signalLow = numArg( "signalLow", 0.040 );
   let signalHigh = numArg( "signalHigh", 0.180 );
   let protectLow = numArg( "protectLow", 0.220 );
   let protectHigh = numArg( "protectHigh", 0.520 );
   let starLow = numArg( "starLow", 0.520 );
   let starHigh = numArg( "starHigh", 0.800 );
   let supportOffset = numArg( "supportOffset", 0.010 );
   logMsg( "center=" + cx + "," + cy + " radius=" + rx + "," + ry +
           " amount=" + amount + " signal=" + signalLow + "-" + signalHigh +
           " protect=" + protectLow + "-" + protectHigh +
           " star=" + starLow + "-" + starHigh +
           " supportOffset=" + supportOffset );

   for ( let y = 0; y < h; ++y )
   {
      let ey = (y - cy) / ry;
      for ( let x = 0; x < w; ++x )
      {
         let ex = (x - cx) / rx;
         let d = Math.sqrt( ex*ex + ey*ey );
         let spatial = 1 - smoothstep( (d - 0.88) / 0.18 );
         if ( spatial <= 0 )
            continue;

         base.selectedChannel = 0; let br = base.sample( x, y );
         base.selectedChannel = 1; let bg = base.sample( x, y );
         base.selectedChannel = 2; let bb = base.sample( x, y );
         support.selectedChannel = 0; let sr0 = support.sample( x, y );
         support.selectedChannel = 1; let sg0 = support.sample( x, y );
         support.selectedChannel = 2; let sb0 = support.sample( x, y );

         let bL = luminance( br, bg, bb );
         let sL = luminance( sr0, sg0, sb0 );
         let signal = smoothstep( (sL - signalLow) / (signalHigh - signalLow) );
         let brightProtect = 1 - smoothstep( (bL - protectLow) / (protectHigh - protectLow) );
         let starProtect = 1 - smoothstep( (sL - starLow) / (starHigh - starLow) );
         let m = amount * spatial * signal * brightProtect * starProtect;
         if ( m <= 0 )
            continue;

         let sr = Math.max( 0, sr0 - supportOffset );
         let sg = Math.max( 0, sg0 - supportOffset );
         let sb = Math.max( 0, sb0 - supportOffset );
         out.selectedChannel = 0; out.setSample( Math.min( 1, br + m*Math.max( sr - br, 0 ) ), x, y );
         out.selectedChannel = 1; out.setSample( Math.min( 1, bg + m*Math.max( sg - bg, 0 ) ), x, y );
         out.selectedChannel = 2; out.setSample( Math.min( 1, bb + m*Math.max( sb - bb, 0 ) ), x, y );
      }
   }
   base.resetSelections();
   support.resetSelections();
   out.resetSelections();
   outWin.mainView.endProcess();

   let ok = outWin.saveAs( output, false, false, false, false );
   logMsg( "save XISF returned=" + ok );
   if ( !ok )
      throw new Error( "XISF save failed" );

   if ( jpg )
   {
      let jpgWin = new ImageWindow( w, h, out.numberOfChannels, 8, false,
                                    out.isColor, "m42_faint_support_jpeg" );
      jpgWin.mainView.beginProcess( UndoFlag.NoSwapFile );
      jpgWin.mainView.image.assign( out );
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

   outWin.forceClose();
   supportWin.forceClose();
   baseWin.forceClose();
   logMsg( "complete" );
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

f.close();
