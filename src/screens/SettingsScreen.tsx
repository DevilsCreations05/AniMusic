import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, {Path, Circle} from 'react-native-svg';

const {width} = Dimensions.get('window');

const Icon = ({name, size = 24, color = '#000000'}: {name: string; size?: number; color?: string}) => {
  const icons: {[key: string]: JSX.Element} = {
    'back': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </Svg>
    ),
    'music': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </Svg>
    ),
    'storage': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
      </Svg>
    ),
    'theme': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
      </Svg>
    ),
    'about': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
      </Svg>
    ),
    'chevron': (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
      </Svg>
    ),
  };
  
  return icons[name] || null;
};

export const SettingsScreen = ({navigation}: any) => {
  const [autoPlay, setAutoPlay] = useState(false);
  const [continuousPlay, setContinuousPlay] = useState(true);
  const [savePosition, setSavePosition] = useState(true);
  const [showNotification, setShowNotification] = useState(true);
  const [highQuality, setHighQuality] = useState(false);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ],
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightElement,
  }: any) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={22} color="#000000" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement}
      {showArrow && !rightElement && (
        <Icon name="chevron" size={20} color="#999999" />
      )}
    </TouchableOpacity>
  );

  const SettingSwitch = ({
    icon,
    title,
    subtitle,
    value,
    onValueChange,
  }: any) => (
    <SettingItem
      icon={icon}
      title={title}
      subtitle={subtitle}
      rightElement={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{false: '#E0E0E0', true: '#000000'}}
          thumbColor={value ? '#FFFFFF' : '#666666'}
        />
      }
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}>
          <Icon name="back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Playback Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PLAYBACK</Text>
          <View style={styles.sectionContent}>
            <SettingSwitch
              icon="music"
              title="Auto-play"
              subtitle="Start playing automatically"
              value={autoPlay}
              onValueChange={setAutoPlay}
            />
            <SettingSwitch
              icon="music"
              title="Continuous Play"
              subtitle="Play next song automatically"
              value={continuousPlay}
              onValueChange={setContinuousPlay}
            />
            <SettingSwitch
              icon="music"
              title="Save Playback Position"
              subtitle="Resume from last position"
              value={savePosition}
              onValueChange={setSavePosition}
            />
          </View>
        </View>

        {/* Audio Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUDIO</Text>
          <View style={styles.sectionContent}>
            <SettingSwitch
              icon="music"
              title="High Quality Audio"
              subtitle="Use highest quality (uses more battery)"
              value={highQuality}
              onValueChange={setHighQuality}
            />
            <SettingItem
              icon="music"
              title="Equalizer"
              subtitle="Adjust audio frequencies"
              onPress={() => Alert.alert('Equalizer', 'Coming soon!')}
            />
          </View>
        </View>

        {/* Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STORAGE</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="storage"
              title="Music Folders"
              subtitle="Select folders to scan"
              onPress={() => Alert.alert('Music Folders', 'Coming soon!')}
            />
            <SettingItem
              icon="storage"
              title="Clear Cache"
              subtitle="Free up storage space"
              onPress={handleClearCache}
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APPEARANCE</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="theme"
              title="Theme"
              subtitle="Black & White Cartoon"
              onPress={() => Alert.alert('Theme', 'More themes coming soon!')}
            />
            <SettingSwitch
              icon="theme"
              title="Show Notifications"
              subtitle="Display playback notifications"
              value={showNotification}
              onValueChange={setShowNotification}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="about"
              title="Version"
              subtitle="AniMusic 1.0.0"
              showArrow={false}
            />
            <SettingItem
              icon="about"
              title="Developer"
              subtitle="Made with ❤️ for anime fans"
              showArrow={false}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>AniMusic © 2024</Text>
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
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 2,
  },
  headerRight: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#666666',
    letterSpacing: 1,
    marginLeft: 20,
    marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#999999',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
  },
});