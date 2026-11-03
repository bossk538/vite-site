import React, { useState } from 'react';
import { elements, MusicXML } from '@stringsync/musicxml';

export default function MusicXmlGenerator() {
  const [xmlOutput, setXmlOutput] = useState('');

  const generateScore = () => {
    // 1. Initialize the root layout
    const musicXml = MusicXML.createPartwise();
    const root = musicXml.getRoot();

    // 2. Define the Part List (Metadata)
    root.setPartList(
      new elements.PartList({
        contents: [
          new elements.ScorePart({
            attributes: { id: 'P1' },
            contents: [
              new elements.PartName({ contents: ['React Synth Line'] })
            ]
          })
        ]
      })
    );

    // 3. Set up the first Measure with Attributes (Clef, Key, Time)
    const measure = new elements.MeasurePartwise({ attributes: { number: '1' } });

    const scoreAttributes = new elements.Attributes({
      contents: [
        new elements.Divisions({ contents: ['1'] }), // 1 division per quarter note
        new elements.Key({
          contents: [
            new elements.Fifths({ contents: ['0'] }) // C Major
          ]
        }),
        new elements.Time({
          contents: [
            new elements.Beats({ contents: ['4'] }),
            new elements.BeatType({ contents: ['4'] })
          ]
        }),
        new elements.Clef({
          contents: [
            new elements.Sign({ contents: ['G'] }), // Treble Clef
            new elements.Line({ contents: ['2'] })
          ]
        })
      ]
    });

    measure.setValues([scoreAttributes]);

    // 4. Create a Middle C Note (Quarter Note)
    const note = new elements.Note({
        contents: [
        // 1. Structural Pitch Elements
        new elements.Pitch({
          contents: [
            new elements.Step({ contents: ['C'] }),
            new elements.Octave({ contents: ['4'] })
          ]
        }),
        // 2. Timing/Duration Elements
        new elements.Duration({ contents: ['1'] }),
        // 3. Visual Type Element (<type>quarter</type>)
        new elements.Type({ contents: ['quarter'] })
      ]
    });

    // Append note data array safely into the measure values
    measure.setValues([...measure.getValues(), note]);

    // 5. Connect measure to part, and part to root
    const part = new elements.PartPartwise({ attributes: { id: 'P1' } });
    part.setMeasures([measure]);
    root.setParts([part]);

    // 6. Serialize output and update React State
    setXmlOutput(musicXml.serialize());
  };

  const handleDownload = () => {
    const blob = new Blob([xmlOutput], { type: 'application/vnd.recordare.musicxml+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'score.musicxml';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>MusicXML Sheet Generator</h2>

      <button
        onClick={generateScore}
        style={{ padding: '10px 16px', marginRight: '10px', cursor: 'pointer' }}
      >
        Build MusicXML String
      </button>

      {xmlOutput && (
        <button
          onClick={handleDownload}
          style={{ padding: '10px 16px', cursor: 'pointer', background: '#0070f3', color: '#fff', border: 'none' }}
        >
          Download .musicxml File
        </button>
      )}

      {xmlOutput && (
        <div style={{ marginTop: '20px' }}>
          <h3>Generated Output Preview:</h3>
          <pre style={{ background: '#f4f4f4', padding: '15px', overflowX: 'auto', borderRadius: '5px', maxHeight: '400px' }}>
            {xmlOutput}
          </pre>
        </div>
      )}
    </div>
  );
}

