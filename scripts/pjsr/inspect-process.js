// Dump enumerable PJSR process properties.
// Usage: -r=inspect-process.js,process=<ProcessClassName>

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
   __log__ = "work/logs/inspect-process.log";
var __f__ = new File;
__f__.createForWriting( __log__ );

function logMsg( msg )
{
   __f__.outTextLn( msg );
   __f__.flush();
   console.noteln( msg );
}

function getArg( name )
{
   for ( let i = 0; i < jsArguments.length; ++i )
   {
      let eq = jsArguments[i].indexOf( "=" );
      if ( eq > 0 && jsArguments[i].substring( 0, eq ) == name )
         return jsArguments[i].substring( eq + 1 );
   }
   return null;
}

try
{
   let processName = getArg( "process" );
   if ( !processName )
      throw new Error( "Missing process argument" );

   let instance = eval( "new " + processName );
   logMsg( "Process: " + processName );
   for ( let key in instance )
   {
      let value;
      try { value = instance[key]; }
      catch ( e ) { value = "<unreadable: " + e + ">"; }
      logMsg( key + " = " + String( value ) );
   }
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
