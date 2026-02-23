import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, Modal, Dimensions, Pressable, StatusBar, TextInput, Image
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppContext } from '../context/AppContext';
import QRCode from 'react-native-qrcode-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const LOGS_STORAGE_KEY = 'doorvi_call_logs';

export default function HomeScreen({ navigation }) {
  const {
    userDetails,
    logout,
    loading,
    incomingCall,
    acceptCall,
    declineCall,
    rtmStatus
  } = useContext(AppContext);

  const [showQRSticker, setShowQRSticker] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showDisableCalls, setShowDisableCalls] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('2 Hours');
  const [logs, setLogs] = useState([]);

  const houseNo = userDetails?.houseNo || '32';
  const appId = '469ff9909237486f8e9bf8526e09899c';
  const channelName = `house_${houseNo}_channel`;

  const BRIDGE_BASE_URL = 'https://alokmaurya2405-droid.github.io/doorvi-call';
  const qrPayload = `${BRIDGE_BASE_URL}/doorvi-visitor-call.html?appid=${appId}&channelName=${channelName}`;
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

    // Refresh logs periodically or on focus
    const unsubscribe = navigation.addListener('focus', loadLogs);
    return unsubscribe;
  }, [navigation]);

  const handleAccept = () => {
    acceptCall();
    navigation.navigate('Call');
  };

  const enterCallRoom = () => {
    navigation.navigate('Call');
  };

  const MenuIcon = ({ icon, label, onPress, color = '#007AFF' }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconContainer, { shadowColor: color }]}>
        <MaterialCommunityIcons name={icon} size={26} color={color} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />

      {/* BACKGROUND ACCENT */}
      <View style={styles.bgAccent} />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.crownContainer}>
            <MaterialCommunityIcons name="crown" size={24} color="#FFB800" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.greetingText}>Hello,</Text>
            <Text style={styles.usernameText}>{userDetails?.name?.split(' ')[0] || 'Alok'}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color="black" />
            <View style={styles.redDot} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconCircle, { marginLeft: 12 }]} onPress={logout}>
            <MaterialCommunityIcons name="logout" size={22} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* MAIN CARD */}
        <LinearGradient
          colors={['#007AFF', '#0055BB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainCard}
        >
          <View style={styles.cardHeader}>
            <View style={styles.houseIconBox}>
              <MaterialCommunityIcons name="home-variant" size={38} color="#007AFF" />
              <View style={[
                styles.onlineStatus,
                { backgroundColor: rtmStatus === 'CONNECTED' ? '#4CAF50' : '#FF9500' }
              ]} />
            </View>
            <View style={styles.houseInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.houseLabel}>House Number</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{rtmStatus}</Text>
                </View>
              </View>
              <Text style={styles.houseNumber}>{userDetails?.houseNo || '32'}</Text>

              <TouchableOpacity
                style={styles.callLogBtn}
                onPress={() => navigation.navigate('CallLogs')}
              >
                <Text style={styles.callLogText}>View Activity</Text>
                <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.gridBtn} onPress={() => setShowQRSticker(true)}>
              <View style={styles.gridIconBox}>
                <Ionicons name="qr-code" size={24} color="#FFF" />
              </View>
              <Text style={styles.gridText}>QR Kit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate('AddMember')}>
              <View style={styles.gridIconBox}>
                <Ionicons name="people" size={24} color="#FFF" />
              </View>
              <Text style={styles.gridText}>Members</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridBtn} onPress={() => setShowWelcome(true)}>
              <View style={styles.gridIconBox}>
                <Ionicons name="power" size={24} color="#FFF" />
              </View>
              <Text style={styles.gridText}>Activate</Text>
            </TouchableOpacity>



            <TouchableOpacity style={styles.gridBtn} onPress={() => setShowMore(true)}>
              <View style={styles.gridIconBox}>
                <Ionicons name="grid" size={24} color="#FFF" />
              </View>
              <Text style={styles.gridText}>More</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* QUICK ACTIONS ROW */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Services</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
            <TouchableOpacity style={styles.quickCard}>
              <LinearGradient colors={['#FF9500', '#FF5E00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickIcon}>
                <MaterialCommunityIcons name="shield-check" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.quickLabel}>Security</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickCard}>
              <LinearGradient colors={['#5856D6', '#AF52DE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickIcon}>
                <MaterialCommunityIcons name="message-text" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.quickLabel}>Guest Msg</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickCard} onPress={() => setShowDisableCalls(true)}>
              <LinearGradient colors={['#FF2D55', '#FF3B30']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickIcon}>
                <MaterialCommunityIcons name="bell-off" size={24} color="white" />
              </LinearGradient>
              <Text style={styles.quickLabel}>Silent Mode</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* LOGS SECTION */}
        <View style={styles.logsSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <Text style={styles.sectionTitle}>Recent Logs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CallLogs')}>
              <Text style={{ color: '#007AFF', fontWeight: '600', fontSize: 13 }}>See All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.dateText}>Activity Report</Text>
          {logs.length === 0 ? (
            <View style={styles.logPlaceholder}>
              <MaterialCommunityIcons name="phone-off" size={40} color="#E0E0E0" />
              <Text style={{ color: '#AAA', marginTop: 10 }}>No recent calls</Text>
            </View>
          ) : (
            logs.slice(0, 5).map((item) => (
              <View key={item.id} style={styles.realLogItem}>
                {item.image ? (
                  <View style={[styles.logIconCircle, { overflow: 'hidden', backgroundColor: '#F2F2F7' }]}>
                    <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} />
                  </View>
                ) : (
                  <View style={[styles.logIconCircle, { backgroundColor: item.status.includes('Answered') ? '#E8F5E9' : '#FFEBEE' }]}>
                    <MaterialCommunityIcons
                      name={item.status.includes('Answered') ? "phone-check" : "phone-incoming"}
                      size={20}
                      color={item.status.includes('Answered') ? "#4CAF50" : "#F44336"}
                    />
                  </View>
                )}
                <View style={styles.logTextContainer}>
                  <Text style={styles.logStatusText}>{item.status.includes('Answered') ? 'Call Answered' : 'Missed Visit'}</Text>
                  <Text style={styles.logTimeText}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • House {item.house_no}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* MODALS */}
      <Modal transparent visible={showWelcome} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowWelcome(false)}>
          <View style={styles.welcomeCard}>
            <TouchableOpacity style={styles.welcomeCloseButton} onPress={() => setShowWelcome(false)}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.modalLogoRow}>
              <View style={styles.blueIconCircle}>
                <MaterialCommunityIcons name="door-open" size={24} color="white" />
              </View>
              <Text style={styles.brandText}>Scanbell</Text>
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

      <Modal transparent visible={showQRSticker} animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowQRSticker(false)}>
          <View style={styles.stickerOuterContainer}>
            <View style={styles.stickerBlueFrame}>
              <View style={styles.stickerWhiteBody}>
                <Text style={styles.stickerHouseNoDisplay}>{houseNo}</Text>
                <View style={styles.qrContainer}>
                  <QRCode value={qrPayload} size={width * 0.55} />
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

      <Modal transparent visible={showMore} animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowMore(false)}>
          <Pressable style={styles.moreBottomSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetTopRow}>
              <Text style={styles.sheetTitle}>More Options</Text>
              <TouchableOpacity onPress={() => setShowMore(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetGrid}>
              <View style={styles.sheetRow}>
                <MenuIcon icon="qrcode" label="QR Kit" onPress={() => { setShowMore(false); setShowQRSticker(true); }} />
                <MenuIcon icon="square-edit-outline" label="Edit Info" onPress={() => { setShowMore(false); }} />
                <MenuIcon icon="check-decagram-outline" label="Activate" onPress={() => { setShowMore(false); setShowWelcome(true); }} />
              </View>

              <View style={styles.sheetRow}>
                <MenuIcon icon="account-plus-outline" label="Members" onPress={() => { setShowMore(false); navigation.navigate('AddMember'); }} />
                <MenuIcon icon="toggle-switch-outline" label="Silent Mode" onPress={() => { setShowMore(false); setShowDisableCalls(true); }} />
                <MenuIcon icon="trash-can-outline" label="Delete" color="#FF3B30" onPress={() => { setShowMore(false); }} />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={showDisableCalls} animationType="fade">
        <View style={styles.disableOverlay}>
          <View style={styles.disableCard}>
            <Text style={styles.disableTitle}>Disable Calls</Text>
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>Disabling calls will stop notifications for selected duration.</Text>
            </View>
            <View style={styles.durationGrid}>
              {['2 Hours', '8 Hours', '1 Week', 'Always'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.durationBtn, selectedDuration === item && styles.durationBtnActive]}
                  onPress={() => setSelectedDuration(item)}
                >
                  <Text style={[styles.durationBtnText, selectedDuration === item && styles.durationBtnTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Leave a note for visitor..."
                placeholderTextColor="#AAA"
                multiline
              />
            </View>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDisableCalls(false)}>
                <Text style={[styles.actionBtnText, { color: '#8E8E93' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.disableConfirmBtn} onPress={() => setShowDisableCalls(false)}>
                <Text style={styles.actionBtnText}>Disable</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={enterCallRoom}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#007AFF" />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Discover')}>
          <Ionicons name="compass-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  bgAccent: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.1,
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#F8F9FB'
  },
  profileSection: { flexDirection: 'row', alignItems: 'center' },
  crownContainer: {
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  greetingText: { fontSize: 12, color: '#8E8E93', fontWeight: '500' },
  usernameText: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  headerRight: { flexDirection: 'row' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  redDot: {
    position: 'absolute', top: 12, right: 12, width: 8, height: 8,
    borderRadius: 4, backgroundColor: '#FF3B30', borderWidth: 1.5, borderColor: '#FFFFFF'
  },
  mainCard: {
    margin: 20,
    borderRadius: 30,
    padding: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  houseIconBox: {
    width: 70,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineStatus: {
    position: 'absolute', bottom: 5, right: 5, width: 12, height: 12,
    borderRadius: 6, backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#FFFFFF'
  },
  houseInfo: { marginLeft: 16, flex: 1 },
  houseLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  houseNumber: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginTop: -2 },
  callLogBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  callLogText: { color: '#FFFFFF', fontWeight: '600', marginRight: 4, fontSize: 14, opacity: 0.9 },
  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 20 },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  gridBtn: { alignItems: 'center', width: '23%' },
  gridIconBox: { width: 50, height: 50, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  gridText: { fontSize: 10, color: '#FFFFFF', fontWeight: '600', textAlign: 'center' },
  quickActions: { marginTop: 10, paddingLeft: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 15 },
  quickScroll: { flexDirection: 'row' },
  quickCard: { width: 100, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 15, marginRight: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  quickIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  quickLabel: { fontSize: 12, fontWeight: '600', color: '#3A3A3C' },
  logsSection: { paddingHorizontal: 20, marginTop: 30 },
  dateText: { color: '#8E8E93', marginBottom: 15, fontSize: 13, fontWeight: '500' },
  logPlaceholder: { height: 100, justifyContent: 'center', alignItems: 'center' },
  realLogItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  logIconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  logTextContainer: { flex: 1 },
  logStatusText: { fontWeight: '700', color: '#1C1C1E', fontSize: 15 },
  logTimeText: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalOverlayDark: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  welcomeCard: { width: '90%', backgroundColor: '#007AFF', borderRadius: 30, padding: 25, alignItems: 'center', marginBottom: 40 },
  welcomeCloseButton: { position: 'absolute', top: 20, right: 20 },
  modalLogoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  blueIconCircle: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12 },
  brandText: { color: 'white', fontSize: 24, fontWeight: 'bold', marginLeft: 12 },
  welcomeTitleText: { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  instructionText: { color: 'white', textAlign: 'center', marginVertical: 20, lineHeight: 22, opacity: 0.9 },
  outlineBtn: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 16, paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 12 },
  outlineBtnText: { color: 'white', fontWeight: '700' },
  solidBtn: { backgroundColor: 'white', borderRadius: 16, paddingVertical: 14, width: '100%', alignItems: 'center' },
  solidBtnText: { color: '#007AFF', fontWeight: '800' },
  stickerOuterContainer: { width: '90%', alignSelf: 'center' },
  stickerBlueFrame: { backgroundColor: '#007AFF', padding: 20, borderRadius: 30 },
  stickerWhiteBody: { backgroundColor: '#FFF', borderRadius: 25, padding: 25, alignItems: 'center' },
  stickerHouseNoDisplay: { fontSize: 40, fontWeight: '900', color: '#000', marginBottom: 20 },
  qrContainer: { padding: 20, backgroundColor: 'white', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5 },
  scanCallTextDisplay: { textAlign: 'center', fontSize: 20, fontWeight: '800', color: '#000', marginTop: 20 },
  bulletBox: { width: '100%', borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 20, marginTop: 20 },
  bulletTextItem: { fontSize: 13, color: '#8E8E93', marginBottom: 8, lineHeight: 18 },
  incomingCallCard: { width: '85%', backgroundColor: '#1C1C1E', borderRadius: 35, padding: 30, alignItems: 'center' },
  pulseRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  incomingTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  incomingSub: { color: '#8E8E93', textAlign: 'center', marginTop: 10, marginBottom: 25 },
  incomingButtonsRow: { flexDirection: 'row' },
  declineBtn: { flex: 1, backgroundColor: '#FF3B30', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  acceptBtn: { flex: 1, backgroundColor: '#34C759', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  incomingBtnText: { color: 'white', fontWeight: '700', marginTop: 4, fontSize: 12 },
  moreBottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, width: '100%' },
  sheetTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  sheetTitle: { fontSize: 22, fontWeight: '700', color: '#1C1C1E' },
  sheetGrid: { width: '100%' },
  sheetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  menuItem: { alignItems: 'center', width: '23%' },
  menuIconContainer: { width: 60, height: 60, backgroundColor: '#F2F2F7', borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  menuLabel: { fontSize: 11, textAlign: 'center', color: '#3A3A3C', fontWeight: '600' },
  disableOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  disableCard: { width: '90%', backgroundColor: 'white', borderRadius: 30, padding: 25 },
  disableTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', color: '#1C1C1E', marginBottom: 20 },
  durationGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  durationBtn: { width: '48%', backgroundColor: '#F2F2F7', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  durationBtnActive: { backgroundColor: '#007AFF' },
  durationBtnText: { color: '#3A3A3C', fontWeight: '600' },
  durationBtnTextActive: { color: 'white' },
  inputContainer: { backgroundColor: '#F2F2F7', borderRadius: 18, padding: 15, height: 100, marginBottom: 25 },
  textInput: { flex: 1, fontSize: 14, color: '#1C1C1E' },
  actionButtonsRow: { flexDirection: 'row' },
  cancelBtn: { flex: 1, backgroundColor: '#F2F2F7', paddingVertical: 16, borderRadius: 16, marginRight: 10, alignItems: 'center' },
  disableConfirmBtn: { flex: 1, backgroundColor: '#FF3B30', paddingVertical: 16, borderRadius: 16, marginLeft: 10, alignItems: 'center' },
  actionBtnText: { fontWeight: '700', fontSize: 16 },
  fab: { position: 'absolute', bottom: 40, right: 25, width: 64, height: 64, borderRadius: 20, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, zIndex: 999 },
  bottomNav: { position: 'absolute', bottom: 25, left: 20, right: 20, height: 70, backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 10, color: '#8E8E93', fontWeight: '600' },
  activeNavText: { color: '#007AFF' },
  statusPill: {
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  statusPillText: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  }
});