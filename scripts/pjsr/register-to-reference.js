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

function boolArg( name, def )
{
   let v = arg( name, def ? "true" : "false" );
   if ( typeof v != "string" )
      return !!v;
   v = v.toLowerCase();
   return v == "1" || v == "true" || v == "yes" || v == "on";
}

function numArg( name, def )
{
   let v = arg( name, "" );
   if ( v === "" )
      return def;
   let n = Number( v );
   if ( isNaN( n ) )
      throw new Error( "Invalid numeric argument " + name + "=" + v );
   return n;
}

function intArg( name, def )
{
   return Math.round( numArg( name, def ) );
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

   SA.mode = StarAlignment.RegisterMatch;
   SA.distortionCorrection = boolArg( "distortionCorrection", true );
   SA.rbfType = StarAlignment.DDMThinPlateSpline;
   SA.maxSplinePoints = intArg( "maxSplinePoints", 4000 );
   SA.splineOrder = intArg( "splineOrder", 2 );
   SA.splineSmoothness = numArg( "splineSmoothness", 0.005 );
   SA.matcherTolerance = numArg( "matcherTolerance", 0.0500 );
   SA.ransacTolerance = numArg( "ransacTolerance", 1.9000 );
   SA.ransacMaxIterations = intArg( "ransacMaxIterations", 2000 );

   SA.pixelInterpolation = StarAlignment.Auto;
   SA.structureLayers = intArg( "structureLayers", 5 );
   SA.noiseLayers = intArg( "noiseLayers", 0 );
   SA.hotPixelFilterRadius = intArg( "hotPixelFilterRadius", 1 );
   SA.noiseReductionFilterRadius = intArg( "noiseReductionFilterRadius", 0 );
   SA.minStructureSize = intArg( "minStructureSize", 0 );
   SA.sensitivity = numArg( "sensitivity", 0.50 );
   SA.peakResponse = numArg( "peakResponse", 0.50 );
   SA.brightThreshold = numArg( "brightThreshold", 3.0 );
   SA.maxStarDistortion = numArg( "maxStarDistortion", 0.60 );
   SA.allowClusteredSources = boolArg( "allowClusteredSources", false );
   SA.localMaximaDetectionLimit = numArg( "localMaximaDetectionLimit", 0.75 );
   SA.restrictToPreviews = boolArg( "restrictToPreviews", false );
   SA.useTriangles = boolArg( "useTriangles", false );
   SA.polygonSides = intArg( "polygonSides", 5 );
   SA.descriptorsPerStar = intArg( "descriptorsPerStar", 20 );
   SA.useBrightnessRelations = boolArg( "useBrightnessRelations", false );
   SA.useScaleDifferences = boolArg( "useScaleDifferences", true );
   SA.scaleTolerance = numArg( "scaleTolerance", 0.100 );
   SA.onError = 0;

   log( "settings: distortionCorrection=" + SA.distortionCorrection
      + " useTriangles=" + SA.useTriangles
      + " sensitivity=" + SA.sensitivity
      + " peakResponse=" + SA.peakResponse
      + " brightThreshold=" + SA.brightThreshold
      + " maxStarDistortion=" + SA.maxStarDistortion
      + " matcherTolerance=" + SA.matcherTolerance
      + " ransacTolerance=" + SA.ransacTolerance
      + " ransacMaxIterations=" + SA.ransacMaxIterations
      + " useScaleDifferences=" + SA.useScaleDifferences );

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
   if ( boolArg( "failOnError", false ) )
      throw e;
}

f.close();
