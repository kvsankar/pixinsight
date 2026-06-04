// Locate a bright extended source in a bounded ROI for each input frame.
// Usage:
//   -r=locate-bright-centroid.js,list=<txt>,centerX=2260,centerY=1664,radius=90,box=25,centroidRadius=28,channel=1,log=<path>

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
   let v = arg( name, null );
   if ( v == null || v.length == 0 )
      return def;
   let n = parseFloat( v );
   return isNaN( n ) ? def : n;
}

function readList( path )
{
   return File.readTextFile( path ).split( /\r?\n/ ).map( function( s )
   {
      return s.trim();
   } ).filter( function( s )
   {
      return s.length > 0 && s[0] != "#";
   } );
}

var logPath = arg( "log", "work/logs/locate-bright-centroid.log" );
var f = new File;
f.createForWriting( logPath );

function log( s )
{
   f.outTextLn( s );
   f.flush();
   console.noteln( s );
}

function medianOf( values )
{
   values.sort( function( a, b ) { return a - b; } );
   let n = values.length;
   if ( n == 0 )
      return 0;
   return ( n & 1 ) ? values[( n - 1 ) >> 1] : 0.5*( values[( n >> 1) - 1] + values[n >> 1] );
}

function sumRect( ii, stride, x0, y0, x1, y1 )
{
   return ii[y1*stride + x1] - ii[y0*stride + x1] - ii[y1*stride + x0] + ii[y0*stride + x0];
}

try
{
   let listPath = arg( "list", "" );
   if ( !listPath )
      throw new Error( "Missing list argument" );

   let centerX = Math.round( numArg( "centerX", 2260 ) );
   let centerY = Math.round( numArg( "centerY", 1664 ) );
   let radius = Math.round( numArg( "radius", 90 ) );
   let box = Math.max( 5, Math.round( numArg( "box", 25 ) ) );
   let centroidRadius = Math.max( 5, Math.round( numArg( "centroidRadius", 28 ) ) );
   let requestedChannel = Math.round( numArg( "channel", 1 ) );

   let files = readList( listPath );
   log( "file,x,y,peakBoxX,peakBoxY,roiX,roiY,roiW,roiH,background,peakBoxMean,totalWeight" );

   for ( let i = 0; i < files.length; ++i )
   {
      let path = files[i];
      let windows = ImageWindow.open( path );
      if ( windows.length == 0 )
         throw new Error( "Open failed: " + path );

      let win = windows[0];
      let image = win.mainView.image;
      let channel = Math.max( 0, Math.min( requestedChannel, image.numberOfChannels - 1 ) );
      let x0 = Math.max( 0, centerX - radius );
      let y0 = Math.max( 0, centerY - radius );
      let x1 = Math.min( image.width, centerX + radius + 1 );
      let y1 = Math.min( image.height, centerY + radius + 1 );
      let w = x1 - x0;
      let h = y1 - y0;
      let rect = new Rect( x0, y0, x1, y1 );
      let a = new Array( w*h );
      image.getSamples( a, rect, channel );

      let bgSample = a.slice( 0 );
      let background = medianOf( bgSample );
      let stride = w + 1;
      let ii = new Array( ( w + 1 )*( h + 1 ) );
      for ( let k = 0; k < ii.length; ++k )
         ii[k] = 0;
      for ( let y = 0; y < h; ++y )
      {
         let rowSum = 0;
         for ( let x = 0; x < w; ++x )
         {
            rowSum += a[y*w + x];
            ii[( y + 1 )*stride + ( x + 1 )] = ii[y*stride + ( x + 1 )] + rowSum;
         }
      }

      let half = Math.floor( box/2 );
      let bestX = half;
      let bestY = half;
      let bestMean = -1;
      for ( let y = half; y < h - half; ++y )
      {
         for ( let x = half; x < w - half; ++x )
         {
            let sx0 = x - half;
            let sy0 = y - half;
            let sx1 = Math.min( w, x + half + 1 );
            let sy1 = Math.min( h, y + half + 1 );
            let area = ( sx1 - sx0 )*( sy1 - sy0 );
            let mean = sumRect( ii, stride, sx0, sy0, sx1, sy1 )/area;
            if ( mean > bestMean )
            {
               bestMean = mean;
               bestX = x;
               bestY = y;
            }
         }
      }

      let cr2 = centroidRadius*centroidRadius;
      let threshold = background + 0.20*( bestMean - background );
      let sx = 0;
      let sy = 0;
      let sw = 0;
      for ( let y = Math.max( 0, bestY - centroidRadius ); y <= Math.min( h - 1, bestY + centroidRadius ); ++y )
      {
         for ( let x = Math.max( 0, bestX - centroidRadius ); x <= Math.min( w - 1, bestX + centroidRadius ); ++x )
         {
            let dx = x - bestX;
            let dy = y - bestY;
            if ( dx*dx + dy*dy > cr2 )
               continue;
            let v = Math.max( 0, a[y*w + x] - threshold );
            if ( v <= 0 )
               continue;
            sx += v*x;
            sy += v*y;
            sw += v;
         }
      }

      let cx = sw > 0 ? x0 + sx/sw : x0 + bestX;
      let cy = sw > 0 ? y0 + sy/sw : y0 + bestY;
      log( path + "," +
           cx.toFixed( 3 ) + "," + cy.toFixed( 3 ) + "," +
           ( x0 + bestX ) + "," + ( y0 + bestY ) + "," +
           x0 + "," + y0 + "," + w + "," + h + "," +
           background.toExponential( 8 ) + "," +
           bestMean.toExponential( 8 ) + "," +
           sw.toExponential( 8 ) );

      win.forceClose();
   }
}
catch ( e )
{
   log( "EXCEPTION: " + e );
   if ( e.stack )
      log( "STACK: " + e.stack );
}

f.close();
