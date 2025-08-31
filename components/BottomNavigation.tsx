import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BottomNavigationProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onHome: () => void;
  onTabs: () => void;
  onMenu: () => void;
  onFind?: () => void;
  isHomePage: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onHome,
  onTabs,
  onMenu,
  onFind,
  isHomePage,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.navButton, !canGoBack && !isHomePage && styles.disabledButton]}
        onPress={onBack}
        disabled={!canGoBack && !isHomePage}
      >
        <Ionicons 
          name="chevron-back" 
          size={24} 
          color={canGoBack || isHomePage ? '#ffffff' : '#666'} 
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navButton, !canGoForward && styles.disabledButton]}
        onPress={onForward}
        disabled={!canGoForward}
      >
        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color={canGoForward ? '#ffffff' : '#666'} 
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navButton, isHomePage && styles.activeButton]}
        onPress={onHome}
      >
        <Ionicons 
          name="home" 
          size={24} 
          color={isHomePage ? '#4285f4' : '#ffffff'} 
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={onTabs}>
        <Ionicons name="copy-outline" size={24} color="#ffffff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={onMenu}>
        <Ionicons name="menu" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 27, 58, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeButton: {
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
  },
});