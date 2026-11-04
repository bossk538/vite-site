import { elements, MusicXML } from '@stringsync/musicxml';


  const bars = [
    [
        [ 0, 1, "quarter" ],
        [ 1, 1, "quarter" ],
        [ 2, 1, "quarter" ],
        [ 3, 1, "quarter" ]
    ],
    [
        [ 4, 1, "quarter" ],
        [ 5, 1, "quarter" ],
        [ 6, 1, "quarter" ],
        [ 7, 1, "quarter" ]
    ],
    [
        [ 8, 1, "quarter" ],
        [ 9, 1, "quarter" ],
        [ 10, 1, "quarter" ],
        [ 11, 1, "quarter" ]
    ],
    [
        [ 12, 1, "quarter" ],
        [ 13, 1, "quarter" ],
        [ 14, 1, "quarter" ],
        [ 13, 1, "quarter" ]
    ],
    [
        [ 12, 1, "quarter" ],
        [ 11, 1, "quarter" ],
        [ 10, 1, "quarter" ],
        [ 9, 1, "quarter" ]
    ],
    [
        [ 8, 1, "quarter" ],
        [ 7, 1, "quarter" ],
        [ 6, 1, "quarter" ],
        [ 5, 1, "quarter" ]
    ],
    [
        [ 4, 1, "quarter" ],
        [ 3, 1, "quarter" ],
        [ 2, 1, "quarter" ],
        [ 1, 1, "quarter" ]
    ],
    [
        [ 0, 4, "whole" ]
    ]
  ];

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
//  const degrees = [];
//  for (let d = 0; d < 14; d++) degrees.push(d);
//  for (let d = 14; d > 0; d--) degrees.push(d);

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
//  const bars = [];
//  for (let i = 0; i < degrees.length; i += 4) {
//    bars.push(degrees.slice(i, i + 4).map((d) => [d, 1, 'quarter']));
//  }
//  bars.push([[0, 4, 'whole']]);

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
