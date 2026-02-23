import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, StatusBar
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function NotificationsScreen({ navigation }) {
  // Mock data - in a real app, this would come from your API
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
      message: 'Your DoorVi app has been updated to the latest version.',
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
    <TouchableOpacity style={[styles.notiCard, !item.isRead && styles.unreadCard]}>
      <View style={[styles.iconContainer, { backgroundColor: item.type === 'missed_call' ? '#FFEBEE' : '#E3F2FD' }]}>
        <MaterialCommunityIcons 
          name={item.type === 'missed_call' ? "phone-missed" : "bell-outline"} 
          size={24} 
          color={item.type === 'missed_call' ? "#F44336" : "#2196F3"} 
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header - Matches your Discover/Settings header style */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bell-off-outline" size={80} color="#EEE" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  markReadText: { color: '#007AFF', fontSize: 13, fontWeight: '600' },
  listContent: { padding: 15 },
  notiCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 18, 
    marginBottom: 10,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  unreadCard: { backgroundColor: '#F0F7FF' },
  iconContainer: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15 
  },
  textContainer: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  notiTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  notiTime: { fontSize: 11, color: '#AAA' },
  notiMessage: { fontSize: 13, color: '#666', lineHeight: 18 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#007AFF', marginLeft: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 150 },
  emptyText: { color: '#AAA', marginTop: 10, fontSize: 16 }
});