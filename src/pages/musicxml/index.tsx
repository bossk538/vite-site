import React, { useState } from 'react';
import { buildEMajorScaleParallelOctaves, buildEflat, foo } from './utils';

export default function MusicXmlGenerator() {
  const [xmlOutput, setXmlOutput] = useState('');
  const [score, setScore] = useState('EMaj');

  const generateScore = () => {
    switch (score) {
      case 'EMaj':
        setXmlOutput(buildEMajorScaleParallelOctaves());
        break;
      case 'EflatMaj':
        setXmlOutput(buildEflat());
        break;
      case 'foo':
        setXmlOutput(foo());
        break;
      default:
        throw new Error(`Unknown type ${score}`);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([xmlOutput], { type: 'application/vnd.recordare.musicxml+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${score}.musicxml`;
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
      <select value={score} onChange={e => setScore(e.target.value)}>
        <option value="EMaj">E Major Scale</option>
        <option value="EflatMaj">E flat Major Scale</option>
      </select>

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

