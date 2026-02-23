import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, StatusBar, Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Missed Call',
      message: 'You missed a visitor call for House 32.',
      time: '10:30 AM',
      type: 'missed_call',
      isRead: false,
    },
    {
      id: '2',
      title: 'System Update',
      message: 'Your Scanbell app has been updated to v2.1.0.',
      time: 'Yesterday',
      type: 'system',
      isRead: true,
    },
    {
      id: '3',
      title: 'New Member Added',
      message: 'Alok Maurya was added to your property.',
      time: '2 days ago',
      type: 'member',
      isRead: true,
    }
  ]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notiCard, !item.isRead && styles.unreadCard]}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.type === 'missed_call' ? '#FFEBEE' : '#E8F2FF' }]}>
        <MaterialCommunityIcons
          name={item.type === 'missed_call' ? "phone-missed" : item.type === 'system' ? "cellphone-arrow-down" : "account-plus-outline"}
          size={24}
          color={item.type === 'missed_call' ? "#FF3B30" : "#007AFF"}
        />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.row}>
          <Text style={styles.notiTitle}>{item.title}</Text>
          <Text style={styles.notiTime}>{item.time}</Text>
        </View>
        <Text style={styles.notiMessage} numberOfLines={2}>{item.message}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* HEADER SECTION */}
      <LinearGradient
        colors={["#007AFF", "#0055BB"]}
        style={styles.headerGradient}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerRightBtn}>
            <Text style={styles.headerRightText}>Clear All</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Notifications</Text>
      </LinearGradient>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="bell-off-outline" size={60} color="#8E8E93" />
            </View>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>No new notifications at the moment.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 10
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerRightBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)' },
  headerRightText: { color: 'white', fontSize: 13, fontWeight: '700' },
  headerTitle: { fontSize: 32, fontWeight: '900', color: 'white' },

  listContent: { padding: 20, paddingBottom: 100 },
  notiCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  unreadCard: { borderWidth: 1, borderColor: 'rgba(0,122,255,0.1)', backgroundColor: '#F0F7FF' },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  textContainer: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  notiTitle: { fontSize: 16, fontWeight: '800', color: '#1C1C1E' },
  notiTime: { fontSize: 11, color: '#8E8E93', fontWeight: '600' },
  notiMessage: { fontSize: 13, color: '#3A3A3C', lineHeight: 18, fontWeight: '500' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF', marginLeft: 10 },

  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E5E5EA', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E' },
  emptySub: { fontSize: 16, color: '#8E8E93', textAlign: 'center', marginTop: 10, lineHeight: 24 }
});