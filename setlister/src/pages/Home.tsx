import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import GroupIcon from '@mui/icons-material/Group';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h2" component="h1" align="center" gutterBottom>
        SetLister
      </Typography>
      <Typography variant="h5" align="center" color="textSecondary" paragraph>
        Connect with live music in real-time. Save songs to your Spotify as they're being played.
      </Typography>

      <Box sx={{ mt: 6, display: 'flex', gap: 4, justifyContent: 'center' }}>
        <Paper
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 300,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          onClick={() => navigate('/band')}
        >
          <GroupIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" component="h2" gutterBottom>
            I'm a Band
          </Typography>
          <Typography align="center" color="textSecondary">
            Create and manage your setlist for live shows
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 300,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          onClick={() => navigate('/show/live')}
        >
          <MusicNoteIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" component="h2" gutterBottom>
            I'm a Listener
          </Typography>
          <Typography align="center" color="textSecondary">
            View the current setlist and save songs to your Spotify
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          How it Works
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', mt: 4 }}>
          <Paper sx={{ p: 3, flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              For Bands
            </Typography>
            <Typography>
              1. Create your setlist before the show<br />
              2. Search and add songs from Spotify<br />
              3. Start the show and control which song is playing<br />
              4. Share your show link with your audience
            </Typography>
          </Paper>
          <Paper sx={{ p: 3, flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              For Listeners
            </Typography>
            <Typography>
              1. Connect with your Spotify account<br />
              2. View the band's current setlist<br />
              3. Save songs to your Liked Songs<br />
              4. Add songs to your playlists instantly
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 