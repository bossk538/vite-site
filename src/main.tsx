import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Foo } from './Foo';
import { TFE } from './2048/2048';
import { BrowserRouter, Routes, Route } from 'react-router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/foo" element={<Foo />} />
        <Route path="/2048" element={<TFE />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
