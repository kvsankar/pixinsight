// Render a cropped JPEG using an STF computed from a separate cropped reference.
// This is for fair visual comparisons: every target gets the same crop and stretch.
// Usage:
//   -r=render-cropped-reference-stf-jpeg.js,input=<xisf>,reference=<xisf>,output=<jpg>,centerX=0.54,centerY=0.48,width=0.75,height=0.74,scale=0.5,linkedRGB=true,log=<path>

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

function boolArg( name, def )
{
   let v = arg( name, null );
   if ( v == null )
      return def;
   v = v.toLowerCase();
   return v == "1" || v == "true" || v == "yes";
}

var logPath = arg( "log", "work/logs/render-cropped-reference-stf-jpeg.log" );
var f = new File;
f.createForWriting( logPath );

function log( s )
{
   f.outTextLn( new Date().toISOString() + " " + s );
   f.flush();
   console.noteln( s );
}

function openOne( path )
{
   let windows = ImageWindow.open( path );
   if ( windows.length == 0 )
      throw new Error( "Open failed: " + path );
   return windows[0];
}

function applyCrop( view, cx, cy, w, h )
{
   let crop = new DynamicCrop;
   crop.centerX = cx;
   crop.centerY = cy;
   crop.width = w;
   crop.height = h;
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
}

function autoSTF( view, linkedRGB, shadowsClipping, targetBackground )
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
   return view.image.computeAutoStretch( median, mad, shadowsClipping, targetBackground, linkedRGB );
}

try
{
   let input = arg( "input", "" );
   let reference = arg( "reference", "" );
   let output = arg( "output", "" );
   let centerX = numArg( "centerX", 0.54 );
   let centerY = numArg( "centerY", 0.48 );
   let width = numArg( "width", 0.75 );
   let height = numArg( "height", 0.74 );
   let scale = numArg( "scale", 0.50 );
   let linkedRGB = boolArg( "linkedRGB", true );
   let shadowsClipping = numArg( "shadows", -2.8 );
   let targetBackground = numArg( "targetBg", 0.25 );

   if ( !input || !reference || !output )
      throw new Error( "Missing input, reference, or output argument" );

   log( "input=" + input );
   log( "reference=" + reference );
   log( "output=" + output );
   log( "crop centerX=" + centerX + " centerY=" + centerY +
        " width=" + width + " height=" + height );
   log( "scale=" + scale + " linkedRGB=" + linkedRGB );
   log( "shadows=" + shadowsClipping + " targetBg=" + targetBackground );

   let refWin = openOne( reference );
   applyCrop( refWin.mainView, centerX, centerY, width, height );
   let df = autoSTF( refWin.mainView, linkedRGB, shadowsClipping, targetBackground );
   log( "reference cropped size=" + refWin.mainView.image.width + "x" +
        refWin.mainView.image.height );

   let srcWin = openOne( input );
   applyCrop( srcWin.mainView, centerX, centerY, width, height );
   let image = srcWin.mainView.image;
   log( "input cropped size=" + image.width + "x" + image.height );

   let preview = new ImageWindow( image.width, image.height,
                                  image.numberOfChannels, 8, false,
                                  image.isColor, "comparison_preview" );
   preview.mainView.beginProcess( UndoFlag.NoSwapFile );
   preview.mainView.image.assign( image );
   preview.mainView.image.applyDisplayFunction( df );
   preview.mainView.endProcess();

   if ( scale > 0 && Math.abs( scale - 1 ) > 0.0001 )
   {
      let R = new Resample;
      R.xSize = scale;
      R.ySize = scale;
      R.mode = Resample.RelativeDimensions;
      R.absoluteMode = Resample.ForceWidthAndHeight;
      R.interpolation = Resample.Auto;
      R.clampingThreshold = 0.30;
      R.smoothness = 1.50;
      R.executeOn( preview.mainView, false );
      log( "preview size=" + preview.mainView.image.width + "x" +
           preview.mainView.image.height );
   }

   if ( !preview.saveAs( output, false, false, false, false ) )
      throw new Error( "saveAs failed" );

   preview.forceClose();
   srcWin.forceClose();
   refWin.forceClose();
   log( "done" );
}
catch ( e )
{
   log( "EXCEPTION: " + e );
   if ( e.stack )
      log( "STACK: " + e.stack );
}

f.close();
