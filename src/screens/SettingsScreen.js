import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { AppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function SettingsScreen({ navigation }) {
  const { userDetails, logout } = useContext(AppContext);

  const SettingItem = ({ icon, label, color = "#1C1C1E", onPress, subLabel }) => (
    <TouchableOpacity activeOpacity={0.7} style={styles.settingItem} onPress={onPress}>
      <View style={[styles.settingIconBox, { backgroundColor: `${color}10` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.settingTextBox}>
        <Text style={styles.settingLabel}>{label}</Text>
        {subLabel && <Text style={styles.settingSubLabel}>{subLabel}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#C7C7CD" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <MaterialCommunityIcons name="logout" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>

        {/* PROFILE CARD - PREMIUM LOOK */}
        <LinearGradient
          colors={['#007AFF', '#0055BB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>{userDetails?.name?.charAt(0) || 'U'}</Text>
              </View>
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.userMeta}>
              <Text style={styles.userName}>{userDetails?.name || 'User Name'}</Text>
              <Text style={styles.userEmail}>{userDetails?.email || 'email@example.com'}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.proBadge}>
                  <MaterialCommunityIcons name="crown" size={12} color="white" />
                  <Text style={styles.proText}>Premium</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* SETTINGS GROUPS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Property</Text>
          <View style={styles.groupCard}>
            <SettingItem icon="home-edit-outline" label="Property Details" subLabel={`House ${userDetails?.houseNo || 'N/A'}`} color="#007AFF" />
            <SettingItem icon="account-group-outline" label="Manage Members" subLabel="3 active members" color="#5856D6" onPress={() => navigation.navigate('AddMember')} />
            <SettingItem icon="qrcode-scan" label="QR Kit Settings" subLabel="Manage your QR sticker" color="#AF52DE" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.groupCard}>
            <SettingItem icon="bell-ring-outline" label="Sound & Ringtone" color="#FF9500" />
            <SettingItem icon="shield-check-outline" label="Privacy & Security" color="#34C759" />
            <SettingItem icon="share-variant-outline" label="Invite Friends" color="#007AFF" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.groupCard}>
            <SettingItem icon="star-outline" label="Rate Scanbell" color="#FFCC00" />
            <SettingItem icon="help-circle-outline" label="Help Center" color="#8E8E93" />
            <SettingItem icon="information-outline" label="About Version" subLabel="v2.1.0" color="#1C1C1E" />
          </View>
        </View>

        {/* DELETE ACCOUNT BUTTON */}
        <TouchableOpacity style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>Deactivate Account</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* FLOATING GLASS NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Discover")}>
          <Ionicons name="compass-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Discover</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeIndicator} />
          <Ionicons name="settings" size={26} color="#007AFF" />
          <Text style={[styles.navText, styles.activeNavText]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 20,
    backgroundColor: '#F8F9FB'
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1C1C1E' },
  logoutBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 2 },

  profileCard: { margin: 20, borderRadius: 30, padding: 25, elevation: 8 },
  profileInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' },
  avatarInitial: { fontSize: 32, fontWeight: '800', color: 'white' },
  editAvatarBtn: { position: 'absolute', bottom: -5, right: -5, width: 28, height: 28, borderRadius: 14, backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' },
  userMeta: { marginLeft: 20, flex: 1 },
  userName: { fontSize: 22, fontWeight: '800', color: 'white' },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginTop: 2 },
  badgeRow: { flexDirection: 'row', marginTop: 10 },
  proBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  proText: { color: 'white', fontSize: 10, fontWeight: '800', marginLeft: 4, textTransform: 'uppercase' },

  section: { marginTop: 25, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 10 },
  groupCard: { backgroundColor: 'white', borderRadius: 25, overflow: 'hidden', paddingVertical: 10, elevation: 4 },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
  settingIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingTextBox: { flex: 1, marginLeft: 15 },
  settingLabel: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  settingSubLabel: { fontSize: 12, color: '#8E8E93', marginTop: 2, fontWeight: '500' },

  deleteBtn: { margin: 30, alignItems: 'center', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#FF3B3010', backgroundColor: '#FF3B3005' },
  deleteBtnText: { color: '#FF3B30', fontWeight: '800', fontSize: 14 },

  bottomNav: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 75,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    paddingBottom: 5
  },
  navItem: { alignItems: 'center', paddingHorizontal: 15 },
  navText: { fontSize: 10, fontWeight: '700', color: '#8E8E93', marginTop: 4 },
  activeNavText: { color: '#007AFF' },
  activeIndicator: { position: 'absolute', top: -10, width: 25, height: 4, backgroundColor: '#007AFF', borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
});