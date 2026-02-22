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

const { width, height } = Dimensions.get('window');

export default function VisitorCallScreen({ route, navigation }) {
  const agoraEngineRef = useRef(null);
  const hasTerminated = useRef(false);
  const isMountedRef = useRef(true);

  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  const [status, setStatus] = useState('Connecting...');
  const [isMuted, setIsMuted] = useState(false);

  // Read params from deep link: doorvi://call?channel=X&appId=Y
  const channelName = route.params?.channel || 'default_channel';
  const appId = route.params?.appId || '469ff9909237486f8e9bf8526e09899c';

  useEffect(() => {
    console.log('[VisitorCall] ✅ Mounted | channel:', channelName);
    isMountedRef.current = true;
    hasTerminated.current = false;
    setupEngine();

    return () => {
      console.log('[VisitorCall] 🔴 Unmounting');
      isMountedRef.current = false;
      terminateSession('unmount');
    };
  }, []);

  const setupEngine = async () => {
    try {
      // Request permissions on Android
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
          console.log('[VisitorCall] ✅ Joined channel:', channelName);
          if (isMountedRef.current) {
            setStatus('Ringing homeowner...');
            setIsJoined(true);
          }
        },
        onUserJoined: (_connection, uid) => {
          console.log('[VisitorCall] 👤 Homeowner joined uid:', uid);
          if (isMountedRef.current) {
            setStatus('Connected!');
            setRemoteUid(uid);
          }
        },
        onUserOffline: (_connection, uid) => {
          console.log('[VisitorCall] 👤 Homeowner left uid:', uid);
          if (isMountedRef.current) {
            setStatus('Homeowner disconnected');
            setRemoteUid(0);
          }
        },
        onError: (err) => {
          console.log('[VisitorCall] ❌ Agora error:', err);
        },
      });

      // Join as UID 2 = Visitor (matches the convention in HomeScreen listener)
      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      engine.joinChannel('', channelName, 2, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });

      console.log('[VisitorCall] 📞 Joining as UID 2 on:', channelName);
    } catch (e) {
      console.log('[VisitorCall] ❌ Setup error:', e);
    }
  };

  const terminateSession = async (caller = 'unknown') => {
    console.log(`[VisitorCall] 🛑 terminateSession by: ${caller}`);
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
      console.log('[VisitorCall] ❌ Terminate error:', e);
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
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Remote video (homeowner) — full screen */}
      <View style={styles.remoteView}>
        {remoteUid !== 0 ? (
          <RtcSurfaceView
            canvas={{ uid: remoteUid }}
            style={styles.videoFill}
          />
        ) : (
          <View style={styles.waitingBox}>
            <View style={styles.pulseRing}>
              <View style={styles.callingIcon}>
                <Ionicons name="call" size={40} color="white" />
              </View>
            </View>
            <Text style={styles.statusText}>{status}</Text>
            <Text style={styles.channelText}>Channel: {channelName}</Text>
          </View>
        )}
      </View>

      {/* Local video (visitor's own camera) — floating PiP */}
      <View style={styles.localView}>
        {isJoined ? (
          <RtcSurfaceView
            canvas={{ uid: 0 }}
            style={styles.videoFill}
          />
        ) : (
          <View style={styles.localPlaceholder}>
            <Ionicons name="person" size={30} color="#666" />
          </View>
        )}
      </View>

      {/* Top label */}
      <View style={styles.topBar}>
        <View style={styles.topLabelContainer}>
          <Ionicons name="videocam" size={16} color="#4CAF50" />
          <Text style={styles.topLabel}>DoorVi Visitor Call</Text>
        </View>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        <View style={styles.controlsRow}>
          {/* Mute */}
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
            onPress={toggleMute}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={24}
              color="white"
            />
            <Text style={styles.controlLabel}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>

          {/* End Call */}
          <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
            <Ionicons
              name="call"
              size={32}
              color="white"
              style={{ transform: [{ rotate: '135deg' }] }}
            />
          </TouchableOpacity>

          {/* Placeholder for symmetry */}
          <View style={styles.controlBtn}>
            <Ionicons name="chatbubble-ellipses" size={24} color="white" />
            <Text style={styles.controlLabel}>Chat</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },

  // Remote video
  remoteView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  videoFill: { width: '100%', height: '100%' },

  // Waiting state
  waitingBox: { alignItems: 'center' },
  pulseRing: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
  },
  callingIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center', alignItems: 'center',
  },
  statusText: { color: 'white', fontSize: 20, fontWeight: '600', marginBottom: 8 },
  channelText: { color: '#666', fontSize: 12 },

  // Local PiP
  localView: {
    position: 'absolute', top: 60, right: 20,
    width: 110, height: 160, borderRadius: 16,
    overflow: 'hidden', backgroundColor: '#1C1C1E',
    borderWidth: 2, borderColor: '#333',
    elevation: 8,
  },
  localPlaceholder: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },

  // Top bar
  topBar: {
    position: 'absolute', top: 16, left: 0, right: 0,
    alignItems: 'center',
  },
  topLabelContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
  },
  topLabel: { color: 'white', fontSize: 14, fontWeight: '600', marginLeft: 8 },

  // Bottom controls
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingBottom: 40, paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  controlBtn: { alignItems: 'center', width: 70 },
  controlBtnActive: { opacity: 0.6 },
  controlLabel: { color: 'white', fontSize: 11, marginTop: 6 },
  endCallBtn: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#FF3B30',
    justifyContent: 'center', alignItems: 'center',
    elevation: 5,
  },
});
