// Diagnose PixInsight Gaia XPSD database availability.
// Usage: -r=diagnose-gaia.js

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
   __log__ = "work/logs/diagnose-gaia.log";
var __f__ = new File;
__f__.createForWriting( __log__ );

function logMsg( msg )
{
   __f__.outTextLn( msg );
   __f__.flush();
   console.noteln( msg );
}

function valueOrError( expr )
{
   try { return eval( expr ); }
   catch ( e ) { return "<error: " + e + ">"; }
}

function dumpGaia( label, release )
{
   logMsg( "" );
   logMsg( "=== " + label + " (" + release + ") ===" );
   try
   {
      let g = new Gaia;
      g.command = "get-info";
      g.dataRelease = release;
      let ok = g.executeGlobal();
      logMsg( "executeGlobal = " + ok );
      logMsg( "isValid = " + g.isValid );
      logMsg( "outputDataRelease = " + g.outputDataRelease );
      logMsg( "databaseFilePaths = " + g.databaseFilePaths );
      logMsg( "databaseMagnitudeLow = " + g.databaseMagnitudeLow );
      logMsg( "databaseMagnitudeHigh = " + g.databaseMagnitudeHigh );
      logMsg( "databaseHasMeanSpectrumData = " + g.databaseHasMeanSpectrumData );
      logMsg( "databaseSpectrumStart = " + g.databaseSpectrumStart );
      logMsg( "databaseSpectrumStep = " + g.databaseSpectrumStep );
      logMsg( "databaseSpectrumCount = " + g.databaseSpectrumCount );
      logMsg( "databaseSpectrumBits = " + g.databaseSpectrumBits );
   }
   catch ( e )
   {
      logMsg( "EXCEPTION: " + e );
      if ( e.stack )
         logMsg( "STACK: " + e.stack );
   }
}

try
{
   logMsg( "Gaia constants:" );
   let constants = [
      "Gaia.prototype.DataRelease_BestAvailable",
      "Gaia.prototype.DataRelease_2",
      "Gaia.prototype.DataRelease_EDR3",
      "Gaia.prototype.DataRelease_3",
      "Gaia.prototype.DataRelease_3_SP",
      "Gaia.DataRelease_BestAvailable",
      "Gaia.DataRelease_2",
      "Gaia.DataRelease_EDR3",
      "Gaia.DataRelease_3",
      "Gaia.DataRelease_3_SP"
   ];
   for ( let i = 0; i < constants.length; ++i )
      logMsg( constants[i] + " = " + valueOrError( constants[i] ) );

   let best = valueOrError( "Gaia.DataRelease_BestAvailable" );
   let dr2 = valueOrError( "Gaia.DataRelease_2" );
   let edr3 = valueOrError( "Gaia.DataRelease_EDR3" );
   let dr3 = valueOrError( "Gaia.DataRelease_3" );
   let dr3sp = valueOrError( "Gaia.DataRelease_3_SP" );

   dumpGaia( "BestAvailable", best );
   dumpGaia( "DR2", dr2 );
   dumpGaia( "EDR3", edr3 );
   dumpGaia( "DR3", dr3 );
   dumpGaia( "DR3/SP", dr3sp );
}
catch ( e )
{
   logMsg( "TOP EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
