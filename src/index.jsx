import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { startMSW } from './mocks';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Start MSW in development mode and wait for it to be ready
if (process.env.NODE_ENV === 'development') {
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
