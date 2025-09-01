import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { startMSW } from './mocks';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Start MSW in development mode or when explicitly enabled via Vite env flag
const enableMSW = process.env.NODE_ENV === 'development' || (import.meta && import.meta.env && import.meta.env.VITE_ENABLE_MSW === 'true');
if (enableMSW) {
  startMSW().then(() => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
