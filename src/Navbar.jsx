import { AppBar, Toolbar, Typography, Button, Avatar, Menu, MenuItem, Box, IconButton, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import HomeIcon from '@mui/icons-material/Home';

function Navbar() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      handleMenuClose();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#1e3a8a' }}>
      <Toolbar>
        <IconButton
          component={Link}
          to="/"
          edge="start"
          color="inherit"
          sx={{ mr: 2 }}
        >
          <HomeIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          StoryPin
        </Typography>

        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : user ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user.displayName}
              </Typography>
              <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                <Avatar
                  src={user.photoURL}
                  alt={user.displayName}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                <PersonIcon sx={{ mr: 1 }} /> My Profile
              </MenuItem>
              <MenuItem component={Link} to="/bookmarks" onClick={handleMenuClose}>
                <BookmarkIcon sx={{ mr: 1 }} /> My Bookmarks
              </MenuItem>
              <MenuItem onClick={handleSignOut}>
                <LogoutIcon sx={{ mr: 1 }} /> Sign Out
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            color="inherit"
            onClick={handleSignIn}
            disabled={signingIn}
            startIcon={signingIn ? <CircularProgress size={16} color="inherit" /> : <LoginIcon />}
          >
            Sign In with Google
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
