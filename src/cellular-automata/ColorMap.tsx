import React, { useState } from 'react';
import type { HexColor } from './types';
import './style.css';

export const ColorMap = ({ colorMap, handleUpdate }) => {
  const [draft, setDraft] = useState([...colorMap]);

  const handleColorChange = (e, idx) => {
    const newColorMap = [...draft];
    newColorMap[idx] = e.target.value;
    setDraft(newColorMap);
  };

  return (<div className="color-map">
    { draft.map((color, idx) => (<input key={idx} type="color" value={color} onChange={e => handleColorChange(e, idx)} />)) }
    <button type="button" onClick={() => handleUpdate(draft)}>Update</button>
  </div>);
};
