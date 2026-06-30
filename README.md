# Homelab Music Player

Homelab Music is a lightweight, cross-platform, self-hosted music player built to run efficiently on local servers, including desktop OSs (Ubuntu, macOS, Windows) and mobile environments (Android via Termux). 

It features an artwork-dominated, minimalist user interface inspired by premium desktop players like Spotify and Apple Music on macOS.

---

## Technical Stack & Architecture

- **Framework**: Next.js 16 (App Router, React 19, strict TypeScript)
- **Database & Persistence**: Asynchronous JSON-based Repository with serialized write queueing (ensuring complete SQLite/Prisma-free operation to guarantee Termux compatibility without native compilation issues).
- **Styling**: Tailwind CSS with custom Spotify-style native slider modifications.
- **Metadata Engine**: `music-metadata` tag parsing.
- **State Management**: React Context (`MusicPlayerProvider`) coordinating unified playback, timeline seeking, volume adjustments, dynamic XHR file uploads, and directory sync statuses.

---

## Core Features

### 1. Library Scanner (Source of Truth)
The application indexes files directly from the filesystem directory (`UPLOAD_DIR`).
- **Flow**: Recursively traverses the directory, computes SHA-256 hashes of file buffers to prevent duplicates if files are renamed or moved, and synchronizes the JSON index database.
- **Dynamic Fallbacks**: If ID3 tags are missing or corrupted, the scanner falls back to using the filename as the title, `Unknown Artist` as the artist, and `Unknown Album` as the album name.
- **Auto-Sync**: Automatically runs a background filesystem scan on server startup and immediately after file uploads.

### 2. On-the-Fly Artwork Streaming
- Resolves ID3-embedded album art pictures directly from audio files on-the-fly and streams them to the browser with HTTP caching.
- Dynamically falls back to standard vectors if no artwork is present inside the audio metadata tags.

### 3. Native Desktop UX
- **Two-Column View**: Left sidebar containing navigation items (Library, Albums, Artists, Genres, Favorites) and a main content grid.
- **Spotify-Inspired Playback Bar**: Persistent bottom bar featuring album art, playback toggle states, dynamic seek sliders, volume controls, and loop/shuffle behaviors.

---

## Folder Structure

```text
homelab-music/
│
├── storage/
│   └── songs.json           # Active JSON index database (ignored in git)
│
├── src/
│   ├── app/                 # Next.js App Router root
│   │   ├── api/
│   │   │   ├── health/      # Health check endpoint
│   │   │   └── v1/          # Versioned API routes (songs, stream, library)
│   │   ├── globals.css      # Core styles & range slider rules
│   │   ├── layout.tsx       # Root layout file (wrapped in provider)
│   │   └── page.tsx         # Redesigned minimalist dashboard view
│   │
│   ├── components/          # Reusable React components
│   │   ├── layout/          # Page headers, sidebars
│   │   ├── music/           # Audio/music list rows, cards, and player controls
│   │   └── ui/              # Input fields and upload actions
│   │
│   ├── config/              # Global configurations (logger, env checks)
│   │
│   ├── providers/           # MusicPlayerProvider context
│   │
│   ├── repositories/        # Database access layer (JsonSongRepository)
│   │
│   ├── services/            # Business logic orchestration (SongService, libraryScanner)
│   │
│   ├── types/               # Type definitions (Song, Scanner models)
│   │
│   └── utils/               # AppError handlers
```

---

## API Endpoints

### Library Scanner API

#### POST `/api/v1/library/scan`
Triggers a manual walk and synchronization.
```json
{
  "success": true,
  "summary": {
    "scanned": 582,
    "imported": 17,
    "updated": 4,
    "removed": 2,
    "skipped": 559,
    "errors": 0,
    "durationMs": 1543
  }
}
```

#### GET `/api/v1/library/status`
Retrieves scanner progress flags.
```json
{
  "isScanning": false,
  "lastScan": "2026-06-30T17:34:43Z",
  "totalSongs": 582,
  "lastDurationMs": 1421
}
```

### Songs & Audio API

- **GET** `/api/v1/songs`: Retrieves all indexed tracks.
- **GET** `/api/v1/songs/artwork/[id]`: Serves cached embedded ID3 covers directly.
- **POST** `/api/v1/songs/upload`: Saves uploaded audio and schedules library scanner sync.
- **GET** `/api/v1/stream/[id]`: Streams target audio using 206 Partial Content range requests.
- **DELETE** `/api/v1/songs/[id]`: Deletes song index and disk file.

---

## Commands & Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development environment |
| `npm run build` | Validates types and compiles production bundles |
| `npm run start` | Boots compiled Next.js production server |
| `npm run lint` | Runs ESLint inspections |
