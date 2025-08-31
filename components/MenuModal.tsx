import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Share,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useBrowserStore } from '@/store/browserStore';
import { router } from 'expo-router';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  currentUrl?: string;
  onFindInPage?: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({ visible, onClose, currentUrl = 'https://google.com', onFindInPage }) => {
  const [showFindInPage, setShowFindInPage] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const { 
    nightMode, 
    toggleNightMode, 
    incognitoMode, 
    toggleIncognitoMode,
    desktopMode,
    toggleDesktopMode 
  } = useBrowserStore();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this page: ${currentUrl}`,
        url: currentUrl,
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while sharing');
    }
  };

  // Consolidated navigation handler
  const navigateTo = (destination: string) => {
    onClose();
    
    switch (destination) {
      case 'Settings':
        router.push('/(tabs)/settings');
        break;
      case 'History':
        router.push('/(tabs)/history');
        break;
      case 'Downloads':
        router.push('/(tabs)/downloads');
        break;
      case 'Bookmarks':
        router.push('/(tabs)/bookmarks');
        break;
      default:
        console.log(`Navigation to ${destination} not implemented`);
        break;
    }
  };

  const handleFindInPage = () => {
    onClose();
    if (onFindInPage) {
      onFindInPage();
    }
  };

  // Organize menu items to match settings categories
  const menuSections = [
    {
      title: 'Appearance & Controls',
      items: [
        { icon: 'moon-outline', title: 'Night mode', active: nightMode, onPress: toggleNightMode },
        { icon: 'desktop-outline', title: 'Desktop site', active: desktopMode, onPress: toggleDesktopMode },
        { icon: 'settings-outline', title: 'Settings', active: false, onPress: () => navigateTo('Settings') },
      ]
    },
    {
      title: 'Privacy & Content',
      items: [
        { icon: 'eye-off-outline', title: 'Incognito mode', active: incognitoMode, onPress: toggleIncognitoMode },
        { icon: 'search-outline', title: 'Find in page', active: showFindInPage, onPress: handleFindInPage },
        { icon: 'share-outline', title: 'Share', active: false, onPress: handleShare },
      ]
    },
    {
      title: 'History & Storage',
      items: [
        { icon: 'time-outline', title: 'History', active: false, onPress: () => navigateTo('History') },
        { icon: 'bookmark-outline', title: 'Bookmarks', active: false, onPress: () => navigateTo('Bookmarks') },
        { icon: 'download-outline', title: 'Downloads', active: false, onPress: () => navigateTo('Downloads') },
      ]
    }
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <LinearGradient colors={['#0a0b1e', '#1a1b3a']} style={styles.modalContainer}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Browser Menu</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Menu Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {menuSections.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.menuSection}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <View style={styles.menuGrid}>
                    {section.items.map((item, itemIndex) => (
                      <TouchableOpacity
                        key={itemIndex}
                        style={[styles.menuItem, item.active && styles.activeMenuItem]}
                        onPress={item.onPress}
                      >
                        <View style={styles.menuIcon}>
                          <Ionicons 
                            name={item.icon} 
                            size={20} 
                            color={item.active ? '#4CAF50' : '#ffffff'} 
                          />
                        </View>
                        <Text style={[styles.menuText, item.active && styles.activeMenuText]}>
                          {item.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Page Indicators */}
            <View style={styles.pageIndicators}>
              {Array(menuSections.length).fill(0).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.pageIndicator,
                    index === 0 && styles.activePageIndicator
                  ]}
                />
              ))}
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContainer: {
    flex: 1,
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 12,
    paddingLeft: 4,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeMenuItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  menuIcon: {
    marginBottom: 8,
  },
  menuText: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '500',
  },
  activeMenuText: {
    color: '#4CAF50',
  },
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  pageIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 3,
  },
  activePageIndicator: {
    backgroundColor: '#4285f4',
  },
});