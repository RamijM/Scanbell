import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Modal, Dimensions, Pressable, Vibration,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import QRCode from 'react-native-qrcode-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AgoraRTM from 'agora-rtm-sdk';
import Sound from 'react-native-sound';

const { width } = Dimensions.get('window');
const LOGS_STORAGE_KEY = 'doorvi_call_logs';
let rtmInstance = null;
let isLoggingIn = false;

export default function HomeScreen({ navigation }) {
  const { userDetails, logout, loading } = useContext(AppContext);

  const [showQRSticker, setShowQRSticker] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [logs, setLogs] = useState([]);

  // RTM Ref for persistent background connection
  const rtmClientRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);

  const appId = '469ff9909237486f8e9bf8526e09899c';
  const houseNo = userDetails?.houseNo || '32';
  const channelName = `house_${houseNo}_channel`;
  const rtmUserId = `house_${houseNo}`;

  // ── QR CODE PAYLOAD (Web Page) ──────────────────────────────────────
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
      const logs = existingData ? JSON.parse(existingData) : [];
      const updatedLogs = [newEntry, ...logs].slice(0, 50);
      await AsyncStorage.setItem('doorvi_logs', JSON.stringify(updatedLogs));
      console.log('[Log] Call saved:', status);
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
        systemSound.play((success) => {
          systemSound.release();
        });
      }
    });
  };

  const loadLogs = async () => {
    try {
      const stored = await AsyncStorage.getItem(LOGS_STORAGE_KEY);
      if (stored) setLogs(JSON.parse(stored));
    } catch (e) {
      console.log('[HomeScreen] ❌ Load logs error:', e);
    }
  };

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

  const MenuIcon = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <MaterialCommunityIcons name={icon} size={28} color="black" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.crownContainer}>
          <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
        </View>
        <Text style={styles.logoText}>DoorVi</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={async () => {
              console.log('[RTM] Running Self-Test...');
              if (rtmClientRef.current) {
                rtmClientRef.current.sendMessageToPeer({ text: 'CALL_REQUEST' }, rtmUserId)
                  .then(() => console.log('[RTM] Self-Test message sent!'))
                  .catch(e => console.log('[RTM] Self-Test failed:', e));
              } else {
                console.log('[RTM] Client not ready for test');
              }
            }}
          >
            <Ionicons name="bug-outline" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconCircle, { marginLeft: 10 }]}>
            <Ionicons name="notifications-outline" size={22} color="black" />
            <View style={styles.redDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconCircle, { marginLeft: 10 }]}
            onPress={async () => {
              await logout();
              navigation.replace('SignIn');
            }}
          >
            <MaterialCommunityIcons name="logout" size={22} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View style={styles.houseIconBox}>
              <MaterialCommunityIcons name="home-variant" size={40} color="black" />
              <View style={styles.onlineStatus} />
            </View>
            <View style={styles.houseInfo}>
              <Text style={styles.houseNumber}>{houseNo}</Text>
              <TouchableOpacity style={styles.callLogBtn}>
                <Text style={styles.callLogText}>Call Logs</Text>
                <View style={styles.blueArrow}>
                  <Ionicons name="chevron-forward" size={14} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.iconGrid}>
            <MenuIcon icon="qrcode" label="Download QR Kit" onPress={() => setShowQRSticker(true)} />
            <MenuIcon icon="account-plus-outline" label="Add Member" />
            <MenuIcon icon="check-decagram-outline" label="Activate QR Code" onPress={() => setShowWelcome(true)} />
            <MenuIcon icon="dots-horizontal" label="More" />
          </View>

          <TouchableOpacity style={styles.enterCallBtn} onPress={enterCallRoom}>
            <Ionicons name="videocam" size={22} color="white" />
            <Text style={styles.enterCallBtnText}>Enter Call Room</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.premiumBanner}>
            <View>
              <Text style={styles.premiumTitle}>Upgrade to Premium!</Text>
              <Text style={styles.premiumSub}>Subscribe now for uninterrupted experience</Text>
            </View>
            <View style={styles.blackCircleArrow}>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.logsSection}>
          <Text style={styles.sectionTitle}>Call Logs</Text>
          <Text style={styles.dateText}>Recent Activity</Text>
          {logs.length === 0 ? (
            <View style={styles.logPlaceholder}>
              <Text style={{ color: '#999' }}>No recent calls</Text>
            </View>
          ) : (
            logs.slice(0, 10).map((item) => (
              <View key={item.id} style={styles.realLogItem}>
                <View style={[styles.logIconCircle, {
                  backgroundColor: item.status === 'Answered' ? '#E8F5E9' : '#FFEBEE'
                }]}>
                  <MaterialCommunityIcons
                    name={item.status === 'Answered' ? 'phone-check' : 'phone-incoming'}
                    size={20}
                    color={item.status === 'Answered' ? '#4CAF50' : '#F44336'}
                  />
                </View>
                <View style={styles.logTextContainer}>
                  <Text style={styles.logStatusText}>{item.status}</Text>
                  <Text style={styles.logTimeText}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • House {item.house_no}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* MODAL 1: WELCOME */}
      <Modal transparent visible={showWelcome} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowWelcome(false)}>
          <Pressable style={styles.welcomeCard} onPress={e => e.stopPropagation()}>
            <TouchableOpacity style={styles.welcomeCloseButton} onPress={() => setShowWelcome(false)}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.modalLogoRow}>
              <View style={styles.blueIconCircle}>
                <MaterialCommunityIcons name="door-open" size={18} color="white" />
              </View>
              <Text style={styles.brandText}>DoorVi</Text>
            </View>
            <Text style={styles.welcomeTitle}>Welcome, {userDetails?.name || 'Alok Maurya'}</Text>
            <Text style={styles.instructionText}>
              Simply print out the QR code,{'\n'}Stick it, and stay connected.
            </Text>
            <TouchableOpacity style={styles.outlineBtn} onPress={() => { setShowWelcome(false); setShowQRSticker(true); }}>
              <Text style={styles.outlineBtnText}>Activate QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.solidBtn} onPress={() => { setShowWelcome(false); enterCallRoom(); }}>
              <Text style={styles.solidBtnText}>Enter Call Room</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 2: QR STICKER (NO DOWNLOAD/SHARE/PRINT BUTTONS) */}
      <Modal transparent visible={showQRSticker} animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowQRSticker(false)}>
          <Pressable style={styles.stickerOuterContainer} onPress={e => e.stopPropagation()}>
            <View style={styles.stickerHeader}>
              <Text style={styles.stickerHeaderText}>QR Code Sticker</Text>
              <TouchableOpacity style={styles.stickerCloseButton} onPress={() => setShowQRSticker(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.stickerBlueFrame}>
              <View style={styles.stickerWhiteBody}>
                <Text style={styles.stickerHouseNo}>{houseNo}</Text>
                <View style={styles.qrContainer}>
                  <QRCode
                    value={qrPayload}
                    size={width * 0.55}
                    logo={require('../../assets/door.png')}
                    logoSize={50}
                    logoBackgroundColor="transparent"
                  />
                </View>
                <Text style={styles.scanCallText}>SCAN QR CODE{'\n'}TO CALL OWNER</Text>
                <View style={styles.bulletBox}>
                  <Text style={styles.bulletText}>• Please Do Not Knock or Ring The Bell</Text>
                  <Text style={styles.bulletText}>• Scan Code Using Camera or QR Scanner App</Text>
                </View>
              </View>
            </View>
            {/* No footer actions anymore */}
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 3: INCOMING CALL */}
      <Modal transparent visible={!!incomingCall} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.incomingCallCard}>
            <View style={styles.pulseRing}>
              <View style={styles.callingIconSmall}>
                <Ionicons name="notifications" size={32} color="white" />
              </View>
            </View>
            <Text style={styles.incomingTitle}>Visitor at Door!</Text>
            <Text style={styles.incomingSub}>Someone is requesting a video call for House {houseNo}</Text>

            <View style={styles.incomingButtonsRow}>
              <TouchableOpacity style={styles.declineBtn} onPress={declineCall}>
                <Ionicons name="close" size={28} color="white" />
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.acceptBtn} onPress={acceptCall}>
                <Ionicons name="videocam" size={28} color="white" />
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={enterCallRoom}>
        <Ionicons name="videocam" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white' },
  crownContainer: { backgroundColor: '#FFF9E6', padding: 5, borderRadius: 8 },
  logoText: { fontSize: 22, fontWeight: 'bold', marginLeft: 10, flex: 1, color: 'black' },
  headerRight: { flexDirection: 'row' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  redDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: 'red' },
  mainCard: { margin: 16, backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  houseIconBox: { width: 80, height: 80, backgroundColor: '#F0F0F0', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  onlineStatus: { position: 'absolute', bottom: 5, right: 5, width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50' },
  houseInfo: { marginLeft: 15, flex: 1 },
  houseNumber: { fontSize: 24, fontWeight: 'bold', color: 'black' },
  callLogBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  callLogText: { color: '#666', marginRight: 5 },
  blueArrow: { backgroundColor: '#007AFF', borderRadius: 10, padding: 2 },
  iconGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  menuItem: { alignItems: 'center', width: '22%' },
  menuIconContainer: { width: 50, height: 50, backgroundColor: '#F8F9FB', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  menuLabel: { fontSize: 11, textAlign: 'center', color: '#333' },
  enterCallBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4CAF50', borderRadius: 15, padding: 16, marginTop: 20, gap: 10,
  },
  enterCallBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  premiumBanner: { marginTop: 15, backgroundColor: '#E3F2FD', borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  premiumTitle: { fontWeight: 'bold', color: '#0D47A1' },
  premiumSub: { fontSize: 11, color: '#1976D2' },
  blackCircleArrow: { backgroundColor: 'black', borderRadius: 15, padding: 5 },
  logsSection: { paddingHorizontal: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: 'black' },
  dateText: { color: '#999', marginVertical: 5 },
  logPlaceholder: { height: 80, backgroundColor: '#F0F0F0', borderRadius: 15, marginTop: 10, justifyContent: 'center', alignItems: 'center' },
  realLogItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 15, marginTop: 10, elevation: 1 },
  logIconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logTextContainer: { flex: 1 },
  logStatusText: { fontWeight: 'bold', color: 'black', fontSize: 14 },
  logTimeText: { color: '#999', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  welcomeCard: { width: '85%', backgroundColor: '#007AFF', borderRadius: 30, padding: 25, alignItems: 'center' },
  welcomeCloseButton: { position: 'absolute', top: 15, right: 15, padding: 5 },
  modalLogoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  blueIconCircle: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 10 },
  brandText: { color: 'white', fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  welcomeTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  instructionText: { color: 'white', textAlign: 'center', marginVertical: 20, lineHeight: 22 },
  outlineBtn: { borderWidth: 1, borderColor: 'white', borderRadius: 25, paddingVertical: 12, width: '100%', alignItems: 'center', marginBottom: 12 },
  outlineBtnText: { color: 'white', fontWeight: '600' },
  solidBtn: { backgroundColor: 'white', borderRadius: 25, paddingVertical: 12, width: '100%', alignItems: 'center' },
  solidBtnText: { color: '#007AFF', fontWeight: 'bold' },
  stickerOuterContainer: { width: '90%', alignItems: 'center' },
  stickerHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  stickerHeaderText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  stickerCloseButton: { padding: 5 },
  stickerBlueFrame: { width: '100%', backgroundColor: '#007AFF', padding: 15, borderRadius: 20 },
  stickerWhiteBody: { backgroundColor: 'white', borderRadius: 15, padding: 20, alignItems: 'center' },
  stickerHouseNo: { fontSize: 32, fontWeight: '900', color: 'black', marginBottom: 15 },
  qrContainer: { padding: 15, backgroundColor: 'white', elevation: 5, borderRadius: 10, marginBottom: 15 },
  scanCallText: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: 'black', marginBottom: 15 },
  bulletBox: { width: '100%', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 15 },
  bulletText: { fontSize: 12, color: '#666', marginBottom: 5 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  incomingCallCard: {
    width: '85%', backgroundColor: '#1C1C1E', borderRadius: 32,
    padding: 30, alignItems: 'center', elevation: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  pulseRing: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(0,122,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  callingIconSmall: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center',
  },
  incomingTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  incomingSub: { color: '#999', textAlign: 'center', fontSize: 14, marginBottom: 30, lineHeight: 20 },
  incomingButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  declineBtn: {
    flex: 1, backgroundColor: '#FF3B30', height: 60, borderRadius: 20,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginRight: 10, gap: 8,
  },
  acceptBtn: {
    flex: 1, backgroundColor: '#4CAF50', height: 60, borderRadius: 20,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginLeft: 10, gap: 8,
  },
  declineText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  acceptText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});