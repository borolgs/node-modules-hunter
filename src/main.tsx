import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import { useMocks } from './shared/api';

import './index.scss';

if (!(window as any).__TAURI__) {
  useMocks();
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
