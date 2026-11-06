import { Row } from './row';

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
const notes = [
  'eighth',
  'eighth',
  'quarter',
  'quarter',
  'eighth',
  'eighth',
  'quarter',
  'quarter',
  'eighth',
  'eighth',
  'quarter',
  'quarter',
];
const measures = Array.from({ length: 10 });
const _notes = (row, part, measure) => {
  const out = [];
  const pitches = row.pitches();
  row.transpose(1);
  row.invert();
  for (let i = 0; i < pitches.length; i++) {
    const pitch = pitches[i];
    const pitchNum = Row.pitchNumber(pitch);
    const type = notes[i];
    out.push(`<note>`);
    out.push(...Row.pitchXml(pitch));
    out.push(`<duration>${type === 'quarter' ? 2 : 1}</duration>`);
    out.push(`<voice>1</voice>`);
    out.push(`<type>${type}</type>`);
    out.push(`<stem>${pitchNum > 52 ? 'down' : 'up' }</stem>`);
    out.push(`<staff>1</staff>`);
    out.push(`</note>`);
  }
  return out;
};
const _part = (row, part) => {
  const out = [];
  out.push(`<part id="${ids[part]}">`);
  for (let measure = 1; measure < 12; measure++) {
    out.push(`<measure number="${measure}">`);
    out.push(..._notes(row, part, measure));
    out.push(`</measure>`);
  }
  out.push(`</part>`);
  return out;
};

export const foo = (row) => {
  const out = [];
  out.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  out.push(`<score-partwise version="4.0">`);
  out.push(..._work('I am a title'));
  out.push(..._partList(partList));
  for (const part of partList) {
    out.push(..._part(row, part));
  }
  out.push(`</score-partwise>`);
  return out.join('');
};
