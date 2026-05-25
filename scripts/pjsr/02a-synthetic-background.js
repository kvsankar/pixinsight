// Rosette/no-flats background correction.
// Builds a smooth synthetic background from sky samples away from the target,
// then applies subtractive or divisive correction.
// Usage:
//   -r=02a-synthetic-background.js,input=<path>,output=<path>,mode=subtract|divide

#engine v8

function bootstrapArg( name )
{
   for ( let i = 0; i < jsArguments.length; ++i )
   {
      let eq = jsArguments[i].indexOf( "=" );
      if ( eq > 0 && jsArguments[i].substring( 0, eq ) == name )
         return jsArguments[i].substring( eq + 1 );
   }
   return null;
}

var __log__ = bootstrapArg( "log" );
if ( !__log__ )
   __log__ = "work/logs/phase2a-synthetic-background-pjsr.log";
var __f__ = new File;
__f__.createForWriting( __log__ );

function logMsg( msg )
{
   __f__.outTextLn( new Date().toISOString() + " " + msg );
   __f__.flush();
   console.noteln( msg );
}

function getArg( name )
{
   return bootstrapArg( name );
}

function numberArg( name, def )
{
   let v = getArg( name );
   if ( v == null || v.length == 0 )
      return def;
   let n = parseFloat( v );
   return isNaN( n ) ? def : n;
}

function percentile( values, p )
{
   values.sort( function( a, b ) { return a - b; } );
   let i = Math.max( 0, Math.min( values.length - 1, Math.floor( p * ( values.length - 1 ) ) ) );
   return values[i];
}

function medianOf( values )
{
   return percentile( values.slice( 0 ), 0.5 );
}

function clamp01( x )
{
   return x < 0 ? 0 : ( x > 1 ? 1 : x );
}

function shouldSample( nx, ny )
{
   // Keep samples away from the Rosette and its surrounding nebulosity.
   let dx = ( nx - 0.52 ) / 0.30;
   let dy = ( ny - 0.53 ) / 0.34;
   if ( dx*dx + dy*dy < 1.0 )
      return false;

   // Avoid the dense/bright central lower area seen in the Rosette frame.
   if ( nx > 0.30 && nx < 0.72 && ny > 0.32 && ny < 0.78 )
      return false;

   return true;
}

function interpolateModel( samples, x, y, channel )
{
   let num = 0, den = 0;
   for ( let i = 0; i < samples.length; ++i )
   {
      let dx = x - samples[i].x;
      let dy = y - samples[i].y;
      let d2 = dx*dx + dy*dy;
      if ( d2 < 1 )
         return samples[i].v[channel];
      let w = 1 / Math.pow( d2, 1.15 );
      num += w * samples[i].v[channel];
      den += w;
   }
   return num / den;
}

function bilinear( grid, gw, gh, x, y )
{
   let gx = x * ( gw - 1 );
   let gy = y * ( gh - 1 );
   let x0 = Math.floor( gx );
   let y0 = Math.floor( gy );
   let x1 = Math.min( gw - 1, x0 + 1 );
   let y1 = Math.min( gh - 1, y0 + 1 );
   let tx = gx - x0;
   let ty = gy - y0;
   let i00 = y0*gw + x0;
   let i10 = y0*gw + x1;
   let i01 = y1*gw + x0;
   let i11 = y1*gw + x1;
   let a = grid[i00]*(1-tx) + grid[i10]*tx;
   let b = grid[i01]*(1-tx) + grid[i11]*tx;
   return a*(1-ty) + b*ty;
}

try
{
   logMsg( "=== Synthetic background correction starting ===" );
   let inFile = getArg( "input" );
   let outFile = getArg( "output" );
   let mode = getArg( "mode" );
   if ( !mode )
      mode = "subtract";
   let boxSize = Math.floor( numberArg( "box", 120 ) );
   let samplePercentile = numberArg( "percentile", 0.28 );

   if ( !inFile || !outFile )
      throw new Error( "Missing input or output argument" );
   if ( mode != "subtract" && mode != "divide" )
      throw new Error( "mode must be subtract or divide" );

   logMsg( "input=" + inFile );
   logMsg( "output=" + outFile );
   logMsg( "mode=" + mode );
   logMsg( "box=" + boxSize + ", percentile=" + samplePercentile );

   let windows = ImageWindow.open( inFile );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let win = windows[0];
   let view = win.mainView;
   let image = view.image;
   let w = image.width;
   let h = image.height;
   if ( image.numberOfChannels < 3 )
      throw new Error( "Expected RGB image" );
   logMsg( "Image: " + w + "x" + h );

   let samples = [];
   let cols = 11;
   let rows = 8;
   for ( let iy = 0; iy < rows; ++iy )
   {
      for ( let ix = 0; ix < cols; ++ix )
      {
         let nx = ( ix + 0.5 ) / cols;
         let ny = ( iy + 0.5 ) / rows;
         if ( !shouldSample( nx, ny ) )
            continue;
         let cx = Math.floor( nx * w );
         let cy = Math.floor( ny * h );
         let x0 = Math.max( 0, cx - Math.floor( boxSize/2 ) );
         let y0 = Math.max( 0, cy - Math.floor( boxSize/2 ) );
         let x1 = Math.min( w, x0 + boxSize );
         let y1 = Math.min( h, y0 + boxSize );
         x0 = Math.max( 0, x1 - boxSize );
         y0 = Math.max( 0, y1 - boxSize );

         let rect = new Rect( x0, y0, x1, y1 );
         let v = [];
         for ( let c = 0; c < 3; ++c )
         {
            let a = [];
            image.getSamples( a, rect, c );
            v[c] = percentile( a, samplePercentile );
         }
         samples.push( { x: cx, y: cy, nx: nx, ny: ny, v: v } );
      }
   }

   logMsg( "Samples used: " + samples.length );
   if ( samples.length < 20 )
      throw new Error( "Too few background samples" );

   let refs = [];
   for ( let c = 0; c < 3; ++c )
   {
      let vals = [];
      for ( let i = 0; i < samples.length; ++i )
         vals.push( samples[i].v[c] );
      refs[c] = medianOf( vals );
      logMsg( "Reference channel " + c + " = " + refs[c] );
   }

   let mw = 96, mh = 64;
   let model = [ [], [], [] ];
   for ( let c = 0; c < 3; ++c )
   {
      model[c] = new Array( mw*mh );
      for ( let yy = 0; yy < mh; ++yy )
         for ( let xx = 0; xx < mw; ++xx )
            model[c][yy*mw + xx] = interpolateModel( samples,
                                                     xx/(mw-1) * (w-1),
                                                     yy/(mh-1) * (h-1),
                                                     c );
   }

   logMsg( "Applying correction..." );
   view.beginProcess( UndoFlag.NoSwapFile );
   for ( let c = 0; c < 3; ++c )
   {
      let channel = [];
      image.getSamples( channel, new Rect( 0, 0, w, h ), c );
      for ( let y = 0; y < h; ++y )
      {
         let ny = y / ( h - 1 );
         let row = y*w;
         for ( let x = 0; x < w; ++x )
         {
            let nx = x / ( w - 1 );
            let bg = Math.max( 1.0e-6, bilinear( model[c], mw, mh, nx, ny ) );
            let v = channel[row + x];
            if ( mode == "divide" )
               v = v * refs[c] / bg;
            else
               v = v - ( bg - refs[c] );
            channel[row + x] = clamp01( v );
         }
      }
      image.setSamples( channel, new Rect( 0, 0, w, h ), c );
      logMsg( "Corrected channel " + c );
   }
   view.endProcess();

   let saveOk = win.saveAs( outFile, false, false, false, false );
   logMsg( "saveAs returned: " + saveOk );
   if ( !saveOk )
      throw new Error( "saveAs failed" );

   for ( let i = 0; i < windows.length; ++i )
      windows[i].forceClose();
   logMsg( "=== Synthetic background correction complete ===" );
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
