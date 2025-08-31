import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useBrowserStore } from '@/store/browserStore';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { 
    darkMode, 
    isAdBlockEnabled, 
    toggleDarkMode, 
    toggleAdBlock,
    incognitoMode,
    toggleIncognitoMode,
    desktopMode,
    toggleDesktopMode
  } = useBrowserStore();

  const handleNavigate = (feature: string) => {
    Alert.alert(feature, `${feature} functionality will be implemented here`);
  };

  const settingsGroups = [
    {
      title: 'Appearance',
      items: [
        {
          icon: 'moon-outline',
          title: 'Dark Mode',
          subtitle: 'Always use dark theme',
          type: 'switch',
          value: darkMode,
          onToggle: toggleDarkMode,
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: 'shield-outline',
          title: 'Ad Blocking',
          subtitle: 'Block ads and trackers',
          type: 'switch',
          value: isAdBlockEnabled,
          onToggle: toggleAdBlock,
        },
        {
          icon: 'eye-off-outline',
          title: 'Incognito Mode',
          subtitle: 'Browse privately',
          type: 'switch',
          value: incognitoMode,
          onToggle: toggleIncognitoMode,
        },
        {
          icon: 'time-outline',
          title: 'History',
          subtitle: 'Manage browsing history',
          type: 'navigate',
          onPress: () => handleNavigate('History'),
        },
      ],
    },
    {
      title: 'Browser Features',
      items: [
        {
          icon: 'search-outline',
          title: 'Find in Page',
          subtitle: 'Search current page',
          type: 'navigate',
          onPress: () => handleNavigate('Find in Page'),
        },
        {
          icon: 'bookmark-outline',
          title: 'Bookmarks',
          subtitle: 'Manage saved sites',
          type: 'navigate',
          onPress: () => handleNavigate('Bookmarks'),
        },
        {
          icon: 'download-outline',
          title: 'Downloads',
          subtitle: 'View downloaded files',
          type: 'navigate',
          onPress: () => handleNavigate('Downloads'),
        },
        {
          icon: 'desktop-outline',
          title: 'Desktop Site',
          subtitle: 'Request desktop version',
          type: 'switch',
          value: desktopMode,
          onToggle: toggleDesktopMode,
        },
        {
          icon: 'share-outline',
          title: 'Share',
          subtitle: 'Share current page',
          type: 'navigate',
          onPress: () => handleNavigate('Share'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: any, index: number) => {
    const isLastItem = index === settingsGroups.flatMap(group => group.items).length - 1;
    
    return (
      <TouchableOpacity 
        key={index} 
        style={[
          styles.settingItem, 
          isLastItem && styles.lastSettingItem,
          item.value && styles.activeSettingItem
        ]}
        onPress={item.type === 'navigate' ? item.onPress : undefined}
        activeOpacity={0.7}
      >
        <View style={[
          styles.settingIcon,
          item.value && styles.activeSettingIcon
        ]}>
          <Ionicons 
            name={item.icon} 
            size={22} 
            color={item.value ? '#4CAF50' : '#4285f4'} 
          />
        </View>
        
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>

        {item.type === 'switch' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#333', true: '#4CAF50' }}
            thumbColor={item.value ? '#ffffff' : '#666'}
            ios_backgroundColor="#333"
          />
        )}

        {item.type === 'navigate' && (
          <Ionicons name="chevron-forward" size={18} color="#aaaaaa" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#0a0b1e', '#1a1b3a']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {settingsGroups.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.settingGroup}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.groupContainer}>
                {group.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
              </View>
            </View>
          ))}

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appName}>Aura Browser</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              A fast, secure, and modern browser for Android
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(10, 11, 30, 0.95)',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingTop: 12,
  },
  settingGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  groupContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  activeSettingItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(66, 133, 244, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activeSettingIcon: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#aaaaaa',
    lineHeight: 16,
  },
  appInfo: {
    alignItems: 'center',
    padding: 32,
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    color: '#aaaaaa',
    textAlign: 'center',
    lineHeight: 20,
  },
});