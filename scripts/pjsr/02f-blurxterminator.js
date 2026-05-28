// Phase 2f - BlurXTerminator linear deconvolution.
// Usage:
//   -r=02f-blurxterminator.js,input=<xisf>,output=<xisf>,log=<path>,
//      sharpenStars=0.25,adjustHalos=0.00,sharpenNonstellar=0.35,
//      correctOnly=false,autoNonstellarPsf=true,lumOnly=false

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

var logPath = arg( "log", "work/logs/02f-blurxterminator.log" );
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

   let BXT = new BlurXTerminator;
   BXT.ai_file = arg( "aiFile", "BlurXTerminator.4.pb" );
   BXT.sharpen_stars = numArg( "sharpenStars", 0.25 );
   BXT.adjust_halos = numArg( "adjustHalos", 0.00 );
   BXT.auto_nonstellar_psf = boolArg( "autoNonstellarPsf", true );
   BXT.nonstellar_psf_diameter = numArg( "nonstellarPsfDiameter", 0.00 );
   BXT.sharpen_nonstellar = numArg( "sharpenNonstellar", 0.35 );
   BXT.correct_only = boolArg( "correctOnly", false );
   BXT.correct_first = boolArg( "correctFirst", false );
   BXT.nonstellar_then_stellar = boolArg( "nonstellarThenStellar", false );
   BXT.lum_only = boolArg( "lumOnly", false );

   logMsg( "BXT ai_file=" + BXT.ai_file +
           " sharpen_stars=" + BXT.sharpen_stars +
           " adjust_halos=" + BXT.adjust_halos +
           " auto_nonstellar_psf=" + BXT.auto_nonstellar_psf +
           " nonstellar_psf_diameter=" + BXT.nonstellar_psf_diameter +
           " sharpen_nonstellar=" + BXT.sharpen_nonstellar +
           " correct_only=" + BXT.correct_only +
           " lum_only=" + BXT.lum_only );

   let ok = BXT.executeOn( view );
   logMsg( "BlurXTerminator returned=" + ok );
   if ( !ok )
      throw new Error( "BlurXTerminator.executeOn returned false" );

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
