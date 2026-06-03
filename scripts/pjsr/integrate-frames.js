// Integrate a list of already registered/aligned frames.
// Usage:
//   -r=integrate-frames.js,list=<txt>,output=<master.xisf>,log=<path>

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

var logPath = arg( "log", "work/logs/integrate-frames-pjsr.log" );
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
   let listPath = arg( "list", "" );
   let output = arg( "output", "" );
   if ( !listPath || !output )
      throw new Error( "Missing list or output argument" );

   let files = readList( listPath );
   if ( files.length < 2 )
      throw new Error( "Need at least two frames to integrate" );

   log( "Integrating " + files.length + " frames" );

   let II = new ImageIntegration;
   II.images = files.map( function( p )
   {
      return [ true, p, "", "" ];
   } );

   II.inputHints = "fits-keywords normalize raw cfa signed-is-physical";
   II.combination = ImageIntegration.Average;
   II.weightMode = ImageIntegration.DontCare;
   II.weightScale = ImageIntegration.WeightScale_BWMV;
   II.minWeight = 0.005;
   II.adaptiveGridSize = 16;
   II.adaptiveNoScale = false;
   II.ignoreNoiseKeywords = false;
   II.normalization = ImageIntegration.AdditiveWithScaling;
   II.rejection = ImageIntegration.WinsorizedSigmaClip;
   II.rejectionNormalization = ImageIntegration.NoRejectionNormalization;
   II.minMaxLow = 1;
   II.minMaxHigh = 1;
   II.pcClipLow = 0.200;
   II.pcClipHigh = 0.100;
   II.sigmaLow = 4.000;
   II.sigmaHigh = 3.000;
   II.winsorizationCutoff = 5.000;
   II.linearFitLow = 5.000;
   II.linearFitHigh = 3.500;
   II.esdOutliersFraction = 0.30;
   II.esdAlpha = 0.05;
   II.esdLowRelaxation = 1.00;
   II.ccdGain = 1.00;
   II.ccdReadNoise = 10.00;
   II.ccdScaleNoise = 0.00;
   II.clipLow = true;
   II.clipHigh = true;
   II.rangeClipLow = false;
   II.rangeLow = 0.000000;
   II.rangeClipHigh = false;
   II.rangeHigh = 0.980000;
   II.mapRangeRejection = true;
   II.reportRangeRejection = false;
   II.largeScaleClipLow = false;
   II.largeScaleClipHigh = true;
   II.largeScaleClipHighProtectedLayers = 2;
   II.largeScaleClipHighGrowth = 2;
   II.generate64BitResult = false;
   II.generateRejectionMaps = false;
   II.generateSlopeMaps = false;
   II.generateIntegratedImage = true;
   II.generateDrizzleData = false;
   II.closePreviousImages = false;
   II.bufferSizeMB = 16;
   II.stackSizeMB = 1024;
   II.autoMemorySize = true;
   II.autoMemoryLimit = 0.75;
   II.useROI = false;
   II.useCache = false;
   II.evaluateSNR = false;
   II.noiseEvaluationAlgorithm = ImageIntegration.NoiseEvaluation_MRS;
   II.mrsMinDataFraction = 0.010;
   II.psfStructureLayers = 5;
   II.psfType = ImageIntegration.PSFType_Moffat4;
   II.generateFITSKeywords = true;
   II.subtractPedestals = false;
   II.truncateOnOutOfRange = true;
   II.noGUIMessages = true;
   II.showImages = false;
   II.useFileThreads = true;
   II.fileThreadOverload = 1.00;
   II.useBufferThreads = true;
   II.maxBufferThreads = 0;

   let ok = II.executeGlobal();
   log( "executeGlobal returned=" + ok );
   if ( !ok )
      throw new Error( "ImageIntegration failed" );

   let win = ImageWindow.windowById( "integration" );
   if ( !win || win.isNull )
      throw new Error( "Integration result window not found" );

   if ( File.exists( output ) )
      File.remove( output );
   if ( !win.saveAs( output, false, false, false, false ) )
      throw new Error( "saveAs failed" );
   log( "Saved " + output );
   win.forceClose();
}
catch ( e )
{
   log( "EXCEPTION " + e );
   if ( e.stack )
      log( "STACK " + e.stack );
}

f.close();
