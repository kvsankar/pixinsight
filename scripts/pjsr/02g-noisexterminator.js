// Phase 2g - NoiseXTerminator linear denoise.
// Usage:
//   -r=02g-noisexterminator.js,input=<xisf>,output=<xisf>,log=<path>,
//      colorSeparation=true,frequencySeparation=true,
//      denoise=0.70,denoiseColor=0.88,denoiseLf=0.30,denoiseLfColor=0.80,
//      frequencyScale=5,iterations=3

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

function numArg( name, def )
{
   let v = Number( arg( name, "" + def ) );
   return isFinite( v ) ? v : def;
}

function boolArg( name, def )
{
   let v = arg( name, def ? "true" : "false" ).toLowerCase();
   return v == "1" || v == "true" || v == "yes";
}

var logPath = arg( "log", "work/logs/02g-noisexterminator.log" );
var f = new File;
f.createForWriting( logPath );

function logMsg( msg )
{
   f.outTextLn( new Date().toISOString() + " " + msg );
   f.flush();
   console.noteln( msg );
}

try
{
   let input = arg( "input", "" );
   let output = arg( "output", "" );
   if ( !input || !output )
      throw new Error( "Missing input or output argument" );

   logMsg( "input=" + input );
   logMsg( "output=" + output );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let win = windows[0];
   let view = win.mainView;
   logMsg( "image=" + view.image.width + "x" + view.image.height );

   let NXT = new NoiseXTerminator;
   NXT.ai_file = arg( "aiFile", "NoiseXTerminator.3.pb" );
   NXT.enable_color_separation = boolArg( "colorSeparation", true );
   NXT.enable_frequency_separation = boolArg( "frequencySeparation", true );
   NXT.denoise = numArg( "denoise", 0.70 );
   NXT.denoise_color = numArg( "denoiseColor", 0.88 );
   NXT.denoise_lf = numArg( "denoiseLf", 0.30 );
   NXT.denoise_lf_color = numArg( "denoiseLfColor", 0.80 );
   NXT.frequency_scale = numArg( "frequencyScale", 5.00 );
   NXT.iterations = Math.round( numArg( "iterations", 3 ) );
   NXT.detail = numArg( "detail", 0.15 );

   logMsg( "NXT ai_file=" + NXT.ai_file +
           " color=" + NXT.enable_color_separation +
           " frequency=" + NXT.enable_frequency_separation +
           " denoise=" + NXT.denoise +
           " denoise_color=" + NXT.denoise_color +
           " denoise_lf=" + NXT.denoise_lf +
           " denoise_lf_color=" + NXT.denoise_lf_color +
           " frequency_scale=" + NXT.frequency_scale +
           " iterations=" + NXT.iterations );

   let ok = NXT.executeOn( view );
   logMsg( "NoiseXTerminator returned=" + ok );
   if ( !ok )
      throw new Error( "NoiseXTerminator.executeOn returned false" );

   ok = win.saveAs( output, false, false, false, false );
   logMsg( "save returned=" + ok );
   if ( !ok )
      throw new Error( "saveAs failed" );

   for ( let i = 0; i < windows.length; ++i )
      windows[i].forceClose();
   logMsg( "complete" );
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

f.close();
