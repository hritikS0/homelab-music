import { parseFile } from 'music-metadata';
import path from 'node:path';

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
    };

    try {
      const metadata = await parseFile(filePath);
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
      };
    } catch {
      return fallback;
    }
  }
}
export default MetadataService;
