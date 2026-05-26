// Rosette v3 presentation pass using StarXTerminator starless/stars layers.
// Starts from nonlinear starless and unscreened stars images, enhances the
// nebula separately, attenuates stars, recombines, then exports.
// Usage:
//   -r=03r-rosette-starless-v3.js,starless=<xisf>,stars=<xisf>,output=<xisf>,tiff=<tif>,jpg=<jpg>
// Optional old-reference/depth controls:
//   skyDarken, depthContrast, warmDepth, blueDrop, blueTarget
// Optional subtle/sparse star controls:
//   depthBeforeStars, starThreshold, starSoftness

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

var __log__ = arg( "log", "work/logs/phase3r-rosette-starless-v3.log" );
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

function openOne( path, label )
{
   let windows = ImageWindow.open( path );
   if ( windows.length == 0 )
      throw new Error( "Open failed for " + label + ": " + path );
   return windows[0];
}

try
{
   let starlessPath = arg( "starless", null );
   let starsPath = arg( "stars", null );
   let output = arg( "output", null );
   let tiff = arg( "tiff", null );
   let jpg = arg( "jpg", null );
   if ( !starlessPath || !starsPath || !output )
      throw new Error( "Missing starless, stars, or output argument" );

   let nebulaContrast = numArg( "nebulaContrast", 0.11 );
   let redLift = numArg( "redLift", 0.08 );
   let greenDrop = numArg( "greenDrop", 0.035 );
   let satAmount = numArg( "satAmount", 0.08 );
   let bgNeutral = numArg( "bgNeutral", 0.35 );
   let starScale = numArg( "starScale", 0.72 );
   let starDesat = numArg( "starDesat", 0.35 );
   let skyDarken = numArg( "skyDarken", 0.0 );
   let depthContrast = numArg( "depthContrast", 0.0 );
   let warmDepth = numArg( "warmDepth", 0.0 );
   let blueDrop = numArg( "blueDrop", 0.0 );
   let blueTarget = numArg( "blueTarget", 0.58 );
   let depthBeforeStars = arg( "depthBeforeStars", "false" ) == "true";
   let starThreshold = numArg( "starThreshold", 0.0 );
   let starSoftness = numArg( "starSoftness", 0.035 );
   let crop = arg( "crop", "false" ) == "true";

   logMsg( "starless=" + starlessPath );
   logMsg( "stars=" + starsPath );
   logMsg( "output=" + output );
   logMsg( "tiff=" + tiff );
   logMsg( "jpg=" + jpg );
   logMsg( "nebulaContrast=" + nebulaContrast + " redLift=" + redLift +
           " greenDrop=" + greenDrop + " satAmount=" + satAmount +
           " bgNeutral=" + bgNeutral + " starScale=" + starScale +
           " starDesat=" + starDesat + " skyDarken=" + skyDarken +
           " depthContrast=" + depthContrast + " warmDepth=" + warmDepth +
           " blueDrop=" + blueDrop + " blueTarget=" + blueTarget +
           " depthBeforeStars=" + depthBeforeStars +
           " starThreshold=" + starThreshold +
           " starSoftness=" + starSoftness + " crop=" + crop );

   let starlessWin = openOne( starlessPath, "starless" );
   let starsWin = openOne( starsPath, "stars" );
   let view = starlessWin.mainView;
   let starsView = starsWin.mainView;
   let image = view.image;
   if ( !image.isColor || image.numberOfChannels < 3 )
      throw new Error( "Expected RGB starless input" );
   if ( starsView.image.width != image.width || starsView.image.height != image.height )
      throw new Error( "Starless and stars dimensions differ" );

   let L = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
   let neb = "(max(min((" + L + "-0.23)/0.47,1),0)*(1-max(min((" + L + "-0.78)/0.16,1),0)))";
   let bg = "(1-max(min((" + L + "-0.16)/0.26,1),0))";

   logMsg( "Enhancing starless nebula layer..." );
   let P = new PixelMath;
   P.useSingleExpression = false;
   P.expression0 = "max(min($T[0] + " + neb + "*" + jsNum( redLift ) +
                   "*(1-$T[0]) + " + neb + "*" + jsNum( nebulaContrast ) +
                   "*($T[0]-0.42) - " + bg + "*" + jsNum( bgNeutral ) +
                   "*max($T[0]-$T[1],0),1),0)";
   P.expression1 = "max(min($T[1]*(1-" + neb + "*" + jsNum( greenDrop ) +
                   "),1),0)";
   P.expression2 = "max(min($T[2] + " + neb + "*" + jsNum( nebulaContrast*0.45 ) +
                   "*($T[2]-0.42) - " + bg + "*" + jsNum( bgNeutral*0.45 ) +
                   "*max($T[2]-$T[1],0),1),0)";
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.rescale = false;
   P.createNewImage = false;
   P.showNewImage = false;
   P.generateOutput = true;
   if ( !P.executeOn( view ) )
      throw new Error( "Starless PixelMath failed" );

   if ( satAmount > 0 )
   {
      let C = new CurvesTransformation;
      C.S = [
         [ 0.00000, 0.00000 ],
         [ 0.25000, 0.25000 + satAmount*0.12 ],
         [ 0.52000, 0.52000 + satAmount ],
         [ 0.82000, 0.82000 + satAmount*0.30 ],
         [ 1.00000, 1.00000 ]
      ];
      C.St = CurvesTransformation.AkimaSubsplines;
      if ( !C.executeOn( view ) )
         throw new Error( "Starless saturation curve failed" );
   }

   let outWin = new ImageWindow( image.width, image.height,
                                 image.numberOfChannels, 32, true,
                                 true, "rosette_v3_recombined" );
   outWin.mainView.beginProcess( UndoFlag.NoSwapFile );
   outWin.mainView.image.assign( view.image );
   outWin.mainView.endProcess();

   function applyDepthHue( targetView )
   {
      let outL = "(0.2126*$T[0]+0.7152*$T[1]+0.0722*$T[2])";
      let outSky = "(1-max(min((" + outL + "-0.16)/0.34,1),0))";
      let outMid = "(max(min((" + outL + "-0.18)/0.42,1),0)*(1-max(min((" + outL + "-0.80)/0.16,1),0)))";
      let outNeb = "(max(min((" + outL + "-0.22)/0.46,1),0)*(1-max(min((" + outL + "-0.82)/0.15,1),0)))";
      let redExcess = "max(min(($T[0]-$T[1])*5,1),0)";

      let D = new PixelMath;
      D.useSingleExpression = false;
      D.expression0 = "max(min($T[0]*(1-" + outSky + "*" + jsNum( skyDarken ) +
                      ") + " + outMid + "*" + jsNum( depthContrast ) +
                      "*($T[0]-0.44) + " + outNeb + "*" + jsNum( warmDepth ) +
                      "*(1-$T[0]),1),0)";
      D.expression1 = "max(min($T[1]*(1-" + outSky + "*" + jsNum( skyDarken*0.95 ) +
                      ") + " + outMid + "*" + jsNum( depthContrast ) +
                      "*($T[1]-0.44) - " + outNeb + "*" + jsNum( warmDepth*0.35 ) +
                      "*$T[1],1),0)";
      D.expression2 = "max(min($T[2]*(1-" + outSky + "*" + jsNum( skyDarken*0.90 ) +
                      ") + " + outMid + "*" + jsNum( depthContrast ) +
                      "*($T[2]-0.44) - " + outNeb + "*" + redExcess + "*" + jsNum( blueDrop ) +
                      "*max($T[2]-" + jsNum( blueTarget ) + "*$T[0],0),1),0)";
      D.truncate = true;
      D.truncateLower = 0;
      D.truncateUpper = 1;
      D.rescale = false;
      D.createNewImage = false;
      D.showNewImage = false;
      D.generateOutput = true;
      if ( !D.executeOn( targetView ) )
         throw new Error( "Final depth/hue PixelMath failed" );
   }

   if ( depthBeforeStars && (skyDarken > 0 || depthContrast > 0 || warmDepth > 0 || blueDrop > 0) )
   {
      logMsg( "Applying optional final depth/hue pass before star recombination..." );
      applyDepthHue( outWin.mainView );
   }

   let starId = starsView.id;
   logMsg( "Recombining stars from view " + starId + "..." );
   P = new PixelMath;
   P.useSingleExpression = false;
   let starLum = "((" + starId + "[0]+" + starId + "[1]+" + starId + "[2])/3)";
   let starGate = starThreshold > 0 ?
                  "max(min((" + starLum + "-" + jsNum( starThreshold ) + ")/" + jsNum( starSoftness ) + ",1),0)" :
                  "1";
   P.expression0 = "max(min($T[0] + " + jsNum( starScale ) + "*" + starGate + "*" +
                   "((" + starId + "[0]*(1-" + jsNum( starDesat ) + "))+" +
                   "((( " + starId + "[0]+" + starId + "[1]+" + starId + "[2])/3)*" +
                   jsNum( starDesat ) + ")),1),0)";
   P.expression1 = "max(min($T[1] + " + jsNum( starScale ) + "*" + starGate + "*" +
                   "((" + starId + "[1]*(1-" + jsNum( starDesat ) + "))+" +
                   "((( " + starId + "[0]+" + starId + "[1]+" + starId + "[2])/3)*" +
                   jsNum( starDesat ) + ")),1),0)";
   P.expression2 = "max(min($T[2] + " + jsNum( starScale ) + "*" + starGate + "*" +
                   "((" + starId + "[2]*(1-" + jsNum( starDesat ) + "))+" +
                   "((( " + starId + "[0]+" + starId + "[1]+" + starId + "[2])/3)*" +
                   jsNum( starDesat ) + ")),1),0)";
   P.truncate = true;
   P.truncateLower = 0;
   P.truncateUpper = 1;
   P.rescale = false;
   P.createNewImage = false;
   P.showNewImage = false;
   P.generateOutput = true;
   if ( !P.executeOn( outWin.mainView ) )
      throw new Error( "Star recombination PixelMath failed" );

   if ( !depthBeforeStars && (skyDarken > 0 || depthContrast > 0 || warmDepth > 0 || blueDrop > 0) )
   {
      logMsg( "Applying optional final depth/hue pass..." );
      applyDepthHue( outWin.mainView );
   }

   if ( crop )
   {
      logMsg( "Applying optional final crop..." );
      let dc = new DynamicCrop;
      dc.centerX = 0.5000;
      dc.centerY = 0.5000;
      dc.width = 0.9420;
      dc.height = 0.9360;
      dc.angle = 0.0;
      dc.scaleX = 1.0;
      dc.scaleY = 1.0;
      dc.optimizeFast = true;
      dc.noGUIMessages = true;
      dc.interpolation = DynamicCrop.Auto;
      dc.clampingThreshold = 0.30;
      dc.smoothness = 1.50;
      dc.red = 0.0;
      dc.green = 0.0;
      dc.blue = 0.0;
      dc.alpha = 1.0;
      if ( !dc.executeOn( outWin.mainView ) )
         throw new Error( "DynamicCrop failed" );
   }

   if ( !outWin.saveAs( output, false, false, false, false ) )
      throw new Error( "Saving output XISF failed" );
   if ( tiff && !outWin.saveAs( tiff, false, false, false, false ) )
      throw new Error( "Saving TIFF failed" );

   if ( jpg )
   {
      let outImage = outWin.mainView.image;
      let jpgWin = new ImageWindow( outImage.width, outImage.height,
                                    outImage.numberOfChannels, 8, false,
                                    true, "rosette_v3_jpeg" );
      jpgWin.mainView.beginProcess( UndoFlag.NoSwapFile );
      jpgWin.mainView.image.assign( outImage );
      jpgWin.mainView.endProcess();
      if ( !jpgWin.saveAs( jpg, false, false, false, false ) )
         throw new Error( "Saving JPEG failed" );
      jpgWin.forceClose();
   }

   outWin.forceClose();
   starsWin.forceClose();
   starlessWin.forceClose();
   logMsg( "complete" );
}
catch ( e )
{
   logMsg( "EXCEPTION: " + e );
   if ( e.stack )
      logMsg( "STACK: " + e.stack );
}

__f__.close();
