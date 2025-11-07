// src/main.jsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// --- THIS LINE IS CHANGED ---
import { createHashRouter, RouterProvider } from "react-router-dom";
import './index.css';
// Delete any 'leaflet.css' or 'geosearch.css' imports

import Home from './Home';
import MapPage from './MapPage';
import ProfilePage from './ProfilePage';
import BookmarksPage from './BookmarksPage';
import { AuthProvider } from './AuthContext';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

// Loader Function for MapPage
// This fetches ALL pins from Firestore *before* the map page loads.
const mapLoader = async ({ params }) => {
  const { mode } = params; // This will be 'find' or 'add'

  // Fetch all pins
  const pinsCollection = collection(db, 'pins');
  const pinsSnapshot = await getDocs(pinsCollection);
  const allPins = pinsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Return the pins and the current mode to the MapPage component
  return { allPins, mode };
};

// --- THIS LINE IS CHANGED ---
const router = createHashRouter([
  {
    path: "/",
    element: <Home />, // Your new splash page
  },
  {
    path: "/map/:mode", // Can be /map/find or /map/add
    element: <MapPage />,
    loader: mapLoader, // Run this function before rendering
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/bookmarks",
    element: <BookmarksPage />,
  },
]);

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);