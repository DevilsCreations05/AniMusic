import {Database} from '../Database';

export interface IFavorite {
  id?: number;
  user_id: number;
  song_id: number;
  created_at?: string;
}

export class FavoriteModel {
  private db = Database.getInstance();

  async create(favorite: IFavorite): Promise<number> {
    const db = await this.db.getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO favorites (user_id, song_id) VALUES (?, ?)',
          [favorite.user_id, favorite.song_id],
          (_, result) => resolve(result.insertId),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async findByUser(userId: number): Promise<IFavorite[]> {
    const db = await this.db.getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM favorites WHERE user_id = ?',
          [userId],
          (_, result) => {
            const favorites: IFavorite[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              favorites.push(result.rows.item(i));
            }
            resolve(favorites);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async remove(userId: number, songId: number): Promise<void> {
    const db = await this.db.getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM favorites WHERE user_id = ? AND song_id = ?',
          [userId, songId],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async isFavorite(userId: number, songId: number): Promise<boolean> {
    const db = await this.db.getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM favorites WHERE user_id = ? AND song_id = ?',
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