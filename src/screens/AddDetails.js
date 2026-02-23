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
  Dimensions,
} from "react-native";
import { AppContext } from "../context/AppContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export default function AddDetails({ navigation }) {
  const { userDetails, setUserDetails } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: userDetails.name || "",
    userType: userDetails.userType || "Individual",
    propertyType: userDetails.propertyType || "House/Villa",
    callType: userDetails.callType || "video",
    houseNo: userDetails.houseNo || "",
    address: userDetails.address || "",
  });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateFields = () => {
    if (!formData.name || formData.name.trim() === "") {
      setErrorMessage("Please enter your name");
      return false;
    }
    if (!formData.houseNo || formData.houseNo.trim() === "") {
      setErrorMessage("Please enter your house/villa number");
      return false;
    }
    if (!formData.address || formData.address.trim() === "") {
      setErrorMessage("Please enter your full address");
      return false;
    }
    return true;
  };

  const handleFinish = async () => {
    if (validateFields()) {
      // Sync local form data to Global Context once finished
      const updatedDetails = {
        ...userDetails,
        ...formData,
      };

      await setUserDetails(updatedDetails);

      const houseData = {
        house_data: {
          id: formData.houseNo,
          channelId: `house_${formData.houseNo}_channel`
        }
      };
      await AsyncStorage.setItem('saved_house_setup', JSON.stringify(houseData));
      // No need to navigation.navigate("Home") because App.jsx will automatically 
      // detect userDetails.houseNo and switch the stack.
    } else {
      setShowErrorModal(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* MODERN HEADER */}
        <LinearGradient
          colors={['#007AFF', '#0055BB']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile Setup</Text>
            <Text style={styles.headerSub}>Let's personalize your Scanbell</Text>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          {/* Email Address - READ ONLY */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrapper, styles.disabledInput]}>
              <Ionicons name="mail-outline" size={20} color="#8E8E93" />
              <Text style={styles.disabledText}>{userDetails.email || "mauryalok9025@gmail.com"}</Text>
            </View>
          </View>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#007AFF" />
              <TextInput
                value={formData.name}
                onChangeText={(text) => updateField("name", text)}
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#C7C7CD"
              />
            </View>
          </View>

          {/* Type Selection - INDIVIDUAL / COMMUNITY */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Type</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeCard, formData.userType === "Individual" && styles.activeTypeCard]}
                onPress={() => updateField("userType", "Individual")}
              >
                <LinearGradient
                  colors={formData.userType === "Individual" ? ['#007AFF', '#0055BB'] : ['#F2F2F7', '#F2F2F7']}
                  style={styles.typeGradient}
                >
                  <MaterialCommunityIcons
                    name="account"
                    size={24}
                    color={formData.userType === "Individual" ? '#FFF' : '#8E8E93'}
                  />
                  <Text style={[styles.typeText, formData.userType === "Individual" && styles.activeTypeText]}>Individual</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeCard, formData.userType === "Community" && styles.activeTypeCard]}
                onPress={() => updateField("userType", "Community")}
              >
                <LinearGradient
                  colors={formData.userType === "Community" ? ['#007AFF', '#0055BB'] : ['#F2F2F7', '#F2F2F7']}
                  style={styles.typeGradient}
                >
                  <MaterialCommunityIcons
                    name="office-building"
                    size={24}
                    color={formData.userType === "Community" ? '#FFF' : '#8E8E93'}
                  />
                  <Text style={[styles.typeText, formData.userType === "Community" && styles.activeTypeText]}>Community</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Property Selection Grid */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Property Category</Text>
            <View style={styles.propertyGrid}>
              {["House/Villa", "Flat", "Hotel/Resort", "Vehicle", "Others"].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.propertyTag, formData.propertyType === item && styles.activePropertyTag]}
                  onPress={() => updateField("propertyType", item)}
                >
                  <Text style={[styles.propertyTagText, formData.propertyType === item && styles.activePropertyTagText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Call Mode Toggle */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Call Preference</Text>
              <Text style={styles.toggleSub}>{formData.callType === "video" ? "Audio & Video" : "Audio Only"}</Text>
            </View>
            <Switch
              value={formData.callType === "video"}
              onValueChange={(val) => updateField("callType", val ? "video" : "audio")}
              trackColor={{ false: "#D1D1D1", true: "#007AFF" }}
              thumbColor="#FFF"
            />
          </View>

          {/* House No Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>House/Villa Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="home-outline" size={20} color="#007AFF" />
              <TextInput
                value={formData.houseNo}
                onChangeText={(text) => updateField("houseNo", text)}
                style={styles.input}
                placeholder="Ex: 101/B"
                placeholderTextColor="#C7C7CD"
              />
            </View>
          </View>

          {/* Address Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Address</Text>
            <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start', paddingTop: 15 }]}>
              <Ionicons name="location-outline" size={20} color="#007AFF" />
              <TextInput
                value={formData.address}
                onChangeText={(text) => updateField("address", text)}
                style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                placeholder="Street name, landmark..."
                placeholderTextColor="#C7C7CD"
                multiline
              />
            </View>
          </View>

          {/* FINISH BUTTON */}
          <TouchableOpacity style={styles.finishBtnOuter} onPress={handleFinish}>
            <LinearGradient
              colors={['#007AFF', '#0055BB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.finishBtn}
            >
              <Text style={styles.finishBtnText}>Complete Setup</Text>
              <Ionicons name="checkmark-circle" size={24} color="white" style={{ marginLeft: 10 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Error Modal */}
      <Modal transparent visible={showErrorModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.errorIconCircle}>
              <Ionicons name="warning" size={32} color="#FF3B30" />
            </View>
            <Text style={styles.modalTitle}>Incomplete Info</Text>
            <Text style={styles.modalSub}>{errorMessage}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowErrorModal(false)}>
              <Text style={styles.modalBtnText}>Fix It</Text>
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
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: { alignItems: 'flex-start' },
  headerTitle: { fontSize: 32, fontWeight: '900', color: 'white' },
  headerSub: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 5, fontWeight: '500' },

  formContainer: { padding: 25, marginTop: -30, backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, minHeight: height },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#1C1C1E', marginBottom: 10, marginLeft: 5 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 18,
    paddingHorizontal: 15,
    height: 60,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1C1C1E', fontWeight: '500' },
  disabledInput: { backgroundColor: '#E5E5EA', opacity: 0.8 },
  disabledText: { flex: 1, marginLeft: 10, fontSize: 16, color: '#8E8E93', fontWeight: '500' },

  typeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  typeCard: { flex: 1, marginHorizontal: 5, borderRadius: 20, overflow: 'hidden', elevation: 2 },
  typeGradient: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center' },
  typeText: { marginTop: 8, fontSize: 14, fontWeight: '700', color: '#8E8E93' },
  activeTypeText: { color: 'white' },

  propertyGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  propertyTag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  activePropertyTag: { borderColor: '#007AFF', backgroundColor: 'rgba(0,122,255,0.1)' },
  propertyTagText: { fontSize: 14, fontWeight: '600', color: '#3A3A3C' },
  activePropertyTagText: { color: '#007AFF' },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20
  },
  toggleTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  toggleSub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },

  finishBtnOuter: { marginTop: 20, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  finishBtn: { flexDirection: 'row', height: 65, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  finishBtnText: { color: 'white', fontSize: 18, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '80%', backgroundColor: 'white', borderRadius: 30, padding: 30, alignItems: 'center' },
  errorIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E' },
  modalSub: { fontSize: 16, color: '#8E8E93', textAlign: 'center', marginTop: 10, marginBottom: 25, lineHeight: 22 },
  modalBtn: { backgroundColor: '#007AFF', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 15 },
  modalBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});