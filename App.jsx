import React, { useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppProvider, AppContext } from "./src/context/AppContext";
import SigninScreen from "./src/screens/SignInScreen";
import AddDetails from "./src/screens/AddDetails";
import EmailSignInScreen from './src/screens/EmailSignInScreen';
import MobileSignInScreen from './src/screens/MobileSignInScreen';
import HomeScreen from './src/screens/HomeScreen';
import CallScreen from './src/screens/CallScreen';
import VisitorCallScreen from './src/screens/VisitorCallScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DiscoverScreen from './src/screens/DiscoverScreen';
import AddMemberScreen from './src/screens/AddMemberScreen'; // The page I just gave you
import CallLogsScreen from './src/screens/CallLogsScreen'
import NotificationsScreen from './src/screens/NotificationsScreen'
import IncomingCallOverlay from './src/screens/IncomingCallOverlay';
const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['doorvi://'],
  config: {
    screens: {
      VisitorCall: {
        path: 'call',
        parse: {
          channel: (channel) => channel,
          appId: (appId) => appId,
        },
      },
    },
  },
};

function RootStack() {
  const { userDetails, loading } = useContext(AppContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FB' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const isAuthenticated = !!userDetails?.houseNo;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // AUTHENTICATED STACK (The App)
        <Stack.Group>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Call" component={CallScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Discover" component={DiscoverScreen} />
          <Stack.Screen name="AddMember" component={AddMemberScreen} />
          <Stack.Screen name="CallLogs" component={CallLogsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          {/* Allow visitor calls even when logged in (unlikely but safe) */}
          <Stack.Screen name="VisitorCall" component={VisitorCallScreen} />
        </Stack.Group>
      ) : (
        // UNAUTHENTICATED STACK (Auth Flow)
        <Stack.Group>
          <Stack.Screen name="SignIn" component={SigninScreen} />
          <Stack.Screen name="EmailSignIn" component={EmailSignInScreen} />
          <Stack.Screen name="MobileSignIn" component={MobileSignInScreen} />
          <Stack.Screen name="AddDetails" component={AddDetails} />
          {/* CRITICAL: VisitorCall must be here for deep linking visitors */}
          <Stack.Screen name="VisitorCall" component={VisitorCallScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer linking={linking}>
        <RootStack />
        <IncomingCallOverlay />
      </NavigationContainer>
    </AppProvider>
  );
}