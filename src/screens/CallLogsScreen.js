import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, Modal, Alert,
  TouchableOpacity, StatusBar, ActivityIndicator, Dimensions, TextInput
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');
const LOGS_STORAGE_KEY = 'doorvi_call_logs';

export default function CallLogsScreen({ navigation }) {
  const {
    savedVisitors, saveVisitorName,
    blacklist, toggleBlacklist
  } = useContext(AppContext);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const stored = await AsyncStorage.getItem(LOGS_STORAGE_KEY);
      if (stored) {
        setLogs(JSON.parse(stored));
      } else {
        setLogs([]);
      }
    } catch (e) {
      console.log('Error fetching logs', e);
    } finally {
      setLoading(false);
    }
  };

  const openOptions = (item) => {
    setSelectedItem(item);
    setEditName(savedVisitors[item.visitor_id] || '');
    setShowOptionsModal(true);
  };

  const deleteSingleLog = async () => {
    try {
      const filteredLogs = logs.filter(l => l.id !== selectedItem.id);
      await AsyncStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(filteredLogs));
      setLogs(filteredLogs);
      setShowDeleteConfirm(false);
      setShowOptionsModal(false);
    } catch (e) {
      console.log('Error deleting log', e);
    }
  };

  const handleSaveName = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }
    await saveVisitorName(selectedItem.visitor_id, editName);
    setShowEditNameModal(false);
    setShowOptionsModal(false);
  };

  const handleBlacklistToggle = async () => {
    await toggleBlacklist(selectedItem.visitor_id);
    setShowOptionsModal(false);
  };

  const clearAllLogs = () => {
    Alert.alert(
      "Clear All History",
      "Are you sure you want to delete all activity logs? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(LOGS_STORAGE_KEY);
              setLogs([]);
            } catch (e) {
              console.log('Error clearing logs', e);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isAnswered = item.status.includes('Answered');
    const isNote = item.status.includes('Note:');
    const isBlacklisted = blacklist.includes(item.visitor_id);
    const visitorName = savedVisitors[item.visitor_id] || 'Unknown Visitor';

    let statusColor = '#FF3B30'; // Default Missed
    if (isAnswered) statusColor = '#4CAF50';
    if (isNote) statusColor = '#007AFF';

    return (
      <View style={styles.logCard}>
        {item.image ? (
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: item.image }} style={styles.thumbnail} />
            {isBlacklisted && <View style={styles.blacklistMiniBadge}><Ionicons name="volume-mute" size={10} color="white" /></View>}
          </View>
        ) : (
          <View style={[styles.iconBox, { backgroundColor: isNote ? '#E3F2FD' : (isAnswered ? '#E8F5E9' : '#FFEBEE') }]}>
            <MaterialCommunityIcons
              name={isNote ? "message-text-outline" : (isAnswered ? "phone-check" : "phone-missed")}
              size={24}
              color={statusColor}
            />
            {isBlacklisted && <View style={styles.blacklistMiniBadge}><Ionicons name="volume-mute" size={10} color="white" /></View>}
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.statusText}>{visitorName}</Text>
          <View style={styles.detailsRow}>
            <Text style={[styles.statusSubText, { color: statusColor }]}>
              {item.status} {isBlacklisted ? '• Muted' : ''}
            </Text>
          </View>
          <View style={styles.detailsRow}>
            <Ionicons name="time-outline" size={12} color="#8E8E93" />
            <Text style={styles.detailsText}> {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => openOptions(item)} style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color="#C7C7CD" />
        </TouchableOpacity>
      </View>
    );
  };

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
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={clearAllLogs} style={[styles.headerRightBtn, { marginRight: 10 }]}>
              <Ionicons name="trash-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={fetchLogs} style={styles.headerRightBtn}>
              <Ionicons name="refresh" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerTitle}>Activity logs</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Fetching activity...</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialCommunityIcons name="history" size={60} color="#8E8E93" />
              </View>
              <Text style={styles.emptyTitle}>No activity yet</Text>
              <Text style={styles.emptySub}>Calls made through your QR code will appear here.</Text>
            </View>
          }
        />
      )}

      {/* OPTIONS MODAL */}
      <Modal transparent visible={showOptionsModal} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.optionsCard}>
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>Visitor Actions</Text>
              <Text style={styles.optionSub}>Manage {savedVisitors[selectedItem?.visitor_id] || 'this visitor'}</Text>
            </View>

            <TouchableOpacity style={styles.optionBtn} onPress={() => setShowEditNameModal(true)}>
              <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="person-add-outline" size={24} color="#1976D2" />
              </View>
              <View>
                <Text style={styles.optionBtnText}>{savedVisitors[selectedItem?.visitor_id] ? 'Edit Name' : 'Save Visitor'}</Text>
                <Text style={styles.optionBtnSub}>Display a custom name for this ID</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionBtn} onPress={handleBlacklistToggle}>
              <View style={[styles.optionIcon, { backgroundColor: blacklist.includes(selectedItem?.visitor_id) ? '#FFF3E0' : '#F3E5F5' }]}>
                <Ionicons
                  name={blacklist.includes(selectedItem?.visitor_id) ? "volume-high-outline" : "volume-mute-outline"}
                  size={24}
                  color={blacklist.includes(selectedItem?.visitor_id) ? "#EF6C00" : "#7B1FA2"}
                />
              </View>
              <View>
                <Text style={[styles.optionBtnText, { color: blacklist.includes(selectedItem?.visitor_id) ? "#EF6C00" : "#7B1FA2" }]}>
                  {blacklist.includes(selectedItem?.visitor_id) ? 'Whitelist Visitor' : 'Blacklist Visitor'}
                </Text>
                <Text style={styles.optionBtnSub}>
                  {blacklist.includes(selectedItem?.visitor_id) ? 'Allow call ringing again' : 'Mute future rings from this person'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionBtn} onPress={() => setShowDeleteConfirm(true)}>
              <View style={[styles.optionIcon, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="trash-outline" size={24} color="#D32F2F" />
              </View>
              <View>
                <Text style={[styles.optionBtnText, { color: '#D32F2F' }]}>Delete Single Log</Text>
                <Text style={styles.optionBtnSub}>Remove this entry from history</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* EDIT NAME MODAL */}
      <Modal transparent visible={showEditNameModal} animationType="slide">
        <View style={styles.modalOverlayDark}>
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>{savedVisitors[selectedItem?.visitor_id] ? 'Edit Name' : 'Save Visitor'}</Text>
            <Text style={styles.editSub}>Give this visitor a name for easy identification</Text>

            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Visitor Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="e.g. Courier, John Due, Milkman"
                autoFocus
              />
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEditNameModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveName}>
                <Text style={styles.saveText}>Save Name</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal transparent visible={showDeleteConfirm} animationType="fade">
        <View style={styles.modalOverlayDark}>
          <View style={styles.confirmCard}>
            <View style={styles.warningIcon}>
              <Ionicons name="warning" size={32} color="#FF9500" />
            </View>
            <Text style={styles.confirmTitle}>Delete Log?</Text>
            <Text style={styles.confirmSub}>Are you sure? This activity entry will be permanently removed.</Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDeleteConfirm(false)}>
                <Text style={styles.cancelText}>Keep it</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={deleteSingleLog}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRightBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: '900', color: 'white' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#8E8E93', fontWeight: '600' },

  listContent: { padding: 20, paddingBottom: 100 },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 25,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  thumbnailContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 15,
    backgroundColor: '#E5E5EA'
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  infoBox: { flex: 1 },
  statusText: { fontSize: 17, fontWeight: '800', color: '#1C1C1E' },
  statusSubText: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  detailsText: { fontSize: 12, color: '#8E8E93', fontWeight: '600' },
  moreBtn: { padding: 10, marginRight: -10 },
  blacklistMiniBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white'
  },

  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E5E5EA', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E' },
  emptySub: { fontSize: 16, color: '#8E8E93', textAlign: 'center', marginTop: 10, lineHeight: 24 },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalOverlayDark: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },

  optionsCard: { backgroundColor: 'white', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 30, width: '100%' },
  optionHeader: { marginBottom: 25 },
  optionTitle: { fontSize: 24, fontWeight: '900', color: '#1C1C1E' },
  optionSub: { fontSize: 14, color: '#8E8E93', marginTop: 4 },

  optionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  optionIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  optionBtnText: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  optionBtnSub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },

  editCard: { backgroundColor: 'white', width: '90%', borderRadius: 30, padding: 25 },
  editTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  editSub: { fontSize: 14, color: '#8E8E93', textAlign: 'center', marginTop: 5, marginBottom: 25 },
  inputBox: { marginBottom: 25 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#8E8E93', marginBottom: 8, textTransform: 'uppercase' },
  textInput: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 15, fontSize: 16, color: '#1C1C1E' },
  editActions: { flexDirection: 'row' },
  saveBtn: { flex: 1, backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 16, marginLeft: 8, alignItems: 'center' },
  saveText: { color: 'white', fontWeight: '800', fontSize: 16 },

  confirmCard: { backgroundColor: 'white', width: '85%', borderRadius: 30, padding: 25, alignItems: 'center' },
  warningIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF9E6', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  confirmTitle: { fontSize: 20, fontWeight: '800', color: '#1C1C1E' },
  confirmSub: { fontSize: 14, color: '#8E8E93', textAlign: 'center', marginTop: 10, marginBottom: 25, lineHeight: 20 },
  confirmActions: { flexDirection: 'row', width: '100%' },
  cancelBtn: { flex: 1, backgroundColor: '#F2F2F7', paddingVertical: 16, borderRadius: 16, marginRight: 8, alignItems: 'center' },
  cancelText: { color: '#8E8E93', fontWeight: '800', fontSize: 16 },
  deleteBtn: { flex: 1, backgroundColor: '#FF3B30', paddingVertical: 16, borderRadius: 16, marginLeft: 8, alignItems: 'center' },
  deleteText: { color: 'white', fontWeight: '800', fontSize: 16 },
});