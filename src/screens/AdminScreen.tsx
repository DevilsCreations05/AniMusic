import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../theme';
import {AuthService} from '../services/AuthService';
import {SongModel, ISong} from '../database/models/Song';
import {AnimeButton} from '../components/AnimeButton';
import Svg, {Path} from 'react-native-svg';

const Icon = ({name, size = 24, color}: {name: string; size?: number; color: string}) => {
  const icons: {[key: string]: JSX.Element} = {
    'check': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </Svg>
    ),
    'close': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </Svg>
    ),
    'music': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

export const AdminScreen = () => {
  const [pendingSongs, setPendingSongs] = useState<ISong[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const authService = AuthService.getInstance();
  const songModel = new SongModel();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser && currentUser.role === 'admin') {
        setUser(currentUser);
        await loadPendingSongs();
      } else {
        Alert.alert('Access Denied', 'Only administrators can access this screen');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingSongs = async () => {
    try {
      const songs = await songModel.findPending();
      setPendingSongs(songs);
    } catch (error) {
      console.error('Error loading pending songs:', error);
      Alert.alert('Error', 'Failed to load pending songs');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPendingSongs();
    setRefreshing(false);
  };

  const handleApprove = async (songId: number) => {
    Alert.alert(
      'Approve Song',
      'Are you sure you want to approve this song?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await songModel.updateStatus(songId, 'approved');
              Alert.alert('Success', 'Song approved successfully');
              await loadPendingSongs();
            } catch (error) {
              Alert.alert('Error', 'Failed to approve song');
            }
          },
        },
      ],
    );
  };

  const handleReject = async (songId: number) => {
    Alert.alert(
      'Reject Song',
      'Are you sure you want to reject this song?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await songModel.updateStatus(songId, 'rejected');
              Alert.alert('Success', 'Song rejected');
              await loadPendingSongs();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject song');
            }
          },
        },
      ],
    );
  };

  const renderSongItem = ({item}: {item: ISong}) => (
    <View style={styles.songCard}>
      <View style={styles.songIcon}>
        <Icon name="music" size={30} color={theme.colors.primary.purple} />
      </View>
      <View style={styles.songInfo}>
        <Text style={styles.songName}>{item.name}</Text>
        <Text style={styles.songArtist}>Artist: {item.artist}</Text>
        {item.movie && <Text style={styles.songMovie}>Movie: {item.movie}</Text>}
        <Text style={styles.uploadedBy}>Uploaded by: {item.uploader_name}</Text>
        <Text style={styles.uploadDate}>
          {new Date(item.created_at!).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApprove(item.id!)}>
          <Icon name="check" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item.id!)}>
          <Icon name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading admin panel...</Text>
      </View>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Access Denied</Text>
        <Text style={styles.errorSubtext}>Admin privileges required</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={theme.colors.background.gradient}
      style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>Manage Song Approvals</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingSongs.length}</Text>
          <Text style={styles.statLabel}>Pending Songs</Text>
        </View>
      </View>

      {pendingSongs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending songs</Text>
          <Text style={styles.emptySubtext}>All songs have been reviewed</Text>
        </View>
      ) : (
        <FlatList
          data={pendingSongs}
          renderItem={renderSongItem}
          keyExtractor={(item) => item.id?.toString() || ''}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary.purple]}
            />
          }
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.text.secondary,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xlarge,
    fontWeight: 'bold',
    color: theme.colors.status.error,
    marginBottom: theme.spacing.s,
  },
  errorSubtext: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.secondary,
  },
  header: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.l,
    paddingHorizontal: theme.spacing.l,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xxlarge,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: theme.colors.shadow.dark,
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 5,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.primary.sakura,
    marginTop: theme.spacing.xs,
  },
  statsContainer: {
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.l,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  statNumber: {
    fontSize: theme.typography.fontSize.xxlarge,
    fontWeight: 'bold',
    color: theme.colors.primary.purple,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xlarge,
    color: 'white',
    marginBottom: theme.spacing.s,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.primary.sakura,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: theme.spacing.l,
    paddingBottom: theme.spacing.xl,
  },
  songCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  songIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.secondary.lavender + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    fontSize: theme.typography.fontSize.regular,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  songArtist: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
  },
  songMovie: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  uploadedBy: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.primary.purple,
    marginTop: 4,
  },
  uploadDate: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.s,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  approveButton: {
    backgroundColor: theme.colors.status.success,
  },
  rejectButton: {
    backgroundColor: theme.colors.status.error,
  },
});