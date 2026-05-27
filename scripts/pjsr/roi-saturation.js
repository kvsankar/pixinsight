// Report per-channel maxima and bright-pixel counts for rectangular ROIs.
// Usage:
//   -r=roi-saturation.js,input=<xisf>,rois=name:x:y:w:h,thresholds=0.5:0.75:0.9:0.99,log=<path>

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

var logPath = arg( "log", "work/logs/roi-saturation.log" );
var f = new File;
f.createForWriting( logPath );

function log( s )
{
   f.outTextLn( s );
   f.flush();
   console.noteln( s );
}

function parseRois( s )
{
   let rois = [];
   let parts = s.split( "|" );
   for ( let i = 0; i < parts.length; ++i )
   {
      if ( parts[i].length == 0 )
         continue;
      let p = parts[i].split( ":" );
      if ( p.length != 5 )
         throw new Error( "Invalid ROI: " + parts[i] );
      rois.push( {
         name: p[0],
         x: parseInt( p[1], 10 ),
         y: parseInt( p[2], 10 ),
         w: parseInt( p[3], 10 ),
         h: parseInt( p[4], 10 )
      } );
   }
   return rois;
}

function parseThresholds( s )
{
   let out = [];
   let parts = s.split( ":" );
   for ( let i = 0; i < parts.length; ++i )
   {
      let v = parseFloat( parts[i] );
      if ( !isNaN( v ) )
         out.push( v );
   }
   if ( out.length == 0 )
      throw new Error( "No valid thresholds" );
   return out;
}

function valueAt( image, x, y, c )
{
   image.selectedChannel = c;
   return image.sample( x, y );
}

try
{
   let input = arg( "input", "" );
   let roiSpec = arg( "rois", "" );
   let thresholdSpec = arg( "thresholds", "0.5:0.75:0.9:0.99" );
   if ( !input || !roiSpec )
      throw new Error( "Missing input or rois argument" );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed: " + input );

   let win = windows[0];
   let image = win.mainView.image;
   let rois = parseRois( roiSpec );
   let thresholds = parseThresholds( thresholdSpec );
   let channels = image.isColor ? 3 : 1;

   log( "input=" + input );
   log( "size=" + image.width + "x" + image.height + " channels=" + channels );
   log( "roi,channel,x,y,w,h,pixels,max,threshold,count,percent" );

   for ( let r = 0; r < rois.length; ++r )
   {
      let roi = rois[r];
      let pixels = roi.w * roi.h;
      for ( let c = 0; c < channels; ++c )
      {
         let maxV = -1;
         let counts = [];
         for ( let t = 0; t < thresholds.length; ++t )
            counts.push( 0 );

         for ( let y = roi.y; y < roi.y + roi.h; ++y )
         {
            for ( let x = roi.x; x < roi.x + roi.w; ++x )
            {
               let v = valueAt( image, x, y, c );
               if ( v > maxV )
                  maxV = v;
               for ( let t = 0; t < thresholds.length; ++t )
                  if ( v >= thresholds[t] )
                     ++counts[t];
            }
         }

         for ( let t = 0; t < thresholds.length; ++t )
            log( roi.name + "," + c + "," + roi.x + "," + roi.y + "," +
                 roi.w + "," + roi.h + "," + pixels + "," +
                 maxV.toExponential( 10 ) + "," +
                 thresholds[t].toFixed( 4 ) + "," + counts[t] + "," +
                 (100 * counts[t] / pixels).toFixed( 6 ) );
      }
   }

   image.resetSelections();
   win.forceClose();
}
catch ( e )
{
   log( "EXCEPTION: " + e );
   if ( e.stack )
      log( "STACK: " + e.stack );
}

f.close();
