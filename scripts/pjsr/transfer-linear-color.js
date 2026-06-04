// Transfer a fitted linear color transform from one image pair to a target.
// Fits per channel: calibrated = slope*raw + intercept, then applies it.
// Usage:
//   -r=transfer-linear-color.js,before=<raw.xisf>,after=<spcc.xisf>,target=<comet.xisf>,output=<xisf>,log=<path>

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

var logPath = arg( "log", "work/logs/transfer-linear-color.log" );
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

function fitChannel( before, after, channel, step, low, high )
{
   let w = Math.min( before.width, after.width );
   let h = Math.min( before.height, after.height );
   before.selectedChannel = channel;
   after.selectedChannel = channel;

   let n = 0;
   let sx = 0, sy = 0, sxx = 0, sxy = 0;
   for ( let y = Math.floor( step/2 ); y < h; y += step )
   {
      for ( let x = Math.floor( step/2 ); x < w; x += step )
      {
         let xv = before.sample( x, y );
         let yv = after.sample( x, y );
         if ( !isFinite( xv ) || !isFinite( yv ) )
            continue;
         if ( xv <= low || xv >= high || yv <= low || yv >= high )
            continue;
         sx += xv;
         sy += yv;
         sxx += xv*xv;
         sxy += xv*yv;
         ++n;
      }
   }

   let denom = n*sxx - sx*sx;
   if ( n < 100 || Math.abs( denom ) < 1.0e-20 )
      throw new Error( "Insufficient samples for channel " + channel + ": n=" + n );

   let slope = ( n*sxy - sx*sy )/denom;
   let intercept = ( sy - slope*sx )/n;
   return { slope:slope, intercept:intercept, samples:n };
}

function jsNum( x )
{
   return x.toPrecision( 15 ).replace( /0+$/, "" ).replace( /\.$/, "" );
}

try
{
   let beforePath = arg( "before", "" );
   let afterPath = arg( "after", "" );
   let targetPath = arg( "target", "" );
   let outputPath = arg( "output", "" );
   let step = Math.max( 2, Math.round( numArg( "step", 16 ) ) );
   let low = numArg( "low", 0.00001 );
   let high = numArg( "high", 0.65 );

   if ( !beforePath || !afterPath || !targetPath || !outputPath )
      throw new Error( "Missing before, after, target, or output argument" );

   log( "before=" + beforePath );
   log( "after=" + afterPath );
   log( "target=" + targetPath );
   log( "output=" + outputPath );
   log( "fit step=" + step + " low=" + low + " high=" + high );

   let beforeWin = openOne( beforePath );
   let afterWin = openOne( afterPath );
   let targetWin = openOne( targetPath );
   let before = beforeWin.mainView.image;
   let after = afterWin.mainView.image;
   let target = targetWin.mainView.image;

   if ( !before.isColor || !after.isColor || !target.isColor )
      throw new Error( "Expected RGB images" );

   let fit = [];
   for ( let c = 0; c < 3; ++c )
   {
      fit[c] = fitChannel( before, after, c, step, low, high );
      log( "channel " + c + " slope=" + fit[c].slope.toPrecision( 12 ) +
           " intercept=" + fit[c].intercept.toPrecision( 12 ) +
           " samples=" + fit[c].samples );
   }
   before.resetSelections();
   after.resetSelections();

   let P = new PixelMath;
   P.useSingleExpression = false;
   P.expression0 = "max(min($T[0]*" + jsNum( fit[0].slope ) + " + " + jsNum( fit[0].intercept ) + ", 1), 0)";
   P.expression1 = "max(min($T[1]*" + jsNum( fit[1].slope ) + " + " + jsNum( fit[1].intercept ) + ", 1), 0)";
   P.expression2 = "max(min($T[2]*" + jsNum( fit[2].slope ) + " + " + jsNum( fit[2].intercept ) + ", 1), 0)";
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.rescale = false;
   P.createNewImage = false;
   P.showNewImage = false;
   P.generateOutput = true;
   if ( !P.executeOn( targetWin.mainView ) )
      throw new Error( "PixelMath failed" );

   if ( !targetWin.saveAs( outputPath, false, false, false, false ) )
      throw new Error( "saveAs failed" );
   log( "saved" );

   targetWin.forceClose();
   afterWin.forceClose();
   beforeWin.forceClose();
}
catch ( e )
{
   log( "EXCEPTION: " + e );
   if ( e.stack )
      log( "STACK: " + e.stack );
}

f.close();
