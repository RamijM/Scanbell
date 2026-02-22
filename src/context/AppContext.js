// context/AppContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_DETAILS_KEY = '@user_details';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetailsState] = useState({
    email: '',
    name: '',
    userType: '',
    propertyType: '',
    callType: 'audio',
    houseNo: '',
    address: ''
  });

  // Load details on mount
  useEffect(() => {
    const loadDetails = async () => {
      try {
        const savedData = await AsyncStorage.getItem(USER_DETAILS_KEY);
        if (savedData) {
          setUserDetailsState(JSON.parse(savedData));
        }
      } catch (e) {
        console.log('[AppContext] Load Error:', e);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, []);

  // Custom setter that saves to storage
  const setUserDetails = async (details) => {
    try {
      const newDetails = typeof details === 'function' ? details(userDetails) : details;
      setUserDetailsState(newDetails);
      await AsyncStorage.setItem(USER_DETAILS_KEY, JSON.stringify(newDetails));
    } catch (e) {
      console.log('[AppContext] Save Error:', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_DETAILS_KEY);
      setUserDetailsState({
        email: '',
        name: '',
        userType: '',
        propertyType: '',
        callType: 'audio',
        houseNo: '',
        address: ''
      });
    } catch (e) {
      console.log('[AppContext] Logout Error:', e);
    }
  };

  return (
    <AppContext.Provider value={{ userDetails, setUserDetails, loading, logout }}>
      {children}
    </AppContext.Provider>
  );
};