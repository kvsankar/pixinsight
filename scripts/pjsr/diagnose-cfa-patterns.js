// Diagnose CFA pattern choice for one raw DSLR frame.
// Usage: -r=diagnose-cfa-patterns.js,input=<raw CR2>,outdir=<directory>,log=<path>

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

var __log__ = arg( "log", "work/logs/diagnose-cfa-patterns.log" );
var __f__ = new File;
__f__.createForWriting( __log__ );

function logMsg( msg )
{
   __f__.outTextLn( new Date().toISOString() + " " + msg );
   __f__.flush();
   console.noteln( msg );
}

function autoSTF( view )
{
   let n = view.image.isColor ? 3 : 1;
   let medianValues = view.computeOrFetchProperty( "Median" );
   let madValues = view.computeOrFetchProperty( "MAD" );
   let median = [];
   let mad = [];
   for ( let c = 0; c < n; ++c )
   {
      median[c] = Math.max( 0.00001, medianValues[c] );
      mad[c] = 1.4826 * madValues[c];
   }
   return view.image.computeAutoStretch( median, mad, -2.8, 0.25, false );
}

function renderPreview( inFile, outFile )
{
   let windows = ImageWindow.open( inFile );
   if ( windows.length == 0 )
      throw new Error( "Open failed: " + inFile );

   let source = windows[0];
   let image = source.mainView.image;
   let preview = new ImageWindow( image.width, image.height,
                                  image.numberOfChannels, 8, false,
                                  image.isColor, "cfa_preview" );
   preview.mainView.beginProcess( UndoFlag.NoSwapFile );
   preview.mainView.image.assign( image );
   preview.mainView.image.applyDisplayFunction( autoSTF( source.mainView ) );
   preview.mainView.endProcess();

   let R = new Resample;
   R.xSize = 0.25;
   R.ySize = 0.25;
   R.mode = Resample.RelativeDimensions;
   R.absoluteMode = Resample.ForceWidthAndHeight;
   R.interpolation = Resample.Auto;
   R.executeOn( preview.mainView, false );

   if ( !preview.saveAs( outFile, false, false, false, false ) )
      throw new Error( "saveAs failed: " + outFile );

   preview.forceClose();
   for ( let i = 0; i < windows.length; ++i )
      windows[i].forceClose();
}

try
{
   let inFile = arg( "input", null );
   let outDir = arg( "outdir", null );
   if ( !inFile || !outDir )
      throw new Error( "Missing input or outdir" );

   if ( !File.directoryExists( outDir ) )
      File.createDirectory( outDir );

   logMsg( "input  = " + inFile );
   logMsg( "outdir = " + outDir );

   let patterns = [
      { name: "rggb", id: Debayer.RGGB },
      { name: "bggr", id: Debayer.BGGR },
      { name: "gbrg", id: Debayer.GBRG },
      { name: "grbg", id: Debayer.GRBG }
   ];

   for ( let i = 0; i < patterns.length; ++i )
   {
      let p = patterns[i];
      logMsg( "Debayer pattern " + p.name + " id=" + p.id );

      let DB = new Debayer;
      DB.inputHints = "raw cfa use-roworder-keywords";
      DB.cfaPattern = p.id;
      DB.debayerMethod = Debayer.VNG;
      DB.evaluateNoise = false;
      DB.evaluateSignal = false;
      DB.outputDirectory = outDir;
      DB.outputExtension = ".xisf";
      DB.outputPostfix = "_" + p.name;
      DB.outputRGBImages = true;
      DB.outputSeparateChannels = false;
      DB.overwriteExistingFiles = true;
      DB.targetItems = [[ true, inFile, "", "" ]];

      if ( !DB.executeGlobal() )
         throw new Error( "Debayer failed for " + p.name );

      let outXisf = DB.outputFileData[0][0];
      let outJpg = outDir + "/preview-" + p.name + ".jpg";
      logMsg( "output = " + outXisf );
      renderPreview( outXisf, outJpg );
      logMsg( "preview = " + outJpg );
   }

   logMsg( "=== CFA diagnostics complete ===" );
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
