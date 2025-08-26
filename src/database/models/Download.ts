import {Database} from '../Database';

export interface IDownload {
  id?: number;
  user_id: number;
  song_id: number;
  file_path: string;
  downloaded_at?: string;
}

export class DownloadModel {
  private db = Database.getInstance();

  async create(download: IDownload): Promise<number> {
    const db = await this.db.getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO downloads (user_id, song_id, file_path) VALUES (?, ?, ?)',
          [download.user_id, download.song_id, download.file_path],
          (_, result) => resolve(result.insertId),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async findByUser(userId: number): Promise<IDownload[]> {
    const db = await this.db.getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM downloads WHERE user_id = ?',
          [userId],
          (_, result) => {
            const downloads: IDownload[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              downloads.push(result.rows.item(i));
            }
            resolve(downloads);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async findBySong(songId: number): Promise<IDownload[]> {
    const db = await this.db.getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM downloads WHERE song_id = ?',
          [songId],
          (_, result) => {
            const downloads: IDownload[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              downloads.push(result.rows.item(i));
            }
            resolve(downloads);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async delete(id: number): Promise<void> {
    const db = await this.db.getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM downloads WHERE id = ?',
          [id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async isDownloaded(userId: number, songId: number): Promise<boolean> {
    const db = await this.db.getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM downloads WHERE user_id = ? AND song_id = ?',
          [userId, songId],
          (_, result) => {
            resolve(result.rows.item(0).count > 0);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
}