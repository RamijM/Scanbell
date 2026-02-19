import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  StatusBar,
  Modal,
} from "react-native";
import { AppContext } from "../context/AppContext";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddDetails({ navigation }) {
  const { userDetails, setUserDetails } = useContext(AppContext);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showWelcomeModal, setShowWelcomeModal] = useState(false); // This was missing!
  const [showQRStickerModal, setShowQRStickerModal] = useState(false);

  useEffect(() => {
    console.log(`"test": "jest", "screen": "AddDetails", "status": "mounted"`);
  }, []);

  const updateField = (field, value) => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  const validateFields = () => {
    if (!userDetails.name || userDetails.name.trim() === "") {
      setErrorMessage("Please enter your name");
      return false;
    }
    if (!userDetails.houseNo || userDetails.houseNo.trim() === "") {
      setErrorMessage("Please enter your house/villa number");
      return false;
    }
    if (!userDetails.address || userDetails.address.trim() === "") {
      setErrorMessage("Please enter your full address");
      return false;
    }
    return true;
  };

  const handleFinish = async () => {
    if (validateFields()) {
      const houseData = { 
        house_data: { 
          id: userDetails.houseNo,
          channelId: `house_${userDetails.houseNo}_channel` 
        } 
      };
      await AsyncStorage.setItem('saved_house_setup', JSON.stringify(houseData));
      navigation.navigate("Home");
      setShowWelcomeModal(true);
      
    } else {
      setShowErrorModal(true);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setShowWelcomeModal(false);
    setShowQRStickerModal(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      
      {/* Curved Blue Header */}
      <View style={styles.headerContainer}>
        <View style={styles.blueCurve}>
          <Text style={styles.headerText}>Add Details</Text>
        </View>
      </View>

      <View style={styles.form}>
        {/* Email Address */}
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          value={userDetails.email || "mauryalok9025@gmail.com"}
          editable={false}
          style={styles.disabledInput}
        />

        {/* Enter Your Name */}
        <Text style={styles.label}>Enter Your Name</Text>
        <TextInput
          value={userDetails.name}
          onChangeText={(text) => updateField("name", text)}
          style={styles.input}
          placeholder="Enter User Name"
          placeholderTextColor="#757575"
        />

        {/* Join as member */}
        <TouchableOpacity>
          <Text style={styles.joinMember}>Join as a member</Text>
        </TouchableOpacity>

        {/* Type Selection */}
        <Text style={styles.label}>Type</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeBtn, userDetails.userType === "Individual" && styles.activeTypeBtn]}
            onPress={() => updateField("userType", "Individual")}
          >
            <Text style={[styles.typeBtnText, userDetails.userType === "Individual" && styles.activeTypeBtnText]}>Individual</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, userDetails.userType === "Community" && styles.activeTypeBtn]}
            onPress={() => updateField("userType", "Community")}
          >
            <Text style={[styles.typeBtnText, userDetails.userType === "Community" && styles.activeTypeBtnText]}>Community</Text>
          </TouchableOpacity>
        </View>

        {/* Property Grid */}
        <View style={styles.propertyGrid}>
          {["House/Villa", "Flat", "Hotel/Resort", "Vehicle", "Lost & Found", "Others"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.propertyBtn, userDetails.propertyType === item && styles.activePropertyBtn]}
              onPress={() => updateField("propertyType", item)}
            >
              <Text style={[styles.propertyBtnText, userDetails.propertyType === item && styles.activePropertyBtnText]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Call Toggle */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Audio Only</Text>
          <Switch
            value={userDetails.callType === "video"}
            onValueChange={(val) => updateField("callType", val ? "video" : "audio")}
            trackColor={{ false: "#D1D1D1", true: "#82C1F5" }}
            thumbColor={userDetails.callType === "video" ? "#44B600" : "#f4f3f4"}
          />
          <Text style={styles.switchLabel}>Video-Audio Call</Text>
        </View>

        {/* House/Villa No */}
        <Text style={styles.label}>Enter House/Villa No ⓘ</Text>
        <TextInput
          style={styles.input}
          placeholder="House/Villa No"
          placeholderTextColor="#C7C7CD"
          value={userDetails.houseNo}
          onChangeText={(text) => updateField("houseNo", text)}
        />

        {/* Full Address */}
        <Text style={styles.label}>Enter your full address.</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Full Address"
          placeholderTextColor="#C7C7CD"
          multiline
          value={userDetails.address}
          onChangeText={(text) => updateField("address", text)}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleFinish}>
          <Text style={styles.submitBtnText}>Finish Setup</Text>
        </TouchableOpacity>
      </View>

      {/* Error Modal */}
      <Modal transparent visible={showErrorModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowErrorModal(false)}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Welcome Modal */}
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  headerContainer: {
    height: 140,
    backgroundColor: "#FFF",
    alignItems: 'center',
  },
  blueCurve: {
    width: '120%',
    height: 120,
    backgroundColor: '#2196F3',
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  headerText: { color: "#FFF", fontSize: 32, fontWeight: "500" },
  form: { paddingHorizontal: 25, marginTop: 10 },
  label: { color: "#8E8E93", fontSize: 15, marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: "#EDF2FF",
    padding: 18,
    borderRadius: 12,
    fontSize: 18,
    color: "#000",
  },
  disabledInput: {
    backgroundColor: "#E5E5EA",
    padding: 18,
    borderRadius: 12,
    fontSize: 18,
    color: "#333",
  },
  joinMember: {
    textAlign: 'right',
    color: '#8E8E93',
    textDecorationLine: 'underline',
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500'
  },
  typeContainer: {
    flexDirection: 'row',
    backgroundColor: '#EDF2FF',
    borderRadius: 50,
    padding: 4,
    marginTop: 5,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 50,
  },
  activeTypeBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  typeBtnText: { color: '#8E8E93', fontSize: 16 },
  activeTypeBtnText: { color: '#2196F3', fontWeight: '500' },
  propertyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    justifyContent: 'flex-start'
  },
  propertyBtn: {
    backgroundColor: '#EDF2FF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 12,
  },
  activePropertyBtn: {
    backgroundColor: '#0066FF',
  },
  propertyBtnText: { color: '#000', fontSize: 15 },
  activePropertyBtnText: { color: '#FFF', fontWeight: '500' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 15,
    marginBottom: 10
  },
  switchLabel: { color: '#8E8E93', fontSize: 15, marginHorizontal: 8 },
  submitBtn: {
    backgroundColor: '#0066FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 40
  },
  submitBtnText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  
  // Modal Styles (combined and fixed)
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalBox: { 
    backgroundColor: '#FFF', 
    padding: 30, 
    borderRadius: 20, 
    alignItems: 'center',
    width: '80%'
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 20 
  },
  modalButton: { 
    backgroundColor: '#0066FF', 
    paddingHorizontal: 30, 
    paddingVertical: 10, 
    borderRadius: 10,
    marginTop: 10
  },
  modalButtonText: { 
    color: '#FFF', 
    fontWeight: '600' 
  },
  errorMessage: {
    color: '#FF0000',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20
  },
  
  // Welcome Modal Styles
  welcomeCard: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  closeX: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  blueIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2196F3',
    marginRight: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#000',
  },
  instructionText: {
    textAlign: 'center',
    color: '#444',
    marginVertical: 15,
    lineHeight: 22,
  },
  activateBtn: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 30,
    padding: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  activateBtnText: { fontWeight: 'bold', fontSize: 16 },
  downloadBtn: {
    width: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 30,
    padding: 15,
    alignItems: 'center',
  },
  downloadBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});