import React from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  Linking,
} from "react-native";

import axios from "axios";
import Toast from "react-native-toast-message";

import { useSettings } from "../context/SettingsContext";
import { useUpdate } from "../context/UpdateContext";   // ✅ NEW

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SettingsScreen() {

  const { settings, updateSettings } = useSettings();
  const { manualCheckForUpdate, isChecking } = useUpdate();   // ✅ NEW

  const toggleRadarr = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateSettings({ useRadarr: !settings.useRadarr });
  };

  const toggleSonarr = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateSettings({ useSonarr: !settings.useSonarr });
  };

  const toggleTrending = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateSettings({ useTrending: !settings.useTrending });
  };

  const testConnection = async (url, apiKey, serviceName) => {
    if (!url || !apiKey) {
      Toast.show({ type: "error", text1: `${serviceName} URL/API Key missing` });
      return;
    }

    try {
      const fullUrl = `${url.replace(/\/$/, "")}/api/v3/system/status`;

      const res = await axios.get(fullUrl, {
        headers: { "X-Api-Key": apiKey },
      });

      if (!res.data?.appName || res.data.appName.toLowerCase() !== serviceName.toLowerCase()) {
        Toast.show({ type: "error", text1: `Invalid ${serviceName} instance` });
        return;
      }

      Toast.show({ type: "success", text1: `${serviceName} connection successful` });

    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: `Failed to connect to ${serviceName}` });
    }
  };

  const handleSave = () => {

    if ((settings.useRadarr && (!settings.radarrUrl || !settings.radarrApiKey)) ||
        (settings.useSonarr && (!settings.sonarrUrl || !settings.sonarrApiKey))) {
      Toast.show({ type: "error", text1: "Fill all enabled service fields" });
      return;
    }

    if (settings.useTrending && !settings.tmdbApiKey) {
      Toast.show({ type: "error", text1: "TMDB API Key required" });
      return;
    }

    Toast.show({ type: "success", text1: "Settings Updated" });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#000" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>Settings</Text>

        {/* RADARR */}
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Enable Radarr</Text>
          <Switch value={settings.useRadarr} onValueChange={toggleRadarr} />
        </View>

        {settings.useRadarr && (
          <View style={styles.section}>
            <Text style={styles.label}>Radarr URL</Text>
            <TextInput
              style={styles.input}
              value={settings.radarrUrl}
              onChangeText={(text) => updateSettings({ radarrUrl: text })}
            />

            <Text style={styles.label}>Radarr API Key</Text>
            <TextInput
              style={styles.input}
              value={settings.radarrApiKey}
              onChangeText={(text) => updateSettings({ radarrApiKey: text })}
            />

            <TouchableOpacity
              style={styles.testButton}
              onPress={() =>
                testConnection(settings.radarrUrl, settings.radarrApiKey, "radarr")
              }
            >
              <Text style={styles.testButtonText}>Test Radarr Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SONARR */}
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Enable Sonarr</Text>
          <Switch value={settings.useSonarr} onValueChange={toggleSonarr} />
        </View>

        {settings.useSonarr && (
          <View style={styles.section}>
            <Text style={styles.label}>Sonarr URL</Text>
            <TextInput
              style={styles.input}
              value={settings.sonarrUrl}
              onChangeText={(text) => updateSettings({ sonarrUrl: text })}
            />

            <Text style={styles.label}>Sonarr API Key</Text>
            <TextInput
              style={styles.input}
              value={settings.sonarrApiKey}
              onChangeText={(text) => updateSettings({ sonarrApiKey: text })}
            />

            <TouchableOpacity
              style={styles.testButton}
              onPress={() =>
                testConnection(settings.sonarrUrl, settings.sonarrApiKey, "sonarr")
              }
            >
              <Text style={styles.testButtonText}>Test Sonarr Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TRENDING */}
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Enable Trending Content</Text>
          <Switch value={settings.useTrending} onValueChange={toggleTrending} />
        </View>

        {settings.useTrending && (
          <View style={styles.section}>
            <Text style={styles.label}>TMDB API Key</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter TMDB API Key"
              placeholderTextColor="#666"
              value={settings.tmdbApiKey}
              onChangeText={(text) => updateSettings({ tmdbApiKey: text })}
            />
          </View>
        )}

        {/* ✅ UPDATE BUTTON */}
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={manualCheckForUpdate}
        >
          <Text style={styles.buttonText}>
            {isChecking ? "Checking..." : "Check for Updates"}
          </Text>
        </TouchableOpacity>

        {/* SAVE */}
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Settings</Text>
        </TouchableOpacity>

        {/* ✅ ABOUT SECTION */}
        <View style={styles.aboutBox}>

          <Text style={styles.aboutTitle}>About</Text>

          <Text style={styles.aboutText}>
            This project is a work of Rahul Sharma
          </Text>

          <TouchableOpacity onPress={() => Linking.openURL("https://rahulsharmahere.com")}>
            <Text style={styles.linkText}>rahulsharmahere.com</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openURL("https://github.com/rahulsharmahere")}>
            <Text style={styles.linkText}>GitHub</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>

      <Toast position="bottom" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#000",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#e50914",
    textAlign: "center",
    marginBottom: 30,
  },

  label: {
    color: "#fff",
    marginBottom: 5,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },

  section: {
    marginTop: 10,
  },

  button: {
    backgroundColor: "#e50914",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },

  updateButton: {
    backgroundColor: "#333",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  testButton: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },

  testButtonText: {
    color: "#fff",
    fontSize: 14,
  },

  aboutBox: {
    marginTop: 40,
    padding: 15,
    backgroundColor: "#111",
    borderRadius: 10,
  },

  aboutTitle: {
    color: "#e50914",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  aboutText: {
    color: "#ccc",
    fontSize: 13,
    marginBottom: 6,
  },

  linkText: {
    color: "#4DA6FF",
    fontSize: 13,
    marginTop: 4,
  },
});