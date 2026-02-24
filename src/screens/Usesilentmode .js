// hooks/useSilentMode.js
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SILENT_MODE_KEY = '@silent_mode_enabled';

/**
 * Custom hook for managing global Silent Mode state
 * 
 * Silent Mode mutes:
 * - Doorbell ringtone sound
 * - Phone vibration
 * - Auto-mutes microphone when calls are accepted
 * 
 * State persists across app restarts via AsyncStorage
 */
export const useSilentMode = () => {
  const [isSilentMode, setIsSilentMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ── Load Silent Mode state from AsyncStorage on mount ──
  useEffect(() => {
    const loadSilentMode = async () => {
      try {
        const stored = await AsyncStorage.getItem(SILENT_MODE_KEY);
        if (stored !== null) {
          setIsSilentMode(JSON.parse(stored));
        }
      } catch (error) {
        console.error('[useSilentMode] Load error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSilentMode();
  }, []);

  // ── Toggle Silent Mode and persist to AsyncStorage ──
  const toggleSilentMode = useCallback(async () => {
    try {
      const newValue = !isSilentMode;
      setIsSilentMode(newValue);
      await AsyncStorage.setItem(SILENT_MODE_KEY, JSON.stringify(newValue));
      console.log('[useSilentMode] Silent Mode:', newValue ? 'ON' : 'OFF');
      return newValue;
    } catch (error) {
      console.error('[useSilentMode] Toggle error:', error);
      return isSilentMode; // Return current state if save fails
    }
  }, [isSilentMode]);

  // ── Manually set Silent Mode state (for programmatic control) ──
  const setSilentMode = useCallback(async (value) => {
    try {
      setIsSilentMode(value);
      await AsyncStorage.setItem(SILENT_MODE_KEY, JSON.stringify(value));
      console.log('[useSilentMode] Silent Mode set to:', value ? 'ON' : 'OFF');
    } catch (error) {
      console.error('[useSilentMode] Set error:', error);
    }
  }, []);

  return {
    isSilentMode,
    toggleSilentMode,
    setSilentMode,
    isLoading,
  };
};

export default useSilentMode;