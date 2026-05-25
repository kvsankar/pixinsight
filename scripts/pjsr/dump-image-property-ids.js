// Dump view property identifiers for an image.
// Usage: -r=dump-image-property-ids.js,input=<xisf>,log=<path>

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

var __log__ = arg( "log", "work/logs/dump-image-property-ids.log" );
var __f__ = new File;
__f__.createForWriting( __log__ );

function logMsg( msg )
{
   __f__.outTextLn( msg );
   __f__.flush();
   console.noteln( msg );
}

try
{
   let input = arg( "input", null );
   if ( !input )
      throw new Error( "Missing input" );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );
   let view = windows[0].mainView;

   logMsg( "input=" + input );
   logMsg( "id=" + view.id );
   logMsg( "properties=" + view.properties.length );
   for ( let i = 0; i < view.properties.length; ++i )
   {
      let id = view.properties[i];
      let value = "";
      try
      {
         let v = view.propertyValue( id );
         value = v == null ? "<null>" : ( "" + v );
         if ( value.length > 180 )
            value = value.substring( 0, 180 ) + "...";
      }
      catch ( e )
      {
         value = "<unreadable: " + e + ">";
      }
      logMsg( id + " = " + value );
   }

   for ( let i = 0; i < windows.length; ++i )
      windows[i].forceClose();
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
