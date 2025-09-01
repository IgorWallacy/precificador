import React from "react";

import "primereact/resources/themes/lara-light-teal/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primeflex/primeflex.css"; // utility classes



import { createRoot } from 'react-dom/client';
import "./index.css";
import "./components/prime-react-styles.css"; // Estilos globais para componentes PrimeReact


import App from "./App";
import registerServiceWorker from './registerServiceWorker';


const root = document.getElementById('root');

// Use createRoot to render your top-level component
const rootElement = createRoot(root);
rootElement.render(<App />);

// Marca o body como carregado para esconder o preloader
if (typeof document !== 'undefined') {
  // Em caso de renderização assíncrona, garante que rode no próximo tick
  setTimeout(() => {
    document.body.classList.add('app-loaded');
  }, 0);
}

// Silenciar avisos de defaultProps em componentes memoizados de libs de terceiros durante desenvolvimento
if (process.env.NODE_ENV === 'development' && typeof console !== 'undefined') {
  const originalWarn = console.warn?.bind(console);
  console.warn = (...args) => {
    const msg = args?.[0];
    if (
      typeof msg === 'string' &&
      msg.includes('Support for defaultProps will be removed from memo components')
    ) {
      return; // ignora aviso ruidoso de libs externas
    }
    originalWarn && originalWarn(...args);
  };
}

// Registrar Service Worker (produção): habilita instalação PWA e offline
if (process.env.NODE_ENV === 'production') {
  try { registerServiceWorker(); } catch (_) {}
}