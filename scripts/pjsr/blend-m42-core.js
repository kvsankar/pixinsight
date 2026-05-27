// Blend a quieter-core M42 variant into a richer base image.
// Inputs must be registered/cropped to the same dimensions.
// Usage:
//   -r=blend-m42-core.js,base=<xisf>,core=<xisf>,output=<xisf>,jpg=<jpg>,log=<path>

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

var logPath = arg( "log", "work/logs/blend-m42-core.log" );
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

try
{
   let basePath = arg( "base", "" );
   let corePath = arg( "core", "" );
   let output = arg( "output", "" );
   let jpg = arg( "jpg", "" );
   let jpgScale = numArg( "jpgScale", 0.70 );
   if ( !basePath || !corePath || !output )
      throw new Error( "Missing base, core, or output" );

   let baseWin = openOne( basePath );
   let coreWin = openOne( corePath );
   let base = baseWin.mainView.image;
   let core = coreWin.mainView.image;
   if ( base.width != core.width || base.height != core.height ||
        base.numberOfChannels != core.numberOfChannels )
      throw new Error( "Input dimensions/channels do not match" );
   if ( !base.isColor || base.numberOfChannels < 3 )
      throw new Error( "Expected RGB inputs" );

   let w = base.width;
   let h = base.height;
   logMsg( "image=" + w + "x" + h );

   let outWin = new ImageWindow( w, h, base.numberOfChannels, 32, true,
                                 base.isColor, "m42_core_blend" );
   outWin.mainView.beginProcess( UndoFlag.NoSwapFile );
   outWin.mainView.image.assign( base );
   let out = outWin.mainView.image;

   let cx = numArg( "centerX", 0.46 ) * w;
   let cy = numArg( "centerY", 0.36 ) * h;
   let rx = numArg( "radiusX", 0.18 ) * w;
   let ry = numArg( "radiusY", 0.20 ) * h;
   let low = numArg( "lumLow", 0.22 );
   let high = numArg( "lumHigh", 0.58 );
   let amount = numArg( "amount", 0.85 );
   logMsg( "center=" + cx + "," + cy + " radius=" + rx + "," + ry +
           " lum=" + low + "-" + high + " amount=" + amount );

   for ( let y = 0; y < h; ++y )
   {
      let ey = (y - cy) / ry;
      for ( let x = 0; x < w; ++x )
      {
         let ex = (x - cx) / rx;
         let d = Math.sqrt( ex*ex + ey*ey );
         let spatial = 1 - smoothstep( (d - 0.55) / 0.45 );
         if ( spatial <= 0 )
            continue;

         base.selectedChannel = 0; let br = base.sample( x, y );
         base.selectedChannel = 1; let bg = base.sample( x, y );
         base.selectedChannel = 2; let bb = base.sample( x, y );
         let L = 0.2126*br + 0.7152*bg + 0.0722*bb;
         let bright = smoothstep( (L - low) / (high - low) );
         let m = amount * spatial * bright;
         if ( m <= 0 )
            continue;

         core.selectedChannel = 0; let cr = core.sample( x, y );
         core.selectedChannel = 1; let cg = core.sample( x, y );
         core.selectedChannel = 2; let cb = core.sample( x, y );

         out.selectedChannel = 0; out.setSample( br*(1-m) + cr*m, x, y );
         out.selectedChannel = 1; out.setSample( bg*(1-m) + cg*m, x, y );
         out.selectedChannel = 2; out.setSample( bb*(1-m) + cb*m, x, y );
      }
   }
   base.resetSelections();
   core.resetSelections();
   out.resetSelections();
   outWin.mainView.endProcess();

   let ok = outWin.saveAs( output, false, false, false, false );
   logMsg( "save XISF returned=" + ok );
   if ( !ok )
      throw new Error( "XISF save failed" );

   if ( jpg )
   {
      let jpgWin = new ImageWindow( w, h, out.numberOfChannels, 8, false,
                                    out.isColor, "m42_core_blend_jpeg" );
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
   coreWin.forceClose();
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
