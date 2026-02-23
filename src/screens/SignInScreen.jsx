import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get("window");

export default function SignInScreen({ navigation }) {
  const [screen, setScreen] = useState("main"); // main | email | static
  const { setUserDetails } = React.useContext(require("../context/AppContext").AppContext);

  /* ================= MOCK LOGIN LOGIC ================= */
  React.useEffect(() => {
    if (screen === "static") {
      const timer = setTimeout(() => {
        setUserDetails({
          email: "mock.user@example.com",
          name: "Alok Maurya",
          userType: "Individual",
          propertyType: "House/Villa",
          callType: "video",
          houseNo: "32",
          address: "123 Smart Street, Tech City"
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  /* ================= STATIC SIGN IN PAGE ================= */
  if (screen === "static") {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <LinearGradient colors={["#007AFF", "#0055BB"]} style={styles.fullGradient}>
          <View style={styles.center}>
            <MaterialCommunityIcons name="account-sync" size={80} color="white" />
            <Text style={styles.staticTitle}>Signing you in...</Text>
            <Text style={styles.staticSub}>Please wait while we secure your connection.</Text>

            <TouchableOpacity
              style={styles.backBtnOutline}
              onPress={() => setScreen("main")}
            >
              <Text style={styles.backBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  /* ================= MAIN SIGN IN PAGE ================= */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* HEADER SECTION WITH LOGO */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#007AFF", "#0055BB"]}
          style={styles.headerGradient}
        >
          <View style={styles.logoCircle}>
            <Image
              source={require("../../assets/door.png")}
              style={styles.doorLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandName}>Scanbell</Text>
          <Text style={styles.brandTagline}>Smart Access. Simplified.</Text>
        </LinearGradient>
      </View>

      {/* CONTENT SECTION */}
      <View style={styles.content}>
        <View style={styles.titleBox}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in or sign up to continue managing your smart bell.</Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => setScreen("static")}
          >
            <View style={[styles.socialIconBox, { backgroundColor: '#F2F2F7' }]}>
              <Image source={require("../../assets/google.png")} style={styles.icon} />
            </View>
            <Text style={styles.buttonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => navigation.navigate("EmailSignIn")}
          >
            <View style={[styles.socialIconBox, { backgroundColor: '#E8F2FF' }]}>
              <MaterialCommunityIcons name="email-outline" size={24} color="#007AFF" />
            </View>
            <Text style={styles.buttonText}>Continue with Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => navigation.navigate("MobileSignIn")}
          >
            <View style={[styles.socialIconBox, { backgroundColor: '#F0FFF4' }]}>
              <MaterialCommunityIcons name="phone-outline" size={24} color="#34C759" />
            </View>
            <Text style={styles.buttonText}>Continue with Mobile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.terms}>
            By continuing, you agree to our{"\n"}
            <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  fullGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* HEADER */
  headerContainer: { height: height * 0.4 },
  headerGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    paddingTop: 40
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    marginBottom: 20
  },
  doorLogo: { width: 70, height: 70, tintColor: "white" },
  brandName: { fontSize: 32, fontWeight: "900", color: "white", letterSpacing: 1 },
  brandTagline: { fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: "600", marginTop: 5 },

  /* CONTENT */
  content: { flex: 1, paddingHorizontal: 30, paddingTop: 40, backgroundColor: 'white' },
  titleBox: { marginBottom: 35 },
  title: { fontSize: 28, fontWeight: "800", color: "#1C1C1E" },
  subtitle: { marginTop: 8, fontSize: 15, color: "#8E8E93", lineHeight: 22 },

  buttonGroup: { width: '100%' },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FB",
    height: 70,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F2F2F7'
  },
  socialIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: { width: 24, height: 24 },
  buttonText: { marginLeft: 15, fontSize: 16, color: "#1C1C1E", fontWeight: "700" },

  footer: { marginTop: 'auto', paddingBottom: 40 },
  terms: { fontSize: 13, color: "#8E8E93", textAlign: "center", lineHeight: 20 },
  linkText: { color: "#007AFF", fontWeight: "700" },

  /* STATIC SCREEN */
  center: { alignItems: "center", padding: 40 },
  staticTitle: { fontSize: 26, fontWeight: "900", color: "white", marginTop: 20 },
  staticSub: { fontSize: 16, color: "rgba(255,255,255,0.8)", textAlign: 'center', marginTop: 10, lineHeight: 24 },
  backBtnOutline: { marginTop: 40, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  backBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
});
