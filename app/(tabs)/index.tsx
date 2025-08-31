import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
  Keyboard,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useBrowserStore } from '@/store/browserStore';
import { CurrencyWidget } from '@/components/CurrencyWidget';
import { QuickAccessGrid } from '@/components/QuickAccessGrid';
import { BottomNavigation } from '@/components/BottomNavigation';
import { MenuModal } from '@/components/MenuModal';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function BrowserScreen() {
  const webViewRef = useRef<WebView>(null);
  const [url, setUrl] = useState('https://www.google.com');
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true);
  const [showFindInPage, setShowFindInPage] = useState(false);
  const [findText, setFindText] = useState('');
  const [findMatches, setFindMatches] = useState({ current: 0, total: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { 
    isAdBlockEnabled, 
    toggleAdBlock,
    addTab,
    darkMode,
    nightMode,
    toggleNightMode,
    desktopMode,
    toggleDesktopMode,
    incognitoMode,
    toggleIncognitoMode,
    addToHistory,
    initialize
  } = useBrowserStore();
  
  // Initialize the browser store on component mount
  useEffect(() => {
    const initializeBrowser = async () => {
      try {
        await initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize browser:', error);
        setIsInitialized(true); // Continue even if initialization fails
      }
    };
    
    initializeBrowser();
  }, [initialize]);
  
  // Handle URL parameter from navigation
  useEffect(() => {
    const handleUrlParam = () => {
      // Check if there's a URL parameter from navigation
      // This would be set when navigating from history/bookmarks
      const params = new URLSearchParams(window.location.search);
      const paramUrl = params.get('url');
      if (paramUrl) {
        setUrl(paramUrl);
        setCurrentUrl(paramUrl);
        setIsHomePage(false);
      }
    };
    
    handleUrlParam();
  }, []);
  
  // Find in page functionality
  const toggleFindInPage = () => {
    setShowFindInPage(!showFindInPage);
    if (showFindInPage) {
      clearFindInPage();
    }
  };
  const clearFindInPage = () => {
    const clearScript = `
      (function() {
        window.getSelection().removeAllRanges();
        window.findInPage = {};
        return true;
      })();
    `;
    
    webViewRef.current?.injectJavaScript(clearScript);
    setFindText('');
    setFindMatches({ current: 0, total: 0 });
  };

  const findInPage = (text) => {
    if (!text) {
      setFindMatches({ current: 0, total: 0 });
      return;
    }
    
    const findScript = `
      (function() {
        try {
          window.findInPage = window.findInPage || {};
          
          // Clear previous highlights
          if (window.getSelection) {
            window.getSelection().removeAllRanges();
          }
          
          const searchText = "${text.replace(/"/g, '\\"').replace(/\\/g, '\\\\')}".toLowerCase();
          
          // Use a more reliable method to count matches
          const bodyText = document.body.innerText || document.body.textContent || '';
          const lowerBodyText = bodyText.toLowerCase();
          
          let count = 0;
          let index = 0;
          
          while ((index = lowerBodyText.indexOf(searchText, index)) !== -1) {
            count++;
            index += searchText.length;
            if (count > 1000) break; // Safety limit
          }
          
          // Try to highlight first match using window.find
          let foundFirst = false;
          if (window.find && count > 0) {
            foundFirst = window.find("${text.replace(/"/g, '\\"')}", false, false, true, false, true, false);
          }
          
          window.findInPage.searchText = searchText;
          window.findInPage.count = count;
          window.findInPage.currentIndex = foundFirst ? 1 : 0;
          window.findInPage.highlights = foundFirst;
          
          return JSON.stringify({
            total: count,
            current: foundFirst ? 1 : 0,
            found: foundFirst
          });
        } catch (error) {
          return JSON.stringify({
            total: 0,
            current: 0,
            found: false,
            error: error.message
          });
        }
      })();
    `;
    
    webViewRef.current?.injectJavaScript(findScript);
    
    // Set a reasonable estimate while waiting for the script result
    setTimeout(() => {
      const estimatedMatches = text.length > 2 ? 1 : 0;
      setFindMatches({ current: estimatedMatches, total: estimatedMatches });
    }, 100);
  };

  const findNext = () => {
    if (!findText || findMatches.total === 0) return;
    
    const nextScript = `
      (function() {
        try {
          if (!window.findInPage || window.findInPage.count === 0) {
            return JSON.stringify({ current: 0, total: 0, found: false });
          }
          
          const searchText = "${findText.replace(/"/g, '\\"').replace(/\\/g, '\\\\')}";
          let found = false;
          
          if (window.find) {
            found = window.find(searchText, false, false, true, false, true, false);
          }
          
          if (found) {
            window.findInPage.currentIndex = (window.findInPage.currentIndex % window.findInPage.count) + 1;
          }
          
          return JSON.stringify({
            current: window.findInPage.currentIndex,
            total: window.findInPage.count,
            found: found
          });
        } catch (error) {
          return JSON.stringify({ current: 0, total: 0, found: false, error: error.message });
        }
      })();
    `;
    
    webViewRef.current?.injectJavaScript(nextScript);
    setFindMatches(prev => ({
      ...prev,
      current: prev.current < prev.total ? prev.current + 1 : 1
    }));
  };

  const findPrevious = () => {
    if (!findText || findMatches.total === 0) return;
    
    const prevScript = `
      (function() {
        try {
          if (!window.findInPage || window.findInPage.count === 0) {
            return JSON.stringify({ current: 0, total: 0, found: false });
          }
          
          const searchText = "${findText.replace(/"/g, '\\"').replace(/\\/g, '\\\\')}";
          let found = false;
          
          if (window.find) {
            found = window.find(searchText, false, true, true, false, true, false);
          }
          
          if (found) {
            window.findInPage.currentIndex = window.findInPage.currentIndex <= 1 ? 
              window.findInPage.count : window.findInPage.currentIndex - 1;
          }
          
          return JSON.stringify({
            current: window.findInPage.currentIndex,
            total: window.findInPage.count,
            found: found
          });
        } catch (error) {
          return JSON.stringify({ current: 0, total: 0, found: false, error: error.message });
        }
      })();
    `;
    
    webViewRef.current?.injectJavaScript(prevScript);
    setFindMatches(prev => ({
      ...prev,
      current: prev.current > 1 ? prev.current - 1 : prev.total
    }));
  };

  const handleSearch = () => {
    if (!url.trim()) return;
    
    let searchUrl = url;
    if (!url.includes('http://') && !url.includes('https://')) {
      if (url.includes('.')) {
        searchUrl = `https://${url}`;
      } else {
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }
    
    setCurrentUrl(searchUrl);
    setIsHomePage(false);
    
    // Add to history
    addToHistory({
      title: url.includes('http') ? url : `Search: ${url}`,
      url: searchUrl,
      favicon: 'search-outline'
    });
  };

  // Handle WebView navigation state changes
  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
    setIsLoading(navState.loading);
    
    // Add to history when page loads successfully
    if (!navState.loading && navState.url && navState.title) {
      addToHistory({
        title: navState.title || navState.url,
        url: navState.url,
        favicon: 'globe-outline'
      });
    }
  };
  
  // Handle download requests
  const handleDownloadRequest = async (event) => {
    const { url: downloadUrl } = event.nativeEvent;
    
    try {
      const DownloadManager = (await import('../utils/downloadManager')).default;
      await DownloadManager.downloadFromWebView(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Download Error', 'Failed to start download');
    }
  };

  const handleNewTab = () => {
    const newTabUrl = 'https://www.google.com';
    addTab(newTabUrl, 'New Tab');
    setCurrentUrl(newTabUrl);
    setIsHomePage(false);
  };

  const goHome = () => {
    setIsHomePage(true);
    setCurrentUrl('');
    setUrl('');
  };

  const goBack = () => {
    webViewRef.current?.goBack();
  };

  const goForward = () => {
    webViewRef.current?.goForward();
  };



  // Night mode CSS injection
  const nightModeCSS = `
    (function() {
      if (window.nightModeApplied) return;
      window.nightModeApplied = true;
      
      const style = document.createElement('style');
      style.id = 'night-mode-filter';
      style.innerHTML = \`
        html { 
          filter: invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.2) !important;
          background: #1a1a1a !important;
        }
        img, video, iframe, svg, [style*="background-image"] {
          filter: invert(1) hue-rotate(180deg) !important;
        }
        [data-theme="dark"], [class*="dark"] {
          filter: invert(1) hue-rotate(180deg) !important;
        }
      \`;
      document.head.appendChild(style);
    })();
  `;

  const removeNightModeCSS = `
    (function() {
      const style = document.getElementById('night-mode-filter');
      if (style) style.remove();
      window.nightModeApplied = false;
    })();
  `;

  // Desktop mode user agent
  const desktopUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  const mobileUserAgent = 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36';

  const openTabs = () => {
    router.push('/(tabs)/tabs');
  };

  // Handle night mode changes dynamically
  useEffect(() => {
    if (webViewRef.current && currentUrl) {
      if (nightMode) {
        webViewRef.current.injectJavaScript(nightModeCSS);
      } else {
        webViewRef.current.injectJavaScript(removeNightModeCSS);
      }
    }
  }, [nightMode]);

  // Handle desktop mode changes by reloading the page
  useEffect(() => {
    if (webViewRef.current && currentUrl) {
      webViewRef.current.reload();
    }
  }, [desktopMode]);



  // Incognito mode colors
  const gradientColors = incognitoMode 
    ? ['#2c2c2c', '#1a1a1a'] 
    : ['#0a0b1e', '#1a1b3a'];
  
  const topBarColor = incognitoMode 
    ? 'rgba(44, 44, 44, 0.9)' 
    : 'rgba(26, 27, 58, 0.9)';

  if (isHomePage) {
    return (
      <LinearGradient colors={gradientColors} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Top Bar */}
          <View style={[styles.topBar, { backgroundColor: topBarColor }]}>
            <TouchableOpacity
              style={styles.topButton}
              onPress={() => webViewRef.current?.reload()}
            >
              <Ionicons 
                name="refresh-outline" 
                size={24} 
                color="#ffffff" 
              />
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <Text style={[styles.logoText, incognitoMode && styles.incognitoText]}>Aura</Text>
              {incognitoMode && (
                <Text style={styles.incognitoLabel}>Incognito</Text>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.topButton}
              onPress={handleNewTab}
            >
              <Ionicons name="add" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Google or type a URL"
                  placeholderTextColor="#888"
                  value={url}
                  onChangeText={setUrl}
                  onSubmitEditing={handleSearch}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Currency Widgets */}
            <CurrencyWidget />

            {/* Quick Access */}
            <QuickAccessGrid onSitePress={(siteUrl) => {
              setCurrentUrl(siteUrl);
              setIsHomePage(false);
            }} />
          </ScrollView>

          {/* Bottom Navigation */}
          <BottomNavigation
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            onBack={goBack}
            onForward={goForward}
            onHome={goHome}
            onTabs={openTabs}
            onMenu={() => setIsMenuVisible(true)}
            isHomePage={isHomePage}
          />
        </SafeAreaView>

        <MenuModal 
        visible={isMenuVisible} 
        onClose={() => setIsMenuVisible(false)}
        currentUrl={currentUrl}
        onFindInPage={toggleFindInPage}
      />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Bar */}
        <View style={[styles.topBar, { backgroundColor: topBarColor }]}>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => webViewRef.current?.reload()}
          >
            <Ionicons 
              name="refresh-outline" 
              size={24} 
              color="#ffffff" 
            />
          </TouchableOpacity>
          
          <View style={styles.urlContainer}>
            <TextInput
              style={styles.urlInput}
              value={currentUrl}
              onChangeText={setUrl}
              onSubmitEditing={handleSearch}
              placeholder="Enter URL"
              placeholderTextColor="#888"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.topButton}
            onPress={handleNewTab}
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <View style={styles.webviewContainer}>
          {/* Find in page bar */}
          {showFindInPage && (
            <View style={styles.findInPageContainer}>
              <TextInput
                style={styles.findInput}
                value={findText}
                onChangeText={(text) => {
                  setFindText(text);
                  if (text) findInPage(text);
                }}
                placeholder="Find in page"
                placeholderTextColor="#999"
                autoFocus
                returnKeyType="search"
                onSubmitEditing={() => findInPage(findText)}
              />
              <Text style={styles.findCounter}>
                {findMatches.total > 0 ? `${findMatches.current}/${findMatches.total}` : 'No matches'}
              </Text>
              <TouchableOpacity onPress={findPrevious} style={styles.findButton}>
                <Ionicons name="chevron-up" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={findNext} style={styles.findButton}>
                <Ionicons name="chevron-down" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleFindInPage} style={styles.findButton}>
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          )}
          
          <WebView
            ref={webViewRef}
            source={{ uri: currentUrl }}
            style={styles.webview}
            onNavigationStateChange={handleNavigationStateChange}
            onFileDownload={handleDownloadRequest}
            onLoadEnd={() => {
              // Inject night mode CSS if enabled
              if (nightMode) {
                webViewRef.current?.injectJavaScript(nightModeCSS);
              } else {
                webViewRef.current?.injectJavaScript(removeNightModeCSS);
              }
              
              // Inject incognito mode warning if enabled
              if (incognitoMode) {
                const incognitoScript = `
                  (function() {
                    // Clear any existing storage
                    try {
                      localStorage.clear();
                      sessionStorage.clear();
                    } catch(e) {}
                    
                    // Override storage methods in incognito
                    const originalSetItem = localStorage.setItem;
                    localStorage.setItem = function() {
                      console.log('Storage disabled in incognito mode');
                    };
                  })();
                `;
                webViewRef.current?.injectJavaScript(incognitoScript);
              }
            }}
            userAgent={desktopMode ? desktopUserAgent : mobileUserAgent}
            javaScriptEnabled={true}
            domStorageEnabled={!incognitoMode}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsBackForwardNavigationGestures={true}
            mixedContentMode="compatibility"
            thirdPartyCookiesEnabled={!incognitoMode}
            cacheEnabled={!incognitoMode}
          />
          

        </View>

        {/* Bottom Navigation */}
        <BottomNavigation
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onBack={goBack}
          onForward={goForward}
          onHome={goHome}
          onTabs={openTabs}
          onMenu={() => setIsMenuVisible(true)}
          isHomePage={false}
        />
      </SafeAreaView>

      <MenuModal
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        currentUrl={currentUrl}
        onFindInPage={toggleFindInPage}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  findInPageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    elevation: 2,
  },
  findInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  findCounter: {
    marginRight: 10,
    fontSize: 14,
    color: '#666',
  },
  findButton: {
    padding: 5,
    marginLeft: 5,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(26, 27, 58, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  incognitoButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  incognitoText: {
    color: '#ff6b6b',
  },
  incognitoLabel: {
    fontSize: 10,
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  urlContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  urlInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    padding: 20,
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
});