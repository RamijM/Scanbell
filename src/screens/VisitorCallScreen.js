import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
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

export default function VisitorCallScreen({ route, navigation }) {
  const agoraEngineRef = useRef(null);
  const hasTerminated = useRef(false);
  const isMountedRef = useRef(true);

  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  const [status, setStatus] = useState('Connecting...');
  const [isMuted, setIsMuted] = useState(false);

  const channelName = route.params?.channel || 'default_channel';
  const appId = route.params?.appId || '469ff9909237486f8e9bf8526e09899c';

  useEffect(() => {
    isMountedRef.current = true;
    hasTerminated.current = false;
    setupEngine();

    return () => {
      isMountedRef.current = false;
      terminateSession('unmount');
    };
  }, []);

  const setupEngine = async () => {
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

      engine.registerEventHandler({
        onJoinChannelSuccess: () => {
          if (isMountedRef.current) {
            setStatus('Ringing homeowner...');
            setIsJoined(true);
          }
        },
        onUserJoined: (_connection, uid) => {
          if (isMountedRef.current) {
            setStatus('Connected!');
            setRemoteUid(uid);
          }
        },
        onUserOffline: () => {
          if (isMountedRef.current) {
            setStatus('Call ended');
            setRemoteUid(0);
          }
        },
        onError: (err) => console.log('[VisitorCall] Agora error:', err),
      });

      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      engine.joinChannel('', channelName, 2, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });

    } catch (e) {
      console.log('[VisitorCall] Setup error:', e);
    }
  };

  const terminateSession = async (caller = 'unknown') => {
    if (hasTerminated.current) return;
    if (!agoraEngineRef.current) {
      hasTerminated.current = true;
      return;
    }

    hasTerminated.current = true;
    try {
      agoraEngineRef.current.leaveChannel();
      await new Promise(r => setTimeout(r, 300));
      agoraEngineRef.current.release();
      agoraEngineRef.current = null;
    } catch (e) {
      console.log('[VisitorCall] Terminate error:', e);
      agoraEngineRef.current = null;
    }

    if (isMountedRef.current) {
      setIsJoined(false);
      setRemoteUid(0);
    }
  };

  const endCall = async () => {
    await terminateSession('end-button');
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const toggleMute = () => {
    if (agoraEngineRef.current) {
      const newVal = !isMuted;
      agoraEngineRef.current.muteLocalAudioStream(newVal);
      setIsMuted(newVal);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Main View (Homeowner - if they enable camera, but usually they don't in this app) */}
      <View style={styles.remoteView}>
        {remoteUid !== 0 ? (
          <RtcSurfaceView
            canvas={{ uid: remoteUid }}
            style={styles.videoFill}
          />
        ) : (
          <LinearGradient colors={['#1C1C1E', '#000000']} style={styles.waitingContainer}>
            <View style={styles.pulseRingOuter}>
              <View style={[styles.pulseRingInner, { backgroundColor: 'rgba(52,199,89,0.1)' }]}>
                <Ionicons name="notifications-outline" size={60} color="#34C759" />
              </View>
            </View>
            <Text style={styles.waitingText}>{status}</Text>
            <Text style={styles.waitingSub}>Notifying the resident of your arrival...</Text>
          </LinearGradient>
        )}
      </View>

      {/* Local Video - Visitor's own camera */}
      <View style={styles.localView}>
        {isJoined ? (
          <RtcSurfaceView
            canvas={{ uid: 0 }}
            style={styles.videoFill}
          />
        ) : (
          <View style={styles.localPlaceholder}>
            <Ionicons name="person" size={40} color="#333" />
          </View>
        )}
      </View>

      {/* Top Labels */}
      <View style={styles.topBar}>
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={styles.topGradient}
        >
          <View style={styles.topContent}>
            <View style={styles.badgeRow}>
              <View style={styles.callBadge}>
                <MaterialCommunityIcons name="video" size={16} color="white" />
                <Text style={styles.badgeText}>Scanbell Call</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Controls Dock */}
      <View style={styles.controlsDock}>
        <LinearGradient
          colors={['rgba(28,28,30,0.85)', 'rgba(28,28,30,0.95)']}
          style={styles.dockGradient}
        >
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.mutedBtn]}
            onPress={toggleMute}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={26} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
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
  pulseRingOuter: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(52,199,89,0.05)', justifyContent: 'center', alignItems: 'center' },
  pulseRingInner: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  waitingText: { color: 'white', fontSize: 24, fontWeight: '800', marginTop: 30 },
  waitingSub: { color: '#8E8E93', fontSize: 16, marginTop: 10, fontWeight: '500', textAlign: 'center', paddingHorizontal: 40, lineHeight: 24 },

  localView: { position: 'absolute', top: 120, right: 20, width: 110, height: 160, borderRadius: 25, overflow: 'hidden', zIndex: 5, elevation: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  localPlaceholder: { flex: 1, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center' },

  topBar: { position: 'absolute', top: 0, width: '100%', zIndex: 10 },
  topGradient: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 25 },
  topContent: { alignItems: 'center' },
  badgeRow: { flexDirection: 'row', justifyContent: 'center' },
  callBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(52,199,89,0.8)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  badgeText: { color: 'white', fontSize: 14, fontWeight: '800', marginLeft: 8 },

  controlsDock: { position: 'absolute', bottom: 40, width: width * 0.85, alignSelf: 'center', borderRadius: 35, overflow: 'hidden', elevation: 20 },
  dockGradient: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10 },
  controlBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  mutedBtn: { backgroundColor: '#FF3B30' },
  endCallBtn: { width: 75, height: 75, borderRadius: 37.5, backgroundColor: '#FF3B30', justifyContent: 'center', alignItems: 'center' },
});
