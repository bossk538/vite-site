import { elements, MusicXML } from '@stringsync/musicxml';

const makePitch = ({ step, alter, octave }) => {
  const pitch = new elements.Pitch()
    .setStep(new elements.Step({ contents: [step] }))
    .setOctave(new elements.Octave({ contents: [octave] }));
  if (alter !== null) {
    pitch.setAlter(new elements.Alter({ contents: [alter] }));
  }
  return pitch;
};

/**
 * Builds a 2-octave E-major scale for piano in parallel octaves,
 * quarter notes, common time (4/4). The left hand starts on E3
 * (the E below middle C); the right hand doubles it an octave higher.
 * The scale goes up two octaves and back down, ending on a whole note.
 *
 * @returns {string} the MusicXML document as a string
 */
export function buildEMajorScaleParallelOctaves() {
  const DIVISIONS = 1; // 1 division = 1 quarter note
  const STEPS = ['E', 'F', 'G', 'A', 'B', 'C', 'D'];
  const SHARPED = new Set(['F', 'G', 'C', 'D']); // E major: F# C# G# D#

  // Scale degrees 0..14 = E3 .. E5 for the left hand.
  const pitchAt = (degree, startOctave) => {
    const step = STEPS[degree % 7];
    // Octave numbers change at C: E F G A B stay, C D move up.
    const octavesUp = Math.floor(degree / 7) + (degree % 7 >= 5 ? 1 : 0);
    return { step, alter: SHARPED.has(step) ? 1 : null, octave: startOctave + octavesUp };
  };

  // Up 14 notes (E3..D#5), down 14 notes (E5..F#3) = 7 bars of quarters,
  // then a final E3 whole note in bar 8.
  const degrees = [];
  for (let d = 0; d < 14; d++) degrees.push(d);
  for (let d = 14; d > 0; d--) degrees.push(d);

  const makeNote = ({ step, alter, octave }, duration, type, staff, voice, stem) => {
    const pitch = new elements.Pitch()
      .setStep(new elements.Step({ contents: [step] }))
      .setOctave(new elements.Octave({ contents: [octave] }));
    if (alter !== null) pitch.setAlter(new elements.Alter({ contents: [alter] }));

    return new elements.Note()
      .setVariation([null, pitch, new elements.Duration({ contents: [duration] }), []])
      .setVoice(new elements.Voice({ contents: [String(voice)] }))
      .setType(new elements.Type({ contents: [type] }))
      .setStem(new elements.Stem({ contents: [stem] }))
      .setStaff(new elements.Staff({ contents: [staff] }));
  };

  // Each bar is a list of [degree, duration, type].

  const measures = bars.map((bar, i) => {
    const values = [];

    if (i === 0) {
      values.push(
        new elements.Attributes()
          .setDivisions(new elements.Divisions({ contents: [DIVISIONS] }))
          .setKeys([
            new elements.Key().setValue([
              null,
              new elements.Fifths({ contents: [4] }),
              new elements.Mode({ contents: ['major'] }),
            ]),
          ])
          .setTimes([
            new elements.Time({ attributes: { symbol: 'common' } }).setValue([
              [[new elements.Beats({ contents: ['4'] }), new elements.BeatType({ contents: ['4'] })]],
              null,
            ]),
          ])
          .setStaves(new elements.Staves({ contents: [2] }))
          .setClefs([
            new elements.Clef({ attributes: { number: 1 } })
              .setSign(new elements.Sign({ contents: ['G'] }))
              .setLine(new elements.Line({ contents: [2] })),
            new elements.Clef({ attributes: { number: 2 } })
              .setSign(new elements.Sign({ contents: ['F'] }))
              .setLine(new elements.Line({ contents: [4] })),
          ])
      );
    }

    // Right hand: staff 1, voice 1, one octave above the left hand (starts E4).
    let barDuration = 0;
    for (const [deg, dur, type] of bar) {
      values.push(makeNote(pitchAt(deg, 4), dur, type, 1, 1, 'up'));
      barDuration += dur;
    }

    // Rewind to the start of the bar for the left hand.
    values.push(new elements.Backup().setDuration(new elements.Duration({ contents: [barDuration] })));

    // Left hand: staff 2, voice 5, starting on E3.
    for (const [deg, dur, type] of bar) {
      values.push(makeNote(pitchAt(deg, 3), dur, type, 2, 5, 'down'));
    }

    if (i === bars.length - 1) {
      values.push(
        new elements.Barline({ attributes: { location: 'right' } }).setBarStyle(
          new elements.BarStyle({ contents: ['light-heavy'] })
        )
      );
    }

    return new elements.MeasurePartwise({ attributes: { number: String(i + 1) } }).setValues(values);
  });

  const musicXml = MusicXML.createPartwise();
  const root = musicXml.getRoot();

  root.setWork(
    new elements.Work().setWorkTitle(
      new elements.WorkTitle({ contents: ['E Major Scale – 2 Octaves, Parallel Octaves'] })
    )
  );

  root.setPartList(
    new elements.PartList().setScorePart(
      new elements.ScorePart({ attributes: { id: 'P1' } }).setPartName(
        new elements.PartName({ contents: ['Piano'] })
      )
    )
  );

  root.setParts([new elements.PartPartwise({ attributes: { id: 'P1' } }).setMeasures(measures)]);

  return musicXml.serialize();
}

export function buildEflat() {
  const DIVISIONS = 1; // 1 division = 1 quarter note
  const bars = [
    [
        [ 1, "quarter", 'E', 0, 4],
        [ 1, "quarter", 'F', 1, 4],
        [ 1, "quarter", 'G', 1, 4],
        [ 1, "quarter", 'A', 0, 4]
    ],
    [
        [ 1, "quarter", 'B', null, 4],
        [ 1, "quarter", 'C', 1, 5],
        [ 1, "quarter", 'D', 1, 5],
        [ 1, "quarter", 'E', null, 5]
    ],
    [
        [ 1, "quarter", 'F', 1, 5],
        [ 1, "quarter", 'G', 1, 5],
        [ 1, "quarter", 'A', null, 5],
        [ 1, "quarter", 'B', null, 5]
    ],
    [
        [ 1, "quarter", 'C', 1, 6],
        [ 1, "quarter", 'D', 1, 6],
        [ 1, "quarter", 'E', null, 6],
        [ 1, "quarter", 'D', 1, 6]
    ],
    [
        [ 1, "quarter", 'C', 1, 6],
        [ 1, "quarter", 'B', null, 5],
        [ 1, "quarter", 'A', null, 5],
        [ 1, "quarter", 'G', 1, 5]
    ],
    [
        [ 1, "quarter", 'F', 1, 5],
        [ 1, "quarter", 'E', null, 5],
        [ 1, "quarter", 'D', 1, 5],
        [ 1, "quarter", 'C', 1, 5]
    ],
    [
        [ 1, "quarter", 'B', null, 4],
        [ 1, "quarter", 'A', null, 4],
        [ 1, "quarter", 'G', 1, 4],
        [ 1, "quarter", 'F', 1, 4]
    ],
    [
        [ 4, "whole", 'E', null, 4]
    ]
  ];

  const makeNote = ({ step, alter, octave, duration, type, staff, voice, stem }) => {
    const pitch = makePitch({ step, alter, octave });

    return new elements.Note()
      .setVariation([null, pitch, new elements.Duration({ contents: [duration] }), []])
      .setVoice(new elements.Voice({ contents: [String(voice)] }))
      .setType(new elements.Type({ contents: [type] }))
      .setStem(new elements.Stem({ contents: [stem] }))
      .setStaff(new elements.Staff({ contents: [staff] }));
  };

  const measures = bars.map((bar, i) => {
    const values = [];
    if (i === 0) {
      values.push(
        new elements.Attributes()
          .setDivisions(new elements.Divisions({ contents: [DIVISIONS] }))
          .setKeys([
            new elements.Key().setValue([
              null,
              new elements.Fifths({ contents: [4] }),
              new elements.Mode({ contents: ['major'] }),
            ]),
          ])
          .setTimes([
            new elements.Time({ attributes: { symbol: 'common' } }).setValue([
              [[new elements.Beats({ contents: ['4'] }), new elements.BeatType({ contents: ['4'] })]],
              null,
            ]),
          ])
          .setStaves(new elements.Staves({ contents: [2] }))
          .setClefs([
            new elements.Clef({ attributes: { number: 1 } })
              .setSign(new elements.Sign({ contents: ['G'] }))
              .setLine(new elements.Line({ contents: [2] })),
            new elements.Clef({ attributes: { number: 2 } })
              .setSign(new elements.Sign({ contents: ['F'] }))
              .setLine(new elements.Line({ contents: [4] })),
          ])
      );
    }

    // Right hand: staff 1, voice 1, one octave above the left hand (starts E4).
    let barDuration = 0;
    for (const [duration, type, step, alter, octave] of bar) {
      values.push(makeNote({ step, alter, octave, duration, type, staff: 1, voice: 1, stem: 'up' }));
      barDuration += duration;
    }

    // Rewind to the start of the bar for the left hand.
    values.push(new elements.Backup().setDuration(new elements.Duration({ contents: [barDuration] })));

    // Left hand: staff 2, voice 5, starting on E3.
    for (const [duration, type, step, alter, octave] of bar) {
      values.push(makeNote({ step, alter, octave: octave - 2, duration, type, staff: 2, voice: 5, stem: 'down' }));
    }

    if (i === bars.length - 1) {
      values.push(
        new elements.Barline({ attributes: { location: 'right' } }).setBarStyle(
          new elements.BarStyle({ contents: ['light-heavy'] })
        )
      );
    }

    return new elements.MeasurePartwise({ attributes: { number: String(i + 1) } }).setValues(values);
  });

  const musicXml = MusicXML.createPartwise();
  const root = musicXml.getRoot();

  root.setWork(
    new elements.Work().setWorkTitle(
      new elements.WorkTitle({ contents: ['E Major Scale – 2 Octaves, Parallel Octaves'] })
    )
  );

  root.setPartList(
    new elements.PartList().setScorePart(
      new elements.ScorePart({ attributes: { id: 'P1' } }).setPartName(
        new elements.PartName({ contents: ['Piano'] })
      )
    )
  );

  root.setParts([new elements.PartPartwise({ attributes: { id: 'P1' } }).setMeasures(measures)]);

  return musicXml.serialize();
}

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
class Row {
  constructor(init) {
    if (Array.isArray(init)) {
      this.row = init.map(pc => ({ pc, octave: 4 }));
    } else {
      this.row = shuffle(Array.from({ length: 12 }, (_, i) => ({ pc: i, octave: 4 })));
    }
  }
  transpose(interval) {
    for (const item of this.row) {
      const p = item.pc + 12 * item.octave;
      item.pc = p % 12;
      item.octave = Math.floor(p / 12);
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
        p0 = item.pc + 12 * item.octave;
      } else {
        const p = 2 * p0 - (item.pc + 12 * item.octave);
        item.pc = p % 12;
        item.octave = Math.floor(p / 12);
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
}
const row = new Row();
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
const partList = ['Violin 1', 'Violin 2', 'Viola', 'Cello'];
const ids = {
  'Violin 1': 'P1',
  'Violin 2': 'P2',
  'Viola': 'P3',
  'Cello': 'P4'
};
const measures = Array.from({ length: 10 });
const _part = (part) => {
  const out = [];
  out.push(`<part id="${ids[part]}">`);
  out.push(`</part>`);
};

export const foo = () => {
  const out = [];
  out.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  out.push(`<score-timewise version="4.0">`);
  out.push(..._work('I am a title'));
  out.push(..._partList(partList));
  for (let measure = 1; meausre < 12; measure++) {
    out.push(`<measure number="${measure}">`);
    for (const part of parts) {
      out.push(..._part(part, measure));
    }
    out.push(`</measure>`);
  }
  out.push(`</score-timewise>`);
  return out.join('');
};
