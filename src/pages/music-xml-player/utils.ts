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
function shuffle(array) {
  const result = [...array]; // copy so the original isn't changed
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0 ≤ j ≤ i
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
const _nums = Array.from({ length: 12 }, (_, i) => i);

class Row {
  constructor(init) {
    if (Array.isArray(init)) {
      this.row = init.map(pc => ({ pc, octave: 4 }));
    } else {
      const row = shuffle(_nums);
      this.row = row.map(i => ({ pc: i, octave: 4 }));
    }
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
  pitchesXml() {
    return this.row.map(({ pc, octave }) => `<pitch><step>${chromatic[pc].step}</step><alter>${chromatic[pc].alter}</alter><octave>${octave}</octave></pitch>`);
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
const _work = (title) => {
  const out = [];
  out.push(`<work>`);
  out.push(`<work-title>`);
  out.push(title);
  out.push(`</work-title>`);
  out.push(`</work>`);
  return out;
};
const _partList = (parts, meausre) => {
  const out = [];
  out.push(`<part-list>`);
  for (const part of parts) {
    out.push(`<score-part id="${ids[part]}">`);
    out.push(part);
    out.push(`</score-part>`);
  }
  out.push(`</part-list>`);
  return out;
};
const partList = ['Violin 1'];
const partList_ = ['Violin 1', 'Violin 2', 'Viola', 'Cello'];
const ids = {
  'Violin 1': 'P1',
  'Violin 2': 'P2',
  'Viola': 'P3',
  'Cello': 'P4'
};
const measures = Array.from({ length: 10 });
let _row = new Row();
const _notes = (part, measure) => {
  const out = [];
  const pitches = _row.pitchesXml();
  _row.transpose(1);
  _row.invert();
  for (const pitch of pitches) {
    out.push(`<note>`);
    out.push(...pitch);
    out.push(`<duration>1</duration>`);
    out.push(`<voice>1</voice>`);
    out.push(`<type>quarter</type>`);
    out.push(`<stem>up</stem>`);
    out.push(`<staff>1</staff>`);
    out.push(`</note>`);
  }
  return out;
};
const _part = (part) => {
  const out = [];
  out.push(`<part id="${ids[part]}">`);
  for (let measure = 1; measure < 12; measure++) {
    out.push(`<measure number="${measure}">`);
    out.push(..._notes(part, measure));
    out.push(`</measure>`);
  }
  out.push(`</part>`);
  return out;
};

export const foo = () => {
  const out = [];
  out.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  out.push(`<score-partwise version="4.0">`);
  out.push(..._work('I am a title'));
  out.push(..._partList(partList));
  for (const part of partList) {
    out.push(..._part(part));
  }
  out.push(`</score-partwise>`);
  return out.join('');
};
