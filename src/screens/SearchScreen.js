import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import MovieCard from "../components/MovieCard";
import TvCard from "../components/TvCard";
import EncryptedStorage from "react-native-encrypted-storage";
import axios from "axios";
import AppScreenWrapper from "../components/AppScreenWrapper";

export default function SearchScreen({ route, navigation }) {
  const { query } = route.params || {};

  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [useRadarr, setUseRadarr] = useState(false);
  const [radarrUrl, setRadarrUrl] = useState("");
  const [radarrApiKey, setRadarrApiKey] = useState("");
  const [useSonarr, setUseSonarr] = useState(false);
  const [sonarrUrl, setSonarrUrl] = useState("");
  const [sonarrApiKey, setSonarrApiKey] = useState("");

  const [searchText, setSearchText] = useState(query || "");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Load credentials and perform initial search
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const credsString = await EncryptedStorage.getItem("cineTrackarrCreds");
        const creds = credsString ? JSON.parse(credsString) : null;
        if (!creds) {
          Alert.alert("Error", "No saved credentials found");
          navigation.replace("Login");
          return;
        }

        setUseRadarr(creds.useRadarr || false);
        setRadarrUrl(creds.radarrUrl || "");
        setRadarrApiKey(creds.radarrApiKey || "");
        setUseSonarr(creds.useSonarr || false);
        setSonarrUrl(creds.sonarrUrl || "");
        setSonarrApiKey(creds.sonarrApiKey || "");

        if (query) {
          await performSearch(creds, query);
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load credentials");
      }
    };

    loadCredentials();
  }, [query]);

  // Perform search
  const performSearch = async (creds, term) => {
    setLoading(true);
    try {
      let movieResults = [];
      let tvResults = [];

      // Radarr search
      if (creds.useRadarr && creds.radarrUrl && creds.radarrApiKey) {
        const res = await axios.get(
          `${creds.radarrUrl.replace(/\/$/, "")}/api/v3/movie/lookup?term=${encodeURIComponent(term)}`,
          { headers: { "X-Api-Key": creds.radarrApiKey } }
        );
        movieResults = (res.data || []).map((m) => ({
  id: m.tmdbId,
  title: m.title || "Unknown Title",
  remotePoster: m.images?.[0]?.remoteUrl || "https://via.placeholder.com/120x180?text=No+Image",
  status: "Not added",
  isNew: true,
  type: "movie",
}));
      }

      // Sonarr search
      if (creds.useSonarr && creds.sonarrUrl && creds.sonarrApiKey) {
        const res = await axios.get(
          `${creds.sonarrUrl.replace(/\/$/, "")}/api/v3/series/lookup?term=${encodeURIComponent(term)}`,
          { headers: { "X-Api-Key": creds.sonarrApiKey } }
        );
        tvResults = (res.data || []).map((s) => ({
  id: s.tvdbId,
  name: s.title || "Unknown Name",
  remotePoster: s.images?.[0]?.remoteUrl || "https://via.placeholder.com/120x180?text=No+Image",
  status: "Not added",
  isNew: true,
  type: "tv",
}));
      }

      setMovies(movieResults);
      setTvShows(tvResults);
      setSearchResults([...movieResults, ...tvResults]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to search Radarr/Sonarr");
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes
  useEffect(() => {
    const search = async () => {
      if (!searchText.trim()) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      const lower = searchText.toLowerCase();

      // Existing items
      const existingMovies = movies
        .filter((m) => m.title.toLowerCase().includes(lower))
        .map((m) => ({ ...m, isNew: false }));

      const existingTv = tvShows
        .filter((s) => s.name.toLowerCase().includes(lower))
        .map((s) => ({ ...s, isNew: false }));

      let newMovies = [];
      let newTv = [];

      try {
        if (useRadarr && radarrUrl && radarrApiKey) {
          const res = await axios.get(
            `${radarrUrl.replace(/\/$/, "")}/api/v3/movie/lookup?term=${encodeURIComponent(searchText)}`,
            { headers: { "X-Api-Key": radarrApiKey } }
          );
          newMovies = (res.data || [])
            .filter((m) => !movies.find((mv) => mv.id === m.tmdbId))
            .map((m) => ({
              id: m.tmdbId,
              title: m.title,
              remotePoster: m.images?.[0]?.remoteUrl || "https://via.placeholder.com/120x180?text=No+Image",
              status: "Not added",
              type: "movie",
              isNew: true,
            }));
        }

        if (useSonarr && sonarrUrl && sonarrApiKey) {
          const res = await axios.get(
            `${sonarrUrl.replace(/\/$/, "")}/api/v3/series/lookup?term=${encodeURIComponent(searchText)}`,
            { headers: { "X-Api-Key": sonarrApiKey } }
          );
          newTv = (res.data || [])
            .filter((s) => !tvShows.find((tv) => tv.id === s.tvdbId))
            .map((s) => ({
              id: s.tvdbId,
              name: s.title,
              remotePoster: s.images?.[0]?.remoteUrl || "https://via.placeholder.com/120x180?text=No+Image",
              status: "Not added",
              type: "tv",
              isNew: true,
            }));
        }
      } catch (err) {
        console.warn("Search error:", err.message);
      } finally {
        setSearchResults([...existingMovies, ...existingTv, ...newMovies, ...newTv]);
        setSearchLoading(false);
      }
    };

    search();
  }, [searchText, movies, tvShows]);

  // Handle item press
  const handleItemPress = async (item) => {
    if (!item.isNew) {
      // Navigate to detail
      if (item.type === "movie") navigation.navigate("MovieDetail", { movieId: item.id });
      else navigation.navigate("TvDetail", { tvId: item.id });
      return;
    }

    // Open modal to select profile
    setSelectedItem(item);
    setModalVisible(true);
    setLoadingProfiles(true);

    try {
      let fetchedProfiles = [];
      if (item.type === "movie" && useRadarr) {
        const res = await axios.get(`${radarrUrl.replace(/\/$/, "")}/api/v3/profile`, {
          headers: { "X-Api-Key": radarrApiKey },
        });
        fetchedProfiles = res.data || [];
      } else if (item.type === "tv" && useSonarr) {
        const res = await axios.get(`${sonarrUrl.replace(/\/$/, "")}/api/v3/profile`, {
          headers: { "X-Api-Key": sonarrApiKey },
        });
        fetchedProfiles = res.data || [];
      }
      setProfiles(fetchedProfiles);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch profiles");
      setModalVisible(false);
    } finally {
      setLoadingProfiles(false);
    }
  };

  // Add item to profile
  const handleAddToProfile = async (profile) => {
    try {
      if (!selectedItem) return;

      if (selectedItem.type === "movie") {
        await axios.post(
          `${radarrUrl.replace(/\/$/, "")}/api/v3/movie`,
          { title: selectedItem.title, tmdbId: selectedItem.id, profileId: profile.id },
          { headers: { "X-Api-Key": radarrApiKey } }
        );
      } else {
        await axios.post(
          `${sonarrUrl.replace(/\/$/, "")}/api/v3/series`,
          { title: selectedItem.name, tvdbId: selectedItem.id, profileId: profile.id },
          { headers: { "X-Api-Key": sonarrApiKey } }
        );
      }

      Alert.alert("Added", `${selectedItem.title || selectedItem.name} added to ${profile.name}`);
      setModalVisible(false);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to add to profile");
    }
  };

  return (
    <AppScreenWrapper>
      <TextInput
        style={styles.searchBar}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search Movies or TV Shows"
      />

      {searchLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleItemPress(item)}>
              {item.type === "movie" ? <MovieCard movie={item} /> : <TvCard tv={item} />}
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modal for selecting profile */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {loadingProfiles ? (
              <ActivityIndicator />
            ) : (
              <>
                <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Select Profile</Text>
                {profiles.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => handleAddToProfile(p)}
                    style={styles.profileItem}
                  >
                    <Text>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
            <TouchableOpacity
              style={{ marginTop: 20 }}
              onPress={() => {
                setModalVisible(false);
                setSelectedItem(null);
              }}
            >
              <Text style={{ color: "red" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppScreenWrapper>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    margin: 10,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    maxHeight: "70%",
  },
  profileItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
