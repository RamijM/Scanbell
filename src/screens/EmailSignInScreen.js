import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppContext } from "../context/AppContext";

export default function EmailSignInScreen({ navigation }) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { userDetails, setUserDetails } = useContext(AppContext);
  
  const CORRECT_EMAIL = "alok@gmail.com";
  const CORRECT_PASSWORD = "123456";

  const handleSignIn = () => {
    // Compare input values with correct credentials
    if (email === CORRECT_EMAIL && password === CORRECT_PASSWORD) {
      // Save the email to Context before navigating
      setUserDetails({ 
        ...userDetails, 
        email: email 
      });
      
      console.log("Login Success: Email saved to Context", email);
      navigation.navigate("AddDetails"); 
    } else {
      setShowModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Email Sign In</Text>
      
      <Text style={styles.label}>Email</Text>
      <TextInput 
        value={email} 
        onChangeText={setEmail}
        placeholder="Enter your email"
        placeholderTextColor="#999"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <Text style={styles.label}>Password</Text>
      <TextInput 
        value={password} 
        onChangeText={setPassword}
        placeholder="Enter your password"
        placeholderTextColor="#999"
        secureTextEntry 
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      {/* Error Modal */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sign In Failed</Text>
            <Text style={styles.modalText}>Invalid email or password</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowModal(false)}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 24, 
    paddingTop: 60, 
    backgroundColor: "#FFF" 
  },
  title: { 
    fontSize: 26, 
    fontWeight: "700", 
    marginBottom: 32,
    textAlign: "center"
  },
  label: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 8, 
    fontWeight: "600"
  },
  input: { 
    height: 56, 
    backgroundColor: "#F2F2F2", 
    borderRadius: 14, 
    paddingHorizontal: 16, 
    marginBottom: 20, 
    color: '#333',
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0"
  },
  button: { 
    height: 56, 
    backgroundColor: "#1A73E8", 
    borderRadius: 14, 
    alignItems: "center", 
    justifyContent: "center",
    marginTop: 16
  },
  buttonText: { 
    color: "#FFF", 
    fontWeight: "600", 
    fontSize: 18 
  },
  back: { 
    marginTop: 24, 
    color: "#1A73E8", 
    textAlign: "center", 
    fontSize: 16,
    fontWeight: "500"
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  modalBox: { 
    backgroundColor: "#FFF", 
    padding: 24, 
    borderRadius: 16, 
    alignItems: "center", 
    width: '80%' 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginBottom: 8,
    color: "#D32F2F"
  },
  modalText: { 
    color: '#666', 
    marginBottom: 20,
    fontSize: 16
  },
  modalButton: { 
    backgroundColor: "#1A73E8", 
    paddingHorizontal: 30, 
    paddingVertical: 12, 
    borderRadius: 25,
    minWidth: 100,
    alignItems: "center"
  },
  modalButtonText: { 
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600"
  }
});