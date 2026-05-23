import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Nav from './components/Nav';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import MemoryPage from './pages/MemoryPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  // Apply theme — default to dark, respect saved preference
  useEffect(() => {
    const saved = localStorage.getItem('echo_dark_mode');
    if (saved !== 'light') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div
      className="min-h-screen transition-colors duration-700"
      style={{ background: 'var(--color-surface)' }}
    >
      <Nav />
      <main className="pb-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/memory" element={<MemoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
