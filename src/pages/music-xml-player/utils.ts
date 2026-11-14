import { Row } from './Row';

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
    out.push(`
      <part-name>${part}</part-name>
      <score-instrument id="P1-I1">
        <instrument-name>Violin</instrument-name>
      </score-instrument>
      <midi-instrument id="P1-I1">
        <midi-channel>1</midi-channel>
        <midi-program>41</midi-program>
        <volume>100</volume>
      </midi-instrument>
    `);
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
const n0 = [
  { type: 4, dots: 1, dur: 30 },
  { type: 8, dots: 0, dur: 10 },
  { type: 8, dots: 0, dur: 10 },
  { type: 8, dots: 0, dur: 10 },
  { type: 4, dots: 1, dur: 30 },
  { type: 8, dots: 0, dur: 10 },
  { type: 8, dots: 0, dur: 10 },
  { type: 8, dots: 0, dur: 10 },
  { type: 4, dots: 1, dur: 30 },
  { type: 16, dots: 0, dur: 5 },
  { type: 16, dots: 0, dur: 5 },
  { type: 2, dots: 0, dur: 40 },
];
const n = [
  { type: 4, dots: 0, dur: 1 },
  { type: 4, dots: 0, dur: 1 },
  { type: 4, dots: 0, dur: 1 },
  { type: 4, dots: 0, dur: 1 },
  { type: 4, dots: 0, dur: 1 },
  { type: 4, dots: 0, dur: 1 },
  { type: 4, dots: 0, dur: 1 },
  { type: 4, dots: 0, dur: 1 },
  { type: 4, dots: 0, dur: 1 },
  { type: 4, dots: 0, dur: 1 },
  { type: 4, dots: 0, dur: 1 },
  { type: 2, dots: 1, dur: 3 },
];
const nt = {
  breve: 'breve',
  1: 'whole',
  2: 'half',
  4: 'quarter',
  8: 'eighth',
  16: '16th',
  32: '32nd',
  64: '64th',
}
export const noteLengths = [
  { type: 'breve', name: 'breve',   dur: [128,192,224,240] },
  { type: 1,       name: 'whole',   dur: [64,96,112,120] },
  { type: 2,       name: 'half',    dur: [32,48,56,60] },
  { type: 4,       name: 'quarter', dur: [16, 24,28,30] },
  { type: 8,       name: 'eighth',  dur: [8,12,14,15] },
  { type: 16,      name: '16th',    dur: [4,6,7] },
  { type: 32,      name: '32nd',    dur: [2,3] },
  { type: 64,      name: '64th',    dur: [1] },
];
const nn = [
  { type: 'breve', dots: 0, dur: 128 },
  { type: 'breve', dots: 1, dur: 192 },
  { type: 1, dots: 0, dur: 64 },
  { type: 1, dots: 1, dur: 96 },
  { type: 2, dots: 0, dur: 32 },
  { type: 2, dots: 1, dur: 48 },
  { type: 4, dots: 0, dur: 16 },
  { type: 4, dots: 1, dur: 24 },
  { type: 8, dots: 0, dur: 8 },
  { type: 8, dots: 1, dur: 12 },
  { type: 16, dots: 0, dur: 4 },
  { type: 16, dots: 1, dur: 6 },
  { type: 32, dots: 0, dur: 2 },
  { type: 32, dots: 1, dur: 3 },
  { type: 64, dots: 0, dur: 1 },
  { type: 64, dots: 1, dur: 1 },
];
const _notes = (row, part, measure, program, row2, lengths) => {
  const out = [];
  const pitches = row.pitches();
  for (const t of program) {
    //const match = t.match(/^([A-Za-z]{1,2})(\d{0,2})$/);
	  //if (!match) throw new Error('Invalid format');
    //const [, letters, digits] = match;
    if (t === 'm5') {
      row.multiply(5);
    } else if (t === 'm7') {
      row.multiply(7);
    } else if (t === 'i') {
      row.invert();
    } else if (t === 'r') {
      row.reverse();
    } else if (t === 'c') {
      row.compose(row2);
    } else if (/^-?\d+$/.test(t)) {
      row.transpose(Number(t));
    }  
  }
  for (let i = 0; i < pitches.length; i++) {
    const pitch = pitches[i];
    const pitchNum = Row.pitchNumber(pitch);
    const cfg = lengths[i];
    const type = noteLengths[cfg.type];
    const dur = type.dur[cfg.dots];

    if (cfg.hasRest) {
      const restType = noteLengths[cfg.restType];
      const restDur = restType.dur[cfg.restDots];
      out.push(`<note>`);
      out.push(`<rest />`);
      out.push(`<duration>${restDur}</duration>`);
      out.push(`<type>${restType.name}</type>`);
      for (let d = 0; d < cfg.restDots; d++) {
        out.push(`<dot />`);
      }
      out.push(`</note>`);
    }

    out.push(`<note>`);
    out.push(...Row.pitchXml(pitch));
    out.push(`<duration>${dur}</duration>`);
    out.push(`<voice>1</voice>`);
    out.push(`<type>${type.name}</type>`);
    for (let d = 0; d < cfg.dots; d++) {
      out.push(`<dot />`);
    }
    out.push(`<staff>1</staff>`);
    out.push(`</note>`);
  }
  return out;
};
const _part = (row, part, program, row2, nmeasures, lengths) => {
  const out = [];
  out.push(`<part id="${ids[part]}">`);
  for (let measure = 1; measure <= nmeasures; measure++) {
    out.push(`<measure number="${measure}">`);
    out.push(..._notes(row, part, measure, program, row2, lengths));
    out.push(`</measure>`);
  }
  out.push(`</part>`);
  return out;
};

export const foo = (row, text, row2, nmeasures, lengths) => {
  const program = text.split(' ');
  const out = [];
  out.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  out.push(`<score-partwise version="4.0">`);
  out.push(..._work('Untitled'));
  out.push(..._partList(partList));
  for (const part of partList) {
    out.push(..._part(row, part, program, row2, nmeasures, lengths));
  }
  out.push(`</score-partwise>`);
  return out.join('');
};
