import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get("window");

export default function MobileSignInScreen({ navigation }) {
  const { setUserDetails } = React.useContext(require("../context/AppContext").AppContext);

  const handleVerify = () => {
    // Mock user login via Mobile
    setUserDetails({
      email: "mobile.user@example.com",
      name: "Alok Maurya",
      userType: "Individual",
      propertyType: "House/Villa",
      callType: "video",
      houseNo: "32", // This triggers navigation to Home via App.jsx
      address: "456 Mobile Ave, Tech City"
    });
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
          <Text style={styles.headerTitle}>Mobile Sign In</Text>
          <Text style={styles.headerSub}>Verify your identity using OTP sent to your phone.</Text>
        </View>
      </LinearGradient>

      <View style={styles.formContainer}>
        {/* MOBILE INPUT */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="phone-outline" size={20} color="#34C759" />
            <TextInput
              value={mobile}
              onChangeText={setMobile}
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* OTP INPUT */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Enter OTP</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color="#007AFF" />
            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#C7C7CD"
              style={styles.input}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
          <TouchableOpacity style={styles.resendBtn}>
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
        </View>

        {/* VERIFY BUTTON */}
        <TouchableOpacity style={styles.submitBtnOuter} onPress={handleVerify}>
          <LinearGradient
            colors={["#34C759", "#28A745"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitBtn}
          >
            <Text style={styles.submitBtnText}>Verify OTP</Text>
            <Ionicons name="checkmark-circle-outline" size={24} color="white" style={{ marginLeft: 10 }} />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Technical issues? <Text style={styles.linkText}>Get Help</Text>
        </Text>
      </View>
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
  inputGroup: { marginBottom: 25 },
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
  input: { flex: 1, marginLeft: 12, fontSize: 18, color: '#1C1C1E', fontWeight: '700', letterSpacing: 1 },

  resendBtn: { alignSelf: 'flex-end', marginTop: 10 },
  resendText: { color: "#007AFF", fontWeight: "700", fontSize: 13 },

  submitBtnOuter: { marginTop: 20, shadowColor: '#34C759', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
  submitBtn: { flexDirection: 'row', height: 65, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: 'white', fontSize: 18, fontWeight: '800' },

  helpText: { textAlign: 'center', marginTop: 30, fontSize: 14, color: '#8E8E93' },
  linkText: { color: '#007AFF', fontWeight: '700' }
});
