import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput,
} from "react-native";

import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

import AppScreenWrapper from "../components/AppScreenWrapper";
import { useSettings } from "../context/SettingsContext";

export default function MoviesListScreen({ navigation }) {
  const { settings } = useSettings();

  const [movies, setMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // ✅ Load Radarr Movies
  useEffect(() => {
    fetchMovies();
  }, [settings.useRadarr]);

  // ✅ Debounced Search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.length > 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  const fetchMovies = async () => {
    if (!settings.useRadarr) {
      setMovies([]);
      return;
    }

    if (!settings.radarrUrl || !settings.radarrApiKey) return;

    try {
      const response = await axios.get(
        `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/movie`,
        {
          headers: { "X-Api-Key": settings.radarrApiKey },
        }
      );

      setMovies(response.data);
    } catch (err) {
      console.error("Movies Fetch Error:", err);
    }
  };

  const performSearch = () => {
    if (settings.tmdbApiKey) {
      searchTMDB();
    } else {
      searchRadarrLookup();
    }
  };

  const searchTMDB = async () => {
    setSearching(true);
    setLoading(true);

    try {
      const response = await axios.get(
        "https://api.themoviedb.org/3/search/movie",
        {
          params: {
            api_key: settings.tmdbApiKey,
            query: searchText,
          },
        }
      );

      setSearchResults(response.data.results);
    } catch (err) {
      console.error("TMDB Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchRadarrLookup = async () => {
    if (!settings.useRadarr) return;

    setSearching(true);
    setLoading(true);

    try {
      const response = await axios.get(
        `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/movie/lookup`,
        {
          params: { term: searchText },
          headers: { "X-Api-Key": settings.radarrApiKey },
        }
      );

      setSearchResults(response.data);
    } catch (err) {
      console.error("Radarr Lookup Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const isMovieAdded = (movie) => {
    return movies.some(
      (radarrMovie) =>
        radarrMovie.tmdbId === movie.tmdbId ||
        radarrMovie.tmdbId === movie.id
    );
  };

  const handlePress = (item) => {
    const added = isMovieAdded(item);
    const isTMDB = !!item.poster_path;

    navigation.navigate("Details", {
      item: {
        id: item.id,
        title: item.title,

        tmdbId: isTMDB ? item.id : item.tmdbId,

        remotePoster: added
          ? item.images?.[0]?.remoteUrl
          : `https://image.tmdb.org/t/p/w500${
              item.poster_path || item.remotePoster
            }`,

        added,
      },
      type: "movie",
    });
  };

  const renderRadarrItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
      <Image
        source={{ uri: item.images?.[0]?.remoteUrl }}
        style={styles.poster}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.status}>
          {item.monitored ? "Monitored" : "Unmonitored"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSearchItem = ({ item }) => {
    const added = isMovieAdded(item);

    return (
      <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
          }}
          style={styles.poster}
        />

        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>

          {added && (
            <View style={styles.addedBadge}>
              <Icon name="checkmark-circle" size={18} color="#4CAF50" />
              <Text style={styles.addedText}>Added</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const showLibrary = !searching;

  return (
    <AppScreenWrapper navigation={navigation} title="Movies">

      {/* ✅ Upgraded Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={
            settings.tmdbApiKey
              ? "Search Movies (TMDB)"
              : "Search Movies (Radarr)"
          }
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />

        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchText("")}
          >
            <Icon name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {loading && <ActivityIndicator color="#e50914" />}

      {showLibrary ? (
        movies.length === 0 ? (
          <Text style={styles.noResults}>
            {settings.useRadarr
              ? "No movies found in Radarr"
              : "Radarr is disabled"}
          </Text>
        ) : (
          <FlatList
            data={movies.sort(
              (a, b) => new Date(b.added) - new Date(a.added)
            )}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRadarrItem}
          />
        )
      ) : searchResults.length === 0 ? (
        <Text style={styles.noResults}>No movies found</Text>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSearchItem}
        />
      )}
    </AppScreenWrapper>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    margin: 10,
    position: "relative",
    justifyContent: "center",
  },

  searchInput: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 10,
  },

  clearButton: {
    position: "absolute",
    right: 15,
  },

  card: {
    flexDirection: "row",
    marginVertical: 8,
    marginHorizontal: 12,
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    overflow: "hidden",
  },

  poster: {
    width: 80,
    height: 120,
  },

  info: {
    padding: 10,
    justifyContent: "center",
    flexShrink: 1,
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  status: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 4,
  },

  addedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  addedText: {
    color: "#4CAF50",
    marginLeft: 5,
  },

  noResults: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
});