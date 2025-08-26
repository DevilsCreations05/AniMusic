import React, {useState, useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {View, ActivityIndicator} from 'react-native';
import {MusicProvider, useMusic} from './src/context/MusicContext';
import {GlobalMiniPlayer} from './src/components/GlobalMiniPlayer';
import {AnimeErrorProvider} from './src/utils/AnimeErrorHandler';

import {SplashScreen} from './src/screens/SplashScreen';
import {MusicHomeScreen} from './src/screens/MusicHomeScreen';
import {LocalSongsScreen} from './src/screens/LocalSongsScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {UploadScreen} from './src/screens/UploadScreen';
import {EasyUploadScreen} from './src/screens/EasyUploadScreen';
import {RealUploadScreen} from './src/screens/RealUploadScreen';
import {ProfileScreenNew} from './src/screens/ProfileScreenNew';
import {SettingsScreen} from './src/screens/SettingsScreen';
import {AdminScreen} from './src/screens/AdminScreen';
import {MusicPlayerFinal} from './src/screens/MusicPlayerFinal';
import {GoogleMusicScreen} from './src/screens/GoogleMusicScreen';

import {Database} from './src/database/Database';
import {AuthService} from './src/services/AuthService';
import {UserModel} from './src/database/models/User';
import {theme} from './src/theme';

export type RootStackParamList = {
  MusicHome: undefined;
  Home: undefined;
  LocalSongs: undefined;
  GoogleMusic: undefined;
  Browse: undefined;
  Playlists: undefined;
  Favorites: undefined;
  Downloads: undefined;
  Upload: undefined;
  EasyUpload: undefined;
  RealUpload: undefined;
  Profile: undefined;
  Settings: undefined;
  Admin: undefined;
  MusicPlayer: {song: any};
};

const RootStack = createStackNavigator<RootStackParamList>();

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [currentRoute, setCurrentRoute] = useState('MusicHome');
  const {currentSong, isPlaying, setIsPlaying, stopSong} = useMusic();
  const navigationRef = React.useRef<any>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const db = Database.getInstance();
      await db.init();
      
      // Create admin user if doesn't exist
      const userModel = new UserModel();
      const adminUser = await userModel.findByEmail('admin@animusic.com');
      if (!adminUser) {
        await userModel.create({
          email: 'admin@animusic.com',
          name: 'Admin',
          role: 'admin',
        });
      }
      
      // Auto-login as guest if not authenticated
      const authService = AuthService.getInstance();
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        await authService.createGuestUser();
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('App initialization error:', error);
      setIsLoading(false);
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={theme.colors.primary.black} />
      </View>
    );
  }

  const handlePlayPause = async () => {
    if (isPlaying) {
      const MusicService = (await import('./src/services/MusicService')).default;
      await MusicService.pause();
      setIsPlaying(false);
    } else {
      const MusicService = (await import('./src/services/MusicService')).default;
      await MusicService.play();
      setIsPlaying(true);
    }
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <NavigationContainer 
          ref={navigationRef}
          onStateChange={() => {
            const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;
            if (currentRouteName) {
              setCurrentRoute(currentRouteName);
            }
          }}>
          <RootStack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: {backgroundColor: theme.colors.background.light},
            }}>
            <RootStack.Screen name="MusicHome" component={MusicHomeScreen} />
            <RootStack.Screen name="Home" component={HomeScreen} />
            <RootStack.Screen name="LocalSongs" component={LocalSongsScreen} />
            <RootStack.Screen name="GoogleMusic" component={GoogleMusicScreen} />
            <RootStack.Screen name="Browse" component={GoogleMusicScreen} />
            <RootStack.Screen name="Playlists" component={HomeScreen} />
            <RootStack.Screen name="Favorites" component={HomeScreen} />
            <RootStack.Screen name="Downloads" component={HomeScreen} />
            <RootStack.Screen name="Upload" component={UploadScreen} />
            <RootStack.Screen name="EasyUpload" component={EasyUploadScreen} />
            <RootStack.Screen name="RealUpload" component={RealUploadScreen} />
            <RootStack.Screen name="Profile" component={ProfileScreenNew} />
            <RootStack.Screen name="Settings" component={SettingsScreen} />
            <RootStack.Screen name="Admin" component={AdminScreen} />
            <RootStack.Screen name="MusicPlayer" component={MusicPlayerFinal} />
          </RootStack.Navigator>
          
          <GlobalMiniPlayer
            navigation={navigationRef.current}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onClose={stopSong}
            currentRoute={currentRoute}
          />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function App() {
  return (
    <AnimeErrorProvider>
      <MusicProvider>
        <AppContent />
      </MusicProvider>
    </AnimeErrorProvider>
  );
}

export default App;