import automata from './automata';

export type HexColor = `#${string}`;
export type HSLColor = `hsl(${string})`;
export type RGBColor = `rgb(${string})`;
export type RGBArray = [r: number, g: number, b: number];
export type Grid = number[][] | null;
export type NeighborhoodTopology = 'Moore' | 'von Neumann' | 'circular';
export type AutomataKey = keyof automata;
export type Worker2Params = {
  action: 'clusterColors';
  frame: any;
  colorMap: HexColor[];
}
