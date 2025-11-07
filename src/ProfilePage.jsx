import { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Paper, Grid, Chip, CircularProgress, Card, CardContent, CardMedia } from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import Navbar from './Navbar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArticleIcon from '@mui/icons-material/Article';
import PublicIcon from '@mui/icons-material/Public';
import LocationCityIcon from '@mui/icons-material/LocationCity';

function ProfilePage() {
  const { user } = useAuth();
  const [userStories, setUserStories] = useState([]);
  const [loading, setLoading] = useState(true);

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
                <Card>
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
      </Box>
    </>
  );
}

export default ProfilePage;
