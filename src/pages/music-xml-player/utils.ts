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
const n = [
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
const nt = {
  1: 'whole',
  2: 'half',
  4: 'quarter',
  8: 'eighth',
  16: '16th',
  32: '32nd',
  64: '64th',
}
const _notes = (row, part, measure, program) => {
  const out = [];
  const pitches = row.pitches();
  for (const t of program) {
    if (t === 'm5') {
      row.multiply(5);
    } else if (t === 'm7') {
      row.multiply(7);
    } else if (t === 'i') {
      row.invert();
    } else if (t === 'r') {
      row.reverse();
    } else if (/-?\d+/.test(t)) {
      row.transpose(Number(t));
    }  
  }
  for (let i = 0; i < pitches.length; i++) {
    const pitch = pitches[i];
    const pitchNum = Row.pitchNumber(pitch);
    const type = n[i];
    out.push(`<note>`);
    out.push(...Row.pitchXml(pitch));
    out.push(`<duration>${type.dur}</duration>`);
    out.push(`<voice>1</voice>`);
    out.push(`<type>${nt[type.type]}</type>`);
    for (let d = 0; d < type.dots; d++) {
      out.push(`<dot />`);
    }
 //   out.push(`<stem>${pitchNum > 62 ? 'down' : 'up' }</stem>`);
    out.push(`<staff>1</staff>`);
    out.push(`</note>`);
  }
  return out;
};
const _part = (row, part, program) => {
  const out = [];
  out.push(`<part id="${ids[part]}">`);
  for (let measure = 1; measure <= 12; measure++) {
    out.push(`<measure number="${measure}">`);
    out.push(..._notes(row, part, measure, program));
    out.push(`</measure>`);
  }
  out.push(`</part>`);
  return out;
};

export const foo = (row, text) => {
  const program = text.split(' ');
  const out = [];
  out.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  out.push(`<score-partwise version="4.0">`);
  out.push(..._work('Untitled'));
  out.push(..._partList(partList));
  for (const part of partList) {
    out.push(..._part(row, part, program));
  }
  out.push(`</score-partwise>`);
  return out.join('');
};
