import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {theme} from '../theme';
import {AuthService} from '../services/AuthService';
import {IUser} from '../database/models/User';
import {AnimeButton} from '../components/AnimeButton';
import {RootStackParamList} from '../../App';
import Svg, {Path} from 'react-native-svg';
import {PrinterService} from '../services/PrinterService';
import {InvoiceGenerator} from '../utils/InvoiceGenerator';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const Icon = ({name, size = 24, color}: {name: string; size?: number; color: string}) => {
  const icons: {[key: string]: JSX.Element} = {
    'user': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </Svg>
    ),
    'email': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </Svg>
    ),
    'crown': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 2c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z" />
      </Svg>
    ),
    'logout': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
      </Svg>
    ),
    'printer': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

export const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const authService = AuthService.getInstance();
  const printerService = PrinterService.getInstance();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
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
            try {
              await authService.signOut();
              navigation.reset({
                index: 0,
                routes: [{name: 'Auth'}],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ],
    );
  };

  const handlePrintInvoice = async () => {
    if (isPrinting) return;

    try {
      setIsPrinting(true);

      // Check if printer is connected
      if (!printerService.isConnected()) {
        Alert.alert(
          'Connect Printer',
          'Would you like to connect to the Honeywell dot matrix printer?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Connect',
              onPress: async () => {
                try {
                  const printers = await printerService.discoverPrinters();
                  if (printers.length > 0) {
                    const connected = await printerService.connectToPrinter(printers[0]);
                    if (connected) {
                      Alert.alert('Success', `Connected to ${printers[0].name}`);
                      // Proceed with printing after connection
                      await printUserInvoice();
                    } else {
                      Alert.alert('Error', 'Failed to connect to printer');
                    }
                  } else {
                    Alert.alert('No Printers', 'No Honeywell printers found');
                  }
                } catch (error) {
                  Alert.alert('Error', 'Failed to discover printers');
                } finally {
                  setIsPrinting(false);
                }
              }
            }
          ]
        );
        return;
      }

      await printUserInvoice();
    } catch (error) {
      Alert.alert('Error', 'Failed to print invoice');
      console.error('Print error:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const printUserInvoice = async () => {
    try {
      // Generate dummy invoice for the user
      const invoiceData = InvoiceGenerator.generateDummyInvoice(user);
      
      // Print to Honeywell dot matrix printer
      const result = await printerService.printInvoice(invoiceData);
      
      if (result.success) {
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Print Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate or print invoice');
      console.error('Invoice print error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.notLoggedInContainer}>
        <Icon name="user" size={80} color={theme.colors.text.secondary} />
        <Text style={styles.notLoggedInText}>You are not logged in</Text>
        <AnimeButton
          title="Login to Continue"
          onPress={() => navigation.navigate('Auth')}
          size="large"
        />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={theme.colors.background.gradient}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user.avatar_url ? (
              <Image source={{uri: user.avatar_url}} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="user" size={50} color="white" />
              </View>
            )}
            {user.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Icon name="crown" size={16} color={theme.colors.accent.yellow} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRole}>
            {user.role === 'admin' ? 'Administrator' : 'Music Lover'}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Icon name="email" size={20} color={theme.colors.primary.purple} />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Uploads</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Downloads</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>My Uploads</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Downloaded Songs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Favorite Songs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.printButton]} 
            onPress={handlePrintInvoice}
            disabled={isPrinting}
          >
            <Icon name="printer" size={16} color={theme.colors.primary.purple} />
            <Text style={[styles.actionButtonText, styles.printButtonText]}>
              {isPrinting ? 'Printing...' : 'Print Invoice'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color={theme.colors.status.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: theme.spacing.l,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.text.secondary,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.light,
    padding: theme.spacing.xl,
  },
  notLoggedInText: {
    fontSize: theme.typography.fontSize.large,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.m,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.primary.sakura,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary.purple,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.primary.sakura,
  },
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary.purple,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: theme.typography.fontSize.xlarge,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: theme.spacing.xs,
    textShadowColor: theme.colors.shadow.dark,
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  userRole: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.primary.sakura,
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: theme.spacing.l,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.l,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: theme.typography.fontSize.regular,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.m,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: theme.spacing.l,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.l,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: theme.typography.fontSize.xlarge,
    fontWeight: 'bold',
    color: theme.colors.primary.purple,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.secondary.lavender,
    marginHorizontal: theme.spacing.m,
  },
  actions: {
    paddingHorizontal: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.s,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary.pink,
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.regular,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.l,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: theme.colors.status.error,
  },
  logoutText: {
    fontSize: theme.typography.fontSize.regular,
    color: theme.colors.status.error,
    fontWeight: 'bold',
    marginLeft: theme.spacing.s,
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.m + 2,
    borderLeftColor: theme.colors.accent.blue,
  },
  printButtonText: {
    marginLeft: theme.spacing.s,
    fontWeight: '600',
  },
});