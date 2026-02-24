import React from "react";
import { Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function TvCard({ item, onPress }) {
  return (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.card}>
      <Image
        source={{
          uri:
            item.remotePoster ||
            "https://via.placeholder.com/150x225?text=No+Image",
        }}
        style={styles.poster}
      />
      <Text style={styles.title} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.status}>{item.status}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    //maxWidth: "48%", // two per row
    backgroundColor: "#1c1c1c",
    borderRadius: 8,
    overflow: "hidden",
  },
  poster: {
    width: "140",
    height: 210,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
    marginHorizontal: 6,
  },
  status: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 8,
    marginHorizontal: 6,
  },
});
