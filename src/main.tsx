import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { setupTranslationDOMShim } from './lib/googleTranslateShim';
import { initDynamicTranslation } from './services/dynamicTranslateService';

// Initialize DOM safety shim and dynamic translation watcher before React mount
setupTranslationDOMShim();
initDynamicTranslation();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
