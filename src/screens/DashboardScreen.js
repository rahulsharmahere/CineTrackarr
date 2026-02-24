import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  FlatList,
} from "react-native";

import AppScreenWrapper from "../components/AppScreenWrapper";
import MovieCard from "../components/MovieCard";
import TvCard from "../components/TvCard";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

import { useSettings } from "../context/SettingsContext";

export default function DashboardScreen({ navigation }) {

  const { settings } = useSettings();

  const [filter, setFilter] = useState("All");

  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTv, setTrendingTv] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchData();
  }, [
    settings.useRadarr,
    settings.useSonarr,
    settings.useTrending,
    settings.tmdbApiKey,
  ]);

  const fetchData = async () => {

    setLoading(true);

    try {

      if (!settings.useRadarr) setMovies([]);
      if (!settings.useSonarr) setTvShows([]);
      if (!settings.useTrending) {
        setTrendingMovies([]);
        setTrendingTv([]);
      }

      // ✅ RADARR
      if (settings.useRadarr && settings.radarrUrl && settings.radarrApiKey) {
        const radarrResp = await axios.get(
          `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/movie`,
          { headers: { "X-Api-Key": settings.radarrApiKey } }
        );

        const movieData = radarrResp.data
          .sort((a, b) => new Date(b.added) - new Date(a.added))
          .map((m) => ({
            id: m.id,
            title: m.title,
            remotePoster: m.images?.[0]?.remoteUrl,
            tmdbId: m.tmdbId,   // ✅ critical
            status: m.monitored ? "Monitored" : "Unmonitored",
            added: true,
          }));

        setMovies(movieData);
      }

      // ✅ SONARR
      if (settings.useSonarr && settings.sonarrUrl && settings.sonarrApiKey) {
        const sonarrResp = await axios.get(
          `${settings.sonarrUrl.replace(/\/$/, "")}/api/v3/series`,
          { headers: { "X-Api-Key": settings.sonarrApiKey } }
        );

        const tvData = sonarrResp.data
          .sort((a, b) => new Date(b.added) - new Date(a.added))
          .map((s) => ({
            id: s.id,
            title: s.title,      // ✅ IMPORTANT FIX
            remotePoster: s.images?.[0]?.remoteUrl,
            tvdbId: s.tvdbId,    // ✅ critical
            status: s.status || "Unknown",
            added: true,
          }));

        setTvShows(tvData);
      }

      // ✅ TRENDING
      if (settings.useTrending && settings.tmdbApiKey) {

        const tmdb = axios.create({
          baseURL: "https://api.themoviedb.org/3",
          params: { api_key: settings.tmdbApiKey },
        });

        if (settings.useRadarr) {
          const movieResp = await tmdb.get("/trending/movie/week");

          const mappedTrendingMovies = movieResp.data.results.map((m) => ({
            id: m.id,
            title: m.title,
            remotePoster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
            tmdbId: m.id,
            added: false,
          }));

          setTrendingMovies(mappedTrendingMovies);
        }

        if (settings.useSonarr) {
          const tvResp = await tmdb.get("/trending/tv/week");

          const mappedTrendingTv = tvResp.data.results.map((t) => ({
            id: t.id,
            title: t.name,     // ✅ CRITICAL FIX
            remotePoster: `https://image.tmdb.org/t/p/w500${t.poster_path}`,
            tvdbId: t.id,      // ✅ fake but needed for lookup
            added: false,
          }));

          setTrendingTv(mappedTrendingTv);
        }
      }

    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const showMovies = filter === "All" || filter === "Movies";
  const showTv = filter === "All" || filter === "TV";

  const handleCardPress = (item) => {
    navigation.navigate("Details", {
      item,
      type: item.tmdbId ? "movie" : "tv",
    });
  };

  const renderTrendingPoster = (item, type) => (
    <View style={{ marginRight: 10 }}>
      {type === "movie" ? (
        <MovieCard item={item} onPress={handleCardPress} />
      ) : (
        <TvCard item={item} onPress={handleCardPress} />
      )}
    </View>
  );

  const goToFullList = (type) => {
    navigation.navigate(type === "movie" ? "MoviesList" : "TvShowsList");
  };

  return (
    <AppScreenWrapper navigation={navigation} title="Dashboard">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />

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

        {loading && <ActivityIndicator size="large" color="#e50914" />}

        {/* Latest TV */}
        {showTv && tvShows.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest TV Shows</Text>

              <TouchableOpacity onPress={() => goToFullList("tv")}>
                <Icon name="chevron-forward" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={tvShows.slice(0, 6)}
              horizontal
              renderItem={({ item }) => (
                <TvCard item={item} onPress={handleCardPress} />
              )}
            />
          </View>
        )}

        {/* Trending TV */}
        {showTv && trendingTv.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending TV Shows</Text>
            </View>

            <FlatList
              data={trendingTv.slice(0, 6)}
              horizontal
              renderItem={({ item }) =>
                renderTrendingPoster(item, "tv")
              }
            />
          </View>
        )}

        {/* Latest Movies */}
        {showMovies && movies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Movies</Text>

              <TouchableOpacity onPress={() => goToFullList("movie")}>
                <Icon name="chevron-forward" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={movies.slice(0, 6)}
              horizontal
              renderItem={({ item }) => (
                <MovieCard item={item} onPress={handleCardPress} />
              )}
            />
          </View>
        )}

        {/* Trending Movies */}
        {showMovies && trendingMovies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Movies</Text>
            </View>

            <FlatList
              data={trendingMovies.slice(0, 6)}
              horizontal
              renderItem={({ item }) =>
                renderTrendingPoster(item, "movie")
              }
            />
          </View>
        )}

      </ScrollView>
    </AppScreenWrapper>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 10,
  },
  filterRow: {
    flexDirection: "row",
    marginHorizontal: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#2a2a2a",
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: "#e50914",
  },
  filterText: {
    color: "#fff",
  },
  section: {
    marginVertical: 12,
    marginLeft: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
  },
});