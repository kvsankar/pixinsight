// Apply a DynamicCrop and save an XISF.
// Usage:
//   -r=crop-xisf.js,input=<xisf>,output=<xisf>,centerX=0.54,centerY=0.48,width=0.75,height=0.74,log=<path>

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
   let v = arg( name, null );
   if ( v == null || v.length == 0 )
      return def;
   let n = parseFloat( v );
   return isNaN( n ) ? def : n;
}

var logPath = arg( "log", "work/logs/crop-xisf.log" );
var f = new File;
f.createForWriting( logPath );

function log( s )
{
   f.outTextLn( new Date().toISOString() + " " + s );
   f.flush();
   console.noteln( s );
}

try
{
   let input = arg( "input", "" );
   let output = arg( "output", "" );
   let centerX = numArg( "centerX", 0.54 );
   let centerY = numArg( "centerY", 0.48 );
   let width = numArg( "width", 0.75 );
   let height = numArg( "height", 0.74 );

   if ( !input || !output )
      throw new Error( "Missing input or output argument" );

   log( "input=" + input );
   log( "output=" + output );
   log( "crop centerX=" + centerX + " centerY=" + centerY +
        " width=" + width + " height=" + height );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed: " + input );

   let win = windows[0];
   let view = win.mainView;
   log( "before=" + view.image.width + "x" + view.image.height );

   let crop = new DynamicCrop;
   crop.centerX = centerX;
   crop.centerY = centerY;
   crop.width = width;
   crop.height = height;
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
   if ( !crop.executeOn( view ) )
      throw new Error( "DynamicCrop failed" );

   log( "after=" + view.image.width + "x" + view.image.height );
   if ( !win.saveAs( output, false, false, false, false ) )
      throw new Error( "saveAs failed" );

   win.forceClose();
   log( "done" );
}
catch ( e )
{
   log( "EXCEPTION: " + e );
   if ( e.stack )
      log( "STACK: " + e.stack );
}

f.close();
