import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useBrowserStore } from '@/store/browserStore';
import { router } from 'expo-router';

export default function TabsScreen() {
  const { tabs, activeTabs, suspendedTabs, closeTab, addTab, restoreTab } = useBrowserStore();

  const handleCreateNewTab = () => {
    addTab('https://www.google.com', 'New Tab');
    router.back();
  };

  const handleCloseTab = (tabId: string) => {
    closeTab(tabId);
  };

  const handleRestoreTab = (tabId: string) => {
    const tab = suspendedTabs.find(t => t.id === tabId);
    if (tab) {
      restoreTab(tabId);
    }
  };

  const handleDeleteSuspendedTab = (tabId: string) => {
    Alert.alert(
      'Delete Tab',
      'Are you sure you want to permanently delete this tab?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          // Implement permanent deletion
        }}
      ]
    );
  };

  return (
    <LinearGradient colors={['#0a0b1e', '#1a1b3a']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="layers-outline" size={24} color="#ffffff" />
            <Text style={styles.headerTitle}>My Tabs</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Create New Tab Button */}
          <TouchableOpacity style={styles.newTabButton} onPress={handleCreateNewTab}>
            <Ionicons name="add" size={24} color="#ffffff" />
            <Text style={styles.newTabText}>Create New Tab</Text>
          </TouchableOpacity>

          {/* Active Tabs */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIndicator} />
              <Text style={styles.sectionTitle}>Active Tabs ({activeTabs.length})</Text>
            </View>

            <View style={styles.tabsGrid}>
              {activeTabs.map((tab) => (
                <View key={tab.id} style={styles.tabCard}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => handleCloseTab(tab.id)}
                  >
                    <Ionicons name="close" size={16} color="#ff4444" />
                  </TouchableOpacity>
                  
                  <View style={styles.tabIcon}>
                    <Ionicons name="globe-outline" size={32} color="#4285f4" />
                  </View>
                  
                  <Text style={styles.tabTitle} numberOfLines={1}>
                    {tab.title}
                  </Text>
                  <Text style={styles.tabUrl} numberOfLines={1}>
                    {tab.url}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Suspended Tabs */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIndicator, { backgroundColor: '#666' }]} />
              <Text style={styles.sectionTitle}>Suspended Tabs ({suspendedTabs.length})</Text>
            </View>

            {suspendedTabs.map((tab) => (
              <View key={tab.id} style={styles.suspendedTabCard}>
                <View style={styles.suspendedTabIcon}>
                  <Ionicons name="globe-outline" size={24} color="#4285f4" />
                </View>
                
                <View style={styles.suspendedTabInfo}>
                  <Text style={styles.suspendedTabTitle} numberOfLines={1}>
                    {tab.title}
                  </Text>
                  <Text style={styles.suspendedTabTime}>Just now</Text>
                </View>

                <View style={styles.suspendedTabActions}>
                  <TouchableOpacity
                    style={styles.restoreButton}
                    onPress={() => handleRestoreTab(tab.id)}
                  >
                    <Ionicons name="reload-outline" size={20} color="#4285f4" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSuspendedTab(tab.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  newTabButton: {
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(66, 133, 244, 0.3)',
  },
  newTabText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4285f4',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  tabsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tabCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    alignItems: 'center',
    marginBottom: 8,
  },
  tabTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  tabUrl: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  suspendedTabCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  suspendedTabIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suspendedTabInfo: {
    flex: 1,
  },
  suspendedTabTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  suspendedTabTime: {
    color: '#666',
    fontSize: 12,
  },
  suspendedTabActions: {
    flexDirection: 'row',
  },
  restoreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});