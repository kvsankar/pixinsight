// Inspect enumerable PJSR process properties.
// Usage:
//   -r=inspect-process-properties.js,process=BlurXTerminator,log=<path>

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

var logPath = arg( "log", "work/logs/inspect-process-properties.log" );
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
   let processName = arg( "process", "" );
   let dumpSource = arg( "dumpSource", "false" ).toLowerCase() == "true";
   if ( !processName )
      throw new Error( "Missing process argument" );

   log( "process=" + processName );
   let P = eval( "new " + processName );
   let names = [];
   for ( let k in P )
      names.push( k );
   names.sort();

   for ( let i = 0; i < names.length; ++i )
   {
      let k = names[i];
      let v = "";
      try
      {
         v = "" + P[k];
      }
      catch ( e )
      {
         v = "<unreadable: " + e + ">";
      }
      log( k + "=" + v );
   }

   if ( dumpSource )
   {
      log( "--- toSource ---" );
      log( P.toSource() );
   }
}
catch ( e )
{
   log( "EXCEPTION: " + e );
   if ( e.stack )
      log( "STACK: " + e.stack );
}

f.close();
