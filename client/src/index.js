import React from 'react';
import ReactDOM from 'react-dom/client';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import './index.css';
import App from './App';
import { supabase } from './supabaseClient';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </React.StrictMode>
);