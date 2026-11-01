import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/common/ErrorBoundary.tsx';
import './index.css';
import { registerAssetCache } from './lib/assetCache';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Service worker installs after the app is usable; it never delays first paint.
registerAssetCache();
