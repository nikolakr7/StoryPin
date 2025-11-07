import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // 1. ADD THIS 'base' PROPERTY
  // Replace 'newhacks25' with your GitHub repository's name
  base: '/storypin/', 
  
  // 2. ADD THIS 'build' PROPERTY
  build: {
    outDir: 'docs' // Build into a 'docs' folder
  },
  
  plugins: [react()],
})