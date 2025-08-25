import React from "react";

import "primereact/resources/themes/lara-light-teal/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primeflex/primeflex.css"; // utility classes

import { registerLicense } from "@syncfusion/ej2-base";

import { createRoot } from 'react-dom/client';
import "./index.css";
import "./components/prime-react-styles.css"; // Estilos globais para componentes PrimeReact


import App from "./App";

// Registering Syncfusion license key
registerLicense(
  "ORg4AjUWIQA/Gnt2UVhiQlZPd11dXmJWd1p/THNYflR1fV9DaUwxOX1dQl9nSXxRdERgWXled3BdTmY="
);
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