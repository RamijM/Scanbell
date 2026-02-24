// context/AppContext.js
import React, { createContext, useState, useEffect, useRef } from 'react';
import { Vibration, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AgoraRTM from 'agora-rtm-sdk';
import Sound from 'react-native-sound';
import notifee, { AndroidImportance, AndroidVisibility } from '@notifee/react-native';

const USER_DETAILS_KEY      = '@user_details';
const LOGS_STORAGE_KEY      = 'doorvi_call_logs';
const NOTIFICATIONS_KEY     = 'doorvi_notifications';   // ← NEW: separate notification store
const SAVED_VISITORS_KEY    = 'doorvi_saved_visitors';
const BLACKLIST_KEY         = 'doorvi_blacklist';
const SILENT_MODE_KEY       = '@silent_mode_enabled'; // Add this key
const APP_ID                = '469ff9909237486f8e9bf8526e09899c';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetailsState] = useState({
    email: '', name: '', userType: '', propertyType: '',
    callType: 'audio', houseNo: '', address: ''
  });

  const [incomingCall, setIncomingCall]     = useState(null);
  const [activeCall, setActiveCall]         = useState(null);
  const [rtmStatus, setRtmStatus]           = useState('Disconnected');
  const [savedVisitors, setSavedVisitors]   = useState({});
  const [blacklist, setBlacklist]           = useState([]);
  const [notifications, setNotifications]   = useState([]);   // ← in-memory for badge count
  // 1. ADD SILENT MODE STATE
  const [isSilentMode, setIsSilentMode]     = useState(false);
  const rtmClientRef  = useRef(null);
  const isLoggingIn   = useRef(false);

  // ── DUPLICATE LOG GUARD ──
  // Visitor sends RTM signal every 4s in a loop. Without this guard
  // every repeated signal creates a new log entry.
  const activeRingingVisitorRef = useRef(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const savedData = await AsyncStorage.getItem(USER_DETAILS_KEY);
        if (savedData) setUserDetailsState(JSON.parse(savedData));

        const visitors = await AsyncStorage.getItem(SAVED_VISITORS_KEY);
        if (visitors) setSavedVisitors(JSON.parse(visitors));

        const blacklisted = await AsyncStorage.getItem(BLACKLIST_KEY);
        if (blacklisted) setBlacklist(JSON.parse(blacklisted));

        const notifs = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
        if (notifs) setNotifications(JSON.parse(notifs));

        // 2. LOAD SILENT MODE FROM STORAGE
        const silentMode = await AsyncStorage.getItem(SILENT_MODE_KEY);
        if (silentMode !== null) {
          setIsSilentMode(JSON.parse(silentMode));
        }
      } catch (e) {
        console.log('[AppContext] Load Error:', e);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, []);

  useEffect(() => {
    if (loading || !userDetails.houseNo) {
      if (rtmClientRef.current) rtmClientRef.current.logout();
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
        const client    = rtmClientRef.current;
        const rtmUserId = `house_${userDetails.houseNo}`;
        client.removeAllListeners();

        client.on('ConnectionStateChanged', (newState, reason) => {
          console.log(`[RTM] 🌐 ${newState} (${reason})`);
          setRtmStatus(newState);
        });

        client.on('MessageFromPeer', async (message, peerId) => {
          console.log('[RTM] 📥 From:', peerId, '→', message.text.substring(0, 80));
          try {
            if (message.text.startsWith('{')) {
              const payload = JSON.parse(message.text);
              if (payload.event === 'CALL_REQUEST') {
                const persistentId = payload.visitor_id || peerId;
                handleIncomingCall(persistentId, payload.image, payload.visitor_name || null);
              }
            } else if (message.text.startsWith('VISITOR_NOTE:')) {
              const note = message.text.replace('VISITOR_NOTE:', '');
              handleVisitorNote(peerId, note);
            } else if (message.text === 'CALL_REQUEST') {
              handleIncomingCall(peerId, null, null);
            } else if (message.text === 'CALL_NO_ANSWER') {
              console.log('[RTM] 🕐 Visitor 45s timeout');
              handleVisitorNoAnswer();
            }
          } catch (e) {
            console.log('[RTM] Msg Parse Error', e);
          }
        });

        await client.login({ uid: rtmUserId });
        client.isLoggedIn = true;
        setRtmStatus('CONNECTED');
        console.log(`[RTM] ✅ Logged in as: ${rtmUserId}`);
      } catch (err) {
        setRtmStatus('Error');
        console.log('[RTM] ❌ Login Error:', err.reason || err);
      } finally {
        isLoggingIn.current = false;
      }
    };

    if (!rtmClientRef.current?.isLoggedIn) initRTM();
  }, [loading, userDetails.houseNo]);

  // 3. ADD TOGGLE FUNCTION
  const toggleSilentMode = async () => {
    try {
      const newValue = !isSilentMode;
      setIsSilentMode(newValue);
      await AsyncStorage.setItem(SILENT_MODE_KEY, JSON.stringify(newValue));
      return newValue;
    } catch (error) {
      console.error('[AppContext] toggleSilentMode error:', error);
    }
  };

  // ────────────────────────────────────────────────────────────
  //  HANDLE INCOMING CALL
  //  DUPLICATE GUARD: only the first signal per session is processed.
  //  Subsequent 4s repeat signals from visitor HTML are dropped.
  // ────────────────────────────────────────────────────────────
  const handleIncomingCall = (visitorId, visitorImage, visitorName = null) => {
    if (activeRingingVisitorRef.current === visitorId) {
      console.log('[AppContext] ⏭ Repeat signal — skipped');
      return;
    }
    activeRingingVisitorRef.current = visitorId;
    console.log('[AppContext] 🔔 New call from:', visitorId);

   const isBlacklisted = blacklist.includes(visitorId);

// ✅ ONLY show popup if NOT silent mode
if (!isSilentMode) {
  setIncomingCall({
    visitorId,
    image: visitorImage,
    visitor_name: visitorName
  });
}

// ✅ ONLY ring if not silent
if (!isBlacklisted && !isSilentMode) {
  playSystemDoorbell();
  Vibration.vibrate([500, 1000, 500, 1000], true);
}

    showIncomingCallNotification(visitorId, visitorImage, isSilentMode);
    saveCallLogLocally(visitorId, 'Missed', visitorImage);

    // ── Save to notifications store ──
    saveNotification({
      type:       'missed_call',
      title:      'Visitor at Door',
      message:    `${savedVisitors[visitorId] || 'Someone'} rang your doorbell`,
      visitorId,
      image:      visitorImage,
    });

    setTimeout(() => {
  activeRingingVisitorRef.current = null;
}, 15000);
  };

  // ────────────────────────────────────────────────────────────
  //  HANDLE VISITOR NOTE
  //  Visitor sent a text message via the HTML messaging panel.
  //  Shows a Notifee notification AND saves to notifications store.
  // ────────────────────────────────────────────────────────────
  const handleVisitorNote = (peerId, note) => {
    const visitorName = savedVisitors[peerId] || 'Visitor';
    console.log('[AppContext] 📝 Note from:', visitorName, '→', note);

    // Show notifee notification
    showVisitorNoteNotification(visitorName, note, peerId);

    // ── Save to call logs with Note status ──
    saveCallLogLocally(peerId, `Note: ${note}`, null);

    // ── Save to notifications store so NotificationsScreen shows it ──
    saveNotification({
      type:       'visitor_note',
      title:      `Message from ${visitorName}`,
      message:    note,
      visitorId:  peerId,
      image:      null,
    });
  };

  // ────────────────────────────────────────────────────────────
  //  SAVE NOTIFICATION
  //  Persists a notification entry to AsyncStorage.
  //  NotificationsScreen reads from this key.
  // ────────────────────────────────────────────────────────────
  const saveNotification = async (data) => {
    try {
      const entry = {
        id:         Date.now().toString(),
        type:       data.type,       // 'missed_call' | 'visitor_note' | 'answered_call'
        title:      data.title,
        message:    data.message,
        visitorId:  data.visitorId || null,
        image:      data.image || null,
        isRead:     false,
        created_at: new Date().toISOString(),
      };
      const existing = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const current  = existing ? JSON.parse(existing) : [];
      const updated  = [entry, ...current].slice(0, 100); // keep last 100
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      setNotifications(updated);
    } catch (e) {
      console.error('[AppContext] saveNotification error:', e);
    }
  };

  // ── mark all as read (called by NotificationsScreen on mount) ──
  const markAllNotificationsRead = async () => {
    try {
      const existing = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (!existing) return;
      const updated = JSON.parse(existing).map(n => ({ ...n, isRead: true }));
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      setNotifications(updated);
    } catch (e) {
      console.log('[AppContext] markAllRead error:', e);
    }
  };

  // ── clear all notifications ──
  const clearAllNotifications = async () => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
      setNotifications([]);
    } catch (e) {
      console.log('[AppContext] clearAll error:', e);
    }
  };

  const handleVisitorNoAnswer = () => {
    Vibration.cancel();
    activeRingingVisitorRef.current = null;
    setActiveCall(null);
    setIncomingCall(null);
  };

  /* ═══════════════ NOTIFEE ═══════════════ */

  const startForegroundService = async () => {
    if (Platform.OS !== 'android') return;
    try {
      const channelId = await notifee.createChannel({
        id: 'scanbell_service', name: 'Scanbell Active Service', importance: AndroidImportance.LOW,
      });
      await notifee.displayNotification({
        id: 'service_notification', title: 'Scanbell is Active',
        body: 'Monitoring your door for visitors...',
        android: { channelId, asForegroundService: true, ongoing: true, pressAction: { id: 'default' } },
      });
    } catch (e) { console.log('[ForegroundService] Start Error:', e); }
  };

  const stopForegroundService = async () => {
    if (Platform.OS === 'android') await notifee.stopForegroundService();
  };

 const showIncomingCallNotification = async (
  visitorId,
  image,
  isSilent = false
) => {

  const channelId = await notifee.createChannel({
    id: 'incoming_calls',
    name: 'Incoming Calls',
    importance: isSilent
      ? AndroidImportance.LOW
      : AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
  });

  const visitorName =
    savedVisitors[visitorId] || "Visitor";

  await notifee.displayNotification({
    title: isSilent
      ? "🔕 Silent Mode: Visitor at Door"
      : "🚨 Visitor at Door",

    body: `${visitorName} is calling for House ${userDetails.houseNo}`,

    android: {
      channelId,

      importance: isSilent
        ? AndroidImportance.LOW
        : AndroidImportance.HIGH,

      ongoing: !isSilent,

      largeIcon: image || undefined,

      fullScreenAction: isSilent
        ? undefined
        : { id: "default" },

      pressAction: { id: "default" },

      actions: isSilent
        ? []
        : [
            {
              title: "✅ Accept",
              pressAction: { id: "accept" },
            },
            {
              title: "❌ Decline",
              pressAction: { id: "decline" },
            },
          ],
    },
  });

};

  // ── Dedicated notifee notification for visitor notes ──
  const showVisitorNoteNotification = async (visitorName, note, visitorId) => {
    const channelId = await notifee.createChannel({
      id: 'visitor_notes', name: 'Visitor Messages', importance: AndroidImportance.HIGH,
    });
    await notifee.displayNotification({
      title: `💬 Message from ${visitorName}`,
      body: note,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'open_notifications' },
      },
    });
  };

  /* ═══════════════ CALL ACTIONS ═══════════════ */

  const acceptCall = () => {
    Vibration.cancel();
    notifee.cancelNotification('incoming_calls');
    if (rtmClientRef.current && incomingCall?.visitorId) {
      rtmClientRef.current.sendMessageToPeer(
        { text: 'CALL_ACCEPTED' }, incomingCall.visitorId
      ).catch(e => console.log('[RTM] Accept Error:', e));
      
      // 5. PASS SILENT MODE TO CALL SCREEN
      setActiveCall({ 
        visitorId: incomingCall.visitorId, 
        image: incomingCall.image, 
        visitor_name: incomingCall.visitor_name,
        shouldAutoMute: isSilentMode // Add this
      });
    }
    saveCallLogLocally(incomingCall?.visitorId || 'Visitor', 'Answered', incomingCall?.image);
    // Update notification entry to answered
    saveNotification({
      type:    'answered_call',
      title:   'Call Answered',
      message: `You answered a call from ${savedVisitors[incomingCall?.visitorId] || 'a visitor'}`,
      visitorId: incomingCall?.visitorId,
      image:   incomingCall?.image,
    });
    activeRingingVisitorRef.current = null;
    setIncomingCall(null);
  };

  const endCallSignal = () => {
    if (rtmClientRef.current && activeCall?.visitorId) {
      console.log('[RTM] 🔴 CALL_ENDED → ', activeCall.visitorId);
      rtmClientRef.current.sendMessageToPeer(
        { text: 'CALL_ENDED' }, activeCall.visitorId
      ).catch(e => console.log('[RTM] End Signal Error:', e));
    }
    activeRingingVisitorRef.current = null;
    setActiveCall(null);
    setIncomingCall(null);
  };

  const sendQuickReply = (message) => {
    const targetId = incomingCall?.visitorId || activeCall?.visitorId;
    if (rtmClientRef.current && targetId) {
      rtmClientRef.current.sendMessageToPeer(
        { text: `QUICK_REPLY:${message}` }, targetId
      ).catch(e => console.log('[RTM] Quick Reply Error:', e));
    }
  };

  const declineCall = () => {
    Vibration.cancel();
    notifee.cancelNotification('incoming_calls');
    if (rtmClientRef.current && incomingCall?.visitorId) {
      rtmClientRef.current.sendMessageToPeer(
        { text: 'CALL_REJECTED' }, incomingCall.visitorId
      ).catch(e => console.log('[RTM] Decline Error:', e));
    }
    activeRingingVisitorRef.current = null;
    setIncomingCall(null);
  };

  /* ═══════════════ VISITORS & LOGS ═══════════════ */

  const saveVisitorName = async (visitorId, name) => {
    const updated = { ...savedVisitors, [visitorId]: name };
    setSavedVisitors(updated);
    await AsyncStorage.setItem(SAVED_VISITORS_KEY, JSON.stringify(updated));
    if (rtmClientRef.current && visitorId) {
      try {
        await rtmClientRef.current.sendMessageToPeer(
          { text: JSON.stringify({ event: 'NAME_ASSIGNED', name }) }, visitorId
        );
      } catch (e) { console.log('[AppContext] Visitor offline for live name update'); }
    }
  };

  const toggleBlacklist = async (visitorId) => {
    const updated = blacklist.includes(visitorId)
      ? blacklist.filter(id => id !== visitorId)
      : [...blacklist, visitorId];
    setBlacklist(updated);
    await AsyncStorage.setItem(BLACKLIST_KEY, JSON.stringify(updated));
  };

  const playSystemDoorbell = () => {
    const s = new Sound('notification_sound', Sound.MAIN_BUNDLE, (err) => {
      if (err) {
        const f = new Sound('/system/media/audio/notifications/pixiedust.ogg', '', (e) => { if (!e) f.play(); });
      } else { s.play(() => s.release()); }
    });
  };

  const saveCallLogLocally = async (visitorId, status = 'Missed', image = null) => {
    try {
      const newEntry = {
        id: Date.now().toString(), house_no: userDetails.houseNo,
        visitor_id: visitorId, status, image,
        created_at: new Date().toISOString(),
      };
      const existing = await AsyncStorage.getItem(LOGS_STORAGE_KEY);
      const logs     = existing ? JSON.parse(existing) : [];
      await AsyncStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify([newEntry, ...logs].slice(0, 50)));
    } catch (e) { console.error('[AppContext] saveLog error:', e); }
  };

  /* ═══════════════ USER ═══════════════ */

  const setUserDetails = async (details) => {
    try {
      const newDetails = typeof details === 'function' ? details(userDetails) : details;
      setUserDetailsState(newDetails);
      await AsyncStorage.setItem(USER_DETAILS_KEY, JSON.stringify(newDetails));
    } catch (e) { console.log('[AppContext] Save Error:', e); }
  };

  const logout = async () => {
    try {
      if (rtmClientRef.current) {
        await rtmClientRef.current.logout();
        rtmClientRef.current.isLoggedIn = false;
      }
      stopForegroundService();
      await AsyncStorage.removeItem(USER_DETAILS_KEY);
      setUserDetailsState({ email: '', name: '', userType: '', propertyType: '', callType: 'audio', houseNo: '', address: '' });
    } catch (e) { console.log('[AppContext] Logout Error:', e); }
  };

  // Unread count for badge on HomeScreen bell icon
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppContext.Provider value={{
      userDetails, setUserDetails, loading, logout,
      incomingCall, setIncomingCall, acceptCall, declineCall,
      activeCall, setActiveCall, endCallSignal,
      showIncomingCallNotification, rtmStatus,
      savedVisitors, saveVisitorName,
      blacklist, toggleBlacklist,
      sendQuickReply,
      notifications, unreadCount,
      markAllNotificationsRead, clearAllNotifications,
      // 6. EXPOSE THESE TO THE APP
      isSilentMode,
      toggleSilentMode,
    }}>
      {children}
    </AppContext.Provider>
  );
};