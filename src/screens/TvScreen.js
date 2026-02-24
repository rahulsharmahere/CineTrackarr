import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import TvCard from "../components/TvCard";
import { getSeries } from "../api/sonarrApi";

export default function TvScreen() {
  const [shows, setShows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSeries();
        setShows(data);
      } catch (err) {
        console.error("Failed to fetch series", err);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My TV Shows</Text>
      <FlatList
        data={shows}
        horizontal
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <TvCard item={item} onPress={() => {}} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 10 },
  heading: { color: "#fff", fontSize: 20, marginBottom: 10 }
});
