// Rosette-specific nonlinear enhancement for the no-flats diagnostic branch.
// Usage: -r=03r-rosette-enhance.js,input=<path>,output=<path>

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
   __log__ = "work/logs/phase3r-rosette-enhance-pjsr.log";
var __f__ = new File;
__f__.createForWriting( __log__ );

function logMsg( msg )
{
   __f__.outTextLn( new Date().toISOString() + " " + msg );
   __f__.flush();
   console.noteln( msg );
}

function getArg( name )
{
   return bootstrapArg( name );
}

try
{
   logMsg( "=== Rosette enhance starting ===" );
   let inFile = getArg( "input" );
   let outFile = getArg( "output" );
   if ( !inFile || !outFile )
      throw new Error( "Missing input or output argument" );

   logMsg( "input  = " + inFile );
   logMsg( "output = " + outFile );

   let windows = ImageWindow.open( inFile );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let mainWin = windows[0];
   let view = mainWin.mainView;
   logMsg( "Image: " + view.image.width + "x" + view.image.height );

   logMsg( "Applying mild green suppression..." );
   let S = new SCNR;
   S.colorToRemove = 1;
   S.amount = 0.35;
   S.protectionMethod = 2;
   S.preserveLuminance = true;
   S.preserveLightness = true;
   if ( !S.executeOn( view ) )
      throw new Error( "SCNR failed" );

   logMsg( "Applying Rosette curves..." );
   let C = new CurvesTransformation;
   C.K = [
      [ 0.00000, 0.00000 ],
      [ 0.12000, 0.05500 ],
      [ 0.30000, 0.25000 ],
      [ 0.65000, 0.72000 ],
      [ 1.00000, 1.00000 ]
   ];
   C.Kt = CurvesTransformation.AkimaSubsplines;
   C.S = [
      [ 0.00000, 0.00000 ],
      [ 0.20000, 0.26000 ],
      [ 0.50000, 0.69000 ],
      [ 0.82000, 0.92000 ],
      [ 1.00000, 1.00000 ]
   ];
   C.St = CurvesTransformation.AkimaSubsplines;
   if ( !C.executeOn( view ) )
      throw new Error( "Curves failed" );

   logMsg( "Applying restrained local contrast..." );
   let LHE = new LocalHistogramEqualization;
   LHE.radius = 96;
   LHE.slopeLimit = 1.4;
   LHE.amount = 0.18;
   LHE.histogramBins = 0;
   LHE.circularKernel = true;
   if ( !LHE.executeOn( view ) )
      throw new Error( "LHE failed" );

   let saveOk = mainWin.saveAs( outFile, false, false, false, false );
   logMsg( "saveAs returned: " + saveOk );
   if ( !saveOk )
      throw new Error( "saveAs failed" );

   for ( let i = 0; i < windows.length; ++i )
      windows[i].forceClose();
   logMsg( "=== Rosette enhance complete ===" );
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
