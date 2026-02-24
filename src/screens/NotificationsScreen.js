import React, { useContext, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, StatusBar, Dimensions, RefreshControl
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

// ── Notification type config ──
// Maps every notification type to icon, colors and label
const TYPE_CONFIG = {
  missed_call: {
    icon:    'phone-missed',
    bg:      '#FFEBEE',
    color:   '#FF3B30',
    label:   'Missed Call',
  },
  answered_call: {
    icon:    'phone-check',
    bg:      '#E8F5E9',
    color:   '#34C759',
    label:   'Call Answered',
  },
  visitor_note: {
    icon:    'message-text',
    bg:      '#EEF2FF',
    color:   '#5856D6',
    label:   'Visitor Message',
  },
  system: {
    icon:    'cellphone-arrow-down',
    bg:      '#E8F2FF',
    color:   '#007AFF',
    label:   'System',
  },
  member: {
    icon:    'account-plus-outline',
    bg:      '#E8F2FF',
    color:   '#007AFF',
    label:   'Member',
  },
};

function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now  = new Date();
  const diff = now - date; // ms

  if (diff < 60_000)          return 'Just now';
  if (diff < 3_600_000)       return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 2 * 86_400_000)  return 'Yesterday';
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export default function NotificationsScreen({ navigation }) {
  const {
    notifications,
    savedVisitors,
    markAllNotificationsRead,
    clearAllNotifications,
    unreadCount,
  } = useContext(AppContext);

  // Mark all as read when screen is opened
  useEffect(() => {
    markAllNotificationsRead();
  }, []);

  const handleClearAll = useCallback(async () => {
    await clearAllNotifications();
  }, [clearAllNotifications]);

  // ── Render each notification card ──
  const renderItem = ({ item }) => {
    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;

    // Resolve visitor display name if we have the visitorId
    const visitorName = item.visitorId
      ? (savedVisitors?.[item.visitorId] || null)
      : null;

    // Override title if we have a saved name
    const displayTitle = item.type === 'visitor_note' && visitorName
      ? `Message from ${visitorName}`
      : item.type === 'missed_call' && visitorName
        ? `${visitorName} rang the bell`
        : item.title;

    return (
      <View style={[styles.card, !item.isRead && styles.unreadCard]}>

        {/* Left: visitor photo or type icon */}
        {item.image ? (
          <View style={[styles.iconContainer, { backgroundColor: cfg.bg }]}>
            <Image source={{ uri: item.image }} style={styles.visitorThumb} />
          </View>
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: cfg.bg }]}>
            <MaterialCommunityIcons name={cfg.icon} size={24} color={cfg.color} />
          </View>
        )}

        {/* Center: title + message + time */}
        <View style={styles.textContainer}>
          <View style={styles.topRow}>
            <View style={styles.badgeRow}>
              {/* Type badge */}
              <View style={[styles.typeBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.typeBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.notiTime}>{formatTime(item.created_at)}</Text>
          </View>

          <Text style={styles.notiTitle} numberOfLines={1}>{displayTitle}</Text>

          {/* Message body — especially useful for visitor_note */}
          {item.message ? (
            <Text style={styles.notiMessage} numberOfLines={3}>{item.message}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  // ── Section separator: group notifications by date ──
  const groupedWithHeaders = (() => {
    const result = [];
    let lastDate = '';
    notifications.forEach((n, i) => {
      const date = n.created_at
        ? new Date(n.created_at).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })
        : 'Unknown';
      if (date !== lastDate) {
        result.push({ type: 'header', id: `header_${i}`, label: date });
        lastDate = date;
      }
      result.push({ type: 'item', id: n.id, ...n });
    });
    return result;
  })();

  const renderRow = ({ item }) => {
    if (item.type === 'header') {
      return (
        <Text style={styles.dateHeader}>{item.label}</Text>
      );
    }
    return renderItem({ item });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── HEADER ── */}
      <LinearGradient colors={['#007AFF', '#0055BB']} style={styles.headerGradient}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          {notifications.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
              <MaterialCommunityIcons name="delete-sweep-outline" size={18} color="rgba(255,255,255,0.9)" />
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.headerTitle}>Notifications</Text>

        {/* Unread count pill */}
        {unreadCount > 0 && (
          <View style={styles.unreadPill}>
            <Text style={styles.unreadPillText}>{unreadCount} new</Text>
          </View>
        )}
      </LinearGradient>

      {/* ── NOTIFICATION LIST ── */}
      <FlatList
        data={groupedWithHeaders}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#F2F2F7', '#E5E5EA']}
              style={styles.emptyIconCircle}
            >
              <MaterialCommunityIcons name="bell-sleep-outline" size={52} color="#8E8E93" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>Visitor messages and call alerts will appear here.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },

  /* ── HEADER ── */
  headerGradient: {
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  clearBtnText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '700' },
  headerTitle: { fontSize: 34, fontWeight: '900', color: 'white', letterSpacing: -0.5 },
  unreadPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20,
  },
  unreadPillText: { color: 'white', fontSize: 12, fontWeight: '800' },

  /* ── LIST ── */
  listContent: { padding: 16, paddingBottom: 110 },

  dateHeader: {
    fontSize: 12, fontWeight: '800',
    color: '#8E8E93', textTransform: 'uppercase',
    letterSpacing: 1, marginTop: 20, marginBottom: 10,
    paddingLeft: 4,
  },

  /* ── CARD ── */
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 22,
    marginBottom: 10,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  unreadCard: {
    backgroundColor: '#F0F6FF',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.12)',
  },

  /* ── ICON / PHOTO ── */
  iconContainer: {
    width: 52, height: 52, borderRadius: 17,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14, flexShrink: 0,
  },
  visitorThumb: {
    width: 52, height: 52, borderRadius: 17,
  },

  /* ── TEXT ── */
  textContainer: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#007AFF' },
  notiTime: { fontSize: 11, color: '#8E8E93', fontWeight: '600' },
  notiTitle: { fontSize: 15, fontWeight: '800', color: '#1C1C1E', marginBottom: 3 },
  notiMessage: {
    fontSize: 13, color: '#3A3A3C',
    lineHeight: 19, fontWeight: '500',
    backgroundColor: '#F9F9FB',
    padding: 8, borderRadius: 10,
    marginTop: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#5856D6',
  },

  /* ── EMPTY ── */
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyIconCircle: {
    width: 110, height: 110, borderRadius: 55,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E' },
  emptySub: { fontSize: 15, color: '#8E8E93', textAlign: 'center', marginTop: 10, lineHeight: 22 },
});