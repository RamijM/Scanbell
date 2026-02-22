import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  View, StyleSheet, PermissionsAndroid, Platform, Text, TouchableOpacity,
  Dimensions, StatusBar,
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

const { width } = Dimensions.get('window');

export default function CallScreen({ navigation }) {
  const { userDetails } = useContext(AppContext);
  const agoraEngineRef = useRef(null);
  const hasTerminated = useRef(false);
  const isMountedRef = useRef(true);
  const timerRef = useRef(null);

  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  const [status, setStatus] = useState('Setting up camera...');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const appId = '469ff9909237486f8e9bf8526e09899c';
  const channelName = `house_${userDetails?.houseNo || '32'}_channel`;

  // ── Call Timer ────────────────────────────────────────────────────────────
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

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    console.log('[CallScreen] ✅ Mounted (Safe Version)');
    isMountedRef.current = true;
    hasTerminated.current = false;
    setupVideoSDKEngine();

    return () => {
      console.log('[CallScreen] 🔴 Unmounting');
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

      // LOCK PRIVACY: Admin can see visitor, but visitor sees black
      engine.muteLocalVideoStream(true);
      console.log('[CallScreen] 🔒 Privacy Mode Active');

      engine.registerEventHandler({
        onJoinChannelSuccess: () => {
          if (isMountedRef.current) {
            setStatus('Ready — Waiting for Visitor');
            setIsJoined(true);
          }
        },
        onUserJoined: (_connection, uid) => {
          if (isMountedRef.current) {
            setStatus('Visitor Connected!');
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
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* 1. Main View (Visitor) */}
      <View style={styles.remoteView}>
        {remoteUid !== 0 ? (
          <RtcSurfaceView canvas={{ uid: remoteUid }} style={styles.videoFill} />
        ) : (
          <View style={styles.waitingBox}>
            <View style={styles.waitingIconRing}>
              <Ionicons name="person" size={60} color="#007AFF" />
            </View>
            <Text style={styles.waitingText}>{status}</Text>
          </View>
        )}
      </View>

      {/* 2. Floating View (Local - and privacy reminder) */}
      <View style={styles.localView}>
        <View style={styles.privacyOverlay}>
          <Ionicons name="eye-off" size={24} color="#FFF" />
          <Text style={styles.privacyText}>Hidden</Text>
        </View>
      </View>

      {/* 3. Top Info Overlay */}
      <View style={styles.topBar}>
        <Text style={styles.channelLabel}>HOUSE {userDetails?.houseNo || '32'}</Text>
        <Text style={styles.timerText}>{formatTime(callDuration)}</Text>
      </View>

      {/* 4. Controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.controlBtn, isMuted && styles.mutedBtn]}
          onPress={() => {
            setIsMuted(!isMuted);
            agoraEngineRef.current?.muteLocalAudioStream(!isMuted);
          }}
        >
          <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.endCallBtn} onPress={() => terminateSession('button')}>
          <Ionicons name="call" size={32} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={() => agoraEngineRef.current?.switchCamera()}>
          <Ionicons name="camera-reverse" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  remoteView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  videoFill: { width: '100%', height: '100%' },
  waitingBox: { alignItems: 'center' },
  waitingIconRing: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  waitingText: { color: 'white', fontSize: 18, fontWeight: '600' },
  localView: { position: 'absolute', top: 60, right: 20, width: 100, height: 140, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000', borderWidth: 2, borderColor: '#333' },
  privacyOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
  privacyText: { color: 'white', fontSize: 10, marginTop: 5 },
  topBar: { position: 'absolute', top: 20, width: '100%', alignItems: 'center' },
  channelLabel: { color: '#666', letterSpacing: 2, fontSize: 12 },
  timerText: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  bottomBar: { position: 'absolute', bottom: 50, flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', alignItems: 'center' },
  controlBtn: { width: 55, height: 55, borderRadius: 28, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  mutedBtn: { backgroundColor: '#FF3B30' },
  endCallBtn: { width: 75, height: 75, borderRadius: 38, backgroundColor: '#FF3B30', justifyContent: 'center', alignItems: 'center', elevation: 10 },
});