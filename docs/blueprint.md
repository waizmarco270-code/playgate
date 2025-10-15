# **App Name**: WaizPlay

## Core Features:

- Video Import and Storage: Import video files from local storage and store them in IndexedDB, generating thumbnails automatically using the Canvas API.
- Video Player: Play locally stored video files with standard controls like play/pause, seek, volume, and fullscreen, utilizing Plyr.js or Video.js. Remember the last played position in local storage.
- Playlist Management: Create, rename, delete, and reorder video playlists, including 'Recently Watched' and 'Favorites' auto-sections. Manage local video library without any uploads to any cloud or server.
- Theme Switching: Allow users to switch between a dark and light theme to suit their preferences. Persist preference in local storage.
- Data Backup: Enable users to export their data (playlists, settings) to a JSON file for backup purposes and import it back into the application.
- Floating Mini-Player: Implement a floating mini-player that appears when the user scrolls, shrinking the video to a corner of the screen for easy multitasking.
- Privacy Vault: Allow the user to encrypt specific videos to safeguard user privacy.

## Style Guidelines:

- Primary color: Neon blue (#00C6FF), a vibrant and electric blue to convey modernity and technological sophistication; evokes the glow of screens and digital interfaces. Used in the dark theme, it provides a striking contrast against the dark background.
- Background color: Very dark gray (#121212), nearly black; allows the primary color to pop.
- Accent color: Blue-violet (#4A3AFF), similar to primary but slightly different hue, creating visual interest and complementing neon blue.
- Body and headline font: 'Inter', a sans-serif font offering a modern, neutral, and highly readable style suitable for both headlines and body text.
- Use Lucide-react or HeroIcons for a consistent, minimalist icon set.
- Employ rounded cards and soft shadow effects to create depth and a modern feel. Utilize glassmorphism effects for UI elements to enhance the visual appeal.
- Use subtle Framer Motion animations for transitions and interactions to provide a smooth and engaging user experience.