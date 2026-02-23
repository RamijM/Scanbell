import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

export default function AddMemberScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* MODERN HEADER */}
      <LinearGradient
        colors={["#007AFF", "#0055BB"]}
        style={styles.headerGradient}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.titleBox}>
          <Text style={styles.headerTitle}>Family Members</Text>
          <Text style={styles.headerSub}>Manage people who have access to your smart bell notifications.</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Verified Members</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>1 Active</Text>
          </View>
        </View>

        {/* MEMBER CARD */}
        <TouchableOpacity style={styles.memberCard} activeOpacity={0.9}>
          <LinearGradient
            colors={['#E8F2FF', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.memberGradient}
          >
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>AM</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>Alok Maurya</Text>
              <Text style={styles.memberEmail}>mauryalok9025@gmail.com</Text>
              <View style={styles.roleTag}>
                <MaterialCommunityIcons name="shield-crown" size={12} color="#007AFF" />
                <Text style={styles.roleText}>Admin</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.moreBtn}>
              <Ionicons name="ellipsis-vertical" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>

        {/* INFO BOX */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            Members added here will receive real-time notifications when someone calls your house.
          </Text>
        </View>
      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity style={styles.fabOuter}>
        <LinearGradient
          colors={["#007AFF", "#0055BB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="person-add" size={24} color="white" />
          <Text style={styles.fabText}>Add New Member</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  titleBox: { marginTop: 30 },
  headerTitle: { fontSize: 32, fontWeight: "900", color: "white" },
  headerSub: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginTop: 8, fontWeight: '500', lineHeight: 22 },

  scrollContent: { padding: 25, paddingBottom: 150 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1C1C1E' },
  badge: { marginLeft: 10, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(0,122,255,0.1)', borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#007AFF' },

  memberCard: { borderRadius: 25, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 20 },
  memberGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  avatarBox: { width: 60, height: 60, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWeight: 1, borderColor: '#E8F2FF', elevation: 2 },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#007AFF' },
  memberInfo: { flex: 1, marginLeft: 15 },
  memberName: { fontSize: 18, fontWeight: '800', color: '#1C1C1E' },
  memberEmail: { fontSize: 13, color: '#8E8E93', marginTop: 2, fontWeight: '500' },
  roleTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,122,255,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 8, alignSelf: 'flex-start' },
  roleText: { fontSize: 10, fontWeight: '800', color: '#007AFF', marginLeft: 4, textTransform: 'uppercase' },
  moreBtn: { padding: 5 },

  infoBox: { flexDirection: 'row', backgroundColor: 'white', padding: 20, borderRadius: 25, alignItems: 'center', borderWidth: 1, borderColor: '#F2F2F7' },
  infoText: { flex: 1, marginLeft: 15, fontSize: 13, color: '#8E8E93', lineHeight: 18, fontWeight: '500' },

  fabOuter: { position: 'absolute', bottom: 40, left: 25, right: 25, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10 },
  fab: { height: 65, borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  fabText: { color: 'white', fontSize: 16, fontWeight: '800', marginLeft: 12 }
});