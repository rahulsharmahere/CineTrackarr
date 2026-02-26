import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import { trackEvent } from "../services/matomo";

import AppScreenWrapper from "../components/AppScreenWrapper";
import { useSettings } from "../context/SettingsContext";

export default function DetailsScreen({ route, navigation }) {

  const { item, type } = route.params;
  const { settings } = useSettings();

  const [details, setDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [expandedSeasons, setExpandedSeasons] = useState({});

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

  const showToast = (type, message) => {
    Toast.show({
      type,
      text1: message,
      position: "bottom",
      visibilityTime: 1800,
    });
  };

  /* ---------------- FETCH PROFILES ---------------- */

  const fetchProfiles = async () => {
    try {

      const url =
        type === "movie"
          ? `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/qualityprofile`
          : `${settings.sonarrUrl.replace(/\/$/, "")}/api/v3/qualityprofile`;

      const apiKey =
        type === "movie"
          ? settings.radarrApiKey
          : settings.sonarrApiKey;

      const resp = await axios.get(url, {
        headers: { "X-Api-Key": apiKey },
      });

      setProfiles(resp.data);

      if (resp.data.length > 0) {
        setSelectedProfile(resp.data[0]);
      }

    } catch (err) {
      console.log("Profiles Fetch Error:", err.response?.data || err.message);
    }
  };

  /* ---------------- FETCH ROOT FOLDERS ---------------- */

  const fetchRootFolders = async () => {
    try {

      const url =
        type === "movie"
          ? `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/rootfolder`
          : `${settings.sonarrUrl.replace(/\/$/, "")}/api/v3/rootfolder`;

      const apiKey =
        type === "movie"
          ? settings.radarrApiKey
          : settings.sonarrApiKey;

      const resp = await axios.get(url, {
        headers: { "X-Api-Key": apiKey },
      });

      setRootFolders(resp.data);

      if (resp.data.length > 0) {
        setSelectedRootFolder(resp.data[0]);
      }

    } catch (err) {
      console.log("Root Folder Error:", err.response?.data || err.message);
    }
  };

  /* ---------------- FETCH DETAILS ---------------- */

  const fetchDetails = async () => {

    setLoading(true);

    try {

      if (type === "movie") {

        if (item.added) {

          const movieResp = await axios.get(
            `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/movie`,
            { headers: { "X-Api-Key": settings.radarrApiKey } }
          );

          const realMovie = movieResp.data.find(
            (m) => m.tmdbId === item.tmdbId
          );

          if (!realMovie) throw new Error("Movie not found");

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

      else {

        if (item.added) {

          const seriesResp = await axios.get(
            `${settings.sonarrUrl.replace(/\/$/, "")}/api/v3/series`,
            { headers: { "X-Api-Key": settings.sonarrApiKey } }
          );

          const realSeries = seriesResp.data.find(
            (s) => s.tvdbId === item.tvdbId
          );

          if (!realSeries) throw new Error("Series not found");

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

          setDetails(resp.data[0]);
        }
      }

    } catch (err) {
      console.log("Details Fetch Error:", err.response?.data || err.message);
      showToast("error", "Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ACTIONS ---------------- */

  const searchMovie = async () => {
    try {
      await axios.post(
        `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/command`,
        { name: "MoviesSearch", movieIds: [details.id] },
        { headers: { "X-Api-Key": settings.radarrApiKey } }
      );

      showToast("success", "Search started");
      trackEvent("Movie", "Search", details.title);

    } catch (err) {
      console.log("Search Error:", err.response?.data);
      showToast("error", "Search failed");
    }
  };

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

      showToast("success", `Season ${seasonNumber} search started`);
      trackEvent("Series", "SeasonSearch", `${details.title} S${seasonNumber}`);

    } catch (err) {
      console.log("Season Search Error:", err.response?.data);
      showToast("error", "Season search failed");
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

      showToast("success", "Episode search started");
      trackEvent("Series", "EpisodeSearch", ep?.title || "Episode");

    } catch (err) {
      console.log("Episode Search Error:", err.response?.data);
      showToast("error", "Episode search failed");
    }
  };


const deleteMovie = async () => {
  try {

    await axios.delete(
      `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/movie/${details.id}`,
      {
        headers: { "X-Api-Key": settings.radarrApiKey },
        data: { deleteFiles: false }, // safer default
      }
    );

    showToast("success", "Movie Deleted");
    navigation.goBack();

  } catch (err) {
    console.log("Delete Movie Error:", err.response?.data);
    showToast("error", "Failed to delete movie");
    trackEvent("Movie", "Delete", details.title);
  }
};

const deleteSeries = async () => {
  try {

    await axios.delete(
      `${settings.sonarrUrl.replace(/\/$/, "")}/api/v3/series/${details.id}`,
      {
        headers: { "X-Api-Key": settings.sonarrApiKey },
        data: { deleteFiles: false },
      }
    );

    showToast("success", "Series Deleted");
    trackEvent("Series", "Delete", details.title);
    navigation.goBack();

  } catch (err) {
    console.log("Delete Series Error:", err.response?.data);
    showToast("error", "Failed to delete series");
  }
};

  const addMovie = async () => {
    try {

      await axios.post(
        `${settings.radarrUrl.replace(/\/$/, "")}/api/v3/movie`,
        {
          title: details.title,
          year: details.year,
          qualityProfileId: selectedProfile.id,
          tmdbId: details.tmdbId,
          rootFolderPath: selectedRootFolder.path,
          monitored,
          addOptions: { searchForMovie: true },
        },
        { headers: { "X-Api-Key": settings.radarrApiKey } }
      );

      showToast("success", "Movie Added");
      trackEvent("Movie", "Add", details.title);

    } catch (err) {
      console.log("RADARR ERROR:", err.response?.data);
      showToast("error", "Failed to add movie");
    }
  };

  const addSeries = async () => {
    try {

      await axios.post(
        `${settings.sonarrUrl.replace(/\/$/, "")}/api/v3/series`,
        {
          title: details.title,
          tvdbId: details.tvdbId,
          qualityProfileId: selectedProfile.id,
          rootFolderPath: selectedRootFolder.path,
          monitored,
          addOptions: { searchForMissingEpisodes: true },
          seasons: details.seasons,
        },
        { headers: { "X-Api-Key": settings.sonarrApiKey } }
      );

      showToast("success", "Series Added");
      trackEvent("Series", "Add", details.title);

    } catch (err) {
      console.log("SONARR ERROR:", err.response?.data);
      showToast("error", "Failed to add series");
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

          <Image source={{ uri: details.images?.[0]?.remoteUrl || item.remotePoster }} style={styles.poster} />

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

          {/* ✅ MOVIE SELECTORS RESTORED 🔥 */}
          {type === "movie" && !item.added && (
            <>
              <View style={styles.selectorContainer}>
                <Text style={styles.selectorTitle}>Quality Profile</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {profiles.map(profile => (
                    <TouchableOpacity
                      key={profile.id}
                      style={[
                        styles.profileChip,
                        selectedProfile?.id === profile.id && styles.activeChip,
                      ]}
                      onPress={() => setSelectedProfile(profile)}
                    >
                      <Text style={styles.profileText}>{profile.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.selectorContainer}>
                <Text style={styles.selectorTitle}>Root Folder</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {rootFolders.map(folder => (
                    <TouchableOpacity
                      key={folder.id}
                      style={[
                        styles.profileChip,
                        selectedRootFolder?.id === folder.id && styles.activeChip,
                      ]}
                      onPress={() => setSelectedRootFolder(folder)}
                    >
                      <Text style={styles.profileText}>
                        {folder.path.split("/").pop()}
                      </Text>
                    </TouchableOpacity>
                  ))}
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

          {/* ✅ TV SEASONS UI 🔥 */}
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

          <View style={{ flex: 1 }}>

            <Text style={styles.fileText}>
              {ep.episodeNumber}. {ep.title || "Episode"}
            </Text>

            {ep.hasFile && (
              <Text style={styles.downloadedText}>
                Downloaded • {ep.episodeFile?.quality?.quality?.name}
              </Text>
            )}

          </View>

          <TouchableOpacity onPress={() => downloadEpisode(ep.id)}>
            <Icon name="cloud-download-outline" size={20} color="#fff" />
          </TouchableOpacity>

        </View>
      ))}

    </View>
  );
})}

          {item.added ? (

  <>
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={type === "movie" ? deleteMovie : deleteSeries}
    >
      <Text style={styles.buttonText}>Delete</Text>
    </TouchableOpacity>

    {type === "movie" && !details.movieFile && (
      <TouchableOpacity style={styles.button} onPress={searchMovie}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>
    )}
  </>

) : (

  <TouchableOpacity
    style={styles.button}
    onPress={type === "movie" ? addMovie : addSeries}
  >
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
downloadedText: {
  color: "#46d369",
  fontSize: 11,
  marginTop: 2,
},

deleteButton: {
  marginTop: 20,
  backgroundColor: "#333",
  padding: 10,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#e50914",
},

});