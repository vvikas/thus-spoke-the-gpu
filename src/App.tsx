import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Hub from './pages/Hub';
import LevelRouter from './pages/LevelRouter';
import FinalUnlock from './pages/FinalUnlock';
import GPTSource from './pages/GPTSource';
import GPTPlayground from './components/GPTPlayground';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/level/:id" element={<LevelRouter />} />
        <Route path="/final" element={<FinalUnlock />} />
        <Route path="/gpt-source" element={<GPTSource />} />
        <Route path="/playground" element={<GPTPlayground onBack={() => window.history.back()} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
