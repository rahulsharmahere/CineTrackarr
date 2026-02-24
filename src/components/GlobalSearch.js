import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import MovieCard from "./MovieCard";
import TvCard from "./TvCard";
import axios from "axios";

export default function GlobalSearch({
  movies,
  tvShows,
  useRadarr,
  radarrUrl,
  radarrApiKey,
  useSonarr,
  sonarrUrl,
  sonarrApiKey,
  onItemPress,
}) {
  const handlePress = async (item, type) => {
    try {
      await onItemPress(item, type);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to perform action");
    }
  };

  return (
    <View>
      {movies?.length > 0 && (
        <View style={{ marginVertical: 10 }}>
          <Text style={styles.header}>Movies</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {movies.map((m) => (
              <MovieCard key={m.id} item={m} onPress={() => handlePress(m, "movie")} />
            ))}
          </ScrollView>
        </View>
      )}

      {tvShows?.length > 0 && (
        <View style={{ marginVertical: 10 }}>
          <Text style={styles.header}>TV Shows</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tvShows.map((s) => (
              <TvCard key={s.id} item={s} onPress={() => handlePress(s, "tv")} />
            ))}
          </ScrollView>
        </View>
      )}

      {(!movies?.length && !tvShows?.length) && <Text style={styles.noResults}>No results found</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 8,
  },
  noResults: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
});
