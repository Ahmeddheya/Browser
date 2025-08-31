import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StorageManager } from '../utils/storage';

interface Site {
  name: string;
  url: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isCustom?: boolean;
}

interface QuickAccessGridProps {
  onSitePress: (url: string) => void;
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({ onSitePress }) => {
  const [sites, setSites] = React.useState<Site[]>([
    { name: 'GitHub', url: 'https://github.com', icon: 'logo-github', color: '#333' },
    { name: 'Telegram', url: 'https://web.telegram.org', icon: 'paper-plane', color: '#0088cc' },
    { name: 'WhatsApp', url: 'https://web.whatsapp.com', icon: 'logo-whatsapp', color: '#25d366' },
    { name: 'Instagram', url: 'https://instagram.com', icon: 'logo-instagram', color: '#e4405f' },
    { name: 'X', url: 'https://x.com', icon: 'logo-twitter', color: '#1da1f2' },
    { name: 'Facebook', url: 'https://facebook.com', icon: 'logo-facebook', color: '#1877f2' },
    { name: 'YouTube', url: 'https://youtube.com', icon: 'logo-youtube', color: '#ff0000' },
    { name: 'Google', url: 'https://google.com', icon: 'search', color: '#4285f4' },
  ]);
  
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newSite, setNewSite] = React.useState({
    name: '',
    url: '',
  });

  React.useEffect(() => {
    loadCustomSites();
  }, []);

  const loadCustomSites = async () => {
    try {
      const customSites = await StorageManager.getItem<Site[]>('custom_sites', []);
      setSites(prev => [...prev.filter(s => !s.isCustom), ...customSites]);
    } catch (error) {
      console.error('Failed to load custom sites:', error);
    }
  };

  const handleAddSite = async () => {
    if (!newSite.name.trim() || !newSite.url.trim()) {
      Alert.alert('Error', 'Please enter both name and URL');
      return;
    }

    // Validate URL
    let url = newSite.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    try {
      new URL(url); // Validate URL format
    } catch {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    const customSite: Site = {
      name: newSite.name,
      url,
      icon: 'globe-outline',
      color: '#4285f4',
      isCustom: true,
    };

    try {
      const customSites = await StorageManager.getItem<Site[]>('custom_sites', []);
      const updatedCustomSites = [...customSites, customSite];
      await StorageManager.setItem('custom_sites', updatedCustomSites);
      
      setSites(prev => [...prev, customSite]);
      setNewSite({ name: '', url: '' });
      setShowAddModal(false);
      Alert.alert('Success', 'Site added to quick access');
    } catch (error) {
      Alert.alert('Error', 'Failed to save custom site');
    }
  };

  const handleRemoveSite = (site: Site) => {
    if (!site.isCustom) return;

    Alert.alert(
      'Remove Site',
      `Remove ${site.name} from quick access?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const customSites = await StorageManager.getItem<Site[]>('custom_sites', []);
              const filtered = customSites.filter(s => s.url !== site.url);
              await StorageManager.setItem('custom_sites', filtered);
              
              setSites(prev => prev.filter(s => s.url !== site.url));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove site');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Add Site Button */}
      <TouchableOpacity style={styles.addSiteButton} onPress={() => setShowAddModal(true)}>
        <View style={styles.addSiteIcon}>
          <Ionicons name="add" size={24} color="#4285f4" />
        </View>
        <View style={styles.addSiteContent}>
          <Text style={styles.addSiteTitle}>Add site</Text>
          <Text style={styles.addSiteSubtitle}>Add your favorite websites to quick access</Text>
        </View>
      </TouchableOpacity>

      {/* Sites Grid */}
      <View style={styles.sitesGrid}>
        {sites.map((site, index) => (
          <TouchableOpacity
            key={index}
            style={styles.siteCard}
            onPress={() => onSitePress(site.url)}
            onLongPress={() => handleRemoveSite(site)}
          >
            <View style={[styles.siteIcon, { backgroundColor: `${site.color}20` }]}>
              <Ionicons name={site.icon} size={24} color={site.color} />
            </View>
            <Text style={styles.siteName}>{site.name}</Text>
            {site.isCustom && (
              <View style={styles.customBadge}>
                <Ionicons name="star" size={12} color="#4CAF50" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Site Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Website</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <TextInput
                style={styles.modalInput}
                value={newSite.name}
                onChangeText={(text) => setNewSite(prev => ({ ...prev, name: text }))}
                placeholder="Site Name (e.g., Reddit)"
                placeholderTextColor="#888"
                autoCapitalize="words"
              />

              <TextInput
                style={styles.modalInput}
                value={newSite.url}
                onChangeText={(text) => setNewSite(prev => ({ ...prev, url: text }))}
                placeholder="URL (e.g., reddit.com)"
                placeholderTextColor="#888"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddSite}
              >
                <Text style={styles.addButtonText}>Add to Quick Access</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  addSiteButton: {
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(66, 133, 244, 0.2)',
  },
  addSiteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addSiteContent: {
    flex: 1,
  },
  addSiteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  addSiteSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  sitesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  siteCard: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  siteIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  siteName: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '500',
  },
  customBadge: {
    position: 'absolute',
    top: -2,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1b3a',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalContent: {
    padding: 20,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#4285f4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});