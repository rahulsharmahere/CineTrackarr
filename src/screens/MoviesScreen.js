import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import MovieCard from "../components/MovieCard";
import { getMovies } from "../api/radarrApi";

export default function MoviesScreen() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await getMovies();
      setMovies(data);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Movies</Text>
      <FlatList
        data={movies}
        horizontal
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <MovieCard item={item} onPress={() => {}} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 10 },
  heading: { color: "#fff", fontSize: 20, marginBottom: 10 }
});
