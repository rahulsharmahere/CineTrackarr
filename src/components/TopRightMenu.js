import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  Alert
} from "react-native";
import EncryptedStorage from "react-native-encrypted-storage";
import { Portal } from "@gorhom/portal";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function TopRightMenu({ navigation }) {
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
    ]).start(() => setVisible(false));
  };

  const toggleMenu = () => (visible ? closeMenu() : openMenu());

  const handleSettings = () => {
    closeMenu();
    navigation.navigate("Settings");
  };

  const handleLogout = () => {
    closeMenu();
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          console.log("Logout pressed");
          try {
            await EncryptedStorage.removeItem("cineTrackarrCreds");
            console.log("Credentials removed");

            // Reset navigation stack
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
            console.log("Navigation reset to Login");
          } catch (err) {
            console.error("Logout failed", err);
          }
        },
      },
    ]);
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  return (
    <View style={{ zIndex: 10 }}>
      <TouchableOpacity onPress={toggleMenu} style={{ paddingHorizontal: 10 }}>
        <Text style={{ color: "#e50914", fontWeight: "bold", fontSize: 22 }}>⋮</Text>
     
