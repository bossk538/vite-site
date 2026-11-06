const chromatic = [
  { step: 'C', alter: 0, octave: 4 },
  { step: 'C', alter: 1, octave: 4 },
  { step: 'D', alter: 0, octave: 4 },
  { step: 'D', alter: 1, octave: 4 },
  { step: 'E', alter: 0, octave: 4 },
  { step: 'F', alter: 0, octave: 4 },
  { step: 'F', alter: 1, octave: 4 },
  { step: 'G', alter: 0, octave: 4 },
  { step: 'G', alter: 1, octave: 4 },
  { step: 'A', alter: 0, octave: 4 },
  { step: 'A', alter: 1, octave: 4 },
  { step: 'B', alter: 0, octave: 4 },
];
const revNote = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};
function shuffle(array) {
  const result = [...array]; // copy so the original isn't changed
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0 ≤ j ≤ i
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const _nums = Array.from({ length: 12 }, (_, i) => i);

export class Row {
  constructor(init) {
    if (Array.isArray(init)) {
      this.row = init.map(pc => ({ pc, octave: 4 }));
    } else {
      const row = shuffle(_nums);
      this.row = row.map(i => ({ pc: i, octave: 4 }));
    }
  }
  clone() {
    const dataCopy = structuredClone(this);
    return Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      dataCopy
    );
  }
  static #toInt({ pc, octave }) {
    return pc + 12 * octave;
  }
  static #assign(item, p) {
    item.pc = p % 12;
    item.octave = Math.floor(p / 12);
  }
  transpose(interval) {
    for (let i = 0; i < 12; i++) {
      const p = Row.#toInt(this.row[i]) + interval;
      this.row[i] = { pc: p % 12, octave: Math.floor(p / 12) }
    }
  }
  multiply(factor) {
    for (const item of this.row) {
      item.pc = (factor * item.pc) % 12;
    }
  }
  invert() {
    let p0 = null;
    for (const item of this.row) {
      if (p0 === null) {
        p0 = Row.#toInt(item);
      } else {
        const p = 2 * p0 - Row.#toInt(item);
        Row.#assign(item, p);
      }
    }
  }
  reverse() {
    this.row.reverse();
  }
  pitches() {
    return this.row.map(({ pc, octave }) => ({ step: chromatic[pc].step, alter: chromatic[pc].alter, octave }));
  }
  static #pitchXml({ pc, octave}) {
    return `<pitch><step>${chromatic[pc].step}</step><alter>${chromatic[pc].alter}</alter><octave>${octave}</octave></pitch>`;
  }
  static pitchXml({ step, alter, octave}) {
    return `<pitch><step>${step}</step><alter>${alter}</alter><octave>${octave}</octave></pitch>`;
  }
  static pitchNumber({ step, alter, octave}) {
    return revNote[step] + (alter ?? 0) + 12 * octave;
  }
  pitchesXml() {
    return this.row.map(Row.#pitchXml);
  }
  compose(row) {
    const newRow = [];
    for (let i = 0; i < 12; i++) {
      const mapped = row[this.row[i].pc];
      newRow.push({ ...mapped });
    }
    this.row = newRow;
  }
  contour(strategy, options) {
    if (strategy === 'closest') { // also can be a threshold so 5ths and 4ths are preserved, etc.
      for (let i = 1; i < 12; i++) {
        const pc0 = Row.#toInt(this.row[i - 1]);
        const pc1 = Row.#toInt(this.row[i]);
        if (Math.abs(pc0 - pc1) > 6) {
          // need to adjust octave
        }
      }
    } else if (strategy === 'invert') {
    } else if (strategy === 'clamp') {
    }
  }
}
