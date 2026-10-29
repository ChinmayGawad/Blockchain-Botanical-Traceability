import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { setupTranslationDOMShim } from './lib/googleTranslateShim';
import { initDynamicTranslation } from './services/dynamicTranslateService';
import { installGlobalErrorHandlers } from './services/errorReporting';

// Initialize DOM safety shim and dynamic translation watcher before React mount
setupTranslationDOMShim();
initDynamicTranslation();

// Report uncaught errors and unhandled promise rejections
installGlobalErrorHandlers();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
