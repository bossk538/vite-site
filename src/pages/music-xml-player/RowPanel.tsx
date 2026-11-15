import React, { useState } from 'react';
import { foo, noteLengths } from './utils';
import { Row, chton } from './Row';
import './style.css';
const NE = ({ len, handleNote, index, note }) => {
  const [type, setType] = useState(len.type)
  const [dots, setDots] = useState(len.dots);
  const [octave, setOctave] = useState(len.octave);
  const [hasRest, setHasRest] = useState(len.hasRest);
  const [restType, setRestType] = useState(len.restType);
  const [restDots, setRestDots] = useState(len.restDots);
  return (<div className="box">
      <h3>{index + 1}: {note}</h3>
      <label>
        Note type:
        <select value={type} onChange={e => setType(Number(e.target.value))}>
          { noteLengths.map(({ name }, idx) => (<option key={idx} value={idx}>{name}</option>)) }
        </select>
      </label>
      <label>
        Dots:
        <input type="number" value={dots} onChange={e => setDots(e.target.value)} />
      </label>
      <label>
        Octave:
        <input type="number" value={octave} onChange={e => setOctave(e.target.value)} />
      </label>
      <label>Initial rest:<input type="checkbox" value={hasRest} onChange={e => setHasRest(e.target.checked)} /></label>
      <label>
        Rest Note type:
        <select value={restType} onChange={e => setRestType(Number(e.target.value))}>
          { noteLengths.map(({ name }, idx) => (<option key={idx} value={idx}>{name}</option>)) }
        </select>
      </label>
      <label>
        Rest Dots:
        <input type="number" value={restDots} onChange={e => setRestDots(e.target.value)} />
      </label>

      <button type="button" onClick={() => handleNote({ octave, type, dots, hasRest, restType, restDots, index })}>Set</button>
    </div>);
};
export const RowPanel = ({ generate }) => {
  const [row, setRow] = useState(new Row([0,1,2,3,4,5,6,7,8,9,10,11]));
  const [row2d, setRow2d] = useState('');
  const [program, setProgram] = useState('');
  const [nmeasures, setNmeasures] = useState(12);
  const [lengths, setLengths] = useState(Array.from({ length: 12 }, (_, index) => ({
    octave: 4,
    type: 3,
    dots: 0,
    hasRest: false,
    restType: 4,
    restDots: 0,
    index,
  })));
  const handleGenerate = (e, lo) => {
    const row2 = createRow2(row);
    const xmlData = foo(row.clone(), program, row2, nmeasures, lo ?? lengths);
    generate(xmlData);
  };
  const handleRow2 = (e) => {
    setRow2d(e.target.value);
  };
  const createRow2 = (row) => {
    const row2 = row.clone();
    if (row2d) {
      // P, I, R, RI plus number
      const str = row2d.toUpperCase();
      const match = str.match(/^([A-Za-z]{1,2})(\d{0,2})$/);
      if (!match) throw new Error(`Invalid format: ${str}`);
      const [, letters, digits] = match;
      const transpose = Number(digits || '0');
      if (Number.isNaN(transpose)) throw new Error(`Invalid transpose`);

      switch (letters) {
        case 'P':
          break;
        case 'R':
          row2.reverse();
          break;
        case 'I':
          row2.invert();
          break;
        case 'RI':
          row2.invert();
          row2.reverse();
          break;
      }
      row2.transpose(transpose);
    }
    return row2;
  };

  const handleNote = ({ octave, type, dots, index, hasRest, restType, restDots }) => {
    const newLengths = [...lengths];
    newLengths[index] = { octave, type, dots, index, hasRest, restType, restDots };
    const newRow = row.clone();
    newRow.setOctave(index, octave);
    setRow(newRow);
    setLengths(newLengths);

    const row2 = createRow2(row);
    const xmlData = foo(row.clone(), program, row2, nmeasures, newLengths);
    generate(xmlData);
  };

  const handleNewRow = () => {
    const newRow = new Row();
    setRow(newRow);

    const row2 = createRow2(newRow);
    const xmlData = foo(newRow.clone(), program, row2, nmeasures, lengths);
    generate(xmlData);
  };

  return (<div className="RowPanel"><form>
    <ul>
      <li><h2>Create Row</h2></li>
      <li><p>some random text</p></li>
      <li><label>Row2:<input type="text" value={row2d} onChange={handleRow2} /></label></li>
      <li><label>Program:<input type="text" value={program} onChange={e => setProgram(e.target.value)} /></label></li>
      <li><button type="button" onClick={handleNewRow}>New Row</button></li>
      <li><button type="button" onClick={handleGenerate}>Generate</button></li>
      <li><label>N Measures:<input type="number" onChange={e => setNmeasures(e.target.value)} value={nmeasures} min={1} /></label></li>
      { lengths.map((len, i) => (<li key={i}><NE len={len} index={i} handleNote={handleNote} note={chton(row.row[i])} /></li>)) }
    </ul>
  </form></div>);
};
