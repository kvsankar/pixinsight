// Rosette v2 visual polish for nonlinear SPCC-based images.
// Selectively neutralizes low-luminance sky, then increases nebular contrast
// and color without applying a global red push to the whole frame.
// Usage:
//   -r=03r-rosette-v2-polish.js,input=<xisf>,output=<xisf>

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

var __log__ = arg( "log", "work/logs/phase3r-rosette-v2-polish.log" );
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

   let bgLow = numArg( "bgLow", 0.18 );
   let bgHigh = numArg( "bgHigh", 0.36 );
   let nebLow = numArg( "nebLow", 0.31 );
   let nebHigh = numArg( "nebHigh", 0.62 );
   let redNeutral = numArg( "redNeutral", 0.85 );
   let blueNeutral = numArg( "blueNeutral", 0.55 );
   let greenNeutral = numArg( "greenNeutral", 0.0 );
   let postRedNeutral = numArg( "postRedNeutral", 0.85 );
   let postBlueNeutral = numArg( "postBlueNeutral", 0.60 );
   let contrast = numArg( "contrast", 0.18 );
   let redLift = numArg( "redLift", 0.20 );
   let greenDrop = numArg( "greenDrop", 0.10 );
   let satAmount = numArg( "satAmount", 0.12 );

   logMsg( "input=" + input );
   logMsg( "output=" + output );
   logMsg( "bgLow=" + bgLow + " bgHigh=" + bgHigh +
           " nebLow=" + nebLow + " nebHigh=" + nebHigh +
           " redNeutral=" + redNeutral + " blueNeutral=" + blueNeutral +
           " greenNeutral=" + greenNeutral +
           " postRedNeutral=" + postRedNeutral +
           " postBlueNeutral=" + postBlueNeutral +
           " contrast=" + contrast + " redLift=" + redLift +
           " greenDrop=" + greenDrop + " satAmount=" + satAmount );

   let windows = ImageWindow.open( input );
   if ( windows.length == 0 )
      throw new Error( "Open failed" );

   let win = windows[0];
   let view = win.mainView;
   if ( !view.image.isColor || view.image.numberOfChannels < 3 )
      throw new Error( "Expected RGB input" );

   let L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let bg = "(1-max(min((" + L + "-" + jsNum( bgLow ) + ")/" +
            jsNum( bgHigh - bgLow ) + ",1),0))";
   let nebRise = "max(min((" + L + "-" + jsNum( nebLow ) + ")/" +
                 jsNum( nebHigh - nebLow ) + ",1),0)";
   let starProtect = "(1-max(min((" + L + "-0.62)/0.24,1),0))";
   let neb = "((" + nebRise + ")*(" + starProtect + "))";

   // First, pull only low-luminance sky pixels toward local channel neutrality.
   let P = new PixelMath;
   P.useSingleExpression = false;
   P.expression0 = "max(min($T[0] - " + bg + "*" + jsNum( redNeutral ) +
                   "*max($T[0]-$T[1],0),1),0)";
   P.expression1 = "$T[1]";
   P.expression2 = "max(min($T[2] - " + bg + "*" + jsNum( blueNeutral ) +
                   "*max($T[2]-$T[1],0),1),0)";
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.rescale = false;
   P.createNewImage = false;
   P.showNewImage = false;
   P.generateOutput = true;
   if ( !P.executeOn( view ) )
      throw new Error( "Sky neutralization PixelMath failed" );

   // Then add a restrained nebular color/contrast lift, avoiding the darkest
   // sky and brightest star cores.
   P = new PixelMath;
   P.useSingleExpression = false;
   P.expression0 = "max(min($T[0] + " + neb + "*" + jsNum( redLift ) +
                   "*(1-$T[0]) + " + neb + "*" + jsNum( contrast ) +
                   "*($T[0]-0.45),1),0)";
   P.expression1 = "max(min($T[1]*(1-" + neb + "*" + jsNum( greenDrop ) +
                   ") + " + neb + "*" + jsNum( contrast ) +
                   "*($T[1]-0.45),1),0)";
   P.expression2 = "max(min($T[2] + " + neb + "*" + jsNum( contrast*0.65 ) +
                   "*($T[2]-0.45),1),0)";
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.rescale = false;
   P.createNewImage = false;
   P.showNewImage = false;
   P.generateOutput = true;
   if ( !P.executeOn( view ) )
      throw new Error( "Nebula contrast PixelMath failed" );

   if ( satAmount > 0 )
   {
      let C = new CurvesTransformation;
      C.S = [
         [ 0.00000, 0.00000 ],
         [ 0.26000, 0.26000 + satAmount*0.18 ],
         [ 0.56000, 0.56000 + satAmount ],
         [ 0.82000, 0.82000 + satAmount*0.35 ],
         [ 1.00000, 1.00000 ]
      ];
      C.St = CurvesTransformation.AkimaSubsplines;
      if ( !C.executeOn( view ) )
         throw new Error( "Saturation curve failed" );
   }

   // Final low-luminance cleanup after the nebular color lift.
   P = new PixelMath;
   P.useSingleExpression = false;
   P.expression0 = "max(min($T[0] - " + bg + "*" + jsNum( postRedNeutral ) +
                   "*max($T[0]-$T[1],0),1),0)";
   P.expression1 = "max(min($T[1] - " + bg + "*" + jsNum( greenNeutral ) +
                   "*max($T[1]-($T[0]+$T[2])/2,0),1),0)";
   P.expression2 = "max(min($T[2] - " + bg + "*" + jsNum( postBlueNeutral ) +
                   "*max($T[2]-$T[1],0),1),0)";
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.rescale = false;
   P.createNewImage = false;
   P.showNewImage = false;
   P.generateOutput = true;
   if ( !P.executeOn( view ) )
      throw new Error( "Final sky neutralization PixelMath failed" );

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
