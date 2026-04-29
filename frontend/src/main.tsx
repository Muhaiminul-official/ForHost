import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { registerSW } from 'virtual:pwa-register';

import App from './App.tsx';
import './index.css';

// Fallback to the client ID provided in chat
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "769930194448-3c995g1d2gv4qou7tfhrb5p1gg0vhgcp.apps.googleusercontent.com";

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
);
