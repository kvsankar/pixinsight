// Diagnostic helper: list brightest StarDetector detections.
// Usage: -r=inspect-stars.js,input=<path>

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
   __log__ = "work/logs/inspect-stars.log";
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
   for ( let i = 0; i < jsArguments.length; ++i )
   {
      let eq = jsArguments[ i ].indexOf( "=" );
      if ( eq > 0 && jsArguments[ i ].substring( 0, eq ) == name )
         return jsArguments[ i ].substring( eq + 1 );
   }
   return null;
}

try
{
   let inFile = getArg( "input" );
   if ( !inFile )
      throw new Error( "Missing input argument" );
   let sensitivity = Number( getArg( "sensitivity" ) || "0.3" );
   let brightThreshold = Number( getArg( "brightThreshold" ) || "1.5" );
   let structureLayers = Number( getArg( "structureLayers" ) || "5" );

   let windows = ImageWindow.open( inFile );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let win = windows[0];
   let view = win.mainView;
   logMsg( "Image: " + view.image.width + "x" + view.image.height +
           ", channels=" + view.image.numberOfChannels );

   let D = new StarDetector;
   D.structureLayers = structureLayers;
   D.hotPixelFilterRadius = 1;
   D.noiseReductionFilterRadius = 0;
   D.sensitivity = sensitivity;
   D.peakResponse = 0.5;
   D.allowClusteredSources = false;
   D.maxDistortion = 0.6;
   D.brightThreshold = brightThreshold;
   D.minStructureSize = 0;
   D.fitPSF = false;

   let stars = D.stars( view.image );
   logMsg( "settings: sensitivity=" + sensitivity +
           ", brightThreshold=" + brightThreshold +
           ", structureLayers=" + structureLayers );
   logMsg( "stars found = " + stars.length );

   stars.sort( function( a, b )
   {
      let af = (a.flux !== undefined) ? a.flux : ((a.size !== undefined) ? a.size : 0);
      let bf = (b.flux !== undefined) ? b.flux : ((b.size !== undefined) ? b.size : 0);
      return bf - af;
   } );

   let n = Math.min( 50, stars.length );
   for ( let i = 0; i < n; ++i )
   {
      let s = stars[i];
      let keys = [];
      for ( let k in s )
         keys.push( k );
      let x = s.pos ? s.pos.x : s.x;
      let y = s.pos ? s.pos.y : s.y;
      logMsg( format( "#%02d x=%.2f y=%.2f size=%s flux=%s keys=%s",
                      i + 1, x, y, String( s.size ), String( s.flux ), keys.join( "," ) ) );
   }

   for ( let i = 0; i < windows.length; ++i )
      windows[i].forceClose();
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack ) logMsg( "STACK: " + e.stack );
}

__f__.close();
