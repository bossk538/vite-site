// GOES HERE

const aut1 = (it, nColors, orig, m) => {
  const counts = Array.from({ length: nColors }, () => 0);

  for (const i of it) {
    const [v] = i;
    counts[v]++;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]); // sort from largest to smallest
  return Number(sorted[m][0]); // 2nd most common value in neighborhood
};

const autB = (it, nColors, orig, m) => {
  let total = 0;
  let match = 0;
  let last;
  for (const i of it) {
    const [v] = i;
    total++;
    last = v;
    if (v === orig) {
      match++;
    }
  }
  if (match/total > .25 && match/total <.5) {
    return orig;
  } else {
    return last;
  }
};

const automata = {
  CGoL: {
    description: `Conway's Game of Life`,
    config: { w: 1, h: 1, nColors: 2, colorMap: ['rgb(255,255,255)', 'rgb(0,0,0)'] },
    impl: () => 0,
  },
  mc1: {
    description: 'Most common value',
    config: {},
    impl: (it, n, orig) => aut1(it, n, orig, 0),
  },
  mc2: {
    description: '2nd most common value',
    config: {},
    impl: (it, n, orig) => aut1(it, n, orig, 1),
  },

};

export default automata;
