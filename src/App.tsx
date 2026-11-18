import React from 'react';
import { PulseProvider } from './context/PulseContext';
import { AppShell } from './components/AppShell';

export const App: React.FC = () => {
  return (
    <PulseProvider>
      <AppShell />
    </PulseProvider>
  );
};

export default App;

