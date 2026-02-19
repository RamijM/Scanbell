// context/AppContext.js
import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState({
    email: '',
    name: '',
    userType: '',
    propertyType: '',
    callType: 'audio',
    houseNo: '',
    address: ''
  });

  return (
    <AppContext.Provider value={{ userDetails, setUserDetails }}>
      {children}
    </AppContext.Provider>
  );
};