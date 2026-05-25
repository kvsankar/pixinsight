// Copy an existing astrometric solution to a geometrically identical image.
// Usage: -r=copy-wcs.js,source=<solved xisf>,target=<unsolved xisf>,output=<xisf>

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
   __log__ = "work/logs/copy-wcs-pjsr.log";
var __f__ = new File;
__f__.createForWriting( __log__ );

function logMsg( msg )
{
   __f__.outTextLn( new Date().toISOString() + " " + msg );
   __f__.flush();
   console.noteln( msg );
}

try
{
   let sourcePath = bootstrapArg( "source" );
   let targetPath = bootstrapArg( "target" );
   let outputPath = bootstrapArg( "output" );
   if ( !sourcePath || !targetPath || !outputPath )
      throw new Error( "Missing source, target, or output argument" );

   logMsg( "source=" + sourcePath );
   logMsg( "target=" + targetPath );
   logMsg( "output=" + outputPath );

   let sw = ImageWindow.open( sourcePath );
   let tw = ImageWindow.open( targetPath );
   if ( sw.length == 0 || tw.length == 0 )
      throw new Error( "Open failed" );
   let source = sw[0];
   let target = tw[0];
   if ( source.mainView.image.width != target.mainView.image.width ||
        source.mainView.image.height != target.mainView.image.height )
      throw new Error( "Source and target geometry differ" );

   logMsg( "Source WCS:" );
   logMsg( source.astrometricSolutionSummary().trim() );
   target.copyAstrometricSolution( source );
   logMsg( "Target WCS after copy:" );
   logMsg( target.astrometricSolutionSummary().trim() );

   let saveOk = target.saveAs( outputPath, false, false, false, false );
   logMsg( "saveAs returned: " + saveOk );
   if ( !saveOk )
      throw new Error( "saveAs failed" );

   for ( let i = 0; i < sw.length; ++i )
      sw[i].forceClose();
   for ( let i = 0; i < tw.length; ++i )
      tw[i].forceClose();
   logMsg( "done" );
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
