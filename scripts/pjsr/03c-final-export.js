// Phase 3c — Conservative final crop and exports
// Usage: -r=03c-final-export.js,input=<path>,output=<xisf>,tiff=<path>,jpg=<path>

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
   __log__ = "work/logs/phase3c-final-pjsr.log";
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
   logMsg( "=== Phase 3c: final crop/export starting ===" );

   let inFile = getArg( "input" );
   let outFile = getArg( "output" );
   let tiffFile = getArg( "tiff" );
   let jpgFile = getArg( "jpg" );
   logMsg( "input  = " + inFile );
   logMsg( "output = " + outFile );
   logMsg( "tiff   = " + tiffFile );
   logMsg( "jpg    = " + jpgFile );

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
      let w = view.image.width;
      let h = view.image.height;
      logMsg( "Image before crop: " + w + "x" + h );

      // Trim only the outer margins/corners; keep M31, M32, and M110 with room.
      let crop = new DynamicCrop;
      crop.centerX = 0.5000;
      crop.centerY = 0.5000;
      crop.width = 0.9420;
      crop.height = 0.9360;
      crop.angle = 0.0;
      crop.scaleX = 1.0;
      crop.scaleY = 1.0;
      crop.optimizeFast = true;
      crop.noGUIMessages = true;
      crop.interpolation = DynamicCrop.Auto;
      crop.clampingThreshold = 0.30;
      crop.smoothness = 1.50;
      crop.red = 0.0;
      crop.green = 0.0;
      crop.blue = 0.0;
      crop.alpha = 1.0;
      let cropOk = crop.executeOn( view );
      logMsg( "DynamicCrop returned: " + cropOk );
      if ( !cropOk )
         throw new Error( "DynamicCrop failed" );
      logMsg( "Image after crop: " + view.image.width + "x" + view.image.height );

      let saveOk = mainWin.saveAs( outFile, false, false, false, false );
      logMsg( "save XISF returned: " + saveOk );
      if ( !saveOk )
         throw new Error( "XISF saveAs failed" );

      if ( tiffFile )
      {
         let tiffOk = mainWin.saveAs( tiffFile, false, false, false, false );
         logMsg( "save TIFF returned: " + tiffOk );
         if ( !tiffOk )
            throw new Error( "TIFF saveAs failed" );
      }

      if ( jpgFile )
      {
         let image = view.image;
         let jpgWin = new ImageWindow( image.width, image.height,
                                       image.numberOfChannels, 8, false,
                                       image.isColor, "final_jpeg" );
         jpgWin.mainView.beginProcess( UndoFlag.NoSwapFile );
         jpgWin.mainView.image.assign( image );
         jpgWin.mainView.endProcess();
         let jpgOk = jpgWin.saveAs( jpgFile, false, false, false, false );
         logMsg( "save JPEG returned: " + jpgOk );
         jpgWin.forceClose();
         if ( !jpgOk )
            throw new Error( "JPEG saveAs failed" );
      }

      for ( let i = 0; i < windows.length; ++i )
         windows[i].forceClose();

      logMsg( "=== Phase 3c final export complete ===" );
   }
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
