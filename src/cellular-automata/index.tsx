import React, { useState } from 'react';
import CanvasGrid from './CanvasGrid';


function CellularAutomata() {
  const [width, setWidth] = useState(1200);
  const [height, setHeigth] = useState(800);
  const [rows, setRows] = useState(80);
  const [columns, setColumns] = useState(120);
  const [nColors, setNColors] = useState(8);

  return (
    <div style={{ width: '99vw' }}> 
      <form>
        <ul style={{ listStyleType: 'none', textAlign: 'left' }}>
          <li>
            <label>Grid Width (pixels):<input value={width} onChange={e => setWidth(e.target.value)} /></label>
          </li>
          <li>
            <label>Grid Height (pixels):<input value={height} onChange={e => setHeight(e.target.value)} /></label>
          </li>
          <li>
            <label>Number of rows:<input value={rows} onChange={e => setRows(e.target.value)} /></label>
          </li>
          <li>
            <label>Number of columns:<input value={columns} onChange={e => setColumns(e.target.value)} /></label>
          </li>
          <li>
            <label>Number of values per cell:<input value={nColors} onChange={e => setNColors(e.target.value)} /></label>
          </li>
        </ul>
      </form>
      <div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <CanvasGrid width={width} height={height} rows={rows} columns={columns} nColors={nColors} />
      </div>
    </div>
  );
}

export default CellularAutomata;
