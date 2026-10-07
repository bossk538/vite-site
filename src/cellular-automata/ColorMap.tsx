import React, { useState } from 'react';
import './style.css';

export const ColorMap = ({ colorMap, dispatch }) => {
  const [draft, setDraft] = useState([...colorMap]);
  const handleColorChange = (e, idx) => {
    const newColorMap = [...draft];
    newColorMap[idx] = e.target.value;
    setDraft(newColorMap);
  };

  const handleUpdate = () => {
    dispatch({ type: 'colorMap', payload: draft });
  };

  return (<div className="color-map">
    { draft.map((color, idx) => (<input key={idx} type="color" value={color} onChange={e => handleColorChange(e, idx)} />)) }
    <button type="button" onClick={handleUpdate}>Update</button>
  </div>);
};
