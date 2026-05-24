// Test PJSR can run and write a sentinel file.
// Avoid any process invocation; just write proof-of-life.

var sentinelPath = "work/logs/hello-sentinel.txt";

try
{
   let f = new File;
   f.createForWriting( sentinelPath );
   f.outTextLn( "PJSR ran at " + new Date().toISOString() );
   f.outTextLn( "jsArguments.length = " + jsArguments.length );
   for ( let i = 0; i < jsArguments.length; ++i )
      f.outTextLn( "  arg[" + i + "] = " + jsArguments[ i ] );
   f.close();
   console.noteln( "Wrote sentinel: " + sentinelPath );
}
catch ( e )
{
   console.criticalln( "ERROR: " + e );
}
