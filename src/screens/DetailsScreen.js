import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

import AppScreenWrapper from "../components/AppScreenWrapper";
import { useSettings } from "../context/SettingsContext";

export default function DetailsScreen({ route, navigation }) {

  const { item, type } = route.params;
  const { settings } = useSettings();

  const [details, setDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]);              // ✅ TV ONLY
  const [expandedSeasons, setExpandedSeasons] = useState({}); // ✅ TV ONLY

  const [loading, setLoading] = useState(true);

  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [rootFolders, setRootFolders] = useState([]);
  const [selectedRootFolder, setSelectedRootFolder] = useState(null);

  const [monitored, setMonitored] = useState(true);

  useEffect(() => {
    fetchDetails();
    fetchProfiles();
    fetchRootFolders();
  }, []);

  const fetchProfiles = async () => {
    try {
      const resp = await axios.get(
        `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/qualityprofile`,
        { headers: { "X-Api-Key": settings.radarrApiKey } }
      );

      setProfiles(resp.data);

      if (resp.data.length > 0) {
        setSelectedProfile(resp.data[0]);
      }

    } catch (err) {
      console.error("Profiles Fetch Error:", err);
    }
  };

  const fetchRootFolders = async () => {
    try {
      const resp = await axios.get(
        `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/rootfolder`,
        { headers: { "X-Api-Key": settings.radarrApiKey } }
      );

      setRootFolders(resp.data);

      if (resp.data.length > 0) {
        setSelectedRootFolder(resp.data[0]);
      }

    } catch (err) {
      console.error("Root Folder Error:", err);
    }
  };

  const fetchDetails = async () => {

    setLoading(true);

    try {

      // ✅ MOVIE LOGIC (UNTOUCHED 👌🔥)
      if (type === "movie") {

        if (item.added) {

          const movieResp = await axios.get(
            `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/movie`,
            { headers: { "X-Api-Key": settings.radarrApiKey } }
          );

          const realMovie = movieResp.data.find(
            (m) => m.tmdbId === item.tmdbId
          );

          if (!realMovie) {
            throw new Error("Movie not found in Radarr");
          }

          const detailsResp = await axios.get(
            `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/movie/${realMovie.id}`,
            { headers: { "X-Api-Key": settings.radarrApiKey } }
          );

          setDetails(detailsResp.data);

        } else {

          const resp = await axios.get(
            `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/movie/lookup`,
            {
              params: { term: item.title },
              headers: { "X-Api-Key": settings.radarrApiKey },
            }
          );

          const matchedMovie = resp.data.find(
            (m) => m.tmdbId === item.tmdbId
          );

          setDetails(matchedMovie || resp.data[0]);
        }
      }

      // ✅ TV LOGIC (ADDITIVE FIXED 😏🔥)
      else {

        if (item.added) {

          const seriesResp = await axios.get(
            `${settings.sonarrUrl.replace(/\/$/, "")}/api/v3/series`,
            { headers: { "X-Api-Key": settings.sonarrApiKey } }
          );

          const realSeries = seriesResp.data.find(
            (s) => s.tvdbId === item.tvdbId
          );

          if (!realSeries) {
            throw new Error("Series not found in Sonarr");
          }

          const detailsResp = await axios.get(
            `${settings.sonarrUrl.replace(/\/$/, "")}/api/v3/series/${realSeries.id}`,
            { headers: { "X-Api-Key": settings.sonarrApiKey } }
          );

          const episodesResp = await axios.get(
            `${settings.sonarrUrl.replace(/\/$/, "")}/api/v3/episode`,
            {
              params: { seriesId: realSeries.id },
              headers: { "X-Api-Key": settings.sonarrApiKey },
            }
          );

          setDetails(detailsResp.data);
          setEpisodes(episodesResp.data);

        } else {

          const resp = await axios.get(
            `${settings.sonarrUrl.replace(/\/$/, "")}/api/v3/series/lookup`,
            {
              params: { term: item.title },
              headers: { "X-Api-Key": settings.sonarrApiKey },
            }
          );

          const matchedSeries = resp.data.find(
            (s) => s.tvdbId === item.tvdbId
          );

          setDetails(matchedSeries || resp.data[0]);
        }
      }

    } catch (err) {
      console.error("Details Fetch Error:", err);
      Alert.alert("Error", "Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  // ✅ TV INTERACTION LOGIC
  const toggleSeason = (seasonNumber) => {
    setExpandedSeasons(prev => ({
      ...prev,
      [seasonNumber]: !prev[seasonNumber],
    }));
  };

  const downloadSeason = async (seasonNumber) => {
    try {
      await axios.post(
        `${settings.sonarrUrl.replace(/\/$/, "")}/api/v3/command`,
        {
          name: "SeasonSearch",
          seriesId: details.id,
          seasonNumber,
        },
        { headers: { "X-Api-Key": settings.sonarrApiKey } }
      );

      Alert.alert("Success", `Season ${seasonNumber} search started`);

    } catch {
      Alert.alert("Error", "Season search failed");
    }
  };

  const downloadEpisode = async (episodeId) => {
    try {
      await axios.post(
        `${settings.sonarrUrl.replace(/\/$/, "")}/api/v3/command`,
        {
          name: "EpisodeSearch",
          episodeIds: [episodeId],
        },
        { headers: { "X-Api-Key": settings.sonarrApiKey } }
      );

      Alert.alert("Success", "Episode search started");

    } catch {
      Alert.alert("Error", "Episode search failed");
    }
  };

  // ✅ MOVIE ACTIONS (UNTOUCHED 👌🔥)
  const searchMovie = async () => {

    if (!details?.id) return;

    try {
      await axios.post(
        `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/command`,
        { name: "MoviesSearch", movieIds: [details.id] },
        { headers: { "X-Api-Key": settings.radarrApiKey } }
      );

      Alert.alert("Success", "Search started");

    } catch {
      Alert.alert("Error", "Search failed");
    }
  };

  const addMovie = async () => {

    if (!selectedProfile || !selectedRootFolder) {
      Alert.alert("Error", "Select profile & root folder");
      return;
    }

    try {
      await axios.post(
        `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/movie`,
        {
          title: details.title,
          year: details.year,
          qualityProfileId: selectedProfile.id,
          tmdbId: details.tmdbId,
          rootFolderPath: selectedRootFolder.path,
          monitored: monitored,
          addOptions: { searchForMovie: true },
        },
        { headers: { "X-Api-Key": settings.radarrApiKey } }
      );

      Alert.alert("Success", "Movie Added");

    } catch (err) {
      console.log("RADARR ERROR:", err.response?.data);
      Alert.alert("Error", "Failed to add movie");
    }
  };

  if (loading || !details) {
    return (
      <AppScreenWrapper navigation={navigation} title="Details">
        <ActivityIndicator size="large" color="#e50914" />
      </AppScreenWrapper>
    );
  }

  return (
    <AppScreenWrapper navigation={navigation} title="Details">
      <ScrollView>

        <View style={styles.detailsContainer}>

          <Image
            source={{
              uri: details.images?.[0]?.remoteUrl || item.remotePoster,
            }}
            style={styles.poster}
          />

          <Text style={styles.title}>{details.title}</Text>
          <Text style={styles.shortDetail}>{details.overview}</Text>

          {type === "movie" && details.movieFile && (
  <View style={styles.fileInfoBox}>

    <Text style={styles.fileInfoTitle}>Downloaded File</Text>

    <Text style={styles.fileInfoText}>
      Name: {details.movieFile.relativePath}
    </Text>

    <Text style={styles.fileInfoText}>
      Size: {(details.movieFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB
    </Text>

    <Text style={styles.fileInfoText}>
      Quality: {details.movieFile.quality?.quality?.name}
    </Text>

    <Text style={styles.fileInfoText}>
      Video: {details.movieFile.mediaInfo?.videoCodec}
    </Text>

    <Text style={styles.fileInfoText}>
      Language: {details.movieFile.mediaInfo?.audioLanguages || "Unknown"}
    </Text>

  </View>
)}

          {/* ✅ MOVIE SELECTORS (UNTOUCHED 👌🔥) */}
          {type === "movie" && !item.added && (
            <>
              <View style={styles.selectorContainer}>
                <Text style={styles.selectorTitle}>Quality Profile</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {profiles.map(profile => {
                    const active = selectedProfile?.id === profile.id;
                    return (
                      <TouchableOpacity
                        key={profile.id}
                        style={[styles.profileChip, active && styles.activeChip]}
                        onPress={() => setSelectedProfile(profile)}
                      >
                        <Text style={styles.profileText}>{profile.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.selectorContainer}>
                <Text style={styles.selectorTitle}>Root Folder</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {rootFolders.map(folder => {
                    const active = selectedRootFolder?.id === folder.id;
                    return (
                      <TouchableOpacity
                        key={folder.id}
                        style={[styles.profileChip, active && styles.activeChip]}
                        onPress={() => setSelectedRootFolder(folder)}
                      >
                        <Text style={styles.profileText}>
                          {folder.path.split("/").pop()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.monitorRow}>
                <Text style={styles.monitorText}>Monitored</Text>
                <TouchableOpacity onPress={() => setMonitored(prev => !prev)}>
                  <Icon
                    name={monitored ? "toggle" : "toggle-outline"}
                    size={40}
                    color={monitored ? "#e50914" : "#666"}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ✅ TV SEASONS UI 😏🔥 */}
          {type !== "movie" && details.seasons?.map(season => {

            const seasonEpisodes = episodes.filter(
              ep => ep.seasonNumber === season.seasonNumber
            );

            const expanded = expandedSeasons[season.seasonNumber];

            return (
              <View key={season.seasonNumber} style={styles.seasonBox}>

                <View style={styles.seasonHeader}>

                  <TouchableOpacity onPress={() => toggleSeason(season.seasonNumber)}>
                    <Text style={styles.seasonTitle}>
                      {expanded ? "▼" : "▶"} Season {season.seasonNumber}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => downloadSeason(season.seasonNumber)}>
                    <Icon name="download-outline" size={22} color="#e50914" />
                  </TouchableOpacity>

                </View>

                {expanded && seasonEpisodes.map(ep => (
                  <View key={ep.id} style={styles.episodeRow}>

                    <Text style={styles.fileText}>
                      {ep.episodeNumber}. {ep.title}
                    </Text>

                    <TouchableOpacity onPress={() => downloadEpisode(ep.id)}>
                      <Icon name="cloud-download-outline" size={20} color="#fff" />
                    </TouchableOpacity>

                  </View>
                ))}

              </View>
            );
          })}

          {item.added ? (
            <TouchableOpacity style={styles.button} onPress={searchMovie}>
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={addMovie}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          )}

        </View>

      </ScrollView>
    </AppScreenWrapper>
  );
}

const styles = StyleSheet.create({
  detailsContainer: { marginTop: 10, alignItems: "center" },
  poster: { width: 200, height: 300, borderRadius: 10, marginBottom: 10 },
  title: { fontSize: 22, color: "#fff", textAlign: "center" },
  shortDetail: { fontSize: 14, color: "#fff", textAlign: "center" },

  selectorContainer: {
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 10,
  },

  selectorTitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },

  profileChip: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: "#2a2a2a",
    borderRadius: 20,
    marginRight: 10,
  },

  activeChip: {
    backgroundColor: "#e50914",
  },

  profileText: {
    color: "#fff",
    fontWeight: "600",
  },

  monitorRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
  },

  monitorText: {
    color: "#fff",
    fontSize: 16,
  },

  seasonBox: {
    marginTop: 15,
    width: "95%",
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 10,
  },

  seasonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  seasonTitle: {
    color: "#fff",
    fontSize: 15,
  },

  episodeRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  fileText: {
    color: "#ccc",
    fontSize: 13,
  },

  button: {
    marginTop: 20,
    backgroundColor: "#e50914",
    padding: 10,
    borderRadius: 8,
  },

  buttonText: { color: "#fff" },

  fileInfoBox: {
  marginTop: 15,
  width: "95%",
  backgroundColor: "#111",
  padding: 12,
  borderRadius: 10,
},

fileInfoTitle: {
  color: "#e50914",
  fontSize: 16,
  fontWeight: "600",
  marginBottom: 6,
},

fileInfoText: {
  color: "#ccc",
  fontSize: 13,
  marginTop: 2,
},
});