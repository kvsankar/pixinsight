// Copy non-geometric metadata needed by scripted SPCC from a reference image.
// This preserves the target image pixels and WCS while restoring camera/filter,
// exposure, CFA, signal, and noise properties that some PixInsight processes
// drop from derived images.
// Usage: -r=copy-spcc-metadata.js,source=<reference xisf>,target=<target xisf>,output=<xisf>

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

var __log__ = arg( "log", "work/logs/copy-spcc-metadata-pjsr.log" );
var __f__ = new File;
__f__.createForWriting( __log__ );

function logMsg( msg )
{
   __f__.outTextLn( new Date().toISOString() + " " + msg );
   __f__.flush();
   console.noteln( msg );
}

function readProperties( path )
{
   let suffix = File.extractExtension( path ).toLowerCase();
   let F = new FileFormat( suffix, true, false );
   if ( F.isNull )
      throw new Error( "No reader for " + suffix );
   let f = new FileFormatInstance( F );
   let d = f.open( path, "" );
   if ( d.length < 1 )
      throw new Error( "Cannot open " + path );

   let result = {};
   let props = f.imageProperties;
   for ( let i = 0; i < props.length; ++i )
   {
      let id = props[i][0];
      let type = props[i][1];
      let value = f.readImageProperty( id );
      if ( value != null )
         result[id] = { type:type, value:value };
   }
   f.close();
   return result;
}

function shouldCopy( id )
{
   if ( id == "Image:Type" )
      return true;
   if ( id.startsWith( "Instrument:Camera:" ) ||
        id.startsWith( "Instrument:Filter:" ) ||
        id == "Instrument:FrameExposureTime" )
      return true;
   if ( id == "PCL:TotalExposureTime" ||
        id.startsWith( "PCL:CFASourcePattern" ) ||
        id.startsWith( "PCL:Noise:" ) ||
        id.startsWith( "PCL:Signal:" ) ||
        id.startsWith( "PCL:Signature:" ) )
      return true;
   return false;
}

try
{
   let source = arg( "source", null );
   let target = arg( "target", null );
   let output = arg( "output", null );
   if ( !source || !target || !output )
      throw new Error( "Missing source, target, or output" );

   logMsg( "source=" + source );
   logMsg( "target=" + target );
   logMsg( "output=" + output );

   let sourceProps = readProperties( source );
   let windows = ImageWindow.open( target );
   if ( windows.length == 0 )
      throw new Error( "Open target failed" );

   let win = windows[0];
   let view = win.mainView;
   let copied = 0;
   for ( let id in sourceProps )
   {
      if ( !shouldCopy( id ) )
         continue;
      view.setPropertyValue( id, sourceProps[id].value, sourceProps[id].type,
                             PropertyAttribute.Storable | PropertyAttribute.Permanent );
      logMsg( "copied " + id );
      ++copied;
   }
   logMsg( "copied count=" + copied );

   let ok = win.saveAs( output, false, false, false, false );
   logMsg( "saveAs returned: " + ok );
   if ( !ok )
      throw new Error( "saveAs failed" );

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
