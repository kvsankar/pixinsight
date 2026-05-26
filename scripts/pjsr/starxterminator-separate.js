// Run StarXTerminator on a nonlinear RGB image and save starless/stars layers.
// Usage:
//   -r=starxterminator-separate.js,input=<xisf>,starless=<xisf>,stars=<xisf>,unscreen=true,overlap=0.2

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

var __log__ = arg( "log", "work/logs/starxterminator-separate.log" );
var __f__ = new File;
__f__.createForWriting( __log__ );

function logMsg( msg )
{
   __f__.outTextLn( new Date().toISOString() + " " + msg );
   __f__.flush();
   console.noteln( msg );
}

function boolArg( name, def )
{
   let v = String( arg( name, def ? "true" : "false" ) ).toLowerCase();
   return v == "1" || v == "true" || v == "yes" || v == "on";
}

function numArg( name, def )
{
   let v = Number( arg( name, "" + def ) );
   return isFinite( v ) ? v : def;
}

function windowIds()
{
   let ids = {};
   let windows = ImageWindow.windows;
   for ( let i = 0; i < windows.length; ++i )
      ids[windows[i].mainView.id] = true;
   return ids;
}

function findNewWindow( before, excludeId )
{
   let windows = ImageWindow.windows;
   for ( let i = 0; i < windows.length; ++i )
      if ( !before[windows[i].mainView.id] && windows[i].mainView.id != excludeId )
         return windows[i];
   return null;
}

try
{
   let input = arg( "input", null );
   let starless = arg( "starless", null );
   let stars = arg( "stars", null );
   if ( !input || !starless || !stars )
      throw new Error( "Missing input, starless, or stars argument" );

   let unscreen = boolArg( "unscreen", true );
   let overlap = numArg( "overlap", 0.20 );
   let aiFile = arg( "ai_file", "" );

   logMsg( "input=" + input );
   logMsg( "starless=" + starless );
   logMsg( "stars=" + stars );
   logMsg( "unscreen=" + unscreen + " overlap=" + overlap + " ai_file=" + aiFile );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let win = windows[0];
   let view = win.mainView;
   if ( !view.image.isColor || view.image.numberOfChannels < 3 )
      throw new Error( "Expected nonlinear RGB input" );

   let before = windowIds();
   let SXT = new StarXTerminator;
   SXT.stars = true;
   SXT.unscreen = unscreen;
   SXT.overlap = overlap;
   if ( aiFile )
      SXT.ai_file = aiFile;

   logMsg( "Executing StarXTerminator..." );
   if ( !SXT.executeOn( view ) )
      throw new Error( "StarXTerminator.executeOn returned false" );
   logMsg( "StarXTerminator complete" );

   let starsWin = findNewWindow( before, win.mainView.id );
   if ( !starsWin )
      throw new Error( "StarXTerminator did not create a stars image window" );
   logMsg( "stars window id=" + starsWin.mainView.id );

   if ( !win.saveAs( starless, false, false, false, false ) )
      throw new Error( "Saving starless image failed" );
   if ( !starsWin.saveAs( stars, false, false, false, false ) )
      throw new Error( "Saving stars image failed" );

   starsWin.forceClose();
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

__f__.close();
