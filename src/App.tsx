import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StudioLayout } from './components/layout/StudioLayout';
import { StudioProvider } from './context/StudioContext';
import { AnimateModePage } from './pages/AnimateModePage';
import { ImageModePage } from './pages/ImageModePage';
import { LiveModePage } from './pages/LiveModePage';
import { PaintModePage } from './pages/PaintModePage';
import { TextModePage } from './pages/TextModePage';
import { ThreeDModePage } from './pages/ThreeDModePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <StudioProvider>
        <Routes>
          <Route path="/" element={<StudioLayout />}>
            <Route index element={<Navigate to="/image" replace />} />
            <Route path="image" element={<ImageModePage />} />
            <Route path="text" element={<TextModePage />} />
            <Route path="animate" element={<AnimateModePage />} />
            <Route path="live" element={<LiveModePage />} />
            <Route path="paint" element={<PaintModePage />} />
            <Route path="3d" element={<ThreeDModePage />} />
            <Route path="*" element={<Navigate to="/image" replace />} />
          </Route>
        </Routes>
      </StudioProvider>
    </BrowserRouter>
  );
};

export default App;
