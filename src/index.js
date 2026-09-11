import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { StreamProvider } from './context/StreamContext';
import { CreatorProvider } from './components/state/CreatorState';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <StreamProvider>
        <CreatorProvider>
          <App />
        </CreatorProvider>
      </StreamProvider>
    </AuthProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL}/sw.js`)
      .catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
  });
}