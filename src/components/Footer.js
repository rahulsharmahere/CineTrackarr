import React from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity } from "react-native";

export default function Footer() {
  const openLink = () => {
    Linking.openURL("http://rahulsharmahere.com").catch(err =>
      console.error("Failed to open URL:", err)
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Designed and Developed by{" "}
        <Text style={styles.link} onPress={openLink}>
          Rahul Sharma
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#000"
  },
  text: {
    color: "#fff",
    fontSize: 14
  },
  link: {
    color: "#e50914",
    textDecorationLine: "underline"
  }
});
