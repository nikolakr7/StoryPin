import { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Paper, Grid, Chip, CircularProgress, Card, CardContent, CardMedia, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Snackbar, Alert } from '@mui/material';
import { collection, query, where, getDocs, doc, updateDoc, arrayRemove, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import Navbar from './Navbar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArticleIcon from '@mui/icons-material/Article';
import PublicIcon from '@mui/icons-material/Public';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import DeleteIcon from '@mui/icons-material/Delete';

function ProfilePage() {
  const { user } = useAuth();
  const [userStories, setUserStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchUserStories = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all pins
        const pinsSnapshot = await getDocs(collection(db, 'pins'));
        const allStories = [];

        // Extract stories authored by this user
        pinsSnapshot.forEach(doc => {
          const pinData = doc.data();
          if (pinData.stories) {
            pinData.stories.forEach(story => {
              if (story.authorId === user.uid) {
                allStories.push({
                  ...story,
                  pinId: doc.id,
                  locationName: pinData.locationName,
                  location: pinData.location
                });
              }
            });
          }
        });

        setUserStories(allStories);
      } catch (error) {
        console.error('Error fetching user stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStories();
  }, [user]);

  const handleDeleteClick = (story) => {
    setStoryToDelete(story);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStoryToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!storyToDelete) return;

    setDeleting(true);
    try {
      const pinRef = doc(db, 'pins', storyToDelete.pinId);

      // Get the current pin data
      const pinDoc = await getDoc(pinRef);
      if (!pinDoc.exists()) {
        throw new Error('Pin not found');
      }

      const pinData = pinDoc.data();
      const updatedStories = pinData.stories.filter(s => s.id !== storyToDelete.id);

      // If this is the last story in the pin, delete the entire pin
      if (updatedStories.length === 0) {
        await deleteDoc(pinRef);
        setSnackbar({ open: true, message: 'Story deleted successfully! Pin removed as it was the last story.', severity: 'success' });
      } else {
        // Otherwise, just remove the story from the pin's stories array
        await updateDoc(pinRef, {
          stories: updatedStories
        });
        setSnackbar({ open: true, message: 'Story deleted successfully!', severity: 'success' });
      }

      // Update local state to remove the deleted story
      setUserStories(prevStories => prevStories.filter(s => s.id !== storyToDelete.id));

    } catch (error) {
      console.error('Error deleting story:', error);
      setSnackbar({ open: true, message: 'Failed to delete story. Please try again.', severity: 'error' });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setStoryToDelete(null);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
          <Typography variant="h6">Please sign in to view your profile</Typography>
        </Box>
      </>
    );
  }

  // Calculate stats
  const storiesCount = userStories.length;
  const uniqueLocations = new Set(userStories.map(s => s.locationName)).size;

  // Extract countries and cities from location names (simplified)
  const locations = userStories.map(s => s.locationName);
  const cities = new Set(locations.map(loc => {
    const parts = loc.split(',');
    return parts[0]?.trim();
  }));

  const countries = new Set(locations.map(loc => {
    const parts = loc.split(',');
    return parts[parts.length - 1]?.trim();
  }));

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4, bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
        {/* Profile Header */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar
              src={user.photoURL}
              alt={user.displayName}
              sx={{ width: 100, height: 100 }}
            />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {user.displayName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>

          {/* Travel Stats */}
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Travel Stats
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                <ArticleIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {storiesCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stories Shared
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
                <LocationOnIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {uniqueLocations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unique Locations
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                <LocationCityIcon sx={{ fontSize: 40, color: '#388e3c', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {cities.size}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cities Visited
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                <PublicIcon sx={{ fontSize: 40, color: '#f57c00', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {countries.size}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Countries Explored
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {/* User Stories */}
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          My Stories
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : userStories.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              You haven't shared any stories yet. Start exploring and share your experiences!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {userStories.map((story, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ position: 'relative' }}>
                  <IconButton
                    onClick={() => handleDeleteClick(story)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 1)',
                        color: 'error.main'
                      },
                      zIndex: 1
                    }}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <CardMedia
                    component="img"
                    height="200"
                    image={story.photoUrl}
                    alt={story.title}
                  />
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {story.title}
                    </Typography>
                    <Chip
                      label={story.desireTag?.replace('_', ' ')}
                      size="small"
                      color="primary"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} /> {story.locationName}
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {story.story}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Delete Story?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete "{storyToDelete?.title}"? This action cannot be undone.
              {storyToDelete && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Note: If this is the last story in this pin, the entire pin will be removed from the map.
                  </Typography>
                </Box>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}

export default ProfilePage;
