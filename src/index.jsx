import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { startMSW } from './mocks';

const root = ReactDOM.createRoot(document.getElementById('root'));

const renderApp = () => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Start MSW in development mode (Vite: import.meta.env.DEV) or when explicitly enabled via env flag
const enableMSW = (import.meta && import.meta.env && import.meta.env.DEV) || (import.meta && import.meta.env && import.meta.env.VITE_ENABLE_MSW === 'true');
if (enableMSW) {
  // Render the app even if MSW takes too long or fails to register in prod.
  const timeout = new Promise((resolve) => setTimeout(resolve, 1500));
  Promise.race([startMSW(), timeout]).finally(renderApp);
} else {
  renderApp();
}
