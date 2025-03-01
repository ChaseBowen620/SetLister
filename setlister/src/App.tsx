import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BandDashboard from './pages/BandDashboard';
import LiveShow from './pages/LiveShow';
import SpotifyCallback from './pages/SpotifyCallback';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1DB954', // Spotify green
    },
    background: {
      default: '#121212',
      paper: '#282828',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/band" element={<BandDashboard />} />
          <Route path="/show/:showId" element={<LiveShow />} />
          <Route path="/callback/spotify" element={<SpotifyCallback />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
