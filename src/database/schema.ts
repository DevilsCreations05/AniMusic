export const DATABASE_NAME = 'animusic.db';
export const DATABASE_VERSION = 1;

export const TABLES = {
  USERS: 'users',
  SONGS: 'songs',
  DOWNLOADS: 'downloads',
  FAVORITES: 'favorites',
};

export const SCHEMA = {
  USERS: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      google_id TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  SONGS: `
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      artist TEXT NOT NULL,
      movie TEXT,
      album TEXT,
      genre TEXT,
      duration INTEGER,
      file_size INTEGER,
      cover_url TEXT,
      lyrics TEXT,
      drive_link TEXT NOT NULL,
      uploaded_by INTEGER NOT NULL,
      uploader_name TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      rejection_reason TEXT,
      play_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );
  `,
  
  DOWNLOADS: `
    CREATE TABLE IF NOT EXISTS downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      file_path TEXT,
      download_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (song_id) REFERENCES songs(id),
      UNIQUE(user_id, song_id)
    );
  `,
  
  FAVORITES: `
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (song_id) REFERENCES songs(id),
      UNIQUE(user_id, song_id)
    );
  `,
};

export const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_songs_status ON songs(status);',
  'CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);',
  'CREATE INDEX IF NOT EXISTS idx_songs_uploaded_by ON songs(uploaded_by);',
  'CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);',
];