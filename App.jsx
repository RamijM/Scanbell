import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppProvider } from "./src/context/AppContext";
import SigninScreen from "./src/screens/SignInScreen";
import AddDetails from "./src/screens/AddDetails";
import EmailSignInScreen from './src/screens/EmailSignInScreen';
import HomeScreen from './src/screens/HomeScreen'
import CallScreen from './src/screens/CallScreen'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    /* ✅ WRAP EVERYTHING HERE */
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignIn" component={SigninScreen} />
          
          {/* Note: In your SignInScreen.jsx, ensure you navigate to "EmailSignIn" */}
          <Stack.Screen name="EmailSignIn" component={EmailSignInScreen} />
          
          <Stack.Screen name="AddDetails" component={AddDetails} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen 
                name="Call" 
                component={CallScreen} 
                options={{ headerShown: false }} // Hides header for full-screen video
              />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}