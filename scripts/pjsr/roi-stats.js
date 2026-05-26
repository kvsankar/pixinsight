// Report per-channel robust statistics for rectangular ROIs.
// Usage:
//   -r=roi-stats.js,input=<xisf>,rois=name:x:y:w:h|name2:x:y:w:h,log=<path>

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

var logPath = arg( "log", "work/logs/roi-stats.log" );
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

try
{
   let input = arg( "input", "" );
   let roiSpec = arg( "rois", "" );
   if ( !input || !roiSpec )
      throw new Error( "Missing input or rois argument" );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed: " + input );

   let win = windows[0];
   let image = win.mainView.image;
   let rois = parseRois( roiSpec );
   let channels = image.isColor ? 3 : 1;

   log( "input=" + input );
   log( "size=" + image.width + "x" + image.height + " channels=" + channels );
   log( "roi,channel,x,y,w,h,mean,median,stddev" );

   for ( let r = 0; r < rois.length; ++r )
   {
      let roi = rois[r];
      image.selectedRect = new Rect( roi.x, roi.y, roi.x + roi.w, roi.y + roi.h );
      for ( let c = 0; c < channels; ++c )
      {
         image.selectedChannel = c;
         log( roi.name + "," + c + "," + roi.x + "," + roi.y + "," +
              roi.w + "," + roi.h + "," +
              image.mean().toExponential( 10 ) + "," +
              image.median().toExponential( 10 ) + "," +
              image.stdDev().toExponential( 10 ) );
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
