// Phase 2c (fallback) — manual color calibration when SPCC is unavailable
// Steps: BackgroundNeutralization + ColorCalibration
//   BN: neutralize background using sky preview
//   CC: white-balance using a galaxy disk preview as white reference
// Usage: -r=02c-manualcolor.js,input=<path>,output=<path>

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
   __log__ = "work/logs/phase2c-pjsr.log";
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
      let eq = jsArguments[ i ].indexOf( "=" );
      if ( eq > 0 && jsArguments[ i ].substring( 0, eq ) == name )
         return jsArguments[ i ].substring( eq + 1 );
   }
   return null;
}

function referenceId( preview, mainView )
{
   if ( preview.fullId )
      return preview.fullId;
   if ( preview.id && preview.id.indexOf( "->" ) >= 0 )
      return preview.id;
   return mainView.id + "->" + preview.id;
}

try
{
   logMsg( "=== Phase 2c manual color cal starting ===" );

   let inFile  = getArg( "input" );
   let outFile = getArg( "output" );
   logMsg( "input  = " + inFile );
   logMsg( "output = " + outFile );

   if ( !inFile || !outFile )
      throw new Error( "Missing input or output argument" );

   if ( File.exists( outFile ) )
   {
      logMsg( "[CACHED] output exists, skipping" );
   }
   else
   {
      logMsg( "Opening " + inFile );
      let windows = ImageWindow.open( inFile );
      if ( windows.length == 0 ) throw new Error( "Open failed" );
      let mainWin = windows[ 0 ];
      let view = mainWin.mainView;
      let w = view.image.width, h = view.image.height;
      logMsg( "Image: " + w + "x" + h );

      // Create a sky-background preview in a clean corner area.
      // The solved frame is ~3.3 x 2.2 degrees; upper right avoids M31/M110.
      let bgRect = new Rect(
         Math.floor( w * 0.85 ), Math.floor( h * 0.05 ),
         Math.floor( w * 0.99 ), Math.floor( h * 0.20 )
      );
      let bgPreview = mainWin.createPreview( bgRect, "bg_sky" );
      let bgRefId = referenceId( bgPreview, view );
      logMsg( "Background preview: " + bgRect.x0 + "," + bgRect.y0 + " - " + bgRect.x1 + "," + bgRect.y1 );
      logMsg( "Background preview id: " + bgRefId );

      // For white-reference we use the WHOLE main view. With structureDetection=true,
      // ColorCalibration will identify all stars and balance using their integrated light
      // (effectively a per-image G2V calibration). This avoids guessing where M31 sits in
      // the frame and is a recognized fallback when plate-solving is unavailable.

      logMsg( "Running BackgroundNeutralization..." );
      let BN = new BackgroundNeutralization;
      BN.backgroundReferenceViewId = bgRefId;
      BN.backgroundLow             = 0.0;
      BN.backgroundHigh            = 0.1;
      BN.useROI                    = false;
      BN.mode                      = 0;     // 0=TargetBackground (default, safer)
      BN.targetBackground          = 0.0010000;
      let bnOk = BN.executeOn( view );
      logMsg( "BN returned: " + bnOk );
      if ( !bnOk )
         throw new Error( "BackgroundNeutralization failed" );

      logMsg( "Running ColorCalibration..." );
      let CC = new ColorCalibration;
      CC.whiteReferenceViewId      = view.id;   // whole image; structureDetection picks stars
      CC.whiteLow                  = 0.0;
      CC.whiteHigh                 = 0.9;
      CC.whiteUseROI               = false;
      CC.structureDetection        = true;
      CC.structureLayers           = 5;
      CC.noiseLayers               = 1;
      CC.manualWhiteBalance        = false;
      CC.backgroundReferenceViewId = bgRefId;
      CC.backgroundLow             = 0.0;
      CC.backgroundHigh            = 0.1;
      CC.backgroundUseROI          = false;
      CC.outputWhiteReferenceMask  = false;
      let ccOk = CC.executeOn( view );
      logMsg( "CC returned: " + ccOk );
      if ( !ccOk )
         throw new Error( "ColorCalibration failed" );

      // Save BEFORE deletePreview cleanup (deletePreview can throw and abort save)
      logMsg( "Saving to " + outFile );
      let saveOk = mainWin.saveAs( outFile, false, false, false, false );
      if ( !saveOk ) throw new Error( "saveAs failed" );
      logMsg( "Saved." );

      // Best-effort preview cleanup
      try { mainWin.deletePreview( bgPreview ); } catch ( e ) { logMsg( "deletePreview note: " + e ); }

      for ( let i = 0; i < windows.length; ++i )
         windows[ i ].forceClose();

      logMsg( "=== Phase 2c complete ===" );
   }
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack ) logMsg( "STACK: " + e.stack );
}

__f__.close();
