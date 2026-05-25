// SPCC-based Rosette visual color enhancement on a nonlinear image.
// Starts from a stretched SPCC-calibrated image and applies a luminance-shaped
// color adjustment to diffuse nebular structure while avoiding the darkest sky
// and brightest star cores.
// Usage:
//   -r=03r-rosette-spcc-visual-color.js,input=<xisf>,output=<xisf>

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

var __log__ = arg( "log", "work/logs/phase3r-rosette-spcc-visual-color.log" );
var __f__ = new File;
__f__.createForWriting( __log__ );

function logMsg( msg )
{
   __f__.outTextLn( new Date().toISOString() + " " + msg );
   __f__.flush();
   console.noteln( msg );
}

function numArg( name, def )
{
   let v = Number( arg( name, "" + def ) );
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

   let low = numArg( "low", 0.26 );
   let high = numArg( "high", 0.56 );
   let starLow = numArg( "starLow", 0.72 );
   let starHigh = numArg( "starHigh", 0.92 );
   let redLift = numArg( "redLift", 0.28 );
   let greenDrop = numArg( "greenDrop", 0.18 );
   let blueDrop = numArg( "blueDrop", 0.02 );
   let satAmount = numArg( "satAmount", 0.16 );

   logMsg( "input=" + input );
   logMsg( "output=" + output );
   logMsg( "low=" + low + " high=" + high +
           " starLow=" + starLow + " starHigh=" + starHigh +
           " redLift=" + redLift + " greenDrop=" + greenDrop +
           " blueDrop=" + blueDrop + " satAmount=" + satAmount );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let win = windows[0];
   let view = win.mainView;
   if ( !view.image.isColor || view.image.numberOfChannels < 3 )
      throw new Error( "Expected RGB input" );

   let L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let rise = "max(min((" + L + "-" + jsNum( low ) + ")/" +
              jsNum( high - low ) + ",1),0)";
   let starProtect = "(1-max(min((" + L + "-" + jsNum( starLow ) + ")/" +
                     jsNum( starHigh - starLow ) + ",1),0))";
   let m = "((" + rise + ")*(" + starProtect + "))";

   let P = new PixelMath;
   P.useSingleExpression = false;
   P.expression0 = "max(min($T[0] + " + m + "*" + jsNum( redLift ) + "*(1-$T[0]),1),0)";
   P.expression1 = "max(min($T[1]*(1-" + m + "*" + jsNum( greenDrop ) + "),1),0)";
   P.expression2 = "max(min($T[2]*(1-" + m + "*" + jsNum( blueDrop ) + "),1),0)";
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.rescale = false;
   P.createNewImage = false;
   P.showNewImage = false;
   P.generateOutput = true;
   if ( !P.executeOn( view ) )
      throw new Error( "PixelMath color shaping failed" );

   if ( satAmount > 0 )
   {
      let C = new CurvesTransformation;
      C.S = [
         [ 0.00000, 0.00000 ],
         [ 0.30000, 0.30000 + satAmount*0.25 ],
         [ 0.60000, 0.60000 + satAmount ],
         [ 0.85000, 0.85000 + satAmount*0.35 ],
         [ 1.00000, 1.00000 ]
      ];
      C.St = CurvesTransformation.AkimaSubsplines;
      if ( !C.executeOn( view ) )
         throw new Error( "Saturation curve failed" );
   }

   let ok = win.saveAs( output, false, false, false, false );
   logMsg( "saveAs returned: " + ok );
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

__f__.close();
