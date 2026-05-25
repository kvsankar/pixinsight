// Apply BackgroundNeutralization only, using a target-specific sky ROI.
// Usage: -r=02c-background-neutralization.js,input=<path>,output=<path>,log=<path>

#engine v8

function arg( name )
{
   for ( let i = 0; i < jsArguments.length; ++i )
   {
      let eq = jsArguments[i].indexOf( "=" );
      if ( eq > 0 && jsArguments[i].substring( 0, eq ) == name )
         return jsArguments[i].substring( eq + 1 );
   }
   return null;
}

var logPath = arg( "log" );
if ( !logPath )
   logPath = "work/logs/background-neutralization-pjsr.log";
var f = new File;
f.createForWriting( logPath );

function log( s )
{
   f.outTextLn( new Date().toISOString() + " " + s );
   f.flush();
   console.noteln( s );
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
   let input = arg( "input" );
   let output = arg( "output" );
   if ( !input || !output )
      throw new Error( "Missing input or output" );

   log( "input=" + input );
   log( "output=" + output );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let win = windows[0];
   let view = win.mainView;
   let w = view.image.width;
   let h = view.image.height;
   log( "image=" + w + "x" + h );

   let bgRect = new Rect(
      Math.floor( w * 0.85 ), Math.floor( h * 0.05 ),
      Math.floor( w * 0.99 ), Math.floor( h * 0.20 )
   );
   let bgPreview = win.createPreview( bgRect, "bg_sky" );
   let bgRefId = referenceId( bgPreview, view );
   log( "background preview=" + bgRect.x0 + "," + bgRect.y0 +
        " - " + bgRect.x1 + "," + bgRect.y1 );
   log( "background preview id=" + bgRefId );

   let BN = new BackgroundNeutralization;
   BN.backgroundReferenceViewId = bgRefId;
   BN.backgroundLow = 0.0;
   BN.backgroundHigh = 0.1;
   BN.useROI = false;
   BN.mode = 0;
   BN.targetBackground = 0.0010000;
   let ok = BN.executeOn( view );
   log( "BN returned=" + ok );
   if ( !ok )
      throw new Error( "BackgroundNeutralization failed" );

   let saveOk = win.saveAs( output, false, false, false, false );
   log( "saveAs returned=" + saveOk );
   if ( !saveOk )
      throw new Error( "saveAs failed" );

   try { win.deletePreview( bgPreview ); } catch ( e ) { log( "deletePreview note: " + e ); }
   for ( let i = 0; i < windows.length; ++i )
      windows[i].forceClose();
}
catch ( e )
{
   log( "EXCEPTION: " + e );
   if ( e.stack )
      log( "STACK: " + e.stack );
}

f.close();
