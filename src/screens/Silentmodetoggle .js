// components/SilentModeToggle.js
import React, { useContext, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../context/AppContext';

const SILENT_MODE_KEY = '@silent_mode_enabled';

/**
 * Silent Mode Toggle Component - SAFE VERSION
 * 
 * Falls back to local state if AppContext doesn't provide toggleSilentMode
 */
export const SilentModeToggle = () => {
  // Try to get from AppContext first
  const context = useContext(AppContext);
  
  // Local fallback state
  const [localSilentMode, setLocalSilentMode] = useState(false);
  
  // Use context value if available, otherwise use local state
  const isSilentMode = context?.isSilentMode ?? localSilentMode;
  const contextToggle = context?.toggleSilentMode;

  const handleToggle = async () => {
    try {
      // If AppContext provides toggleSilentMode, use it
      if (contextToggle && typeof contextToggle === 'function') {
        await contextToggle();
        console.log('[SilentModeToggle] ✅ Using AppContext toggle');
      } else {
        // Otherwise, use local state and AsyncStorage
        console.warn('[SilentModeToggle] ⚠️ AppContext toggle not available, using local state');
        const newValue = !localSilentMode;
        setLocalSilentMode(newValue);
        await AsyncStorage.setItem(SILENT_MODE_KEY, JSON.stringify(newValue));
        
        Alert.alert(
          'Silent Mode',
          `Silent Mode is now ${newValue ? 'ON' : 'OFF'}.\n\nNote: Full integration requires AppContext update.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[SilentModeToggle] Error:', error);
      Alert.alert('Error', 'Failed to toggle Silent Mode');
    }
  };

  return (
    <TouchableOpacity 
      style={styles.quickCard} 
      onPress={handleToggle}
      activeOpacity={0.7}
    >
      <LinearGradient 
        colors={isSilentMode ? ['#8E8E93', '#636366'] : ['#FF2D55', '#FF3B30']} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }} 
        style={styles.quickIcon}
      >
        <MaterialCommunityIcons 
          name={isSilentMode ? 'bell-off' : 'bell-ring'} 
          size={24} 
          color="white" 
        />
        
        {/* Active indicator dot */}
        {isSilentMode && (
          <View style={styles.activeDot} />
        )}
      </LinearGradient>
      
      <View style={styles.labelContainer}>
        <Text style={styles.quickLabel}>
          {isSilentMode ? 'Silent' : 'Alerts'}
        </Text>
        {isSilentMode && (
          <View style={styles.activebadge}>
            <Text style={styles.activeBadgeText}>ON</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  quickCard: { 
    width: 100, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 15, 
    marginRight: 15, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 2 
  },
  quickIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10,
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickLabel: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#3A3A3C' 
  },
  activebadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
});

export default SilentModeToggle;