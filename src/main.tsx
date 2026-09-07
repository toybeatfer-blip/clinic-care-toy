import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { pullClinicsFromCloud } from './utils/cloudStorage';
import './index.css';

// Disparo inmediato de alta prioridad a la Bóveda Cloud antes de renderizar
pullClinicsFromCloud().catch(() => {});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
