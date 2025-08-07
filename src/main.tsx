import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from "next-themes";
import App from './App.tsx';
import './index.css';

// Set document title to reflect new branding
document.title = 'Kerigma Hub - Plataforma de Gestão Eclesiástica';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <App />
    </ThemeProvider>
  </StrictMode>
);
