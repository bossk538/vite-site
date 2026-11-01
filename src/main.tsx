import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TFE } from './2048/2048';
import { LGR } from './pages/liquid-glass';
import { CanvasApp } from './pages/canvas';
import { TicTacToe2 } from './pages/tic-tac-toe2';
import Asteroids from './pages/asteroids';
import SoundGenerator from './pages/sound-generator';
import CellularAutomata from './pages/cellular-automata';
import { SimulatePurchase } from './pages/banking-cc-app-purchase';
import { BrowserRouter, Routes, Route } from 'react-router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/2048" element={<TFE />} />
        <Route path="/canvas" element={<CanvasApp />} />
        <Route path="/liquid-glass" element={<LGR />} />
        <Route path="/tic-tac-toe2" element={<TicTacToe2 />} />
        <Route path="/banking-cc-app-purchase" element={<SimulatePurchase />} />
        <Route path="/asteroids" element={<Asteroids />} />
        <Route path="/cellular-automata" element={<CellularAutomata />} />
        <Route path="/sound-generator" element={<SoundGenerator />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
