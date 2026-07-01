import { parseFile } from 'music-metadata';
import path from 'node:path';
import { SyncLyric } from '@/types/song';

export interface ExtractedMetadata {
  title: string;
  artist: string;
  album: string;
  genre: string | null;
  duration: number | null;
  year: number | null;
  track: number | null;
  disc: number | null;
  bitrate: number | null;
  sampleRate: number | null;
  lyrics: string | null;
  syncLyrics: SyncLyric[] | null;
}

export class MetadataService {
  public async extractMetadata(filePath: string): Promise<ExtractedMetadata> {
    const filename = path.basename(filePath);
    
    // Default fallbacks
    const fallback: ExtractedMetadata = {
      title: filename,
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      genre: null,
      duration: null,
      year: null,
      track: null,
      disc: null,
      bitrate: null,
      sampleRate: null,
      lyrics: null,
      syncLyrics: null,
    };

    try {
      const metadata = await parseFile(filePath);
      const lyricsTag = metadata.common.lyrics?.[0];
      let syncLyrics: SyncLyric[] | null = null;
      let lyrics: string | null = null;

      if (lyricsTag) {
        lyrics = lyricsTag.text ?? null;
        if (lyricsTag.syncText && lyricsTag.syncText.length > 0) {
          syncLyrics = lyricsTag.syncText
            .filter((l) => l.timestamp !== undefined)
            .map((l) => ({
              time: l.timestamp! / 1000,
              text: l.text,
            }));
        }
      }

      return {
        title: metadata.common.title || fallback.title,
        artist: metadata.common.artist || metadata.common.albumartist || fallback.artist,
        album: metadata.common.album || fallback.album,
        genre: metadata.common.genre && metadata.common.genre.length > 0 ? metadata.common.genre.join(', ') : null,
        duration: typeof metadata.format.duration === 'number' ? metadata.format.duration : null,
        year: metadata.common.year || (metadata.common.date ? parseInt(metadata.common.date.substring(0, 4), 10) || null : null),
        track: metadata.common.track?.no || null,
        disc: metadata.common.disk?.no || null,
        bitrate: metadata.format.bitrate || null,
        sampleRate: metadata.format.sampleRate || null,
        lyrics,
        syncLyrics,
      };
    } catch {
      return fallback;
    }
  }
}
export default MetadataService;
