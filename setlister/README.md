# SetLister

A web application that allows you to create and manage playlists across Spotify and Apple Music.

## Features

- Connect to both Spotify and Apple Music accounts
- Search for songs across both platforms
- Create playlists that sync between services
- Modern, responsive UI built with Material-UI

## Prerequisites

- Node.js (v14 or higher)
- Spotify Developer Account
- Apple Music Developer Account

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
4. Configure your environment variables in `.env`:
   - For Spotify:
     1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
     2. Create a new application
     3. Add `http://localhost:5173/callback/spotify` to the Redirect URIs
     4. Copy the Client ID and Client Secret to your `.env` file
   
   - For Apple Music:
     1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
     2. Generate a Music Key
     3. Create a developer token
     4. Add the credentials to your `.env` file

## Development

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

## Technologies Used

- React
- TypeScript
- Vite
- Material-UI
- Spotify Web API
- Apple Music API

## License

MIT
