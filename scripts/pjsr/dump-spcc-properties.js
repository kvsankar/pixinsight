// Dump enumerable SpectrophotometricColorCalibration properties.
// Usage: -r=dump-spcc-properties.js,log=<path>

#engine v8

function arg( name )
{
   for ( let i = 0; i < jsArguments.length; ++i )
   {
      let eq = jsArguments[i].indexOf( "=" );
      if ( eq > 0 && jsArguments[i].substring( 0, eq ) == name )
         return jsArguments[i].substring( eq + 1 );
   }
   return null;
}

var logPath = arg( "log" );
if ( !logPath )
   logPath = "work/logs/dump-spcc-properties.log";
var f = new File;
f.createForWriting( logPath );

function log( s )
{
   f.outTextLn( s );
   f.flush();
   console.noteln( s );
}

try
{
   let p = new SpectrophotometricColorCalibration;
   for ( let k in p )
   {
      let value = "";
      try { value = String( p[k] ); } catch ( e ) { value = "<unreadable>"; }
      log( k + " = " + value );
   }
}
catch ( e )
{
   log( "EXCEPTION: " + e );
   if ( e.stack )
      log( "STACK: " + e.stack );
}

f.close();
