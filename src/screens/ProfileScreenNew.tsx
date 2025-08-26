import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {AuthService} from '../services/AuthService';
import {IUser} from '../database/models/User';
import Svg, {Path, Circle} from 'react-native-svg';

const {width} = Dimensions.get('window');

const Icon = ({name, size = 24, color = '#000000'}: {name: string; size?: number; color?: string}) => {
  const icons: {[key: string]: JSX.Element} = {
    'back': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </Svg>
    ),
    'user': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </Svg>
    ),
    'music': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </Svg>
    ),
    'heart': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </Svg>
    ),
    'settings': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
      </Svg>
    ),
    'logout': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
      </Svg>
    ),
    'edit': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
      </Svg>
    ),
    'upload': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

export const ProfileScreenNew = ({navigation}: any) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [stats, setStats] = useState({
    songsPlayed: 42,
    favoriteSongs: 12,
    playTime: '24h 35m',
    playlists: 5,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const authService = AuthService.getInstance();
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const authService = AuthService.getInstance();
            await authService.signOut();
            // Don't navigate to login, just refresh as guest
            await authService.createGuestUser();
            loadUserData();
          },
        },
      ],
    );
  };

  const StatCard = ({icon, value, label}: any) => (
    <View style={styles.statCard}>
      <Icon name={icon} size={20} color="#000000" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const MenuOption = ({icon, title, onPress, showBadge = false}: any) => (
    <TouchableOpacity style={styles.menuOption} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <Icon name={icon} size={22} color="#000000" />
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
      {showBadge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NEW</Text>
        </View>
      )}
      <Icon name="back" size={20} color="#999999" style={{transform: [{rotate: '180deg'}]}} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#000000', '#333333']}
        style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}>
          <Icon name="back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE</Text>
        <TouchableOpacity style={styles.editButton}>
          <Icon name="edit" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#E0E0E0']}
              style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </Text>
            </LinearGradient>
            {user?.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminText}>ADMIN</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.username}>{user?.username || 'Guest User'}</Text>
          <Text style={styles.email}>{user?.email || 'guest@animusic.com'}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard icon="music" value={stats.songsPlayed} label="Songs Played" />
          <StatCard icon="heart" value={stats.favoriteSongs} label="Favorites" />
          <StatCard icon="music" value={stats.playTime} label="Play Time" />
          <StatCard icon="music" value={stats.playlists} label="Playlists" />
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <MenuOption
            icon="heart"
            title="Favorite Songs"
            onPress={() => Alert.alert('Favorites', 'Coming soon!')}
          />
          <MenuOption
            icon="music"
            title="My Playlists"
            onPress={() => Alert.alert('Playlists', 'Coming soon!')}
            showBadge={true}
          />
          <MenuOption
            icon="music"
            title="Recently Played"
            onPress={() => Alert.alert('Recent', 'Coming soon!')}
          />
          <MenuOption
            icon="upload"
            title="Upload MP3 File"
            onPress={() => navigation.navigate('RealUpload')}
            showBadge={true}
          />
          <MenuOption
            icon="settings"
            title="Settings"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#FF4444" />
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>AniMusic Profile</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#000000',
  },
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000000',
  },
  adminText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
  },
  username: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#666666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  menuSection: {
    paddingVertical: 10,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  badge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF4444',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF4444',
    marginLeft: 10,
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
  },
  versionText: {
    fontSize: 10,
    color: '#CCCCCC',
    marginTop: 5,
  },
});