import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Nav from './components/Nav';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import MemoryPage from './pages/MemoryPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('page-enter');
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      setTransitionStage('page-exit');
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('page-enter');
        prevPathRef.current = location.pathname;
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [location]);

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
        <div className={transitionStage}>
          <Routes location={displayLocation}>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/memory" element={<MemoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
