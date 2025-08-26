import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';

const {width, height} = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

interface CartoonSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: any;
  currentRoute: string;
}

const MenuIcon = ({name, size = 24, color = '#FFFFFF'}: {name: string; size?: number; color?: string}) => {
  const icons: {[key: string]: JSX.Element} = {
    'home': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </Svg>
    ),
    'music': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </Svg>
    ),
    'playlist': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
      </Svg>
    ),
    'heart': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </Svg>
    ),
    'download': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
      </Svg>
    ),
    'upload': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
      </Svg>
    ),
    'settings': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </Svg>
    ),
    'profile': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

export const CartoonSidebar: React.FC<CartoonSidebarProps> = ({
  isOpen,
  onClose,
  navigation,
  currentRoute,
}) => {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnims = useRef(
    Array(9).fill(0).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (isOpen) {
      // Slide in sidebar
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Stagger bounce animations for menu items
      bounceAnims.forEach((anim, index) => {
        Animated.sequence([
          Animated.delay(index * 50),
          Animated.spring(anim, {
            toValue: 1,
            tension: 100,
            friction: 6,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Slide out sidebar
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Reset bounce animations
      bounceAnims.forEach(anim => {
        anim.setValue(0);
      });
    }
  }, [isOpen]);

  const menuItems = [
    {icon: 'home', label: 'HOME', route: 'Home'},
    {icon: 'music', label: 'BROWSE', route: 'Browse'},
    {icon: 'download', label: 'LOCAL SONGS', route: 'LocalSongs'},
    {icon: 'playlist', label: 'PLAYLISTS', route: 'Playlists'},
    {icon: 'heart', label: 'FAVORITES', route: 'Favorites'},
    {icon: 'download', label: 'DOWNLOADS', route: 'Downloads'},
    {icon: 'upload', label: 'UPLOAD', route: 'Upload'},
    {icon: 'profile', label: 'PROFILE', route: 'Profile'},
    {icon: 'settings', label: 'SETTINGS', route: 'Settings'},
  ];

  const handleNavigate = (route: string) => {
    navigation.navigate(route);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{translateX: slideAnim}],
          },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>AniMusic</Text>
          </View>
          <View style={styles.userBubble}>
            <Text style={styles.userText}>GUEST</Text>
          </View>
        </View>

        {/* Menu Items */}
        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          {menuItems.map((item, index) => (
            <Animated.View
              key={item.route}
              style={[
                {
                  opacity: bounceAnims[index],
                  transform: [
                    {
                      translateX: bounceAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      }),
                    },
                    {
                      scale: bounceAnims[index].interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.8, 1.1, 1],
                      }),
                    },
                  ],
                },
              ]}>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  currentRoute === item.route && styles.activeMenuItem,
                ]}
                onPress={() => handleNavigate(item.route)}
                activeOpacity={0.7}>
                <View style={styles.menuIconBox}>
                  <MenuIcon
                    name={item.icon}
                    size={24}
                    color={currentRoute === item.route ? '#000000' : '#FFFFFF'}
                  />
                </View>
                <Text
                  style={[
                    styles.menuLabel,
                    currentRoute === item.route && styles.activeMenuLabel,
                  ]}>
                  {item.label}
                </Text>
                {currentRoute === item.route && (
                  <View style={styles.activeBubble} />
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerBubble}>
            <Text style={styles.footerText}>v1.0.0</Text>
          </View>
        </View>

        {/* Decorative bubbles */}
        <View style={styles.bubble1} />
        <View style={styles.bubble2} />
        <View style={styles.bubble3} />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#000000',
    borderRightWidth: 4,
    borderRightColor: '#FFFFFF',
    zIndex: 999,
  },
  header: {
    padding: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#FFFFFF',
  },
  logoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  userBubble: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  userText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 6,
    position: 'relative',
  },
  activeMenuItem: {
    backgroundColor: '#FFFFFF',
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    flex: 1,
  },
  activeMenuLabel: {
    color: '#000000',
  },
  activeBubble: {
    position: 'absolute',
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  footer: {
    padding: 20,
    borderTopWidth: 3,
    borderTopColor: '#FFFFFF',
    alignItems: 'center',
  },
  footerBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  bubble1: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bubble2: {
    position: 'absolute',
    bottom: 150,
    left: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  bubble3: {
    position: 'absolute',
    top: height / 2,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});