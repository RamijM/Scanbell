import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export default function DiscoverScreen({ navigation }) {

  const ArticleCard = ({ image, readTime, title, views, category = "Community" }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <View style={styles.imageBox}>
        <Image source={image} style={styles.thumbnail} />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
      </View>
      <View style={styles.contentBox}>
        <Text style={styles.readTimeText}>{readTime}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color="#8E8E93" />
            <Text style={styles.statText}>{views}</Text>
          </View>
          <TouchableOpacity style={styles.readBtn}>
            <Text style={styles.readBtnText}>Read Now</Text>
            <Ionicons name="chevron-forward" size={14} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search-outline" size={24} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HERO FEATURED CARD */}
        <TouchableOpacity style={styles.heroCard} activeOpacity={0.9}>
          <LinearGradient
            colors={['rgba(0,122,255,0.8)', 'rgba(0,85,187,0.95)']}
            style={styles.heroGradient}
          >
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Featured</Text>
            </View>
            <Text style={styles.heroTitle}>The Future of Smart Access Control</Text>
            <Text style={styles.heroSub}>Explore how Scanbell is changing the way we interact with visitors.</Text>
            <View style={styles.heroFooter}>
              <Text style={styles.heroTime}>10 Mins Read</Text>
              <View style={styles.heroArrow}>
                <Ionicons name="arrow-forward" size={20} color="#007AFF" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Latest Updates</Text>

        <ArticleCard
          image={require("../../assets/sunflower.png")}
          readTime="6 Mins Read"
          title="QR Code Access for Multi-Family Communities"
          views="23k"
          category="Technology"
        />

        <ArticleCard
          image={require("../../assets/sunflower.png")}
          readTime="5 Mins Read"
          title="Share Your Feedback & Help Improve Scanbell Project"
          views="18k"
          category="Feedback"
        />

        <ArticleCard
          image={require("../../assets/sunflower.png")}
          readTime="5 Mins Read"
          title="Seamless Smart Lock Integration with Scanbell"
          views="11k"
          category="Integration"
        />

        <ArticleCard
          image={require("../../assets/sunflower.png")}
          readTime="3 Mins Read"
          title="Partner with Scanbell: Future of Access"
          views="27k"
          category="Business"
        />

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FLOATING GLASS NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Home")}>
          <Ionicons name="home-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeIndicator} />
          <Ionicons name="compass" size={26} color="#007AFF" />
          <Text style={[styles.navText, styles.activeNavText]}>Discover</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#F8F9FB'
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#1C1C1E" },
  searchBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 2 },

  scrollContent: { paddingHorizontal: 20 },

  heroCard: { width: '100%', height: 200, borderRadius: 30, overflow: 'hidden', marginBottom: 25, elevation: 8 },
  heroGradient: { flex: 1, padding: 25, justifyContent: 'space-between' },
  heroBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)' },
  heroBadgeText: { color: 'white', fontWeight: '800', fontSize: 10, textTransform: 'uppercase' },
  heroTitle: { fontSize: 22, fontWeight: '900', color: 'white' },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  heroFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroTime: { color: 'white', fontSize: 12, fontWeight: '700' },
  heroArrow: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },

  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1C1C1E', marginBottom: 20 },

  card: { backgroundColor: 'white', borderRadius: 25, marginBottom: 20, overflow: 'hidden', flexDirection: 'row', padding: 12, elevation: 4 },
  imageBox: { width: 110, height: 110, borderRadius: 20, overflow: 'hidden' },
  thumbnail: { width: '100%', height: '100%' },
  categoryBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(0,122,255,0.8)' },
  categoryText: { color: 'white', fontSize: 9, fontWeight: '800' },
  contentBox: { flex: 1, marginLeft: 15, justifyContent: 'space-between', paddingVertical: 5 },
  readTimeText: { fontSize: 11, fontWeight: '600', color: '#8E8E93' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', lineHeight: 22 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statText: { marginLeft: 5, fontSize: 12, color: '#8E8E93', fontWeight: '600' },
  readBtn: { flexDirection: 'row', alignItems: 'center' },
  readBtnText: { fontSize: 13, fontWeight: '700', color: '#007AFF', marginRight: 4 },

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