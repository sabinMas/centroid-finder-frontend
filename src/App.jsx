// Top-level route table. "/" redirects to the Video Chooser, and each page owns
// its own data loading, so this file only maps URLs to page components.
import { Navigate, Route, Routes } from 'react-router-dom';
import { VideoChooser } from './pages/VideoChooser.jsx';
import { VideoPreview } from './pages/VideoPreview.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/videos" replace />} />
      <Route path="/videos" element={<VideoChooser />} />
      <Route path="/preview/:filename" element={<VideoPreview />} />
    </Routes>
  );
}
