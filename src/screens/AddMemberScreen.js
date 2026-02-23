import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function AddMemberScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Blue Header Section */}
      <View style={styles.blueHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Member</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Verified Members</Text>
        
        {/* Member Row */}
        <View style={styles.memberRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>Alok Maurya</Text>
            <Text style={styles.memberEmail}>mauryalok9025@gmail.com</Text>
          </View>
        </View>
      </View>

      {/* Persistent Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.inviteButton}>
          <Text style={styles.inviteText}>INVITE MEMBER</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  blueHeader: { 
    height: 180, 
    backgroundColor: '#007AFF', 
    borderBottomLeftRadius: 100, 
    borderBottomRightRadius: 100, 
    justifyContent: 'center', 
    alignItems: 'center',
    transform: [{ scaleX: 1.5 }] // Creates the curved effect
  },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', transform: [{ scaleX: 0.67 }] },
  backButton: { position: 'absolute', top: 50, left: 40, transform: [{ scaleX: 0.67 }] },
  body: { flex: 1, padding: 25, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#666', marginBottom: 20 },
  memberRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E1F5FE', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: 'bold', fontSize: 18 },
  memberInfo: { marginLeft: 15 },
  memberName: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  memberEmail: { fontSize: 14, color: '#555' },
  footer: { padding: 20, paddingBottom: 30 },
  inviteButton: { backgroundColor: '#007AFF', padding: 18, borderRadius: 30, alignItems: 'center' },
  inviteText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});