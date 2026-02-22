import React, { useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppProvider, AppContext } from "./src/context/AppContext";
import SigninScreen from "./src/screens/SignInScreen";
import AddDetails from "./src/screens/AddDetails";
import EmailSignInScreen from './src/screens/EmailSignInScreen';
import HomeScreen from './src/screens/HomeScreen';
import CallScreen from './src/screens/CallScreen';
import VisitorCallScreen from './src/screens/VisitorCallScreen';

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If user has a house number, they are already "onboarded"
  const initialRoute = userDetails?.houseNo ? "Home" : "SignIn";

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SignIn" component={SigninScreen} />
      <Stack.Screen name="EmailSignIn" component={EmailSignInScreen} />
      <Stack.Screen name="AddDetails" component={AddDetails} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Call" component={CallScreen} />
      <Stack.Screen name="VisitorCall" component={VisitorCallScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer linking={linking}>
        <RootStack />
      </NavigationContainer>
    </AppProvider>
  );
}