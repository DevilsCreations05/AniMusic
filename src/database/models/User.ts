import {Database} from '../Database';
import {TABLES} from '../schema';

export interface IUser {
  id?: number;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  google_id?: string;
  created_at?: string;
  updated_at?: string;
}

export class UserModel {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async create(user: Omit<IUser, 'id'>): Promise<number> {
    const query = `
      INSERT INTO ${TABLES.USERS} (email, name, avatar_url, role, google_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      user.email,
      user.name,
      user.avatar_url || null,
      user.role,
      user.google_id || null,
    ];

    const result = await this.db.executeSql(query, params);
    return result.insertId;
  }

  async findById(id: number): Promise<IUser | null> {
    const query = `SELECT * FROM ${TABLES.USERS} WHERE id = ?`;
    const result = await this.db.executeSql(query, [id]);

    if (result.rows.length > 0) {
      return result.rows.item(0);
    }
    return null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const query = `SELECT * FROM ${TABLES.USERS} WHERE email = ?`;
    const result = await this.db.executeSql(query, [email]);

    if (result.rows.length > 0) {
      return result.rows.item(0);
    }
    return null;
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    const query = `SELECT * FROM ${TABLES.USERS} WHERE google_id = ?`;
    const result = await this.db.executeSql(query, [googleId]);

    if (result.rows.length > 0) {
      return result.rows.item(0);
    }
    return null;
  }

  async update(id: number, updates: Partial<IUser>): Promise<void> {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');

    if (!fields) return;

    const query = `
      UPDATE ${TABLES.USERS}
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const params = [...Object.values(updates), id];

    await this.db.executeSql(query, params);
  }

  async isAdmin(userId: number): Promise<boolean> {
    const user = await this.findById(userId);
    return user?.role === 'admin';
  }
}