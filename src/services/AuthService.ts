import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {GOOGLE_WEB_CLIENT_ID, OTP_SERVICE_URL, OTP_SERVICE_API_KEY} from '@env';
import {UserModel, IUser} from '../database/models/User';

const AUTH_TOKEN_KEY = '@animusic_auth_token';
const USER_DATA_KEY = '@animusic_user_data';

export class AuthService {
  private static instance: AuthService;
  private userModel: UserModel;

  private constructor() {
    this.userModel = new UserModel();
    // Only configure Google Sign-In if credentials are available
    if (GOOGLE_WEB_CLIENT_ID && GOOGLE_WEB_CLIENT_ID !== 'YOUR_GOOGLE_WEB_CLIENT_ID') {
      this.configureGoogleSignIn();
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private configureGoogleSignIn() {
    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false, // Changed to false to avoid offline error
        forceCodeForRefreshToken: false,
      });
    } catch (error) {
      console.log('Google Sign-In configuration skipped:', error);
    }
  }

  async signInWithGoogle(): Promise<IUser> {
    try {
      // Check if Google Sign-In is configured
      if (!GOOGLE_WEB_CLIENT_ID || GOOGLE_WEB_CLIENT_ID === 'YOUR_GOOGLE_WEB_CLIENT_ID') {
        throw new Error('Google Sign-In not configured. Using guest mode.');
      }
      
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const {user} = userInfo;

      // Check if user exists in database
      let dbUser = await this.userModel.findByGoogleId(user.id);
      
      if (!dbUser) {
        // Create new user
        const userId = await this.userModel.create({
          email: user.email,
          name: user.name || user.email.split('@')[0],
          avatar_url: user.photo,
          google_id: user.id,
          role: 'user',
        });
        dbUser = await this.userModel.findById(userId);
      }

      if (dbUser) {
        await this.saveAuthData(dbUser);
        return dbUser;
      }

      throw new Error('Failed to create or retrieve user');
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  }

  async sendOTP(email: string): Promise<void> {
    try {
      const response = await fetch(`${OTP_SERVICE_URL}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OTP_SERVICE_API_KEY}`,
        },
        body: JSON.stringify({email}),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      throw error;
    }
  }

  async verifyOTP(email: string, otp: string): Promise<IUser> {
    try {
      const response = await fetch(`${OTP_SERVICE_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OTP_SERVICE_API_KEY}`,
        },
        body: JSON.stringify({email, otp}),
      });

      if (!response.ok) {
        throw new Error('Invalid OTP');
      }

      // Check if user exists
      let user = await this.userModel.findByEmail(email);
      
      if (!user) {
        // Create new user
        const userId = await this.userModel.create({
          email,
          name: email.split('@')[0],
          role: 'user',
        });
        user = await this.userModel.findById(userId);
      }

      if (user) {
        await this.saveAuthData(user);
        return user;
      }

      throw new Error('Failed to authenticate user');
    } catch (error) {
      console.error('Verify OTP Error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      // Only sign out from Google if it was configured
      try {
        await GoogleSignin.signOut();
      } catch (googleError) {
        // Ignore Google sign-out errors
      }
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  }

  async getCurrentUser(): Promise<IUser | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
      
      // If no user, create a guest user automatically
      const guestUser = await this.createGuestUser();
      return guestUser;
    } catch (error) {
      console.error('Get Current User Error:', error);
      // Still return guest user on error
      return this.createGuestUser();
    }
  }

  async createGuestUser(): Promise<IUser> {
    const guestEmail = `guest_${Date.now()}@animusic.local`;
    const guestUser: IUser = {
      id: Date.now(),
      email: guestEmail,
      name: 'Guest User',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Save guest user to storage
    await this.saveAuthData(guestUser);
    return guestUser;
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'admin';
  }

  private async saveAuthData(user: IUser): Promise<void> {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, user.google_id || user.email);
  }
}