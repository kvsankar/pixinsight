// Batch align solved images using PixInsight AlignByCoordinates.
// Usage:
//   -r=align-by-coordinates-batch.js,reference=<solved.xisf>,list=<txt>,outDir=<dir>,suffix=_wcs,log=<path>

#engine v8
#define TITLE "AlignByCoordinates"
#define SETTINGS_MODULE "AlignByCoordinates"

#include <pjsr/astrometry/AstrometricMetadata.js>
#include <pjsr/astrometry/ImageReprojection.js>
#include "C:/Program Files/PixInsight/src/scripts/AlignByCoordinates/AlignByCoordinatesEngine.js"

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

function ensureDir( dir )
{
   if ( !File.directoryExists( dir ) )
      File.createDirectory( dir, true );
}

function readList( path )
{
   return File.readTextFile( path ).split( /\r?\n/ ).map( function( s )
   {
      return s.trim();
   } ).filter( function( s )
   {
      return s.length > 0 && s[0] != "#";
   } );
}

var logPath = arg( "log", "work/logs/align-by-coordinates-batch-pjsr.log" );
var f = new File;
f.createForWriting( logPath );

function log( s )
{
   f.outTextLn( new Date().toISOString() + " " + s );
   f.flush();
   console.noteln( s );
}

try
{
   let reference = arg( "reference", "" );
   let listPath = arg( "list", "" );
   let outDir = arg( "outDir", "" );
   let suffix = arg( "suffix", "_wcs" );
   if ( !reference || !listPath || !outDir )
      throw new Error( "Missing reference, list, or outDir argument" );

   ensureDir( outDir );
   let files = readList( listPath );
   log( "reference=" + reference );
   log( "files=" + files.length );
   log( "outDir=" + outDir );

   let engine = new AlignByCoordinatesEngine;
   engine.referenceViewIdOrPath = reference;
   engine.referenceIsPath = true;
   engine.useActiveImage = false;
   engine.files = files;
   engine.alignMode = AlignMode.Reference;
   engine.suffix = suffix;
   engine.pixelInterpolation = InterpolationAlgorithm.Auto;
   engine.clampingThreshold = 0.30;
   engine.outputDir = outDir;
   engine.overwrite = true;
   engine.errorPolicy = ErrorPolicy.Continue;
   engine.Execute();

   log( "DONE" );
}
catch ( e )
{
   log( "EXCEPTION " + e );
   if ( e.stack )
      log( "STACK " + e.stack );
}

f.close();
