import React, { useState } from 'react';
import { foo } from './utils';
import { Row } from './Row';
import './style.css';

export const RowPanel = ({ generate }) => {
  const [row, setRow] = useState(new Row());
  const [row2, setRow2] = useState(row);
  const [row2d, setRow2d] = useState('');
  const [program, setProgram] = useState('');
  const handleGenerate = () => {
    const xmlData = foo(row.clone(), program, row2);
    generate(xmlData);
  };
  const handleRow2 = (e) => {
    const row2 = row.clone();
    // P, I, R, RI plus number
    const str = e.target.value.toUpperCase();
    const match = str.match(/^([A-Za-z]{1,2})(\d{0,2})$/);
    if (!match) throw new Error(`Invalid format: ${str}`);

    const [, letters, digits] = match;
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
    row2.transpose(digits);
    setRow2(row2);
    setRow2d(str);
  };
  return (<div className="RowPanel"><form>
    <ul>
      <li><h2>Create Row</h2></li>
      <li><p>some random text</p></li>
      <li><label>Program:<input type="text" value={row2d} onChange={handleRow2} /></label></li>
      <li><label>Row2 form:<input type="text" value={program} onChange={e => setProgram(e.target.value)} /></label></li>
      <li><button type="button" onClick={() => setRow(new Row())}>New Row</button></li>
      <li><button type="button" onClick={handleGenerate}>Generate</button></li>
    </ul>
  </form></div>);
};
