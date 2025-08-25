import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { startMSW } from './mocks';

// Start MSW in development mode
if (process.env.NODE_ENV === 'development') {
  startMSW();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
