// Per-channel background calibration for DSLR Rosette experiments.
// Applies optional channel scale factors, then subtracts per-channel offsets so
// the channel medians share a common background level.
// Usage:
//   -r=02c-per-channel-background-cal.js,input=<xisf>,output=<xisf>,redScale=1,greenScale=1,blueScale=1,target=min|green|average

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

var __log__ = arg( "log", "work/logs/per-channel-background-cal-pjsr.log" );
var __f__ = new File;
__f__.createForWriting( __log__ );

function logMsg( msg )
{
   __f__.outTextLn( new Date().toISOString() + " " + msg );
   __f__.flush();
   console.noteln( msg );
}

function num( name, def )
{
   let v = parseFloat( arg( name, "" + def ) );
   return isFinite( v ) ? v : def;
}

function jsNum( x )
{
   return x.toPrecision( 15 ).replace( /0+$/, "" ).replace( /\.$/, "" );
}

try
{
   let input = arg( "input", null );
   let output = arg( "output", null );
   if ( !input || !output )
      throw new Error( "Missing input or output" );

   let scales = [
      num( "redScale", 1.0 ),
      num( "greenScale", 1.0 ),
      num( "blueScale", 1.0 )
   ];
   let targetMode = arg( "target", "min" ).toLowerCase();

   logMsg( "input=" + input );
   logMsg( "output=" + output );
   logMsg( "scales=" + scales.join( "," ) );
   logMsg( "target=" + targetMode );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let win = windows[0];
   let view = win.mainView;
   if ( !view.image.isColor || view.image.numberOfChannels < 3 )
      throw new Error( "Expected an RGB image" );

   let med = view.computeOrFetchProperty( "Median" );
   let scaledMed = [
      med[0]*scales[0],
      med[1]*scales[1],
      med[2]*scales[2]
   ];
   let target = Math.min( scaledMed[0], scaledMed[1], scaledMed[2] );
   if ( targetMode == "green" )
      target = scaledMed[1];
   else if ( targetMode == "average" )
      target = ( scaledMed[0] + scaledMed[1] + scaledMed[2] )/3;

   let offsets = [
      scaledMed[0] - target,
      scaledMed[1] - target,
      scaledMed[2] - target
   ];
   logMsg( "median=" + med.join( "," ) );
   logMsg( "scaledMedian=" + scaledMed.join( "," ) );
   logMsg( "targetMedian=" + target );
   logMsg( "offsets=" + offsets.join( "," ) );

   let P = new PixelMath;
   P.useSingleExpression = false;
   P.expression0 = "max(min($T[0]*" + jsNum( scales[0] ) + " - " + jsNum( offsets[0] ) + ", 1), 0)";
   P.expression1 = "max(min($T[1]*" + jsNum( scales[1] ) + " - " + jsNum( offsets[1] ) + ", 1), 0)";
   P.expression2 = "max(min($T[2]*" + jsNum( scales[2] ) + " - " + jsNum( offsets[2] ) + ", 1), 0)";
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.rescale = false;
   P.createNewImage = false;
   P.showNewImage = false;
   P.generateOutput = true;
   if ( !P.executeOn( view ) )
      throw new Error( "PixelMath failed" );

   if ( !win.saveAs( output, false, false, false, false ) )
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

__f__.close();
