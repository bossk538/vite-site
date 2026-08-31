import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TFE } from './2048/2048';
import { LGR } from './liquid-glass';
import { CanvasApp } from './canvas';
import { SvgApp } from './svg';
import { TicTacToe2 } from './tic-tac-toe2';
import { CreditCardApp } from './banking-cc-app';
import { BrowserRouter, Routes, Route } from 'react-router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/2048" element={<TFE />} />
        <Route path="/canvas" element={<CanvasApp />} />
        <Route path="/svg" element={<SvgApp />} />
        <Route path="/liquid-glass" element={<LGR />} />
        <Route path="/tic-tac-toe2" element={<TicTacToe2 />} />
        <Route path="/banking-cc-app" element={<CreditCardApp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
