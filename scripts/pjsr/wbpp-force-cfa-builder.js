// WBPP pipeline builder hook: force the CFA pattern for light groups, then
// build the standard light pipeline. Intended for dataset-specific diagnostics
// where RAW auto-detection has been validated against calibrated CFA frames.
//
// Usage with WBPP automation:
//   usePipelineBuilderScript=true,
//   pipelineBuilderScriptFile=<this file>,
//   forceCfaPattern=RGGB

function wbppForceCfaArg( name )
{
   for ( let i = 0; i < Runtime.jsArguments.length; ++i )
   {
      let eq = Runtime.jsArguments[i].indexOf( "=" );
      if ( eq > 0 && Runtime.jsArguments[i].substring( 0, eq ) == name )
         return Runtime.jsArguments[i].substring( eq + 1 );
   }
   return "";
}

let forcedPatternName = wbppForceCfaArg( "forceCfaPattern" ).toUpperCase();
let forcedPatternMap = {
   "AUTO": Debayer.Auto,
   "RGGB": Debayer.RGGB,
   "BGGR": Debayer.BGGR,
   "GBRG": Debayer.GBRG,
   "GRBG": Debayer.GRBG
};

if ( forcedPatternName == "" || forcedPatternMap[forcedPatternName] == undefined )
   throw new Error( "Invalid or missing forceCfaPattern: " + forcedPatternName );

let preGroups = engine.groupsManager.groupsForMode( BPP.GroupingMode.PRE );
for ( let i = 0; i < preGroups.length; ++i )
{
   let group = preGroups[i];
   if ( group.imageType == ImageType.Light && group.isCFA )
   {
      group.CFAPattern = forcedPatternMap[forcedPatternName];
      group.debayerMethod = Debayer.VNG;
      console.noteln( "Forced light CFA pattern to " + forcedPatternName + " for " + group.toString() );
   }
}

this.buildPipelineForLight();
