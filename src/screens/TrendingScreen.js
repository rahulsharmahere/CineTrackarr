import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from "react-native";

import AppScreenWrapper from "../components/AppScreenWrapper";
import MovieCard from "../components/MovieCard";
import TvCard from "../components/TvCard";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

import { useSettings } from "../context/SettingsContext";   // ✅ FIXED

export default function TrendingScreen({ navigation }) {

  const { settings } = useSettings();   // ✅ LIVE SETTINGS

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTv, setTrendingTv] = useState([]);

  // ✅ REACTIVE FETCH (same pattern as Dashboard)
  useEffect(() => {
    fetchTrending();
  }, [
    settings.useTrending,
    settings.tmdbApiKey,
    settings.useRadarr,
    settings.useSonarr,
  ]);

  const fetchTrending = async () => {

    if (!settings.useTrending || !settings.tmdbApiKey) {
      setTrendingMovies([]);
      setTrendingTv([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const tmdb = axios.create({
        baseURL: "https://api.themoviedb.org/3",
        params: { api_key: settings.tmdbApiKey },
      });

      if (settings.useRadarr) {
        const movieResp = await tmdb.get("/trending/movie/week");

        const mappedMovies = movieResp.data.results.map((m) => ({
          id: m.id,
          title: m.title,
          remotePoster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
          status: "Trending",
          tmdbId: m.id,
          added: false,
        }));

        setTrendingMovies(mappedMovies);
      } else {
        setTrendingMovies([]);
      }

      if (settings.useSonarr) {
        const tvResp = await tmdb.get("/trending/tv/week");

        const mappedTv = tvResp.data.results.map((t) => ({
          id: t.id,
          name: t.name,
          remotePoster: `https://image.tmdb.org/t/p/w500${t.poster_path}`,
          status: "Trending",
          tmdbId: t.id,
          added: false,
        }));

        setTrendingTv(mappedTv);
      } else {
        setTrendingTv([]);
      }

    } catch (err) {
      console.error("Trending Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = (item, type) => {
    navigation.navigate("Details", {
      item: {
        id: item.id,
        title: item.title || item.name,
        tmdbId: item.tmdbId,
        remotePoster: item.remotePoster,
        added: false,
      },
      type,
    });
  };

  // ✅ Disabled States (NOW reactive)
  if (!settings.useTrending) {
    return (
      <AppScreenWrapper navigation={navigation} title="Trending">
        <View style={styles.centerBox}>
          <Icon name="flame-outline" size={50} color="#555" />
          <Text style={styles.disabledTitle}>Trending Disabled</Text>
          <Text style={styles.disabledText}>
            Enable Trending from Settings
          </Text>
        </View>
      </AppScreenWrapper>
    );
  }

  if (!settings.tmdbApiKey) {
    return (
      <AppScreenWrapper navigation={navigation} title="Trending">
        <View style={styles.centerBox}>
          <Icon name="alert-circle-outline" size={50} color="#555" />
          <Text style={styles.disabledTitle}>TMDB Not Configured</Text>
          <Text style={styles.disabledText}>
            Add TMDB API Key in Settings
          </Text>
        </View>
      </AppScreenWrapper>
    );
  }

  return (
    <AppScreenWrapper navigation={navigation} title="Trending">

      {loading ? (
        <ActivityIndicator size="large" color="#e50914" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>

          <View style={styles.filterRow}>
            {["All", "Movies", "TV"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setFilter(item)}
                style={[
                  styles.filterButton,
                  filter === item && styles.activeFilter,
                ]}
              >
                <Text style={styles.filterText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {settings.useRadarr &&
            (filter === "All" || filter === "Movies") &&
            trendingMovies.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trending Movies</Text>

                <FlatList
                  data={trendingMovies}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={{ flex: 1, margin: 6 }}>
                      <MovieCard
                        item={item}
                        onPress={() => handleCardPress(item, "movie")}
                      />
                    </View>
                  )}
                  numColumns={2}
                  scrollEnabled={false}
                />
              </View>
            )}

          {settings.useSonarr &&
            (filter === "All" || filter === "TV") &&
            trendingTv.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Trending TV Shows</Text>

                <FlatList
                  data={trendingTv}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={{ flex: 1, margin: 6 }}>
                      <TvCard
                        item={item}
                        onPress={() => handleCardPress(item, "tv")}
                      />
                    </View>
                  )}
                  numColumns={2}
                  scrollEnabled={false}
                />
              </View>
            )}

        </ScrollView>
      )}
    </AppScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: { marginVertical: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledTitle: {
    color: "#fff",
    fontSize: 18,
    marginTop: 15,
    fontWeight: "600",
  },
  disabledText: { color: "#777", marginTop: 6 },
  filterRow: {
    flexDirection: "row",
    marginBottom: 12,
    marginTop: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#2a2a2a",
    marginRight: 8,
  },
  activeFilter: { backgroundColor: "#e50914" },
  filterText: { color: "#fff", fontSize: 14 },
});