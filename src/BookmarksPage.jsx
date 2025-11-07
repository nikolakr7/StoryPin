import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from './AuthContext';
import Navbar from './Navbar';
import BookmarkIcon from '@mui/icons-material/Bookmark';

function BookmarksPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
          <Typography variant="h6">Please sign in to view your bookmarks</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4, bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          My Bookmarks
        </Typography>

        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BookmarkIcon sx={{ fontSize: 60, color: '#757575', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Bookmarks feature coming soon!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You'll be able to save your favorite stories here for easy access.
          </Typography>
        </Paper>
      </Box>
    </>
  );
}

export default BookmarksPage;
