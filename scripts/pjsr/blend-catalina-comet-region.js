// Blend real comet-aligned Catalina signal into a clean star-aligned base.
// Inputs must be nonlinear, cropped to the same dimensions, and derived from
// the same source frames. The blend adds only color-qualified comet excess
// from the support image inside a comet/tail-shaped spatial mask.
// Usage:
//   -r=blend-catalina-comet-region.js,base=<xisf>,support=<xisf>,output=<xisf>,jpg=<jpg>,log=<path>

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

var logPath = arg( "log", "work/logs/blend-catalina-comet-region.log" );
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
   return t*t*(3 - 2*t);
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
   let jpgScale = numArg( "jpgScale", 0.35 );
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
                                 base.isColor, "catalina_comet_region_blend" );
   outWin.mainView.beginProcess( UndoFlag.NoSwapFile );
   outWin.mainView.image.assign( base );
   let out = outWin.mainView.image;

   let cx = numArg( "centerX", 0.470 ) * w;
   let cy = numArg( "centerY", 0.524 ) * h;
   let rxLeft = numArg( "radiusXLeft", 0.070 ) * w;
   let rxRight = numArg( "radiusXRight", 0.185 ) * w;
   let ry = numArg( "radiusY", 0.105 ) * h;
   let amount = numArg( "amount", 0.64 );
   let supportOffset = numArg( "supportOffset", 0.205 );
   let colorLow = numArg( "colorLow", 0.006 );
   let colorHigh = numArg( "colorHigh", 0.060 );
   let signalLow = numArg( "signalLow", 0.015 );
   let signalHigh = numArg( "signalHigh", 0.160 );
   let redScale = numArg( "redScale", 0.45 );
   let greenScale = numArg( "greenScale", 0.88 );
   let blueScale = numArg( "blueScale", 0.64 );

   logMsg( "center=" + cx + "," + cy + " rxLeft=" + rxLeft +
           " rxRight=" + rxRight + " ry=" + ry +
           " amount=" + amount + " supportOffset=" + supportOffset +
           " color=" + colorLow + "-" + colorHigh +
           " signal=" + signalLow + "-" + signalHigh );

   for ( let y = 0; y < h; ++y )
   {
      let ey = (y - cy) / ry;
      for ( let x = 0; x < w; ++x )
      {
         let dx = x - cx;
         let rx = dx < 0 ? rxLeft : rxRight;
         let ex = dx / rx;
         let d = Math.sqrt( ex*ex + ey*ey );
         let spatial = 1 - smoothstep( (d - 0.72) / 0.34 );
         if ( spatial <= 0 )
            continue;

         base.selectedChannel = 0; let br = base.sample( x, y );
         base.selectedChannel = 1; let bg = base.sample( x, y );
         base.selectedChannel = 2; let bb = base.sample( x, y );
         support.selectedChannel = 0; let sr = support.sample( x, y );
         support.selectedChannel = 1; let sg = support.sample( x, y );
         support.selectedChannel = 2; let sb = support.sample( x, y );

         let cometColor = Math.max( 0, ((sg + sb)*0.5) - sr );
         let colorSignal = smoothstep( (cometColor - colorLow) / (colorHigh - colorLow) );
         if ( colorSignal <= 0 )
            continue;

         let sL = luminance( sr, sg, sb );
         let supportSignal = smoothstep( (sL - supportOffset - signalLow) /
                                         (signalHigh - signalLow) );
         let m = amount * spatial * colorSignal * Math.max( 0.25, supportSignal );
         if ( m <= 0 )
            continue;

         let addR = Math.max( 0, sr - supportOffset ) * redScale;
         let addG = Math.max( 0, sg - supportOffset ) * greenScale;
         let addB = Math.max( 0, sb - supportOffset ) * blueScale;
         out.selectedChannel = 0; out.setSample( Math.min( 1, br + m*addR ), x, y );
         out.selectedChannel = 1; out.setSample( Math.min( 1, bg + m*addG ), x, y );
         out.selectedChannel = 2; out.setSample( Math.min( 1, bb + m*addB ), x, y );
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
                                    out.isColor, "catalina_comet_region_blend_jpeg" );
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
         if ( !R.executeOn( jpgWin.mainView, false ) )
            throw new Error( "JPEG resample failed" );
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
