import type { ColorScale } from './contract.css';

/**
 * PRIMITIVE TOKENS
 * ----------------
 * Raw 50–950 scales. These are plain data (not .css.ts) so they can be shared
 * with docs, tests, or a Figma sync script.
 */

console.log(generateAdaptiveScale("#F8FAFC")); // Near-White: Infers anchor step 50
console.log(generateAdaptiveScale("#0F172A")); // Near-Black: Infers anchor step 900
console.log(generateAdaptiveScale("#2563EB")); // Standard Mid: Infers anchor step 500
export const blue: ColorScale = {
  50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
  500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
};

export const violet: ColorScale = {
  50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa',
  500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
};

export const slate: ColorScale = {
  50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
  500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617',
};

export const emerald: ColorScale = {
  50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
  500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22',
};

export const orange: ColorScale = {
  50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c',
  500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407',
};

export const stone: ColorScale = {
  50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e',
  500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917', 950: '#0c0a09',
};
/**
 * Simple hex parser to RGB channels
 */
function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Standard RGB to HSL conversion for broad environment support
 */
function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Main function: Generates a full 50-950 scale from any hex code,
 * dynamically re-anchoring extreme near-white or near-black inputs.
 */
function generateAdaptiveScale(inputHex) {
  const rgb = hexToRgb(inputHex);
  const { h, s, l } = rgbToHsl(rgb);

  // 1. Target lightness anchors for a standard 50-950 scale
  const targetLightness = {
    50: 97, 100: 92, 200: 84, 300: 74, 400: 63,
    500: 50, 600: 40, 700: 29, 800: 18, 900: 10, 950: 5
  };

  // 2. Identify the closest natural numeric step for our input color
  let assignedStep = 500;
  let minDiff = Infinity;
  for (const [step, lightness] of Object.entries(targetLightness)) {
    const diff = Math.abs(l - lightness);
    if (diff < minDiff) {
      minDiff = diff;
      assignedStep = parseInt(step);
    }
  }

  const scale = {};

  // 3. Interpolate the scale steps dynamically
  Object.keys(targetLightness).forEach((stepStr) => {
    const currentStep = parseInt(stepStr);

    if (currentStep === assignedStep) {
      // Keep exact match original input unchanged
      scale[currentStep] = inputHex.toUpperCase();
    } else {
      // Calculate how far away this step is from our anchor step
      const stepDiff = currentStep - assignedStep;

      // Linearly interpolate lightness toward its respective target
      let targetL = targetLightness[currentStep];

      // Control saturation rules for extreme scales
      let finalS = s;
      if (l > 93) {
        // If input is near-white, inject subtle saturation context descending into darks
        finalS = currentStep > 300 ? Math.max(s, 12) : s;
      } else if (l < 10) {
        // If input is near-black, lift saturation for mid-tones so they don't look completely gray
        finalS = currentStep > 100 && currentStep < 800 ? Math.max(s, 15) : s;
      } else {
        // Standard extreme tint protection: Desaturate extremes slightly
        if (currentStep <= 100) finalS = Math.min(s, 35);
        if (currentStep >= 900) finalS = Math.min(s, 45);
      }

      scale[currentStep] = `hsl(${h}deg ${finalS}% ${targetL}%)`;
    }
  });

  return {
    meta: { inputHex, inferredAnchor: assignedStep, rawHsl: { h, s, l } },
    scale
  };
}

// --- Example Verification ---
console.log(generateAdaptiveScale("#F8FAFC")); // Near-White: Infers anchor step 50
console.log(generateAdaptiveScale("#0F172A")); // Near-Black: Infers anchor step 900
console.log(generateAdaptiveScale("#2563EB")); // Standard Mid: Infers anchor step 500

/* source: https://bolterandchainsword.com/topic/352780-paint-color-hexadecimal-codes/ */
const newCitadelColors = {
  abaddonBlack: '#231f20',
  administratumGrey: '#949b94',
  agraxEarthshade: '#5a543c',
  agrellanBadland: '#a17359',
  agrellanEarth: '#92816d',
  ahrimanBlue: '#00a5b9',
  alaitocBlue: '#295788',
  altdorfGuardBlue: '#1f56a8',
  armageddonDunes: '#fcaf09',
  armageddonDust: '#cbad0d',
  astorathRed: '#962f28',
  astrogranite: '#787878',
  astrograniteDebris: '#77726e',
  athonianCamoshade: '#798c3d',
  auricArmourGold: '#e9c278',
  averlandSunset: '#fcb825',
  baharrothBlue: '#78c4c7',
  balorBrown: '#8b5910',
  balthasarGold: '#87542f',
  banebladeBrown: '#927f6e',
  bestigorFlesh: '#d28b57',
  bielTanGreen: '#479259',
  blackfireEarth: '#f8902f',
  bloodForTheBloodGod: '#581011',
  bloodletter: '#cb2924',
  blueHorror: '#a2bad2',
  brassScorpion: '#b7895f',
  bugmansGlow: '#845045',
  cadianFleshtone: '#c87958',
  caledorSky: '#396f9e',
  calgarBlue: '#4273b8',
  calibanGreen: '#00401e',
  carroburgCrimson: '#9a4073',
  casandoraYellow: '#f1cb4e',
  castellanGreen: '#304921',
  celestraGrey: '#90a8a8',
  ceramiteWhite: '#ffffff',
  changelingPink: '#f4afce',
  chaosBlack: '#000000',
  chronusBlue: '#6e97cf',
  coeliaGreenshade: '#4a7f79',
  coraxWhite: '#ffffff',
  daemonetteHide: '#696685',
  darkReaper: '#3c5051',
  dawnstone: '#70756e',
  deathGuardGreen: '#9c9171',
  deathclawBrown: '#b36853',
  deathworldForest: '#5d6732',
  dechalaLilac: '#b59ecc',
  deepkinFlesh: '#d2d4c7',
  doombullBrown: '#5d000a',
  dornYellow: '#e3d28c',
  drakenhofNightshade: '#3b5997',
  dryadBark: '#34312c',
  druchiiViolet: '#6a397b',
  eldarFlesh: '#edc184',
  elysianGreen: '#758e3a',
  emperorsChildren: '#b94278',
  eshinGrey: '#4a4f53',
  etheriumBlue: '#a1b9d1',
  evilSunzScarlet: '#c21920',
  theFang: '#436276',
  fenrisianGrey: '#709cb7',
  fireDragonBright: '#f58651',
  flashGitzYellow: '#fff200',
  flayedOneFlesh: '#cbb48b',
  fueganOrange: '#ad6e38',
  fulgrimPink: '#f4afcc',
  fulguriteCopper: '#ba8f6d',
  gaussBlasterGreen: '#84c2a9',
  gehennasGold: '#d49761',
  genestealerPurple: '#7761aa',
  goldenGriffon: '#c6b791',
  golgfagBrown: '#8b5435',
  gorthorBrown: '#654641',
  guillimanBlue: '#2e83c6',
  hashutCopper: '#c69169',
  hellionGreen: '#83c3a9',
  hexosPalesun: '#f1dca3',
  hexwraithFlame: '#00aa5c',
  hoethBlue: '#4c7fb4',
  imrikBlue: '#4f8dbe',
  incubiDarkness: '#0b4849',
  ironbreaker: '#94999d',
  jokaeroOrange: '#ee3823',
  kabaliteGreen: '#028d66',
  kantorBlue: '#002051',
  karakStone: '#bb9662',
  khorneRed: '#6a0002',
  kindleflame: '#efb494',
  kislevFlesh: '#d6a876',
  kriegKhaki: '#b7ad78',
  lamentersYellow: '#fbf44c',
  leadbelcher: '#475659',
  liberatorGold: '#d5c4aa',
  longbeardGrey: '#b4aeae',
  lorenForest: '#51702d',
  lothernBlue: '#33a2cf',
  luciusLilac: '#b69fcb',
  lugganathOrange: '#f89e86',
  lustrianUndergrowth: '#709811',
  macraggeBlue: '#0d407f',
  martianIroncrust: '#f5945d',
  martianIronearth: '#935442',
  mechanicusStandardGrey: '#3d4b4e',
  mephistonRed: '#991115',
  mootGreen: '#52b246',
  mournfangBrown: '#650a09',
  naggarothNight: '#3e3355',
  necronCompound: '#b1b5b8',
  nibletGreen: '#648b32',
  nighthauntGloom: '#798d96',
  nihilakhorOde: '#85b59d',
  nulnOil: '#151203',
  nurglesRot: '#9d8c30',
  nurglingGreen: '#849b63',
  ogrynCamo: '#9ea94b',
  pallidWychFlesh: '#cdcebe',
  pinkHorror: '#91305d',
  praxetiWhite: '#ffffff',
  rakarthFlesh: '#a29e92',
  reiklandFleshshade: '#a34529',
  relictorGold: '#e8c88d',
  retributorArmour: '#ceae65',
  rhinoxHide: '#493335',
  rottingFlesh: '#b8c39e',
  runefangSteel: '#c6cbd0',
  runelordBrass: '#bcafa0',
  russGrey: '#547588',
  ryzaRust: '#ce6426',
  screamerPink: '#7c1645',
  screamingBell: '#b3562b',
  screamingSkull: '#d4d3a3',
  seraphimSepia: '#bf793e',
  sigmarite: '#dac38d',
  skarsnikGreen: '#5f936f',
  skavenblightDinge: '#48413b',
  skinkBlue: '#59c1ce',
  skragBrown: '#904a0f',
  skullcrusherBrass: '#e9c58b',
  slaaneshGrey: '#8e8c97',
  sotekGreen: '#0c6a74',
  soulstoneBlue: '#294c86',
  spiritstoneRed: '#fd5d3d',
  squigOrange: '#a94f44',
  steelLegionDrab: '#5f5134',
  stirlandBattlemire: '#321905',
  stirlandMud: '#473300',
  stegadonScaleGreen: '#074864',
  stormfang: '#7188aa',
  stormhostSilver: '#d1d2d4',
  stormverminFur: '#736c66',
  strakenGreen: '#628026',
  sybariteGreen: '#30a66c',
  sycoraxBronze: '#cbb394',
  sylvanethBark: '#5a5140',
  tallarnSand: '#a67610',
  tauLightOchre: '#bf6e1d',
  teclisBlue: '#317fc1',
  templeGuardBlue: '#329b8d',
  terminatusStone: '#bdaa9b',
  thousandSonsBlue: '#18abcc',
  thunderhawkBlue: '#417175',
  trollSlayerOrange: '#f46c2e',
  tuskgorFur: '#883736',
  typhusCorrosion: '#453f31',
  tyrantSkull: '#c6af8b',
  ulthuanGrey: '#c7e0da',
  underhiveAsh: '#bfbd80',
  ungorFlesh: '#d7a767',
  ushabtiBone: '#bcbc80',
  valhallanBlizzard: '#fdf9ee',
  verminlordHide: '#773a37',
  waaaghFlesh: '#20552b',
  warbossGreen: '#3e7f5d',
  warpfiendGrey: '#6c6a75',
  warplockBronze: '#695154',
  warpstoneGlow: '#1e7332',
  waystoneGreen: '#018675',
  waywatcherGreen: '#78b04b',
  wazdakkaRed: '#8c0a0c',
  whiteScar: '#ffffff',
  wildRiderRed: '#eb2e28',
  wrackWhite: '#dedad9',
  xereusPurple: '#471f5e',
  xv88: '#72481e',
  yrielYellow: '#ffdb01',
  zamesiDesert: '#dca026',
  zandriDust: '#9e915c',
};
import citadelColours from '../assets/classic_citadel_colors.json' with { type: 'json' };
console.log(citadelColours);
export const citadel = Object.entries(citadelColours).reduce((acc, [key, value]) => {
  acc[key] = generateAdaptiveScale(value);
  return acc;
}, {});
//do we need to convert hsl to hex?
console.log(citadel);
