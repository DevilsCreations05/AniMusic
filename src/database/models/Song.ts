import {Database} from '../Database';
import {TABLES} from '../schema';

export interface ISong {
  id?: number;
  name: string;
  artist: string;
  movie?: string;
  album?: string;
  genre?: string;
  duration?: number;
  file_size?: number;
  cover_url?: string;
  lyrics?: string;
  drive_link: string;
  uploaded_by: number;
  uploader_name: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  play_count?: number;
  created_at?: string;
  approved_at?: string;
}

export class SongModel {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async create(song: Omit<ISong, 'id'>): Promise<number> {
    const query = `
      INSERT INTO ${TABLES.SONGS} 
      (name, artist, movie, album, genre, duration, file_size, cover_url, 
       lyrics, drive_link, uploaded_by, uploader_name, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      song.name,
      song.artist,
      song.movie || null,
      song.album || null,
      song.genre || null,
      song.duration || null,
      song.file_size || null,
      song.cover_url || null,
      song.lyrics || null,
      song.drive_link,
      song.uploaded_by,
      song.uploader_name,
      song.status || 'pending',
    ];

    const result = await this.db.executeSql(query, params);
    return result.insertId;
  }

  async findById(id: number): Promise<ISong | null> {
    const query = `SELECT * FROM ${TABLES.SONGS} WHERE id = ?`;
    const result = await this.db.executeSql(query, [id]);

    if (result.rows.length > 0) {
      return result.rows.item(0);
    }
    return null;
  }

  async findApproved(limit: number = 50, offset: number = 0): Promise<ISong[]> {
    const query = `
      SELECT * FROM ${TABLES.SONGS} 
      WHERE status = 'approved' 
      ORDER BY approved_at DESC 
      LIMIT ? OFFSET ?
    `;
    const result = await this.db.executeSql(query, [limit, offset]);

    const songs: ISong[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      songs.push(result.rows.item(i));
    }
    return songs;
  }

  async findPending(): Promise<ISong[]> {
    const query = `
      SELECT * FROM ${TABLES.SONGS} 
      WHERE status = 'pending' 
      ORDER BY created_at ASC
    `;
    const result = await this.db.executeSql(query);

    const songs: ISong[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      songs.push(result.rows.item(i));
    }
    return songs;
  }

  async findByUploader(uploaderId: number): Promise<ISong[]> {
    const query = `
      SELECT * FROM ${TABLES.SONGS} 
      WHERE uploaded_by = ? 
      ORDER BY created_at DESC
    `;
    const result = await this.db.executeSql(query, [uploaderId]);

    const songs: ISong[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      songs.push(result.rows.item(i));
    }
    return songs;
  }

  async approve(id: number): Promise<void> {
    const query = `
      UPDATE ${TABLES.SONGS} 
      SET status = 'approved', approved_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    await this.db.executeSql(query, [id]);
  }

  async reject(id: number, reason: string): Promise<void> {
    const query = `
      UPDATE ${TABLES.SONGS} 
      SET status = 'rejected', rejection_reason = ? 
      WHERE id = ?
    `;
    await this.db.executeSql(query, [reason, id]);
  }

  async incrementPlayCount(id: number): Promise<void> {
    const query = `
      UPDATE ${TABLES.SONGS} 
      SET play_count = play_count + 1 
      WHERE id = ?
    `;
    await this.db.executeSql(query, [id]);
  }

  async search(searchTerm: string): Promise<ISong[]> {
    const query = `
      SELECT * FROM ${TABLES.SONGS} 
      WHERE status = 'approved' 
      AND (name LIKE ? OR artist LIKE ? OR movie LIKE ? OR album LIKE ?)
      ORDER BY play_count DESC
      LIMIT 50
    `;
    const searchPattern = `%${searchTerm}%`;
    const result = await this.db.executeSql(query, [
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
    ]);

    const songs: ISong[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      songs.push(result.rows.item(i));
    }
    return songs;
  }
}