// Rosette experimental finish: hard-apply STF, then simple color/contrast tweaks.
// Usage: -r=03r-rosette-hardstf.js,input=<linear xisf>,output=<xisf>

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
   __log__ = "work/logs/phase3r-rosette-hardstf-pjsr.log";
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

function parseBoolArg( name, def )
{
   let v = getArg( name );
   if ( v == null )
      return def;
   v = v.toLowerCase();
   return v == "1" || v == "true" || v == "yes";
}

function autoSTF( view, linkedRGB )
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
   return view.image.computeAutoStretch( median, mad, -2.8, 0.25, linkedRGB );
}

try
{
   logMsg( "=== Rosette hard-STF finish starting ===" );
   let inFile = getArg( "input" );
   let outFile = getArg( "output" );
   let linkedRGB = parseBoolArg( "linkedRGB", false );
   let applySCNR = parseBoolArg( "applySCNR", true );
   let scnrAmountArg = getArg( "scnrAmount" );
   let scnrAmount = scnrAmountArg == null || scnrAmountArg.length == 0 ? 0.45 : Number( scnrAmountArg );
   let applyCurves = parseBoolArg( "applyCurves", true );
   if ( !inFile || !outFile )
      throw new Error( "Missing input or output argument" );

   let windows = ImageWindow.open( inFile );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let mainWin = windows[0];
   let view = mainWin.mainView;
   logMsg( "Image: " + view.image.width + "x" + view.image.height );

   logMsg( "Hard-applying STF with linkedRGB=" + linkedRGB + "..." );
   view.beginProcess( UndoFlag.NoSwapFile );
   view.image.applyDisplayFunction( autoSTF( view, linkedRGB ) );
   view.endProcess();

   if ( applySCNR )
   {
      logMsg( "Suppressing green cast with amount=" + scnrAmount + "..." );
      let S = new SCNR;
      S.colorToRemove = 1;
      S.amount = scnrAmount;
      S.protectionMethod = 2;
      S.preserveLuminance = true;
      S.preserveLightness = true;
      if ( !S.executeOn( view ) )
         throw new Error( "SCNR failed" );
   }
   else
   {
      logMsg( "Skipping SCNR." );
   }

   if ( applyCurves )
   {
      logMsg( "Applying contrast/saturation curves..." );
      let C = new CurvesTransformation;
      C.K = [
         [ 0.00000, 0.00000 ],
         [ 0.18000, 0.07500 ],
         [ 0.42000, 0.36000 ],
         [ 0.76000, 0.80000 ],
         [ 1.00000, 1.00000 ]
      ];
      C.Kt = CurvesTransformation.AkimaSubsplines;
      C.S = [
         [ 0.00000, 0.00000 ],
         [ 0.25000, 0.33000 ],
         [ 0.55000, 0.76000 ],
         [ 0.85000, 0.95000 ],
         [ 1.00000, 1.00000 ]
      ];
      C.St = CurvesTransformation.AkimaSubsplines;
      if ( !C.executeOn( view ) )
         throw new Error( "Curves failed" );
   }
   else
   {
      logMsg( "Skipping curves." );
   }

   let saveOk = mainWin.saveAs( outFile, false, false, false, false );
   logMsg( "saveAs returned: " + saveOk );
   if ( !saveOk )
      throw new Error( "saveAs failed" );

   for ( let i = 0; i < windows.length; ++i )
      windows[i].forceClose();
   logMsg( "=== Rosette hard-STF finish complete ===" );
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
