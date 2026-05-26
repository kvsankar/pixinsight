// Register one image to a reference image with StarAlignment.
// Usage:
//   -r=register-to-reference.js,reference=<xisf>,target=<xisf>,outDir=<dir>,prefix=<name>,postfix=<suffix>,log=<path>

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

var logPath = arg( "log", "work/logs/register-to-reference-pjsr.log" );
var f = new File;
f.createForWriting( logPath );

function log( s )
{
   f.outTextLn( new Date().toISOString() + " " + s );
   f.flush();
   console.noteln( s );
}

function ensureDir( dir )
{
   if ( !File.directoryExists( dir ) )
      File.createDirectory( dir, true );
}

try
{
   let reference = arg( "reference", "" );
   let target = arg( "target", "" );
   let outDir = arg( "outDir", "" );
   let prefix = arg( "prefix", "" );
   let postfix = arg( "postfix", "_registered" );

   if ( !reference || !target )
      throw new Error( "Missing reference or target argument" );

   if ( !outDir )
      outDir = File.extractDrive( target ) + File.extractDirectory( target );

   ensureDir( outDir );

   let expected = outDir + "/" + prefix + File.extractName( target ) + postfix + ".xisf";
   if ( File.exists( expected ) )
   {
      log( "removing existing output=" + expected );
      File.remove( expected );
   }

   log( "reference=" + reference );
   log( "target=" + target );
   log( "outDir=" + outDir );
   log( "expected=" + expected );

   let SA = new StarAlignment;
   SA.referenceImage = reference;
   SA.referenceIsFile = true;
   SA.targets = [[ true, true, target, "" ]];
   SA.outputDirectory = outDir;
   SA.outputPrefix = prefix;
   SA.outputPostfix = postfix;
   SA.outputExtension = ".xisf";
   SA.outputSampleFormat = StarAlignment.f32;
   SA.overwriteExistingFiles = true;
   SA.writeKeywords = true;
   SA.generateHistoryProperties = true;
   SA.generateDrizzleData = false;
   SA.generateDistortionMaps = false;
   SA.inheritAstrometricSolution = true;
   SA.propagateAstrometricSolutions = true;

   SA.distortionCorrection = true;
   SA.rbfType = StarAlignment.DDMThinPlateSpline;
   SA.maxSplinePoints = 4000;
   SA.splineOrder = 2;
   SA.splineSmoothness = 0.005;

   SA.pixelInterpolation = StarAlignment.Auto;
   SA.structureLayers = 5;
   SA.sensitivity = 0.50;
   SA.peakResponse = 0.50;
   SA.brightThreshold = 3.0;
   SA.maxStarDistortion = 0.60;
   SA.restrictToPreviews = false;
   SA.useTriangles = false;
   SA.useScaleDifferences = true;
   SA.onError = 0;

   log( "executing StarAlignment" );
   let ok = SA.executeGlobal();
   log( "executeGlobal returned=" + ok );
   if ( !ok )
      throw new Error( "StarAlignment failed" );

   if ( !File.exists( expected ) )
      throw new Error( "Expected output was not produced: " + expected );

   log( "output=" + expected );
   log( "done" );
}
catch ( e )
{
   log( "EXCEPTION: " + e );
   if ( e.stack )
      log( "STACK: " + e.stack );
}

f.close();
