// Inspect selected global symbols/constants.
// Usage: -r=inspect-symbol.js,symbol=<ClassName>

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
   __log__ = "work/logs/inspect-symbol.log";
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
   let symbol = getArg( "symbol" );
   if ( !symbol )
      throw new Error( "Missing symbol argument" );

   let obj = eval( symbol );
   logMsg( "Symbol: " + symbol );
   for ( let key in obj )
   {
      let value;
      try { value = obj[key]; }
      catch ( e ) { value = "<unreadable: " + e + ">"; }
      logMsg( symbol + "." + key + " = " + String( value ) );
   }
   try
   {
      let proto = eval( symbol + ".prototype" );
      for ( let key in proto )
      {
         let value;
         try { value = proto[key]; }
         catch ( e ) { value = "<unreadable: " + e + ">"; }
         logMsg( symbol + ".prototype." + key + " = " + String( value ) );
      }
   }
   catch ( e )
   {
      logMsg( "No prototype inspection: " + e );
   }
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
