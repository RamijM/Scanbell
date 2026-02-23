import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  StatusBar,
  Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { AppContext } from "../context/AppContext";

const { width, height } = Dimensions.get("window");

export default function EmailSignInScreen({ navigation }) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { userDetails, setUserDetails } = useContext(AppContext);

  const CORRECT_EMAIL = "alok@gmail.com";
  const CORRECT_PASSWORD = "123456";

  const handleSignIn = () => {
    if (email === CORRECT_EMAIL && password === CORRECT_PASSWORD) {
      setUserDetails({ ...userDetails, email: email });
      console.log("Login Success: Email saved to Context", email);
      navigation.navigate("AddDetails");
    } else {
      setShowModal(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* MODERN HEADER */}
      <LinearGradient
        colors={["#007AFF", "#0055BB"]}
        style={styles.headerGradient}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.titleBox}>
          <Text style={styles.headerTitle}>Email Sign In</Text>
          <Text style={styles.headerSub}>Access your account with your email and password.</Text>
        </View>
      </LinearGradient>

      <View style={styles.formContainer}>
        {/* EMAIL INPUT */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="email-outline" size={20} color="#007AFF" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="example@mail.com"
              placeholderTextColor="#C7C7CD"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* PASSWORD INPUT */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-outline" size={20} color="#007AFF" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#C7C7CD"
              secureTextEntry={!showPassword}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* SIGN IN BUTTON */}
        <TouchableOpacity style={styles.submitBtnOuter} onPress={handleSignIn}>
          <LinearGradient
            colors={["#007AFF", "#0055BB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitBtn}
          >
            <Text style={styles.submitBtnText}>Sign In</Text>
            <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Error Modal */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.errorIconCircle}>
              <Ionicons name="close-circle" size={40} color="#FF3B30" />
            </View>
            <Text style={styles.modalTitle}>Login Failed</Text>
            <Text style={styles.modalText}>Your email or password doesn't match our records.</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowModal(false)}>
              <Text style={styles.modalButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  titleBox: { marginTop: 30 },
  headerTitle: { fontSize: 32, fontWeight: "900", color: "white" },
  headerSub: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginTop: 8, fontWeight: '500', lineHeight: 22 },

  formContainer: { flex: 1, padding: 25, marginTop: 10 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#1C1C1E', marginBottom: 10, marginLeft: 5 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 18,
    paddingHorizontal: 15,
    height: 65,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#1C1C1E', fontWeight: '600' },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 30 },
  forgotText: { color: "#007AFF", fontWeight: "700", fontSize: 14 },

  submitBtnOuter: { shadowColor: '#007AFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  submitBtn: { flexDirection: 'row', height: 65, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: 'white', fontSize: 18, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#FFF", padding: 30, borderRadius: 30, alignItems: "center", width: '85%' },
  errorIconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: "800", color: "#1C1C1E" },
  modalText: { color: '#8E8E93', textAlign: 'center', marginTop: 10, marginBottom: 25, fontSize: 16, lineHeight: 22 },
  modalButton: { backgroundColor: "#007AFF", paddingVertical: 15, paddingHorizontal: 40, borderRadius: 15 },
  modalButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" }
});