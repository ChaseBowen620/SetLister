import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

interface SpotifyUser {
  display_name: string;
  images: { url: string }[];
}

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<SpotifyUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('spotify_access_token');
      if (!token) return;

      try {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    fetchUser();
  }, []);

  const handleSpotifyLogin = () => {
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${import.meta.env.VITE_SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(import.meta.env.VITE_SPOTIFY_REDIRECT_URI)}&scope=playlist-modify-public playlist-modify-private user-read-private user-read-email user-library-modify`;
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit" onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <HomeIcon />
        </Button>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          SetLister
        </Typography>
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>{user.display_name}</Typography>
            <Avatar
              src={user.images?.[0]?.url}
              alt={user.display_name}
            />
          </Box>
        ) : (
          <Button 
            color="inherit" 
            onClick={handleSpotifyLogin}
            sx={{ backgroundColor: '#1DB954' }}
          >
            Connect Spotify
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 