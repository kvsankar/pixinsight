// Run PixInsight CometAlignment from a CSV table of measured comet positions.
// CSV columns:
//   path,date,jd,x,y,fixed
// `jd` can be blank; it will be computed from the ISO UTC `date`.
// Usage:
//   -r=comet-align-frames.js,table=<csv>,outputDir=<dir>,postfix=_ca,referenceIndex=0,fitPSF=false,log=<path>

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

function numArg( name, def )
{
   let v = arg( name, null );
   if ( v == null || v.length == 0 )
      return def;
   let n = parseFloat( v );
   return isNaN( n ) ? def : n;
}

function boolArg( name, def )
{
   let v = arg( name, null );
   if ( v == null )
      return def;
   v = v.toLowerCase();
   return v == "1" || v == "true" || v == "yes";
}

function parseCsvLine( line )
{
   let out = [];
   let cur = "";
   let quoted = false;
   for ( let i = 0; i < line.length; ++i )
   {
      let ch = line[i];
      if ( ch == "\"" )
      {
         if ( quoted && i + 1 < line.length && line[i + 1] == "\"" )
         {
            cur += "\"";
            ++i;
         }
         else
            quoted = !quoted;
      }
      else if ( ch == "," && !quoted )
      {
         out.push( cur );
         cur = "";
      }
      else
         cur += ch;
   }
   out.push( cur );
   return out;
}

function readTable( path )
{
   let lines = File.readTextFile( path ).split( /\r?\n/ );
   let rows = [];
   for ( let i = 0; i < lines.length; ++i )
   {
      let line = lines[i].trim();
      if ( line.length == 0 || line[0] == "#" )
         continue;
      let p = parseCsvLine( line );
      if ( p.length > 0 && p[0].toLowerCase() == "path" )
         continue;
      if ( p.length < 5 )
         throw new Error( "Invalid CSV line: " + line );
      rows.push( {
         path: p[0],
         date: p[1],
         jd: p[2],
         x: parseFloat( p[3] ),
         y: parseFloat( p[4] ),
         fixed: p.length > 5 ? boolArgFromString( p[5], true ) : true
      } );
   }
   return rows;
}

function boolArgFromString( s, def )
{
   if ( s == null || s.length == 0 )
      return def;
   s = s.toLowerCase();
   return s == "1" || s == "true" || s == "yes";
}

function julianDateFromIso( iso )
{
   let ms = Date.parse( iso );
   if ( isNaN( ms ) )
      throw new Error( "Cannot parse date: " + iso );
   return ms/86400000.0 + 2440587.5;
}

var logPath = arg( "log", "work/logs/comet-align-frames.log" );
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
   let tablePath = arg( "table", "" );
   let outputDir = arg( "outputDir", "" );
   let postfix = arg( "postfix", "_ca" );
   let referenceIndex = Math.round( numArg( "referenceIndex", 0 ) );
   let fitPSF = boolArg( "fitPSF", false );

   if ( !tablePath || !outputDir )
      throw new Error( "Missing table or outputDir argument" );

   let rows = readTable( tablePath );
   if ( rows.length < 2 )
      throw new Error( "Need at least two target frames" );
   if ( referenceIndex < 0 || referenceIndex >= rows.length )
      throw new Error( "Invalid referenceIndex=" + referenceIndex );

   log( "table=" + tablePath );
   log( "outputDir=" + outputDir );
   log( "rows=" + rows.length + " referenceIndex=" + referenceIndex +
        " fitPSF=" + fitPSF );

   let CA = new CometAlignment;
   CA.targetFrames = rows.map( function( r )
   {
      let jd = r.jd && r.jd.length > 0 ? parseFloat( r.jd ) : julianDateFromIso( r.date );
      log( "frame date=" + r.date + " jd=" + jd.toFixed( 8 ) +
           " x=" + r.x.toFixed( 3 ) + " y=" + r.y.toFixed( 3 ) +
           " fixed=" + r.fixed + " path=" + r.path );
      return [ r.path, true, r.date, jd, r.x, r.y, r.fixed, "" ];
   } );

   CA.referenceIndex = referenceIndex;
   CA.fitPSF = fitPSF;
   CA.pixelInterpolation = CometAlignment.Lanczos4;
   CA.linearClampingThreshold = 0.30;
   CA.inputHints = "fits-keywords normalize raw cfa signed-is-physical";
   CA.outputHints = "";
   CA.outputDirectory = outputDir;
   CA.outputExtension = ".xisf";
   CA.outputPrefix = "";
   CA.outputPostfix = postfix;
   CA.generateHistoryProperties = true;
   CA.overwriteExistingFiles = true;
   CA.generateCometPathMap = false;
   CA.onError = CometAlignment.OnError_Continue;
   CA.useFileThreads = true;
   CA.fileThreadOverload = 1.00;
   CA.maxFileReadThreads = 0;
   CA.maxFileWriteThreads = 0;

   let ok = CA.executeGlobal();
   log( "executeGlobal returned=" + ok );
   if ( !ok )
      throw new Error( "CometAlignment failed" );
}
catch ( e )
{
   log( "EXCEPTION: " + e );
   if ( e.stack )
      log( "STACK: " + e.stack );
}

f.close();
