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
   __log__ = "work/logs/test-progress.log";
var __f__ = new File;
__f__.createForWriting( __log__ );

function logMsg( msg )
{
   __f__.outTextLn( new Date().toISOString() + " " + msg );
   __f__.flush();
}

try
{
   logMsg( "step 1: script started" );
   logMsg( "step 2: jsArguments.length = " + jsArguments.length );
   for ( let i = 0; i < jsArguments.length; ++i )
      logMsg( "step 3." + i + ": arg = " + jsArguments[ i ] );
   logMsg( "step 4: about to call File.exists" );
   let masterPath = "work/wbpp-out/master/masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf";
   let exists = File.exists( masterPath );
   logMsg( "step 5: master exists? " + exists );
   logMsg( "step 6: about to open master..." );
   let windows = ImageWindow.open( masterPath );
   logMsg( "step 7: opened, got " + windows.length + " window(s)" );
   if ( windows.length > 0 )
   {
      logMsg( "step 8: view id = " + windows[ 0 ].mainView.id );
      logMsg( "step 9: image size = " + windows[ 0 ].mainView.image.width + "x" + windows[ 0 ].mainView.image.height );
      windows[ 0 ].forceClose();
      logMsg( "step 10: closed window" );
   }
   logMsg( "step DONE" );
}
catch ( e )
{
   logMsg( "step ERR: " + e );
}

__f__.close();
