import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import './index.css';
import { App } from './App';
import { ProgressProvider } from './lib/progress';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </BrowserRouter>,
);
