import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_AUTH_CONFIG } from '../config/googleAuth.config';

class GoogleAuthService {
  private static instance: GoogleAuthService;
  private accessToken: string | null = null;
  private userInfo: any = null;

  private constructor() {
    this.configure();
  }

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  private configure() {
    GoogleSignin.configure({
      webClientId: GOOGLE_AUTH_CONFIG.WEB_CLIENT_ID,
      scopes: GOOGLE_AUTH_CONFIG.SCOPES,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }

  async signIn(): Promise<boolean> {
    try {
      await GoogleSignin.hasPlayServices();
      
      const userInfo = await GoogleSignin.signIn();
      this.userInfo = userInfo;
      
      // Get access token
      const tokens = await GoogleSignin.getTokens();
      this.accessToken = tokens.accessToken;
      
      console.log('Google Sign-In successful:', userInfo.user.email);
      return true;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled sign in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available');
      } else {
        console.error('Google Sign-In error:', error);
      }
      return false;
    }
  }

  async signInSilently(): Promise<boolean> {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      this.userInfo = userInfo;
      
      const tokens = await GoogleSignin.getTokens();
      this.accessToken = tokens.accessToken;
      
      return true;
    } catch (error) {
      console.log('Silent sign-in failed:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
      this.accessToken = null;
      this.userInfo = null;
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      // Check if token exists and is valid
      if (this.accessToken) {
        // Try to use current token
        return this.accessToken;
      }

      // Try to refresh token
      const tokens = await GoogleSignin.getTokens();
      this.accessToken = tokens.accessToken;
      return this.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      // Try to sign in silently
      const success = await this.signInSilently();
      if (success) {
        return this.accessToken;
      }
      return null;
    }
  }

  isSignedIn(): boolean {
    return this.accessToken !== null;
  }

  getUserInfo(): any {
    return this.userInfo;
  }
}

export default GoogleAuthService;