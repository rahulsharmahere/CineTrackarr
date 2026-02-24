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

export default function TvShowsListScreen({ navigation }) {
  const { settings } = useSettings();

  const [series, setSeries] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // ✅ Load Sonarr Library
  useEffect(() => {
    fetchSeries();
  }, [settings.useSonarr]);

  // ✅ Debounced Search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.length > 2) {
        searchSeries();
      } else {
        setSearchResults([]);
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  const fetchSeries = async () => {
    if (!settings.useSonarr) {
      setSeries([]);
      return;
    }

    if (!settings.sonarrUrl || !settings.sonarrApiKey) return;

    try {
      const resp = await axios.get(
        `${settings.sonarrUrl.replace(/\/$/, "")}/api/v3/series`,
        { headers: { "X-Api-Key": settings.sonarrApiKey } }
      );

      setSeries(resp.data);
    } catch (err) {
      console.error("Sonarr Fetch Error:", err);
    }
  };

  const searchSeries = async () => {
    if (!settings.useSonarr) return;

    setSearching(true);
    setLoading(true);

    try {
      const resp = await axios.get(
        `${settings.sonarrUrl.replace(/\/$/, "")}/api/v3/series/lookup`,
        {
          params: { term: searchText },
          headers: { "X-Api-Key": settings.sonarrApiKey },
        }
      );

      setSearchResults(resp.data);
    } catch (err) {
      console.error("Sonarr Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Detect If Series Already Exists
  const isSeriesAdded = (lookupSeries) => {
    return series.some(
      (existing) => existing.tvdbId === lookupSeries.tvdbId
    );
  };

  const handlePress = (item, added) => {
    navigation.navigate("Details", {
      item: {
        id: item.id,
        title: item.title,
        remotePoster: added
          ? item.images?.[0]?.remoteUrl
          : item.images?.find(img => img.coverType === "poster")?.remoteUrl,
        added,
        tvdbId: item.tvdbId,
      },
      type: "tv",
    });
  };

  // ✅ Library Item
  const renderLibraryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePress(item, true)}
    >
      <Image
        source={{ uri: item.images?.[0]?.remoteUrl }}
        style={styles.poster}
      />

      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  // ✅ Search Item
  const renderSearchItem = ({ item }) => {
    const added = isSeriesAdded(item);

    const poster =
      item.images?.find(img => img.coverType === "poster")?.remoteUrl;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePress(item, added)}
      >
        <Image
          source={{ uri: poster }}
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
    <AppScreenWrapper navigation={navigation} title="TV Shows">

      {/* ✅ Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search TV Shows..."
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
        series.length === 0 ? (
          <Text style={styles.noResults}>
            {settings.useSonarr
              ? "No series found in Sonarr"
              : "Sonarr is disabled"}
          </Text>
        ) : (
          <FlatList
            data={series.sort((a, b) => new Date(b.added) - new Date(a.added))}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderLibraryItem}
          />
        )
      ) : (
        searchResults.length === 0 ? (
          <Text style={styles.noResults}>No series found</Text>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.tvdbId.toString()}
            renderItem={renderSearchItem}
          />
        )
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