import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

interface Song {
  id: string;
  name: string;
  artist: string;
  uri: string;
}

interface Setlist {
  id: string;
  name: string;
  date: string;
  songs: Song[];
  currentSongIndex: number | null;
  isLive: boolean;
}

const LiveShow = () => {
  const { showId } = useParams<{ showId: string }>();
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real app, this would fetch from your backend
  useEffect(() => {
    // Mock data for now
    const mockSetlist: Setlist = {
      id: showId || '',
      name: 'Sample Show',
      date: new Date().toISOString().split('T')[0],
      songs: [
        { id: '1', name: 'Song 1', artist: 'Artist 1', uri: 'spotify:track:1' },
        { id: '2', name: 'Song 2', artist: 'Artist 2', uri: 'spotify:track:2' },
        { id: '3', name: 'Song 3', artist: 'Artist 3', uri: 'spotify:track:3' },
      ],
      currentSongIndex: 1,
      isLive: true,
    };
    setSetlist(mockSetlist);
  }, [showId]);

  const handleLikeSong = async (song: Song) => {
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/tracks`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: [song.id],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save song');
      }
    } catch (err) {
      setError('Failed to save song to your Liked Songs');
      console.error('Save error:', err);
    }
  };

  const handleAddToPlaylist = async (song: Song) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get user's playlists
      const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`,
        },
      });

      if (!playlistsResponse.ok) {
        throw new Error('Failed to fetch playlists');
      }

      const playlistsData = await playlistsResponse.json();
      
      // For simplicity, we'll add to the first playlist
      // In a real app, you'd show a playlist selector dialog
      if (playlistsData.items.length > 0) {
        const playlist = playlistsData.items[0];
        
        const addResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: [song.uri],
          }),
        });

        if (!addResponse.ok) {
          throw new Error('Failed to add to playlist');
        }
      }
    } catch (err) {
      setError('Failed to add song to playlist');
      console.error('Playlist error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!setlist) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {setlist.name}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {setlist.date}
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Paper>
        <List>
          {setlist.songs.map((song, index) => (
            <ListItem
              key={song.id}
              sx={{
                bgcolor: setlist.currentSongIndex === index ? 'primary.main' : 'inherit',
              }}
            >
              <ListItemText
                primary={song.name}
                secondary={song.artist}
              />
              {setlist.currentSongIndex === index && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    color="inherit"
                    onClick={() => handleLikeSong(song)}
                    disabled={isLoading}
                  >
                    <FavoriteIcon />
                  </IconButton>
                  <IconButton
                    color="inherit"
                    onClick={() => handleAddToPlaylist(song)}
                    disabled={isLoading}
                  >
                    <PlaylistAddIcon />
                  </IconButton>
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default LiveShow; 