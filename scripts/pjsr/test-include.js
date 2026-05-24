// Test: does ImageSolver include work with USE_SOLVER_LIBRARY?

#engine v8
#define USE_SOLVER_LIBRARY true
#define SETTINGS_MODULE "SOLVER"
#include "C:/Program Files/PixInsight/src/scripts/ImageSolver/ImageSolver.js"

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
   __log__ = "work/logs/test-include.log";
var __f__ = new File;
__f__.createForWriting( __log__ );
__f__.outTextLn( "include succeeded at " + new Date().toISOString() );
__f__.outTextLn( "ImageSolver type: " + typeof ImageSolver );
__f__.outTextLn( "CatalogMode type: " + typeof CatalogMode );
__f__.close();
