import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Site {
  name: string;
  url: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface QuickAccessGridProps {
  onSitePress: (url: string) => void;
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({ onSitePress }) => {
  const defaultSites: Site[] = [
    { name: 'GitHub', url: 'https://github.com', icon: 'logo-github', color: '#333' },
    { name: 'Telegram', url: 'https://web.telegram.org', icon: 'paper-plane', color: '#0088cc' },
    { name: 'WhatsApp', url: 'https://web.whatsapp.com', icon: 'logo-whatsapp', color: '#25d366' },
    { name: 'Instagram', url: 'https://instagram.com', icon: 'logo-instagram', color: '#e4405f' },
    { name: 'X', url: 'https://x.com', icon: 'logo-twitter', color: '#1da1f2' },
    { name: 'Facebook', url: 'https://facebook.com', icon: 'logo-facebook', color: '#1877f2' },
    { name: 'YouTube', url: 'https://youtube.com', icon: 'logo-youtube', color: '#ff0000' },
    { name: 'Google', url: 'https://google.com', icon: 'search', color: '#4285f4' },
  ];

  return (
    <View style={styles.container}>
      {/* Add Site Button */}
      <TouchableOpacity style={styles.addSiteButton}>
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
        {defaultSites.map((site, index) => (
          <TouchableOpacity
            key={index}
            style={styles.siteCard}
            onPress={() => onSitePress(site.url)}
          >
            <View style={[styles.siteIcon, { backgroundColor: `${site.color}20` }]}>
              <Ionicons name={site.icon} size={24} color={site.color} />
            </View>
            <Text style={styles.siteName}>{site.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
});