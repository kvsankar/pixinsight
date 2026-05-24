// Phase 3f — ED80-aware v3 finishing: mild star reduction + restrained contrast polish
// Usage: -r=03f-ed80-v3.js,input=<path>,output=<path>,maskdir=<path>

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
   __log__ = "work/logs/phase3f-ed80-v3-pjsr.log";
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
   for ( let i = 0; i < jsArguments.length; ++i )
   {
      let eq = jsArguments[i].indexOf( "=" );
      if ( eq > 0 && jsArguments[i].substring( 0, eq ) == name )
         return jsArguments[i].substring( eq + 1 );
   }
   return null;
}

try
{
   logMsg( "=== Phase 3f: ED80 v3 finishing starting ===" );

   let inFile = getArg( "input" );
   let outFile = getArg( "output" );
   let maskDir = getArg( "maskdir" );
   if ( !maskDir )
      maskDir = "work/03-nonlinear/masks";

   logMsg( "input  = " + inFile );
   logMsg( "output = " + outFile );
   logMsg( "maskdir = " + maskDir );

   if ( !inFile || !outFile )
      throw new Error( "Missing input or output argument" );

   if ( File.exists( outFile ) )
   {
      logMsg( "[CACHED] output exists, skipping" );
   }
   else
   {
      let windows = ImageWindow.open( inFile );
      if ( windows.length == 0 )
         throw new Error( "Open failed" );

      let mainWin = windows[0];
      let view = mainWin.mainView;
      logMsg( "Image: " + view.image.width + "x" + view.image.height +
              ", channels=" + view.image.numberOfChannels );

      let maskWindows = [];
      let starPath = maskDir + "/03b-star-mask.xisf";
      if ( File.exists( starPath ) )
      {
         logMsg( "Loading star mask: " + starPath );
         maskWindows = ImageWindow.open( starPath );
         if ( maskWindows.length == 0 )
            throw new Error( "Could not open star mask" );
         let starWin = maskWindows[0];

         if ( starWin.mainView.image.width != view.image.width ||
              starWin.mainView.image.height != view.image.height )
            throw new Error( "Star mask dimensions do not match input image" );

         mainWin.setMask( starWin, false );
         mainWin.maskEnabled = true;
         mainWin.maskInverted = false;
         mainWin.maskVisible = false;

         logMsg( "Applying mild MorphologicalTransformation star reduction..." );
         let MT = new MorphologicalTransformation;
         MT.operator = MorphologicalTransformation.Selection;
         MT.selectionPoint = 0.24;    // gentle shrink, avoid crunchy dark rings
         MT.numberOfIterations = 1;
         MT.amount = 0.22;
         MT.structureSize = 5;
         MT.structureWayTable = [ // mask
            [[
               0x00,0x01,0x00,0x01,0x00,
               0x01,0x01,0x01,0x01,0x01,
               0x00,0x01,0x01,0x01,0x00,
               0x01,0x01,0x01,0x01,0x01,
               0x00,0x01,0x00,0x01,0x00
            ]]
         ];
         MT.lowThreshold = 0.000000;
         MT.highThreshold = 0.900000;
         let mtOk = MT.executeOn( view );
         logMsg( "MorphologicalTransformation returned: " + mtOk );
         if ( !mtOk )
            throw new Error( "MorphologicalTransformation failed" );

         mainWin.maskEnabled = false;
         try { mainWin.removeMask(); } catch ( e ) { logMsg( "removeMask note: " + e ); }
      }
      else
      {
         logMsg( "Star mask missing; skipping star reduction." );
      }

      logMsg( "Applying restrained ED80 contrast/color polish..." );
      let C = new CurvesTransformation;
      C.K = [
         [0.00000, 0.00000],
         [0.20000, 0.18500],
         [0.50000, 0.51500],
         [0.80000, 0.83500],
         [1.00000, 1.00000]
      ];
      C.Kt = CurvesTransformation.AkimaSubsplines;
      C.S = [
         [0.00000, 0.00000],
         [0.25000, 0.27000],
         [0.50000, 0.56000],
         [0.75000, 0.79500],
         [1.00000, 1.00000]
      ];
      C.St = CurvesTransformation.AkimaSubsplines;
      let cOk = C.executeOn( view );
      logMsg( "Curves returned: " + cOk );
      if ( !cOk )
         throw new Error( "Curves failed" );

      let saveOk = mainWin.saveAs( outFile, false, false, false, false );
      logMsg( "saveAs returned: " + saveOk );
      if ( !saveOk )
         throw new Error( "saveAs failed" );

      for ( let i = 0; i < maskWindows.length; ++i )
         maskWindows[i].forceClose();
      for ( let i = 0; i < windows.length; ++i )
         windows[i].forceClose();

      logMsg( "=== Phase 3f ED80 v3 finishing complete ===" );
   }
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
