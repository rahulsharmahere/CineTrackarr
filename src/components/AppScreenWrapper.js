import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";

export default function AppScreenWrapper({ children, title, navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const closeMenu = () => setMenuVisible(false);

  const handleSettings = () => {
    closeMenu();
    navigation.navigate("Settings");
  };

  const handleLogout = () => {
    closeMenu();
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Menu */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={closeMenu}>
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.overlay}>
            <View style={styles.menuContainer}>
              <TouchableOpacity onPress={handleSettings} style={styles.menuItem}>
                <Text style={styles.menuText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
                <Text style={[styles.menuText, { color: "#ff4d4d" }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Screen content */}
      <View style={styles.content}>{children}</View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made by Rahul Sharma</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: "#000",
  },
  headerText: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  menuButton: { paddingHorizontal: 10 },
  menuButtonText: { fontSize: 22, color: "#e50914", fontWeight: "bold" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 50,
    paddingRight: 10,
  },
  menuContainer: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 5,
    width: 160,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  menuText: { color: "#fff", fontSize: 16 },
  content: { flex: 1, paddingHorizontal: 12 },
  footer: {
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
    backgroundColor: "#000",
  },
  footerText: { color: "#888", fontSize: 14 },
});
