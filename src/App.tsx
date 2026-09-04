import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TierList from './pages/TierList';
import Players from './pages/Players';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import PlayerProfile from './pages/PlayerProfile';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tiers" element={<TierList />} />
          <Route path="/players" element={<Players />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/player/:username" element={<PlayerProfile />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
