// FROZEN - framework/schema setup. Both dev branches add page content inside the
// existing routes below, but shouldn't need to edit this file itself.
import { Navigate, Route, Routes } from 'react-router-dom';
import { VideoChooser } from './pages/VideoChooser.jsx';
import { VideoPreview } from './pages/VideoPreview.jsx';
import { TrailReplay } from './pages/TrailReplay.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/videos" replace />} />
      <Route path="/videos" element={<VideoChooser />} />
      <Route path="/preview/:filename" element={<VideoPreview />} />
      <Route path="/replay/:filename/:jobId" element={<TrailReplay />} />
    </Routes>
  );
}
