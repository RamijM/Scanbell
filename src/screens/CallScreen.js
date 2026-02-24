import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  View, StyleSheet, PermissionsAndroid, Platform, Text, TouchableOpacity,
  Dimensions, StatusBar, ScrollView
} from 'react-native';
import { AppContext } from '../context/AppContext';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
} from 'react-native-agora';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function CallScreen({ navigation }) {
 const {
  userDetails,
  endCallSignal,
  sendQuickReply,
  incomingCall,
  savedVisitors,
  activeCall,        // ← NEW: Access activeCall to check shouldAutoMute
  isSilentMode,      // ← NEW: Access Silent Mode state for UI indicator
} = useContext(AppContext);
  const agoraEngineRef = useRef(null);
  const hasTerminated = useRef(false);
  const isMountedRef = useRef(true);
  const timerRef = useRef(null);
  const visitorId = incomingCall?.visitorId;
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  
  // ── NEW: Auto-mute if Silent Mode was ON when call was accepted ──
  const [isMuted, setIsMuted] = useState(activeCall?.shouldAutoMute || false);
  
  const [callDuration, setCallDuration] = useState(0);

  const appId = '469ff9909237486f8e9bf8526e09899c';
  const houseNo = userDetails?.houseNo || '32';
  const channelName = `house_${houseNo}_channel`;
  const displayName =
  incomingCall?.visitor_name ||
  savedVisitors?.[incomingCall?.visitorId] ||
  "Visitor";
  
  // ── Call Timer ──
  useEffect(() => {
    if (remoteUid !== 0) {
      timerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [remoteUid]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // ── Lifecycle ──
  useEffect(() => {
    isMountedRef.current = true;
    hasTerminated.current = false;
    setupVideoSDKEngine();

    return () => {
      isMountedRef.current = false;
      terminateSession('unmount');
    };
  }, []);

  const setupVideoSDKEngine = async () => {
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
      }

      if (agoraEngineRef.current) return;

      const engine = createAgoraRtcEngine();
      agoraEngineRef.current = engine;

      engine.initialize({ appId });
      engine.enableVideo();
      engine.enableAudio();

      // LOCK PRIVACY: Admin sees visitor, but visitor sees black/blurred
      engine.muteLocalVideoStream(true);

      // ── NEW: Auto-mute microphone if Silent Mode was ON when call was accepted ──
      if (activeCall?.shouldAutoMute) {
        console.log('[CallScreen] 🔇 Auto-muting microphone (Silent Mode)');
        engine.muteLocalAudioStream(true);
      }

      engine.registerEventHandler({
        onJoinChannelSuccess: () => {
          if (isMountedRef.current) {
            setStatus('Ringing...');
            setIsJoined(true);
          }
        },
        onUserJoined: (_connection, uid) => {
          if (isMountedRef.current) {
            setStatus('Live');
            setRemoteUid(uid);
          }
        },
        onUserOffline: () => terminateSession('visitor-left'),
        onError: (err) => console.log('[CallScreen] Agora error:', err),
      });

      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      engine.joinChannel('', channelName, 0, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });

    } catch (e) {
      console.log('[CallScreen] Setup Error:', e);
    }
  };

  const terminateSession = async (caller = 'unknown') => {
    if (hasTerminated.current) return;
    hasTerminated.current = true;

    console.log('[CallScreen] terminateSession called by:', caller);

    if (caller !== 'visitor-left') {
      try {
        endCallSignal();
        console.log('[CallScreen] CALL_ENDED signal sent to visitor');
      } catch (e) {
        console.log('[CallScreen] endCallSignal error:', e);
      }
    }

    if (agoraEngineRef.current) {
      try {
        agoraEngineRef.current.stopPreview();
        agoraEngineRef.current.leaveChannel();
        await new Promise(r => setTimeout(r, 100));
        agoraEngineRef.current.release();
        agoraEngineRef.current = null;
      } catch (e) {
        console.log('[CallScreen] Terminate Error:', e);
      }
    }

    if (isMountedRef.current) {
      setIsJoined(false);
      setRemoteUid(0);
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Main View (Visitor) */}
      <View style={styles.remoteView}>
        {remoteUid !== 0 ? (
          <RtcSurfaceView canvas={{ uid: remoteUid }} style={styles.videoFill} />
        ) : (
          <LinearGradient colors={['#1C1C1E', '#000000']} style={styles.waitingContainer}>
            <View style={styles.pulseRingOuter}>
              <View style={[styles.pulseRingInner, { backgroundColor: 'rgba(0,122,255,0.1)' }]}>
                <MaterialCommunityIcons name="account-search" size={60} color="#007AFF" />
              </View>
            </View>
            <Text style={styles.waitingText}>{status}</Text>
            <Text style={styles.waitingSub}>Connecting you to the visitor...</Text>
          </LinearGradient>
        )}
      </View>

      {/* 2. Top Bar Information */}
      <View style={styles.topBar}>
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={styles.topGradient}
        >
          <View style={styles.topContent}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={20} color="white" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.userName}>{displayName}</Text>
                <Text style={styles.houseLabel}>House {houseNo}</Text>
              </View>
            </View>
            <View style={styles.durationBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.timerText}>{formatTime(callDuration)}</Text>
            </View>
          </View>

          {/* ── NEW: Silent Mode indicator in top bar ── */}
          {isSilentMode && (
            <View style={styles.silentModeIndicator}>
              <MaterialCommunityIcons name="bell-off" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.silentModeText}>Silent Mode Active</Text>
            </View>
          )}
        </LinearGradient>
      </View>

      {/* 3. Floating View (Privacy Mode) */}
      <View style={styles.localView}>
        <LinearGradient colors={['#323232', '#121212']} style={styles.privacyBox}>
          <MaterialCommunityIcons name="eye-off" size={28} color="rgba(255,255,255,0.4)" />
          <Text style={styles.privacyLabel}>Hidden</Text>
        </LinearGradient>
      </View>

      {/* 4. Quick Replies (Floating Chips) */}
      <View style={styles.liveQuickReplies}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          <TouchableOpacity style={styles.replyChip} onPress={() => sendQuickReply("Wait 1 min!")}>
            <Text style={styles.replyChipText}>⏳ Wait 1 Min</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.replyChip} onPress={() => sendQuickReply("I am coming!")}>
            <Text style={styles.replyChipText}>🏃 Coming!</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.replyChip} onPress={() => sendQuickReply("Leave it there.")}>
            <Text style={styles.replyChipText}>📦 Leave there</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.replyChip} onPress={() => sendQuickReply("Who is this?")}>
            <Text style={styles.replyChipText}>❓ Who is it?</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 5. Controls Dock */}
      <View style={styles.controlsDock}>
        <LinearGradient
          colors={['rgba(28,28,30,0.85)', 'rgba(28,28,30,0.95)']}
          style={styles.dockGradient}
        >
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.mutedBtn]}
            onPress={() => {
              setIsMuted(!isMuted);
              agoraEngineRef.current?.muteLocalAudioStream(!isMuted);
            }}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={26} color="white" />
            {/* Show indicator if muted due to Silent Mode */}
            {isMuted && activeCall?.shouldAutoMute && (
              <View style={styles.autoMuteBadge}>
                <Text style={styles.autoMuteBadgeText}>AUTO</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.endCallBtn} onPress={() => terminateSession('button')}>
            <MaterialCommunityIcons name="phone-hangup" size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={() => agoraEngineRef.current?.switchCamera()}>
            <Ionicons name="camera-reverse" size={26} color="white" />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  remoteView: { flex: 1 },
  videoFill: { width: '100%', height: '100%' },

  waitingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pulseRingOuter: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(0,122,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  pulseRingInner: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  waitingText: { color: 'white', fontSize: 24, fontWeight: '800', marginTop: 30 },
  waitingSub: { color: '#8E8E93', fontSize: 16, marginTop: 10, fontWeight: '500' },

  topBar: { position: 'absolute', top: 0, width: '100%', zIndex: 10 },
  topGradient: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 25 },
  topContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  userName: { color: 'white', fontSize: 18, fontWeight: '800' },
  houseLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30', marginRight: 8 },
  timerText: { color: 'white', fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },

  // ── NEW: Silent Mode indicator ──
  silentModeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(142, 142, 147, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10,
    alignSelf: 'flex-start',
    gap: 6,
  },
  silentModeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '700',
  },

  localView: { position: 'absolute', top: 120, right: 20, width: 100, height: 150, borderRadius: 25, overflow: 'hidden', zIndex: 5, elevation: 10 },
  privacyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  privacyLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', marginTop: 10, textTransform: 'uppercase' },

  controlsDock: { position: 'absolute', bottom: 40, width: width * 0.85, alignSelf: 'center', borderRadius: 35, overflow: 'hidden', elevation: 20 },
  dockGradient: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10 },
  controlBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  mutedBtn: { backgroundColor: '#FF3B30' },
  
  // ── NEW: Auto-mute badge ──
  autoMuteBadge: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: '#34C759',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'white',
  },
  autoMuteBadgeText: {
    color: 'white',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  
  endCallBtn: { width: 75, height: 75, borderRadius: 37.5, backgroundColor: '#FF3B30', justifyContent: 'center', alignItems: 'center' },

  liveQuickReplies: { position: 'absolute', bottom: 140, width: '100%', paddingLeft: 20 },
  chipScroll: { paddingRight: 40 },
  replyChip: { backgroundColor: 'rgba(0,122,255,0.9)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  replyChipText: { color: 'white', fontWeight: '800', fontSize: 13 },
});