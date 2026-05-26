// Blend registered red/H-alpha-like support into an RGB reference.
// Usage:
//   -r=blend-red-support.js,base=<rgb xisf>,support1=<registered xisf>,support2=<optional xisf>,output=<xisf>,addWeight=0.7,w1=1,w2=1,log=<path>

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

function jsNum( x )
{
   return format( "%.12g", x );
}

var logPath = arg( "log", "work/logs/blend-red-support-pjsr.log" );
var f = new File;
f.createForWriting( logPath );

function log( s )
{
   f.outTextLn( new Date().toISOString() + " " + s );
   f.flush();
   console.noteln( s );
}

function channelMedian( view, c )
{
   view.image.selectedChannel = c;
   let m = view.image.median();
   view.image.resetSelections();
   return m;
}

function channelMAD( view, c )
{
   let m = view.computeOrFetchProperty( "MAD" );
   return Math.max( 1.0e-8, 1.4826*m[c] );
}

function openOne( path )
{
   let w = ImageWindow.open( path );
   if ( w.length == 0 )
      throw new Error( "Open failed: " + path );
   return w[0];
}

try
{
   let basePath = arg( "base", "" );
   let support1Path = arg( "support1", "" );
   let support2Path = arg( "support2", "" );
   let outputPath = arg( "output", "" );
   let addWeight = numArg( "addWeight", 0.70 );
   let w1 = numArg( "w1", 1.0 );
   let w2 = numArg( "w2", 1.0 );
   let starLow = numArg( "starLow", 0.035 );
   let starHigh = numArg( "starHigh", 0.120 );

   if ( !basePath || !support1Path || !outputPath )
      throw new Error( "Missing base, support1, or output argument" );

   log( "base=" + basePath );
   log( "support1=" + support1Path );
   log( "support2=" + support2Path );
   log( "output=" + outputPath );
   log( "addWeight=" + addWeight + " w1=" + w1 + " w2=" + w2 +
        " starLow=" + starLow + " starHigh=" + starHigh );

   let baseWin = openOne( basePath );
   let s1Win = openOne( support1Path );
   let s2Win = support2Path ? openOne( support2Path ) : null;

   let base = baseWin.mainView;
   let s1 = s1Win.mainView;
   let s2 = s2Win ? s2Win.mainView : null;

   let image = base.image;
   if ( !image.isColor || image.numberOfChannels < 3 )
      throw new Error( "Base image must be RGB" );
   if ( s1.image.width != image.width || s1.image.height != image.height )
      throw new Error( "Support1 geometry does not match base" );
   if ( s2 && (s2.image.width != image.width || s2.image.height != image.height) )
      throw new Error( "Support2 geometry does not match base" );

   log( "base id=" + base.id + " size=" + image.width + "x" + image.height );
   log( "support1 id=" + s1.id );
   if ( s2 )
      log( "support2 id=" + s2.id );

   let baseMed = channelMedian( base, 0 );
   let baseMad = channelMAD( base, 0 );
   let s1Med = channelMedian( s1, 0 );
   let s1Mad = channelMAD( s1, 0 );
   let s2Med = s2 ? channelMedian( s2, 0 ) : 0;
   let s2Mad = s2 ? channelMAD( s2, 0 ) : 1;
   let s1Scale = baseMad / s1Mad;
   let s2Scale = s2 ? baseMad / s2Mad : 1;

   log( "base red median=" + baseMed + " mad=" + baseMad );
   log( "support1 red median=" + s1Med + " mad=" + s1Mad + " scale=" + s1Scale );
   if ( s2 )
      log( "support2 red median=" + s2Med + " mad=" + s2Mad + " scale=" + s2Scale );

   let outWin = new ImageWindow( image.width, image.height,
                                 image.numberOfChannels,
                                 image.bitsPerSample,
                                 true,
                                 image.isColor,
                                 "horsehead_rgb_red_support" );
   outWin.mainView.beginProcess( UndoFlag.NoSwapFile );
   outWin.mainView.image.assign( image );
   outWin.mainView.endProcess();
   outWin.copyAstrometricSolution( baseWin );
   outWin.keywords = baseWin.keywords;

   let s1Scaled = "(" + jsNum( baseMed ) + "+(" + s1.id + "[0]-" +
                  jsNum( s1Med ) + ")*" + jsNum( s1Scale ) + ")";
   let support = s1Scaled;
   if ( s2 )
   {
      let s2Scaled = "(" + jsNum( baseMed ) + "+(" + s2.id + "[0]-" +
                     jsNum( s2Med ) + ")*" + jsNum( s2Scale ) + ")";
      support = "((" + jsNum( w1 ) + "*" + s1Scaled + "+" +
                jsNum( w2 ) + "*" + s2Scaled + ")/" + jsNum( w1 + w2 ) + ")";
   }

   let L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let starProtect = "(1-max(min((" + L + "-" + jsNum( starLow ) + ")/" +
                     jsNum( starHigh - starLow ) + ",1),0))";
   let redExcess = "max(0," + support + "-$T[0])";

   let P = new PixelMath;
   P.useSingleExpression = false;
   P.expression0 = "max(min($T[0]+" + jsNum( addWeight ) + "*" +
                   starProtect + "*" + redExcess + ",1),0)";
   P.expression1 = "$T[1]";
   P.expression2 = "$T[2]";
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.rescale = false;
   P.createNewImage = false;
   P.showNewImage = false;
   P.generateOutput = true;

   log( "PixelMath R=" + P.expression0 );
   if ( !P.executeOn( outWin.mainView ) )
      throw new Error( "PixelMath blend failed" );

   let ok = outWin.saveAs( outputPath, false, false, false, false );
   log( "saveAs returned=" + ok );
   if ( !ok )
      throw new Error( "saveAs failed" );

   outWin.forceClose();
   baseWin.forceClose();
   s1Win.forceClose();
   if ( s2Win )
      s2Win.forceClose();
   log( "done" );
}
catch ( e )
{
   log( "EXCEPTION: " + e );
   if ( e.stack )
      log( "STACK: " + e.stack );
}

f.close();
