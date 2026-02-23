import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, FlatList, 
  TouchableOpacity, StatusBar, ActivityIndicator 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGS_STORAGE_KEY = 'doorvi_call_logs';

export default function CallLogsScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const stored = await AsyncStorage.getItem(LOGS_STORAGE_KEY);
      if (stored) {
        setLogs(JSON.parse(stored));
      }
    } catch (e) {
      console.log('Error fetching logs', e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isAnswered = item.status.includes('Answered');
    
    return (
      <View style={styles.logCard}>
        <View style={[styles.iconBox, { backgroundColor: isAnswered ? '#E8F5E9' : '#FFEBEE' }]}>
          <MaterialCommunityIcons 
            name={isAnswered ? "phone-check" : "phone-missed"} 
            size={24} 
            color={isAnswered ? "#4CAF50" : "#F44336"} 
          />
        </View>
        
        <View style={styles.infoBox}>
          <Text style={styles.statusText}>{item.status}</Text>
          <Text style={styles.detailsText}>
            House {item.house_no} • {new Date(item.created_at).toLocaleDateString('en-GB')}
          </Text>
        </View>

        <Text style={styles.timeText}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Call Logs</Text>
        <TouchableOpacity onPress={fetchLogs}>
          <Ionicons name="refresh" size={22} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="history" size={80} color="#EEE" />
              <Text style={styles.emptyText}>No call history found</Text>
            </View>
          }
        />
      )}
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
    elevation: 2 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  backBtn: { padding: 5 },
  listContent: { padding: 20 },
  logCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 18, 
    marginBottom: 12,
    elevation: 1
  },
  iconBox: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15 
  },
  infoBox: { flex: 1 },
  statusText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  detailsText: { fontSize: 13, color: '#888', marginTop: 2 },
  timeText: { fontSize: 12, color: '#AAA', fontWeight: '500' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#AAA', marginTop: 10, fontSize: 16 }
});