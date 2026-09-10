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