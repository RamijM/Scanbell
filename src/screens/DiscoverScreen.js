import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function DiscoverScreen({ navigation }) {

  const ArticleCard = ({ image, readTime, title, views }) => (
    <TouchableOpacity style={styles.cardOuter}>
      <View style={styles.cardInner}>
        <View style={styles.imageContainer}>
          <Image source={image} style={styles.thumbnail} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.readTime}>{readTime}</Text>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.views}>{views}</Text>
            <Ionicons name="eye-outline" size={14} color="#666" style={{ marginLeft: 4 }} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.backgroundContainer}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#E0E5EC" />

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButtonOuter} onPress={() => navigation.goBack()}>
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={20} color="#4A4A4A" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DoorVi</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          <ArticleCard
            image={require("../../assets/sunflower.png")}
            readTime="6 Mins Read"
            title="QR Code Access for Multi-Family Communities"
            views="23k"
          />

          <ArticleCard
            image={require("../../assets/sunflower.png")}
            readTime="5 Mins Read"
            title="Share Your Feedback & Help Improve DoorVi."
            views="23k"
          />

          <ArticleCard
            image={require("../../assets/sunflower.png")}
            readTime="5 Mins Read"
            title="Seamless Lock Integration with DoorVi"
            views="11k"
          />

          <ArticleCard
            image={require("../../assets/sunflower.png")}
            readTime="3 Mins Read"
            title="Partner with Us"
            views="27k"
          />

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* BOTTOM NAVIGATION */}
        <View style={styles.bottomNavOuter}>
          <View style={styles.bottomNavInner}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate("Home")}
            >
              <View style={styles.navIconContainer}>
                <Ionicons name="home-outline" size={22} color="#666" />
              </View>
              <Text style={styles.navInactive}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
              <View style={[styles.navIconContainer, styles.activeNavIcon]}>
                <Ionicons name="cube" size={22} color="#007AFF" />
              </View>
              <Text style={styles.navActive}>Discover</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate("Settings")}
            >
              <View style={styles.navIconContainer}>
                <Ionicons name="settings-outline" size={22} color="#666" />
              </View>
              <Text style={styles.navInactive}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({

  backgroundContainer: {
    flex: 1,
    backgroundColor: "#ffffff", // Neumorphism base background
  },

  container: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 20
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    marginBottom: 5,
  },

  backButtonOuter: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E0E5EC",
    justifyContent: "center",
    alignItems: "center",
    // Neumorphism outer shadow
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  backButtonInner: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#E0E5EC",
    justifyContent: "center",
    alignItems: "center",
    // Neumorphism inner shadow
    shadowColor: "#FFFFFF",
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4A4A4A",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },

  headerRight: {
    width: 44,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  cardOuter: {
    marginBottom: 20,
    borderRadius: 25,
    backgroundColor: "#E0E5EC",
    // Neumorphism outer shadow
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },

  cardInner: {
    flexDirection: "row",
    backgroundColor: "#E0E5EC",
    borderRadius: 23,
    padding: 12,
    // Neumorphism inner shadow
    shadowColor: "#FFFFFF",
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },

  imageContainer: {
    width: 95,
    height: 95,
    borderRadius: 18,
    backgroundColor: "#E0E5EC",
    justifyContent: "center",
    alignItems: "center",
    // Neumorphism effect for image container
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },

  thumbnail: {
    width: 87,
    height: 87,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },

  cardContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center"
  },

  readTime: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
    textShadowColor: "rgba(255,255,255,0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 6,
    lineHeight: 22,
    textShadowColor: "rgba(255,255,255,0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center"
  },

  views: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },

  bottomNavOuter: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0E5EC",
    // Neumorphism outer shadow
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
  },

  bottomNavInner: {
    flex: 1,
    borderRadius: 38,
    backgroundColor: "#E0E5EC",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 10,
    // Neumorphism inner shadow
    shadowColor: "#FFFFFF",
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  navIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E0E5EC",
    justifyContent: "center",
    alignItems: "center",
    // Neumorphism outer shadow
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  activeNavIcon: {
    // Neumorphism inner shadow for active state
    shadowColor: "#007AFF",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    backgroundColor: "#E8EDF5",
  },

  navActive: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "600",
    marginTop: 4,
    textShadowColor: "rgba(0,122,255,0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },

  navInactive: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    textShadowColor: "rgba(255,255,255,0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  }

});