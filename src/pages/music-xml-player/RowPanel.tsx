import React, { useState } from 'react';
import { foo } from './utils';
import { Row } from './Row';
import './style.css';

export const RowPanel = ({ generate }) => {
  const [row, setRow] = useState(new Row([0,1,2,3,4,5,6,7,8,9,10,11]));
  const [row2d, setRow2d] = useState('');
  const [program, setProgram] = useState('');
  const [nmeasures, setNmeasures] = useState(12);
  const handleGenerate = () => {
    const row2 = createRow2();
    const xmlData = foo(row.clone(), program, row2, nmeasures);
    generate(xmlData);
  };
  const handleRow2 = (e) => {
    setRow2d(e.target.value);
  };
  const createRow2 = () => {
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
  return (<div className="RowPanel"><form>
    <ul>
      <li><h2>Create Row</h2></li>
      <li><p>some random text</p></li>
      <li><label>Row2:<input type="text" value={row2d} onChange={handleRow2} /></label></li>
      <li><label>Program:<input type="text" value={program} onChange={e => setProgram(e.target.value)} /></label></li>
      <li><button type="button" onClick={() => setRow(new Row())}>New Row</button></li>
      <li><button type="button" onClick={handleGenerate}>Generate</button></li>
      <li><label>N Measures:<input type="number" onChange={e => setNmeasures(e.target.value)} value={nmeasures} min={1} /></label></li>
    </ul>
  </form></div>);
};
