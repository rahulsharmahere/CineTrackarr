import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
// Calculate dynamic card width (half screen - paddings/margins)
const CARD_WIDTH = (width - 48) / 2; // 16px padding + 6px margin * 2 approx.

export default function MovieCard({ item, onPress }) {
  return (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.card}>
      <Image
        source={{
          uri: item.remotePoster || "https://via.placeholder.com/120x180?text=No+Image",
        }}
        style={styles.poster}
        resizeMode="cover"
      />
      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.status}>{item.status}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    margin: 6,
  },
  poster: {
    width: "100%",
    height: CARD_WIDTH * 1.5, // keeps poster aspect ratio ~2:3
    borderRadius: 8,
    marginBottom: 6,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  status: {
    color: "#aaa",
    fontSize: 12,
  },
});
