import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
 
  StatusBar,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen({navigation}) {


  
  
  const [screen, setScreen] = useState("main"); // main | email | static

  

  /* ================= STATIC SIGN IN PAGE ================= */
  if (screen === "static") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.center}>
          <Text style={styles.staticTitle}>Signing you in…</Text>

          <TouchableOpacity onPress={() => setScreen("main")}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ================= EMAIL SIGN IN PAGE ================= */
  if (screen === "email") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.emailContainer}>
          <Text style={styles.title}>Email Sign </Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="email-address"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            style={styles.input}
            secureTextEntry
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSignIn}>
        <Text style={styles.submitText}>Sign In</Text>
      </TouchableOpacity>


          <TouchableOpacity onPress={() => setScreen("main")}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ================= MAIN SIGN IN PAGE ================= */
  return (
    
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER (OVERFLOW ENABLED) */}
      <View style={styles.headerContainer}>
        <View style={styles.curveBg} />

        <View style={styles.logoWrapper}>
          <Image
            source={require("../../assets/door.png")}
            style={styles.door}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.title}>SignIn</Text>
        <Text style={styles.subtitle}>Login or Sign Up with us.</Text>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => setScreen("static")}
        >
          <Image
            source={require("../../assets/google.png")}
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => setScreen("static")}
        >
          <Image
            source={require("../../assets/facebook.png")}
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Sign in with Facebook</Text>
        </TouchableOpacity>

      {/* Inside your Main SignInScreen.jsx */}
<TouchableOpacity
  style={styles.socialButton}
  onPress={() => navigation.navigate("EmailSignIn")} // This triggers the external file
>
  <Image
    source={require("../../assets/email.png")}
    style={styles.icon}
  />
  <Text style={styles.buttonText}>Sign in with Email</Text>
</TouchableOpacity>

        <View style={styles.orRow}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={styles.mobileButton}
          onPress={() => setScreen("static")}
        >
          <Text style={styles.mobileText}>Sign in with Mobile No.</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* HEADER */
  headerContainer: {
    height: 260,
    position: "relative",
  },

  curveBg: {
    position: "absolute",
    top: -140,
    left: -40,
    right: -40,
    height: 420,
    backgroundColor: "#1A73E8",
    borderRadius: 320,
  },

  logoWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  door: {
    width: 200,
    height: 200,
    tintColor: "#FFFFFF",
  },

  /* CONTENT */
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#777",
    marginBottom: 24,
  },

  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF1FF",
    height: 56,
    borderRadius: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
  },

  icon: {
    width: 22,
    height: 22,
    marginRight: 14,
  },

  buttonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },

  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },

  orText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: "#B0B0B0",
    fontWeight: "600",
  },

  mobileButton: {
    backgroundColor: "#EAF1FF",
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  mobileText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },

  terms: {
    marginTop: 24,
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },

  /* EMAIL PAGE */
  emailContainer: {
    paddingHorizontal: 24,
    paddingTop: 100,
  },

  input: {
    height: 56,
    borderRadius: 14,
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 16,
    marginTop: 16,
    fontSize: 16,
  },

  submitButton: {
    height: 56,
    backgroundColor: "#1A73E8",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  submitText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  back: {
    textAlign: "center",
    marginTop: 24,
    color: "#1A73E8",
    fontSize: 16,
  },

  /* STATIC */
  center: {
    flex: 1,
    justifyContent: "center",
  },

  staticTitle: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
  },
});

