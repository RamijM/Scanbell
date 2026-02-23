import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SettingsScreen() {

  const MenuItem = ({ icon, label }) => (
    <TouchableOpacity activeOpacity={0.8} style={styles.menuItem}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon} size={22} color="#4A4A4A" />
      </View>
      <Text style={styles.menuText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#cbe0fe" />

      <Text style={styles.logo}>DoorVi</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>

        {/* PROFILE SECTION */}
        <View style={styles.profileCard}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>A</Text>
            </View>
          </View>

          <Text style={styles.name}>ALAK</Text>

          <View style={styles.editIconOuter}>
            <View style={styles.editIconInner}>
              <Ionicons name="pencil" size={16} color="#4A4A4A" />
            </View>
          </View>
        </View>

        {/* MENU ITEMS */}
        <MenuItem icon="folder-plus-outline" label="Add New Category" />
        <MenuItem icon="account-plus-outline" label="Join As A Member" />
        <MenuItem icon="qrcode-scan" label="Activate QR Code" />
        <MenuItem icon="share-variant-outline" label="Share App" />
        <MenuItem icon="currency-usd" label="Refer Doorvi with friends" />
        <MenuItem icon="volume-high" label="Sound & Ringtone" />
        <MenuItem icon="star-outline" label="Rate Us" />
        <MenuItem icon="help-circle-outline" label="Help" />

      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNavOuter}>
        <View style={styles.bottomNavInner}>
          <TouchableOpacity style={styles.navItem}>
            <View style={styles.navIconContainer}>
              <Ionicons name="home-outline" size={22} color="#666" />
            </View>
            <Text style={styles.navInactive}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <View style={styles.navIconContainer}>
              <Ionicons name="cube-outline" size={22} color="#666" />
            </View>
            <Text style={styles.navInactive}>Discover</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <View style={[styles.navIconContainer, styles.activeNavIcon]}>
              <Ionicons name="settings" size={22} color="#007AFF" />
            </View>
            <Text style={styles.navActive}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Neumorphism background
    paddingHorizontal: 20
  },

  logo: {
    fontSize: 26,
    fontWeight: '700',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
    color: '#4A4A4A',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },

  profileCard: {
    alignItems: 'center',
    marginBottom: 30
  },

  avatarOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#033a87',
    justifyContent: 'center',
    alignItems: 'center',
    // Neumorphism outer shadow
    shadowColor: '#c7ced8',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },

  avatarInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#cbe0fe',
    justifyContent: 'center',
    alignItems: 'center',
    // Neumorphism inner shadow (via opposite shadow)
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },

  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A4A4A',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  name: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '600',
    color: '#4A4A4A',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  editIconOuter: {
    marginTop: 10,
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#cbe0fe',
    justifyContent: 'center',
    alignItems: 'center',
    // Neumorphism outer shadow
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  editIconInner: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#cbe0fe',
    justifyContent: 'center',
    alignItems: 'center',
    // Neumorphism inner shadow
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    padding: 18,
    borderRadius: 25,
    backgroundColor: '#cbe0fe',
    // Neumorphism outer shadow
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },

  iconContainer: {
    marginRight: 18,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#cbe0fe',
    justifyContent: 'center',
    alignItems: 'center',
    // Neumorphism inner shadow for icons
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },

  menuText: {
    fontSize: 16,
    color: '#4A4A4A',
    fontWeight: '500',
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },

  bottomNavOuter: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E5EC',
    // Neumorphism outer shadow
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
  },

  bottomNavInner: {
    flex: 1,
    borderRadius: 38,
    backgroundColor: '#E0E5EC',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    // Neumorphism inner shadow
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E0E5EC',
    justifyContent: 'center',
    alignItems: 'center',
    // Neumorphism outer shadow
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  activeNavIcon: {
    // Neumorphism inner shadow for active state
    shadowColor: '#007AFF',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    backgroundColor: '#E8EDF5',
  },

  navActive: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0,122,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },

  navInactive: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  }

});