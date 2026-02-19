import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
} from 'react-native-agora';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export default function CallScreen({ navigation }) {
  const { userDetails } = useContext(AppContext);
  const agoraEngineRef = useRef(null);
  const hasTerminated = useRef(false);
  const isMountedRef = useRef(true); // ✅ track if component is still mounted

  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(0);
  const [status, setStatus] = useState('Setting up camera...');

  const appId = '469ff9909237486f8e9bf8526e09899c';
  const channelName = `house_${userDetails?.houseNo || '32'}_channel`;

  useEffect(() => {
    console.log('[CallScreen] ✅ Mounted');
    isMountedRef.current = true;
    hasTerminated.current = false; // ✅ reset on every fresh mount
    setupVideoSDKEngine();

    return () => {
      console.log('[CallScreen] 🔴 Unmounting — running cleanup');
      isMountedRef.current = false; // ✅ mark as unmounted
      terminateSession('unmount');
    };
  }, []);

  const setupVideoSDKEngine = async () => {
    console.log('[CallScreen] 🔧 Setting up engine...');
    try {
      if (Platform.OS === 'android') {
        console.log('[CallScreen] 📱 Requesting permissions...');
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        console.log('[CallScreen] 📱 Permissions:', result);
      }

      if (agoraEngineRef.current) {
        console.log('[CallScreen] ⚠️ Engine already exists, skipping');
        return;
      }

      console.log('[CallScreen] 🏗️ Creating engine...');
      agoraEngineRef.current = createAgoraRtcEngine();
      const engine = agoraEngineRef.current;

      engine.initialize({ appId });
      console.log('[CallScreen] ✅ Engine initialized');

      engine.enableVideo();
      console.log('[CallScreen] 📹 Video enabled');

      engine.registerEventHandler({
        onJoinChannelSuccess: () => {
          console.log('[CallScreen] ✅ Joined channel:', channelName);
          if (isMountedRef.current) { // ✅ only set state if still mounted
            setStatus('Ready - Waiting for Visitor');
            setIsJoined(true);
          }
        },
        onUserJoined: (_connection, uid) => {
          console.log('[CallScreen] 👤 Visitor joined uid:', uid);
          if (isMountedRef.current) {
            setStatus('Visitor Connected!');
            setRemoteUid(uid);
          }
        },
        onUserOffline: (_connection, uid) => {
          console.log('[CallScreen] 👤 Visitor left uid:', uid);
          if (isMountedRef.current) {
            setStatus('Visitor Disconnected');
            setRemoteUid(0);
          }
        },
        onLeaveChannel: () => {
          console.log('[CallScreen] 📤 onLeaveChannel fired');
        },
        onError: (err) => {
          console.log('[CallScreen] ❌ Agora error:', err);
        },
      });

      await join();
    } catch (e) {
      console.log('[CallScreen] ❌ Setup Error:', e);
    }
  };

  const join = async () => {
    console.log('[CallScreen] 📞 Joining channel:', channelName);
    try {
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );
      agoraEngineRef.current?.joinChannel('', channelName, 0, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
      console.log('[CallScreen] 📞 joinChannel() called');
    } catch (e) {
      console.log('[CallScreen] ❌ Join Error:', e);
    }
  };

  const terminateSession = async (caller = 'unknown') => {
    console.log(`[CallScreen] 🛑 terminateSession() called by: ${caller}`);

    if (hasTerminated.current) {
      console.log('[CallScreen] ⚠️ Already terminated, skipping');
      return;
    }

    if (!agoraEngineRef.current) {
      console.log('[CallScreen] ⚠️ No engine found, nothing to terminate');
      hasTerminated.current = true;
      return;
    }

    hasTerminated.current = true;

    try {
      console.log('[CallScreen] 📤 Calling leaveChannel()...');
      agoraEngineRef.current.leaveChannel();

      // Wait for leaveChannel to complete before release
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('[CallScreen] 💥 Calling release()...');
      agoraEngineRef.current.release();
      agoraEngineRef.current = null;
      console.log('[CallScreen] ✅ Engine destroyed, ref = null');
    } catch (e) {
      console.log('[CallScreen] ❌ Terminate Error:', e);
      agoraEngineRef.current = null;
    }

    // ✅ Only update state if component is still mounted
    if (isMountedRef.current) {
      setIsJoined(false);
      setRemoteUid(0);
    }

    console.log('[CallScreen] ✅ terminateSession() complete');
  };

  const leave = async () => {
    console.log('[CallScreen] 🔴 Leave button pressed');
    await terminateSession('leave-button');
    console.log('[CallScreen] 🏠 Navigating to Home...');
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {/* 1. Full Screen: Remote Visitor Video */}
      <View style={styles.remoteView}>
        {remoteUid !== 0 ? (
          <RtcSurfaceView
            canvas={{ uid: remoteUid }}
            style={styles.videoFill}
          />
        ) : (
          <View style={styles.waitingBox}>
            <Ionicons name="person-outline" size={100} color="#666" />
            <Text style={styles.waitingText}>{status}</Text>
            <Text style={styles.channelText}>Channel: {channelName}</Text>
          </View>
        )}
      </View>

      {/* 2. Floating Window: Your Local Video */}
      <View style={styles.localView}>
        {isJoined ? (
          <RtcSurfaceView
            canvas={{ uid: 0 }}
            style={styles.videoFill}
          />
        ) : null}
      </View>

      {/* 3. Bottom Controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.endCallBtn} onPress={leave}>
          <Ionicons name="call" size={32} color="white" />
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
  waitingText: { color: 'white', fontSize: 18, marginTop: 20 },
  channelText: { color: '#666', fontSize: 12, marginTop: 5 },
  localView: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 110,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  endCallBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
    elevation: 5,
  },
});