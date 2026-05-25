// Rosette experimental color remix on a nonlinear image.
// Usage: -r=03r-rosette-color-remix.js,input=<path>,output=<path>

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
   __log__ = "work/logs/phase3r-rosette-color-remix-pjsr.log";
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
   logMsg( "=== Rosette color remix starting ===" );
   let inFile = getArg( "input" );
   let outFile = getArg( "output" );
   if ( !inFile || !outFile )
      throw new Error( "Missing input or output argument" );

   let windows = ImageWindow.open( inFile );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let mainWin = windows[0];
   let view = mainWin.mainView;

   let P = new PixelMath;
   P.useSingleExpression = false;
   P.expression0 = "min($T[0]*1.38 + $T[1]*0.05, 1)";
   P.expression1 = "min($T[1]*0.82, 1)";
   P.expression2 = "min($T[2]*1.03, 1)";
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.rescale = false;
   P.createNewImage = false;
   P.showNewImage = false;
   P.generateOutput = true;
   if ( !P.executeOn( view ) )
      throw new Error( "PixelMath remix failed" );

   let S = new CurvesTransformation;
   S.S = [
      [ 0.00000, 0.00000 ],
      [ 0.25000, 0.31000 ],
      [ 0.55000, 0.76000 ],
      [ 0.85000, 0.95000 ],
      [ 1.00000, 1.00000 ]
   ];
   S.St = CurvesTransformation.AkimaSubsplines;
   if ( !S.executeOn( view ) )
      throw new Error( "Saturation curve failed" );

   let saveOk = mainWin.saveAs( outFile, false, false, false, false );
   logMsg( "saveAs returned: " + saveOk );
   if ( !saveOk )
      throw new Error( "saveAs failed" );

   for ( let i = 0; i < windows.length; ++i )
      windows[i].forceClose();
   logMsg( "=== Rosette color remix complete ===" );
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
