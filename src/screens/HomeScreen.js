import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Modal, Dimensions, Pressable, Platform, PermissionsAndroid,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import QRCode from 'react-native-qrcode-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createAgoraRtcEngine, ChannelProfileType, ClientRoleType, AudioScenarioType } from 'react-native-agora';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../supabaseClient';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { userDetails } = useContext(AppContext);

  // ── All refs — no useCallback needed ─────────────────────────────────────
  const agoraEngineRef = useRef(null);
  const isListeningRef = useRef(false);
  const channelNameRef = useRef('');

  const [showWelcome, setShowWelcome] = useState(false);
  const [showQRSticker, setShowQRSticker] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [logs, setLogs] = useState([]);

  const appId = '469ff9909237486f8e9bf8526e09899c';
  const houseNo = userDetails?.houseNo || '32';
  const channelName = `house_${houseNo}_channel`;
  channelNameRef.current = channelName; // sync ref without re-render

  const isFocused = useIsFocused();

  const qrPayload = `https://alokmaurya2405-droid.github.io/doorvi-call/doorvi-visitor-call.html?appid=${appId}&channelName=${channelName}`;

  // ── Supabase helpers ──────────────────────────────────────────────────────
  const logCallToSupabase = async (status) => {
    try {
      const { error } = await supabase
        .from('call_logs')
        .insert([{ house_no: houseNo, status }]);
      if (error) console.log('[SUPABASE ERROR]', error.message);
      else console.log(`[SUPABASE] Logged: ${status}`);
    } catch (e) {
      console.log('[SUPABASE EXCEPTION]', e);
    }
  };

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (!error && data) setLogs(data);
  };

  // ── Supabase realtime + initial fetch ─────────────────────────────────────
  useEffect(() => {
    fetchLogs();
    const channel = supabase
      .channel('realtime_logs')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'call_logs' },
        (payload) => {
          setLogs(current => [payload.new, ...current].slice(0, 10));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── STOP listener — plain function, no useCallback ────────────────────────
  const stopListening = () => {
    console.log('[HomeScreen] 🛑 stopListening() called');

    if (!agoraEngineRef.current) {
      console.log('[HomeScreen] ⚠️ No engine to stop');
      isListeningRef.current = false;
      return;
    }

    try {
      // ✅ Disable audio BEFORE leaving so hardware releases immediately
      agoraEngineRef.current.disableAudio();
      agoraEngineRef.current.disableVideo();
      console.log('[HomeScreen] 🔇 Audio/Video disabled');

      agoraEngineRef.current.leaveChannel();
      console.log('[HomeScreen] 📤 leaveChannel() called');

      agoraEngineRef.current.release();
      console.log('[HomeScreen] 💥 Engine released');
    } catch (e) {
      console.log('[HomeScreen] ❌ stopListening error:', e);
    }

    agoraEngineRef.current = null;
    isListeningRef.current = false;
    console.log('[HomeScreen] ✅ Listener fully stopped');
  };

  // ── START listener — plain function, no useCallback ───────────────────────
  const startListening = async () => {
    console.log('[HomeScreen] 🚀 startListening() called');
    console.log('[HomeScreen] isListening:', isListeningRef.current, '| engine:', agoraEngineRef.current ? 'EXISTS' : 'NULL');

    // Double guard
    if (isListeningRef.current || agoraEngineRef.current) {
      console.log('[HomeScreen] ⛔ Already listening — blocked');
      return;
    }

    isListeningRef.current = true;

    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          // ✅ No CAMERA permission needed for listener — saves resources
        ]);
      }

      const engine = createAgoraRtcEngine();
      agoraEngineRef.current = engine;

      engine.initialize({
        appId,
        // ✅ Use default audio scenario — no unnecessary audio processing
        audioScenario: AudioScenarioType.AudioScenarioDefault,
      });

      // ✅ KEY FIX: Disable audio AND video completely for listener
      // Audience only needs to DETECT users joining — no media needed
      engine.disableAudio();
      engine.disableVideo();
      console.log('[HomeScreen] 🔇 Audio/Video DISABLED for listener mode');

      engine.registerEventHandler({
        onJoinChannelSuccess: (connection) => {
          console.log(`[HomeScreen] ✅ Listening on channel. UID: ${connection?.localUid}`);
        },
        onUserJoined: (_connection, uid) => {
          // ✅ Only trigger for visitor UID (2), ignore admin (99 is us, 0 is CallScreen)
          if (uid === 2) {
            console.log(`[HomeScreen] 🚨 VISITOR DETECTED! UID: ${uid}`);
            logCallToSupabase('Incoming Call');
            setIncomingCall(true);
          } else {
            console.log(`[HomeScreen] ℹ️ Ignored join from UID: ${uid} (not a visitor)`);
          }
        },
        onUserOffline: (_connection, uid) => {
          console.log(`[HomeScreen] 👋 User offline UID: ${uid}`);
          if (uid === 2) {
            setIncomingCall(false);
          }
        },
        onLeaveChannel: () => {
          console.log('[HomeScreen] 📤 onLeaveChannel fired');
        },
        onError: (err) => {
          console.log('[HomeScreen] ❌ Agora error:', err);
        },
      });

      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);

      // ✅ UID 99 = our listener, never clashes with visitor (2) or CallScreen (0)
      engine.joinChannel('', channelNameRef.current, 99, {
        clientRoleType: ClientRoleType.ClientRoleAudience,
        autoSubscribeAudio: false, // ✅ Don't subscribe to any audio streams
        autoSubscribeVideo: false, // ✅ Don't subscribe to any video streams
      });

      console.log('[HomeScreen] 📞 Joined as silent listener on:', channelNameRef.current);

    } catch (e) {
      console.log('[HomeScreen] ❌ startListening error:', e);
      agoraEngineRef.current = null;
      isListeningRef.current = false;
    }
  };

  // ── Effect 1: Mount/Unmount ONLY ──────────────────────────────────────────
  // ── Effect 1: Mount/Unmount ONLY ──────────────────────────────────────────
useEffect(() => {
  console.log('[HomeScreen] ✅ MOUNTED (Waiting for Focus to start listener)');
  // startListening(); // <--- REMOVE THIS LINE
  
  return () => {
    console.log('[HomeScreen] 🔴 UNMOUNTING (App closing or component destroyed)');
    
  };
}, []);

// ── Effect 2: Focus changes ONLY ─────────────────────────────────────────
useEffect(() => {
  console.log('[HomeScreen] 👁️ isFocused:', isFocused);
  
  if (isFocused) {
    // Only start if we aren't already listening
    if (!isListeningRef.current && !agoraEngineRef.current) {
      console.log('[HomeScreen] ⏳ Screen focused: Starting listener...');
      const timer = setTimeout(() => {
        startListening();
      }, 800); // 800ms delay to ensure previous screens have released hardware
      return () => clearTimeout(timer);
    }
  } else {
    // THIS IS THE KEY: The moment you navigate to 'Call' or elsewhere, 
    // isFocused becomes false and we kill the listener.
    console.log('[HomeScreen] 👁️ Screen blurred: Killing background listener');
    
  }
}, [isFocused]);

  const acceptCall = () => {
    console.log('[HomeScreen] ✅ ACCEPTED');
    logCallToSupabase('Answered');
    setIncomingCall(false);
    stopListening();
    navigation.navigate('Call');
  };

  const rejectCall = () => {
    console.log('[HomeScreen] ❌ REJECTED');
    logCallToSupabase('Rejected');
    setIncomingCall(false);
  };

  const MenuIcon = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        <MaterialCommunityIcons name={icon} size={28} color="black" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const FooterAction = ({ icon, label }) => (
    <TouchableOpacity style={styles.footerActionItem}>
      <Ionicons name={icon} size={22} color="white" />
      <Text style={styles.footerActionLabel}>{label}</Text>
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
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="notifications-outline" size={22} color="black" />
            <View style={styles.redDot} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconCircle, { marginLeft: 10 }]}>
            <MaterialCommunityIcons name="qrcode-scan" size={22} color="black" />
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
          <Text style={styles.dateText}>Real-time Activity</Text>
          {logs.length === 0 ? (
            <View style={styles.logPlaceholder}>
              <Text style={{ color: '#999' }}>No recent calls</Text>
            </View>
          ) : (
            logs.map((item) => (
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
            <TouchableOpacity style={styles.solidBtn} onPress={() => { setShowWelcome(false); navigation.navigate('Call'); }}>
              <Text style={styles.solidBtnText}>Enter Call Room</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 2: QR STICKER */}
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
            <View style={styles.footerActions}>
              <FooterAction icon="download-outline" label="Download" />
              <FooterAction icon="print-outline" label="Print" />
              <FooterAction icon="share-outline" label="Share" />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MODAL 3: INCOMING CALL */}
      <Modal transparent visible={incomingCall} animationType="slide">
        <View style={styles.callOverlay}>
          <View style={styles.callPopup}>
            <View style={styles.callerIconPulse}>
              <View style={styles.callerIcon}>
                <Ionicons name="person" size={50} color="white" />
              </View>
            </View>
            <Text style={styles.callerTitle}>Visitor at Door!</Text>
            <Text style={styles.callerSub}>Someone is at House {houseNo}</Text>
            <View style={styles.callActions}>
              <View style={styles.callBtnWrapper}>
                <TouchableOpacity style={styles.rejectBtn} onPress={rejectCall}>
                  <Ionicons name="call" size={30} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>
                <Text style={styles.callBtnLabel}>Decline</Text>
              </View>
              <View style={styles.callBtnWrapper}>
                <TouchableOpacity style={styles.acceptBtn} onPress={acceptCall}>
                  <Ionicons name="call" size={30} color="white" />
                </TouchableOpacity>
                <Text style={styles.callBtnLabel}>Answer</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={35} color="white" />
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
  premiumBanner: { marginTop: 25, backgroundColor: '#E3F2FD', borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
  footerActions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20 },
  footerActionItem: { alignItems: 'center' },
  footerActionLabel: { color: 'white', fontSize: 12, marginTop: 5 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  callOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  callPopup: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 40, alignItems: 'center', paddingBottom: 60 },
  callerIconPulse: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0,122,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  callerIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
  callerTitle: { color: 'white', fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  callerSub: { color: '#999', fontSize: 16, marginBottom: 40 },
  callActions: { flexDirection: 'row', gap: 60 },
  callBtnWrapper: { alignItems: 'center', gap: 8 },
  rejectBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FF3B30', justifyContent: 'center', alignItems: 'center' },
  acceptBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  callBtnLabel: { color: 'white', fontSize: 13, fontWeight: '500' },
});