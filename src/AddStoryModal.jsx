// src/AddStoryModal.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from './firebase';
import { collection, addDoc, doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { desireTags } from './tags';
import { useAuth } from './AuthContext';

import { Modal, Box, Typography, TextField, Select, MenuItem, Button, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

function AddStoryModal({ pinData, onClose, onStoryAdded }) {
  const { user, signInWithGoogle } = useAuth();
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [desireTag, setDesireTag] = useState(desireTags[0]);
  const [photo, setPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be signed in to add a story.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let downloadURL = null;

      // Upload photo to Firebase Storage only if provided
      if (photo) {
        const photoName = `images/${uuidv4()}-${photo.name}`;
        const storageRef = ref(storage, photoName);
        await uploadBytes(storageRef, photo);
        downloadURL = await getDownloadURL(storageRef);
      }

      // Create story object with author info and timestamp
      const newStoryObject = {
        id: uuidv4(),
        title,
        story,
        desireTag,
        photoUrl: downloadURL || 'https://via.placeholder.com/400x300?text=No+Image',
        authorId: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL,
        timestamp: new Date().toISOString(), // ISO string for easier sorting
        likes: 0,
        likedBy: []
      };

      // Add or update pin
      if (pinData.id) {
        const docRef = doc(db, 'pins', pinData.id);
        await updateDoc(docRef, {
          stories: arrayUnion(newStoryObject),
          desireTags: arrayUnion(newStoryObject.desireTag)
        });
      } else {
        const newPin = {
          location: pinData.location,
          locationName: pinData.locationName,
          stories: [newStoryObject],
          desireTags: [newStoryObject.desireTag]
        };
        await addDoc(collection(db, 'pins'), newPin);
      }

      setSuccess(true);
      setIsLoading(false);

      // Close modal after short delay and notify parent to refresh data
      setTimeout(() => {
        onClose();
        if (onStoryAdded) {
          onStoryAdded();
        } else {
          // Fallback to page refresh if callback not provided
          navigate(0);
        }
      }, 1500);

    } catch (error) {
      console.error("Error adding story: ", error);
      setError("Failed to add story: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2">
          {pinData.id ? `Add story to: ${pinData.locationName}` : `Create pin at: ${pinData.locationName}`}
        </Typography>

        {!user && (
          <Alert severity="warning">
            You must be signed in to add a story.{' '}
            <Button size="small" onClick={signInWithGoogle}>
              Sign In
            </Button>
          </Alert>
        )}

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Story added successfully!</Alert>}

        <TextField
          label="Title"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          fullWidth
          disabled={!user || isLoading}
        />

        <TextField
          label="Your story..."
          variant="outlined"
          multiline
          rows={4}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          required
          fullWidth
          disabled={!user || isLoading}
        />

        <FormControl fullWidth disabled={!user || isLoading}>
          <InputLabel id="desire-tag-label">Desire Tag</InputLabel>
          <Select
            labelId="desire-tag-label"
            value={desireTag}
            label="Desire Tag"
            onChange={(e) => setDesireTag(e.target.value)}
          >
            {desireTags.map(tag => (
              <MenuItem key={tag} value={tag}>
                {tag.charAt(0).toUpperCase() + tag.slice(1).replace('_', ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="outlined" component="label" disabled={!user || isLoading}>
          {isLoading ? 'Uploading...' : 'Upload Photo (Optional)'}
          <input
            type="file"
            hidden
            onChange={(e) => setPhoto(e.target.files[0])}
            accept="image/*"
          />
        </Button>
        {photo && (
          <Typography variant="caption" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {photo.name}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!user || isLoading}
          size="large"
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Submit Story"}
        </Button>
      </Box>
    </Modal>
  );
}

export default AddStoryModal;