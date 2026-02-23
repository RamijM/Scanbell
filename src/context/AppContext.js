// context/AppContext.js
import React, { createContext, useState, useEffect, useRef } from 'react';
import { Vibration, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AgoraRTM from 'agora-rtm-sdk';
import Sound from 'react-native-sound';
import notifee, { AndroidImportance, AndroidVisibility } from '@notifee/react-native';

const USER_DETAILS_KEY = '@user_details';
const LOGS_STORAGE_KEY = 'doorvi_call_logs';
const SAVED_VISITORS_KEY = 'doorvi_saved_visitors';
const BLACKLIST_KEY = 'doorvi_blacklist';
const APP_ID = '469ff9909237486f8e9bf8526e09899c';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetailsState] = useState({
    email: '',
    name: '',
    userType: '',
    propertyType: '',
    callType: 'audio',
    houseNo: '',
    address: ''
  });

  // RTM / Call States
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [rtmStatus, setRtmStatus] = useState('Disconnected');
  const [savedVisitors, setSavedVisitors] = useState({});
  const [blacklist, setBlacklist] = useState([]);
  const rtmClientRef = useRef(null);
  const isLoggingIn = useRef(false);

  // Load details on mount
  useEffect(() => {
    const loadDetails = async () => {
      try {
        const savedData = await AsyncStorage.getItem(USER_DETAILS_KEY);
        if (savedData) {
          setUserDetailsState(JSON.parse(savedData));
        }

        const visitors = await AsyncStorage.getItem(SAVED_VISITORS_KEY);
        if (visitors) setSavedVisitors(JSON.parse(visitors));

        const blacklisted = await AsyncStorage.getItem(BLACKLIST_KEY);
        if (blacklisted) setBlacklist(JSON.parse(blacklisted));
      } catch (e) {
        console.log('[AppContext] Load Error:', e);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, []);

  // Background Service & RTM Logic
  useEffect(() => {
    if (loading || !userDetails.houseNo) {
      if (rtmClientRef.current) {
        rtmClientRef.current.logout();
      }
      stopForegroundService();
      return;
    }

    startForegroundService();

    const initRTM = async () => {
      if (isLoggingIn.current) return;
      isLoggingIn.current = true;
      setRtmStatus('Connecting...');

      try {
        if (!rtmClientRef.current) {
          rtmClientRef.current = AgoraRTM.createInstance(APP_ID);
        }
        const client = rtmClientRef.current;
        const rtmUserId = `house_${userDetails.houseNo}`;

        client.removeAllListeners();

        // Connection State Monitoring
        client.on('ConnectionStateChanged', (newState, reason) => {
          console.log(`[RTM] 🌐 Status: ${newState} (${reason})`);
          setRtmStatus(newState);
        });

        client.on('MessageFromPeer', async (message, peerId) => {
          console.log('[RTM] 📥 Global Message Received');
          try {
            if (message.text.startsWith('{')) {
              const payload = JSON.parse(message.text);
              if (payload.event === 'CALL_REQUEST') {
                handleIncomingCall(peerId, payload.image);
              }
            } else if (message.text.startsWith('VISITOR_NOTE:')) {
              const note = message.text.replace('VISITOR_NOTE:', '');
              handleVisitorNote(peerId, note);
            } else if (message.text === 'CALL_REQUEST') {
              handleIncomingCall(peerId, null);
            }
          } catch (e) {
            console.log('[RTM] Msg Parse Error', e);
          }
        });

        await client.login({ uid: rtmUserId });
        client.isLoggedIn = true;
        setRtmStatus('CONNECTED');
        console.log(`[RTM] ✅ Global Login Successful for: ${rtmUserId}`);
      } catch (err) {
        setRtmStatus('Error');
        console.log('[RTM] ❌ Global Login Error:', err.reason || err);
      } finally {
        isLoggingIn.current = false;
      }
    };

    if (!rtmClientRef.current?.isLoggedIn) {
      initRTM();
    }
  }, [loading, userDetails.houseNo]);

  const handleIncomingCall = (peerId, visitorImage) => {
    const isBlacklisted = blacklist.includes(peerId);
    setIncomingCall({ visitorId: peerId, image: visitorImage });

    // Only ring and vibrate if NOT blacklisted
    if (!isBlacklisted) {
      playSystemDoorbell();
      Vibration.vibrate([500, 1000, 500, 1000], true);
    }

    showIncomingCallNotification(peerId, visitorImage, isBlacklisted);
    saveCallLogLocally(peerId, 'Missed', visitorImage);
  };

  const handleVisitorNote = (peerId, note) => {
    const visitorName = savedVisitors[peerId] || 'Visitor';
    showNoteNotification(visitorName, note);
    saveCallLogLocally(peerId, `Note: ${note}`, null);
  };

  const showNoteNotification = async (name, note) => {
    const channelId = await notifee.createChannel({
      id: 'visitor_notes',
      name: 'Visitor Notes',
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: `📝 Message from ${name}`,
      body: note,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  };

  /* ================= NOTIFEE BACKGROUND SERVICE ================= */

  const startForegroundService = async () => {
    if (Platform.OS !== 'android') return;

    try {
      const channelId = await notifee.createChannel({
        id: 'scanbell_service',
        name: 'Scanbell Active Service',
        importance: AndroidImportance.LOW,
      });

      await notifee.displayNotification({
        id: 'service_notification',
        title: 'Scanbell is Active',
        body: 'Monitoring your door for visitors...',
        android: {
          channelId,
          asForegroundService: true,
          ongoing: true,
          pressAction: { id: 'default' },
        },
      });
    } catch (e) {
      console.log('[ForegroundService] Start Error:', e);
    }
  };

  const stopForegroundService = async () => {
    if (Platform.OS === 'android') {
      await notifee.stopForegroundService();
    }
  };

  const showIncomingCallNotification = async (visitorId, image, isBlacklisted = false) => {
    const channelId = await notifee.createChannel({
      id: 'incoming_calls',
      name: 'Incoming Calls',
      importance: isBlacklisted ? AndroidImportance.LOW : AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
    });

    const visitorName = savedVisitors[visitorId] || 'Unknown Visitor';

    await notifee.displayNotification({
      title: isBlacklisted ? '🔇 Blacklisted Call Muted' : '🚨 Visitor at Door!',
      body: `${visitorName} is calling for House ${userDetails.houseNo}`,
      android: {
        channelId,
        importance: isBlacklisted ? AndroidImportance.LOW : AndroidImportance.HIGH,
        ongoing: !isBlacklisted,
        largeIcon: image || undefined,
        fullScreenAction: { id: 'default' },
        pressAction: { id: 'default' },
        actions: [
          { title: '✅ Accept', pressAction: { id: 'accept' } },
          { title: '❌ Decline', pressAction: { id: 'decline' } },
        ],
      },
    });
  };

  const saveVisitorName = async (visitorId, name) => {
    const updated = { ...savedVisitors, [visitorId]: name };
    setSavedVisitors(updated);
    await AsyncStorage.setItem(SAVED_VISITORS_KEY, JSON.stringify(updated));
  };

  const toggleBlacklist = async (visitorId) => {
    let updated;
    if (blacklist.includes(visitorId)) {
      updated = blacklist.filter(id => id !== visitorId);
    } else {
      updated = [...blacklist, visitorId];
    }
    setBlacklist(updated);
    await AsyncStorage.setItem(BLACKLIST_KEY, JSON.stringify(updated));
  };

  /* ================= HELPERS ================= */

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

  const saveCallLogLocally = async (visitorId, status = 'Missed', image = null) => {
    try {
      const newEntry = {
        id: Date.now().toString(),
        house_no: userDetails.houseNo,
        status: status,
        image: image,
        created_at: new Date().toISOString(),
      };
      const existingData = await AsyncStorage.getItem(LOGS_STORAGE_KEY);
      const savedLogs = existingData ? JSON.parse(existingData) : [];

      // If updating an existing missed call to 'Answered'
      const updatedLogs = [newEntry, ...savedLogs].slice(0, 50);
      await AsyncStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (e) {
      console.error('Failed to save log', e);
    }
  };

  const acceptCall = () => {
    Vibration.cancel();
    notifee.cancelNotification('incoming_calls');
    if (rtmClientRef.current && incomingCall?.visitorId) {
      rtmClientRef.current.sendMessageToPeer({ text: 'CALL_ACCEPTED' }, incomingCall.visitorId)
        .catch(e => console.log('[RTM] Accept Signal Error:', e));

      // Track the active call session
      setActiveCall({
        visitorId: incomingCall.visitorId,
        image: incomingCall.image
      });
    }
    // Update the log we just made from 'Missed' to 'Answered' if possible, 
    // but for simplicity here we just log it as a new event or same status
    saveCallLogLocally(incomingCall?.visitorId || 'Visitor', 'Answered', incomingCall?.image);
    setIncomingCall(null);
  };

  const endCallSignal = () => {
    if (rtmClientRef.current && activeCall?.visitorId) {
      console.log('[RTM] 🔔 Sending End Call Signal to:', activeCall.visitorId);
      rtmClientRef.current.sendMessageToPeer({ text: 'CALL_ENDED' }, activeCall.visitorId)
        .catch(e => console.log('[RTM] End Signal Error:', e));
    }
    setActiveCall(null);
    setIncomingCall(null);
  };

  const sendQuickReply = (message) => {
    const targetId = incomingCall?.visitorId || activeCall?.visitorId;
    if (rtmClientRef.current && targetId) {
      console.log(`[RTM] 💬 Sending Quick Reply: ${message} to ${targetId}`);
      rtmClientRef.current.sendMessageToPeer({ text: `QUICK_REPLY:${message}` }, targetId)
        .catch(e => console.log('[RTM] Quick Reply Error:', e));
    }
  };

  const declineCall = () => {
    Vibration.cancel();
    notifee.cancelNotification('incoming_calls');
    if (rtmClientRef.current && incomingCall?.visitorId) {
      rtmClientRef.current.sendMessageToPeer({ text: 'CALL_REJECTED' }, incomingCall.visitorId)
        .catch(e => console.log('[RTM] Decline Signal Error:', e));
    }
    setIncomingCall(null);
  };

  const setUserDetails = async (details) => {
    try {
      const newDetails = typeof details === 'function' ? details(userDetails) : details;
      setUserDetailsState(newDetails);
      await AsyncStorage.setItem(USER_DETAILS_KEY, JSON.stringify(newDetails));
    } catch (e) {
      console.log('[AppContext] Save Error:', e);
    }
  };

  const logout = async () => {
    try {
      if (rtmClientRef.current) {
        await rtmClientRef.current.logout();
        rtmClientRef.current.isLoggedIn = false;
      }
      stopForegroundService();
      await AsyncStorage.removeItem(USER_DETAILS_KEY);
      setUserDetailsState({
        email: '', name: '', userType: '', propertyType: '',
        callType: 'audio', houseNo: '', address: ''
      });
    } catch (e) {
      console.log('[AppContext] Logout Error:', e);
    }
  };

  return (
    <AppContext.Provider value={{
      userDetails, setUserDetails, loading, logout,
      incomingCall, setIncomingCall, acceptCall, declineCall,
      activeCall, setActiveCall, endCallSignal,
      showIncomingCallNotification, rtmStatus,
      savedVisitors, saveVisitorName,
      blacklist, toggleBlacklist,
      sendQuickReply
    }}>
      {children}
    </AppContext.Provider>
  );
};