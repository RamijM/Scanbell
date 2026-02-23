import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Modal, Dimensions, Pressable, Vibration, StatusBar, TextInput
} from 'react-native';
import { AppContext } from '../context/AppContext';
import QRCode from 'react-native-qrcode-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AgoraRTM from 'agora-rtm-sdk';
import Sound from 'react-native-sound';
import SettingsScreen from './SettingsScreen';
import DiscoverScreen from './DiscoverScreen';

const { width } = Dimensions.get('window');
const LOGS_STORAGE_KEY = 'doorvi_call_logs';
let rtmInstance = null;
let isLoggingIn = false;

export default function HomeScreen({ navigation }) {
  const { userDetails, logout, loading } = useContext(AppContext);

  const [showQRSticker, setShowQRSticker] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showDisableCalls, setShowDisableCalls] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('2 Hours');
  const [logs, setLogs] = useState([]);

  // RTM Ref for persistent background connection
  const rtmClientRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);

  const appId = '469ff9909237486f8e9bf8526e09899c';
  const houseNo = userDetails?.houseNo || '32';
  const channelName = `house_${houseNo}_channel`;
  const rtmUserId = `house_${houseNo}`;

  // ── QR CODE PAYLOAD ────────────────────────────────────────────────
  const BRIDGE_BASE_URL = 'https://alokmaurya2405-droid.github.io/doorvi-call';
  const qrPayload = `${BRIDGE_BASE_URL}/doorvi-visitor-call.html?appid=${appId}&channelName=${channelName}`;

  // ── Local call log helpers ──────────────────────────────────────────
  const logCall = async (status) => {
    try {
      const newLog = {
        id: Date.now().toString(),
        house_no: houseNo,
        status,
        created_at: new Date().toISOString(),
      };
      const updatedLogs = [newLog, ...logs].slice(0, 20);
      setLogs(updatedLogs);
      await AsyncStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (e) {
      console.log('[HomeScreen] ❌ Log error:', e);
    }
  };

  const saveCallLog = async (visitorId, status = 'Missed') => {
    try {
      const newEntry = {
        id: Date.now().toString(),
        visitor: visitorId,
        timestamp: new Date().toLocaleString('en-GB'),
        status,
      };
      const existingData = await AsyncStorage.getItem('doorvi_logs');
      const savedLogs = existingData ? JSON.parse(existingData) : [];
      const updatedLogs = [newEntry, ...savedLogs].slice(0, 50);
      await AsyncStorage.setItem('doorvi_logs', JSON.stringify(updatedLogs));
    } catch (e) {
      console.error('Failed to save log', e);
    }
  };

  const playSystemDoorbell = () => {
    const systemSound = new Sound('notification_sound', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        const fallbackSound = new Sound('/system/media/audio/notifications/pixiedust.ogg', '', (err) => {
          if (!err) fallbackSound.play();
        });
      } else {
        systemSound.play((success) => { systemSound.release(); });
      }
    });
  };

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const stored = await AsyncStorage.getItem(LOGS_STORAGE_KEY);
        if (stored) setLogs(JSON.parse(stored));
      } catch (e) {
        console.log('[HomeScreen] ❌ Load logs error:', e);
      }
    };
    loadLogs();
  }, []);

  // ── AGORA RTM SIGNALING ─────────────────────────────────────────────
  useEffect(() => {
    if (loading || rtmClientRef.current?.isLoggedIn || isLoggingIn) return;

    const initRTM = async () => {
      isLoggingIn = true;
      try {
        if (!rtmInstance) {
          rtmInstance = AgoraRTM.createInstance(appId);
        }
        rtmClientRef.current = rtmInstance;
        rtmInstance.removeAllListeners();

        rtmInstance.on('MessageFromPeer', (message, peerId) => {
          if (message.text === 'CALL_REQUEST') {
            setIncomingCall({ visitorId: peerId });
            playSystemDoorbell();
            Vibration.vibrate([500, 1000, 500], true);
            saveCallLog(peerId, 'Missed');
          }
        });

        await rtmInstance.login({ uid: rtmUserId });
        rtmClientRef.current.isLoggedIn = true;
        console.log('[RTM] ✅ Clean Login Successful');
      } catch (err) {
        console.log('[RTM] ❌ Login Error:', err.reason || err);
      } finally {
        isLoggingIn = false;
      }
    };
    initRTM();
  }, [loading]);

  const acceptCall = () => {
    Vibration.cancel();
    if (rtmClientRef.current && incomingCall?.visitorId) {
      rtmClientRef.current.sendMessageToPeer({ text: 'CALL_ACCEPTED' }, incomingCall.visitorId)
        .catch(e => console.log('[RTM] Signal Error:', e));
    }
    logCall('Answered Call');
    setIncomingCall(null);
    navigation.navigate('Call');
  };

  const declineCall = () => {
    Vibration.cancel();
    if (rtmClientRef.current && incomingCall?.visitorId) {
      rtmClientRef.current.sendMessageToPeer({ text: 'CALL_REJECTED' }, incomingCall.visitorId)
        .catch(e => console.log('[RTM] Signal Error:', e));
    }
    logCall('Missed Call (Declined)');
    setIncomingCall(null);
  };

  const enterCallRoom = () => {
    logCall('Entered Call Room');
    navigation.navigate('Call');
  };

  // ── UI COMPONENTS ──────────────────────────────────────────────────
  const MenuIcon = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <MaterialCommunityIcons name={icon} size={28} color="#444" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.crownContainer}>
          <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
        </View>
        <Text style={styles.logoText}>DoorVi</Text>
        <View style={styles.headerRight}>
                          <TouchableOpacity 
                    style={styles.iconCircle} 
                    onPress={() => navigation.navigate('Notifications')}
                  >
                    <Ionicons name="notifications-outline" size={22} color="black" />
                    {/* The red dot indicates unread notifications */}
                    <View style={styles.redDot} />
                  </TouchableOpacity>
          <TouchableOpacity style={[styles.iconCircle, { marginLeft: 12 }]} onPress={logout}>
             <MaterialCommunityIcons name="logout" size={22} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* MAIN CARD - NEUMORPHIC / GLASS STYLE */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View style={styles.houseIconBox}>
              <MaterialCommunityIcons name="home" size={42} color="#333" />
              <View style={styles.onlineStatus} />
            </View>
            <View style={styles.houseInfo}>
              <Text style={styles.houseNumber}>{houseNo}</Text>
  
              {/* Update this touchable area */}
              <TouchableOpacity 
                style={styles.callLogBtn} 
                onPress={() => navigation.navigate('CallLogs')}
              >
                <Text style={styles.callLogText}>Call Logs</Text>
                <View style={styles.blueArrow}>
                  <Ionicons name="chevron-forward" size={12} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.iconGrid}>
            <MenuIcon icon="qrcode" label="Download QR Kit" onPress={() => setShowQRSticker(true)} />
          <MenuIcon 
    icon="account-plus-outline" 
    label="Add Member" 
    onPress={() => navigation.navigate('AddMember')} 
  />
            <MenuIcon icon="check-decagram-outline" label="Activate QR Code" onPress={() => setShowWelcome(true)} />
            <MenuIcon icon="dots-horizontal" label="More" onPress={() => setShowMore(true)} />
          </View>

          {/* PREMIUM BANNER - MATCHING IMAGE */}
          <TouchableOpacity style={styles.premiumBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.premiumTitle}>Upgrade to Premium!</Text>
              <Text style={styles.premiumSub}>Subscribe now for uninterrupted experience</Text>
            </View>
            <View style={styles.blackCircleArrow}>
              <Ionicons name="chevron-forward" size={18} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* LOGS SECTION */}
        <View style={styles.logsSection}>
          <Text style={styles.sectionTitle}>Call Logs</Text>
          <Text style={styles.dateText}>Recent Activity</Text>
          {logs.length === 0 ? (
            <View style={styles.logPlaceholder}>
              <Text style={{ color: '#AAA' }}>No recent calls</Text>
            </View>
          ) : (
            logs.map((item) => (
              <View key={item.id} style={styles.realLogItem}>
                <View style={[styles.logIconCircle, { backgroundColor: item.status.includes('Answered') ? '#E8F5E9' : '#FFEBEE' }]}>
                  <MaterialCommunityIcons 
                    name={item.status.includes('Answered') ? "phone-check" : "phone-incoming"} 
                    size={20} 
                    color={item.status.includes('Answered') ? "#4CAF50" : "#F44336"} 
                  />
                </View>
                <View style={styles.logTextContainer}>
                  <Text style={styles.logStatusText}>{item.status}</Text>
                  <Text style={styles.logTimeText}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • House {item.house_no}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* MODAL: WELCOME (GLASS STYLE) */}
      <Modal transparent visible={showWelcome} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowWelcome(false)}>
          <View style={styles.welcomeCard}>
            <TouchableOpacity style={styles.welcomeCloseButton} onPress={() => setShowWelcome(false)}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.modalLogoRow}>
              <View style={styles.blueIconCircle}>
                <MaterialCommunityIcons name="door-open" size={18} color="white" />
              </View>
              <Text style={styles.brandText}>DoorVi</Text>
            </View>
            <Text style={styles.welcomeTitleText}>Welcome, {userDetails?.name || 'Alok Maurya'}</Text>
            <Text style={styles.instructionText}>Simply print out the QR code,{"\n"}Stick it, and stay connected.</Text>
            <TouchableOpacity style={styles.outlineBtn} onPress={() => { setShowWelcome(false); setShowQRSticker(true); }}>
              <Text style={styles.outlineBtnText}>Activate QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.solidBtn} onPress={() => { setShowWelcome(false); enterCallRoom(); }}>
              <Text style={styles.solidBtnText}>Enter Call Room</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* MODAL: QR STICKER */}
      <Modal transparent visible={showQRSticker} animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowQRSticker(false)}>
          <View style={styles.stickerOuterContainer}>
            <View style={styles.stickerBlueFrame}>
              <View style={styles.stickerWhiteBody}>
                <Text style={styles.stickerHouseNoDisplay}>{houseNo}</Text>
                <View style={styles.qrContainer}>
                  <QRCode value={qrPayload} size={width * 0.55} logo={require('../../assets/door.png')} logoSize={50} />
                </View>
                <Text style={styles.scanCallTextDisplay}>SCAN QR CODE{"\n"}TO CALL OWNER</Text>
                <View style={styles.bulletBox}>
                  <Text style={styles.bulletTextItem}>• Please Do Not Knock or Ring The Bell</Text>
                  <Text style={styles.bulletTextItem}>• Scan Code Using Camera or QR Scanner App</Text>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* MODAL: INCOMING CALL */}
      <Modal transparent visible={!!incomingCall} animationType="slide">
        <View style={styles.modalOverlayDark}>
          <View style={styles.incomingCallCard}>
            <View style={styles.pulseRing}>
               <Ionicons name="notifications" size={32} color="white" />
            </View>
            <Text style={styles.incomingTitle}>Visitor at Door!</Text>
            <Text style={styles.incomingSub}>Someone is requesting a video call for House {houseNo}</Text>
            <View style={styles.incomingButtonsRow}>
              <TouchableOpacity style={styles.declineBtn} onPress={declineCall}>
                <Ionicons name="close" size={28} color="white" />
                <Text style={styles.incomingBtnText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={acceptCall}>
                <Ionicons name="videocam" size={28} color="white" />
                <Text style={styles.incomingBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: MORE - EXACTLY LIKE IMAGE */}
      <Modal 
        transparent 
        visible={showMore} 
        animationType="slide"
        onRequestClose={() => setShowMore(false)}
      >
        <Pressable style={styles.modalOverlayLight} onPress={() => setShowMore(false)}>
          {/* This inner Pressable with empty function stops clicks on the modal from closing it */}
          <Pressable style={styles.moreBottomSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetTopRow}>
              <Text style={styles.sheetTitle}>More</Text>
              <TouchableOpacity onPress={() => setShowMore(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.sheetGrid}>
              {/* Row 1 - Exactly as shown in image */}
              <View style={styles.sheetRow}>
                <View style={styles.menuItem}>
                  <View style={styles.menuIconContainer}>
                    <MaterialCommunityIcons name="qrcode" size={28} color="#444" />
                  </View>
                  <Text style={styles.menuLabel}>Download QR Kit</Text>
                </View>
                
                <View style={styles.menuItem}>
                  <View style={styles.menuIconContainer}>
                    <MaterialCommunityIcons name="square-edit-outline" size={28} color="#444" />
                  </View>
                  <Text style={styles.menuLabel}>Edit Address</Text>
                </View>
                
                <View style={styles.menuItem}>
                  <View style={styles.menuIconContainer}>
                    <MaterialCommunityIcons name="check-decagram-outline" size={28} color="#444" />
                  </View>
                  <Text style={styles.menuLabel}>Activate QR Code</Text>
                </View>
              </View>
              
              {/* Row 2 - Exactly as shown in image */}
              <View style={styles.sheetRow}>
                <MenuIcon 
    icon="account-plus-outline" 
    label="Add Member" 
    onPress={() => {
      setShowMore(false); // Close the modal first
      navigation.navigate('AddMember'); // Navigate to the page
    }} 
  />
                
                <MenuIcon 
                  icon="toggle-switch-outline" 
                  label="Online Mode" 
                  onPress={() => {
                    setShowMore(false);
                    setShowDisableCalls(true);
                  }} 
                />
                
                <View style={styles.menuItem}>
                  <View style={styles.menuIconContainer}>
                    <MaterialCommunityIcons name="trash-can-outline" size={28} color="#444" />
                  </View>
                  <Text style={styles.menuLabel}>Delete Address</Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL: DISABLE CALLS */}
      <Modal 
        transparent 
        visible={showDisableCalls} 
        animationType="fade"
        onRequestClose={() => setShowDisableCalls(false)}
      >
        <View style={styles.disableOverlay}>
          <View style={styles.disableCard}>
            <Text style={styles.disableTitle}>Disable Calls</Text>
            
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Disabling this will stop visitor calls on this phone for the selected duration. 
                Other members will still receive the calls. Would you like to proceed?
              </Text>
            </View>

            <Text style={styles.fieldLabel}>Select Duration</Text>
            <View style={styles.durationGrid}>
              {['2 Hours', '8 Hours', '1 Week', 'Always'].map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.durationBtn, selectedDuration === item && styles.durationBtnActive]}
                  onPress={() => setSelectedDuration(item)}
                >
                  <Text style={[styles.durationBtnText, selectedDuration === item && styles.durationBtnTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Message for Visitor</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                style={styles.textInput}
                placeholder="Enter QR Scan Note...."
                placeholderTextColor="#AAA"
                multiline
                maxLength={200}
              />
              <Text style={styles.charCount}>0/200</Text>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setShowDisableCalls(false)}
              >
                <Text style={styles.actionBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.disableConfirmBtn} 
                onPress={() => setShowDisableCalls(false)}
              >
                <Text style={styles.actionBtnText}>Disable</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* BLUE PLUS FAB - MATCHING IMAGE */}
      <TouchableOpacity style={styles.fab} onPress={enterCallRoom}>
        <Ionicons name="add" size={35} color="white" />
      </TouchableOpacity>

      {/* BOTTOM NAVIGATION - 3 TABS WITH NEUMORPHISM */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.replace('Home')}
        >
          <View style={[styles.navIconContainer, styles.activeNavIcon]}>
            <MaterialCommunityIcons name="home" size={24} color="#007AFF" />
          </View>
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.replace('Discover')}
        >
          <View style={styles.navIconContainer}>
            <Ionicons name="compass-outline" size={24} color="#555" />
          </View>
          <Text style={styles.navText}>Discover</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.replace('Settings')}
        >
          <View style={styles.navIconContainer}>
            <Ionicons name="settings-outline" size={24} color="#555" />
          </View>
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, 
    paddingVertical: 15, backgroundColor: '#ffffff' 
  },
  crownContainer: { 
    backgroundColor: '#E0E5EC', 
    padding: 8, 
    borderRadius: 12,
    shadowColor: '#cbe0fe',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: { fontSize: 24, fontWeight: '700', color: '#333', marginLeft: 10, flex: 1 },
  headerRight: { flexDirection: 'row' },
  iconCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#cbe0fe',
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  redDot: { 
    position: 'absolute', top: 10, right: 10, width: 9, height: 9, 
    borderRadius: 5, backgroundColor: '#FF3B30', borderWidth: 2, borderColor: '#E0E5EC' 
  },
  mainCard: { 
    margin: 20, 
    backgroundColor: '#ffffff', 
    borderRadius: 30, 
    padding: 25,
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  houseIconBox: { 
    width: 80, 
    height: 80, 
    backgroundColor: '#cbe0fe', 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  onlineStatus: { 
    position: 'absolute', bottom: 8, left: 10, width: 14, height: 14, 
    borderRadius: 7, backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#E0E5EC' 
  },
  houseInfo: { marginLeft: 18, flex: 1 },
  houseNumber: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  callLogBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  callLogText: { color: '#007AFF', fontWeight: '600', marginRight: 5 },
  blueArrow: { backgroundColor: '#007AFF', borderRadius: 10, padding: 2 },
  iconGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  menuItem: { alignItems: 'center', width: '23%' },
  menuIconContainer: { 
    width: 60, 
    height: 60, 
    backgroundColor: '#F8F9FB', 
    borderRadius: 30,
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  menuLabel: { fontSize: 11, textAlign: 'center', color: '#666', fontWeight: '500' },
  enterCallBtn: { display: 'none' },
  premiumBanner: { 
    marginTop: 25, 
    backgroundColor: '#FFC837', 
    borderRadius: 20, 
    padding: 18, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  premiumTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  premiumSub: { fontSize: 11, color: '#555', marginTop: 2 },
  blackCircleArrow: { 
    backgroundColor: '#000', 
    borderRadius: 20, 
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  logsSection: { paddingHorizontal: 25, marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  dateText: { color: '#999', marginVertical: 5, fontSize: 13 },
  logPlaceholder: { height: 100, justifyContent: 'center', alignItems: 'center' },
  realLogItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#cbe0fe', 
    padding: 15, 
    borderRadius: 20, 
    marginTop: 12,
    shadowColor: '#2e2e2e',
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logIconCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15,
    shadowColor: '#5f5f60',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  logTextContainer: { flex: 1 },
  logStatusText: { fontWeight: 'bold', color: '#333', fontSize: 15 },
  logTimeText: { color: '#999', fontSize: 12 },
  
  // Modal Overlay Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'flex-end' 
  },
  modalOverlayLight: { 
    flex: 1, 
    backgroundColor: 'transparent', 
    justifyContent: 'flex-end' 
  },
  modalOverlayDark: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  // Welcome Modal
  welcomeCard: { width: '85%', backgroundColor: '#007AFF', borderRadius: 30, padding: 25, alignItems: 'center' },
  welcomeCloseButton: { position: 'absolute', top: 15, right: 15 },
  modalLogoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  blueIconCircle: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 10 },
  brandText: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  welcomeTitleText: { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  instructionText: { color: 'white', textAlign: 'center', marginVertical: 20, lineHeight: 22 },
  outlineBtn: { borderWidth: 1, borderColor: 'white', borderRadius: 25, paddingVertical: 12, width: '100%', alignItems: 'center', marginBottom: 12 },
  outlineBtnText: { color: 'white', fontWeight: '600' },
  solidBtn: { backgroundColor: 'white', borderRadius: 25, paddingVertical: 12, width: '100%', alignItems: 'center' },
  solidBtnText: { color: '#007AFF', fontWeight: 'bold' },
  
  // QR Sticker Modal
  stickerOuterContainer: { width: '90%' },
  stickerBlueFrame: { backgroundColor: '#007AFF', padding: 15, borderRadius: 25 },
  stickerWhiteBody: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, alignItems: 'center' },
  stickerHouseNoDisplay: { fontSize: 35, fontWeight: 'bold', color: '#000', marginBottom: 15 },
  qrContainer: { padding: 15, backgroundColor: 'white', elevation: 5, borderRadius: 10 },
  scanCallTextDisplay: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#000', marginTop: 15 },
  bulletBox: { width: '100%', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 15, marginTop: 15 },
  bulletTextItem: { fontSize: 12, color: '#666', marginBottom: 5 },
  
  // FAB
  fab: { 
    position: 'absolute', 
    bottom: 40, 
    right: 25, 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    backgroundColor: '#007AFF', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    zIndex: 999,
  },
  
  // Incoming Call Modal
  incomingCallCard: { 
    width: '85%', 
    backgroundColor: '#1C1C1E', 
    borderRadius: 32, 
    padding: 30, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  pulseRing: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#007AFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  incomingTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  incomingSub: { color: '#999', textAlign: 'center', marginTop: 10, marginBottom: 25 },
  incomingButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  declineBtn: { 
    flex: 1, 
    backgroundColor: '#FF3B30', 
    height: 60, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 8,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  acceptBtn: { 
    flex: 1, 
    backgroundColor: '#4CAF50', 
    height: 60, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  incomingBtnText: { color: 'white', fontWeight: 'bold', marginTop: 4, fontSize: 12 },
  
  // More Modal Styles - EXACTLY LIKE IMAGE
  moreBottomSheet: { 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    paddingHorizontal: 25, 
    paddingTop: 20,
    paddingBottom: 40,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    marginBottom: 80,
    zIndex: 1000,
  },
  sheetTopRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  sheetTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#000000',
    letterSpacing: 0.5,
  },
  sheetGrid: { 
    width: '100%',
    marginTop: 5,
  },
  sheetRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  
  // Disable Calls Modal Styles
  disableOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disableCard: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 20,
  },
  disableTitle: {
    fontSize: 22,
    fontWeight: '500',
    textAlign: 'center',
    color: '#444',
    marginBottom: 20,
  },
  warningBox: {
    backgroundColor: '#FFF5F5',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFE0E0',
    marginBottom: 20,
  },
  warningText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  durationBtn: {
    width: '48%',
    backgroundColor: '#F8F9FB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  durationBtnActive: {
    borderColor: '#007AFF',
    backgroundColor: '#EBF5FF',
  },
  durationBtnText: {
    color: '#444',
    fontSize: 14,
  },
  durationBtnTextActive: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 15,
    padding: 10,
    backgroundColor: '#F8F9FB',
    height: 100,
    marginBottom: 25,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 11,
    color: '#AAA',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    backgroundColor: '#FF7B6E',
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  disableConfirmBtn: {
    backgroundColor: '#8E8E93',
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  
  // Bottom Navigation Styles - NEUMORPHISM
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 84,
    backgroundColor: '#E0E5EC',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#A3B1C6',
    shadowOffset: { width: -8, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
    zIndex: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  navIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E5EC',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeNavIcon: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  navText: {
    fontSize: 11,
    marginTop: 4,
    color: '#666',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});