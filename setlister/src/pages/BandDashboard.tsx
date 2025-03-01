import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Modal,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Song {
  id: string;
  name: string;
  artist: string;
  uri: string;
}

interface Setlist {
  id: string;
  name: string;
  songs: Song[];
  currentSongIndex: number | null;
  isLive: boolean;
}

const MAX_SETLISTS = 30;
const MAX_SONGS_PER_SETLIST = 50;

const BandDashboard = () => {
  const [setlists, setSetlists] = useState<Setlist[]>(() => {
    // Load saved setlists from localStorage
    const saved = localStorage.getItem('savedSetlists');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSetlist, setCurrentSetlist] = useState<Setlist | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditNameDialogOpen, setIsEditNameDialogOpen] = useState(false);
  const [editingSetlist, setEditingSetlist] = useState<Setlist | null>(null);
  const [newSetlistName, setNewSetlistName] = useState('');
  const [isEditOverlayOpen, setIsEditOverlayOpen] = useState(false);

  // Save setlists to localStorage whenever they change
  const saveSetlists = (newSetlists: Setlist[]) => {
    localStorage.setItem('savedSetlists', JSON.stringify(newSetlists));
    setSetlists(newSetlists);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=5`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('spotify_access_token')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please reconnect your Spotify account');
        } else {
          throw new Error('Failed to search tracks');
        }
        return;
      }

      const data = await response.json();
      if (!data.tracks || !data.tracks.items || !data.tracks.items.length) {
        setSearchResults([]);
        setError('No songs found matching your search');
        return;
      }

      const tracks: Song[] = data.tracks.items.slice(0, 5).map((item: any) => ({
        id: item.id,
        name: item.name,
        artist: item.artists[0].name,
        uri: item.uri,
      }));

      setSearchResults(tracks);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search tracks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSetlist = () => {
    if (!newSetlistName) return;
    if (setlists.length >= MAX_SETLISTS) {
      setError('Maximum number of setlists reached (30). Please delete some to create new ones.');
      return;
    }

    const newSetlist: Setlist = {
      id: Date.now().toString(),
      name: newSetlistName,
      songs: [],
      currentSongIndex: null,
      isLive: false,
    };

    saveSetlists([...setlists, newSetlist]);
    setCurrentSetlist(newSetlist);
    setIsCreateDialogOpen(false);
    setNewSetlistName('');
    setIsEditOverlayOpen(true);
  };

  const handleEditSetlistName = () => {
    if (!editingSetlist || !newSetlistName) return;

    const updatedSetlist = {
      ...editingSetlist,
      name: newSetlistName,
    };

    const newSetlists = setlists.map(sl => 
      sl.id === editingSetlist.id ? updatedSetlist : sl
    );

    saveSetlists(newSetlists);
    if (currentSetlist?.id === editingSetlist.id) {
      setCurrentSetlist(updatedSetlist);
    }

    setIsEditNameDialogOpen(false);
    setEditingSetlist(null);
    setNewSetlistName('');
  };

  const handleDeleteSetlist = (setlistId: string) => {
    const newSetlists = setlists.filter(sl => sl.id !== setlistId);
    saveSetlists(newSetlists);
    if (currentSetlist?.id === setlistId) {
      setCurrentSetlist(null);
      setIsEditOverlayOpen(false);
    }
    setError(null);
  };

  const handleSelectSetlist = (setlist: Setlist) => {
    if (currentSetlist?.id === setlist.id) {
      setCurrentSetlist(null);
    } else {
      setCurrentSetlist(setlist);
    }
    setError(null);
  };

  const handleAddSong = (song: Song) => {
    if (!currentSetlist) return;

    if (currentSetlist.songs.length >= MAX_SONGS_PER_SETLIST) {
      setError(`Maximum number of songs reached (${MAX_SONGS_PER_SETLIST}). Please remove some songs first.`);
      return;
    }

    // Check if song already exists in the setlist
    if (currentSetlist.songs.some(s => s.id === song.id)) {
      setError('This song is already in your setlist');
      return;
    }

    const updatedSetlist = {
      ...currentSetlist,
      songs: [...currentSetlist.songs, song],
    };

    setCurrentSetlist(updatedSetlist);
    setError(null);
    saveSetlists(setlists.map(sl => sl.id === updatedSetlist.id ? updatedSetlist : sl));
  };

  const handleRemoveSong = (songId: string) => {
    if (!currentSetlist) return;

    const updatedSetlist = {
      ...currentSetlist,
      songs: currentSetlist.songs.filter(song => song.id !== songId),
    };

    setCurrentSetlist(updatedSetlist);
    saveSetlists(setlists.map(sl => sl.id === updatedSetlist.id ? updatedSetlist : sl));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !currentSetlist) return;

    const songs = Array.from(currentSetlist.songs);
    const [reorderedSong] = songs.splice(result.source.index, 1);
    songs.splice(result.destination.index, 0, reorderedSong);

    const updatedSetlist = {
      ...currentSetlist,
      songs,
    };

    setCurrentSetlist(updatedSetlist);
    saveSetlists(setlists.map(sl => sl.id === updatedSetlist.id ? updatedSetlist : sl));
  };

  const toggleLiveStatus = () => {
    if (!currentSetlist) return;

    const updatedSetlist = {
      ...currentSetlist,
      isLive: !currentSetlist.isLive,
      currentSongIndex: currentSetlist.isLive ? null : 0,
    };

    setCurrentSetlist(updatedSetlist);
    saveSetlists(setlists.map(sl => sl.id === updatedSetlist.id ? updatedSetlist : sl));
  };

  const handleNextSong = () => {
    if (!currentSetlist || currentSetlist.currentSongIndex === null) return;

    const updatedSetlist = {
      ...currentSetlist,
      currentSongIndex: Math.min(currentSetlist.currentSongIndex + 1, currentSetlist.songs.length - 1),
    };

    setCurrentSetlist(updatedSetlist);
    saveSetlists(setlists.map(sl => sl.id === updatedSetlist.id ? updatedSetlist : sl));
  };

  const openEditNameDialog = (setlist: Setlist, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSetlist(setlist);
    setNewSetlistName(setlist.name);
    setIsEditNameDialogOpen(true);
  };

  const openEditOverlay = (setlist: Setlist, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSetlist(setlist);
    setIsEditOverlayOpen(true);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Pick Setlist
      </Typography>

      {/* Create New Setlist Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => setIsCreateDialogOpen(true)}
          sx={{ width: '100%', maxWidth: 400, height: 56 }}
          disabled={setlists.length >= MAX_SETLISTS}
        >
          Create New Setlist
        </Button>
      </Box>

      {/* Saved Setlists Stack */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        {[...setlists].reverse().map((setlist) => (
          <Button
            key={setlist.id}
            variant="contained"
            sx={{
              width: '100%',
              maxWidth: 400,
              height: 56,
              mx: 'auto',
              display: 'flex',
              justifyContent: 'space-between',
              textTransform: 'none',
              bgcolor: currentSetlist?.id === setlist.id ? 'primary.dark' : 'background.paper',
              '&:hover': {
                bgcolor: currentSetlist?.id === setlist.id ? 'primary.dark' : 'action.hover',
              },
            }}
            onClick={() => handleSelectSetlist(setlist)}
          >
            <Typography variant="subtitle1" noWrap sx={{ flex: 1, color: 'white' }}>
              {setlist.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              {setlist.isLive && (
                <Typography variant="body2" color="primary" sx={{ mr: 1 }}>
                  Live
                </Typography>
              )}
              <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                {setlist.songs.length} {setlist.songs.length === 1 ? 'song' : 'songs'}
              </Typography>
              <EditIcon 
                fontSize="small" 
                sx={{ 
                  mr: 0.5, 
                  cursor: 'pointer',
                  color: 'white'
                }}
                onClick={(e) => openEditOverlay(setlist, e)}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSetlist(setlist.id);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Button>
        ))}
      </Box>

      {/* Live Show Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          color={currentSetlist?.isLive ? "error" : "success"}
          onClick={toggleLiveStatus}
          startIcon={<PlayArrowIcon />}
          sx={{ width: '100%', maxWidth: 400, height: 56 }}
          disabled={!currentSetlist}
        >
          {currentSetlist?.isLive ? "End Show" : "Start Show"}
        </Button>
        {currentSetlist?.isLive && (
          <Button
            variant="contained"
            onClick={handleNextSong}
            disabled={currentSetlist.currentSongIndex === currentSetlist.songs.length - 1}
            sx={{ width: '100%', maxWidth: 400, height: 56 }}
          >
            Next Song
          </Button>
        )}
      </Box>

      {/* Edit Setlist Overlay */}
      <Modal
        open={isEditOverlayOpen}
        onClose={() => setIsEditOverlayOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper 
          sx={{ 
            width: '90%',
            maxWidth: 800,
            maxHeight: '90vh',
            overflow: 'auto',
            p: 3,
            position: 'relative'
          }}
        >
          {currentSetlist && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5">
                    {currentSetlist.name}
                  </Typography>
                  <EditIcon 
                    fontSize="small" 
                    sx={{ 
                      cursor: 'pointer',
                      color: 'action.active'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditNameDialog(currentSetlist, e);
                    }}
                  />
                </Box>
                <IconButton
                  onClick={() => setIsEditOverlayOpen(false)}
                  sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Search Songs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    endAdornment: searchQuery && (
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        edge="end"
                      >
                        <ClearIcon />
                      </IconButton>
                    ),
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Search'}
                </Button>
              </Box>

              {searchResults.length > 0 && (
                <Paper sx={{ mb: 4 }}>
                  <List>
                    {searchResults.map((song) => (
                      <ListItem key={song.id}>
                        <ListItemText
                          primary={song.name}
                          secondary={song.artist}
                        />
                        <Button 
                          onClick={() => handleAddSong(song)}
                          disabled={
                            currentSetlist.songs.length >= MAX_SONGS_PER_SETLIST ||
                            currentSetlist.songs.some(s => s.id === song.id)
                          }
                          color="primary"
                          variant="contained"
                          size="small"
                        >
                          {currentSetlist.songs.some(s => s.id === song.id) 
                            ? 'Already Added'
                            : currentSetlist.songs.length >= MAX_SONGS_PER_SETLIST
                            ? 'Setlist Full'
                            : 'Add to Setlist'
                          }
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}

              <Typography variant="h6" gutterBottom>
                Setlist
              </Typography>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="setlist">
                  {(provided) => (
                    <Paper ref={provided.innerRef} {...provided.droppableProps}>
                      <List>
                        {currentSetlist.songs.map((song, index) => (
                          <Draggable key={song.id} draggableId={song.id} index={index}>
                            {(provided) => (
                              <ListItem
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{
                                  bgcolor: currentSetlist.currentSongIndex === index ? 'primary.main' : 'inherit',
                                }}
                              >
                                <Box {...provided.dragHandleProps} sx={{ mr: 2 }}>
                                  <DragIndicatorIcon />
                                </Box>
                                <ListItemText
                                  primary={song.name}
                                  secondary={song.artist}
                                />
                                <ListItemSecondaryAction>
                                  <IconButton edge="end" onClick={() => handleRemoveSong(song.id)}>
                                    <DeleteIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </List>
                    </Paper>
                  )}
                </Droppable>
              </DragDropContext>
            </>
          )}
        </Paper>
      </Modal>

      {/* Create New Setlist Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)}>
        <DialogTitle>Create New Setlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Setlist Name"
            fullWidth
            value={newSetlistName}
            onChange={(e) => setNewSetlistName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSetlist} disabled={!newSetlistName}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Setlist Name Dialog */}
      <Dialog 
        open={isEditNameDialogOpen} 
        onClose={() => {
          setIsEditNameDialogOpen(false);
          setEditingSetlist(null);
          setNewSetlistName('');
        }}
      >
        <DialogTitle>Edit Setlist Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Setlist Name"
            fullWidth
            value={newSetlistName}
            onChange={(e) => setNewSetlistName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsEditNameDialogOpen(false);
            setEditingSetlist(null);
            setNewSetlistName('');
          }}>
            Cancel
          </Button>
          <Button onClick={handleEditSetlistName} disabled={!newSetlistName}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BandDashboard; 