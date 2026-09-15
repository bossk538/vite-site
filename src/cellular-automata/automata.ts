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

const gol = (it, n, orig) => {
  let nLive = 0;
  let nDead = 0;
  for (const i of it) {
    const [value, row, col] = i;
    if (row === 0 && col === 0) {
      continue;
    }
    if (value === 0) {
      nDead++;
    } else {
      nLive++;
    }
  }
  if (orig === 1) {
    return nLive === 2 || nLive === 3 ? 1 : 0;
  } else {
    return nLive === 3 ? 1 : 0;
  }
};

const automata = {
  CGoL: {
    description: `Conway's Game of Life`,
    config: { w: 1, h: 1, nColors: 2, colorMap: ['#fff', '#000'] },
    impl: gol,
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
