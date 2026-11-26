// Top-level route table. "/" redirects to the Video Chooser, and each page owns
// its own data loading, so this file only maps URLs to page components. The
// navigation bar sits above every route.
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppNav } from './components/nav/AppNav.jsx';
import { HelpPage } from './pages/HelpPage.jsx';
import { JobsPage } from './pages/JobsPage.jsx';
import { MetadataPage } from './pages/MetadataPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { SignInPage } from './pages/SignInPage.jsx';
import { VideoChooser } from './pages/VideoChooser.jsx';
import { VideoPreview } from './pages/VideoPreview.jsx';

export default function App() {
  return (
    <>
      <AppNav />
      <Routes>
        <Route path="/" element={<Navigate to="/videos" replace />} />
        <Route path="/videos" element={<VideoChooser />} />
        <Route path="/preview/:filename" element={<VideoPreview />} />
        <Route path="/metadata/:filename?" element={<MetadataPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
      </Routes>
    </>
  );
}
